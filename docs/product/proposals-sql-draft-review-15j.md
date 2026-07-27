# FASE 15J — Revisión del SQL draft de `proposals`

**Fecha:** 2026-07-08
**Rama:** `feat/lead-first-crm` (PR #3, draft, NO-GO para main)
**Roles:** Database Architect + Supabase RLS Specialist + Senior Product Engineer
**Naturaleza:** **SQL draft revisable, NO aplicado**. No hay código runtime ni server actions.
**Restricciones respetadas:** no main · no PR #4 · no `feat/operational-readiness-13` · no merge · no push · no Supabase remoto · no CLI de migraciones · no aplicar SQL · no `.env` · no Vercel · sin OpenAI · sin proveedor externo · **sin reintroducir Compliance** · **sin server actions** · **sin persistencia real todavía**.

---

## 1. Archivo generado

| Archivo | Estado |
|---|---|
| `supabase/migrations/drafts/20260708_proposals_persistence_draft.sql` | **DRAFT — no aplicado** |

Implementa el modelo definido en `proposals-persistence-design-15j0.md` (FASE 15J-0).

---

## 2. Qué contiene el SQL draft

- **Precondición**: aborta si faltan los helpers de rol `is_admin_or_direccion()`,
  `get_user_role()`, `is_in_my_team()` (creados directamente en Supabase, sin CREATE local).
- **Función `set_updated_at()`** reutilizada (OR REPLACE seguro) + trigger `proposals_updated_at`.
- **Tabla `public.proposals`** con: identidad/auditoría, responsables, estado/origen,
  relaciones nullable, contexto de input, borrador (`draft` JSONB + denormalizados),
  snapshots del lead y `metadata`.
- **Enums como CHECK sobre TEXT** (no tipos nativos): `status`, `source`, `target_type`.
- **Índices** parciales (activas) y de vinculación.
- **RLS** completa (SELECT/INSERT/UPDATE) + GRANT sin DELETE.
- **Comentarios** de tabla/columna y notas de seguridad.

### 2.1 Campos (resumen)

Identidad/auditoría: `id`, `created_at`, `updated_at`, `deleted_at`.
Responsables: `created_by` (NOT NULL), `assigned_to` (nullable).
Estado/origen: `title`, `status`, `source`, `source_id`, `source_title`, `source_context`.
Relaciones: `lead_id`, `campaign_id` (nullable, `ON DELETE SET NULL`), `radar_context` (JSONB).
Público/input: `target_type`, `target_description`, `context`, `objective`, `known_problem`,
`desired_outcome`, `notes`.
Borrador: `draft` (JSONB, fuente de verdad), `summary`, `target_audience`, `problem`,
`opportunity`, `proposed_offer` (denormalizados).
Snapshots: `score_snapshot`, `qualification_snapshot` (JSONB, FASE 15I congelada).
Extensibilidad: `metadata` (JSONB).

### 2.2 Estados y orígenes (CHECK)

- `status`: `draft` / `in_review` / `ready` / `used` / `archived` — **sin `compliance`**.
- `source`: `lead` / `campaign` / `radar` / `manual` / `market_observation` / `other`.
- `target_type`: `person` / `company` / `segment` / `unknown`.

### 2.3 RLS y soft-delete

- **SELECT**: `deleted_at IS NULL` + (admin/dirección OR asignado OR creador OR líder de equipo).
- **INSERT**: `created_by = auth.uid()`, `assigned_to` NULL/propio (admin/dirección asigna a otros).
- **UPDATE**: admin/dirección OR asignado OR creador — **solo permisos, sin `deleted_at`**
  (updates operativos; el soft-delete NO pasa por aquí).
- **DELETE físico bloqueado**: sin policy DELETE, sin GRANT DELETE.
- **⚠️ Soft-delete vía función `SECURITY DEFINER` `soft_delete_proposal(uuid)`** (corregido en
  FASE 15K): el UPDATE directo de `deleted_at` por el rol `authenticated` **falla con `42501`**
  incluso con `deleted_at IS NULL` solo en SELECT — validado empíricamente en leads 14G-B
  (PostgREST hace `UPDATE ... RETURNING` y la fila nueva debe cumplir la policy SELECT). La
  función DEFINER hace el UPDATE con privilegios elevados y autorización explícita. Ver §4.7.

---

## 3. Qué NO hace este draft

- **No se aplica** (ni en dev ni en remoto). No se usó la CLI de Supabase.
- **No crea server actions** ni código runtime.
- **No conecta con `opportunities`** (columna/relación queda para FASE 15O).
- **No migra datos** ni toca tablas existentes de forma destructiva.
- **No incluye Compliance / legal_review** en ninguna forma.
- **No incluye proveedor de IA** (OpenAI/GPT): el borrador es determinístico.
- **No define tipos ENUM nativos de Postgres** (decisión: TEXT + CHECK, ver §4).

---

## 4. Decisiones relevantes (para revisión)

1. **TEXT + CHECK en vez de ENUM nativo.** La FASE 15J-0 y todo el schema
   (`leads-schema-draft.sql`, `ai-engine-schema.sql`) usan TEXT + CHECK. Motivo: evolucionar
   con `ALTER CONSTRAINT` en vez de `ALTER TYPE` (locks). Se descartaron los tipos
   `proposal_status`/`proposal_source` nativos que sugería la consigna inicial de 15J.
2. **FK a `profiles(id)`, no `auth.users(id)`.** Es la convención del proyecto;
   `profiles.id == auth.uid()`, así los helpers de rol (`is_in_my_team`) reciben un
   `profiles.id` consistente y se mantiene la integridad con el resto del schema.
3. **`created_by` NOT NULL, sin `ON DELETE SET NULL`.** Toda propuesta tiene autor. Como es
   NOT NULL no puede llevar `SET NULL`; queda con `NO ACTION` (los profiles no se borran
   físicamente en este sistema). Difiere del `created_by` nullable de `leads`, de forma
   intencional. `assigned_to` sí es nullable con `ON DELETE SET NULL`.
4. **`source_id` es TEXT**, no UUID: el origen puede ser una referencia libre sin entidad
   persistida. La FK fuerte se expresa en `lead_id`/`campaign_id`.
5. **`draft` (JSONB) es la fuente de verdad**; los campos de texto son denormalizaciones.
6. **Radar sin FK**: se guarda como `radar_context` JSONB (el radar opera sobre `companies`,
   no hay tabla de señales).

---

## 5. Riesgos / puntos a validar

- **Helpers de rol**: la precondición asume `is_admin_or_direccion()`, `get_user_role()`,
  `is_in_my_team()` presentes en dev. Confirmar antes de aplicar (FASE 15K).
- **Valor de rol `lider_comercial`**: la política SELECT compara `get_user_role() =
  'lider_comercial'`. Verificar que ese literal coincide con el usado en `leads`.
- **`created_by` NOT NULL + servicio**: cualquier inserción por un contexto sin `auth.uid()`
  (p. ej. service role) debe setear `created_by` explícitamente; la RLS de INSERT exige
  `created_by = auth.uid()` para `authenticated`.
- **Tamaño de `draft`/snapshots JSONB**: aceptable para el volumen esperado; sin límite de
  tamaño impuesto (revisar si se decidiera).
- **Sin constraints cruzados** (p. ej. `source='lead' ⇒ lead_id NOT NULL`): decisión
  deliberada para no sobre-restringir el borrador conceptual. Revisar si se quiere endurecer.

---

## 6. Checklist antes de aplicar en dev (FASE 15K)

- [ ] Confirmar que se apunta al **proyecto Supabase de DEV** (no producción/remoto real).
- [ ] Verificar que existen los helpers `is_admin_or_direccion()`, `get_user_role()`,
      `is_in_my_team()` (si no, la precondición aborta).
- [ ] Confirmar que existen las tablas `profiles`, `leads`, `campaigns` (FKs).
- [ ] Revisar el literal de rol `lider_comercial` contra el schema real.
- [ ] Ejecutar en una transacción y revisar `pg_policy` de `proposals` (query de verificación).
- [ ] Smoke test RLS: insertar como asesor, leer propio, hacer soft-delete **vía
      `soft_delete_proposal(id)`** (debe funcionar), confirmar que el UPDATE **directo** de
      `deleted_at` como `authenticated` da 42501 (esperado) y que el DELETE físico está bloqueado.
- [ ] Confirmar que `soft_delete_proposal` quedó como `SECURITY DEFINER` con `EXECUTE` solo a
      `authenticated` (y `REVOKE` de PUBLIC).
- [ ] Generar tipos TS del schema tras aplicar (para 15L); registrar `soft_delete_proposal` en
      `Functions` de `database.ts` (igual que quedó pendiente `is_in_my_team` en leads).
- [ ] Registrar la aplicación en un doc `proposals-schema-apply-dev-15k.md`.

---

## 7. QA de esta fase (15J)

- Verificación de términos prohibidos (OpenAI/GPT/Compliance/legal_review/MQL/PQL): ver reporte.
- `npm run type-check` — ver reporte (no se tocó código runtime).
- `npm run test:unit` — ver reporte (sin tests nuevos; no-regresión).

---

## 8. FASE 15K — Validación contra schema real

> Ejecutada el 2026-07-08. Revisión del draft contra el schema real del repo. **No se aplicó SQL.**

### 8.1 Helpers de rol — CONFIRMADOS existentes en dev

| Helper | Evidencia | En `database.ts` |
|---|---|---|
| `is_admin_or_direccion()` | Precondición **PASS** en `leads-schema-apply-dev-14g.md`; tipado en `database.ts:615` | Sí |
| `get_user_role()` | Precondición **PASS** en 14G; tipado en `database.ts:614` (Returns `UserRole`) | Sí |
| `is_in_my_team(uuid)` | Precondición **PASS** en `leads-schema-apply-dev-14g.md:32` | **No** (falta typing, gap solo TS; existe en la base) |

No se inventó ningún helper. Los tres se usan igual que en `leads`. La precondición del draft
aborta si alguno falta, así que es seguro.

### 8.2 Roles — CONFIRMADOS

`seed-demo.sql` documenta los literales reales: `direccion`, `lider_comercial`, `asesor` (+`admin`).
El draft usa `get_user_role() = 'lider_comercial'` → **literal correcto**, idéntico a `leads_select`.

### 8.3 FKs — CONFIRMADAS

- `created_by` / `assigned_to` → `profiles(id)`: coincide con el patrón de `leads`
  (`leads-schema-draft.sql:88-89`). El proyecto usa `profiles`, **no** `auth.users`.
- `lead_id` → `leads(id)`, `campaign_id` → `campaigns(id)`: ambas tablas existen en dev
  (leads aplicada en 14G; campaigns con grants en `fix-app-grants.sql:55`). `ON DELETE SET NULL`.
- Nota: `profiles`, `leads`, `campaigns` **no** tienen `CREATE TABLE` local (creadas directamente
  en Supabase); es esperado y consistente con todo el schema del repo.

### 8.4 `updated_at` — CONFIRMADO

`set_updated_at()` es la función común (usada por `ai-engine-schema.sql:40` y
`leads-schema-draft.sql:70`, ambas `OR REPLACE`). El draft la reutiliza + trigger
`proposals_updated_at`. Correcto.

### 8.5 Grants — CONFIRMADOS

Patrón real (`fix-app-grants.sql`): a `authenticated` se otorga `SELECT, INSERT, UPDATE` en las
tablas de negocio (contacts, companies, opportunities, campaigns, leads); **a `anon` no se
otorga nada**. El draft otorga `SELECT, INSERT, UPDATE ON proposals TO authenticated` y nada a
`anon`. Correcto y consistente.

### 8.6 RLS — REVISADA contra `leads`

SELECT/INSERT/UPDATE replican el patrón de `leads` (mismos helpers, mismo literal de rol, mismo
manejo de `deleted_at IS NULL` solo en SELECT). Diferencia deliberada: el INSERT de proposals
permite `assigned_to IS NULL` (propuesta sin asignar) además de propio/admin.

### 8.7 ⚠️ Corrección crítica de soft-delete (cambio al draft)

**Hallazgo:** el draft 15J afirmaba que mantener `deleted_at IS NULL` solo en SELECT y permisos
en el UPDATE **"evita el 42501"**. La QA en dev de leads (14G-B) **desmiente** eso: el soft-delete
por UPDATE directo como `authenticated` **siguió fallando con 42501** incluso con el UPDATE
corregido, porque PostgREST hace `UPDATE ... RETURNING` y la fila nueva debe cumplir la policy
**SELECT** (`deleted_at IS NULL`), que deja de cumplir al setear `deleted_at`.

**Cambio aplicado al draft (§7 del SQL):** se agregó la función
`soft_delete_proposal(p_id uuid)` `SECURITY DEFINER` (search_path fijo, autorización explícita
dueño/asignado/dirección, `REVOKE ALL FROM PUBLIC` + `GRANT EXECUTE TO authenticated`), que hace
el `UPDATE deleted_at` bajo privilegios elevados sin exponer el UPDATE directo. Es exactamente la
solución que recomienda `leads-rls-soft-delete-fix-14gb.md §135`. El UPDATE directo de `deleted_at`
seguirá dando 42501 **a propósito**; el borrado va por la función. DELETE físico sigue bloqueado.

### 8.8 Riesgos restantes antes de aplicar en dev

- **Ownership de la función DEFINER:** al aplicar, `soft_delete_proposal` debe quedar owned por un
  rol que efectivamente omita RLS sobre `proposals` (owner de la tabla / postgres). Verificar en 15K
  real que el UPDATE interno no vuelve a chocar con RLS.
- **`is_in_my_team` sin typing en `database.ts`:** gap solo de TypeScript (existe en la base). Se
  regenera junto con `soft_delete_proposal` al aplicar (15K real / 15L).
- **`created_by = auth.uid()` en INSERT:** una inserción por service role (sin JWT) debe setear
  `created_by` explícitamente; la policy solo cubre `authenticated`.
- **Sin constraints cruzados** (`source='lead' ⇒ lead_id NOT NULL`): decisión deliberada; revisar
  si se quiere endurecer antes de producción.

### 8.9 Conclusión

El draft quedó **alineado con el schema real** (helpers, roles, FKs, updated_at, grants, RLS) y se
**corrigió el error de soft-delete** heredado de una lectura optimista del caso leads. Sigue siendo
**DRAFT no aplicado**. GO para revisión humana; la aplicación en dev (15K real) queda sujeta al
checklist §6 + verificación de ownership de la función DEFINER.

---

## 9. FASE 15L — Aplicado en Supabase dev

> Ejecutada el 2026-07-08. **Aplicado solo en dev** (`plife-crm` / `ayvnloxijnfnooaefrlm`).

- Archivo aplicado: `supabase/migrations/20260708_apply_proposals_persistence_dev.sql` (MCP
  `apply_migration`, name `proposals_persistence_15l`, resultado `success`).
- Objetos verificados: tabla 31 columnas, 5 CHECK, 4 FKs, 9 índices, trigger, RLS enabled,
  3 policies (sin DELETE), función `soft_delete_proposal` `SECURITY DEFINER` owner=postgres,
  EXECUTE solo authenticated.
- Smoke RLS 8/8 como esperado (INSERT/SELECT/UPDATE propios OK; UPDATE directo de deleted_at → 42501;
  `soft_delete_proposal` OK; oculto tras soft-delete; DELETE físico y anon bloqueados).
- Tipos: `src/types/database.ts` actualizado a mano (`Proposal`, `proposals` TableDef,
  `soft_delete_proposal`). `is_in_my_team` sigue sin tipar (gap TS heredado de leads).
- Detalle completo y riesgos: `proposals-schema-apply-dev-15l.md`.
- Producción NO tocada · No Vercel · No push · No server actions · No UI.
