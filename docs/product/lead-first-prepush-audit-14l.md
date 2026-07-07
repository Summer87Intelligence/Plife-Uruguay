# FASE 14L — Auditoría integral Lead-first antes de push

**Fecha:** 2026-07-07
**Rama:** `feat/operational-readiness`
**Alcance:** revisión de release / QA / seguridad de todo lo implementado (FASE 14A → 14K) antes de publicar la rama feature.
**Roles de la auditoría:** Release Manager + Senior QA Lead + Security Reviewer.
**Restricciones respetadas:** no push · no merge · no producción · no Vercel · no `.env` · no SQL nuevo · no features nuevas · no conversión real · no soft-delete · no drag/drop.

---

## 1. Resumen ejecutivo

La rama `feat/operational-readiness` tiene **17 commits locales sin push** que implementan el modelo **Lead-first** (tabla `leads`, pipeline, PLIFE Hoy) de forma **aditiva** y **acotada a entorno dev**.

- Working tree **limpio**, sin `.claude/settings.local.json` ni ruido local.
- **Sin secretos reales** en el diff. `.env*` y `vercel.json` **sin cambios**.
- Todas las mutaciones reales (crear lead, update operativo) pasan por **server actions** (`'use server'`) con `createClient` de servidor (respeta RLS del usuario autenticado). **Sin service role** en la app.
- Conversión a oportunidad, descarte/soft-delete y drag/drop siguen **mock/deshabilitados** en la UI, según lo esperado.
- QA automatizada **verde**: `type-check` PASS, `build` PASS (23 rutas), `test:unit` 97/97 PASS.
- Producción y Vercel **no fueron tocados**. Schema aplicado **solo en dev** (`plife-crm`, ref `ayvnloxijnfnooaefrlm`).

**Recomendación:** **GO para push de la rama feature** (`feat/operational-readiness` → `origin`). **NO-GO para merge a `main` / producción** hasta cerrar los riesgos pendientes de la sección 9.

---

## 2. Commits locales incluidos (17)

`git log --oneline origin/feat/operational-readiness..HEAD`

| # | Hash | Mensaje | Clasificación |
|---|---|---|---|
| 1 | `5005186` | docs: define lead-first CRM model | docs |
| 2 | `27223aa` | docs: align user guide with lead-first roadmap | docs |
| 3 | `844b805` | docs: design lead pipeline technical model | docs |
| 4 | `b959e4b` | docs: draft lead schema | docs |
| 5 | `d842642` | feat: add lead pipeline domain helpers | domain helpers |
| 6 | `018ca19` | feat: add mock leads and pipeline UI | UI mock |
| 7 | `b4e97a6` | feat: add mock lead creation form | UI mock |
| 8 | `b8126ae` | fix: stabilize button asChild rendering | fix |
| 9 | `0a17842` | feat: add mock lead detail workspace | UI mock |
| 10 | `a54ff69` | docs: preflight lead schema | docs |
| 11 | `2708d50` | docs: record lead schema dev application | docs / SQL dev |
| 12 | `757f408` | fix: allow lead soft delete under RLS | schema/RLS dev (SQL) |
| 13 | `a0a599c` | feat: connect leads read-only dev data | read-only real |
| 14 | `5b32ee8` | test: seed dev leads for read-only validation | SQL dev (seed) |
| 15 | `d90b521` | feat: enable real lead creation in dev | create real |
| 16 | `78b8558` | feat: enable basic lead operational updates | update real |
| 17 | `e1c64ff` | feat: surface lead focus on PLIFE Hoy | PLIFE Hoy |

**Higiene de commits:**
- Historia limpia y coherente con el roadmap 14A→14K.
- No hay commits con archivos temporales, secretos, binarios ni ruido local.
- Responsabilidades bien separadas por commit; no se requiere reescritura de historia.

---

## 3. Archivos cambiados por área

`git diff --name-status origin/feat/operational-readiness..HEAD` → **57 archivos, +6088 / -7**. Todo dentro de scope permitido.

### Dominio (`src/domains/leads/`) — nuevos
`actions.ts`, `constants.ts`, `conversion.ts`, `dashboard.ts`, `follow-up.ts`, `index.ts`, `mock-data.ts`, `pipeline.ts`, `queries.ts`, `types.ts`, `validation.ts`

### Componentes (`src/components/leads/`) — nuevos
`lead-actions-panel.tsx`, `lead-ai-assistant-mock.tsx`, `lead-card.tsx`, `lead-compliance-mock.tsx`, `lead-create-form.tsx`, `lead-detail-header.tsx`, `lead-detail-summary.tsx`, `lead-detail-view.tsx`, `lead-follow-up-summary.tsx`, `lead-list.tsx`, `lead-next-action-panel.tsx`, `lead-operational-edit-form.tsx`, `lead-pipeline-board.tsx`, `lead-priority-badge.tsx`, `lead-status-badge.tsx`, `lead-temperature-badge.tsx`, `lead-timeline-mock.tsx`, `lead-today-panel.tsx`

