# FASE 13L — Rediseño Conceptual: Lead Único + Pipeline

**Fecha:** 2026-07-06  
**Autor:** PLIFE Growth OS — Product / Architecture Review  
**Estado:** Borrador conceptual. Sin implementación. Sin cambios de código.

---

## 1. Problema del Modelo Actual

El modelo actual sigue la secuencia clásica B2B:

```
Empresa → Contacto → Oportunidad
```

Esta estructura tiene ventajas para ciclos de venta corporativos, pero presenta fricciones importantes para PLIFE:

### Limitaciones identificadas

- **No todos los posibles clientes empiezan como empresa.** Un lead puede ser una persona natural, una referencia informal, un número de WhatsApp, o alguien que respondió una campaña.
- **El dato de empresa o contacto no siempre está disponible al inicio.** Forzar su creación previa genera fricción en el ingreso rápido de interesados.
- **Oportunidades están ligadas a contactos o empresas,** lo que impide registrar una oportunidad temprana antes de tener ese vínculo formado.
- **Campañas agrupan oportunidades,** pero en la práctica comercial una campaña genera *interés previo a la oportunidad*. El modelo actual no captura esa fase.
- **Radar detecta empresas pero no tiene flujo claro hacia la venta.** No hay camino estructurado Radar → Lead → Calificación → Oportunidad.
- **PLIFE Hoy no tiene foco en leads nuevos ni en interés sin gestionar.** El panel refleja actividad registrada, no potencial no trabajado.

### Diagnóstico

El modelo actual es útil una vez que el interesado ya fue identificado. El problema es que no existe un lugar para capturar el interés *antes* de que sea una empresa, un contacto, o una oportunidad. Ese hueco es donde se pierde pipeline.

---

## 2. Definición de Lead

> **Lead = entrada inicial de cualquier posible venta.**

Un lead es el primer registro de interés comercial. Puede representar:

- Una **persona natural** interesada en un producto PLIFE
- Una **empresa** detectada como potencial cliente
- Un **caso no definido**: un nombre, un teléfono, una referencia sin datos completos

El lead no requiere empresa ni contacto al momento de creación. Esos datos se asocian o crean en el proceso de calificación.

### Principios clave

- **El lead es el punto de entrada universal del CRM.** Todo posible negocio pasa primero por un lead.
- **El lead se clasifica, no se duplica.** No hay "lead persona" y "lead empresa" como secciones separadas: el tipo es un campo interno.
- **El lead avanza por un pipeline.** Su etapa refleja en qué momento del proceso comercial está.
- **El lead puede convertirse** en empresa, persona/contacto y oportunidad cuando el momento lo justifica.

---

## 3. Campos Sugeridos del Lead

| Campo | Tipo | Notas |
|---|---|---|
| `nombre` | texto | Nombre del lead (persona, empresa, o referencia) |
| `tipo` | enum | `persona` / `empresa` / `no_definido` |
| `origen` | enum | Ver lista de orígenes abajo |
| `interés` | texto libre | Descripción del producto o servicio de interés |
| `estado` | enum | `activo` / `pausado` / `convertido` / `descartado` |
| `etapa_pipeline` | enum | Ver sección 4 |
| `prioridad` | enum | `alta` / `media` / `baja` |
| `teléfono` | texto | WhatsApp / llamada preferida |
| `email` | texto | Opcional al inicio |
| `empresa_asociada_id` | FK opcional | Vinculación con entidad empresa |
| `persona_asociada_id` | FK opcional | Vinculación con entidad contacto |
| `campaña_asociada_id` | FK opcional | Lead generado desde campaña |
| `radar_source_id` | FK opcional | Lead originado en Radar B2B |
| `próximo_paso` | texto | Acción concreta a realizar |
| `fecha_seguimiento` | fecha | Cuándo debe retomarse |
| `notas` | texto largo | Contexto adicional |
| `asesor_asignado_id` | FK | Usuario responsable del lead |
| `fecha_creación` | timestamp | Automático |
| `fecha_última_actividad` | timestamp | Automático |

### Orígenes posibles (enum `origen`)

