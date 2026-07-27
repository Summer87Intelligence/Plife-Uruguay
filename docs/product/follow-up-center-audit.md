# Follow-up Center — Auditoría de datos disponibles

> FASE 13D · 2026-07-03  
> Auditor: Product Manager + Senior Frontend Engineer

---

## 1. Datos existentes hoy para seguimiento de oportunidades

Los siguientes campos existen en la tabla `opportunities` (verificados en `src/types/database.ts`):

| Campo | Tipo | Descripción |
|---|---|---|
| `next_action` | `string \| null` | Texto del próximo paso a realizar |
| `next_action_date` | `string \| null` | Fecha del próximo paso (formato YYYY-MM-DD) |
| `last_activity_at` | `string \| null` | Timestamp de la última actividad registrada |
| `stage` | `OpportunityStage` | Etapa actual de la oportunidad |
| `contact_id` | `string \| null` | FK a contacto asociado |
| `company_id` | `string \| null` | FK a empresa asociada |
| `assigned_to` | `string \| null` | FK al asesor asignado |
| `deleted_at` | `string \| null` | Soft delete |

Las etapas cerradas (`CLOSED_STAGES`) son: `cerrada_ganada`, `cerrada_perdida`, `dormida`.

Las etapas activas (`PIPELINE_STAGES`) son: `nueva`, `calificada`, `contactada`, `reunion_agendada`, `diagnostico_realizado`, `propuesta_conceptual`, `validacion_plife`, `seguimiento`.

---

## 2. Campos para "seguimiento vencido"

**Campo:** `next_action_date`  
**Condición:** `next_action_date < hoy AND stage NOT IN closed stages AND deleted_at IS NULL`  
**Estado:** ✅ Disponible sin migraciones

Nota: la query existente en `/app/hoy` ya calcula seguimientos vencidos **para contactos** (`overdueActions`). Para **oportunidades** no existe aún. Es el gap que se cierra en esta fase.

---

## 3. Campos para "seguimiento hoy"

**Campo:** `next_action_date`  
**Condición:** `next_action_date = hoy AND stage NOT IN closed stages AND deleted_at IS NULL`  
**Estado:** ✅ Disponible sin migraciones

La query `upcomingOpps` existente usa `>= hoy` (incluye hoy y días futuros). La vista "para hoy" requiere filtrar exactamente con `= hoy`, lo cual es una query nueva pero trivial.

---

## 4. Campos para "sin próximo paso"

**Campos:** `next_action` y/o `next_action_date`  
**Condición:** `(next_action IS NULL OR next_action_date IS NULL) AND stage NOT IN closed stages AND deleted_at IS NULL`  
**Estado:** ✅ Disponible sin migraciones

El filtro OR en Supabase ya está probado en el codebase (ver `staleOpps` que usa `.or('last_activity_at.is.null,...')`).

---

## 5. Campos para "estancada"

**Campo:** `last_activity_at`  
**Condición:** `(last_activity_at IS NULL OR last_activity_at < hace 7 días) AND stage NOT IN closed stages AND deleted_at IS NULL`  
**Estado:** ✅ Disponible sin migraciones — ya calculado en `staleOpps`

La query `staleOpps` ya existe en `/app/hoy/page.tsx` y retorna exactamente esto. Se puede reutilizar el dato sin query adicional.

---

## 6. Qué NO se puede calcular sin Supabase nuevo

| Funcionalidad | Motivo | Requiere |
|---|---|---|
| Notificaciones push cuando vence un seguimiento | Necesita cron job + canal externo | GAP-SEG-01, FASE 14B |
| Alertas por email o WhatsApp | Canal externo + configuración por usuario | FASE 14B+ |
| Comparar actividad entre asesores | No hay vista agregada por asesor | GAP-DIR-01, FASE 14B |
| Score de "urgencia" compuesto (días vencido × valor estimado) | Requiere lógica de ranking no implementada | FASE 14B |
| Historial de cuántas veces se postergó un seguimiento | No hay campo de conteo de postergaciones | FASE 14C |

---

## 7. UI existente que se puede reutilizar

| Elemento | Ubicación | Reutilización |
|---|---|---|
| Badges pill (red/orange/blue) | `advisor-dashboard.tsx` lineas 82–107 | Patrón de badge con ícono + texto |
| Lista de items con CTA link | `advisor-dashboard.tsx` lineas 148–165 | Patrón de `<ul>` + `<Link>` con hover |
| Card con header y content | `@/components/ui/card` | Card para envolver secciones |
| `formatDate`, `formatRelativeDate` | `@/lib/utils` | Para mostrar fechas relativas |
| `OPPORTUNITY_STAGE_LABELS`, `OPPORTUNITY_STAGE_COLORS` | `@/lib/constants` | Badges de etapa |
| `CheckCircle2` empty state pattern | `advisor-dashboard.tsx` línea 74–77 | Empty state de "todo al día" |

