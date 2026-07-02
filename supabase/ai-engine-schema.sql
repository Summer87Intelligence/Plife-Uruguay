-- =============================================================================
-- PLIFE Growth OS — MOTOR IA: SCHEMA (FASE 12O-B)
-- =============================================================================
-- Crea las 8 tablas nuevas del Motor IA PLIFE.
-- NO modifica ninguna tabla existente.
-- NO toca: ai_prompt_versions, ai_interactions, compliance_rules, compliance_reviews.
--
-- Tablas existentes que permanecen INTACTAS:
--   profiles, contacts, companies, opportunities, activities, notes, campaigns,
--   knowledge_documents, knowledge_chunks, ai_interactions, ai_prompt_versions,
--   compliance_rules, compliance_reviews, audit_events, training_modules,
--   roleplay_sessions, objections_library
--
-- Tablas NUEVAS creadas aquí:
--   ai_stages, ai_categories, ai_prompts, ai_analysis_profiles,
--   ai_profile_prompts, ai_prompt_suggestions, ai_execution_runs,
--   ai_execution_outputs
--
-- IDEMPOTENCIA: usa IF NOT EXISTS — ejecutable múltiples veces sin daño.
--
-- ANTES DE EJECUTAR EN REMOTO: leer docs/product/ai-engine-schema-apply-guide.md
-- NO EJECUTAR en producción hasta autorización explícita.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. FUNCIÓN updated_at
--    Reutilizable si ya existe en el proyecto. OR REPLACE es seguro.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 1. ai_stages — Etapas del pipeline de análisis comercial
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_stages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT        NOT NULL UNIQUE,
  label       TEXT        NOT NULL,
  description TEXT,
  sort_order  INT         NOT NULL DEFAULT 0,
  tone        TEXT        NOT NULL DEFAULT 'neutral',
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER ai_stages_updated_at
  BEFORE UPDATE ON ai_stages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. ai_categories — Taxonomía de categorías de prompts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT        NOT NULL UNIQUE,
  label       TEXT        NOT NULL,
  description TEXT,
  tone        TEXT        NOT NULL DEFAULT 'neutral',
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER ai_categories_updated_at
  BEFORE UPDATE ON ai_categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. ai_prompts — Prompts estructurados por campos (NO texto libre)
