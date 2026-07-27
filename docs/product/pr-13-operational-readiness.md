# PR — PLIFE Operational Readiness

> **Histórico (FASE 15B):** OpenAI fue removido del proyecto. Las menciones a OpenAI / GPT / `OPENAI_API_KEY` son registro histórico; los motores operan en modo determinístico interno.

**Branch:** `main` (local, sin push)  
**Base:** `origin/main`  
**Fecha de preparación:** 2026-07-03  
**Fases cubiertas:** 13A–13I

---

## Resumen

Esta tanda mejora la **operación diaria** del sistema para que asesores y líderes comerciales puedan trabajar con más claridad, menos fricción y menos riesgo de duplicar datos — sin tocar infraestructura remota ni automatizar contacto con clientes.

En conjunto, los cambios entregan:

- **Guías dentro de la app** — contexto operativo en empresas, contactos, oportunidades, radar, compliance, IA y campañas.
- **Flujo operativo documentado** — reglas, mapas de flujo, journeys y gaps de producto versionados en `docs/product/`.
- **Seguimiento comercial en `/app/hoy`** — centro de seguimiento con oportunidades vencidas, de hoy, sin próximo paso y estancadas.
- **Navegación abierta temporal para testeo interno** — sidebar y rutas admin/dirección/IA visibles para usuarios autenticados; acciones sensibles siguen protegidas en servidor.
- **Anti-duplicados empresa/contacto** — advertencias antes de crear, con opción “Crear de todos modos”; sin migraciones ni UNIQUE en BD.
- **Campañas operativas** — listado orientado a acción (objetivo, vínculos reales, próximo paso, guía de uso); sin métricas inventadas ni promesas de envío automático.
- **Corrección de smoke sidebar** — selector Playwright acotado al nav (`data-testid`) para evitar ambigüedad con links del contenido.

**Alcance total:** 48 archivos, +4511 / −132 líneas vs `origin/main`.

---

## Commits incluidos

| # | Hash | Mensaje |
|---|------|---------|
| 1 | `b02ddbb` | docs: record PLIFE AI engine production release |
| 2 | `ad1f948` | ux: add in-app operational guidance |
| 3 | `8d49f80` | ux: polish in-app operational guidance |
| 4 | `74ac1db` | docs: define PLIFE operational flow |
| 5 | `bd4e777` | ux: add commercial follow-up center |
| 6 | `605a6b6` | ux: enable internal open access navigation |
| 7 | `8e3098d` | ux: add duplicate warnings for companies and contacts |
| 8 | `390e17b` | ux: improve campaign operational flow |
| 9 | `5196e40` | docs: add local predeploy audit |
| 10 | `3b54425` | test: fix sidebar smoke selector |

---

## Cambios principales

### 1. Documentación / release

- `docs/product/release-2026-07-02-plife-ai-engine.md` — release notes Motor IA.
- `docs/product/plife-operational-flow-map.md`, `plife-operational-rules.md`, `plife-user-journeys.md`, `plife-next-product-gaps.md` — flujo y reglas operativas.
- Auditorías por fase: guidance, follow-up, open access, duplicates, campaigns.
- `docs/product/local-predeploy-audit-2026-07-03.md` — auditoría integral pre-push (13G).

### 2. Guías operativas in-app

- `src/components/guidance/section-guide-card.tsx` — componente reutilizable.
- Integrado en empresas, contactos, oportunidades, radar-b2b, compliance, ia y copy relacionado.

### 3. Seguimiento comercial

- `src/components/follow-up/follow-up-center.tsx` — vencidas, hoy, sin próximo paso, estancadas.
- `src/app/app/hoy/page.tsx`, `advisor-dashboard.tsx`, `direction-dashboard.tsx` — datos y UI en ambos dashboards.

### 4. Open access interno temporal

- `src/components/layout/app-sidebar.tsx` — todos los ítems visibles (TEMP).
- Guards de página comentados en `ia/page.tsx`, `admin/page.tsx`, `admin/system/page.tsx`, `direccion/page.tsx`.
- Documentado en `internal-open-access-mode-audit.md` con pasos de reversión.

### 5. Anti-duplicados