- `campaña` — generado por campaña activa
- `radar_b2b` — detectado por motor de radar
- `referido` — recomendado por cliente o contacto existente
- `llamada_entrante` — contacto iniciado por el interesado por teléfono
- `whatsapp` — contacto iniciado por WhatsApp
- `formulario_web` — formulario en sitio o landing
- `evento` — conocido en evento, feria, reunión
- `prospección_directa` — asesor lo identificó proactivamente
- `red_social` — Instagram, LinkedIn, etc.
- `otro` — origen no categorizado

---

## 4. Pipeline Sugerido

El pipeline es una vista del estado de avance del lead en el proceso de venta.

```
Nuevo → Contactado → Calificando → Interesado → Propuesta/Reunión → Seguimiento → Convertido
                                                                                 → Descartado
```

### Descripción de cada etapa

| Etapa | Significado | Acción típica |
|---|---|---|
| **Nuevo** | Lead ingresado, aún sin gestión | Asignar asesor, definir próximo paso |
| **Contactado** | Se realizó el primer contacto (llamada, WhatsApp, email) | Confirmar interés, agendar seguimiento |
| **Calificando** | Se está evaluando si hay interés real y capacidad | Hacer preguntas de calificación, identificar necesidad |
| **Interesado** | Hay interés confirmado pero aún sin propuesta | Preparar propuesta, agendar reunión |
| **Propuesta / Reunión** | Se presentó propuesta o hay reunión agendada | Seguir resultado de reunión, manejar objeciones |
| **Seguimiento** | El lead no tomó decisión, pero sigue activo | Retomar contacto en fecha acordada |
| **Convertido** | El lead se convirtió en cliente o negocio cerrado | Crear oportunidad formal si aplica |
| **Descartado** | El lead no tiene potencial en este ciclo | Registrar motivo, dejar para reactivación futura |

### Notas de diseño

- Un lead puede moverse hacia atrás en el pipeline si el contexto cambia.
- "Descartado" no es definitivo: permite reactivación futura con nuevo contexto.
- "Convertido" es el trigger para evaluar si se crea una entidad de Oportunidad separada.

---

## 5. Relación con Empresas y Personas

### Principio

Empresa y Persona son **entidades de datos**, no puntos de entrada obligatorios.

### Flujo recomendado

```
Lead creado sin empresa ni persona
     ↓
Calificación progresiva
     ↓
Si se confirma que es empresa  →  Crear/vincular Empresa
Si se confirma que es persona  →  Crear/vincular Persona/Contacto
     ↓
Asociación queda registrada en el lead
```

### Consecuencias

- Las secciones "Empresas" y "Contactos" del CRM **se mantienen**, pero ya no son el punto de partida del proceso comercial.
- Un lead convertido puede generar una empresa nueva o vincularse a una empresa existente.
- Empresa y Contacto pueden crearse directamente desde el perfil del lead (acción rápida).
- Los datos de empresa/contacto ya existentes en el sistema pueden vincularse a leads nuevos o existentes.

---

## 6. Relación con Oportunidades

### Análisis de las dos opciones

#### Opción A — Oportunidad como entidad separada (solo cuando el lead está calificado)

**Modelo:**
```
Lead (etapas tempranas) → calificado → se crea Oportunidad → sigue su propio pipeline de cierre
```

**Ventajas:**
- Separación clara entre "explorar interés" (lead) y "gestionar negocio" (oportunidad)
- La oportunidad puede tener campos propios: monto, probabilidad de cierre, fecha de cierre estimada, productos
- Permite que un lead genere múltiples oportunidades en el tiempo
- Métricas más limpias: leads en pipeline vs. oportunidades en pipeline de cierre

**Desventajas:**
- Más entidades para gestionar
- Requiere acción explícita del asesor para "convertir"

#### Opción B — Oportunidad como estado avanzado del lead

**Modelo:**
```
Lead avanza por pipeline hasta etapa "Propuesta/Reunión" o "Convertido" → es la oportunidad
```

**Ventajas:**
- Más simple, menos entidades
- Todo en un solo lugar

