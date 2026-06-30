-- =============================================================================
-- PLIFE Growth OS — SECURITY AUDIT
-- =============================================================================
-- Propósito: revisar el estado de seguridad de la base de datos.
-- Es 100 % READ-ONLY: no realiza ninguna modificación.
--
-- Ejecutar en Supabase → SQL Editor como referencia de auditoría.
-- Revisar manualmente los resultados antes de cualquier cambio.
--
-- Secciones:
--   1. RLS habilitado / deshabilitado por tabla
--   2. Policies de RLS por tabla
--   3. GRANTs por tabla (roles authenticated / anon / service_role)
--   4. Tablas accesibles por anon (riesgo potencial)
--   5. Tablas SIN RLS activo (alerta)
--   6. Tablas sin GRANT para authenticated (pueden fallar con 42501)
--   7. Funciones SECURITY DEFINER
--   8. GRANTs de schema (USAGE)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. RLS habilitado / deshabilitado por tabla
-- ---------------------------------------------------------------------------
SELECT
  schemaname         AS schema,
  tablename          AS tabla,
  rowsecurity        AS rls_habilitado,
  forcerowsecurity   AS rls_forzado
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ---------------------------------------------------------------------------
-- 2. Policies de RLS por tabla
-- ---------------------------------------------------------------------------
SELECT
  schemaname   AS schema,
  tablename    AS tabla,
  policyname   AS policy,
  permissive   AS tipo,           -- PERMISSIVE o RESTRICTIVE
  cmd          AS operacion,      -- SELECT / INSERT / UPDATE / DELETE / ALL
  roles        AS roles_aplicados,
  qual         AS condicion_using,
  with_check   AS condicion_with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ---------------------------------------------------------------------------
-- 3. GRANTs de tabla por rol
-- ---------------------------------------------------------------------------
SELECT
  table_name     AS tabla,
  privilege_type AS privilegio,
  grantee        AS rol
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('authenticated', 'anon', 'service_role')
ORDER BY table_name, grantee, privilege_type;

-- ---------------------------------------------------------------------------
-- 4. Tablas accesibles por anon (revisar con atención)
-- ---------------------------------------------------------------------------
SELECT
  rg.table_name     AS tabla,
  rg.privilege_type AS privilegio
FROM information_schema.role_table_grants rg
WHERE rg.table_schema = 'public'
  AND rg.grantee = 'anon'
ORDER BY rg.table_name;

-- ---------------------------------------------------------------------------
-- 5. Tablas SIN RLS habilitado (alerta de seguridad)
--    Cualquier tabla aquí es accesible sin restricción de fila.
-- ---------------------------------------------------------------------------
SELECT
  tablename AS tabla,
  'ALERTA: RLS deshabilitado' AS estado
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
ORDER BY tablename;

-- ---------------------------------------------------------------------------
-- 6. Tablas sin GRANT SELECT para authenticated
--    Estas tablas fallarán con error 42501 aunque la policy de RLS sea correcta.
-- ---------------------------------------------------------------------------
SELECT
  t.tablename AS tabla,
  'SIN GRANT SELECT para authenticated' AS estado
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.tablename NOT IN (
    SELECT rg.table_name
    FROM information_schema.role_table_grants rg
    WHERE rg.table_schema = 'public'
      AND rg.grantee = 'authenticated'
      AND rg.privilege_type = 'SELECT'
  )
ORDER BY t.tablename;

-- ---------------------------------------------------------------------------
-- 7. Funciones SECURITY DEFINER (ejecutan con privilegios del creador)
--    Son necesarias para helpers de RLS que deben evitar recursión.
--    Revisar que cada una esté justificada.
-- ---------------------------------------------------------------------------
SELECT
  routine_name        AS funcion,
  security_type       AS seguridad,
  routine_definition  AS definicion
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND security_type = 'DEFINER'
ORDER BY routine_name;

-- ---------------------------------------------------------------------------
-- 8. USAGE en schema public por rol
--    Sin USAGE en schema, ningún GRANT de tabla funciona.
-- ---------------------------------------------------------------------------
SELECT
  grantor,
  grantee,
  privilege_type
FROM information_schema.role_usage_grants
WHERE object_schema = 'public'
  AND object_type = 'SCHEMA'
ORDER BY grantee;
