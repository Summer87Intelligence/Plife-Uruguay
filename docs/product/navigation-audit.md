# FASE 12E — Auditoría de navegación entre entidades

**Fecha:** 2026-07-01  
**Alcance:** flujos Empresa ↔ Contacto ↔ Oportunidad ↔ Campaña ↔ Compliance

---

## Empresa → contactos relacionados

| Campo | Detalle |
|---|---|
| **Desde** | `/app/empresas/[id]` |
| **Destino** | Lista de contactos de la empresa o detalle de contacto |
| **¿Existe hoy?** | Parcial — card "Contactos (N)" con links a cada contacto; sin CTA para agregar contacto desde acciones rápidas |
| **Mejora recomendada** | Bloque "Acciones rápidas" con "Agregar contacto"; resumen superior con cantidad de contactos |
| **Prioridad** | Alta |
| **Riesgo técnico** | Bajo |

---

## Empresa → oportunidades relacionadas

| Campo | Detalle |
|---|---|
| **Desde** | `/app/empresas/[id]` |
| **Destino** | Detalle de oportunidad o pipeline filtrado |
| **¿Existe hoy?** | Parcial — card "Oportunidades" con links; botón header "Nueva oportunidad"; sin atajo "Ver oportunidades" |
| **Mejora recomendada** | Acción rápida "Ver oportunidades" (pipeline con búsqueda por nombre de empresa) |
| **Prioridad** | Alta |
| **Riesgo técnico** | Bajo |

---

## Empresa → campaña

| Campo | Detalle |
|---|---|
| **Desde** | `/app/empresas/[id]` |
| **Destino** | `/app/campanas/[id]` |
| **¿Existe hoy?** | Sí — link "Ver campaña" en selector de campaña |
| **Mejora recomendada** | Incluir campaña en resumen superior si está asociada |
| **Prioridad** | Baja |
| **Riesgo técnico** | Bajo |

---

## Contacto → empresa asociada

| Campo | Detalle |
|---|---|
| **Desde** | `/app/contactos/[id]` |
| **Destino** | `/app/empresas/[id]` |
| **¿Existe hoy?** | Sí — link con nombre de empresa en header |
| **Mejora recomendada** | Acción rápida "Ver empresa asociada" visible; breadcrumb Empresas / Empresa / Contacto |
| **Prioridad** | Media |
| **Riesgo técnico** | Bajo |

---

## Contacto → oportunidades relacionadas

| Campo | Detalle |
|---|---|
| **Desde** | `/app/contactos/[id]` |
| **Destino** | Detalle de oportunidad o crear nueva |
| **¿Existe hoy?** | Parcial — card lateral si hay oportunidades; botón "Nueva oportunidad" en header |
| **Mejora recomendada** | Acciones rápidas unificadas; resumen con próxima acción arriba |
| **Prioridad** | Alta |
| **Riesgo técnico** | Bajo |

---

## Oportunidad → empresa

| Campo | Detalle |
|---|---|
| **Desde** | `/app/oportunidades/[id]` |
| **Destino** | `/app/empresas/[id]` |
| **¿Existe hoy?** | Sí — link en header |
| **Mejora recomendada** | Acción rápida dedicada; resumen superior con empresa destacada |
| **Prioridad** | Media |
| **Riesgo técnico** | Bajo |

---

## Oportunidad → contacto

| Campo | Detalle |
|---|---|
| **Desde** | `/app/oportunidades/[id]` |
| **Destino** | `/app/contactos/[id]` |
| **¿Existe hoy?** | Sí — link en header |
| **Mejora recomendada** | Acción rápida "Ver contacto" |
| **Prioridad** | Media |
| **Riesgo técnico** | Bajo |

---

## Oportunidad → campaña

| Campo | Detalle |
|---|---|
| **Desde** | `/app/oportunidades/[id]` |
| **Destino** | `/app/campanas/[id]` |
| **¿Existe hoy?** | Sí — link con ícono Megaphone si `campaign_id` existe |
| **Mejora recomendada** | Incluir en acciones rápidas cuando aplique |
| **Prioridad** | Media |
| **Riesgo técnico** | Bajo |

---

## Oportunidad → pipeline

| Campo | Detalle |
|---|---|
| **Desde** | `/app/oportunidades/[id]` |
| **Destino** | `/app/oportunidades` |
| **¿Existe hoy?** | Parcial — solo botón atrás (ícono) |
| **Mejora recomendada** | "Volver a oportunidades" con texto + "Ir al pipeline" en acciones rápidas |
| **Prioridad** | Alta |
| **Riesgo técnico** | Bajo |

---

## Campaña → oportunidades relacionadas

| Campo | Detalle |
|---|---|
| **Desde** | `/app/campanas/[id]` |
| **Destino** | Detalle de oportunidad o pipeline |
| **¿Existe hoy?** | Parcial — card lateral con links; link "Ver pipeline" genérico |
| **Mejora recomendada** | Acciones rápidas; ancla a oportunidades de la campaña |
| **Prioridad** | Alta |
| **Riesgo técnico** | Bajo |

---

## Campaña → empresas asociadas

| Campo | Detalle |
|---|---|
| **Desde** | `/app/campanas/[id]` |
| **Destino** | `/app/empresas/[id]` o Radar B2B |
| **¿Existe hoy?** | Sí — lista con links; link a Radar B2B |
| **Mejora recomendada** | Mantener; mejorar breadcrumb y volver |
| **Prioridad** | Baja |
| **Riesgo técnico** | Bajo |

---

## Compliance → contexto comercial

| Campo | Detalle |
|---|---|
| **Desde** | `/app/compliance` |
| **Destino** | Entidad comercial (contacto, empresa, oportunidad) |
| **¿Existe hoy?** | Parcial — trazabilidad IA muestra tipo de entidad pero sin link al detalle |
| **Mejora recomendada** | Links desde historial IA a detalle de entidad (pendiente — requiere armar URLs por `contact_id`/`company_id`/etc.) |
| **Prioridad** | Media |
| **Riesgo técnico** | Medio |

---

## Patrones transversales detectados

| Problema | Mejora | Prioridad |
|---|---|---|
| Botón "atrás" solo con ícono, sin texto | "Volver a …" + breadcrumb simple | Alta |
| Sin bloque unificado de acciones rápidas | Card "Acciones rápidas" en detalles | Alta |
| Búsquedas con placeholders genéricos | Placeholders orientados al negocio | Media |
| Sin mensaje unificado de "sin resultados" | Copy estándar + "Limpiar búsqueda" | Media |
| Labels técnicos en filtros (B2B, ICP, Score) | Lenguaje simple en UI | Media |
| Resumen superior disperso en cards | Strip de resumen en primera vista | Alta |

---

## Pendientes (fuera de alcance FASE 12E)

- Links desde Compliance trazabilidad a entidades comerciales
- Filtro dedicado por `company_id` / `campaign_id` en pipeline (hoy se usa búsqueda por texto)
- Breadcrumbs en listas (solo en detalles)
- Navegación contextual post-revisión de compliance con mensaje precargado
