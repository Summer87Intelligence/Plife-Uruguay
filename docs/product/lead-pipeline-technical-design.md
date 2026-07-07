# FASE 14A — Diseño Funcional y Técnico: Leads + Pipeline

**Fecha:** 2026-07-06  
**Base conceptual:** `docs/product/lead-pipeline-concept-redesign.md` (FASE 13L)  
**Estado:** Diseño. Sin implementación. Sin SQL, sin migraciones, sin UI.

---

## 1. Modelo actual

### 1.1 Entidades y tablas detectadas

Tipos definidos en `src/types/database.ts`. Tablas Supabase referenciadas vía `.from('...')`.

| Entidad | Tabla | Tipos (líneas) | Actions | Form |
|---|---|---|---|---|
| Empresa | `companies` | database.ts 86–113 | `src/domains/companies/actions.ts` | `src/app/app/empresas/company-form.tsx` |
| Contacto | `contacts` | database.ts 54–79 | `src/domains/contacts/actions.ts` | `src/app/app/contactos/contact-form.tsx` |
| Oportunidad | `opportunities` | database.ts 115–142 | `src/domains/opportunities/actions.ts` | `src/app/app/oportunidades/opportunity-form.tsx` |
| Actividad | `activities` | database.ts 150–166 | `addActivity()` en contacts/actions.ts | `src/components/commercial/activity-form.tsx` |
| Campaña | `campaigns` | database.ts 180–204 | `src/domains/campaigns/actions.ts` | `src/app/app/campanas/campaign-form.tsx` |

### 1.2 Relaciones actuales (FKs)

```
contacts.company_id        → companies.id
opportunities.contact_id   → contacts.id
opportunities.company_id   → companies.id
opportunities.campaign_id  → campaigns.id
companies.campaign_id      → campaigns.id
activities.contact_id      → contacts.id
activities.company_id      → companies.id
activities.opportunity_id  → opportunities.id
{contacts,companies,opportunities}.assigned_to → profiles.id
```

Consultas con embedded selects de Supabase (`.select('..., company:companies(name, id)')`).

### 1.3 Pipeline actual (sobre oportunidades)

`OpportunityStage` (database.ts línea 7), agrupado en `src/lib/constants.ts` línea 161:

```
PIPELINE_STAGES: nueva → calificada → contactada → reunion_agendada
                 → diagnostico_realizado → propuesta_conceptual
                 → validacion_plife → seguimiento
CLOSED_STAGES:   cerrada_ganada | cerrada_perdida | dormida
```

Labels y colores en `constants.ts` líneas 29–55.

### 1.4 Campos útiles y patrones reutilizables

| Patrón existente | Dónde | Reutilización para leads |
|---|---|---|
| `next_action` + `next_action_date` | contacts y opportunities | Mismo paradigma en `leads` — alimenta PLIFE Hoy sin lógica nueva |
| Agrupación de seguimiento (vencidas / hoy / sin próximo paso / estancadas) | `src/components/follow-up/follow-up-center.tsx` | Generalizable a cualquier entidad con `next_action_date` + `last_activity_at` |
| Detección de duplicados | `src/domains/duplicates/*` (normalización, similitud 85%, severidad strong/soft) | Aplicable a leads por teléfono/email/nombre |
| Soft-delete (`deleted_at`) | Todas las entidades | Adoptar igual en `leads` |
| Auditoría (`created_by`, `updated_by`, RPC `log_audit_event()`) | Todas las entidades | Adoptar igual |
| Asignación (`assigned_to` → profiles) | contacts, companies, opportunities | `leads.assigned_to` con mismo patrón |
| Guías in-app (`section-guide-card.tsx`) | Todas las secciones | Guía operativa en pantalla Leads |
| Validación Zod inline en actions | Todos los dominios | Mismo estilo para `src/domains/leads/actions.ts` |
| Vínculo campaña (`campaign_id` en companies y opportunities) | campaigns | Extender con `leads.campaign_id` |
| Radar B2B sobre `companies.b2b_status` + `b2b_score` | `src/app/app/radar-b2b/*` | Origen de leads tipo empresa |

### 1.5 Qué hay que migrar o adaptar

- **`opportunities.stage`** hoy cumple doble rol: prospección temprana (`nueva`, `contactada`, `calificada`) y cierre (`propuesta_conceptual`, `validacion_plife`). Con leads, las etapas tempranas migran al pipeline de leads y el stage de oportunidad se concentra en el ciclo de cierre. Requiere decisión en 14B: reducir enum de oportunidad o mantenerlo y documentar la convención.
- **`contacts.next_action`** convive con el mismo campo en oportunidades y (futuro) leads. PLIFE Hoy deberá priorizar la fuente según contexto para no duplicar alertas.
- **Radar B2B** hoy escribe directamente en `companies` (status `detectada`→`contactada`...). Con leads, el flujo pasa a crear un lead que referencia la empresa detectada.
- **Métricas de campañas** (`campaign-operational.ts`) cuentan companies y opportunities vinculadas; deberán incorporar conteo de leads.

### 1.6 Riesgos del modelo actual frente al cambio

