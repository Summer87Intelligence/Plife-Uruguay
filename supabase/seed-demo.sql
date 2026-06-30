-- =============================================================================
-- PLIFE Growth OS — SEED DEMO COMERCIAL (FASE 4)
-- =============================================================================
-- ⚠ NO EJECUTAR EN PRODUCCIÓN REAL. Solo para entornos demo/staging.
--
-- Carga datos demo realistas para presentar el sistema a PLIFE.
--
-- IDEMPOTENCIA:
--   Usa UUIDs fijos + ON CONFLICT DO UPDATE.
--   Podés ejecutarlo múltiples veces sin duplicar datos.
--   Si ya existen los registros, los actualiza al estado original del seed.
--
-- MARCADORES DE DATOS DEMO (usados por clear-demo.sql para limpiar):
--   Campañas      → IDs con prefijo c0000000-0000-0000-0000-
--   Empresas      → IDs con prefijo b0000000-  +  source = 'Demo PLIFE'
--   Contactos     → IDs con prefijo a0000000-  +  email @demo.plife
--   Oportunidades → IDs con prefijo d0000000-0000-0000-0000-
--   Actividades   → IDs con prefijo e0000000-0000-0000-0000-
--   Documentos    → IDs con prefijo f0000000-  +  tag 'demo' en tags[]
--
-- CÓMO USARLO:
--   1. Abrí el proyecto en Supabase → SQL Editor.
--   2. Asegurate de tener al menos 1 usuario creado (Authentication → Users) y
--      su perfil en la tabla `profiles`. El seed asigna los datos demo al primer
--      perfil existente (el "presentador" de la demo).
--   3. Pegá este archivo completo y ejecutá.
--
-- PARA LIMPIAR LOS DATOS DEMO: ejecutar supabase/clear-demo.sql
--
-- USUARIOS DEMO (paso manual, requerido por seguridad — no usamos service role):
--   Creá estos usuarios desde Authentication → Add user, y luego ajustá su rol
--   en `profiles` (UPDATE profiles SET role = '...', full_name = '...').
--     - direccion@plife.demo        → role 'direccion'        → "Dirección PLIFE"
--     - lider@plife.demo            → role 'lider_comercial'  → "Líder Comercial"
--     - asesor.senior@plife.demo    → role 'asesor'           → "Asesor Senior"
--     - asesor.nuevo@plife.demo     → role 'asesor'           → "Asesor Nuevo"
--     - compliance@plife.demo       → role 'compliance'       → "Compliance PLIFE"
--   (Snippet sugerido al final de este archivo.)
--
-- NOTA: Todos los datos son ficticios. No representan condiciones reales de
-- ningún producto de seguros.
-- =============================================================================

DO $$
DECLARE
  v_owner uuid;
