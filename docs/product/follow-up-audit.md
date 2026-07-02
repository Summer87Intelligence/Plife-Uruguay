# Auditoría de seguimiento — PLIFE Growth OS

**Fecha:** 2026-07-01  
**Fase:** 12I — Seguimientos, actividad diaria y próximos pasos  
**Autor:** Claude (Product Manager + Senior Frontend)

---

## 1. Campos disponibles en la base de datos

### Opportunity
| Campo | Tipo | Uso actual en UI |
|-------|------|-----------------|
| `next_action` | string \| null | Sí — editable en detalle |
| `next_action_date` | string \| null | Sí — editable en detalle; faltaba en tarjetas de pipeline |
| `stage` | OpportunityStage | Sí — en todas las vistas |
| `last_activity_at` | string \| null | Sí — usado para detectar oportunidades dormidas |
| `estimated_value` | number \| null | Sí |
| `probability` | number \| null | Sí — en detalle |
| `human_score` | number \| null | Sí — en tarjetas; copy era "Potencial N" sin contexto |
| `commercial_risk` | RiskLevel \| null | Sí |
| `detected_need` | string \| null | Sí |
| `suggested_product` | string \| null | Sí |
| `ai_score` | number \| null | **No** — existe pero no se visualiza |
| `risk_notes` | string \| null | **No** — existe pero no se visualiza |

### Contact
| Campo | Tipo | Uso actual en UI |
|-------|------|-----------------|
| `next_action` | string \| null | Sí — editable en detalle |
| `next_action_date` | string \| null | Sí — editable en detalle, visible en lista |
| `interest_level` | InterestLevel \| null | Sí — en EntitySummary y Estado comercial |
| `last_interaction_at` | string \| null | Sí — en Estado comercial |
| `status` | ContactStatus | Sí |
| `detected_need` | string \| null | Sí |

### Company
| Campo | Tipo | Uso actual en UI |
|-------|------|-----------------|
| `commercial_angle` | string \| null | Sí — en Inteligencia comercial |
| `opportunity_detected` | string \| null | Sí — en Inteligencia comercial |
| `ideal_contact` | string \| null | Sí — en Inteligencia comercial |
| `b2b_score` | number \| null | Sí — barra de progreso |
| `b2b_status` | CompanyB2BStatus | Sí |
| `risk_notes` | string \| null | Sí — card condicional |
| `ai_analysis` | Json \| null | **No** — existe pero no se visualiza |

### Activity (actividades de agenda)
| Campo | Tipo | Uso actual en UI |
|-------|------|-----------------|
| `scheduled_at` | string \| null | Sí — en "Agenda de hoy" (asesor) |
| `is_completed` | boolean | Sí — filtro de query |
| `outcome` | string \| null | **No** — existe pero no se visualiza |
| `duration_minutes` | number \| null | **No** — existe pero no se visualiza |

---

## 2. Diagnóstico por pantalla (antes de FASE 12I)

### /app/hoy — Asesor

| Dato | Problema | Mejora FASE 12I |
|------|----------|-----------------|
| Seguimientos vencidos | Card ya existe pero no hay resumen de urgencia al inicio | Añadir "Qué atender hoy" con pills clickeables |
| Próximas acciones | Card ya existe, sin distinción de prioridad | Incluir en la sección de urgencia |
| Oportunidades sin actividad | Card condicional (solo aparece si hay datos) | Incorporar en resumen de urgencia |
| Campañas activas | Card ya existe | Añadir pill en resumen |
| Orientación al usuario vacío | GettingStartedCard solo cuando isEmpty | Mejorar empty state en sección de urgencia |

### /app/hoy — Dirección

| Dato | Problema | Mejora FASE 12I |
|------|----------|-----------------|
| Seguimientos vencidos globales | Card existe pero sin destacar urgencia | Añadir sección "Alertas del equipo" |
| Oportunidades abandonadas | Card condicional, muy al fondo | Incluir en alertas con pill visible |

### /app/empresas/[id]

| Dato | Problema | Mejora FASE 12I |
|------|----------|-----------------|
| Próximo paso de oportunidad activa | `next_action` de oportunidades cargado pero no visible en detalle de empresa | Añadir banner con próximo paso de opp activa |
| Próximo paso sugerido (B2B scoring) | Aparece en EntitySummary y en card de Inteligencia B2B | Se complementa con paso de oportunidad real |
| Contacto principal | Contactos listados pero sin destacar el más relevante | Pendiente — requeriría lógica adicional |