| Riesgo | Detalle |
|---|---|
| Doble pipeline percibido | Si leads y oportunidades muestran etapas en paralelo sin jerarquía clara, el asesor no sabe dónde mirar |
| Solapamiento `contacts.status` / lead status | Contacto ya tiene `status` e `interest_level`; el lead agrega otra capa — definir precedencia |
| Radar con dos caminos | Mientras conviven flujo viejo (empresa directa) y nuevo (lead), riesgo de datos inconsistentes |
| Follow-up center dual | Deberá agrupar leads y oportunidades sin duplicar la misma gestión en dos tarjetas |
| Enum de oportunidad heredado | Etapas tempranas quedarán muertas si no se limpia — deuda de datos |

---

## 2. Entidad Lead propuesta

### 2.1 Campos

| Campo | Tipo | Obligatorio en creación mínima | Notas |
|---|---|---|---|
| `id` | uuid | auto | PK |
| `created_at` | timestamptz | auto | |
| `updated_at` | timestamptz | auto | |
| `assigned_to` | uuid FK profiles | **Sí** (default: usuario creador) | Consistente con resto del sistema (se usa `assigned_to`, no `owner_id`) |
| `title` | text | **Sí** | Descripción corta del lead ("Consulta seguro vida — María", "Estudio contable Pérez") |
| `display_name` | text | No | Nombre visible de la persona/empresa si se conoce |
| `lead_type` | enum `person / company / unknown` | **Sí** (default `unknown`) | Se ajusta durante calificación |
| `source` | enum `manual / referral / whatsapp / instagram / web / call / campaign / radar_b2b / other` | **Sí** (default `manual`) | |
| `interest_area` | text | No | Producto o necesidad de interés |
| `status` | enum `active / paused / converted / discarded` | auto (`active`) | Estado de vida del lead |
| `pipeline_stage` | enum (ver §3) | auto (`nuevo`) | Etapa comercial |
| `priority` | enum `alta / media / baja` | No (default `media`) | |
| `temperature` | enum `cold / warm / hot` | No (default `cold`) | Percepción del asesor; alimenta "leads calientes" |
| `phone` | text | No* | |
| `email` | text | No* | |
| `company_name_raw` | text | No | Nombre de empresa como texto libre, antes de crear entidad |
| `person_name_raw` | text | No | Nombre de persona como texto libre |
| `company_id` | uuid FK companies | No | Se vincula al calificar |
| `contact_id` | uuid FK contacts | No | Se vincula al calificar |
| `campaign_id` | uuid FK campaigns | No | Si origen = campaign |
| `radar_source_id` | uuid FK companies | No | Empresa detectada por radar que originó el lead |
| `next_action` | text | Recomendado | Mismo paradigma que contacts/opportunities |
| `next_action_date` | date | Recomendado | Alimenta PLIFE Hoy |
| `notes` | text | No | |
| `converted_at` | timestamptz | No | Se setea al convertir |
| `discarded_at` | timestamptz | No | Se setea al descartar |
| `discard_reason` | text | No | Obligatorio si status = discarded |
| `last_activity_at` | timestamptz | auto | Para detección de estancados |
| `created_by` / `updated_by` / `deleted_at` | — | auto | Patrón de auditoría y soft-delete existente |

\* Regla blanda: al menos **un** dato de contacto (`phone` o `email`) o una referencia (`company_name_raw` / `person_name_raw`) debería existir; se valida con advertencia, no con bloqueo, para no frenar captura rápida.

### 2.2 Creación mínima

Un lead se puede crear con solo:

```
title + lead_type (default unknown) + source (default manual) + assigned_to (default yo)
```

Todo lo demás es progresivo. La fricción de entrada debe ser cercana a cero: "anotar un interesado" debe tomar menos de 30 segundos.

### 2.3 Nota sobre `radar_source_id`

En el modelo actual el radar opera sobre `companies` (no existe tabla separada de señales). Por lo tanto `radar_source_id` referencia a `companies.id` de la empresa detectada. Si en el futuro el radar tuviera tabla propia de señales, el FK se redefine en esa fase.

---

## 3. Pipeline de Leads

Enum `lead_pipeline_stage`:

```
nuevo → contactado → calificando → interesado → propuesta_reunion → seguimiento
                                                                   → convertido
                                                                   → descartado
```

