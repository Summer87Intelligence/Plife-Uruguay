# Auditoría de priorización comercial — PLIFE Growth OS (FASE 12M)

## Problema

Los asesores no tienen señales claras de dónde enfocar su energía. Las listas muestran todos los registros con el mismo peso visual. El dashboard /app/hoy tiene datos de urgencia pero no hay una guía de secuencia de trabajo ni indicadores de prioridad en las listas.

---

## Señales de prioridad disponibles (sin cambios de schema)

| Campo | Entidad | Uso |
|---|---|---|
| `next_action_date` < hoy | Oportunidades, Contactos | → Prioridad **Alta** (vencido) |
| `next_action` definido | Oportunidades, Contactos | → Prioridad **Media** (tiene paso) |
| `human_score` >= 70 | Oportunidades | → Prioridad **Alta** (alto potencial) |
| `b2b_score` >= 65 | Empresas | → Prioridad **Alta** (alto potencial B2B) |
| `b2b_status` en [contactada, en_negociacion, reunion_agendada] | Empresas | → Prioridad **Media** (proceso activo) |

---

## Lógica de prioridad por entidad

### Oportunidades
| Condición | Prioridad | Tono |
|---|---|---|
| `next_action_date` < hoy | Alta | danger (rojo) |
| `human_score` >= 70 y tiene `next_action` | Alta | warning (ámbar) |
| Tiene `next_action` | Media | warning (ámbar) |
| Sin `next_action` | Baja | muted (gris) |

### Contactos
| Condición | Prioridad | Tono |
|---|---|---|
| `next_action_date` < hoy | Alta | danger (rojo) |
| Tiene `next_action` | Media | warning (ámbar) |
| Sin `next_action` | Baja | muted (gris) |

### Empresas B2B
| Condición | Prioridad | Tono |
|---|---|---|
| `b2b_score` >= 65 y status en [detectada, analizada, priorizada] | Alta | warning (ámbar) |
| Status en [contactada, en_negociacion, reunion_agendada, asignada] | Media | success (verde) |
| Resto | Baja | muted (gris) |

---

## Cambios planificados (FASE 12M)

| Archivo | Cambio |
|---|---|
| `src/lib/commercial-priority.ts` | Helper con `getOpportunityPriority`, `getContactPriority`, `getCompanyPriority` |
| `src/components/commercial/priority-badge.tsx` | Componente `PriorityBadge` con pill de color |
| `src/app/app/hoy/advisor-dashboard.tsx` | Guía de secuencia de trabajo al inicio del dashboard |
| `src/app/app/empresas/companies-list.tsx` | PriorityBadge por fila de empresa |
| `src/app/app/contactos/contacts-list.tsx` | PriorityBadge por fila de contacto |
| `src/app/app/oportunidades/pipeline-view.tsx` | PriorityBadge en OppCard y vista lista |
| `src/app/app/direccion/direccion-view.tsx` | Sección "Foco comercial" con conteos de urgencia |

---

## Pendientes (requieren datos adicionales)

- Filtro por prioridad en listas (requeriría pasar datos al componente o cambiar query)
- Ordenamiento por prioridad
- Notificaciones push de seguimientos vencidos
