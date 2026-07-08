-- =============================================================================
-- APPLIED IN DEV — FASE 15L (2026-07-08)
-- Proyecto: plife-crm (Supabase DEV)  ·  Ref: ayvnloxijnfnooaefrlm  ·  region sa-east-1
-- Origen: supabase/migrations/drafts/20260708_proposals_persistence_draft.sql
--         (diseñado 15J-0, revisado 15J, validado contra schema real 15K).
-- Aplicado vía MCP apply_migration (name: proposals_persistence_15l).
-- NO producción · NO otros proyectos · NO migración de datos.
-- =============================================================================
-- PLIFE Growth OS — PROPOSALS: persistencia de Propuestas
--
-- ADITIVO: crea la tabla `proposals` + función soft_delete_proposal. NO modifica
-- de forma destructiva ninguna tabla existente. NO migra datos. NO conecta con
-- `opportunities` (queda para 15O).
--
-- IDEMPOTENCIA: usa IF NOT EXISTS / OR REPLACE — ejecutable múltiples veces.
--
-- CONVENCIONES DEL PROYECTO SEGUIDAS (idénticas a supabase/leads-schema-draft.sql):
--   * CHECK constraints sobre TEXT (NO enums Postgres). Se evolucionan con
--     ALTER CONSTRAINT (sin ALTER TYPE ni locks). Patrón de leads y Motor IA.
--   * set_updated_at() — función global ya usada por leads y el Motor IA.
--   * FKs de responsables → profiles(id) (NO auth.users). profiles.id == auth.uid().
--   * RLS con helpers existentes en la base (STABLE SECURITY DEFINER):
--       is_admin_or_direccion() · get_user_role() · is_in_my_team(uuid)
--     La precondición de abajo aborta si no existen.
--
-- SIN OpenAI · SIN proveedor de IA · SIN Compliance / legal_review (ninguna forma).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. PRECONDICIÓN: abortar si los helpers de roles no existen
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  missing TEXT[];
BEGIN
  SELECT array_agg(required.proname)
  INTO missing
  FROM (VALUES
    ('is_admin_or_direccion'),
    ('get_user_role'),
    ('is_in_my_team')
  ) AS required(proname)
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = required.proname
      AND n.nspname = 'public'
  );

  IF missing IS NOT NULL THEN
    RAISE EXCEPTION
      'PRECONDICIÓN FALLIDA: faltan funciones public.% — Ver docs/product/proposals-sql-draft-review-15j.md antes de aplicar.',
      array_to_string(missing, ', ');
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- 1. FUNCIÓN updated_at — reutiliza la global del proyecto (OR REPLACE seguro)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 2. TABLA proposals — borrador comercial persistido
-- ---------------------------------------------------------------------------
-- Enums modelados como CHECK sobre TEXT (convención del proyecto):
--   status: draft / in_review / ready / used / archived   (SIN compliance)
--   source: lead / campaign / radar / manual / market_observation / other
--   target_type: person / company / segment / unknown
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proposals (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at             TIMESTAMPTZ,

  -- Responsables (patrón contacts/companies/opportunities/leads → profiles).
  -- created_by es NOT NULL: toda propuesta tiene autor. Por eso NO lleva
  -- ON DELETE SET NULL (los profiles no se borran físicamente en este sistema;
  -- el default NO ACTION protege la integridad). assigned_to sí es nullable.
  created_by             UUID        NOT NULL REFERENCES profiles(id),
  assigned_to            UUID        REFERENCES profiles(id) ON DELETE SET NULL,

  -- Identificación / estado
  title                  TEXT        NOT NULL,

  status                 TEXT        NOT NULL DEFAULT 'draft'
                         CONSTRAINT proposals_status_values
                         CHECK (status IN ('draft', 'in_review', 'ready',
                                           'used', 'archived')),

  -- Origen de la propuesta
  source                 TEXT        NOT NULL DEFAULT 'manual'
                         CONSTRAINT proposals_source_values
                         CHECK (source IN ('lead', 'campaign', 'radar',
                                           'manual', 'market_observation', 'other')),
  -- source_id es TEXT (no UUID): el origen puede ser una referencia libre sin
  -- entidad persistida (observación manual, radar por-empresa aún no formalizado).
  -- La FK "fuerte" al lead/campaña se expresa en lead_id / campaign_id.
  source_id              TEXT,
  source_title           TEXT,
  source_context         TEXT,

  -- Relaciones nullable (ON DELETE SET NULL: la propuesta sobrevive al origen,
  -- conservando source_title/source_context como rastro textual).
  lead_id                UUID        REFERENCES leads(id)     ON DELETE SET NULL,
  campaign_id            UUID        REFERENCES campaigns(id) ON DELETE SET NULL,
  -- Radar B2B no tiene tabla propia de señales (opera sobre companies): el
  -- contexto se guarda como JSONB en lugar de una FK.
  radar_context          JSONB,

  -- Público objetivo
  target_type            TEXT        NOT NULL DEFAULT 'unknown'
                         CONSTRAINT proposals_target_type_values
                         CHECK (target_type IN ('person', 'company',
                                                'segment', 'unknown')),
  target_description     TEXT,

  -- Input del asesor
  context                TEXT        NOT NULL,
  objective              TEXT,
  known_problem          TEXT,
  desired_outcome        TEXT,
  notes                  TEXT,

  -- Borrador generado. `draft` (JSONB) es la FUENTE DE VERDAD del ProposalDraft.
  -- Los campos de texto de abajo son DENORMALIZACIONES para listar/buscar sin
  -- deserializar el JSON. Si divergen, `draft` manda.
  draft                  JSONB       NOT NULL DEFAULT '{}'::jsonb,
  summary                TEXT,
  target_audience        TEXT,
  problem                TEXT,
  opportunity            TEXT,
  proposed_offer         TEXT,

  -- Snapshots del lead (FASE 15I) CONGELADOS al crear la propuesta: conservan el
  -- score y la calificación que motivaron la propuesta aunque el lead evolucione.
  score_snapshot         JSONB,
  qualification_snapshot JSONB,

  metadata               JSONB       NOT NULL DEFAULT '{}'::jsonb,

  -- Consistencia mínima (sin sobre-restringir el borrador conceptual):
  CONSTRAINT proposals_title_not_empty
    CHECK (length(btrim(title)) > 0),
  CONSTRAINT proposals_context_not_empty
    CHECK (length(btrim(context)) > 0)
);