| Etapa | Significado | Cuándo entra | Cuándo sale | Acción que espera el sistema | Alerta en PLIFE Hoy |
|---|---|---|---|---|---|
| `nuevo` | Lead ingresado sin gestión | Al crear | Al registrar primer contacto | Definir `next_action` y contactar | **Leads nuevos sin gestión** (sin next_action ni actividad) |
| `contactado` | Hubo primer contacto real | Primer llamada/WhatsApp/email registrado | Al iniciar preguntas de calificación | Registrar resultado y agendar seguimiento | Lead contactado sin `next_action_date` |
| `calificando` | Se evalúa interés y encaje | Cuando el asesor inicia calificación | Interés confirmado (→ interesado) o sin encaje (→ descartado) | Completar `lead_type`, `interest_area`, vincular empresa/persona | Calificación estancada (sin actividad 7+ días) |
| `interesado` | Interés confirmado, sin propuesta aún | Al confirmar interés real | Al agendar reunión o presentar propuesta | **Habilita conversión a Oportunidad** | **Lead caliente** si `temperature = hot` o `next_action_date` próxima |
| `propuesta_reunion` | Propuesta presentada o reunión agendada | Al agendar/presentar | Decisión del lead | Seguir resultado, manejar objeciones | Reunión de hoy; propuesta sin respuesta 5+ días |
| `seguimiento` | Sin decisión, sigue activo | Cuando el lead posterga | Al retomar (→ etapa anterior) o resolver | Retomar en `next_action_date` | **Lead vencido** si fecha pasada |
| `convertido` | Generó cliente/negocio | Acción explícita de conversión | Terminal (reactivable creando lead nuevo) | Verificar entidades creadas | Conteo en "convertidos de la semana" |
| `descartado` | Sin potencial en este ciclo | Acción explícita con `discard_reason` | Terminal (reactivable) | Ninguna | Ninguna (visible solo en filtros) |

Reglas transversales:

- Movimiento hacia atrás permitido (excepto desde `convertido`/`descartado`, que requieren acción de reactivación explícita).
- Todo cambio de etapa se registra en historial (`lead_pipeline_history`, fase 14B) con usuario y timestamp.
- `convertido` y `descartado` setean `converted_at` / `discarded_at` + `status` correspondiente.

---

## 4. Conversión de Lead

### 4.1 Destinos de conversión

Un lead puede convertirse en (una o varias, según el caso):

- **Empresa** (`companies`) — crear nueva o vincular existente (reutilizando duplicate-check)
- **Contacto/Persona** (`contacts`) — crear nuevo o vincular existente
- **Oportunidad** (`opportunities`) — **solo si `pipeline_stage` ∈ {interesado, propuesta_reunion, seguimiento}** (lead calificado)

La regla de oportunidad es la decisión de FASE 13L (Opción A: entidad separada): la oportunidad concentra monto, probabilidad y ciclo de cierre; el lead concentra captura y calificación.

### 4.2 Flujos de conversión

**Flujo 1 — Lead persona individual:**
```
Lead (lead_type=person) → califica → crear/vincular Contacto (contact_id)
                                   → si interesado: crear Oportunidad (contact_id, sin company)
```

**Flujo 2 — Lead empresa:**
```
Lead (lead_type=company) → califica → crear/vincular Empresa (company_id)
                                    → identificar interlocutor → crear Contacto (company_id)
                                    → si interesado: crear Oportunidad (company_id + contact_id)
```

**Flujo 3 — Lead desde campaña:**
```
Campaña activa → crear Lead (source=campaign, campaign_id=X)
              → pipeline normal
              → si califica: Oportunidad hereda campaign_id del lead
```

**Flujo 4 — Lead desde radar:**
```
Radar detecta empresa (companies.b2b_status=detectada)
   → acción "Crear Lead" → Lead (source=radar_b2b, lead_type=company,
                                 radar_source_id=company.id, company_id=company.id)
   → calificación (¿hay contacto? ¿hay conversación real?)
   → si hay conversación real: crear Contacto + Oportunidad
```

Nota: en el flujo 4 la empresa ya existe (el radar la creó); el lead **no duplica** la empresa, la referencia.

### 4.3 Qué pasa con el lead después de convertir

- El lead **se mantiene** con `status = converted`, `pipeline_stage = convertido`, `converted_at` seteado. No se borra.
- Los vínculos quedan registrados: `company_id`, `contact_id` y `opportunity_id`* apuntan a las entidades creadas/vinculadas.
- El historial (`lead_pipeline_history` + actividades del lead) se conserva como trazabilidad del origen del negocio.
- La entidad destino (oportunidad) puede llevar FK inversa `lead_id` para responder "¿de dónde salió este negocio?" — decisión de schema en 14B (recomendado: FK en ambas direcciones, `leads.opportunity_id` y `opportunities.lead_id` nullable).

\* `opportunity_id` se agrega a la lista de campos de §2.1 como resultado de este análisis: nullable, se setea solo al convertir en oportunidad.

---

## 5. Impacto en navegación y pantallas

### 5.1 Menú futuro

```
PLIFE Hoy · Leads · Pipeline · Campañas · Radar B2B · Asistente Comercial
· Compliance · Dirección · Academia/Biblioteca · Admin
```

Cambios respecto al sidebar actual (`src/components/layout/app-sidebar.tsx`):

- **Leads** y **Pipeline** entran como ítems de primer nivel.
- **Contactos** y **Empresas** salen del menú principal; quedan accesibles desde leads/oportunidades y como sub-navegación (o bajo un ítem "Datos" secundario — decisión de UX en 14D).
- **Oportunidades** se absorbe en Pipeline (vista de cierre) o queda como sub-vista.
- **Copiloto IA** se renombra conceptualmente a **Asistente Comercial**.
- **Motor IA** (configuración) pasa a menú interno/Admin.

