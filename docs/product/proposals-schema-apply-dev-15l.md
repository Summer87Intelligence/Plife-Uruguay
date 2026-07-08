# FASE 15L — Schema `proposals` aplicado en Supabase dev

**Fecha:** 2026-07-08
**Rama:** `feat/lead-first-crm` (PR #3, draft, NO-GO para main)
**Roles:** Database Architect + Supabase RLS Specialist + QA Lead
**Estado:** **APLICADO en dev únicamente** — no producción, no Vercel, no migración de datos.

---

## 1. Proyecto / ref

| Campo | Valor |
|---|---|
| Proyecto | `plife-crm` (Supabase **dev**) |
| Ref | `ayvnloxijnfnooaefrlm` |
| Región | `sa-east-1` |
| Postgres | 17 |
| Producción | **NO tocada** (otros proyectos `Summer87 Copilot`/`Summer87 web CRM` no tocados) |

## 2. Archivo aplicado

- Copia versionada aplicable: `supabase/migrations/20260708_apply_proposals_persistence_dev.sql`
- Origen validado: `supabase/migrations/drafts/20260708_proposals_persistence_draft.sql`
- Método: MCP `apply_migration` (name `proposals_persistence_15l`) → **`{"success": true}`**.
- Precheck read-only previo: helpers, tablas FK y ausencia de `proposals`/`soft_delete_proposal` — todo OK antes de aplicar.

## 3. Objetos creados (verificados por introspección)

- **Tabla `public.proposals`** — **31 columnas** (id … metadata), todas las esperadas.
- **CHECK (5):** `proposals_status_values`, `proposals_source_values`, `proposals_target_type_values`,
  `proposals_title_not_empty`, `proposals_context_not_empty`.
- **FKs (4):** `created_by`→`profiles`, `assigned_to`→`profiles`, `lead_id`→`leads`,
  `campaign_id`→`campaigns`.
- **Índices (9):** `proposals_pkey` + 8 (`idx_proposals_created_at`, `_deleted_at`, `_status`,
  `_source`, `_assigned_to`, `_created_by`, `_lead_id`, `_campaign_id`).
- **Trigger:** `proposals_updated_at` → `set_updated_at()`.
- **RLS:** `enabled=true` (forced=false, correcto para que la función DEFINER pueda operar).
- **Policies (3):** `proposals_select` (r), `proposals_insert` (a), `proposals_update` (w). **Sin DELETE.**

## 4. Función `soft_delete_proposal(uuid)` — ownership verificado

| Propiedad | Valor |
|---|---|
| `owner` | **`postgres`** (superusuario → el UPDATE interno omite RLS, como se necesita) |
| `security_definer` | **true** |
| `search_path` | **`public`** (fijo) |
| `EXECUTE` | `postgres`, `authenticated` — **no PUBLIC** (REVOKE aplicado) |

## 5. Grants de tabla (idénticos a `leads` — baseline del proyecto)

| Rol | Privilegios |
|---|---|
| `authenticated` | INSERT, SELECT, UPDATE (+ REFERENCES, TRIGGER, TRUNCATE por default privileges) — **sin DELETE** |
| `anon` | REFERENCES, TRIGGER, TRUNCATE — **sin SELECT/INSERT/UPDATE/DELETE** |

REFERENCES/TRIGGER/TRUNCATE provienen de los *default privileges* de Supabase (no de esta
migración) y **no son explotables vía PostgREST** (no expone TRUNCATE ni DDL). `proposals`
coincide exactamente con `leads`.

## 6. Smoke de RLS / permisos (usuario `authenticated` simulado: admin `9fb93ddc…8404`)

| # | Prueba | Resultado | Esperado |
|---|---|---|---|
| 1 | INSERT propia (`created_by = auth.uid()`) | **PASS** (row `0c7f8fa7…`, `created_by_is_me=true`) | PASS |
| 2 | SELECT + UPDATE propia (`status='in_review'`) | **PASS** (`visible_rows=1`) | PASS |
| 3 | Soft-delete vía UPDATE directo `deleted_at=NOW() … RETURNING` | **FAIL 42501** | esperado (replica PostgREST; ver §7 diseño) |
| 4 | Soft-delete vía `soft_delete_proposal(id)` | **PASS** (void, sin error) | PASS |
| 5 | SELECT tras soft-delete (authenticated) | **0 filas** (oculto) | PASS |
| 6 | Fila física (vista privilegiada) | `total=1, soft_deleted=1` | presente, no borrada |
| 7 | DELETE físico como `authenticated` | **FAIL 42501** (permission denied, sin GRANT DELETE) | bloqueado |
| 8 | SELECT como `anon` | **FAIL 42501** (permission denied) | sin acceso |

**Nota de datos:** el smoke dejó una fila `title='DEV SMOKE Proposal 15L'` **soft-deleted**
(no visible para clientes, no borrada físicamente — permitido por la consigna). No se creó otro dato.

## 7. Tipos regenerados

- `src/types/database.ts` **actualizado a mano** (el archivo es hand-maintained; `leads` ya vivía
  ahí con el mismo patrón). Se agregó: interfaz `Proposal` (31 campos), `proposals: TableDef<Proposal, [...4 Rels]>`
  y `soft_delete_proposal` en `Functions`. Validado con `type-check`.
- **Pendiente (heredado de leads):** `is_in_my_team` sigue sin tipar en `Functions` (gap solo TS;
  la función existe en la base). No se agregó para no adivinar el nombre del parámetro; se
  regenerará cuando se corran los tipos oficiales de Supabase.

## 8. Riesgos pendientes

- **Ownership de la función DEFINER:** verificado `owner=postgres` en dev; si en una futura
  reaplicación la ejecuta otro rol, revisar que siga omitiendo RLS.
- **Isolación multiusuario no probada:** solo existe 1 profile (admin) en dev; el smoke ejerció la
  rama admin/owner. La rama "asesor solo ve lo suyo" / "líder ve su equipo" queda por probar cuando
  haya más profiles.
- **`is_in_my_team` sin typing** (ver §7).
- **Sin server actions ni UI** todavía: la tabla existe pero no hay flujo de app que la use (15M+).

## 9. Confirmaciones

- **Solo dev** (`ayvnloxijnfnooaefrlm`). **Producción NO tocada.** Otros proyectos NO tocados.
- **No Vercel · No `.env` · No push · No server actions · No UI · No OpenAI · No Compliance.**
- **No DELETE físico** habilitado; borrado solo por `soft_delete_proposal`.