### Rutas (`src/app/app/`)
- Nuevas: `leads/page.tsx`, `leads/new/page.tsx`, `leads/[leadId]/page.tsx`, `pipeline/page.tsx`
- Modificadas: `hoy/page.tsx`, `hoy/advisor-dashboard.tsx`, `hoy/direction-dashboard.tsx`

### UI / infra en scope (modificadas)
- `src/components/ui/button.tsx` — fix `asChild` disabled/loading (permitido)
- `src/components/layout/app-sidebar.tsx` — items de nav Leads + Pipeline
- `src/types/database.ts` — interfaz `Lead`, tabla `leads`, `opportunities.lead_id` (aditivo)

### SQL dev (`supabase/`) — nuevos
`leads-schema-draft.sql`, `leads-rls-soft-delete-fix-14gb.sql`, `leads-dev-seed-14hb.sql`

### Documentación (`docs/product/`, `docs/user-guide/`)
- Nuevas: `lead-pipeline-concept-redesign.md`, `lead-pipeline-technical-design.md`, `leads-create-action-14i.md`, `leads-dev-schema-state-14h.md`, `leads-dev-seed-readonly-14hb.md`, `leads-operational-update-14j.md`, `leads-rls-soft-delete-fix-14gb.md`, `leads-schema-apply-dev-14g.md`, `leads-schema-apply-guide.md`, `leads-schema-preflight-14g0.md`, `leads-today-panel-14k.md`
- Modificadas: `pr-13-operational-readiness.md`, `plife-growth-os-glossary.md`, `plife-growth-os-user-manual.md`

### Tests
- `tests/unit/leads.test.ts` — nuevo

**Fuera de scope detectado:** ninguno.

---

## 4. Estado Supabase dev

- Proyecto: **`plife-crm`**, ref **`ayvnloxijnfnooaefrlm`** (dev).
- Tabla `public.leads`: aplicada (aditiva, 31 columnas). CHECK constraints sobre TEXT (patrón del proyecto).
- `opportunities.lead_id UUID NULL REFERENCES leads(id) ON DELETE SET NULL`: **nullable**, aditivo, sin migración de datos.
- RLS habilitada con políticas documentadas:
  - `leads_select`: `deleted_at IS NULL` + (admin/dirección | asignado propio | creado propio | líder de equipo vía `is_in_my_team`).
  - `leads_insert`: `created_by = auth.uid()` y (`assigned_to = auth.uid()` | admin/dirección).
  - `leads_update`: admin/dirección | asignado propio | creado propio (USING + WITH CHECK).
- **DELETE físico bloqueado**: sin política DELETE y sin `GRANT DELETE`. GRANT solo `SELECT, INSERT, UPDATE` a `authenticated`.
- `leads-schema-draft.sql` marcado **DRAFT / NO EJECUTAR en remoto sin autorización**; precondición aborta si faltan helpers de rol.
- `leads-rls-soft-delete-fix-14gb.sql`: patch **dev** que ajusta `leads_update` para permitir soft-delete de filas propias a nivel DB (SELECT sigue ocultando `deleted_at IS NOT NULL`).
- `leads-dev-seed-14hb.sql`: **DEV ONLY**, "Do not apply to production", usa `auth.uid()` para `assigned_to`/`created_by`, datos claramente demo ("Lead Demo Dev … 14HB"), **sin datos reales de personas**.

---

## 5. Estado producción / Vercel

- **Producción: no tocada.** No hay SQL aplicado a producción; los scripts están marcados dev/draft.
- **Vercel: no tocado.** `vercel.json` sin cambios en el diff.
- Ningún cambio en configuración de despliegue, dominios ni variables de entorno.

---

## 6. Seguridad / secretos

- Búsqueda de `service_role | SUPABASE_SERVICE | SUPABASE_ACCESS_TOKEN | E2E_USER_PASSWORD | password | secret | api_key | apikey | anon | token`:
  - En código de `leads` y SQL del diff: **sin coincidencias con valores reales**.
  - Coincidencias existentes están en archivos **fuera de este diff** (`ai-engine-*.sql`, `security-audit.sql`, `fix-app-grants.sql`) y son solo **nombres de rol en comentarios** (documentación), no secretos.
- `git diff … -- .env .env.local .env.test .env.production vercel.json` → **vacío**.
- App usa exclusivamente `createClient` de `@/lib/supabase/server` (cliente de servidor con auth de usuario). **No hay uso de service role / SECURITY DEFINER bypass desde la app.**
- **Secretos reales encontrados: NO.**

---

## 7. Funcionalidad validada (revisión de código + build)