### 5.2 Pantalla Leads (`/app/leads`)

| Bloque | Contenido |
|---|---|
| **Listado** | Tabla/cards: title, display_name, lead_type, source, pipeline_stage, priority, temperature, next_action_date, asesor |
| **Filtros** | Etapa, origen, tipo, prioridad, temperatura, asesor, estado (activo/convertido/descartado), texto libre |
| **Crear lead** | Form mínimo (title + defaults) con campos progresivos colapsados; duplicate-check por phone/email al confirmar |
| **Detalle lead** | Datos + historial de etapas + actividades + entidades vinculadas + notas |
| **Acciones rápidas** | Registrar contacto (llamada/WhatsApp), cambiar etapa, definir próximo paso, cambiar temperatura |
| **Convertir** | Botón "Convertir" habilitado según etapa: crear/vincular empresa, contacto, oportunidad (wizard corto) |

### 5.3 Pantalla Pipeline (`/app/pipeline`)

- **Tablero por etapas**: columnas = etapas activas del pipeline de leads (sin convertido/descartado por defecto, toggle para verlas).
- **Cards**: title, temperatura (color), próximo paso + fecha, origen (ícono), asesor.
- **Alertas visuales**: borde rojo = vencido; badge = sin próximo paso; indicador de estancado (7+ días sin actividad).
- **Drag & drop**: opcional/futuro (14E); primera versión con selector de etapa en la card.
- **Filtros rápidos**: asesor, prioridad, origen, temperatura.

### 5.4 Cambios en PLIFE Hoy

El follow-up center (`follow-up-center.tsx`) ya agrupa por vencidas/hoy/sin próximo paso/estancadas sobre oportunidades. Se generaliza para incluir leads:

| Widget | Fuente | Criterio |
|---|---|---|
| Leads nuevos | leads | `pipeline_stage = nuevo` sin actividad |
| Leads sin contacto | leads | `nuevo` con 48h+ sin primer contacto |
| Leads vencidos | leads | `next_action_date` < hoy |
| Leads sin próximo paso | leads | activos sin `next_action` o `next_action_date` |
| Leads calientes | leads | `temperature = hot` o etapa interesado/propuesta con fecha próxima |
| Oportunidades activas | opportunities | Grupos actuales del follow-up center (se mantienen) |

---

## 6. Integraciones futuras

### Campañas

- La campaña **genera leads** (`source = campaign`, `campaign_id`), no solo agrupa oportunidades.
- `campaign-operational.ts` incorpora métricas de leads: **generados** (count por campaign_id), **contactados** (etapa ≥ contactado), **convertidos** (status = converted). Los campos `total_*` actuales se mantienen hasta deprecarlos con datos reales.
- Acción "Registrar lead de campaña" desde el detalle de campaña.

### Radar B2B

- El radar **genera leads B2B**: acción "Crear Lead" por empresa detectada (pre-carga `lead_type=company`, `radar_source_id`, `company_id`).
- La empresa detectada ya existe en `companies` — no se crea empresa nueva ni se duplica; el flujo de gestión pasa por el lead, no por mutar `b2b_status` directamente. Los estados del radar convergen gradualmente con el pipeline del lead (transición documentada en 14H).

### IA (Asistente Comercial)

Contexto por lead para el copiloto existente (`src/domains/ai/actions.ts`):

- **Análisis contextual**: leer lead + historial + entidades vinculadas.
- **Sugerir próximo paso** según etapa, origen y temperatura.
- **Preparar mensaje** (borrador WhatsApp/email) adaptado al perfil del lead.
- **Resumir historial** antes de contactar.
- Límites vigentes: **no decide, no promete condiciones, no calcula primas** — revisión humana siempre (consistente con reglas actuales del Motor IA).

### Compliance

- Revisión de mensajes asociados a un lead (mismo flujo actual, con contexto del lead).
- Futuro opcional: guardar resultado de la revisión vinculado al lead (`lead_id` en registros de compliance) para trazabilidad — solo si se valida la necesidad.

---

## 7. Estrategia de migración

### Fases propuestas (sin ejecutar)

| Fase | Contenido | Depende de |
|---|---|---|
| **14B** | Schema SQL draft: tabla `leads`, `lead_pipeline_history`, enums, índices, RLS draft. Solo documento/archivo SQL sin aplicar | 14A |
| **14C** | Tipos TypeScript (`src/types/database.ts`), constantes (etapas/labels/colores en `constants.ts`), helpers y Zod schemas | 14B |
| **14D** | UI Leads básica: listado, filtros, form de creación mínima, detalle | 14C |
| **14E** | Pipeline visual: tablero por etapas, alertas, cambio de etapa | 14D |
| **14F** | Conversión lead → empresa/contacto/oportunidad (wizard + actions + duplicate-check) | 14D |
| **14G** | PLIFE Hoy basado en leads: follow-up center generalizado, nuevos widgets | 14D |
| **14H** | Campañas y Radar alimentan leads: acciones de creación, métricas, transición del flujo radar | 14F |
| **14I** | IA contextual por lead: contexto en copiloto, sugerencias, drafts | 14D |
| **14J** | Permisos finales: RLS por rol (asesor propio / líder equipo / dirección todo), cierre del open-access temporal | todas |