--    Coexiste con ai_prompt_versions (tabla del copiloto actual). Son distintas.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_prompts (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT        NOT NULL,
  description         TEXT,
  stage_id            UUID        REFERENCES ai_stages(id)     ON DELETE SET NULL,
  category_id         UUID        REFERENCES ai_categories(id) ON DELETE SET NULL,
  -- Campos estructurados del prompt (se construyen en el builder, no texto libre)
  role_persona        TEXT        NOT NULL DEFAULT '',
  context_environment TEXT        NOT NULL DEFAULT '',
  objective           TEXT        NOT NULL DEFAULT '',
  specific_task       TEXT        NOT NULL DEFAULT '',
  constraints         TEXT        NOT NULL DEFAULT '',
  output_format       TEXT        NOT NULL DEFAULT '',
  target_audience     TEXT        NOT NULL DEFAULT '',
  -- Configuración del proveedor
  provider            TEXT        NOT NULL DEFAULT 'openai',
  model               TEXT        NOT NULL DEFAULT 'gpt-4o-mini',
  temperature         NUMERIC(3,2) NOT NULL DEFAULT 0.30
                      CONSTRAINT ai_prompts_temperature_range CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens          INT         NOT NULL DEFAULT 1200
                      CONSTRAINT ai_prompts_max_tokens_positive CHECK (max_tokens > 0),
  -- Estado del ciclo de vida del prompt
  status              TEXT        NOT NULL DEFAULT 'draft'
                      CONSTRAINT ai_prompts_status_values CHECK (status IN ('draft', 'validated', 'archived')),
  is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER ai_prompts_updated_at
  BEFORE UPDATE ON ai_prompts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. ai_analysis_profiles — Perfiles que agrupan prompts para un objetivo
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_analysis_profiles (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT        NOT NULL UNIQUE,
  description         TEXT,
  target_client_type  TEXT,
  target_industries   TEXT,
  base_instructions   TEXT        NOT NULL DEFAULT '',
  is_active           BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER ai_analysis_profiles_updated_at
  BEFORE UPDATE ON ai_analysis_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. ai_profile_prompts — Relación N:M perfil ↔ prompt con orden de ejecución
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_profile_prompts (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id         UUID        NOT NULL REFERENCES ai_analysis_profiles(id) ON DELETE CASCADE,
  prompt_id          UUID        NOT NULL REFERENCES ai_prompts(id)            ON DELETE CASCADE,
  execution_order    INT         NOT NULL DEFAULT 100,
  enabled_by_default BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ai_profile_prompts_unique_pair  UNIQUE (profile_id, prompt_id),
  CONSTRAINT ai_profile_prompts_unique_order UNIQUE (profile_id, execution_order)
);

CREATE OR REPLACE TRIGGER ai_profile_prompts_updated_at
  BEFORE UPDATE ON ai_profile_prompts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 6. ai_prompt_suggestions — Sugerencias de mejora por prompt
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_prompt_suggestions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id         UUID        NOT NULL REFERENCES ai_prompts(id) ON DELETE CASCADE,
  suggestion_type   TEXT        NOT NULL,
  reason            TEXT        NOT NULL,
  suggested_content TEXT,
  status            TEXT        NOT NULL DEFAULT 'open'
                    CONSTRAINT ai_prompt_suggestions_status_values
                    CHECK (status IN ('open', 'accepted', 'dismissed')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ai_prompt_suggestions no tiene updated_at (es un log de sugerencias).

-- ---------------------------------------------------------------------------
-- 7. ai_execution_runs — Ejecución completa de un perfil sobre una entidad
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_execution_runs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type   TEXT        NOT NULL
                CONSTRAINT ai_execution_runs_entity_type_values
                CHECK (entity_type IN ('company', 'contact', 'opportunity', 'campaign')),
  entity_id     UUID        NOT NULL,
  profile_id    UUID        REFERENCES ai_analysis_profiles(id) ON DELETE SET NULL,
  status        TEXT        NOT NULL DEFAULT 'queued'
                CONSTRAINT ai_execution_runs_status_values
                CHECK (status IN ('queued', 'running', 'completed', 'completed_with_errors', 'failed')),
  started_at    TIMESTAMPTZ,
  finished_at   TIMESTAMPTZ,
  error_message TEXT,
  created_by    UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ai_execution_runs no tiene updated_at — el estado se actualiza directamente.

-- ---------------------------------------------------------------------------
-- 8. ai_execution_outputs — Output individual por stage/prompt dentro de un run
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_execution_outputs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id          UUID        NOT NULL REFERENCES ai_execution_runs(id) ON DELETE CASCADE,
  stage_id        UUID        REFERENCES ai_stages(id)  ON DELETE SET NULL,
  prompt_id       UUID        REFERENCES ai_prompts(id) ON DELETE SET NULL,
  execution_order INT         NOT NULL DEFAULT 100,
  status          TEXT        NOT NULL DEFAULT 'queued'
                  CONSTRAINT ai_execution_outputs_status_values
                  CHECK (status IN ('queued', 'running', 'completed', 'failed', 'skipped')),
  output          TEXT,
  error_message   TEXT,
  tokens_input    INT,
  tokens_output   INT,
  cost_estimate   NUMERIC(10,6),
  duration_ms     INT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ai_execution_outputs no tiene updated_at — es inmutable una vez creado.

-- ---------------------------------------------------------------------------
-- ÍNDICES
-- ---------------------------------------------------------------------------

-- ai_prompts
CREATE INDEX IF NOT EXISTS idx_ai_prompts_stage_id     ON ai_prompts(stage_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_category_id  ON ai_prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_status       ON ai_prompts(status);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_is_active    ON ai_prompts(is_active);

-- ai_profile_prompts
CREATE INDEX IF NOT EXISTS idx_ai_profile_prompts_profile_order
  ON ai_profile_prompts(profile_id, execution_order);

-- ai_execution_runs
CREATE INDEX IF NOT EXISTS idx_ai_execution_runs_entity
  ON ai_execution_runs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_execution_runs_profile_id
  ON ai_execution_runs(profile_id);
CREATE INDEX IF NOT EXISTS idx_ai_execution_runs_status
  ON ai_execution_runs(status);
CREATE INDEX IF NOT EXISTS idx_ai_execution_runs_created_at
  ON ai_execution_runs(created_at DESC);

-- ai_execution_outputs
CREATE INDEX IF NOT EXISTS idx_ai_execution_outputs_run_order
  ON ai_execution_outputs(run_id, execution_order);
CREATE INDEX IF NOT EXISTS idx_ai_execution_outputs_prompt_id
  ON ai_execution_outputs(prompt_id);

-- ---------------------------------------------------------------------------
-- RLS (Row Level Security)
-- ---------------------------------------------------------------------------
-- El Motor IA PLIFE es una herramienta de configuración para admin y dirección.
-- Los asesores no acceden a /app/ia ni a estas tablas directamente.
--
-- Helpers de roles disponibles en el proyecto (STABLE SECURITY DEFINER):
--   get_user_role()         → devuelve el rol del usuario autenticado
--   is_admin_or_direccion() → TRUE si el rol es 'admin' o 'direccion'
--
-- Policies preparadas aquí. Requieren validación antes de aplicar en remoto.
-- ---------------------------------------------------------------------------

ALTER TABLE ai_stages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_profile_prompts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_suggestions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_execution_runs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_execution_outputs   ENABLE ROW LEVEL SECURITY;

-- ai_stages: solo admin/dirección configuran; lectura amplia para el motor
CREATE POLICY "ai_stages_select_authenticated"
  ON ai_stages FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "ai_stages_write_admin"
  ON ai_stages FOR ALL TO authenticated
  USING (is_admin_or_direccion())
  WITH CHECK (is_admin_or_direccion());

-- ai_categories: misma lógica que stages
CREATE POLICY "ai_categories_select_authenticated"
  ON ai_categories FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "ai_categories_write_admin"
  ON ai_categories FOR ALL TO authenticated
  USING (is_admin_or_direccion())
  WITH CHECK (is_admin_or_direccion());

-- ai_prompts: lectura para autenticados (el motor los necesita); escritura solo admin
CREATE POLICY "ai_prompts_select_authenticated"
  ON ai_prompts FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "ai_prompts_write_admin"
  ON ai_prompts FOR ALL TO authenticated
  USING (is_admin_or_direccion())
  WITH CHECK (is_admin_or_direccion());

-- ai_analysis_profiles: solo admin/dirección
CREATE POLICY "ai_analysis_profiles_select_admin"
  ON ai_analysis_profiles FOR SELECT TO authenticated
  USING (is_admin_or_direccion());

CREATE POLICY "ai_analysis_profiles_write_admin"
  ON ai_analysis_profiles FOR ALL TO authenticated
  USING (is_admin_or_direccion())
  WITH CHECK (is_admin_or_direccion());

-- ai_profile_prompts: solo admin/dirección
CREATE POLICY "ai_profile_prompts_select_admin"
  ON ai_profile_prompts FOR SELECT TO authenticated
  USING (is_admin_or_direccion());

CREATE POLICY "ai_profile_prompts_write_admin"
  ON ai_profile_prompts FOR ALL TO authenticated
  USING (is_admin_or_direccion())
  WITH CHECK (is_admin_or_direccion());

-- ai_prompt_suggestions: solo admin/dirección
CREATE POLICY "ai_prompt_suggestions_select_admin"
  ON ai_prompt_suggestions FOR SELECT TO authenticated
  USING (is_admin_or_direccion());

CREATE POLICY "ai_prompt_suggestions_write_admin"
  ON ai_prompt_suggestions FOR ALL TO authenticated
  USING (is_admin_or_direccion())
  WITH CHECK (is_admin_or_direccion());

-- ai_execution_runs: admin/dirección ven todos; creador ve los suyos
CREATE POLICY "ai_execution_runs_select"
  ON ai_execution_runs FOR SELECT TO authenticated
  USING (is_admin_or_direccion() OR created_by = auth.uid());

CREATE POLICY "ai_execution_runs_insert"
  ON ai_execution_runs FOR INSERT TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "ai_execution_runs_update_admin"
  ON ai_execution_runs FOR UPDATE TO authenticated
  USING (is_admin_or_direccion() OR created_by = auth.uid());

-- ai_execution_outputs: acceso ligado al run padre
CREATE POLICY "ai_execution_outputs_select"
  ON ai_execution_outputs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ai_execution_runs r
      WHERE r.id = ai_execution_outputs.run_id
        AND (is_admin_or_direccion() OR r.created_by = auth.uid())
    )
  );

CREATE POLICY "ai_execution_outputs_insert"
  ON ai_execution_outputs FOR INSERT TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "ai_execution_outputs_update"
  ON ai_execution_outputs FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ai_execution_runs r
      WHERE r.id = ai_execution_outputs.run_id
        AND (is_admin_or_direccion() OR r.created_by = auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- GRANTS para el rol authenticated
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON ai_stages             TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ai_categories         TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ai_prompts            TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ai_analysis_profiles  TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ai_profile_prompts    TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ai_prompt_suggestions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ai_execution_runs     TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ai_execution_outputs  TO authenticated;