- `src/domains/duplicates/*` — normalización y detección.
- `src/components/ui/duplicate-warning.tsx` — panel de advertencia.
- `src/domains/companies/actions.ts`, `contacts/actions.ts` + formularios.
- `tests/unit/duplicates.test.ts` (12 tests).

### 6. Campañas operativas

- `src/app/app/campanas/*` — listado operativo, conteos reales de vínculos.
- `src/components/campaigns/campaign-operational-guide.tsx`, `src/lib/campaign-operational.ts`.
- `tests/unit/campaign-operational.test.ts` (6 tests).

### 7. QA / smoke

- `tests/e2e/sidebar-nav.spec.ts` — smoke sidebar 1/1 con `data-testid="app-sidebar-nav"`.
- Smoke manual documentado en auditoría 13G (rutas principales, duplicados, campañas).

---

## QA realizada

| Verificación | Resultado | Fase |
|--------------|-----------|------|
| `npm run type-check` | ✅ PASS | 13G |
| `npm run build` | ✅ PASS | 13G |
| `npm run test:unit` | ✅ 42/42 PASS | 13G |
| Smoke manual rutas principales (10 rutas) | ✅ PASS | 13G |
| Smoke sidebar (`sidebar-nav.spec.ts`) | ✅ 1/1 PASS | 13H |
| Smoke anti-duplicados empresa/contacto | ✅ PASS | 13E |
| Smoke campañas operativas | ✅ PASS | 13F |

**No ejecutado en esta fase:** suite Playwright completa (deuda `E2E_BASE_URL`).

---

## Riesgos aceptados

| Riesgo | Nota |
|--------|------|
| **Open access temporal** | Cualquier usuario autenticado navega admin/dirección/IA; revertir antes de producción externa. |
| **Anti-duplicados sin UNIQUE en BD** | Advertencia + confirmación; race conditions teóricas posibles. |
| **Métricas de campañas no automáticas** | `total_*` en detalle pueden ser 0 o seed; listado ya no las promociona. |
| **E2E_BASE_URL 3001 vs dev 3000** | `.env.test` apunta a 3001; dev manual usa 3000 — alinear antes de CI E2E. |
| **Registro demo residual** | Posible empresa `Clinica Vida Integral` (sin tilde) de smoke frío 13E — limpiar manualmente si molesta. |

---

## No incluido

- Cambios en **Supabase** (schema, migraciones, SQL remoto).
- Cambios en **Vercel** (deploy, config).
- Modificación de **`.env`** / credenciales.
- **OpenAI real** en producción (Motor IA sigue con flujos existentes).
- **WhatsApp / email / scraping** automático.
- **Permisos finales** de RBAC (open access es explícitamente temporal).
- **Deploy** o push a remoto.

---

## Recomendación

| Decisión | Veredicto |
|----------|-----------|
| ¿Seguir en local? | **Sí** |
| ¿Abrir PR cuando Andrés autorice? | **Sí** — este documento sirve como base del cuerpo del PR |
| ¿Push ahora? | **No** |
| ¿Deploy ahora? | **No** |

**Título sugerido del PR:** `feat: operational readiness — guidance, follow-up, duplicates, campaigns`

**Descripción sugerida:** usar las secciones Resumen, Cambios principales, QA realizada y Riesgos aceptados de este documento.

---

*Documento generado en FASE 13I. No modifica código de producto.*

---

## Contexto de roadmap

Este PR mejora la **operación vigente** del modelo Empresa → Contacto → Oportunidad. Su validez no depende del modelo futuro.

En paralelo, **FASE 13L** definió el modelo conceptual Lead-first (`docs/product/lead-pipeline-concept-redesign.md`):

- **Lead** será la entrada general de cualquier posible venta.
- Empresa y Contacto pasarán a ser entidades de datos asociadas al lead, no punto de partida obligatorio.
- **Oportunidad** se mantiene como entidad separada; se crea cuando el lead está calificado.
- Campañas y Radar alimentarán leads.
- Pipeline mostrará el avance de cada lead.

La implementación del modelo Lead-first corresponde a **Fase 14**. Este PR (#2) es una mejora operativa previa, independiente y compatible con esa evolución.
