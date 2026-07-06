-- =============================================================================
-- DRAFT ONLY.
-- Do not apply automatically.
-- FASE 14B — Lead-first CRM schema draft.
-- =============================================================================
-- PLIFE Growth OS — LEADS + PIPELINE: SCHEMA DRAFT
--
-- Diseño base: docs/product/lead-pipeline-technical-design.md (FASE 14A)
-- Guía de aplicación futura: docs/product/leads-schema-apply-guide.md
--
-- ADITIVO: crea la tabla `leads` y agrega UNA columna nullable a `opportunities`.
-- NO modifica de forma destructiva ninguna tabla existente.
-- NO migra datos.
--
-- Tablas existentes que permanecen INTACTAS:
--   profiles, contacts, companies, opportunities (solo columna aditiva nullable),
--   activities, campaigns, y todas las tablas del Motor IA.
--
-- IDEMPOTENCIA: usa IF NOT EXISTS / OR REPLACE — ejecutable múltiples veces.
--
-- CONVENCIONES DEL PROYECTO SEGUIDAS:
--   * CHECK constraints sobre TEXT (no enums Postgres) — consistente con
--     ai-engine-schema.sql (ai_prompts.status, ai_execution_runs.status, etc.).
--     Motivo: los CHECK son más fáciles de evolucionar (ALTER CONSTRAINT vs
--     ALTER TYPE con locks) y es el patrón ya establecido en el proyecto.
--   * set_updated_at() — función global ya usada por el Motor IA.
--   * RLS con helpers existentes en la base remota:
--       is_admin_or_direccion()  (STABLE SECURITY DEFINER)
--       get_user_role()          (STABLE SECURITY DEFINER)
--       is_in_my_team(uuid)      (STABLE SECURITY DEFINER)
--     Nota: estas funciones NO tienen CREATE FUNCTION en archivos locales —
--     fueron creadas directamente en Supabase. La precondición de abajo aborta
--     si no existen.
--
-- NO EJECUTAR en remoto hasta autorización explícita.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. PRECONDICIÓN: abortar si los helpers de roles no existen
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'is_admin_or_direccion'
      AND n.nspname = 'public'
  ) THEN
    RAISE EXCEPTION
      'PRECONDICIÓN FALLIDA: public.is_admin_or_direccion() no existe. '
      'Ver docs/product/leads-schema-apply-guide.md antes de aplicar.';
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
-- 2. TABLA leads — entrada inicial de cualquier posible venta
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,

  -- Asignación y auditoría (mismo patrón que contacts/companies/opportunities)
  assigned_to       UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  created_by        UUID        REFERENCES profiles(id) ON DELETE SET NULL,

  -- Identificación del lead
  title             TEXT        NOT NULL,
  display_name      TEXT,

  -- Clasificación (el lead es único; el tipo es un campo, no una sección)
  lead_type         TEXT        NOT NULL DEFAULT 'unknown'
                    CONSTRAINT leads_lead_type_values
                    CHECK (lead_type IN ('person', 'company', 'unknown')),

  source            TEXT        NOT NULL DEFAULT 'manual'
                    CONSTRAINT leads_source_values
                    CHECK (source IN ('manual', 'referral', 'whatsapp', 'instagram',
                                      'web', 'call', 'campaign', 'radar_b2b', 'other')),

  status            TEXT        NOT NULL DEFAULT 'open'
                    CONSTRAINT leads_status_values
                    CHECK (status IN ('open', 'converted', 'discarded', 'archived')),

  pipeline_stage    TEXT        NOT NULL DEFAULT 'nuevo'
                    CONSTRAINT leads_pipeline_stage_values
                    CHECK (pipeline_stage IN ('nuevo', 'contactado', 'calificando',
                                              'interesado', 'propuesta_reunion',
                                              'seguimiento', 'convertido', 'descartado')),

  priority          TEXT        NOT NULL DEFAULT 'medium'
                    CONSTRAINT leads_priority_values
                    CHECK (priority IN ('low', 'medium', 'high')),

  temperature       TEXT        NOT NULL DEFAULT 'warm'
                    CONSTRAINT leads_temperature_values
                    CHECK (temperature IN ('cold', 'warm', 'hot')),

  -- Datos de contacto e interés (todos opcionales — captura progresiva)
  interest_area     TEXT,
  phone             TEXT,
  email             TEXT,
  company_name_raw  TEXT,
  person_name_raw   TEXT,

  -- Vinculación con entidades existentes (se completan al calificar/convertir)
  company_id        UUID        REFERENCES companies(id)     ON DELETE SET NULL,
  contact_id        UUID        REFERENCES contacts(id)      ON DELETE SET NULL,
  campaign_id       UUID        REFERENCES campaigns(id)     ON DELETE SET NULL,
  -- radar_source_id referencia companies: el radar actual opera sobre la tabla
  -- companies (b2b_status/b2b_score); no existe tabla separada de señales.
  radar_source_id   UUID        REFERENCES companies(id)     ON DELETE SET NULL,
  opportunity_id    UUID        REFERENCES opportunities(id) ON DELETE SET NULL,

  -- Paradigma next-action (mismo patrón que contacts/opportunities → PLIFE Hoy)
  next_action       TEXT,
  next_action_date  DATE,
  notes             TEXT,

  -- Ciclo de vida
  converted_at      TIMESTAMPTZ,
  discarded_at      TIMESTAMPTZ,
  discard_reason    TEXT,

  metadata          JSONB       NOT NULL DEFAULT '{}'::jsonb,

  -- Consistencia de ciclo de vida (simple, sin sobrecomplicar):
  CONSTRAINT leads_converted_requires_timestamp
    CHECK (status <> 'converted' OR converted_at IS NOT NULL),
  CONSTRAINT leads_discarded_requires_fields
    CHECK (status <> 'discarded' OR (discarded_at IS NOT NULL AND discard_reason IS NOT NULL))
);