CREATE OR REPLACE TRIGGER proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. COMENTARIOS
-- ---------------------------------------------------------------------------
COMMENT ON TABLE proposals IS
  'Propuesta comercial persistida (FASE 15J). Puede nacer de un lead, una campaña, '
  'el radar B2B o una observación manual. El borrador se genera en modo determinístico '
  'interno (sin OpenAI ni proveedor externo) y requiere validación humana. '
  'No reintroduce Compliance en ninguna forma. Crear una propuesta NO crea una '
  'oportunidad (la conversión se diseña en FASE 15O).';

COMMENT ON COLUMN proposals.created_by IS
  'Autor de la propuesta (profiles.id). NOT NULL: toda propuesta tiene autor.';
COMMENT ON COLUMN proposals.status IS
  'Ciclo de vida comercial: draft, in_review, ready, used, archived. Sin estado de compliance.';
COMMENT ON COLUMN proposals.source IS
  'Origen: lead, campaign, radar, manual, market_observation, other.';
COMMENT ON COLUMN proposals.source_id IS
  'Referencia textual libre al origen (puede no ser UUID). La FK fuerte va en lead_id/campaign_id.';
COMMENT ON COLUMN proposals.radar_context IS
  'Contexto del Radar B2B (empresa/señal detectada) como JSONB. El radar no tiene tabla de señales.';
COMMENT ON COLUMN proposals.draft IS
  'ProposalDraft completo generado (JSONB). FUENTE DE VERDAD del borrador; los campos '
  'summary/target_audience/problem/opportunity/proposed_offer son denormalizaciones para listar.';
