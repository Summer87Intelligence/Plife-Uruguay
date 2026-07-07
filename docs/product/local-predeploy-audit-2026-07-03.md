# Local Pre-Deploy Audit — PLIFE Growth OS

**Fecha:** 2026-07-03  
**Fase:** 13G — Auditoría integral pre-push / pre-deploy  
**Branch:** `main`  
**Estado:** 8 commits ahead de `origin/main` (sin push)

---

## Resumen ejecutivo

Los 8 commits locales acumulados (fases 13A–13F) son **coherentes con el alcance acordado**: documentación de producto, guías operativas in-app, centro de seguimiento comercial, open access interno temporal, anti-duplicados no bloqueantes, y campañas operativas sin métricas inventadas.

**QA local:** type-check, build y 42 unit tests **PASS**. Smoke manual de 10 rutas críticas **PASS** (sin crash, sin errores de consola críticos).

**Recomendación:** **OK para seguir trabajando en local.** **OK para preparar PR más adelante** cuando Andrés autorice. **NO push todavía.**

---

## Commits revisados

| Hash | Mensaje | Fase asociada |
|------|---------|---------------|
| `b02ddbb` | docs: record PLIFE AI engine production release | Release notes / docs |
| `ad1f948` | ux: add in-app operational guidance | 13A |
| `8d49f80` | ux: polish in-app operational guidance | 13B |
| `74ac1db` | docs: define PLIFE operational flow | 13C (docs) |
| `bd4e777` | ux: add commercial follow-up center | 13C (seguimiento) |
| `605a6b6` | ux: enable internal open access navigation | 13D |
| `8e3098d` | ux: add duplicate warnings for companies and contacts | 13E |
| `390e17b` | ux: improve campaign operational flow | 13F |

**Diff acumulado:** 46 archivos, +4241 / −130 líneas vs `origin/main`.

---

## Archivos principales por área

### 1. Docs (10 archivos)

- `docs/product/release-2026-07-02-plife-ai-engine.md`
- `docs/product/in-app-operational-guidance-audit.md`
- `docs/product/plife-operational-flow-map.md`
- `docs/product/plife-operational-rules.md`
- `docs/product/plife-user-journeys.md`
- `docs/product/plife-next-product-gaps.md`
- `docs/product/follow-up-center-audit.md`
- `docs/product/internal-open-access-mode-audit.md`
- `docs/product/duplicate-prevention-audit.md`
- `docs/product/campaign-operational-audit.md`

### 2. Guías operativas (componente + integraciones)

- `src/components/guidance/section-guide-card.tsx`
- Integrado en: empresas, contactos, oportunidades, radar-b2b, compliance, ia, campañas (listado previo)

### 3. /app/hoy — seguimiento comercial

- `src/components/follow-up/follow-up-center.tsx`
- `src/app/app/hoy/advisor-dashboard.tsx`
- `src/app/app/hoy/direction-dashboard.tsx`
- `src/app/app/hoy/page.tsx`

### 4. Open access interno

- `src/components/layout/app-sidebar.tsx` — navegación abierta (TEMP)
- `src/app/app/ia/page.tsx`, `admin/page.tsx`, `admin/system/page.tsx`, `direccion/page.tsx` — guards comentados (TEMP)
- `docs/product/internal-open-access-mode-audit.md`

### 5. Anti-duplicados empresa/contacto

- `src/domains/duplicates/*` (normalize, checks, types)
- `src/components/ui/duplicate-warning.tsx`
- `src/domains/companies/actions.ts`, `src/domains/contacts/actions.ts`
- `src/app/app/empresas/company-form.tsx`, `src/app/app/contactos/contact-form.tsx`
- `tests/unit/duplicates.test.ts`

### 6. Campañas operativas

- `src/app/app/campanas/page.tsx`, `campaigns-list.tsx`, `campaign-form.tsx`
- `src/components/campaigns/campaign-operational-guide.tsx`
- `src/lib/campaign-operational.ts`
- `tests/unit/campaign-operational.test.ts`

### 7. Tests unitarios

- `tests/unit/duplicates.test.ts` (12 tests)
- `tests/unit/campaign-operational.test.ts` (6 tests)
- Suite total: **42 tests PASS**

### 8. Otros cambios (dentro de scope UX)

- Detalle oportunidad/contacto/empresa: guías y copy
- `compliance-view.tsx`: copy de revisión humana / MAPFRE
- `pipeline-view.tsx`, `radar-b2b-view.tsx`: guidance menor

---

## Fuera de scope — verificación

| Categoría | ¿Tocado? |
|-----------|----------|
| `.env` / `.env.test` | **No** (solo lectura para E2E) |
| SQL / migraciones | **No** |
| Supabase config | **No** |
| Vercel config | **No** |
| `package.json` / `package-lock` | **No** |
| Auth/RBAC middleware | **No** (middleware intacto) |
| Archivos temporales / basura | **No** en diff |
| Screenshots / playwright-report | **No** en diff |

---

## Auditoría de riesgos

### 1. Open access interno (13D)

| Control | Estado |
|---------|--------|
| Login obligatorio | ✅ Middleware redirige `/app/*` → `/login` sin sesión |
| Solo usuarios autenticados | ✅ `isValidProfile` requerido |
| Navegación abierta | ✅ Sidebar muestra todos los ítems (TEMP, documentado) |
| Rutas sensibles | ⚠️ Páginas admin/dirección/IA **visibles**; guards de página comentados |
| Actions sensibles | ✅ `requireAdmin()` / `canAccessAll()` en server actions IA se mantienen |
| Documentación | ✅ `internal-open-access-mode-audit.md` marca TEMP y pasos de reversión |

