# FASE 15J-0 — Diseño técnico de persistencia de Propuestas

**Fecha:** 2026-07-08
**Rama:** `feat/lead-first-crm` (PR #3, draft, NO-GO para main)
**Roles:** Product Architect + Database Architect + Senior Product Engineer
**Naturaleza:** **solo diseño técnico/documental**. No hay cambios de código, ni SQL aplicado, ni server actions.
**Restricciones respetadas:** no main · no PR #4 · no merge · no push · no Supabase remoto · no aplicar SQL · no `.env` · no Vercel · sin OpenAI · sin proveedor externo · **sin reintroducir Compliance** · **sin server actions todavía** · **sin persistencia todavía**.

> **Alcance de esta fase (15J-0):** definir cómo se guardarán las propuestas en Supabase dev
> en una fase posterior. Deja listo el modelo de datos, relaciones, RLS futura y el roadmap
> de implementación. **No** crea la tabla ni escribe SQL ejecutable; eso es la FASE 15J.

---

## 1. Contexto y motivación

La auditoría **FASE 15H** marcó que **Propuestas debe persistir antes de sumar más UI**.
Hoy (FASE 15E–15G) el flujo de propuestas es **mock/determinístico** y **no persiste**:

- El borrador (`ProposalDraft`) vive **solo en el estado del cliente** durante la sesión
  (`useState` en `proposal-create-form.tsx`); al recargar o navegar, se pierde.
- El input (`ProposalInput`) y el contexto de origen (`source`, `source_id`, `source_title`,
  `source_context`) tampoco se guardan.
- El listado `/app/propuestas` muestra un **empty state permanente**: "Todavía no hay
  propuestas guardadas".
- No se puede **retomar, editar, listar, priorizar ni auditar** una propuesta.
- No se puede **vincular** la propuesta al lead/campaña/oportunidad de forma duradera.

Este documento define el modelo de persistencia para cerrar ese hueco de forma segura,
alineado con las convenciones ya establecidas por el schema de `leads`
(`supabase/leads-schema-draft.sql`).

---

## 2. Auditoría del flujo actual de Propuestas

### 2.1 Archivos revisados

| Archivo | Rol |
|---|---|
| `src/domains/proposals/types.ts` | `ProposalInput`, `ProposalDraft`, `EngineContribution`, enums |
| `src/domains/proposals/constants.ts` | Opciones/labels de `source` y `target_type`, HEDGE, disclaimers |
| `src/domains/proposals/proposal-flow.ts` | Secuencia de motores y labels de secciones del borrador |
| `src/domains/proposals/mock-generator.ts` | `generateMockProposal` — generación determinística local |
| `src/domains/proposals/prefill.ts` | `parseProposalPrefill` — prefill seguro por query params |
| `src/domains/proposals/index.ts` | API pública del dominio |
| `src/components/proposals/proposal-create-form.tsx` | Formulario + estado del borrador (cliente) |
| `src/components/proposals/proposal-draft-view.tsx` | Render del borrador generado |
| `src/app/app/propuestas/page.tsx` | Hub: "Crear desde" + empty state |
| `src/app/app/propuestas/nueva/page.tsx` | Formulario nueva propuesta + prefill |
| `src/components/leads/lead-proposal-link.ts` | `buildProposalHref` — link contextual lead → propuesta |
| `docs/product/proposals-mock-flow-15e.md` | Diseño del flujo mock |
| `docs/product/proposals-contextual-entry-15f.md` | Diseño de orígenes contextuales |

### 2.2 Input actual (`ProposalInput`)

Campos capturados por el formulario:

| Campo | Requerido | Descripción |
|---|---|---|
| `title` | Sí | Título de la propuesta |
| `context` | Sí | De dónde surge la idea / observación |
| `target_type` | — | `person` / `company` / `segment` / `unknown` |
| `target_description` | — | Descripción del público objetivo |
| `source` | — | `lead` / `campaign` / `radar` / `manual` / `market_observation` / `other` |
| `source_id` | — | Referencia local al origen (no se resuelve contra Supabase hoy) |
| `source_title` | — | Título del origen (sugerido como título inicial) |
| `source_context` | — | Contexto textual del origen |
| `objective` | — | Qué se busca lograr |
| `known_problem` | — | Problema conocido del cliente |
| `desired_outcome` | — | Resultado deseado |
| `notes` | — | Detalles adicionales |

### 2.3 Output actual (`ProposalDraft`)

Estructura generada por `generateMockProposal`:

- Campos de texto: `title`, `summary`, `targetAudience`, `problem`, `opportunity`, `proposedOffer`.
- Listas: `differentiators[]`, `questionsToAsk[]`, `marketAngles[]`, `productIdeas[]`,
  `commercialStrategy[]`, `nextSteps[]`, `risksOrAssumptions[]`.
- `engineContributions[]`: por cada motor, `{ engineId, engineName, questions[], outputs[] }`.

Todo con lenguaje prudente (HEDGE: "Hipótesis a validar", "Ángulo posible", "Preguntas para
confirmar", "Propuesta inicial") + nota de revisión humana.

### 2.4 Motores usados

Secuencia fija `PROPOSAL_ENGINE_SEQUENCE`:
`diagnostico → mercado → producto → comercial → direccion → aprendizaje`.
Cada motor aporta preguntas y outputs; el generador es **100% local y determinístico**
(sin `fetch`, sin `OPENAI_API_KEY`, sin red).

### 2.5 Fuentes soportadas (orígenes)

`lead` (CTA en detalle de lead) · `campaign` (CTA en detalle de campaña) ·
`radar` (card en hub; CTA por-empresa pendiente) · `manual` / `market_observation` / `other`.
El contexto de origen llega por query params y prellena el formulario
(`parseProposalPrefill`); **el `source_id` no se resuelve** contra la base todavía.

### 2.6 Qué se pierde hoy al no persistir

- El **borrador generado** (input + output) desaparece al recargar/navegar.
- La **vinculación duradera** con el lead/campaña/radar de origen (hoy solo query param).
- La posibilidad de **retomar, editar y versionar** una propuesta.
- El **listado real** y la **priorización** de propuestas por asesor/equipo.
- La **trazabilidad/auditoría** (quién la creó, cuándo, sobre qué lead).
- El **snapshot del score/calificación** del lead (FASE 15I) en el momento de crearla.
- La base para una futura **conversión propuesta → oportunidad**.

### 2.7 Qué debería guardarse

- El **input** del asesor (contexto, objetivo, problema, resultado, público, notas).
- El **contexto de origen** (`source`, `source_id`, `source_title`, `source_context`).
- El **borrador generado** completo (`ProposalDraft` como JSONB) + campos denormalizados
  clave para listar/filtrar sin abrir el JSON.
- Metadatos de **ciclo de vida y auditoría** (estado, autor, asignado, timestamps, soft-delete).
- Un **snapshot** opcional del score/calificación del lead (FASE 15I) al momento de crearla.
- La **vinculación** nullable a `lead_id` / `campaign_id` y contexto de radar como JSONB.

---

## 3. Entidad futura `proposals`

> **Estado:** diseño. La tabla **no existe** todavía. El SQL ejecutable se escribe en la
> FASE 15J y se aplica en dev en la FASE 15K.

### 3.1 Convenciones seguidas (heredadas de `leads-schema-draft.sql`)

- **CHECK sobre TEXT**, no enums Postgres (patrón del proyecto: más fácil de evolucionar).
- **`set_updated_at()`** global reutilizada vía trigger `BEFORE UPDATE`.
- **RLS con helpers existentes en la base remota**: `is_admin_or_direccion()`,
  `get_user_role()`, `is_in_my_team(uuid)` (STABLE SECURITY DEFINER).
- **Soft-delete** vía `deleted_at`; **sin DELETE físico** por política ni GRANT.
- **`metadata JSONB NOT NULL DEFAULT '{}'`** para extensibilidad.
- **Aditivo y no destructivo**; idempotente (`IF NOT EXISTS` / `OR REPLACE`).

### 3.2 Campos propuestos

| Campo | Tipo | Null | Descripción |
|---|---|---|---|
| `id` | `UUID` | no | PK, `DEFAULT gen_random_uuid()` |
| `created_at` | `TIMESTAMPTZ` | no | `DEFAULT NOW()` |
| `updated_at` | `TIMESTAMPTZ` | no | `DEFAULT NOW()`, trigger `set_updated_at()` |
| `deleted_at` | `TIMESTAMPTZ` | sí | Soft-delete; NULL = activa |
| `created_by` | `UUID` | sí | FK `profiles(id) ON DELETE SET NULL` |
| `assigned_to` | `UUID` | sí | FK `profiles(id) ON DELETE SET NULL` |
| `title` | `TEXT` | no | Título de la propuesta |
| `status` | `TEXT` | no | `DEFAULT 'draft'`, CHECK (ver §3.3) |
| `source` | `TEXT` | no | `DEFAULT 'manual'`, CHECK contra orígenes conocidos |
| `source_id` | `TEXT` | sí | Referencia textual al origen (no siempre es UUID) |
| `source_title` | `TEXT` | sí | Título del origen |
| `source_context` | `TEXT` | sí | Contexto textual del origen |
| `lead_id` | `UUID` | sí | FK `leads(id) ON DELETE SET NULL` |
| `campaign_id` | `UUID` | sí | FK `campaigns(id) ON DELETE SET NULL` |
| `radar_context` | `JSONB` | sí | Contexto de radar B2B (empresa/señal detectada) |
| `target_type` | `TEXT` | no | `DEFAULT 'unknown'`, CHECK (`person`/`company`/`segment`/`unknown`) |
| `target_description` | `TEXT` | sí | Descripción del público objetivo |
| `context` | `TEXT` | sí | Contexto que ingresó el asesor (input) |
| `objective` | `TEXT` | sí | Objetivo declarado (input) |
| `known_problem` | `TEXT` | sí | Problema conocido (input) |
| `desired_outcome` | `TEXT` | sí | Resultado deseado (input) |
| `notes` | `TEXT` | sí | Notas del asesor (input) |
| `draft` | `JSONB` | sí | `ProposalDraft` completo generado (fuente de verdad del borrador) |
| `summary` | `TEXT` | sí | Denormalizado de `draft.summary` (listar sin abrir JSON) |
| `target_audience` | `TEXT` | sí | Denormalizado de `draft.targetAudience` |
| `problem` | `TEXT` | sí | Denormalizado de `draft.problem` |
| `opportunity` | `TEXT` | sí | Denormalizado de `draft.opportunity` |
| `proposed_offer` | `TEXT` | sí | Denormalizado de `draft.proposedOffer` |
| `score_snapshot` | `JSONB` | sí | Snapshot del score del lead (FASE 15I) al crear |
| `qualification_snapshot` | `JSONB` | sí | Snapshot de la calificación del lead (FASE 15I) al crear |
| `metadata` | `JSONB` | no | `DEFAULT '{}'` — extensibilidad |

**Notas de diseño:**

- **`source_id` es `TEXT`, no `UUID`**, porque el input actual lo trata como referencia
  libre (`ProposalInput.source_id?: string`) y puede venir de orígenes sin UUID
  (observación manual, radar por-empresa aún no formalizado). La FK "fuerte" al lead/campaña
  se expresa por separado en `lead_id` / `campaign_id`.
- **`draft` (JSONB) es la fuente de verdad** del borrador generado; los campos `summary`,
  `target_audience`, `problem`, `opportunity`, `proposed_offer` se **denormalizan** para
  listar/buscar sin deserializar el JSON. Si divergen, `draft` manda.
- **`score_snapshot` / `qualification_snapshot`** capturan el estado del lead (FASE 15I:
  `getLeadScoreSignals`/banda y `LeadQualification`) **en el momento de crear la propuesta**,
  no en vivo — así la propuesta conserva el contexto que la motivó aunque el lead evolucione.
- **No existe estado ni campo de `compliance`** en ninguna forma.

### 3.3 Estados (`status`)

CHECK sobre TEXT: `draft` / `in_review` / `ready` / `used` / `archived`.

| Estado | Significado |
|---|---|
| `draft` | Borrador en construcción (estado inicial por defecto) |
| `in_review` | En revisión antes de usarse con el cliente |
| `ready` | Lista para usarse comercialmente |
| `used` | Ya se usó con el cliente / dio lugar a una acción comercial |
| `archived` | Fuera de gestión (no se descarta físicamente) |

> **Sin estado `compliance`.** El ciclo de vida es puramente comercial. La validación humana
> es un disclaimer de producto, no un estado de máquina.

### 3.4 Índices propuestos

```text
idx_proposals_status         ON proposals(status)      WHERE deleted_at IS NULL
idx_proposals_assigned_to    ON proposals(assigned_to) WHERE deleted_at IS NULL
idx_proposals_created_by     ON proposals(created_by)  WHERE deleted_at IS NULL
idx_proposals_lead_id        ON proposals(lead_id)
idx_proposals_campaign_id    ON proposals(campaign_id)
idx_proposals_source         ON proposals(source)      WHERE deleted_at IS NULL
```

### 3.5 Constraints de consistencia (sugeridas, simples)

- CHECK de enums: `status`, `source`, `target_type` (mismo patrón que `leads`).
- Sin CHECK cruzados complejos en esta fase (evitar sobre-restringir el borrador conceptual).
  Ej.: no se exige `lead_id NOT NULL` cuando `source = 'lead'`, porque el origen puede ser un
  lead aún no persistido o una referencia textual (`source_id`).

---

## 4. Relaciones

- **Proposal ← Lead:** una propuesta **puede** nacer de un lead (`source='lead'`, `lead_id`
  FK nullable). **Un lead puede tener varias propuestas** (relación 1‑lead → N‑propuestas).
- **Proposal ← Campaña:** puede nacer de una campaña (`source='campaign'`, `campaign_id`
  FK nullable).
- **Proposal ← Radar / contexto de mercado:** puede nacer del Radar B2B o de una observación
  de mercado (`source='radar'`/`'market_observation'`). El contexto se guarda en
  `radar_context` (JSONB) y/o `source_context` (texto). No hay FK a una "tabla de señales"
  porque el radar opera hoy sobre `companies` (sin tabla propia de señales).
- **Proposal manual:** puede no tener origen (`source='manual'`, sin FKs).
- **Proposal → Oportunidad: NO automático todavía.** Crear una propuesta **no** crea una
  oportunidad. La conversión propuesta → oportunidad se diseña recién en la FASE 15O.

```text
leads (1) ────< (N) proposals        [proposals.lead_id, nullable, ON DELETE SET NULL]
campaigns (1) ─< (N) proposals        [proposals.campaign_id, nullable, ON DELETE SET NULL]
profiles (1) ──< (N) proposals        [created_by / assigned_to, nullable, ON DELETE SET NULL]
proposals → opportunities             [FUTURO 15O, no en este diseño]
```

**Borrado del origen:** todas las FKs usan `ON DELETE SET NULL` — si se borra el lead/campaña,
la propuesta sobrevive con la referencia en NULL (conserva `source_title`/`source_context`
como rastro textual).

---

## 5. RLS futura (diseño, no aplicado)

Misma filosofía que `leads` (`supabase/leads-schema-draft.sql`) y su fix de soft-delete
(`supabase/leads-rls-soft-delete-fix-14gb.sql`).

### 5.1 Políticas

| Comando | Regla |
|---|---|
| **SELECT** | `deleted_at IS NULL` **Y** (`is_admin_or_direccion()` OR `assigned_to = auth.uid()` OR `created_by = auth.uid()` OR (`get_user_role() = 'lider_comercial'` AND `is_in_my_team(assigned_to)`)) |
| **INSERT** | `created_by = auth.uid()` **Y** (`assigned_to = auth.uid()` OR `is_admin_or_direccion()`) |
| **UPDATE** | `is_admin_or_direccion()` OR `assigned_to = auth.uid()` OR `created_by = auth.uid()` (en USING **y** WITH CHECK) |
| **DELETE** | **Sin política y sin GRANT DELETE** — borrado físico bloqueado |

- Usuario ve propuestas **propias/asignadas**; dirección/admin ven **todas**; líder comercial
  ve las de su equipo.
- **Insert** por usuario autenticado, forzando `created_by = auth.uid()`.
- **Update** por dueño/asignado/dirección.
- **Delete físico bloqueado**; el borrado es **soft-delete** (UPDATE de `deleted_at`).
- GRANT: `GRANT SELECT, INSERT, UPDATE ON proposals TO authenticated` (sin DELETE).

### 5.2 ⚠️ Cuidado con el problema de soft-delete detectado en leads

**El error 42501 documentado en `leads-rls-soft-delete-fix-14gb.sql` DEBE evitarse desde el
diseño inicial de `proposals`.**

Causa: si `proposals_select` filtra `deleted_at IS NULL` **y** `proposals_update` repite ese
filtro en su `WITH CHECK`, entonces al hacer `UPDATE deleted_at = NOW()` la fila resultante
**deja de cumplir** el WITH CHECK → Postgres rechaza el soft-delete con `42501`.

**Regla de diseño para `proposals`:**

- El filtro `deleted_at IS NULL` va **únicamente en la política SELECT**.
- Las políticas `UPDATE` (USING **y** WITH CHECK) evalúan **solo permisos**
  (admin/asignado/creador), **nunca** `deleted_at`.
- Así el soft-delete (UPDATE de `deleted_at`) pasa el WITH CHECK, y las filas borradas
  quedan invisibles porque SELECT sí las filtra.

Esto se incorpora **desde la FASE 15J** (SQL draft), no como parche posterior.

---

## 6. Fases futuras sugeridas

| Fase | Entregable | Toca código | Toca Supabase |
|---|---|---|---|
| **15J** | **SQL draft de `proposals`** (`supabase/proposals-schema-draft.sql`): tabla + índices + trigger + RLS + GRANT, con el fix de soft-delete incorporado de origen. Idempotente, aditivo, **no aplicado**. Guía de aplicación en docs. | Solo SQL/docs (no server actions) | No (solo archivo, sin ejecutar) |
| **15K** | **Aplicar schema en dev** (Supabase dev, ref del proyecto de desarrollo). Verificación read-only de políticas. Generar tipos TS del schema. | No | Sí (dev, autorización explícita) |
| **15L** | **Crear propuesta real desde UI**: server action de insert (primera server action del dominio), Zod schema, mapear `ProposalInput` + `ProposalDraft` → fila. Persistir snapshot de score/calificación (15I). | Sí (server actions) | Sí (dev) |
| **15M** | **Listar propuestas reales** en `/app/propuestas` (reemplazar empty state por listado con estado, origen, lead vinculado; filtros básicos). | Sí | Sí (dev, lectura) |
| **15N** | **Detalle / edición de propuesta**: ruta `/app/propuestas/[id]`, edición de campos y estado, soft-delete/archivado. | Sí | Sí (dev) |
| **15O** | **Conectar propuesta con oportunidad**: diseño + implementación de la conversión propuesta → oportunidad (columna/relación y flujo). Recién aquí se toca ese vínculo. | Sí | Sí (dev) |

> Cada fase mantiene las restricciones del proyecto: no main, no PR #4, no push sin pedido,
> sin OpenAI, sin Compliance, sin tocar Supabase remoto de producción.

---

## 7. Fuera de alcance de 15J-0

- Escribir SQL ejecutable (es 15J).
- Aplicar cualquier cambio en Supabase (es 15K en dev).
- Crear server actions (recién 15L).
- Modificar UI de propuestas.
- Conversión propuesta → oportunidad (es 15O).

---

## 8. QA documental

- `npm run type-check` — ver reporte de ejecución (esta fase no cambia tipos).
- `npm run test:unit` — ver reporte de ejecución (sin tests nuevos; validación de no-regresión).

---

## 9. Confirmaciones de restricción

- **Sin OpenAI / proveedor externo.** El generador sigue siendo determinístico local; la
  persistencia futura no introduce IA externa.
- **Sin Compliance.** No hay estado, campo ni sección de compliance en el modelo.
- **Sin persistencia todavía.** Este documento no crea tablas ni ejecuta SQL.
- **Sin server actions todavía.** Se diseñan para 15L, no se crean aquí.
- **No main · no PR #4 · no push · no Supabase remoto · no `.env` · no Vercel.**

---

## 10. FASE 15J — SQL draft generado

> Ejecutada el 2026-07-08. Convierte este diseño en un SQL revisable **no aplicado**.

- **Ubicación:** `supabase/migrations/drafts/20260708_proposals_persistence_draft.sql`.
- **Estado:** **DRAFT — no aplicado** (ni dev ni remoto; no se usó la CLI de Supabase).
- **Guía de revisión:** `docs/product/proposals-sql-draft-review-15j.md`.

### Decisiones relevantes

- **Enums como TEXT + CHECK** (no tipos nativos Postgres): consistente con este diseño y con
  `leads-schema-draft.sql` / `ai-engine-schema.sql`. Se descartaron `proposal_status` /
  `proposal_source` nativos.
- **FKs de responsables → `profiles(id)`** (no `auth.users`): `profiles.id == auth.uid()`;
  mantiene integridad con el resto del schema y con los helpers de rol.
- **`created_by` NOT NULL** (toda propuesta tiene autor), sin `ON DELETE SET NULL`;
  `assigned_to` nullable con `ON DELETE SET NULL`.
- **Soft-delete**: `deleted_at IS NULL` solo en SELECT + UPDATE solo con permisos. **Corregido en
  FASE 15K**: esto NO basta para soft-delete vía `authenticated` (da 42501, validado en leads
  14G-B); se agregó la función `SECURITY DEFINER` `soft_delete_proposal(uuid)` como mecanismo real.
- **Sin conexión a `opportunities`** (queda para 15O). **Sin Compliance. Sin proveedor de IA.**

### FASE 15K — Validación contra schema real (2026-07-08)

El draft se validó contra el schema real del repo (helpers, roles, FKs, updated_at, grants, RLS):
todo confirmado. **Corrección crítica:** se reemplazó la suposición de que el patrón RLS "evita el
42501" por la solución real (función `SECURITY DEFINER` `soft_delete_proposal`), tras confirmar en
la QA de leads que el soft-delete directo vía `authenticated` sigue fallando. Detalle completo y
riesgos restantes en `proposals-sql-draft-review-15j.md` §8. Sigue **DRAFT no aplicado**.
