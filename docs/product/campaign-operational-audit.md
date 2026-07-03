# Campaign Operational Audit — PLIFE Growth OS (FASE 13F)

Auditoría del módulo Campañas y propuesta de mejora operativa sin migraciones ni métricas inventadas.

## 1. Cómo se crean campañas hoy

| Paso | Ubicación | Detalle |
|------|-----------|---------|
| UI | `campaigns-list.tsx` | Dialog "Nueva campaña" (roles: admin, direccion, lider_comercial) |
| Formulario | `campaign-form.tsx` | Nombre*, objetivo*, segmento, mensaje, tipo, estado, guion, objeciones, fechas |
| Server action | `domains/campaigns/actions.ts` → `createCampaign` | Zod → insert; default `status: 'borrador'` |
| Post-creación | `CreateSuccessPanel` | Links a detalle y listado |

Edición y cambio de estado en `campaign-actions.tsx` (detalle).

## 2. Campos existentes

| Campo | En formulario | Uso |
|-------|---------------|-----|
| `name` | Sí | Nombre de la campaña |
| `type` | Sí | 12 tipos (pymes, clínicas, tech, etc.) |
| `status` | Sí | borrador / activa / pausada / finalizada / archivada |
| `objective` | Sí | Objetivo comercial textual |
| `target_segment` | Sí | Segmento / audiencia |
| `icp_description` | Sí (colapsable) | Cliente ideal |
| `initial_message` | Sí | Mensaje de apertura (no se envía solo) |
| `call_script` | Sí (colapsable) | Guion de llamada |
| `expected_objections` | Sí (colapsable) | Array de objeciones |
| `start_date`, `end_date` | Sí (colapsable) | Ventana temporal |
| `follow_up_sequence` | No (solo vía IA) | JSON de secuencia |
| `total_*` (5 métricas) | **No** | Contadores en BD, sin UI de edición |
| `responsible_id` | **No** | Existe en tipo, sin uso en app |

## 3. Estados existentes

| Valor | Label | Significado operativo |
|-------|-------|----------------------|
| `borrador` | Borrador | En preparación, no activa |
| `activa` | Activa | En ejecución comercial |
| `pausada` | Pausada | Seguimiento en pausa |
| `finalizada` | Finalizada | Ciclo cerrado |
| `archivada` | Archivada | Solo consulta histórica |

## 4. Métricas existentes y cuáles son manuales

| Campo | Label UI actual | Origen |
|-------|-----------------|--------|
| `total_targets` | Objetivos | **Manual en BD** — sin formulario; seed demo |
| `total_contacted` | Contactados | **Manual en BD** |
| `total_responses` | Respuestas | **Manual en BD** |
| `total_meetings` | Reuniones | **Manual en BD** |
| `total_converted` | Cierres | **Manual en BD** |
| Conversión % | Derivada | `total_converted / total_targets` — **engañosa si counters en 0** |
| Empresas vinculadas | Conteo query | **Real** — `companies.campaign_id` |
| Oportunidades vinculadas | Conteo query | **Real** — `opportunities.campaign_id` |

**Gap:** La documentación interna describe actualización manual de métricas, pero la app no permite editarlas. Mostrarlas en cards como si fueran vivas es riesgo de métricas falsas.

## 5. Relaciones reales con empresas / contactos / oportunidades

| Entidad | Relación | Evidencia |
|---------|----------|-----------|
| **Empresas** | FK directa `companies.campaign_id` | Detalle campaña, `associateCompanyToCampaign`, form empresa, Radar B2B |
| **Oportunidades** | FK directa `opportunities.campaign_id` | Detalle campaña, form oportunidad (prop `campaignId`) |
| **Contactos** | **Indirecta** vía `contact.company_id → company.campaign_id` | Sin listado en detalle de campaña |

No hay tabla intermedia campaña↔contacto.

## 6. Qué se puede mostrar sin migraciones

- Objetivo, segmento, estado, fechas, tipo (labels existentes).
- Conteos reales de empresas y oportunidades vinculadas (queries de lectura).
- Próximo paso sugerido inferido de estado + vínculos (sin IA).
- Guía operativa “Cómo usar campañas”.
- CTAs hacia detalle, empresas vinculadas, oportunidades (búsqueda por nombre o detalle).
- Empty state y post-create guidance.
- Aclaración explícita: no envía mensajes automáticamente.

## 7. Qué NO se puede resolver sin Supabase nuevo

- Métricas automáticas de mensajes enviados / respuestas / conversiones.
- Integración WhatsApp, email o scraping.
- Revenue atribuido a campaña.
- Relación directa campaña↔contacto.
- Edición de `total_*` sin nueva UI + posiblemente triggers de agregación.
- Asignación de responsable (`responsible_id`) sin formulario.

## 8. Riesgos de inventar métricas

1. Mostrar `total_contacted: 0` como progreso real confunde al asesor.
2. Conversión % con `total_targets = 0` es meaningless o divide por cero (UI ya evita).
3. Implicar envíos automáticos desde campaña viola reglas de producto y compliance.
4. Contadores del seed demo parecen “reales” pero son estáticos.
5. Prometer conversiones sin vínculo a oportunidades reales genera desconfianza.

## 9. Propuesta de mejora segura para esta fase

1. Reorientar listado a flujo operativo, no dashboard de métricas manuales.
2. Reemplazar grid de 4 métricas en cards por vínculos reales (empresas / oportunidades).
3. Agregar guía contextual y copy anti-automatización.
4. Inferir “Próximo paso sugerido” por estado + vínculos.
5. CTAs claros sin conteos falsos.
6. Mejorar empty state y mensaje post-creación.
7. Mantener métricas manuales solo en detalle (con contexto) o deprecar visualmente en listado.

---

## Diseño funcional propuesto

### Preguntas que debe responder `/app/campanas`

- ¿Qué campañas existen?
- ¿Para qué sirve cada una? → objetivo + segmento
- ¿En qué estado está?
- ¿Qué debería hacer el usuario después? → próximo paso sugerido
- ¿Cómo convertir en seguimiento u oportunidad? → CTAs + guía de 5 pasos

### Cambios en listado (sin migraciones)

| Elemento | Implementación |
|----------|----------------|
| Header | Título "Campañas" + descripción anti-automatización |
| Guía | Bloque "Cómo usar campañas" (5 pasos) |
| Card | nombre, objetivo, segmento, estado, fechas, próximo paso, vínculos reales |
| CTAs | Ver campaña, Ver empresas (detalle), Ver oportunidades, Crear oportunidad (general) |
| Empty state | Copy fuerte sin campañas |
| Post-create | Texto de siguiente paso operativo |

### Qué NO inventar

- Mensajes enviados, respuestas, conversiones automáticas, revenue.
- Automatizaciones de contacto.
- Métricas no respaldadas por datos reales o vínculos FK.

### Implementación realizada (13F)

| Artefacto | Rol |
|-----------|-----|
| `docs/product/campaign-operational-audit.md` | Esta auditoría |
| `src/lib/campaign-operational.ts` | `suggestCampaignNextStep`, `campaignStatusHint` |
| `src/components/campaigns/campaign-operational-guide.tsx` | Guía reutilizable |
| `src/app/app/campanas/page.tsx` | Conteos reales empresas/oportunidades por campaña |
| `src/app/app/campanas/campaigns-list.tsx` | Listado operativo mejorado |
| `src/app/app/campanas/campaign-form.tsx` | Post-create guidance actualizado |
