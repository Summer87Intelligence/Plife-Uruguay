# Notas de versión — PLIFE Growth OS

> **Histórico (FASE 15B):** OpenAI fue removido del proyecto. Las menciones a OpenAI / GPT / `OPENAI_API_KEY` son registro histórico; los motores operan en modo determinístico interno.

Historial de cambios relevantes para usuarios, administración y QA.

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