**Riesgo aceptado:** exploración interna; revertir antes de producción externa.

### 2. Anti-duplicados (13E)

| Control | Estado |
|---------|--------|
| Sin cambios Supabase schema | ✅ |
| No bloqueo duro | ✅ Devuelve `{ duplicates }` sin insertar |
| “Crear de todos modos” | ✅ Flag `confirmDuplicates: true` |
| Tests unitarios | ✅ 12 tests en `duplicates.test.ts` |
| Smoke visual previo | ✅ PASS (fase 13E) |

### 3. Seguimiento comercial (13C)

| Control | Estado |
|---------|--------|
| No inventa datos | ✅ Usa `next_action_date`, `next_action`, `last_activity_at`, `stage` |
| Campos existentes | ✅ Query oportunidades en `hoy/page.tsx` |
| Advisor dashboard | ✅ `FollowUpCenter` visible |
| Direction dashboard | ✅ Bloque de seguimiento presente |

### 4. Campañas operativas (13F)

| Control | Estado |
|---------|--------|
| No métricas inventadas | ✅ Listado sin grid `total_*`; solo vínculos reales |
| Relaciones reales | ✅ Conteo `companies.campaign_id` / `opportunities.campaign_id` |
| Sin automatizaciones | ✅ Copy explícito en guía y header |
| Smoke previo | ✅ PASS (fase 13F) |

### 5. IA / Compliance

| Mensaje | Estado |
|---------|--------|
| IA es apoyo | ✅ Guías en `/app/ia` |
| Revisión humana | ✅ Compliance: “Siempre revisión humana primero” |
| No primas / coberturas / MAPFRE | ✅ Copy en `compliance-view.tsx` |
| Motor IA config protegida | ✅ Server actions con `requireAdmin()` |

---

## QA ejecutada (2026-07-03)

| Comando | Resultado |
|---------|-----------|
| `npm run type-check` | ✅ PASS |
| `npm run build` | ✅ PASS (20 páginas, sin errores) |
| `npm run test:unit` | ✅ PASS (6 archivos, 42 tests) |
| Playwright suite completa | ⏭️ No ejecutada (deuda E2E_BASE_URL) |

---

## Smoke manual rápido

**Método:** Playwright autenticado contra `http://localhost:3000` (override de `E2E_BASE_URL` en `.env.test` que apunta a `3001`).

| Ruta | Resultado | Notas |
|------|-----------|-------|
| `/app/hoy` | ✅ PASS | Seguimiento comercial visible |
| `/app/empresas` | ✅ PASS | |
| `/app/contactos` | ✅ PASS | |
| `/app/oportunidades` | ✅ PASS | |
| `/app/campanas` | ✅ PASS | Guía operativa + anti-automatización |
| `/app/radar-b2b` | ✅ PASS | |
| `/app/ia` | ✅ PASS | Motor IA carga |
| `/app/compliance` | ✅ PASS | Revisión humana visible |
| `/app/direccion` | ✅ PASS | |
| `/app/admin` | ✅ PASS | |
| Sidebar completo | ✅ PASS* | *Ítems visibles; test estricto falló por link duplicado “Campañas” en contenido (no bug de producto) |

**Consola:** sin errores críticos en las 10 rutas.  
**Dev server:** cerrado al finalizar (puerto 3000 libre).

---

## Riesgos aceptados

1. **Open access interno temporal** — cualquier usuario autenticado navega admin/dirección/IA; acciones de escritura sensibles siguen protegidas en servidor.
2. **Anti-duplicados sin constraint BD** — race conditions y bypass teórico posibles; mitigado con advertencia + confirmación.
3. **Métricas manuales de campaña en detalle** — `total_*` en página de detalle pueden mostrar ceros o seed; listado ya no las promociona.

---

## Deuda técnica pendiente

| Ítem | Prioridad | Nota |
|------|-----------|------|
| `E2E_BASE_URL=http://localhost:3001` en `.env.test` vs dev manual en `3000` | Media | Desajuste documentado; usar override o alinear puerto |
| Registro demo `Clinica Vida Integral` (sin tilde) | Baja | Posible residuo de smoke frío 13E; limpiar manualmente si molesta |
| Revertir open access antes de launch | Alta | Restaurar guards en páginas + filtro sidebar |
| 8 commits sin publicar | Info | Esperar autorización de Andrés para push |
| Métricas campaña sin UI de edición | Media | GAP conocido; no inventar en UI |
| Playwright suite completa no corrida en 13G | Baja | Correr tras alinear E2E_BASE_URL |

---

## Recomendación final

| Decisión | Veredicto |
|----------|-----------|
| ¿Seguir en local? | **Sí** |
| ¿Preparar PR más adelante? | **Sí**, cuando Andrés autorice |
| ¿Push ahora? | **No** |
| ¿Deploy ahora? | **No** |

El producto está **estable para desarrollo local** con los riesgos documentados y acotados. No se detectaron cambios fuera de scope ni regresiones críticas en smoke.

---

*Auditoría realizada sin modificar código de producto. Solo este documento fue agregado.*
