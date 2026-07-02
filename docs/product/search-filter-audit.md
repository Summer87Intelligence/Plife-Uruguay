# Search & Filter Audit — PLIFE Growth OS (FASE 12L)

## Empresas (`companies-list.tsx`)

| Aspecto | Estado actual | Problema | Mejora (12L) | Prioridad | Riesgo técnico |
|---|---|---|---|---|---|
| Placeholder búsqueda | "Buscar por empresa, rubro o ciudad" | ✅ Correcto | — | — | — |
| Botón limpiar búsqueda | Inline dentro del input (hard to see) | Poco visible; inconsistente con otras pantallas | Mover a fila de filtros como botón separado | Media | Bajo |
| Filtro de estado | No existe | Sin forma de filtrar por estado comercial | Agregar filtro "Estado comercial" frontend | Alta | Bajo |
| Label potencial | "Potencial B2B" en lista | Inconsistente con "Potencial comercial" en el resto | → "Potencial comercial" | Media | Bajo |
| Count label | Estático ({N} empresas) | No refleja resultados filtrados | Dinámico: "X de Y empresas" | Media | Bajo |
| Empty state Caso A | "Todavía no cargaste empresas" | Informal; mezcla tuteo y resultado | "Todavía no hay empresas cargadas." | Baja | Bajo |
| Empty state Caso B | "No encontramos resultados…" | ✅ Correcto | — | — | — |

---

## Contactos (`contacts-list.tsx`)

| Aspecto | Estado actual | Problema | Mejora (12L) | Prioridad | Riesgo técnico |
|---|---|---|---|---|---|
| Placeholder búsqueda | "Buscar por nombre, empresa, cargo o email" | ✅ Correcto | — | — | — |
| Filtro estado | "Todos los estados" | ✅ Correcto | — | — | — |
| Filtro interés | "Todos los niveles de interés" | ✅ Correcto | — | — | — |
| Botón limpiar | "Limpiar búsqueda" + "Limpiar filtros" | ✅ Correcto | — | — | — |
| Fila de contacto | Muestra nombre, cargo, empresa, teléfono, fecha | No muestra `next_action` (el paso mismo) | Agregar próxima acción al row | Media | Bajo |
| Empty state Caso A | "Todavía no cargaste contactos" | Informal | "Todavía no hay contactos cargados." | Baja | Bajo |
| Empty state Caso B | "No encontramos resultados…" | ✅ Correcto | — | — | — |

---

## Oportunidades (`pipeline-view.tsx`)

| Aspecto | Estado actual | Problema | Mejora (12L) | Prioridad | Riesgo técnico |
|---|---|---|---|---|---|
| Placeholder búsqueda | "Buscar por empresa, contacto o próxima acción" | "próxima acción" ≠ "próximo paso" que usa el sistema | → "próximo paso" | Baja | Bajo |
| Filtro tipo | "Todos los tipos" | ✅ Correcto | — | — | — |
| Filtro riesgo | "Todos los niveles de riesgo" | ✅ Correcto | — | — | — |
| Botón limpiar | "Limpiar búsqueda" + "Limpiar filtros" | ✅ Correcto | — | — | — |
| Empty state Caso A | "Todavía no hay oportunidades" | ✅ Correcto | — | — | — |
| Empty state Caso B | "No encontramos resultados…" | ✅ Correcto | — | — | — |
| Lista: potencial | No se muestra `human_score` en vista lista | Falta dato de potencial | **Pendiente** — requiere revisar si vale la pena el espacio | Baja | — |

---

## Campañas (`campaigns-list.tsx`)

| Aspecto | Estado actual | Problema | Mejora (12L) | Prioridad | Riesgo técnico |
|---|---|---|---|---|---|
| Placeholder búsqueda | "Buscar por campaña, segmento u objetivo" | ✅ Correcto | — | — | — |
| Filtro estado | "Todos los estados" | ✅ Correcto | — | — | — |
| Botón limpiar | "Limpiar búsqueda" + "Limpiar filtros" | ✅ Correcto | — | — | — |
| Agrupación | Activas / Otras | ✅ Correcto | — | — | — |
| Empty state Caso A | "Todavía no hay campañas" | ✅ Correcto | — | — | — |
| Empty state Caso B | "No encontramos resultados…" | ✅ Correcto | — | — | — |

---

## Radar B2B (`radar-b2b-view.tsx`)

| Aspecto | Estado actual | Problema | Mejora (12L) | Prioridad | Riesgo técnico |
|---|---|---|---|---|---|
| Placeholder búsqueda | "Buscar empresa, rubro o señal comercial" | ✅ Correcto | — | — | — |
| Filtro potencial | "Todo el potencial" | ✅ Correcto | — | — | — |
| Filtro perfil cliente | "Todos los perfiles de cliente" | ✅ Usa término correcto (no "ICP") | — | — | — |
| Filtro estado | "Todos los estados comerciales" | ✅ Correcto | — | — | — |
| Botón limpiar | "Limpiar" (sin especificar qué) | Inconsistente con otras pantallas | → "Limpiar filtros" | Baja | Bajo |
| Empty state Caso A | "El Radar B2B todavía no tiene empresas..." | ✅ Descriptivo | — | — | — |
| Empty state Caso B | "No encontramos resultados…" | ✅ Correcto | — | — | — |

---

## Pendientes sin implementar (requieren cambios de backend/schema)

- Filtro de oportunidades por responsable asignado (no está en el list view, solo en el pipeline)
- Filtro de contactos por empresa (requiere query join)
- Filtro de campañas por fecha de inicio/fin
- Ordenamiento configurable por columna en listas
- Búsqueda por `next_action` en contactos (actualmente busca en `position`, `company`, `email`, `phone`)
- Paginación (actualmente se cargan todos los registros del perfil)