CREATE OR REPLACE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. COMENTARIOS
-- ---------------------------------------------------------------------------
COMMENT ON TABLE leads IS
  'Entrada inicial de cualquier posible venta (modelo Lead-first, FASE 14). '
  'El lead captura el interés antes de que exista empresa, contacto u oportunidad. '
  'La oportunidad es el negocio calificado: se crea solo cuando el lead alcanza '
  'la etapa interesado o posterior. IA y compliance son apoyo, nunca deciden. '
  'El modo open-access temporal de la UI NO afecta estas políticas RLS.';

COMMENT ON COLUMN leads.lead_type IS
  'person / company / unknown. El lead es único: el tipo se clasifica dentro del lead, no hay secciones separadas.';
COMMENT ON COLUMN leads.source IS
  'Origen del lead: manual, referral, whatsapp, instagram, web, call, campaign, radar_b2b, other.';
COMMENT ON COLUMN leads.status IS
  'Ciclo de vida: open (en gestión), converted (generó entidades), discarded (sin potencial este ciclo), archived (fuera de gestión).';
COMMENT ON COLUMN leads.pipeline_stage IS
  'Etapa comercial del lead. Las etapas tempranas de prospección viven aquí; el stage de opportunities queda para el ciclo de cierre.';
COMMENT ON COLUMN leads.company_name_raw IS
  'Nombre de empresa como texto libre antes de crear/vincular la entidad companies.';
COMMENT ON COLUMN leads.person_name_raw IS
  'Nombre de persona como texto libre antes de crear/vincular la entidad contacts.';
COMMENT ON COLUMN leads.radar_source_id IS
  'Empresa detectada por Radar B2B que originó este lead (FK a companies; el radar no tiene tabla propia de señales).';
COMMENT ON COLUMN leads.opportunity_id IS
  'Oportunidad creada al convertir el lead calificado. Nullable: solo leads convertidos en negocio la tienen.';
COMMENT ON COLUMN leads.next_action IS
  'Próximo paso concreto. Mismo paradigma que contacts/opportunities — alimenta PLIFE Hoy.';
COMMENT ON COLUMN leads.discard_reason IS
  'Obligatorio cuando status = discarded (constraint leads_discarded_requires_fields).';

-- ---------------------------------------------------------------------------
-- 4. ÍNDICES
-- ---------------------------------------------------------------------------
-- Filtros principales del listado y del tablero pipeline
CREATE INDEX IF NOT EXISTS idx_leads_status           ON leads(status)           WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage   ON leads(pipeline_stage)   WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to      ON leads(assigned_to)      WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_next_action_date ON leads(next_action_date) WHERE deleted_at IS NULL;

-- FKs de vinculación
CREATE INDEX IF NOT EXISTS idx_leads_company_id     ON leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_contact_id     ON leads(contact_id);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id    ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_opportunity_id ON leads(opportunity_id);

