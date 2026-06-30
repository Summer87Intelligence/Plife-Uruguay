-- ============================================================================
-- fix-profiles-rls.sql
-- ----------------------------------------------------------------------------
-- Contexto del diagnostico (proyecto plife-crm / ayvnloxijnfnooaefrlm):
--
--   * public.profiles TIENE RLS habilitado.
--   * La policy de SELECT propio YA EXISTE y es correcta:
--       profiles_select_own: USING (id = auth.uid() OR is_admin_or_direccion()
--                                    OR (get_user_role() = 'lider_comercial'
--                                        AND is_in_my_team(id)))
--   * Las funciones helper (get_user_role, is_admin_or_direccion, is_in_my_team)
--     son STABLE SECURITY DEFINER => no producen recursion de RLS.
--
-- PROBLEMA REAL DETECTADO:
--   El rol `authenticated` NO tenia GRANT de SELECT/INSERT/UPDATE/DELETE sobre
--   las tablas de `public`. RLS solo FILTRA filas; primero el rol necesita el
--   privilegio base sobre la tabla. Sin GRANT, el SELECT del propio profile
--   fallaba con:
--       ERROR: 42501: permission denied for table profiles
--   El cliente ignoraba ese error => profile = null => "Cuenta sin perfil".
--
-- Las policies siguen siendo el gate de seguridad: otorgar GRANT a
-- `authenticated` NO abre las tablas, porque RLS sigue aplicando.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) FIX MINIMO PARA EL LOGIN (ya aplicado)
--    Permite que el usuario autenticado lea (y actualice) su propio profile.
--    La policy profiles_select_own / profiles_update_own ya restringen a id = auth.uid().
-- ----------------------------------------------------------------------------
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- Garantizar que la policy de SELECT propio exista (idempotente / defensivo).
-- No se borra ni modifica ninguna policy existente.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.profiles'::regclass
      AND polname = 'profiles_select_own'
  ) THEN
    CREATE POLICY "profiles_select_own"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (id = auth.uid());
  END IF;
END
$$;

-- ----------------------------------------------------------------------------
-- 2) FIX MINIMO PARA /app/hoy (dashboard demo)
--    Sin GRANT de SELECT, las queries del dashboard fallan con 42501 antes de RLS.
--    RLS sigue filtrando: admin ve todo via is_admin_or_direccion(), asesor solo lo suyo.
-- ----------------------------------------------------------------------------
GRANT SELECT ON public.contacts TO authenticated;
GRANT SELECT ON public.companies TO authenticated;
GRANT SELECT ON public.opportunities TO authenticated;
GRANT SELECT ON public.campaigns TO authenticated;
GRANT SELECT ON public.activities TO authenticated;

-- ----------------------------------------------------------------------------
-- 3) OPCIONAL (schema-wide) -- REVISAR ANTES DE EJECUTAR
--    Aplicar solo si aparecen permission denied en otras tablas (ej. notes, teams).
--    Todas las tablas tienen RLS habilitado con policies.
--
--    Descomentar para aplicar a todo el esquema:
-- ----------------------------------------------------------------------------
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
--
-- -- Para que las tablas NUEVAS hereden los privilegios automaticamente:
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public
--   GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public
--   GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- ----------------------------------------------------------------------------
-- 4) VALIDACION
--    Simular el SELECT como el usuario admin autenticado.
--    Debe devolver exactamente 1 fila.
-- ----------------------------------------------------------------------------
-- set local role authenticated;
-- set local request.jwt.claims = '{"sub":"9fb93ddc-7c77-40e1-ab89-1f68ceee8404","role":"authenticated"}';
-- select id, email, role, is_active from public.profiles where id = auth.uid();
