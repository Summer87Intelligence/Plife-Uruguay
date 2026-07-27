-- DEV ONLY.
-- FASE 14H-B — Seed active demo leads for read-only UI validation.
-- Supabase dev ref: ayvnloxijnfnooaefrlm.
-- Do not apply to production.

-- Este seed está pensado para ejecutarse en Supabase dev.
-- Si se ejecuta como usuario autenticado, requiere:
--   created_by = auth.uid()
--   assigned_to = auth.uid()
-- Si se ejecuta como service context, mantener igualmente assigned_to/created_by
-- apuntando al usuario dev para que RLS permita leer los registros luego.

INSERT INTO leads (
  title,
  lead_type,
  source,
  status,
  pipeline_stage,
  priority,
  temperature,
  next_action,
  next_action_date,
  notes,
  assigned_to,
  created_by
)
VALUES
  (
    'Lead Demo Dev Vida 14HB',
    'person',
    'whatsapp',
    'open',
    'nuevo',
    'high',
    'hot',
    'Contactar para calificar interés',
    CURRENT_DATE,
    'Lead demo dev para validar lectura real en UI.',
    auth.uid(),
    auth.uid()
  ),
  (
    'Lead Demo Dev Empresa 14HB',
    'company',
    'referral',
    'open',
    'interesado',
    'medium',
    'warm',
    'Coordinar reunión de diagnóstico',
    CURRENT_DATE + INTERVAL '2 days',
    'Lead demo dev para validar lectura real en UI.',
    auth.uid(),
    auth.uid()
  ),
  (
    'Lead Demo Dev Seguimiento 14HB',
    'unknown',
    'manual',
    'open',
    'seguimiento',
    'high',
    'hot',
    'Retomar conversación pendiente',
    CURRENT_DATE - INTERVAL '1 day',
    'Lead demo dev para validar lectura real en UI.',
    auth.uid(),
    auth.uid()
  );

-- Limpieza futura (soft-delete):
-- UPDATE leads SET deleted_at = NOW() WHERE title LIKE 'Lead Demo Dev % 14HB';
