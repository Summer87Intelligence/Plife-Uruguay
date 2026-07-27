-- =============================================================================
-- PENDIENTE DE APLICAR — Gestión de Pólizas, Bloque Técnico 1 (2026-07-24)
-- Proyecto: plife-crm (Supabase DEV)
-- Origen: docs/product/PLIFE-GESTION-POLIZAS-V1.md (definición funcional)
-- NO producción · NO otros proyectos · NO tabla `polizas` (queda para el
-- Bloque Técnico 2) · NO comisión, productos, coberturas, documentos, Storage,
-- renovaciones, alertas, timeline, CTA de pólizas, integración FCG ni
-- extracción a Summer87 OS.
-- =============================================================================
-- PLIFE Growth OS — Catálogos base de Gestión de Pólizas: Aseguradoras y Ramos
--
-- ALCANCE EXCLUSIVO: dos catálogos administrables (`insurers`, `insurance_branches`).
-- SIN relación aseguradora ↔ ramo todavía (no se crea ninguna FK entre ellas).
--
-- IDEMPOTENCIA: CREATE TABLE IF NOT EXISTS / CREATE OR REPLACE / DO $$ IF NOT
-- EXISTS — ejecutable múltiples veces sin efectos duplicados.
--
-- CONVENCIONES DEL PROYECTO SEGUIDAS (idénticas a proposals/leads):
--   * set_updated_at() — función global ya usada por leads/proposals/Motor IA.
--   * FKs de responsables → profiles(id) (NO auth.users). ON DELETE SET NULL
--     (created_by/updated_by son nullable: no hay borrado físico de perfiles,
--     pero no deben bloquear si algún día lo hubiera).
--   * RLS con helper existente en la base (STABLE SECURITY DEFINER):
--       get_user_role()
--     La precondición de abajo aborta si no existe — NO se aplica una policy
--     permisiva como fallback (regla explícita de esta tarea).
--   * Sin ENUM de Postgres: is_active es boolean simple (no hay estados
--     intermedios en un catálogo, a diferencia de proposals/leads).
--   * Baja lógica únicamente: is_active=false. Sin política ni GRANT de DELETE.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. PRECONDICIÓN: abortar si el helper de rol no existe
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'get_user_role' AND n.nspname = 'public'
  ) THEN
    RAISE EXCEPTION
      'PRECONDICIÓN FALLIDA: falta la función public.get_user_role() — no se puede '
      'construir el RLS admin-only de insurers/insurance_branches sin ella. '
      'Ver docs/product/PLIFE-GESTION-POLIZAS-V1.md antes de aplicar esta migración. '
      'NO se aplica ninguna policy permisiva como fallback.';
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
-- 2. TABLA insurers — catálogo de aseguradoras
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS insurers (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  normalized_name TEXT        NOT NULL,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by      UUID        REFERENCES profiles(id) ON DELETE SET NULL,

  CONSTRAINT insurers_name_not_empty CHECK (length(btrim(name)) > 0),
  CONSTRAINT insurers_normalized_name_key UNIQUE (normalized_name)
);

CREATE OR REPLACE TRIGGER insurers_updated_at
  BEFORE UPDATE ON insurers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_insurers_name ON insurers(name);
CREATE INDEX IF NOT EXISTS idx_insurers_is_active ON insurers(is_active);

COMMENT ON TABLE insurers IS
  'Catálogo administrable de aseguradoras (Gestión de Pólizas, Bloque Técnico 1). '
  'Baja lógica únicamente (is_active). Sin relación con ramos ni con pólizas todavía.';
COMMENT ON COLUMN insurers.normalized_name IS
  'Nombre normalizado (minúsculas, sin acentos, espacios colapsados) — misma '
  'función normalizeText() de src/domains/duplicates/normalize.ts, calculada en '
  'la capa de dominio antes de insertar/actualizar. Único: evita duplicados case-insensitive.';

-- ---------------------------------------------------------------------------
-- 3. TABLA insurance_branches — catálogo de ramos
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS insurance_branches (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  normalized_name TEXT        NOT NULL,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by      UUID        REFERENCES profiles(id) ON DELETE SET NULL,

  CONSTRAINT insurance_branches_name_not_empty CHECK (length(btrim(name)) > 0),
  CONSTRAINT insurance_branches_normalized_name_key UNIQUE (normalized_name)
);

CREATE OR REPLACE TRIGGER insurance_branches_updated_at
  BEFORE UPDATE ON insurance_branches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_insurance_branches_name ON insurance_branches(name);
CREATE INDEX IF NOT EXISTS idx_insurance_branches_is_active ON insurance_branches(is_active);

COMMENT ON TABLE insurance_branches IS
  'Catálogo administrable de ramos de seguro (Gestión de Pólizas, Bloque Técnico 1). '
  'Baja lógica únicamente (is_active). Sin relación con aseguradoras ni con pólizas todavía.';

