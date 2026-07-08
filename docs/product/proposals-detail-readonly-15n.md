# FASE 15N — Detalle read-only de una propuesta guardada

**Fecha:** 2026-07-08
**Rama:** `feat/lead-first-crm` (PR #3, draft, NO-GO para main)
**Modelo:** Sonnet 5
**Roles:** Senior Product Engineer + QA Lead
**Estado:** Implementado en dev. Sin push · sin producción · sin Vercel · sin `.env` · sin SQL.

---

## 1. Objetivo

FASE 15M creó `createProposalAction` y el listado real de `/app/propuestas`. Faltaba poder **abrir**
una propuesta guardada y verla en una pantalla de detalle. FASE 15N agrega esa lectura, **read-only**:
sin edición, sin conversión a oportunidad.

## 2. Ruta creada

`src/app/app/propuestas/[proposalId]/page.tsx`:

- `getProfile()` → `redirect('/login')` si no hay sesión (mismo patrón que el resto de `/app/*`).
- `getProposalById(proposalId)` → `notFound()` si no existe, está soft-deleted, el id no es un UUID
  válido, o RLS la oculta al usuario actual (mismo comportamiento visible para los tres casos, como
  en `contactos/[id]`).
- Renderiza `ProposalDetailView`.

## 3. Query usada

`src/domains/proposals/queries.ts` → `getProposalById(id)`:

- Valida `isUuid(id)` antes de consultar (reutiliza el helper de `persistence.ts` de 15M).
- Supabase server client (cookies/session), **sin service role**.
- `select('*').eq('id', id).is('deleted_at', null).maybeSingle()` — la política `proposals_select`
  (FASE 15L) ya filtra por propiedad/asignación/equipo; el filtro de soft-delete es explícito.
- Devuelve `null` ante cualquier caso (no-uuid, no existe, soft-deleted, RLS) — la página decide
  `notFound()` uniformemente, sin distinguir el motivo (no filtra por enumeración de ids).

`queries.ts` sigue siendo **server-only** (usa `next/headers`) y no se re-exporta desde el barrel
`@/domains/proposals`, igual que en 15M.

## 4. Campos mostrados

`ProposalDetailView` (`src/components/proposals/proposal-detail-view.tsx`):

- título, estado (`PROPOSAL_STATUS_LABELS`), origen (`SOURCE_LABELS`), fecha de creación,
- contexto de origen (`source_title` / `source_context`) si están presentes,
- resumen, público objetivo (con fallback a `target_type` + `target_description` si el draft no
  trae `targetAudience`), problema, oportunidad, oferta propuesta,
- diferenciales, ángulos de mercado, ideas de producto, estrategia comercial,
- preguntas a hacer, próximos pasos,
- riesgos/hipótesis (solo si hay elementos),
- contribuciones de cada motor (solo si hay elementos),
- snapshot de score/calificación del lead (solo si existen).

Disclaimer fijo: **"Cálculo interno (sin OpenAI ni proveedor externo). Requiere validación comercial
humana."** Sin mención a Compliance.

No se reutilizó `ProposalDraftView` tal cual: ese componente está redactado para un borrador
**recién generado y no guardado** ("Este borrador no está guardado..."). El detalle habla en pasado
("Guardada el ..."), así que se creó un componente propio con la misma estructura visual pero
copy y disclaimers coherentes con una propuesta **ya persistida**.

## 5. Normalización defensiva del JSONB

`src/domains/proposals/detail.ts` (nuevo, funciones puras):

- `normalizeStoredDraft(draft: Json)` — convierte el `draft` JSONB en un `ProposalDraft` seguro:
  strings/arrays faltantes o mal tipados se completan con `''`/`[]`, nunca lanza.
- `normalizeScoreSnapshot` / `normalizeQualificationSnapshot` — devuelven `null` si el snapshot no
  tiene la forma mínima esperada (por ejemplo `score` no numérico), en vez de romper el render.

Se probó con drafts completos (ida y vuelta por `JSON.stringify`/`parse`, simulando el viaje por
JSONB), drafts vacíos (`{}`), `null`, arrays con elementos no-`string` mezclados, y contribuciones de
motor sin `engineId`.

## 6. Snapshots visibles

**Sí.** Si la propuesta se creó desde un lead (FASE 15M) y tiene `score_snapshot`/
`qualification_snapshot`, el detalle los muestra en una sección aparte ("Snapshot del lead al crear
la propuesta"), aclarando que están **congelados** (no se recalculan en vivo).

## 7. Listado enlazado

`/app/propuestas` — cada tarjeta de propuesta ahora es un `Link` a `/app/propuestas/[id]`
(`as Route`, mismo patrón que `lead-card.tsx`). El CTA "Nueva propuesta" y el empty state no cambian.

## 8. Límites (fuera de alcance en 15N)

- **No** edición todavía.
- **No** conversión a opportunity (sigue en FASE 15O).
- **No** OpenAI ni proveedor externo.
- **No** Compliance en ninguna forma.
- **No** se tocó SQL/RLS — se reutiliza `proposals_select` de FASE 15L tal cual.

## 9. QA

| Check | Resultado |
|---|---|
| `rg` términos prohibidos | Solo menciones negativas/documentales (comentarios, disclaimers, aserciones `not.toContain`) |
| `npm run type-check` | **OK** |
| `npm run test:unit` | **OK** — 164 tests / 11 files (incluye `proposals-detail.test.ts`, 15 casos nuevos) |
| `npm run build` | **OK** tras limpiar `.next/` (caché de build corrupta de una corrida anterior); incluye la ruta dinámica `/app/propuestas/[proposalId]` (832 B) |

## 10. Smoke dev/UI

**Limitación documentada:** no había sesión autenticada de navegador disponible en esta sesión (la
suite E2E corre sin credenciales), por lo que **no se ejecutó** el flujo de clic real en
`/app/propuestas` → abrir propuesta → confirmar render en el navegador.

Se hizo en su lugar un **smoke server/build + verificación de datos en dev**:

| # | Prueba | Resultado |
|---|---|---|
| 1 | `npm run build` compila la ruta `/app/propuestas/[proposalId]` | **PASS** |
| 2 | Existen en dev las dos propuestas de 15M (`DEV Proposal 15M Manual` id `abad39e4-...`,
    `DEV Proposal 15M Lead` id `2cc6b591-...`) | **PASS** — confirmado por SQL read-only |
| 3 | `DEV Proposal 15M Lead` tiene `score_snapshot` y `qualification_snapshot` no nulos;
    `DEV Proposal 15M Manual` los tiene `null` | **PASS** |
| 4 | `draft` es `jsonb_typeof = object` en ambas filas | **PASS** |
| 5 | `getProposalById` reutiliza `proposals_select` (FASE 15L): sin política nueva, sin SQL aplicado | **PASS** (no se corrió SQL de esquema) |

**Pendiente para una futura sesión con sesión de navegador:** clic real en
`/app/propuestas/2cc6b591-1f51-45f0-b836-8c3d97eb98d9` y
`/app/propuestas/abad39e4-9265-4272-b199-2bf58133bd56`, y confirmar que el browser no hace requests
directos a `/rest/v1/proposals` (el patrón es 100% server-side vía Server Components).

## 11. Confirmaciones

Solo dev · producción no tocada · sin Vercel · sin `.env` · sin push · sin `main` · sin PR #4 ·
sin `feat/operational-readiness-13` · sin SQL/RLS nuevo · sin opportunity · sin OpenAI · sin Compliance.