**Desventajas:**
- Mezcla datos de prospección con datos de cierre (monto, probabilidad, productos)
- Un lead puede tener múltiples oportunidades en el tiempo, lo que complica el modelo de un solo pipeline

---

### Recomendación para PLIFE

**Opción A — Oportunidad como entidad separada.**

**Justificación:**

1. **PLIFE vende seguros y productos financieros**, que tienen montos específicos, fechas de vigencia, y condiciones de póliza. Estos datos no pertenecen a un lead general.
2. **Un mismo lead puede generar múltiples oportunidades** en distintos momentos (una persona interesada en seguro de vida hoy y en plan de ahorro en 6 meses).
3. **Las métricas de conversión son más valiosas** si se distingue "leads que entraron al pipeline" de "oportunidades que llegaron a propuesta".
4. **El volumen de leads será alto** (campañas, radar, WhatsApp). Si cada lead fuera una oportunidad, el pipeline de cierre se contaminaría con ruido de prospectos sin calificar.
5. **La entidad Oportunidad ya existe en el sistema.** No se elimina; se reposiciona: solo se crea cuando el lead está calificado (etapa "Interesado" o superior).

**Regla operativa resultante:**
> Un lead que llega a etapa "Interesado" puede convertirse en una Oportunidad formal. La creación de la Oportunidad es una acción deliberada del asesor, no automática.

---

## 7. Relación con Campañas

### Problema actual

Las campañas agrupan oportunidades, pero el proceso real es:

```
Campaña activa → genera interés → ese interés debería ser un lead → el lead se califica → puede convertirse en oportunidad
```

### Modelo propuesto

```
Campaña → genera Leads (con origen = "campaña", campaña_asociada_id = X)
Lead → avanza en pipeline
Lead calificado → puede convertirse en Oportunidad
```

### Métricas de campaña basadas en leads

Cuando existan datos:

| Métrica | Descripción |
|---|---|
| Leads generados | Total de leads con origen en esa campaña |
| Leads contactados | Leads que pasaron de "Nuevo" a "Contactado" |
| Leads calificados | Leads que llegaron a "Calificando" o superior |
| Leads convertidos | Leads que pasaron a "Convertido" o generaron Oportunidad |
| Tasa de conversión | Leads convertidos / leads generados |

### Nota

La sección de Campañas no desaparece. Se mantiene como gestión de iniciativas de marketing y seguimiento de resultados, pero su relación con el pipeline pasa a ser vía leads, no vía oportunidades directas.

---

## 8. Relación con Radar B2B

### Problema actual

Radar detecta empresas con potencial, pero no tiene un flujo claro hacia la gestión comercial.

### Modelo propuesto

```
Radar B2B detecta empresa potencial
     ↓
Asesor o sistema crea un Lead con:
  - tipo = "empresa"
  - origen = "radar_b2b"
  - radar_source_id = [referencia al hallazgo del radar]
  - empresa_asociada_id = [si ya existe en el sistema]
     ↓
Lead entra al pipeline en etapa "Nuevo"
     ↓
Asesor califica: ¿tiene contacto? ¿hay interés potencial? ¿cuál es el producto?
     ↓
Lead avanza normalmente
```

### Acción desde Radar

En la UI de Radar, cada empresa detectada debería tener una acción directa: **"Crear Lead"**. Esto convierte el hallazgo del radar en gestión activa sin salir del flujo.

---

## 9. Relación con PLIFE Hoy

### Problema actual

PLIFE Hoy muestra actividad registrada: seguimientos vencidos, próximas reuniones. No refleja el potencial no trabajado.

### PLIFE Hoy basado en leads

El panel debería organizarse en dos zonas:

#### Zona de atención inmediata (prioridad alta)

| Widget | Qué muestra |
|---|---|
| **Leads nuevos sin gestión** | Leads en etapa "Nuevo" sin próximo paso ni contacto |
| **Leads vencidos** | Leads con `fecha_seguimiento` pasada y sin actividad reciente |
| **Leads sin próximo paso** | Leads activos que no tienen un `próximo_paso` definido |
| **Leads calientes** | Leads en etapa "Interesado" o "Propuesta/Reunión" con seguimiento próximo |

