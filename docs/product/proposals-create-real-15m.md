# FASE 15M — Crear propuesta real desde la UI

**Fecha:** 2026-07-08
**Rama:** `feat/lead-first-crm` (PR #3, draft, NO-GO para main)
**Modelo:** Opus 4.8
**Roles:** Senior Product Engineer + Supabase RLS Specialist + QA Lead
**Estado:** Implementado en dev. Sin push · sin producción · sin Vercel · sin `.env`.

---

## 1. Objetivo

`/app/propuestas/nueva` ya generaba un borrador determinístico (mock, FASE 15E/15F) sin
persistir. FASE 15M agrega la **escritura real** en `public.proposals` (tabla aplicada en dev
en FASE 15L), conservando el flujo mock como paso previo:

1. generar el borrador determinístico (igual que hoy),
2. permitir **guardarlo** en `public.proposals`,
3. persistir input + `draft` JSONB + campos denormalizados,
4. conservar contexto de origen (`source`, `source_id`, `source_title`, `source_context`),
5. guardar snapshots de score/calificación si viene desde un lead,
6. mostrar confirmación con link al listado.

## 2. Server action creada

`src/app/app/propuestas/actions.ts` → `createProposalAction(input)`:

- Usa el **Supabase server client** con cookies/session (`@/lib/supabase/server`). **No** service role.
- Valida con Zod (`CreateProposalInputSchema`, `.strict()`): **no confía en el cliente**. Los campos
  derivados (`lead_id`, `campaign_id`, snapshots, denormalizaciones) se calculan en el servidor,
  no se aceptan del payload.
- Si `source === 'lead'` y `source_id` es UUID, lee el lead con `getLeadById` (RLS del usuario) y
  congela `score_snapshot` + `qualification_snapshot`. Si el lead no es visible, **no rompe**: guarda
  la propuesta sin snapshot (warning controlado, `leadSnapshot: false`).
- Inserta con `buildProposalInsertRow` y `revalidatePath('/app/propuestas')`.

## 3. Validación y mapper

- `src/domains/proposals/validation.ts` — `CreateProposalInputSchema` (title, context, status?,
  source, target_type, campos de texto opcionales, `draft`). `ProposalDraftSchema` valida la forma
  del borrador. Enums alineados a los CHECK de la tabla. **Sin estado de compliance.**
- `src/domains/proposals/persistence.ts` — funciones **puras y testeables**:
  - `buildProposalInsertRow(data, userId, snapshots)` → fila de insert.
  - `resolveLeadId` / `resolveCampaignId` — FK fuerte solo si el origen coincide **y** `source_id`
    es UUID (`isUuid`). Un `source_id` no-UUID queda solo como rastro textual.
  - `buildLeadScoreSnapshot` / `buildLeadQualificationSnapshot` — snapshots congelados (FASE 15I).

## 4. Flujo UI

`src/components/proposals/proposal-create-form.tsx` (client):

1. el asesor completa el formulario,
2. **Generar borrador** → `generateMockProposal` (local, determinístico, sin red),
3. se muestra el borrador con la leyenda **"Borrador generado · Todavía no está guardado"**,
4. aparece **"Guardar propuesta"** (guardar es un paso explícito, no automático),
5. estados `saving` / `error` / `success`,
6. en éxito: **"Propuesta guardada"** (indica si incluyó snapshot del lead) + link a
   `/app/propuestas`. Fallback claro: se puede **Crear otra** o **Editar / generar otro** sin guardar.

## 5. Campos guardados

`title`, `status` (default `draft`), `source`, `source_id`, `source_title`, `source_context`,
`lead_id` (si source=lead + UUID), `campaign_id` (si source=campaign + UUID), `target_type`,
`target_description`, `context`, `objective`, `known_problem`, `desired_outcome`, `notes`,
`draft` (JSONB, fuente de verdad), denormalizados `summary`/`target_audience`/`problem`/
`opportunity`/`proposed_offer`, `score_snapshot`, `qualification_snapshot`, `metadata`,
`created_by` = `assigned_to` = usuario actual.

**No se guarda:** `opportunity_id`, compliance/legal_review, provider/model externo, `radar_context`
(no usado en este flujo todavía).

## 6. Snapshots desde lead

Congelan el score (FASE 15I) y la calificación sugerida al momento de crear la propuesta, para que
sobrevivan aunque el lead evolucione. Se calculan server-side desde el lead leído bajo RLS.

## 7. Listado real

`/app/propuestas` ahora lista las propuestas reales del usuario vía `getProposals()`
(`src/domains/proposals/queries.ts`, server client + RLS, `deleted_at IS NULL`, orden por fecha desc,
límite 50). Muestra título, estado, origen, fecha y resumen. Empty state conservado cuando no hay
propuestas. Se mantiene el bloque "Crear desde" y el CTA "Nueva propuesta".

> `queries.ts` es server-only (usa `next/headers`) y **no** se re-exporta desde el barrel
> `@/domains/proposals` para no arrastrarlo a bundles de cliente.

## 8. RLS usada

Políticas de FASE 15L (`proposals_select` / `_insert` / `_update`, sin DELETE). El insert cumple
`created_by = auth.uid()`; el select filtra por propiedad/asignación/equipo. Sin service role.

## 9. Límites (fuera de alcance en 15M)

- **No** edición todavía.
- **No** detalle todavía (solo listado).
- **No** conversión a opportunity (FASE 15O).
- **No** filtros avanzados.
- **No** OpenAI ni proveedor externo — el borrador es determinístico interno.
- **No** Compliance en ninguna forma.

## 10. QA

| Check | Resultado |
|---|---|
| `npm run type-check` | **OK** (sin errores) |
| `npm run test:unit` | **OK** — 150 tests / 10 files (incluye `proposals-persistence.test.ts`) |
| `npm run build` | **OK** — `/app/propuestas` y `/app/propuestas/nueva` compilan |

## 11. Smoke dev

Un smoke UI+auth completo requiere sesión autenticada en navegador (la suite E2E corre sin
credenciales), por lo que **no** se ejecutó el flujo de login en navegador. Se realizó un **smoke a
nivel DB** contra el proyecto dev `plife-crm` (`ayvnloxijnfnooaefrlm`), insertando la fila **exacta
que produce `buildProposalInsertRow`**:

| # | Prueba | Resultado |
|---|---|---|
| 1 | INSERT `DEV Proposal 15M Manual` (source=manual) | **PASS** — `lead_id=null`, snapshots `null`, denormalizados presentes, `draft` = object |
| 2 | INSERT `DEV Proposal 15M Lead` (source=lead + lead real) | **PASS** — `lead_id` = FK real, `snap_score=80`, `snap_qual=ready_for_proposal` |
| 3 | Réplica de `getProposals()` (deleted_at IS NULL, desc) | **PASS** — devuelve las 2 nuevas; excluye la fila soft-deleted de 15L |

**Datos smoke creados en dev (permitido):** 2 filas activas (`DEV Proposal 15M Manual`,
`DEV Proposal 15M Lead`). CHECK constraints (status/source/target_type/title/context) y FK a
`leads` validados por el insert.

## 12. Confirmaciones

Solo dev · producción no tocada · sin Vercel · sin `.env` · sin push · sin `main` · sin PR #4 ·
sin `feat/operational-readiness-13` · sin opportunity · sin OpenAI · sin Compliance.
