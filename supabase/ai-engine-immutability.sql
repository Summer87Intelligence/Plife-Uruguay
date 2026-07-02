-- =============================================================================
-- PLIFE Growth OS — Motor IA: Triggers de Inmutabilidad (FASE 12O-B4)
-- =============================================================================
-- Propósito: Cerrar hallazgos F-03 y F-04 de la auditoría FASE 12O-B3.
--
-- Estos triggers son una segunda capa de protección que opera a nivel de base
-- de datos y aplica INCLUSO para el rol service_role (que bypasea RLS).
--
-- ORDEN DE APLICACIÓN: ejecutar DESPUÉS de ai-engine-schema.sql y
-- ANTES de ai-engine-seed.sql.
--
-- IDEMPOTENCIA: usa CREATE OR REPLACE — ejecutable múltiples veces sin daño.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- F-03: Inmutabilidad de campos de contexto en ai_execution_runs
-- ---------------------------------------------------------------------------
-- Problema: las policies RLS verifican QUIÉN puede actualizar un run, pero no
-- QUÉ campos puede cambiar. Un asesor podría reasignar retroactivamente un run
-- a otra empresa (entity_id), tipo de entidad (entity_type), perfil (profile_id)
-- o incluso cambiar el dueño del run (created_by si es admin).
--
-- Solución: trigger BEFORE UPDATE que aborta cualquier intento de modificar
-- los campos de contexto post-INSERT, independientemente del rol.
--
-- Campos INMUTABLES (este trigger los protege):
--   entity_id    — empresa/contacto/oportunidad/campaña analizada
--   entity_type  — tipo de la entidad
--   profile_id   — perfil de análisis usado
--   created_by   — usuario que disparó la ejecución
--
-- Campos ACTUALIZABLES por el motor (no protegidos por este trigger):
--   status        — el motor actualiza: queued → running → completed/failed
--   started_at    — el motor registra cuándo empezó la ejecución
--   finished_at   — el motor registra cuándo terminó
--   error_message — el motor registra errores de ejecución
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION prevent_run_context_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF  NEW.entity_id   IS DISTINCT FROM OLD.entity_id
   OR NEW.entity_type IS DISTINCT FROM OLD.entity_type
   OR NEW.profile_id  IS DISTINCT FROM OLD.profile_id
   OR NEW.created_by  IS DISTINCT FROM OLD.created_by
  THEN
    RAISE EXCEPTION
      'ai_execution_runs: los campos entity_id, entity_type, profile_id y created_by '
      'son inmutables post-INSERT. '
      'Solo pueden modificarse: status, started_at, finished_at, error_message.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER ai_execution_runs_immutable_context
  BEFORE UPDATE ON ai_execution_runs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_run_context_change();


-- ---------------------------------------------------------------------------
-- F-04: Inmutabilidad del campo output en ai_execution_outputs post-completado
-- ---------------------------------------------------------------------------
-- Problema: las policies RLS permiten que el dueño de un run actualice sus
-- outputs, incluyendo el campo output (texto del análisis generado por IA).
-- Esto permite reescribir retroactivamente el resultado de un análisis comercial.
--
-- Solución: trigger BEFORE UPDATE que bloquea la modificación del campo output
-- una vez que status = 'completed'. La metadata operativa sigue siendo
-- actualizable porque el motor puede necesitar corregir tokens/cost después
-- de registrar el output.
--
-- Campos INMUTABLES cuando status = 'completed' (este trigger los protege):
--   output — texto del análisis generado por IA
--
-- Campos ACTUALIZABLES aun cuando status = 'completed' (no protegidos):
--   status        — puede pasar a 'failed' post-completado si se detecta error
--   tokens_input  — puede corregirse si se registró después del output
--   tokens_output — idem
--   cost_estimate — idem
--   duration_ms   — idem
--   error_message — puede registrarse después del output
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION prevent_output_rewrite()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'completed'
     AND NEW.output IS DISTINCT FROM OLD.output
  THEN
    RAISE EXCEPTION
      'ai_execution_outputs: el campo output es inmutable cuando status = ''completed''. '
      'Solo puede actualizarse metadata operativa: tokens_input, tokens_output, '
      'cost_estimate, duration_ms, error_message, status.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER ai_execution_outputs_immutable_output
  BEFORE UPDATE ON ai_execution_outputs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_output_rewrite();