#### Zona de contexto del día

| Widget | Qué muestra |
|---|---|
| **Seguimientos de hoy** | Leads con `fecha_seguimiento` = hoy |
| **Leads convertidos esta semana** | Victorias recientes |
| **Oportunidades activas** | Si se mantiene entidad separada: oportunidades en pipeline de cierre |
| **Mis leads por etapa** | Distribución personal del pipeline del asesor |

---

## 10. Impacto en Navegación

### Menú principal propuesto

```
PLIFE Hoy
Leads
Pipeline
Campañas
Radar B2B
Asistente Comercial
Compliance
Dirección
Academia / Biblioteca
Admin
```

### Descripción de cada ítem

| Ítem | Qué contiene |
|---|---|
| **PLIFE Hoy** | Panel de foco diario: leads nuevos, vencidos, seguimientos del día, leads calientes |
| **Leads** | Lista y gestión de todos los leads (filtros por etapa, origen, asesor, prioridad) |
| **Pipeline** | Vista Kanban o tablero de leads por etapa; vista visual del pipeline de ventas |
| **Campañas** | Creación y gestión de campañas; métricas de leads generados |
| **Radar B2B** | Detección de empresas potenciales; acción directa "Crear Lead" |
| **Asistente Comercial** | Motor de IA: sugerencias, análisis, drafts de mensajes, resúmenes de leads |
| **Compliance** | Registros regulatorios, documentos, alertas de vencimiento |
| **Dirección** | KPIs globales, performance del equipo, métricas de conversión |
| **Academia / Biblioteca** | Materiales de capacitación, guías de producto, scripts comerciales |
| **Admin** | Gestión de usuarios, roles, configuración general |

### Menú interno / Admin (acceso restringido)

```
Configuración IA / Motor IA
  └── Modelos activos
  └── Prompts del sistema
  └── Configuración de embeddings
  └── Feature flags
  └── Logs del motor IA
```

### Notas de navegación

- "Empresas" y "Contactos" **no desaparecen del sistema**, pero dejan de ser ítems primarios del menú. Pueden ser sub-secciones de Admin o accesibles desde el perfil de un lead.
- "Oportunidades" puede mantenerse como vista secundaria dentro de Pipeline, o como sub-sección cuando se accede a un lead convertido.
- La simplificación del menú principal a 10 ítems mejora el foco del asesor.

---

## 11. Impacto Técnico Futuro

> Este apartado documenta consecuencias técnicas sin implementar ningún cambio.

### Tablas nuevas posibles

| Tabla | Propósito |
|---|---|
| `leads` | Entidad principal: todos los campos del lead |
| `lead_activities` | Historial de actividades asociadas a un lead (llamada, WhatsApp, reunión) |
| `lead_pipeline_history` | Registro de cambios de etapa con timestamp y usuario |
| `lead_conversions` | Registro de conversiones: lead → empresa, lead → contacto, lead → oportunidad |

### Migraciones necesarias (cuando se implemente)

1. Crear tabla `leads` con todos los campos de la sección 3.
2. Crear tabla `lead_activities` y `lead_pipeline_history`.
3. Adaptar tabla `opportunities` para requerir `lead_id` cuando corresponda.
4. Adaptar tabla `campaigns` para registrar leads generados (campo `lead_id` en lugar de o además de `opportunity_id`).
5. Crear índices en `leads` sobre `etapa_pipeline`, `asesor_asignado_id`, `fecha_seguimiento`, `origen`.
6. Agregar políticas RLS para leads según rol del usuario.

### Adaptación de entidades existentes

| Entidad | Impacto |
|---|---|
| **Empresas** | Se mantiene. Agrega FK opcional `lead_id` para rastrear lead de origen. |
| **Contactos/Personas** | Se mantiene. Agrega FK opcional `lead_id`. |
| **Oportunidades** | Se mantiene. Agrega FK `lead_id` (requerido) para vincular al lead calificado que la originó. |
| **Campañas** | Agrega relación con leads (en lugar de solo con oportunidades). |
| **Actividades** | Agrega FK opcional `lead_id` además de los FKs existentes. |