| Capacidad | Estado | Evidencia |
|---|---|---|
| `/app/leads` lee leads reales | OK | `getLeads()` → Supabase dev, read-only, `deleted_at IS NULL` |
| `/app/leads/new` crea lead real | OK | `LeadCreateForm` → `createLeadAction` (server action, valida auth + zod `.strict()`) |
| `/app/leads/[id]` lee detalle real | OK | `getLeadById()` read-only, maneja no-encontrado/RLS |
| Detalle permite update operativo | OK | `LeadOperationalEditForm` → `updateLeadOperationalAction` (solo campos operativos) |
| `/app/pipeline` muestra leads reales | OK | `getLeads()` agrupado por etapa |
| `/app/hoy` muestra Foco de leads | OK | `LeadTodayPanel` inyectado en advisor + direction dashboards |
| Conversión a oportunidad | **Mock** | Botón `disabled`, `conversion.ts` solo evalúa elegibilidad |
| Descarte / soft-delete en UI | **Mock** | Acción "Descartar lead" `disabled` en `lead-actions-panel` |
| Drag & drop pipeline | **No existe** | `lead-pipeline-board.tsx` sin handlers DnD |
| Motor IA / Compliance | **Sin APIs externas nuevas** | Paneles `*-mock.tsx`, sin llamadas externas |

**Salvaguardas verificadas:**
- `updateLeadOperationalSchema` con `.strict()` rechaza `status`, `deleted_at`, `assigned_to`, `converted_at`, etc.
- `updateLeadOperationalAction` filtra `.is('deleted_at', null)` y valida cantidad de filas afectadas.
- Etapas terminales (convertido/descartado) bloquean el form de edición.
- Ninguna operación de DELETE en el código de la app.

---

## 8. QA ejecutada

| Comando | Resultado |
|---|---|
| `npm run type-check` (`tsc --noEmit`) | **PASS** (exit 0) |
| `npm run build` (`next build`) | **PASS** (exit 0, 23 rutas compiladas, incluidas `/app/leads`, `/app/leads/new`, `/app/leads/[leadId]`, `/app/pipeline`, `/app/hoy`) |
| `npm run test:unit` (`vitest run`) | **PASS** — 7 archivos, **97/97 tests** |

**Smoke autenticado dev (interactivo):** **pendiente / manual.** No ejecutado en esta auditoría por no disponer de credenciales de sesión dev y por la restricción de no modificar `.env`. El `build` valida la compilación y el SSR de todas las rutas del checklist; se recomienda un pase manual autenticado antes del merge a `main` con foco en: no crashes, sidebar OK, alta real de lead OK, update operativo OK, ausencia de soft-delete/conversión real, y verificación de red (mutaciones solo vía server action, 0 DELETE directo a `/rest/v1/leads`).

---

## 9. Riesgos pendientes

1. **Soft-delete authenticated: NO-GO.** El patch 14G-B habilita soft-delete de filas propias a nivel RLS en dev, pero la UI no lo expone y no está validado como feature. No conectar hasta decisión explícita.
2. **Conversión real lead → oportunidad: pendiente.** Solo hay helpers de elegibilidad; la creación de oportunidad no está implementada.
3. **Drag & drop de pipeline: pendiente.** El tablero es read-only.
4. **Tipos Supabase regenerados manualmente.** `src/types/database.ts` se editó a mano por falta de `SUPABASE_ACCESS_TOKEN`; regenerar con CLI autenticado cuando haya token.
5. **Schema aplicado solo en dev, no en producción.** La aplicación a producción requiere seguir `leads-schema-apply-guide.md` con autorización explícita.
6. **Inconsistencia menor de copy — RESUELTO en FASE 14L-B.** `/app/leads` mostraba badge "Mock" y texto "Creación y acciones siguen en modo mock" pese a la creación real (14I). Corregido: badge "Dev", aviso "Creación real habilitada en Supabase dev. Conversión, descarte y movimientos de pipeline siguen deshabilitados." Sin cambios de lógica.
7. **Feature no lista para `main`/producción.** El conjunto es coherente como rama feature en progreso, no como release productivo.
8. **Smoke autenticado interactivo pendiente** (ver sección 8).

---

## 10. Recomendación final

### GO / NO-GO

- **Push de la rama feature `feat/operational-readiness`: GO.**
  - Working tree limpio, sin secretos, sin cambios en `.env`/Vercel/producción, QA automatizada verde, cambios acotados a scope y a dev.
- **Merge a `main` / despliegue a producción: NO-GO** hasta:
  - cerrar conversión real, decisión sobre soft-delete y drag/drop;
  - regenerar tipos con CLI autenticado;
  - aplicar schema a producción con autorización y guía;
  - completar smoke autenticado interactivo.
  - ~~corregir copy "Mock" de `/app/leads`~~ (resuelto en FASE 14L-B).

> Esta auditoría no ejecutó push, merge, cambios en producción, Vercel, `.env` ni SQL nuevo. No se usó service role.