### /app/contactos/[id]

| Dato | Problema | Mejora FASE 12I |
|------|----------|-----------------|
| Próxima acción | Card "Próxima acción" ya existe pero nombre poco operativo | Renombrar a "Acción del asesor" |
| Estado cuando no hay acción | Sin mensaje de orientación cuando next_action es null | Añadir empty state "Definí una próxima acción..." |
| Vista actual del próximo paso | Solo campos de edición, no muestra el valor guardado con énfasis | Añadir resumen visual antes de los inputs |

### /app/oportunidades/[id]

| Dato | Problema | Mejora FASE 12I |
|------|----------|-----------------|
| Próxima acción | Card "Próxima acción" ya existe pero nombre no refleja seguimiento | Renombrar a "Seguimiento" |
| Estado cuando no hay paso | Sin mensaje de orientación cuando next_action es null | Añadir empty state |
| next_action_date | Visible en card pero sin énfasis visual | Mejorar con resumen previo a los inputs |

### /app/oportunidades (pipeline)

| Dato | Problema | Mejora FASE 12I |
|------|----------|-----------------|
| next_action | Ya visible en tarjeta y en lista | OK |
| next_action_date | **No visible en tarjetas de pipeline** | Añadir debajo de next_action |
| human_score copy | "Potencial N" — ambiguo sin contexto | Cambiar a "Potencial comercial N" |

---

## 3. Mejoras implementadas en FASE 12I

### /app/hoy — Asesor
- **Sección "Qué atender hoy"**: pills clickeables con contadores de seguimientos vencidos, oportunidades sin actividad, próximas acciones, campañas activas. Links directos a cada sección.
- **Empty state**: si todo está al día → "Todo al día. Sin seguimientos pendientes."
- **Sin datos**: si no hay nada cargado → orientación hacia /app/oportunidades

### /app/hoy — Dirección
- **Sección "Alertas del equipo"**: pills con globalOverdue y abandonedOpps. Solo visible cuando hay alertas.

### /app/empresas/[id]
- **Banner "Próximo paso — oportunidad activa"**: muestra el `next_action` de la primera oportunidad activa con próximo paso definido. Incluye fecha y link a la oportunidad.
- Solo aparece cuando hay una oportunidad activa con next_action cargado.

### /app/contactos/[id]
- **Renombrar** "Próxima acción" → "Acción del asesor"
- **Resumen visual** del próximo paso guardado antes de los inputs de edición
- **Empty state** cuando no hay acción definida

### /app/oportunidades/[id]
- **Renombrar** "Próxima acción" → "Seguimiento"
- **Resumen visual** del próximo paso guardado
- **Empty state** "Esta oportunidad todavía no tiene próximo paso definido."

### /app/oportunidades (pipeline)
- **next_action_date** visible en tarjetas de pipeline (OppCard)
- **next_action_date** visible en vista de lista
- **Copy fix**: "Potencial N" → "Potencial comercial N"

---

## 4. Pendiente por falta de schema / datos

| Pendiente | Motivo | Solución futura |
|-----------|--------|-----------------|
| "Contacto principal" en empresa | No hay campo `primary_contact_id` en companies | Agregar campo FK en schema |
| Historial de seguimientos | `outcome` de Activity no se muestra en UI | Agregar sección en timeline |
| Próximo paso auto-sugerido por IA | `ai_analysis` existe pero no se usa en detalle de empresa | Integrar en FASE 13 con IA |
| Duración de actividades | `duration_minutes` existe pero no se visualiza | Agregar en timeline si es relevante |
| Filtro de pipeline por fecha de seguimiento | No hay filtro por next_action_date en pipeline | Agregar dropdown de filtro |

---

## 5. Riesgo técnico

| Cambio | Riesgo | Mitigación |
|--------|--------|------------|
| Sección "Qué atender hoy" | Bajo — usa datos ya cargados en los props | Sin queries nuevas |
| Banner próximo paso en empresa | Bajo — usa array `opportunities` ya en props | Filtro con .find() en cliente |
| Rename de cards | Cero — solo copy | Test E2E desacoplado del copy de estas cards |
| next_action_date en pipeline | Bajo — campo ya en la query de oportunidades | Sin cambio de query |
| Formato de fechas en pipeline | Bajo — agrega import de formatDate | Función ya existe en utils.ts |