### Migración de datos existentes

- Las oportunidades existentes podrían tener un lead "padre" generado automáticamente en la migración, para mantener consistencia del modelo.
- Las empresas existentes sin lead asociado quedan como están; no se fuerza retroactividad.
- Las campañas existentes mantienen sus oportunidades asociadas hasta que se complete la transición.

### Impacto en permisos

- Nueva política RLS sobre tabla `leads`: asesor ve sus propios leads; manager ve leads de su equipo; director ve todos.
- Permisos de creación/edición/conversión de lead son independientes de los permisos sobre empresa u oportunidad.

### Impacto en manual de usuario

- El flujo de onboarding cambia: el primer paso ya no es "crear empresa o contacto", sino "crear lead".
- Se requiere nueva sección en manual: "Gestión de Leads y Pipeline".
- Glosario debe actualizarse: definición de lead, etapas del pipeline, conversión.

### Impacto en Campañas / Radar / IA

- **Campañas:** necesitan acción "Generar lead desde campaña" y métricas de lead propias.
- **Radar:** necesita botón "Crear lead" por empresa detectada.
- **IA:** el asistente comercial debería poder analizar leads por etapa, sugerir próximos pasos, generar drafts de mensajes según origen y etapa del lead.

---

## 12. Fases Sugeridas de Implementación

### Fase 14A — Diseño de Schema Lead / Pipeline
- Definir schema final de tabla `leads`
- Definir enums: tipo, origen, estado, etapa_pipeline, prioridad
- Revisar FKs con entidades existentes
- Crear migración SQL (sin aplicar)
- Revisar RLS

### Fase 14B — UI Leads Básica
- Listado de leads con filtros por etapa, origen, asesor, prioridad
- Formulario de creación rápida de lead
- Vista de detalle del lead
- Historial de actividad del lead

### Fase 14C — Conversión Lead → Empresa / Persona / Oportunidad
- Acción "Convertir lead" desde el detalle del lead
- Crear empresa desde lead (o vincular existente)
- Crear contacto desde lead (o vincular existente)
- Crear oportunidad desde lead (solo si lead está calificado)

### Fase 14D — Pipeline Visual
- Vista Kanban por etapa del pipeline
- Drag & drop entre etapas
- Filtros rápidos: asesor, prioridad, origen
- Indicadores visuales: leads vencidos, leads calientes

### Fase 14E — PLIFE Hoy Basado en Leads
- Reemplazar/ampliar widgets actuales con foco en leads
- Widgets: nuevos sin gestión, vencidos, sin próximo paso, calientes, seguimientos del día
- Métricas de conversión del asesor en el día/semana

### Fase 14F — Campañas → Leads
- Adaptar campañas para generar leads (no solo agrupar oportunidades)
- Métricas de campaña basadas en leads
- Vínculo campaña ↔ lead en ambas direcciones

### Fase 14G — Radar → Leads
- Botón "Crear Lead" desde Radar B2B
- Lead pre-cargado con datos de empresa detectada
- Radar_source_id vinculado al lead

### Fase 14H — IA Contextual por Lead
- Asistente comercial con contexto del lead activo
- Sugerencias de próximo paso según etapa y origen
- Draft de mensaje personalizado (WhatsApp, email) según perfil del lead
- Resumen del lead para el asesor antes de contactar

---

## Resumen Ejecutivo

| Decisión | Recomendación |
|---|---|
| Punto de entrada del CRM | Lead único y general |
| Tipo en empresa/persona | Campo interno del lead, no sección separada |
| Oportunidad | Entidad separada; se crea solo cuando lead está calificado |
| Campañas | Generan leads; métricas sobre leads, no solo oportunidades |
| Radar | Genera leads con un clic desde la UI |
| PLIFE Hoy | Panel centrado en leads nuevos, vencidos y calientes |
| Menú principal | 10 ítems con Leads y Pipeline como entidades de primer nivel |
| Empresas/Contactos | Se mantienen como entidades de datos, no como punto de entrada |

---

*Documento conceptual — FASE 13L. Sin cambios de código, base de datos, ni configuración.*
