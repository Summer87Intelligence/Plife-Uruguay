# Activity & Follow-up Audit — PLIFE Growth OS

Auditoría de campos de seguimiento disponibles por entidad y su uso actual en la UI.

## Campos por entidad

### Opportunity
| Campo | Tipo | UI actual |
|---|---|---|
| `next_action` | string | Seguimiento card (detalle) + OppCard + vista lista |
| `next_action_date` | string (date) | Seguimiento card + OppCard + vista lista |
| `last_activity_at` | string (ts) | ✗ no mostrado (12J: agregar) |
| `stage` | enum | Header + pipeline + lista |
| `commercial_risk` | enum | Header + cards |

### Contact
| Campo | Tipo | UI actual |
|---|---|---|
| `next_action` | string | "Acción del asesor" card (detalle) |
| `next_action_date` | string (date) | "Acción del asesor" card |
| `last_interaction_at` | string (ts) | "Estado comercial" card |
| `interest_level` | enum | EntitySummary + Estado comercial |
| `status` | enum | Estado comercial + lista |

### Company
| Campo | Tipo | UI actual |
|---|---|---|
| `b2b_score` | int | EntitySummary + Estado comercial card |
| `b2b_status` | enum | Header + Estado comercial card |
| `commercial_angle` | string | Inteligencia comercial card |
| `opportunity_detected` | string | Inteligencia comercial card |
| (via Opportunity) `next_action` | string | Banner "Actividad comercial" |
| (via Opportunity) `next_action_date` | string | Banner "Actividad comercial" |

### Activity (via Timeline)
| Campo | Tipo | UI actual |
|---|---|---|
| `title` / `description` | string | Timeline card |
| `activity_date` | string | Timeline card |
| `activity_type` | enum | Timeline card |

## Estados de seguimiento (FASE 12J)

El sistema define 4 estados visuales para seguimiento basados en `next_action` + `next_action_date`:

| Estado | Condición | Color |
|---|---|---|
| **Sin próximo paso** | `next_action` nulo | Gris |
| **Sin fecha** | `next_action` existe, `next_action_date` nulo | Azul |
| **Pendiente** | `next_action_date` >= hoy | Amarillo |
| **Vencido** | `next_action_date` < hoy | Rojo |

## Mejoras implementadas en FASE 12J

- `ActivitySummaryCard`: componente reutilizable con status badge
- `opportunity-detail.tsx`: status badge en Seguimiento + `last_activity_at`
- `company-detail.tsx`: banner "Actividad comercial" con count de opps abiertas y status badge
- `contact-detail.tsx`: banner de actividad con status badge y `last_interaction_at`
- `pipeline-view.tsx`: badge "Vencido" en OppCard cuando `next_action_date` < hoy

## Pendiente (requiere schema change)

- `Company.next_action` / `next_action_date` propios (no derivados de Opportunity)
- `Company.last_activity_at` — última actividad directa sobre la empresa
- `Contact.last_activity_at` — separado de `last_interaction_at`
