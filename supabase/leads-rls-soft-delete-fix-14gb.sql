-- ============================================================================
-- DEV APPLIED PATCH / FASE 14G-B
-- Fix soft-delete RLS for leads (Supabase dev only, ref ayvnloxijnfnooaefrlm)
-- No physical DELETE; mantiene SELECT ocultando deleted_at IS NOT NULL.
-- ============================================================================

-- 1) REEMPLAZAR POLICY leads_update PARA PERMITIR SOFT-DELETE BAJO RLS
-- --------------------------------------------------------------------
-- Problema original:
--   - leads_select: USING (deleted_at IS NULL AND <permisos>)
--   - leads_update: USING (permisos) WITH CHECK (permisos)
--   - Al hacer UPDATE deleted_at = NOW(), la fila nueva deja de cumplir
--     leads_select (deleted_at IS NULL) → Postgres rechaza el UPDATE con 42501.
--
-- Objetivo:
--   - Admin/dirección puede soft-delete cualquier lead.
--   - Asesor puede soft-delete solo sus propios leads (assigned_to/created_by).
--   - DELETE físico sigue bloqueado (sin política DELETE, sin GRANT DELETE).
--   - SELECT sigue filtrando deleted_at IS NOT NULL.
--
-- Estrategia:
--   - Ajustar leads_update para:
--       * USING: permisos sobre la fila ORIGINAl (sin deleted_at).
--       * WITH CHECK: permitir filas nuevas con deleted_at IS NOT NULL siempre
--         que el usuario conserve permisos sobre la fila (admin/own).
--   - leads_select permanece igual, por lo que filas soft-deleted no son visibles.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.leads'::regclass
      AND polname = 'leads_update'
  ) THEN
    DROP POLICY "leads_update" ON leads;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.leads'::regclass
      AND polname = 'leads_update'
  ) THEN
    CREATE POLICY "leads_update"
      ON leads FOR UPDATE TO authenticated
      USING (
        -- Permisos sobre la fila original (puede tener deleted_at IS NULL)
        is_admin_or_direccion()
        OR assigned_to = auth.uid()
        OR created_by = auth.uid()
      )
      WITH CHECK (
        -- Permisos mantienen al usuario autorizado sobre la fila nueva;
        -- el filtrado por deleted_at IS NULL queda SOLO en leads_select.
        is_admin_or_direccion()
        OR assigned_to = auth.uid()
        OR created_by = auth.uid()
      );
  END IF;
END
$$;

-- 2) VERIFICACIÓN OPCIONAL (solo lectura)
-- ---------------------------------------
-- SELECT polname, polcmd, pg_get_expr(polqual, polrelid) AS using_expr,
--        pg_get_expr(polwithcheck, polrelid) AS with_check_expr
-- FROM pg_policy
-- WHERE polrelid = 'public.leads'::regclass
-- ORDER BY polname;