COMMENT ON COLUMN proposals.score_snapshot IS
  'Snapshot del score del lead (FASE 15I) al momento de crear la propuesta. No se recalcula en vivo.';
COMMENT ON COLUMN proposals.qualification_snapshot IS
  'Snapshot de la calificación del lead (FASE 15I) al momento de crear la propuesta.';

-- ---------------------------------------------------------------------------
-- 4. ÍNDICES (sin sobreindexar)
-- ---------------------------------------------------------------------------
-- Orden/listado por fecha (activas)
CREATE INDEX IF NOT EXISTS idx_proposals_created_at
  ON proposals(created_at DESC) WHERE deleted_at IS NULL;

-- Soft-delete y filtros de estado/origen (activas)
CREATE INDEX IF NOT EXISTS idx_proposals_deleted_at ON proposals(deleted_at);
CREATE INDEX IF NOT EXISTS idx_proposals_status
  ON proposals(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_proposals_source
  ON proposals(source) WHERE deleted_at IS NULL;

-- Propiedad/asignación (activas)
CREATE INDEX IF NOT EXISTS idx_proposals_assigned_to
  ON proposals(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_proposals_created_by
  ON proposals(created_by) WHERE deleted_at IS NULL;

-- Vinculación al origen, solo propuestas activas (evita índices sobre huérfanas)
CREATE INDEX IF NOT EXISTS idx_proposals_lead_id
  ON proposals(lead_id)     WHERE deleted_at IS NULL AND lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_proposals_campaign_id
  ON proposals(campaign_id) WHERE deleted_at IS NULL AND campaign_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 5. RLS — Row Level Security
-- ---------------------------------------------------------------------------
-- Decisiones de diseño (idénticas en filosofía a leads):
--   * SELECT: admin/direccion ven todo; el asesor ve propuestas propias
--     (creadas o asignadas); lider_comercial ve las de su equipo vía
--     is_in_my_team(assigned_to). Solo filas no borradas (deleted_at IS NULL).
--   * INSERT: cualquier autenticado crea propuestas propias (created_by =
--     auth.uid()); assigned_to puede ser NULL o uno mismo; admin/direccion
--     pueden asignar a cualquiera.
--   * UPDATE: admin/direccion cualquier propuesta; el asesor solo las propias.
--   * DELETE: NO se otorga a nadie por política. El borrado es soft-delete
--     (UPDATE de deleted_at) — pero NO vía UPDATE directo del cliente (ver abajo).
--
--   ⚠️ SOFT-DELETE — LECCIÓN VALIDADA EN LEADS (FASE 14G-B, QA en dev):
--     El filtro `deleted_at IS NULL` va ÚNICAMENTE en la política SELECT, y las
--     políticas UPDATE evalúan SOLO permisos. ESTO NO ES SUFICIENTE para permitir
--     el soft-delete vía rol `authenticated`: PostgREST ejecuta `UPDATE ... RETURNING`,
--     y en Postgres la fila NUEVA debe cumplir además la política SELECT para poder
--     devolverse. Al setear `deleted_at = NOW()`, la fila nueva deja de cumplir
--     `deleted_at IS NULL` en el SELECT y el UPDATE se rechaza con 42501.
--     SOLUCIÓN: función SECURITY DEFINER `soft_delete_proposal(uuid)` (sección 7).
-- ---------------------------------------------------------------------------

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.proposals'::regclass AND polname = 'proposals_select'
  ) THEN
    CREATE POLICY "proposals_select"
      ON proposals FOR SELECT TO authenticated
      USING (
        deleted_at IS NULL
        AND (
          is_admin_or_direccion()
          OR assigned_to = auth.uid()
          OR created_by = auth.uid()
          OR (get_user_role() = 'lider_comercial' AND is_in_my_team(assigned_to))
        )
      );
  END IF;
END
$$;

-- INSERT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.proposals'::regclass AND polname = 'proposals_insert'
  ) THEN
    CREATE POLICY "proposals_insert"
      ON proposals FOR INSERT TO authenticated
      WITH CHECK (
        created_by = auth.uid()
        AND (assigned_to IS NULL
             OR assigned_to = auth.uid()
             OR is_admin_or_direccion())
      );
  END IF;