### Riesgos y salvaguardas

| Riesgo | Salvaguarda |
|---|---|
| **Romper oportunidades actuales** | No se modifica `opportunities` hasta 14F; el FK `opportunities.lead_id` es nullable y aditivo; el pipeline actual de oportunidades sigue operativo |
| **Duplicar conceptos (lead vs contacto vs oportunidad temprana)** | Regla editorial única: interés sin calificar = lead; persona confirmada = contacto; negocio calificado = oportunidad. Documentar en manual y guías in-app |
| **Migrar datos prematuramente** | Ninguna migración de datos existentes hasta validar el modelo en uso real; oportunidades existentes NO generan leads retroactivos en la primera etapa |
| **Incompatibilidad con PR #2** | PR #2 (mejoras operativas) es aditivo y no toca schema; todas las fases 14x se construyen sobre él; el follow-up center se generaliza, no se reemplaza |
| **Doble flujo radar durante transición** | Mientras 14H no esté completa, el radar mantiene su flujo actual; la acción "Crear Lead" convive sin eliminar `b2b_status` |
| **Enum de oportunidad heredado** | Decisión explícita en 14B: mantener enum completo y documentar convención (etapas tempranas en desuso) — limpiar solo con datos validados |

---

## 8. FASE 14C — Domain helpers

Se agregó la capa de dominio `src/domains/leads/` — **TypeScript puro, sin dependencia de Supabase** (no importa clientes ni queries; la tabla `leads` sigue sin aplicarse).

| Archivo | Contenido |
|---|---|
| `types.ts` | Unions (`LeadType`, `LeadSource`, `LeadStatus`, `LeadPipelineStage`, `LeadPriority`, `LeadTemperature`) + `LeadLike` (shape mínimo que consumen los helpers, no la tabla completa) |
| `constants.ts` | Labels en español + `LEAD_PIPELINE_ORDER`, `ACTIVE_LEAD_STAGES`, `TERMINAL_LEAD_STAGES`, `CONVERTIBLE_LEAD_STAGES` |
| `pipeline.ts` | Orden/labels de etapa, terminalidad, `canMoveLeadToStage` (terminales no se abandonan; activas se mueven libre), `getNextRecommendedStage`, sort |
| `conversion.ts` | `canConvertLeadToOpportunity` / `getLeadConversionReadiness` — regla 13L/14A: solo leads `open` en etapa calificada, con título y próximo paso. Devuelve razones legibles para UI |
| `follow-up.ts` | Buckets `overdue / today / missing_next_step / none` por comparación de fecha `YYYY-MM-DD` local; estados terminales quedan fuera del follow-up activo |
| `index.ts` | Re-export del dominio |

- Cubierto por `tests/unit/leads.test.ts` (transiciones, conversión, buckets, orden).
- Prepara la UI futura (14D/14E) y el PLIFE Hoy basado en leads (14G): los componentes consumirán estos helpers sin lógica duplicada.
- `src/types/database.ts` **no se tocó**: se alineará cuando el schema 14B se aplique.

---

## 9. FASE 14D — Mock UI

Se creó la UI conceptual de Leads y Pipeline con **datos mock locales, sin Supabase**:

| Pieza | Ubicación |
|---|---|
| Datos demo (10 leads "Lead Demo …" cubriendo las 8 etapas) | `src/domains/leads/mock-data.ts` |
| Badges de etapa/prioridad/temperatura, card, listado con filtros, tablero, resumen de seguimiento | `src/components/leads/*` |
| Página Leads (resumen + filtros + listado, CTA "Nuevo lead" deshabilitado hasta 14E) | `src/app/app/leads/page.tsx` |
| Página Pipeline (tablero por etapas, sin drag & drop todavía) | `src/app/app/pipeline/page.tsx` |
| Sidebar: ítems Leads y Pipeline agregados tras PLIFE Hoy | `src/components/layout/app-sidebar.tsx` |

Alcance y límites:

- **No modifica datos**: no hay queries ni inserts a Supabase para leads; las fechas demo se calculan en runtime para que "vencido/hoy" sigan siendo ilustrativas.
- **Valida navegación y UX** del modelo Lead-first antes de aplicar el schema (14B sigue draft).
- Ambas páginas requieren usuario autenticado (mismo patrón `getProfile()` del resto de `/app`) y muestran aviso visible de vista conceptual.
- **Compatibilidad**: Contactos, Empresas y Oportunidades permanecen intactos en menú y funcionamiento; los componentes consumen los helpers de 14C sin lógica duplicada.

---

## 10. FASE 14E — Mock lead creation form

Se agregó el alta conceptual de leads, **sin persistencia**:

| Pieza | Ubicación |
|---|---|
| Formulario client-side con estado local | `src/components/leads/lead-create-form.tsx` |
| Ruta de alta (auth requerida, link de vuelta a Leads) | `src/app/app/leads/new/page.tsx` |
| CTA "Nuevo lead" activado hacia `/app/leads/new` con etiqueta "Mock" | `src/app/app/leads/page.tsx` |

