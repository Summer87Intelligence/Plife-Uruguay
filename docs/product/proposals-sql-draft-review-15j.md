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
- **UPDATE**: admin/dirección OR asignado OR creador — **solo permisos, sin `deleted_at`**.
- **DELETE físico bloqueado**: sin policy DELETE, sin GRANT DELETE.
- **⚠️ Fix soft-delete incorporado de origen**: `deleted_at IS NULL` va **solo en SELECT**,
  nunca en el `WITH CHECK` del UPDATE — evita el error `42501` documentado en
  `supabase/leads-rls-soft-delete-fix-14gb.sql` (FASE 14G-B).

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
- [ ] Smoke test RLS: insertar como asesor, leer propio, intentar soft-delete (no debe dar 42501),
      confirmar que DELETE físico está bloqueado.
- [ ] Generar tipos TS del schema tras aplicar (para 15L).
- [ ] Registrar la aplicación en un doc `proposals-schema-apply-dev-15k.md`.

---

## 7. QA de esta fase (15J)

- Verificación de términos prohibidos (OpenAI/GPT/Compliance/legal_review/MQL/PQL): ver reporte.
- `npm run type-check` — ver reporte (no se tocó código runtime).
- `npm run test:unit` — ver reporte (sin tests nuevos; no-regresión).