-- Detección de duplicados (mismo enfoque que src/domains/duplicates)
CREATE INDEX IF NOT EXISTS idx_leads_email_lower ON leads(LOWER(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_phone       ON leads(phone)        WHERE phone IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 5. ADITIVO EN opportunities — trazabilidad inversa lead → negocio
--    Nullable. NO migra datos. Las oportunidades existentes quedan con NULL.
-- ---------------------------------------------------------------------------
ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS lead_id UUID NULL REFERENCES leads(id) ON DELETE SET NULL;

COMMENT ON COLUMN opportunities.lead_id IS
  'Lead que originó esta oportunidad (modelo Lead-first, FASE 14). '
  'Nullable: oportunidades previas al modelo no tienen lead de origen.';

CREATE INDEX IF NOT EXISTS idx_opportunities_lead_id ON opportunities(lead_id);

-- ---------------------------------------------------------------------------
-- 6. RLS — Row Level Security
-- ---------------------------------------------------------------------------
-- Decisiones de diseño:
--   * SELECT: admin/direccion ven todo; el asesor ve leads propios (asignados
--     o creados por él); lider_comercial ve leads de su equipo vía is_in_my_team().
--     Solo filas no borradas (soft-delete).
--   * INSERT: cualquier autenticado puede crear leads asignados a sí mismo
--     (captura rápida es el objetivo del modelo); admin/direccion pueden
--     asignar a cualquiera.
--   * UPDATE: admin/direccion cualquier lead; el asesor solo los propios.
--     NOTA: RLS de Postgres no restringe columnas por política — la limitación
--     de "campos editables por asesor" (si se decide) se aplica en la capa de
--     server actions (14F), no aquí. Documentado como decisión, no como TODO.
--   * DELETE: NO se otorga a nadie por política. El borrado es soft-delete
--     (UPDATE de deleted_at), consistente con el resto del sistema.
--   * El modo open-access temporal de la UI (PR #2) no afecta estas políticas:
--     RLS protege en servidor independientemente de la navegación visible.
-- ---------------------------------------------------------------------------

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- SELECT: propios + equipo (líder) + todos (admin/direccion); nunca borrados
CREATE POLICY "leads_select"
  ON leads FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      is_admin_or_direccion()
      OR assigned_to = auth.uid()
      OR created_by = auth.uid()
      OR (get_user_role() = 'lider_comercial' AND is_in_my_team(assigned_to))
    )
  );

-- INSERT: asignarse a sí mismo, o admin/direccion asignan a cualquiera.
-- created_by debe ser el usuario autenticado (no se crean leads en nombre de otro).
CREATE POLICY "leads_insert"
  ON leads FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (assigned_to = auth.uid() OR is_admin_or_direccion())
  );

-- UPDATE: admin/direccion cualquier lead; asesor los propios.
-- WITH CHECK evita reasignar created_by; la reasignación de assigned_to por
-- asesores comunes se controla en server actions (14F).
CREATE POLICY "leads_update"
  ON leads FOR UPDATE TO authenticated
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

-- DELETE: sin política — nadie borra físicamente vía API.
-- El soft-delete (deleted_at) pasa por la política de UPDATE.

-- ---------------------------------------------------------------------------
-- 7. GRANTS para el rol authenticated
--    RLS sigue siendo el gate: el GRANT solo da el privilegio base
--    (ver diagnóstico en fix-profiles-rls.sql — sin GRANT, error 42501).
--    Sin DELETE: consistente con soft-delete.
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON leads TO authenticated;

-- ---------------------------------------------------------------------------
-- 8. SEED DEMO OPCIONAL — SEPARADO Y COMENTADO
--    NO se ejecuta con el schema. Solo para smoke test manual post-aplicación.
--    Reemplazar <ADMIN_PROFILE_ID> por un profiles.id real antes de usar.
-- ---------------------------------------------------------------------------
-- INSERT INTO leads (title, display_name, lead_type, source, interest_area,
--                    phone, next_action, next_action_date,
--                    assigned_to, created_by, notes)
-- VALUES (
--   'Lead Demo Tutorial PLIFE',
--   'Persona Demo',
--   'person',
--   'manual',
--   'Seguro de vida — interés inicial',
--   '099000222',
--   'Llamar para primer contacto',
--   CURRENT_DATE + 1,
--   '<ADMIN_PROFILE_ID>',
--   '<ADMIN_PROFILE_ID>',
--   'Registro demo creado para smoke test del schema leads. Eliminar tras validar.'
-- );
--
-- Limpieza del demo (soft-delete):
-- UPDATE leads SET deleted_at = NOW() WHERE title = 'Lead Demo Tutorial PLIFE';

-- =============================================================================
-- FIN DEL DRAFT — NO APLICAR SIN LEER docs/product/leads-schema-apply-guide.md
-- =============================================================================