Comportamiento:

- **No persiste datos**: sin Supabase, sin server actions; el submit arma un preview local (`LeadCard`) con el mensaje "Lead demo preparado. La persistencia real se implementará en una fase posterior."
- **Valida carga mínima**: `title` obligatorio; email con formato básico si se completa; próximo paso sin fecha permitido con ayuda contextual ("Más adelante PLIFE Hoy podrá usar la fecha para recordatorios.").
- **Mantiene Lead-first**: no exige empresa ni contacto al inicio — solo título y clasificación progresiva (tipo, origen, prioridad, temperatura con defaults del schema 14B).
- **Prepara la server action futura**: el shape del estado del form coincide con los campos de creación mínima definidos en §2; al implementar persistencia (post-aplicación del schema) solo se reemplaza el handler del submit.

### 10.1 FASE 14E-B — Button asChild stability fix

Durante el smoke visual de 14E se detectó un bug latente en `src/components/ui/button.tsx`:

- **Bug**: `Button` con `asChild` + `Link` puede crashear con el error de Radix *"Slot failed to slot onto its children"*.
- **Causa**: cuando `loading=true`, el componente renderizaba el spinner SVG como hermano de `children` dentro de `Slot`. Radix exige un único hijo válido.
- **Caso expuesto**: `src/components/ui/create-success-panel.tsx` usa `Button asChild` con `Link`; cualquier uso futuro con `loading` rompería el panel de éxito compartido por formularios de alta.
- **Fix**: si `asChild=true`, no se inserta el spinner como sibling; se mantiene un solo child y el estado de carga se comunica con `aria-disabled`, `data-loading` y clases de opacidad/pointer-events. Los botones normales (`asChild=false`) conservan el spinner visible.
- **Por qué antes de seguir con UI**: el panel de éxito y otros CTAs con `asChild` son piezas transversales del flujo de creación (leads, contactos, empresas, campañas, oportunidades); un crash en `Button` bloquea smoke y despliegues incrementales de la fase 14.

---

## 11. FASE 14F — Mock lead detail and actions

Se agregó el workspace conceptual para trabajar un lead individual, **sin persistencia**:

| Pieza | Ubicación |
|---|---|
| Ruta de detalle (auth requerida, lookup en mock local) | `src/app/app/leads/[leadId]/page.tsx` |
| Vista compuesta del detalle | `src/components/leads/lead-detail-view.tsx` |
| Header, resumen, próximo paso, timeline | `lead-detail-header.tsx`, `lead-detail-summary.tsx`, `lead-next-action-panel.tsx`, `lead-timeline-mock.tsx` |
| Acciones mock, IA mock, compliance mock | `lead-actions-panel.tsx`, `lead-ai-assistant-mock.tsx`, `lead-compliance-mock.tsx` |
| Navegación desde listado y pipeline | `lead-card.tsx` → `/app/leads/[leadId]` |

Comportamiento:

- **Detalle conceptual**: muestra título, etapa, prioridad, temperatura, estado, resumen, próximo paso (bucket vencido/hoy/sin paso/ninguno), timeline demo y aviso visible de datos no reales.
- **Acciones mock**: botones deshabilitados (marcar contactado, cambiar etapa, preparar mensaje, compliance, descartar) con mensaje *"Disponible cuando el módulo esté conectado a la base."*
- **IA mock**: sugerencias locales según etapa, temperatura e interés — sin APIs externas.
- **Compliance mock**: advertencias preventivas estáticas — sin APIs externas.
- **Conversión evaluada con helpers**: `canConvertLeadToOpportunity()` y `getLeadConversionReadiness()` determinan si mostrar CTA mock o razones de bloqueo; no crea oportunidad real.
- **Sin persistencia**: sin Supabase, sin server actions, sin inserts/updates; prepara los handlers futuros reemplazando mocks por mutaciones reales post-aplicación del schema.

---

## 12. FASE 14G — Schema applied in Supabase dev

El schema de leads se aplicó **solo en Supabase dev** (`plife-crm`, ref `ayvnloxijnfnooaefrlm`):

| Pieza | Estado |
|---|---|
| Tabla `leads` + índices + RLS + grants | Aplicado en dev |
| Columna `opportunities.lead_id` (nullable) | Aplicado en dev |
| Migración remota | `leads_schema_fase_14g` |
| Registro detallado | `docs/product/leads-schema-apply-dev-14g.md` |

Decisiones y límites:

- **UI sigue mock** — `/app/leads` y `/app/pipeline` consumían `MOCK_LEADS` locales; lectura real llega en 14H.
- **No producción** — no se aplicó en otros proyectos Supabase ni en Vercel.
- **No migración de datos** — oportunidades/contactos/empresas intactos; `opportunities.lead_id` queda `NULL` en registros existentes.
- **Smoke dev** — 1 lead demo insertado y soft-deleted para validar schema; ver reporte 14G.
- **Hallazgo RLS** — soft-delete vía rol `authenticated` bloqueado por interacción `leads_select` + `UPDATE`; resolver antes de server actions de descarte.
- **Siguiente paso** — regenerar `database.ts` con entidad `Lead` y conectar lectura controlada (sin reemplazar mock completo de inmediato).