---

## 8. Riesgos de cálculo

| Riesgo | Descripción | Mitigación |
|---|---|---|
| Oportunidades sin `assigned_to` | No aparecerán en el centro de seguimiento del asesor | Documentar: el centro muestra solo opps asignadas al asesor |
| `next_action_date` como string YYYY-MM-DD vs timestamp | La comparación con `today` (también YYYY-MM-DD) es correcta para eq y lt | Usar siempre `new Date().toISOString().split('T')[0]` |
| Overlap entre "sin próximo paso" y "estancada" | Una opp puede estar en ambos grupos | Aceptar el overlap: son dimensiones distintas (dato faltante vs inactividad) |
| Overlap entre "vencidas" y "para hoy" | Mutuamente excluyentes por definición (< hoy vs = hoy) | No hay overlap |
| Límite de resultados | Con `limit(10)` puede haber más vencidas que las mostradas | Mostrar conteo total si supera el límite; CTA a ver todas en /app/oportunidades |

---

## 9. Propuesta de implementación sin migraciones

### Queries a agregar en `/app/hoy/page.tsx`

Las 3 queries nuevas van dentro del `Promise.all` existente:

```
1. overdueOpps:
   FROM opportunities
   WHERE assigned_to = profile.id
     AND deleted_at IS NULL
     AND stage NOT IN (cerrada_ganada, cerrada_perdida, dormida)
     AND next_action_date IS NOT NULL
     AND next_action_date < today
   SELECT id, title, stage, next_action, next_action_date
   LIMIT 10

2. todayOpps:
   FROM opportunities
   WHERE assigned_to = profile.id
     AND deleted_at IS NULL
     AND stage NOT IN (cerrada_ganada, cerrada_perdida, dormida)
     AND next_action_date = today
   SELECT id, title, stage, next_action, next_action_date
   LIMIT 10

3. noNextStepOpps:
   FROM opportunities
   WHERE assigned_to = profile.id
     AND deleted_at IS NULL
     AND stage NOT IN (cerrada_ganada, cerrada_perdida, dormida)
     AND (next_action IS NULL OR next_action_date IS NULL)
   SELECT id, title, stage, next_action, next_action_date
   LIMIT 10
```

`staleOpps` ya existe — se reutiliza como "Estancadas".

### Componente nuevo

```
src/components/follow-up/follow-up-center.tsx
```

Props: `overdue`, `today`, `missingNextStep`, `stalled` (todos `FollowUpOpp[]`)

### Integración

Agregar en `AdvisorDashboard` entre la guía compacta y el grid de cards, visible siempre cuando hay al menos una opp en cualquier grupo.

---

## Diseño funcional propuesto

### Sección "Seguimiento comercial" en /app/hoy

**Título:** Seguimiento comercial  
**Descripción:** Prioriza oportunidades que necesitan acción: vencidas, para hoy o sin próximo paso.

**Cuatro grupos, en orden de urgencia:**

#### Grupo 1: Vencidas (rojo)
- Oportunidades con `next_action_date < hoy`
- Muestra: título, etapa, fecha vencida, próximo paso si existe
- CTA: "Ver oportunidad" → `/app/oportunidades/[id]`
- Si hay más de 10: nota "Ver todas en pipeline"

#### Grupo 2: Para hoy (azul)
- Oportunidades con `next_action_date = hoy`
- Muestra: título, etapa, próximo paso
- CTA: "Ver oportunidad"

#### Grupo 3: Sin próximo paso (naranja)
- Oportunidades activas sin `next_action` o sin `next_action_date`
- Muestra: título, etapa
- CTA: "Definir próximo paso" → `/app/oportunidades/[id]`

#### Grupo 4: Estancadas (gris/naranja)
- Oportunidades sin actividad en los últimos 7 días (datos de `staleOpps` existentes)
- Muestra: título, etapa, última actividad
- CTA: "Ver oportunidad"

**Empty state global:** "Sin seguimientos pendientes por ahora. Mantené cada oportunidad con próximo paso y fecha para que el sistema pueda ayudarte."

**Aviso informativo:** "El seguimiento depende de que las oportunidades tengan próximo paso y fecha cargada."

### Placement en /app/hoy

```
[Saludo + métricas]
[Qué atender hoy — strip de badges]
[GettingStartedCard (si isEmpty o demo)]
[*** NUEVO: Seguimiento comercial ***]  ← acá
[Flujo recomendado / guía]
[Grid de cards: vencidos, próximas, hot opps, campañas, agenda, empresas]
```

No reemplaza la sección "Qué atender hoy" (que muestra contactos y campañas). La complementa con foco específico en oportunidades.

---

*Auditoría completada — confirmado implementable sin Supabase nuevo ni migraciones*
