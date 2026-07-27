# Notas de versión — PLIFE Growth OS

> **Histórico (FASE 15B):** OpenAI fue removido del proyecto. Las menciones a OpenAI / GPT / `OPENAI_API_KEY` son registro histórico; los motores operan en modo determinístico interno.

Historial de cambios relevantes para usuarios, administración y QA.

---

## Bloque 1 — Alineación MAPFRE Vida y saneamiento del mockup

**Fecha:** 2026-07-27
**Tipo:** corrección de modelo de negocio (regla funcional aprobada, no feature nueva)

### Objetivo

Dos auditorías previas (`docs/audits/PLIFE-COBERTURA-FUNCIONAL-PRODUCTOS-OPORTUNIDADES-POLIZAS.md` y una auditoría 360°) encontraron que el mockup modelaba una corredora B2B multi-aseguradora (BSE, Porto Seguro, Mapfre, SURA, Zurich, HDI) y multi-ramo (8 ramos), cuando el negocio real de Plife es agente exclusivo de **MAPFRE Vida**. El Bloque 1 saneó el mockup para reflejar esa regla, sin abordar todavía catálogo completo de productos, beneficiarios, capital asegurado ni motores inteligentes avanzados.

### Qué cambió

- Regla de negocio centralizada en `src/lib/business-config.ts` (`PLIFE_BUSINESS_CONFIG`): aseguradora única Mapfre, ramo único Vida — única fuente de verdad, sin strings repetidos.
- Universo demo de pólizas reconstruido de cero: de ~785 pólizas generadas por empresa/tier/sector a **26 pólizas** chicas y escritas a mano, con **titular persona física** (antes el titular era una empresa), origen (cartera heredada / originada en el CRM), frecuencia de pago y calidad de datos (completo/incompleto, sin inventar valores faltantes).
- `ramoParaSector()` simplificado a devolver siempre "Vida" — corrigió en cascada Leads y Oportunidades, que antes mostraban interés/título en ramos no-vida.
- Dashboard de Dirección: se eliminaron los indicadores "Cartera por aseguradora", "Pólizas por ramo" y la alerta de "concentración en BSE" (ya no aplicables con una sola aseguradora); se agregaron "Pólizas por estado", "Pólizas por origen" y "Calidad de datos de la cartera".
- Filtros y formulario de alta de póliza: se sacaron los selectores de aseguradora/ramo (ya no hay opciones que elegir) y se fijaron como valores no editables (Mapfre / Vida).
- Ficha de póliza: titular reemplaza a "Empresa", se agregó Origen y nota de datos faltantes cuando el registro está incompleto.

### Qué pantallas toca

`/app/polizas` (listado, ficha, renovaciones, documentación pendiente, configuración), `/app/direccion`, `/app/hoy`, y en cascada `/app/leads`, `/app/pipeline`, `/app/oportunidades` (dejan de mostrar ramos no-vida).

### Validaciones realizadas

| Check | Resultado |
|-------|-----------|
| `npm run type-check` | OK |
| `npm run build` | OK — 28 rutas compiladas |
| `npm run test:unit` | 286/287 — el único fallo es preexistente y no relacionado (`ui-anti-demo.test.ts`, sidebar/demo tour) |
| Playwright MCP (Pólizas, Dirección, Hoy, Oportunidades, Leads, Demo) | OK — sin aseguradora ni ramo fuera de Mapfre/Vida en ningún dato visible; conteos consistentes entre pantallas |

### Estado final

**Bloque 1 cerrado.** Todos los pendientes detectados eran no bloqueantes y quedaron diferidos (ver `product-backlog.md`, sección "Bloque 2 — Catálogo maestro de productos").

### Pendientes diferidos al Bloque 2

- Deshabilitar alta manual de aseguradora/ramo en el `CatalogManager` de Admin/Configuración cuando el negocio es mono-aseguradora.
- Test preexistente roto en `ui-anti-demo.test.ts` (sidebar/demo tour) — no relacionado a este bloque, pertenece a otro frente de trabajo.

---

## FASE 12D + 12E — UX operativo y navegación práctica

**Fecha:** 2026-07-01  
**Tipo:** mejora de experiencia (sin features grandes nuevas)

### Qué cambió

**FASE 12D — UX operativo**

- Formularios más claros: labels en lenguaje comercial, campos obligatorios visibles, botón Cancelar.
- Panel de éxito después de crear empresa, contacto, oportunidad y campaña con “siguiente paso recomendado”.
- Mejoras de copy en títulos, subtítulos, empty states y placeholders.
- Consistencia de botones principales (Nueva empresa, Nuevo contacto, etc.).
- Contactos: selector de empresa asociada en el formulario de lista.
- Auditoría documentada en `docs/product/ux-audit.md`.

**FASE 12E — Navegación práctica**

- Bloque **Acciones rápidas** en detalle de empresa, contacto, oportunidad y campaña.
- Resumen superior en detalles (nombre, etapa, potencial, próximo paso, etc.).
- Breadcrumb simple y **Volver a …** con texto claro.
- Búsquedas mejoradas con placeholders orientados al negocio y mensaje unificado sin resultados.
- Filtros con labels más simples (Estado comercial, Potencial, Perfil de cliente, etc.).
- Navegación post-creación vía query params (`?nuevo=1&empresa=`, `?contacto=`, `?q=`).
- Auditoría documentada en `docs/product/navigation-audit.md`.

### Qué problema resuelve

- Usuarios nuevos no sabían qué hacer después de crear un registro.
- Navegación entre empresa, contacto y oportunidad requería muchos clics.
- Jerga técnica (Score B2B, ICP, Targets) dificultaba el uso diario.
- Búsquedas y empty states poco orientadores.

### Qué pantallas toca

| Área | Archivos / rutas |
|------|------------------|
| Empresas | `/app/empresas`, detalle empresa |
| Contactos | `/app/contactos`, detalle contacto |
| Oportunidades | `/app/oportunidades`, detalle oportunidad |
| Campañas | `/app/campanas`, detalle campaña |
| Radar B2B | `/app/radar-b2b` |
| Hoy | `/app/hoy` |
| Compliance, Copiloto, Conocimiento, Dirección | copy y empty states |

Componentes nuevos: `create-success-panel`, `simple-breadcrumb`, `quick-actions`, `entity-summary`, `detail-back-link`, `search-no-results`, `industry-labels`.

### Qué queda pendiente

- GettingStartedCard en Dirección con métricas en cero.
- Unificar “Crear empresa” vs “Nueva empresa” en onboarding.
- Copiloto con flujo alternativo sin OpenAI.
- Links desde Compliance trazabilidad a entidades comerciales.
- Validación Playwright completa antes de push.
- Ver [known-issues.md](./known-issues.md).

### Estado QA

| Check | Resultado |
|-------|-----------|
| `npm run type-check` | OK |
| `npm run build` | OK |
| `npm run test:unit` | OK — 24/24 tests |
| Playwright (suite E2E + visual manual) | **Pendiente** — validación con Claude antes de push |

No se reportan resultados de Playwright en esta entrada hasta completar esa validación.

---

## FASE 12F — Documentación operativa

**Fecha:** 2026-07-01  

- Manual de usuario, checklist de administración, QA pre-demo, pendientes conocidos y estas notas de versión.
- Sin cambios en código de `src/`.

---

*Próximas entradas: agregar al inicio de este archivo con fecha y fase.*