---

## 12.1 FASE 14G-B — Soft-delete RLS fix (dev)

Se analizó y documentó el bug RLS de soft-delete en dev:

- **Bug**: `UPDATE deleted_at` como rol `authenticated` en `leads` sigue fallando con `42501` porque Postgres evalúa `leads_select` sobre la fila nueva (`deleted_at IS NULL` deja de cumplirse).
- **Fix aplicado**: se creó el patch `supabase/leads-rls-soft-delete-fix-14gb.sql` (migración `leads_rls_soft_delete_fix_14gb*`) que documenta y refuerza la política `leads_update` para owner/admin sin abrir `DELETE` físico ni relajar `leads_select`.
- **Estado actual**:
  - Soft-delete vía service/admin (rol elevado) funciona y sigue ocultando filas con `deleted_at` no null.
  - Soft-delete directo desde UI usando solo rol `authenticated` continúa bloqueado por diseño de RLS y requiere una función `SECURITY DEFINER` o ajuste adicional en una fase posterior.
- **Alcance**: cambio aplicado **solo en Supabase dev** (`ayvnloxijnfnooaefrlm`). Producción y Vercel siguen intactos. La UI continúa en modo mock sobre `MOCK_LEADS`.

Detalle en `docs/product/leads-rls-soft-delete-fix-14gb.md`.

---

## 13. FASE 14H — Read-only leads from Supabase dev

Se conectó lectura real de leads en dev sin habilitar mutaciones:

| Pieza | Ubicación |
|---|---|
| Queries read-only (RLS, sin service role) | `src/domains/leads/queries.ts` |
| Listado | `src/app/app/leads/page.tsx` → `getLeads()` |
| Pipeline | `src/app/app/pipeline/page.tsx` → `getLeads()` |
| Detalle | `src/app/app/leads/[leadId]/page.tsx` → `getLeadById()` |
| Tipos DB | `src/types/database.ts` — `Lead`, `leads`, `opportunities.lead_id` |
| Estado dev | `docs/product/leads-dev-schema-state-14h.md` |

Comportamiento:

- **Lectura real**: rutas principales consultan Supabase dev (`ayvnloxijnfnooaefrlm`) con cliente server anon + sesión; filtro `deleted_at IS NULL`.
- **Empty state**: si no hay leads visibles, mensaje claro sin mezclar `MOCK_LEADS`.
- **Banners**: indican conexión dev y que creación/acciones siguen mock.
- **Detalle**: resumen y próximo paso desde DB; timeline, IA, compliance y acciones siguen mock/deshabilitadas.
- **Sin mutaciones**: `/app/leads/new` no inserta; pipeline sin drag/drop; soft-delete no conectado.
- **`MOCK_LEADS`**: conservado en repo, no usado en rutas principales.

---

## 12.2 FASE 14H-B — Dev seed and read-only validation

Para validar la lectura real se cargaron 3 leads demo activos en Supabase dev (`ayvnloxijnfnooaefrlm`):

- `Lead Demo Dev Vida 14HB` (`nuevo`)
- `Lead Demo Dev Empresa 14HB` (`interesado`)
- `Lead Demo Dev Seguimiento 14HB` (`seguimiento`, vencido)

Resultado:

- `/app/leads` muestra los 3 leads reales y deja de mostrar empty state.
- `/app/pipeline` distribuye correctamente los 3 leads por columna.
- `/app/leads/[id]` carga detalle real con resumen y próximo paso desde DB.
- La UI **sigue sin mutaciones**: `/app/leads/new`, acciones del detalle y pipeline permanecen mock/read-only.
- Producción y Vercel siguen intactos.

Detalle completo en `docs/product/leads-dev-seed-readonly-14hb.md`.

---

## 14. FASE 14I — Real lead creation in dev

Se habilitó la creación real de leads desde la UI en **Supabase dev** sin service role:

| Pieza | Ubicación |
|---|---|
| Server action | `src/domains/leads/actions.ts` — `createLeadAction` |
| Validación Zod | `src/domains/leads/validation.ts` |
| Formulario | `src/components/leads/lead-create-form.tsx` |
| Ruta | `src/app/app/leads/new/page.tsx` |
| Tests unitarios | `tests/unit/leads.test.ts` |
| Documentación | `docs/product/leads-create-action-14i.md` |

Comportamiento:

- **INSERT authenticated**: `createLeadAction` usa cliente server anon + sesión; RLS exige `created_by = auth.uid()` y `assigned_to = auth.uid()`.
- **Campos controlados por server**: `created_by`, `assigned_to`, `status=open`, `pipeline_stage=nuevo`, defaults de tipo/origen/prioridad/temperatura.
- **Sin service role**: no se usa `SUPABASE_SERVICE_ROLE_KEY`.
- **Revalidación**: tras crear, `revalidatePath('/app/leads')` y `revalidatePath('/app/pipeline')`.
- **Sin update/delete**: detalle, pipeline drag/drop, conversión, descarte y soft-delete siguen sin mutación real.
- **Producción / Vercel**: no tocados.

