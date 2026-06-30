-- =============================================================================
-- PLIFE Growth OS — FIX APP GRANTS (MÍNIMO PARA authenticated)
-- =============================================================================
-- Propósito: otorgar los privilegios mínimos para que el rol `authenticated`
-- pueda operar. RLS sigue siendo el filtro real de filas.
--
-- IMPORTANTE:
--   - GRANT solo desbloquea el acceso a nivel de objeto.
--   - RLS restringe qué filas puede ver / modificar cada usuario.
--   - Sin este GRANT, las queries fallan con: ERROR 42501 permission denied.
--   - No se otorga ningún privilegio a `anon` en tablas sensibles.
--
-- Cuándo ejecutar:
--   - Luego de crear tablas nuevas que la app deba usar.
--   - Si aparecen errores 42501 en producción/staging.
--
-- Ejecutar en Supabase → SQL Editor (o con psql como postgres role).
-- Es idempotente: ejecutarlo varias veces no produce efectos secundarios.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. USAGE en schema public
--    Requerido para que cualquier acceso a tabla funcione.
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO authenticated;

-- ---------------------------------------------------------------------------
-- 1. PROFILES
--    - SELECT y UPDATE: asesor lee/actualiza su propio perfil.
--    - INSERT lo hace el trigger de auth (ejecuta como service_role).
-- ---------------------------------------------------------------------------
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. EQUIPOS (solo lectura para la app; gestión desde admin SQL)
-- ---------------------------------------------------------------------------
GRANT SELECT ON public.teams        TO authenticated;
GRANT SELECT ON public.team_members TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. CRM CORE: Contactos, Empresas, Oportunidades, Actividades, Notas
--    - SELECT: todos los roles autenticados (RLS filtra por assigned_to).
--    - INSERT / UPDATE: usuarios crean y editan sus registros.
--    - DELETE: NO se otorga — el sistema usa soft-delete (deleted_at).
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON public.contacts      TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.companies     TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.opportunities TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.activities    TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notes         TO authenticated;

-- ---------------------------------------------------------------------------
-- 4. CAMPAÑAS
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON public.campaigns TO authenticated;

-- campaign_targets y campaign_messages: tablas planificadas.
-- Descomentar cuando existan en el schema:
-- GRANT SELECT, INSERT, UPDATE ON public.campaign_targets  TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON public.campaign_messages TO authenticated;

-- ---------------------------------------------------------------------------
-- 5. BASE DE CONOCIMIENTO
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON public.knowledge_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.knowledge_chunks    TO authenticated;

-- ---------------------------------------------------------------------------
-- 6. IA
--    - ai_interactions: INSERT para registrar cada uso del copiloto.
--    - ai_prompt_versions: solo lectura (configuración de agentes).
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT ON public.ai_interactions   TO authenticated;
GRANT SELECT         ON public.ai_prompt_versions TO authenticated;

-- ---------------------------------------------------------------------------
-- 7. COMPLIANCE
--    - compliance_rules: solo lectura (configuración).
--    - compliance_reviews: INSERT para registrar revisiones.
-- ---------------------------------------------------------------------------
GRANT SELECT         ON public.compliance_rules   TO authenticated;
GRANT SELECT, INSERT ON public.compliance_reviews TO authenticated;

-- ---------------------------------------------------------------------------
-- 8. ACADEMIA
--    - training_modules: solo lectura.
--    - roleplay_sessions: usuarios crean y completan sesiones.
--    - objections_library: solo lectura.
-- ---------------------------------------------------------------------------
GRANT SELECT                  ON public.training_modules  TO authenticated;
GRANT SELECT, INSERT, UPDATE  ON public.roleplay_sessions TO authenticated;
GRANT SELECT                  ON public.objections_library TO authenticated;

-- ---------------------------------------------------------------------------
-- 9. AUDIT EVENTS
--    - INSERT a través de la función log_audit_event (SECURITY DEFINER).
--    - SELECT para que admin/dirección puedan consultarlos (RLS filtra).
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT ON public.audit_events TO authenticated;

-- ---------------------------------------------------------------------------
-- 10. SEQUENCES (si alguna tabla usa SERIAL en lugar de gen_random_uuid)
--    La mayoría de las tablas usan UUID. Descomentar solo si aparecen errores
--    de secuencia al hacer INSERT.
-- ---------------------------------------------------------------------------
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ---------------------------------------------------------------------------
-- 11. DEFAULT PRIVILEGES (tablas futuras hereden los permisos)
--    Al ejecutar esto, cualquier tabla nueva creada por el rol `postgres`
--    tendrá automáticamente SELECT, INSERT, UPDATE para `authenticated`.
-- ---------------------------------------------------------------------------
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE ON TABLES TO authenticated;

-- ---------------------------------------------------------------------------
-- VERIFICACIÓN: tablas que ahora tienen SELECT para authenticated
-- ---------------------------------------------------------------------------
-- SELECT table_name, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE table_schema = 'public'
--   AND grantee = 'authenticated'
--   AND privilege_type = 'SELECT'
-- ORDER BY table_name;