END
$$;

-- UPDATE — SOLO permisos en USING y WITH CHECK (deleted_at NO se evalúa aquí:
-- ver nota de soft-delete arriba). Habilita updates operativos del cliente
-- (estado, campos, reasignación). El SOFT-DELETE NO pasa por aquí: se hace vía
-- la función SECURITY DEFINER de la sección 7 (evita el 42501 validado en leads).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.proposals'::regclass AND polname = 'proposals_update'
  ) THEN
    CREATE POLICY "proposals_update"
      ON proposals FOR UPDATE TO authenticated
      USING (
        is_admin_or_direccion()
        OR assigned_to = auth.uid()
        OR created_by = auth.uid()
      )
      WITH CHECK (
        is_admin_or_direccion()
        OR assigned_to = auth.uid()
        OR created_by = auth.uid()
      );
  END IF;
END
$$;

-- DELETE: sin política — nadie borra físicamente vía API.
-- El soft-delete (deleted_at) pasa por la función SECURITY DEFINER (sección 7).

-- ---------------------------------------------------------------------------
-- 6. GRANTS para el rol authenticated
--    RLS sigue siendo el gate: el GRANT solo da el privilegio base
--    (sin GRANT, error 42501). Sin DELETE: consistente con soft-delete.
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON proposals TO authenticated;

-- ---------------------------------------------------------------------------
-- 7. SOFT-DELETE vía función SECURITY DEFINER
--    Motivo: el soft-delete por UPDATE directo del cliente falla con 42501
--    (validado en leads 14G-B). Esta función corre bajo privilegios elevados y
--    hace el UPDATE de deleted_at sin que el cliente cumpla la SELECT sobre la
--    fila nueva. La autorización se verifica EXPLÍCITAMENTE dentro (SECURITY
--    DEFINER omite RLS, así que la política de permisos se replica a mano).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION soft_delete_proposal(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Autorización explícita: solo admin/dirección o dueño/asignado de una fila
  -- activa. auth.uid() sigue leyendo el JWT aunque la función sea DEFINER.
  IF NOT EXISTS (
    SELECT 1 FROM proposals
    WHERE id = p_id
      AND deleted_at IS NULL
      AND (
        is_admin_or_direccion()
        OR assigned_to = auth.uid()
        OR created_by = auth.uid()
      )
  ) THEN
    RAISE EXCEPTION 'No autorizado o propuesta inexistente/ya borrada (id=%)', p_id
      USING ERRCODE = '42501';
  END IF;

  UPDATE proposals SET deleted_at = NOW() WHERE id = p_id;
END;
$$;

-- El EXECUTE se restringe: nadie por defecto, solo authenticated.
REVOKE ALL ON FUNCTION soft_delete_proposal(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION soft_delete_proposal(UUID) TO authenticated;

COMMENT ON FUNCTION soft_delete_proposal(UUID) IS
  'Soft-delete seguro de una propuesta (SECURITY DEFINER). Evita el 42501 del '
  'UPDATE directo bajo RLS (ver leads 14G-B). Verifica permisos de dueño/asignado/'
  'dirección antes de setear deleted_at. No permite DELETE físico.';

-- =============================================================================
-- NOTAS DE SEGURIDAD (resumen):
--   * DELETE físico BLOQUEADO: no hay policy DELETE ni GRANT DELETE.
--   * Borrado = soft-delete vía función SECURITY DEFINER soft_delete_proposal()
--     (el UPDATE directo de deleted_at por el cliente falla con 42501: ver §5/§7).
--   * NO incluye Compliance ni legal_review en ninguna forma.
--   * NO incluye proveedor de IA (OpenAI/GPT): el borrador es determinístico.
--   * `draft` (JSONB) es la fuente de verdad del borrador generado.
--   * score_snapshot / qualification_snapshot CONGELAN el estado del lead (15I).
--   * NO conecta con opportunities (queda para FASE 15O).
-- =============================================================================