---

## 15. FASE 14J — Operational lead updates

Se habilitó la edición real de campos operativos desde el detalle del lead en **Supabase dev**:

| Pieza | Ubicación |
|---|---|
| Server action | `src/domains/leads/actions.ts` — `updateLeadOperationalAction` |
| Validación Zod | `src/domains/leads/validation.ts` — `updateLeadOperationalSchema` + `buildLeadOperationalUpdate` |
| Formulario | `src/components/leads/lead-operational-edit-form.tsx` |
| Integración | `src/components/leads/lead-detail-view.tsx` (debajo del panel de próximo paso, solo con datos dev) |
| Lectura de `notes` | `src/domains/leads/queries.ts` (prefill del formulario) |
| Tests unitarios | `tests/unit/leads.test.ts` |
| Documentación | `docs/product/leads-operational-update-14j.md` |

Comportamiento:

- **Campos editables**: `pipeline_stage` (solo etapas activas), `priority`, `temperature`, `next_action`, `next_action_date`, `notes`. Opcionales vacíos limpian la columna.
- **Campos bloqueados**: `.strict()` rechaza `status`, `deleted_at`, `created_by`, `assigned_to`, `converted_at`, `discarded_at`, `opportunity_id`, `company_id`, `contact_id`. El payload de UPDATE solo contiene las 6 columnas operativas.
- **Etapas terminales**: `convertido`/`descartado` se rechazan en el schema y no aparecen en el select; se manejarán por los flujos de conversión/descarte.
- **RLS**: política `leads_update` (`authenticated`) — admin/dirección, asignado o creador. El action filtra `deleted_at IS NULL` y verifica filas afectadas con `select('id')`.
- **Revalidación**: `/app/leads`, `/app/pipeline` y `/app/leads/[leadId]` — un cambio de etapa desde el detalle se refleja en el pipeline sin drag/drop.
- **Sin conectar**: conversión real, descarte, soft-delete (NO-GO), DELETE físico, drag/drop, service role.
- **Producción / Vercel**: no tocados.

---

## 16. FASE 14K — PLIFE Hoy lead-first focus

PLIFE Hoy (`/app/hoy`) empieza a leer leads reales de **Supabase dev** y muestra
el panel "Foco de leads" como foco operativo diario:

| Pieza | Ubicación |
|---|---|
| Helpers de agrupación | `src/domains/leads/dashboard.ts` — `getLeadDashboardBuckets`, `getLeadDashboardSummary`, `isLeadDashboardActive` |
| Panel | `src/components/leads/lead-today-panel.tsx` (server component) |
| Integración | `src/app/app/hoy/page.tsx` + prop `leadPanel` en `AdvisorDashboard` / `DirectionDashboard` |
| Tests unitarios | `tests/unit/leads.test.ts` |
| Documentación | `docs/product/leads-today-panel-14k.md` |

Comportamiento:

- **Lectura server-side**: `getLeads()` bajo RLS `leads_select`; el browser no consulta `/rest/v1/leads`.
- **Buckets**: nuevos, vencidos, para hoy, sin próximo paso, calientes y en seguimiento — solo leads activos (`status=open`, etapa no terminal). Convertidos/descartados/archivados quedan fuera.
- **Foco operativo diario**: counts + listas compactas (máx. 5) con etapa, temperatura, prioridad y próximo paso, linkeando a `/app/leads/[id]`.
- **Sin mutaciones nuevas**: el panel solo navega; no hay cambio de etapa, soft-delete ni conversión desde Hoy; no se agregaron server actions.
- **Compatibilidad con flujo vigente**: los dashboards de asesor y dirección conservan todas sus secciones (follow-up center de oportunidades incluido); el panel se muestra en paralelo con la nota "El nuevo foco Lead-first se muestra en paralelo al flujo vigente."
- **Producción / Vercel**: no tocados.

---

## Resumen de decisiones

| Tema | Decisión |
|---|---|
| Entrada del CRM | Tabla `leads` nueva, aditiva, sin tocar entidades existentes |
| Tipo de lead | Campo `lead_type` (person/company/unknown), sin secciones separadas |
| Pipeline | 8 etapas propias del lead; el stage de oportunidad queda para ciclo de cierre |
| Conversión a oportunidad | Solo desde etapa `interesado` o posterior; acción deliberada del asesor |
| Lead post-conversión | Se conserva (`status=converted`) con FKs a entidades creadas; trazabilidad completa |
| Radar | Genera leads referenciando la empresa detectada; no muta empresas directamente (transición gradual) |
| Campañas | Generan leads; métricas de leads se agregan sin romper `total_*` actuales |
| PLIFE Hoy | Follow-up center generalizado a leads + oportunidades |
| Convenciones técnicas | `assigned_to`, soft-delete, auditoría, Zod inline, duplicate-check — mismos patrones existentes |

---

*Documento de diseño — FASE 14A. Sin código, sin SQL, sin migraciones, sin cambios de UI.*