-- ---------------------------------------------------------------------------
-- 4. RLS — Row Level Security
-- ---------------------------------------------------------------------------
-- Decisiones de diseño (según docs/product/PLIFE-GESTION-POLIZAS-V1.md, decisión 2):
--   * SELECT: cualquier autenticado ve registros activos; admin ve activos e
--     inactivos (para administrar altas/bajas).
--   * INSERT/UPDATE: solo admin.
--   * DELETE: sin política — nadie borra físicamente vía API (baja lógica only).
--   * "dirección: lectura, no administración" ya queda cubierto por la policy
--     de SELECT de activos (dirección es un rol autenticado más); no se le da
--     acceso a inactivos porque eso es superficie de administración, no de
--     consulta operativa.
-- ---------------------------------------------------------------------------

ALTER TABLE insurers ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_branches ENABLE ROW LEVEL SECURITY;

-- SELECT — insurers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.insurers'::regclass AND polname = 'insurers_select'
  ) THEN
    CREATE POLICY "insurers_select"
      ON insurers FOR SELECT TO authenticated
      USING (is_active = true OR get_user_role() = 'admin');
  END IF;
END
$$;

-- INSERT — insurers (solo admin)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.insurers'::regclass AND polname = 'insurers_insert'
  ) THEN
    CREATE POLICY "insurers_insert"
      ON insurers FOR INSERT TO authenticated
      WITH CHECK (get_user_role() = 'admin');
  END IF;
END
$$;

-- UPDATE — insurers (solo admin; incluye activar/desactivar y editar nombre)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.insurers'::regclass AND polname = 'insurers_update'
  ) THEN
    CREATE POLICY "insurers_update"
      ON insurers FOR UPDATE TO authenticated
      USING (get_user_role() = 'admin')
      WITH CHECK (get_user_role() = 'admin');
  END IF;
END
$$;

-- SELECT — insurance_branches
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.insurance_branches'::regclass AND polname = 'insurance_branches_select'
  ) THEN
    CREATE POLICY "insurance_branches_select"
      ON insurance_branches FOR SELECT TO authenticated
      USING (is_active = true OR get_user_role() = 'admin');
  END IF;
END
$$;

-- INSERT — insurance_branches (solo admin)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.insurance_branches'::regclass AND polname = 'insurance_branches_insert'
  ) THEN
    CREATE POLICY "insurance_branches_insert"
      ON insurance_branches FOR INSERT TO authenticated
      WITH CHECK (get_user_role() = 'admin');
  END IF;
END
$$;

-- UPDATE — insurance_branches (solo admin)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.insurance_branches'::regclass AND polname = 'insurance_branches_update'
  ) THEN
    CREATE POLICY "insurance_branches_update"
      ON insurance_branches FOR UPDATE TO authenticated
      USING (get_user_role() = 'admin')
      WITH CHECK (get_user_role() = 'admin');
  END IF;
END
$$;

-- DELETE: sin política en ninguna de las dos tablas — nadie borra físicamente.

-- ---------------------------------------------------------------------------
-- 5. GRANTS para el rol authenticated (sin DELETE — consistente con baja lógica)
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON insurers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON insurance_branches TO authenticated;

-- ---------------------------------------------------------------------------
-- 6. SEED CONTROLADO — idempotente vía ON CONFLICT (normalized_name)
-- ---------------------------------------------------------------------------
-- normalized_name calculado a mano replicando normalizeText() de
-- src/domains/duplicates/normalize.ts (minúsculas, sin acentos, espacios
-- colapsados, sin sufijos societarios) para que un futuro insert desde la app
-- (que sí usa esa función) choque correctamente contra estas filas semilla.
-- ---------------------------------------------------------------------------

INSERT INTO insurers (name, normalized_name) VALUES
  ('BSE', 'bse'),
  ('Porto Seguro', 'porto seguro'),
  ('Mapfre', 'mapfre'),
  ('SURA', 'sura')
ON CONFLICT (normalized_name) DO NOTHING;

INSERT INTO insurance_branches (name, normalized_name) VALUES
  ('Vehículos', 'vehiculos'),
  ('Responsabilidad civil', 'responsabilidad civil'),
  ('Accidentes de trabajo', 'accidentes de trabajo'),
  ('Vida', 'vida'),
  ('Incendio', 'incendio'),
  ('Transporte', 'transporte'),
  ('Hogar', 'hogar'),
  ('Comercio', 'comercio')
ON CONFLICT (normalized_name) DO NOTHING;

-- =============================================================================
-- NOTAS DE SEGURIDAD (resumen):
--   * DELETE físico BLOQUEADO: no hay policy DELETE ni GRANT DELETE en ninguna tabla.
--   * Baja = is_active = false vía UPDATE (solo admin, misma policy de escritura).
--   * Escritura (INSERT/UPDATE) restringida a get_user_role() = 'admin'.
--   * Lectura de activos abierta a cualquier autenticado (incluye dirección,
--     asesor, líder_comercial); lectura de inactivos solo admin.
--   * Sin relación aseguradora↔ramo. Sin tabla `polizas`. Sin comisión.
--   * Sin integración con FCG. Sin extracción a Summer87 OS.
-- =============================================================================