BEGIN
  SELECT id INTO v_owner FROM public.profiles ORDER BY created_at LIMIT 1;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'No hay perfiles en `profiles`. Creá un usuario e iniciá sesión una vez antes de correr el seed demo.';
  END IF;

  -- ---------------------------------------------------------------------------
  -- CAMPAÑAS
  -- ---------------------------------------------------------------------------
  INSERT INTO public.campaigns (id, name, type, status, objective, target_segment, icp_description, initial_message, call_script, expected_objections, follow_up_sequence, total_targets, total_contacted, total_responses, total_meetings, total_converted, responsible_id, created_by) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Dueños de pymes familiares', 'empresas_familiares', 'activa',
    'Abrir conversaciones consultivas con dueños de pymes familiares sobre protección patrimonial y continuidad del negocio.',
    'Pymes familiares con 5 a 50 empleados en Montevideo y área metropolitana.',
    'Empresa familiar consolidada, segunda generación involucrada, sin un plan formal de continuidad.',
    'Hola {nombre}, trabajo con dueños de empresas familiares ayudándolos a ordenar la protección del negocio y la familia. ¿Tenés 15 minutos esta semana para una charla sin compromiso?',
    'Apertura: presentación breve. Diagnóstico: ¿qué pasaría con el negocio si faltara un socio clave? Cierre: proponer una reunión de diagnóstico.',
    ARRAY['Ya tengo seguro', 'No es el momento', 'Tengo que hablarlo con mi socio', 'No tengo tiempo'],
    '{"text": "Día 1: mensaje inicial. Día 3: llamada. Día 7: caso de continuidad familiar. Día 14: invitación a diagnóstico."}'::jsonb,
    40, 22, 9, 5, 2, v_owner, v_owner),
  ('c0000000-0000-0000-0000-000000000002', 'Estudios contables', 'estudios_contables', 'activa',
    'Posicionar a PLIFE como aliado de estudios contables para proteger a socios y derivar a clientes.',
    'Estudios contables con 3 a 20 profesionales.',
    'Estudio con cartera de pymes, socios que valoran beneficios para el equipo.',
    'Hola {nombre}, ayudo a estudios contables a proteger a sus socios y ofrecer beneficios a su equipo. ¿Te interesaría conocer cómo lo hacen otros estudios?',
    'Apertura consultiva. Foco en protección de socios y valor para clientes. Próximo paso: reunión.',
    ARRAY['Ya trabajamos con un corredor', 'Nuestros clientes no lo piden', 'Es caro'],
    '{"text": "Día 1: mensaje. Día 4: llamada. Día 10: material de beneficios para el equipo."}'::jsonb,
    30, 18, 7, 4, 1, v_owner, v_owner),
  ('c0000000-0000-0000-0000-000000000003', 'Clínicas y profesionales de salud', 'clinicas', 'activa',
    'Generar reuniones con clínicas y centros de salud para planes de protección de equipos médicos.',
    'Clínicas y centros médicos con personal propio.',
    'Centro de salud con 10+ profesionales, sin beneficios estructurados.',
    'Hola {nombre}, trabajo con clínicas ayudándolas a estructurar beneficios y protección para su equipo médico. ¿Coordinamos una breve reunión?',
    'Apertura. Diagnóstico de beneficios actuales. Propuesta de reunión de relevamiento.',
    ARRAY['El personal es tercerizado', 'Ya damos beneficios', 'Lo maneja administración'],
    '{"text": "Día 1: mensaje. Día 5: llamada. Día 12: casos de clínicas."}'::jsonb,
    25, 12, 5, 3, 1, v_owner, v_owner),
  ('c0000000-0000-0000-0000-000000000004', 'Empresas tech', 'empresas_tech', 'activa',
    'Llegar a empresas de tecnología para planes de beneficios que ayuden a retener talento.',
    'Empresas tech de 15 a 120 personas.',
    'Startup o software factory en crecimiento, foco en retención de talento.',
    'Hola {nombre}, ayudo a empresas tech a sumar beneficios de protección que mejoran la retención del equipo. ¿Te muestro cómo en 15 minutos?',
    'Apertura. Foco en retención y propuesta de valor para el equipo. Próximo paso: demo de beneficios.',
    ARRAY['Ya tenemos beneficios', 'Lo ve la gente de People', 'No es prioridad ahora'],
    '{"text": "Día 1: mensaje. Día 3: llamada. Día 8: caso de retención."}'::jsonb,
    35, 16, 8, 4, 1, v_owner, v_owner),
  ('c0000000-0000-0000-0000-000000000005', 'Reclutamiento de asesores', 'reclutamiento_asesores', 'activa',
    'Atraer perfiles comerciales para sumar a la red de asesores PLIFE.',
    'Profesionales con perfil comercial y vocación consultiva.',
    'Persona con experiencia en ventas consultivas que busca desarrollo e ingresos por desempeño.',
    'Hola {nombre}, estamos sumando asesores con perfil consultivo a PLIFE. ¿Te gustaría conocer la propuesta de desarrollo?',
    'Apertura. Propuesta de carrera y acompañamiento. Próximo paso: entrevista.',
    ARRAY['No tengo experiencia en seguros', 'No quiero vender', '¿Cuánto se gana?'],
    '{"text": "Día 1: mensaje. Día 2: llamada. Día 7: invitación a charla informativa."}'::jsonb,
    50, 20, 11, 6, 3, v_owner, v_owner)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, objective = EXCLUDED.objective, target_segment = EXCLUDED.target_segment,
    icp_description = EXCLUDED.icp_description, initial_message = EXCLUDED.initial_message,
    call_script = EXCLUDED.call_script, expected_objections = EXCLUDED.expected_objections,
    follow_up_sequence = EXCLUDED.follow_up_sequence, status = EXCLUDED.status,
    total_targets = EXCLUDED.total_targets, total_contacted = EXCLUDED.total_contacted,
    total_responses = EXCLUDED.total_responses, total_meetings = EXCLUDED.total_meetings,
    total_converted = EXCLUDED.total_converted;

  -- ---------------------------------------------------------------------------
  -- EMPRESAS B2B
  -- ---------------------------------------------------------------------------
  INSERT INTO public.companies (id, name, industry, location, estimated_size, estimated_employees, source, b2b_score, b2b_status, commercial_angle, ideal_contact, risk_notes, opportunity_detected, notes, campaign_id, assigned_to, created_by) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Clínica Vida Integral', 'Salud / Clínica médica', 'Montevideo, Pocitos', 'Mediana', 45, 'Demo PLIFE', 82, 'priorizada',
    'Protección y beneficios para el equipo médico como diferencial de retención.', 'Director médico o gerente administrativo',
    'Personal parcialmente tercerizado: validar alcance.', 'Plan de beneficios para profesionales de planta.',
    'Centro de salud en crecimiento, abrió una nueva sede este año.', 'c0000000-0000-0000-0000-000000000003', v_owner, v_owner),
  ('b0000000-0000-0000-0000-000000000002', 'Estudio Recalde & Asociados', 'Servicios profesionales / Contable', 'Montevideo, Centro', 'Pequeña', 14, 'Demo PLIFE', 88, 'priorizada',
    'Proteger a los socios y ofrecer beneficios al equipo; posible canal de derivación.', 'Socio fundador',
    'Decisión compartida entre socios.', 'Protección de socios clave del estudio.',
    'Estudio con cartera de pymes familiares.', 'c0000000-0000-0000-0000-000000000002', v_owner, v_owner),
  ('b0000000-0000-0000-0000-000000000003', 'Nubek Software', 'Tecnología / Software factory', 'Montevideo, Ciudad Vieja', 'Mediana', 85, 'Demo PLIFE', 76, 'analizada',
    'Beneficios de protección como herramienta de retención de talento.', 'Responsable de People / RRHH',
    'Equipo joven: foco en propuesta de valor, no en miedo.', 'Plan de beneficios para retención de talento.',
    'Crecimiento del 30% en headcount en el último año.', 'c0000000-0000-0000-0000-000000000004', v_owner, v_owner),
  ('b0000000-0000-0000-0000-000000000004', 'Constructora del Sur', 'Construcción', 'Canelones', 'Mediana', 60, 'Demo PLIFE', 64, 'detectada',
    'Continuidad del negocio y protección de los dueños.', 'Director comercial o dueño',
    'Estacionalidad de la actividad.', 'Protección de socios y continuidad del negocio.',
    'Empresa familiar con dos generaciones activas.', 'c0000000-0000-0000-0000-000000000001', v_owner, v_owner),
  ('b0000000-0000-0000-0000-000000000005', 'Inmobiliaria Horizonte', 'Inmobiliaria', 'Maldonado, Punta del Este', 'Pequeña', 18, 'Demo PLIFE', 58, 'detectada',
    'Protección para socios y equipo comercial.', 'Dueño / Gerente',
    'Ingresos variables por comisiones.', 'Beneficios para el equipo comercial.',
    'Fuerte estacionalidad de temporada.', 'c0000000-0000-0000-0000-000000000001', v_owner, v_owner),
  ('b0000000-0000-0000-0000-000000000006', 'Grupo Pérez Hermanos', 'Comercio / Empresa familiar', 'Montevideo, Carrasco', 'Mediana', 38, 'Demo PLIFE', 71, 'priorizada',
    'Plan de continuidad familiar y protección patrimonial.', 'Dueño / fundador',
    'Sin plan de sucesión formal.', 'Continuidad familiar y protección del fundador.',
    'Segunda generación incorporándose a la gestión.', 'c0000000-0000-0000-0000-000000000001', v_owner, v_owner),
  ('b0000000-0000-0000-0000-000000000007', 'Élite Fitness Club', 'Gimnasio premium / Bienestar', 'Montevideo, Pocitos', 'Pequeña', 22, 'Demo PLIFE', 49, 'detectada',
    'Beneficios para el equipo y socios fundadores.', 'Dueño',
    'Margen ajustado, sensibilidad al precio.', 'Beneficios para staff y fundadores.',
    'Marca premium con dos sedes.', NULL, v_owner, v_owner),
  ('b0000000-0000-0000-0000-000000000008', 'Asociación de Profesionales Unidos', 'Asociación profesional', 'Montevideo, Cordón', 'Mediana', 0, 'Demo PLIFE', 67, 'analizada',
    'Beneficio colectivo para asociados como valor de pertenencia.', 'Presidente o secretario de la comisión',
    'Decisión por comisión directiva (ciclo largo).', 'Plan de beneficios para asociados.',
    'Más de 300 asociados activos.', NULL, v_owner, v_owner)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, industry = EXCLUDED.industry, location = EXCLUDED.location,
    estimated_size = EXCLUDED.estimated_size, estimated_employees = EXCLUDED.estimated_employees,
    b2b_score = EXCLUDED.b2b_score, b2b_status = EXCLUDED.b2b_status,
    commercial_angle = EXCLUDED.commercial_angle, ideal_contact = EXCLUDED.ideal_contact,
    risk_notes = EXCLUDED.risk_notes, opportunity_detected = EXCLUDED.opportunity_detected,
    notes = EXCLUDED.notes, campaign_id = EXCLUDED.campaign_id, source = EXCLUDED.source;

  -- ---------------------------------------------------------------------------
  -- CONTACTOS
  -- ---------------------------------------------------------------------------
  INSERT INTO public.contacts (id, first_name, last_name, position, email, phone, status, interest_level, detected_need, next_action, next_action_date, data_consent, data_origin, company_id, assigned_to, source, created_by) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Roberto', 'Pérez', 'Dueño / Fundador', 'roberto@demo.plife', '099000001', 'interesado', 'alto',
    'Continuidad del negocio familiar y protección del fundador.', 'Coordinar reunión de diagnóstico', CURRENT_DATE + 2, true, 'Campaña dueños de pymes (demo)', 'b0000000-0000-0000-0000-000000000006', v_owner, 'Demo PLIFE', v_owner),
  ('a0000000-0000-0000-0000-000000000002', 'Lucía', 'Recalde', 'Socia fundadora', 'lucia@demo.plife', '099000002', 'reunion_agendada', 'muy_alto',
    'Protección de socios clave del estudio.', 'Reunión agendada — preparar diagnóstico', CURRENT_DATE + 1, true, 'Referido (demo)', 'b0000000-0000-0000-0000-000000000002', v_owner, 'Demo PLIFE', v_owner),
  ('a0000000-0000-0000-0000-000000000003', 'Martín', 'Sosa', 'Gerente Administrativo', 'martin@demo.plife', '099000003', 'contactado', 'medio',
    'Beneficios para profesionales de planta.', 'Llamar para coordinar relevamiento', CURRENT_DATE - 3, true, 'Campaña clínicas (demo)', 'b0000000-0000-0000-0000-000000000001', v_owner, 'Demo PLIFE', v_owner),
  ('a0000000-0000-0000-0000-000000000004', 'Paula', 'Méndez', 'Responsable de RRHH', 'paula@demo.plife', '099000004', 'interesado', 'alto',
    'Beneficios de retención para el equipo.', 'Enviar material de beneficios', CURRENT_DATE + 4, true, 'Campaña empresas tech (demo)', 'b0000000-0000-0000-0000-000000000003', v_owner, 'Demo PLIFE', v_owner),
  ('a0000000-0000-0000-0000-000000000005', 'Andrés', 'Cabrera', 'Contador', 'andres@demo.plife', '099000005', 'nuevo', 'medio',
    'Aún por relevar.', 'Primer contacto', CURRENT_DATE + 5, true, 'Campaña estudios contables (demo)', 'b0000000-0000-0000-0000-000000000002', v_owner, 'Demo PLIFE', v_owner),
  ('a0000000-0000-0000-0000-000000000006', 'Verónica', 'Long', 'Directora Comercial', 'veronica@demo.plife', '099000006', 'en_seguimiento', 'alto',
    'Protección de socios y continuidad.', 'Retomar luego de temporada', CURRENT_DATE - 1, true, 'Campaña dueños de pymes (demo)', 'b0000000-0000-0000-0000-000000000004', v_owner, 'Demo PLIFE', v_owner),
  ('a0000000-0000-0000-0000-000000000007', 'Diego', 'Fernández', 'Dueño', 'diego@demo.plife', '099000007', 'nuevo', 'medio',
    'Por relevar — interés inicial en beneficios para staff.', 'Primer contacto', CURRENT_DATE + 6, true, 'Radar B2B (demo)', 'b0000000-0000-0000-0000-000000000007', v_owner, 'Demo PLIFE', v_owner),
  ('a0000000-0000-0000-0000-000000000008', 'Carolina', 'Núñez', 'Gerente', 'carolina@demo.plife', '099000008', 'contactado', 'medio',
    'Beneficios para el equipo comercial.', 'Coordinar llamada', CURRENT_DATE - 2, true, 'Radar B2B (demo)', 'b0000000-0000-0000-0000-000000000005', v_owner, 'Demo PLIFE', v_owner)
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, position = EXCLUDED.position,
    status = EXCLUDED.status, interest_level = EXCLUDED.interest_level, detected_need = EXCLUDED.detected_need,
    next_action = EXCLUDED.next_action, next_action_date = EXCLUDED.next_action_date,
    data_consent = EXCLUDED.data_consent, data_origin = EXCLUDED.data_origin, company_id = EXCLUDED.company_id;

  -- ---------------------------------------------------------------------------
  -- OPORTUNIDADES (etapas variadas)
  -- ---------------------------------------------------------------------------
  INSERT INTO public.opportunities (id, title, type, stage, estimated_value, probability, human_score, detected_need, suggested_product, commercial_risk, next_action, next_action_date, loss_reason, contact_id, company_id, campaign_id, assigned_to, last_activity_at, created_by) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Beneficios para el equipo — Nubek Software', 'b2b', 'nueva', 4500, 15, 60,
    'Plan de beneficios para retención de talento.', 'Beneficios colectivos para el equipo', 'bajo', 'Calificar interés con RRHH', CURRENT_DATE + 3, NULL,
    'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004', v_owner, NULL, v_owner),
  ('d0000000-0000-0000-0000-000000000002', 'Planificación familiar — Roberto Pérez', 'b2c', 'calificada', 2200, 30, 70,
    'Protección y planificación para la familia del fundador.', 'Plan de protección familiar', 'bajo', 'Agendar reunión de diagnóstico', CURRENT_DATE + 2, NULL,
    'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', v_owner, now() - interval '2 days', v_owner),
  ('d0000000-0000-0000-0000-000000000003', 'Sumar asesor — Diego Fernández', 'reclutamiento', 'contactada', 0, 25, 55,
    'Perfil comercial con vocación consultiva.', 'Incorporación a la red de asesores', 'bajo', 'Invitar a charla informativa', CURRENT_DATE + 4, NULL,
    'a0000000-0000-0000-0000-000000000007', NULL, 'c0000000-0000-0000-0000-000000000005', v_owner, now() - interval '1 day', v_owner),
  ('d0000000-0000-0000-0000-000000000004', 'Protección de socios — Estudio Recalde', 'b2b', 'reunion_agendada', 6800, 45, 80,
    'Protección de socios clave del estudio.', 'Protección de socios', 'medio', 'Preparar reunión de diagnóstico', CURRENT_DATE + 1, NULL,
    'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', v_owner, now() - interval '1 day', v_owner),
  ('d0000000-0000-0000-0000-000000000005', 'Beneficios equipo médico — Clínica Vida Integral', 'b2b', 'diagnostico_realizado', 7200, 55, 78,
    'Beneficios para profesionales de planta.', 'Beneficios colectivos', 'medio', 'Elaborar propuesta conceptual', CURRENT_DATE + 5, NULL,
    'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', v_owner, now() - interval '3 days', v_owner),
  ('d0000000-0000-0000-0000-000000000006', 'Continuidad familiar — Grupo Pérez Hermanos', 'b2b', 'propuesta_conceptual', 9500, 60, 85,
    'Continuidad familiar y protección del fundador.', 'Plan de continuidad', 'medio', 'Revisar propuesta con el cliente', CURRENT_DATE + 2, NULL,
    'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', v_owner, now() - interval '2 days', v_owner),
  ('d0000000-0000-0000-0000-000000000007', 'Beneficios equipo comercial — Inmobiliaria Horizonte', 'b2b', 'seguimiento', 3800, 40, 62,
    'Beneficios para el equipo comercial.', 'Beneficios colectivos', 'medio', 'Retomar después de temporada', CURRENT_DATE - 1, NULL,
    'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', v_owner, now() - interval '12 days', v_owner),
  ('d0000000-0000-0000-0000-000000000008', 'Protección de socios — Constructora del Sur', 'b2b', 'cerrada_ganada', 8100, 100, 90,
    'Protección de socios y continuidad.', 'Protección de socios', 'bajo', 'Onboarding del cliente', NULL, NULL,
    'a0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', v_owner, now() - interval '4 days', v_owner),
  ('d0000000-0000-0000-0000-000000000009', 'Beneficios staff — Élite Fitness Club', 'b2b', 'cerrada_perdida', 2600, 0, 40,
    'Beneficios para staff y fundadores.', 'Beneficios colectivos', 'alto', NULL, NULL, 'Presupuesto ajustado este año',
    NULL, 'b0000000-0000-0000-0000-000000000007', NULL, v_owner, now() - interval '20 days', v_owner),
  ('d0000000-0000-0000-0000-000000000010', 'Plan de asociados — Asociación de Profesionales Unidos', 'b2b', 'dormida', 12000, 20, 58,
    'Plan de beneficios para asociados.', 'Beneficio colectivo', 'medio', 'Reactivar con la comisión directiva', NULL, NULL,
    NULL, 'b0000000-0000-0000-0000-000000000008', NULL, v_owner, now() - interval '35 days', v_owner)
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title, type = EXCLUDED.type, stage = EXCLUDED.stage,
    estimated_value = EXCLUDED.estimated_value, probability = EXCLUDED.probability,
    human_score = EXCLUDED.human_score, detected_need = EXCLUDED.detected_need,
    suggested_product = EXCLUDED.suggested_product, commercial_risk = EXCLUDED.commercial_risk,
    next_action = EXCLUDED.next_action, next_action_date = EXCLUDED.next_action_date,
    loss_reason = EXCLUDED.loss_reason, last_activity_at = EXCLUDED.last_activity_at;

  -- ---------------------------------------------------------------------------
  -- ACTIVIDADES (timeline)
  -- ---------------------------------------------------------------------------
  INSERT INTO public.activities (id, type, title, description, outcome, is_completed, scheduled_at, completed_at, contact_id, opportunity_id, company_id, created_by) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'reunion', 'Reunión de diagnóstico con Estudio Recalde', 'Relevar necesidades de protección de socios.', NULL, false, now() + interval '1 day', NULL,
    'a0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', v_owner),
  ('e0000000-0000-0000-0000-000000000002', 'llamada', 'Llamar a Martín (Clínica Vida Integral)', 'Coordinar relevamiento de beneficios.', NULL, false, now(), NULL,
    'a0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', v_owner),
  ('e0000000-0000-0000-0000-000000000003', 'email', 'Enviar material de beneficios a Nubek', 'Material de beneficios para retención.', NULL, false, now() + interval '2 days', NULL,
    'a0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', v_owner),
  ('e0000000-0000-0000-0000-000000000004', 'llamada', 'Primer contacto con Roberto Pérez', 'Presentación y detección de necesidad.', 'Mostró interés en continuidad familiar.', true, now() - interval '4 days', now() - interval '4 days',
    'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000006', v_owner),
  ('e0000000-0000-0000-0000-000000000005', 'reunion', 'Diagnóstico Grupo Pérez Hermanos', 'Relevamiento de continuidad familiar.', 'Avanza a propuesta conceptual.', true, now() - interval '2 days', now() - interval '2 days',
    'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', v_owner),
  ('e0000000-0000-0000-0000-000000000006', 'mensaje', 'Mensaje de seguimiento a Inmobiliaria Horizonte', 'Retomar conversación post temporada.', NULL, false, now() - interval '6 days', NULL,
    'a0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000005', v_owner),
  ('e0000000-0000-0000-0000-000000000007', 'nota', 'Nota de cierre — Constructora del Sur', 'Cliente confirmó avance.', 'Oportunidad ganada.', true, now() - interval '4 days', now() - interval '4 days',
    'a0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000004', v_owner),
  ('e0000000-0000-0000-0000-000000000008', 'reunion', 'Charla informativa de reclutamiento', 'Presentar la propuesta de carrera.', NULL, false, now() + interval '4 days', NULL,
    'a0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000003', NULL, v_owner),
  ('e0000000-0000-0000-0000-000000000009', 'nota', 'Motivo de pérdida — Élite Fitness Club', 'Presupuesto ajustado este año, reabrir en 2027.', 'Perdida (presupuesto).', true, now() - interval '20 days', now() - interval '20 days',
    NULL, 'd0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000007', v_owner),
  ('e0000000-0000-0000-0000-000000000010', 'tarea', 'Reactivar Asociación de Profesionales', 'Contactar a la comisión directiva.', NULL, false, now() - interval '5 days', NULL,
    NULL, 'd0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000008', v_owner)
  ON CONFLICT (id) DO UPDATE SET
    type = EXCLUDED.type, title = EXCLUDED.title, description = EXCLUDED.description,
    outcome = EXCLUDED.outcome, is_completed = EXCLUDED.is_completed,
    scheduled_at = EXCLUDED.scheduled_at, completed_at = EXCLUDED.completed_at;

  -- ---------------------------------------------------------------------------
  -- BASE DE CONOCIMIENTO (documentos demo + contenido como chunk)
  -- ---------------------------------------------------------------------------
  INSERT INTO public.knowledge_documents (id, name, description, status, category, version, tags, created_by) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Método comercial PLIFE', 'Marco consultivo de PLIFE para acompañar al cliente. (Documento demo)', 'activo', 'comercial', 1, ARRAY['metodo','consultivo','demo'], v_owner),
  ('f0000000-0000-0000-0000-000000000002', 'Reglas de comunicación segura', 'Qué decir y qué evitar al comunicar. (Documento demo)', 'activo', 'compliance', 1, ARRAY['compliance','comunicacion','demo'], v_owner),
  ('f0000000-0000-0000-0000-000000000003', 'Objeciones frecuentes', 'Objeciones comunes y enfoque de respuesta. (Documento demo)', 'activo', 'objeciones', 1, ARRAY['objeciones','demo'], v_owner),
  ('f0000000-0000-0000-0000-000000000004', 'Enfoque B2B consultivo', 'Cómo abordar empresas con un enfoque consultivo. (Documento demo)', 'activo', 'comercial', 1, ARRAY['b2b','consultivo','demo'], v_owner),
  ('f0000000-0000-0000-0000-000000000005', 'Límites de la IA en seguros', 'Qué puede y qué no puede hacer el copiloto. (Documento demo)', 'activo', 'compliance', 1, ARRAY['ia','limites','demo'], v_owner)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, description = EXCLUDED.description, status = EXCLUDED.status,
    category = EXCLUDED.category, tags = EXCLUDED.tags;

  INSERT INTO public.knowledge_chunks (id, document_id, chunk_index, content) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 0,
    'MÉTODO COMERCIAL PLIFE (demo). 1) Escuchar antes de proponer. 2) Detectar la necesidad real del cliente. 3) Proponer un próximo paso concreto, nunca cerrar a presión. 4) Documentar cada interacción. El asesor siempre lidera; la IA solo asiste. No se cotizan primas ni se prometen coberturas.'),
  ('f1000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002', 0,
    'REGLAS DE COMUNICACIÓN SEGURA (demo). Evitar: "te cubre todo", "garantizado", "te aprueban seguro", "sin riesgo", "mejor que cualquier inversión". Preferir: "según las condiciones de la póliza", "la aprobación depende de la evaluación", "conviene revisar el detalle". Nunca afirmar condiciones de producto sin material validado.'),
  ('f1000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000003', 0,
    'OBJECIONES FRECUENTES (demo). "Ya tengo seguro" → entender qué tiene y detectar brechas, sin descalificar. "Es caro" → centrar en valor y necesidad, no en precio. "No es el momento" → acordar un próximo contacto concreto. Siempre consultivo, nunca a presión.'),
  ('f1000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000004', 0,
    'ENFOQUE B2B CONSULTIVO (demo). Investigar la empresa con los datos disponibles. Identificar el ángulo (continuidad, retención, protección de socios). Buscar el contacto ideal. Proponer una reunión de diagnóstico. No improvisar condiciones de producto.'),
  ('f1000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000005', 0,
    'LÍMITES DE LA IA EN SEGUROS (demo). El copiloto ayuda a preparar conversaciones, mensajes y próximos pasos. NO cotiza, NO promete aprobación, NO inventa coberturas y NO envía mensajes automáticamente. Toda sugerencia pasa por compliance y debe ser revisada por el asesor.')
  ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, chunk_index = EXCLUDED.chunk_index;

  RAISE NOTICE 'Seed demo PLIFE cargado correctamente. Datos asignados al perfil %', v_owner;
END $$;

-- =============================================================================
-- (OPCIONAL) Ajustar roles/nombres de los usuarios demo después de crearlos en
-- Authentication. Ejecutá luego de crear los usuarios manualmente.
-- =============================================================================
-- UPDATE public.profiles SET role = 'direccion',       full_name = 'Dirección PLIFE'  WHERE email = 'direccion@plife.demo';
-- UPDATE public.profiles SET role = 'lider_comercial', full_name = 'Líder Comercial'  WHERE email = 'lider@plife.demo';
-- UPDATE public.profiles SET role = 'asesor',          full_name = 'Asesor Senior'    WHERE email = 'asesor.senior@plife.demo';
-- UPDATE public.profiles SET role = 'asesor',          full_name = 'Asesor Nuevo'     WHERE email = 'asesor.nuevo@plife.demo';
-- UPDATE public.profiles SET role = 'compliance',      full_name = 'Compliance PLIFE' WHERE email = 'compliance@plife.demo';
