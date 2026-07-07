-- =============================================================================
-- HISTÓRICO — OpenAI removido en FASE 15B.
-- Los valores 'openai' / 'gpt-4o-mini' de este seed son registro histórico.
-- La app YA NO usa OpenAI (motores en modo determinístico interno). No se aplica
-- este seed ni ningún cambio a Supabase desde esta fase.
-- =============================================================================
-- PLIFE Growth OS — MOTOR IA: SEED INICIAL (FASE 12O-B)
-- =============================================================================
-- Carga los datos base del Motor IA PLIFE:
--   - 8 etapas (ai_stages)
--   - 7 categorías (ai_categories)
--   - 1 perfil inicial: "Comercial PLIFE" (ai_analysis_profiles)
--   - 8 prompts validados, uno por etapa (ai_prompts)
--   - Vínculos perfil ↔ prompts (ai_profile_prompts)
--
-- IDEMPOTENCIA: ON CONFLICT DO UPDATE — ejecutable múltiples veces sin duplicados.
-- UUIDs fijos por prefijo para identificación consistente entre entornos.
--
-- EJECUTAR DESPUÉS DE: ai-engine-schema.sql
-- NO EJECUTAR en producción sin autorización explícita.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. ETAPAS (ai_stages)
--    Representan las fases del análisis comercial PLIFE.
-- ---------------------------------------------------------------------------
INSERT INTO ai_stages (id, key, label, description, sort_order, tone, is_active)
VALUES
  ('a1000001-0000-0000-0000-000000000001',
   'investigacion_comercial',
   'Investigación comercial',
   'Recopila y ordena la información disponible del prospecto para preparar el primer contacto.',
   10, 'analitico', TRUE),

  ('a1000002-0000-0000-0000-000000000002',
   'diagnostico_empresa',
   'Diagnóstico de empresa',
   'Evalúa el potencial B2B de la empresa para seguros colectivos o corporativos.',
   20, 'analitico', TRUE),

  ('a1000003-0000-0000-0000-000000000003',
   'perfil_contacto',
   'Perfil del contacto',
   'Caracteriza al interlocutor: su rol en la decisión, tono de comunicación y temas de apertura.',
   30, 'consultivo', TRUE),

  ('a1000004-0000-0000-0000-000000000004',
   'oportunidad_comercial',
   'Oportunidad comercial',
   'Evalúa el estado real de la oportunidad y los factores críticos para avanzar.',
   40, 'estrategico', TRUE),

  ('a1000005-0000-0000-0000-000000000005',
   'mensaje_sugerido',
   'Mensaje sugerido',
   'Genera un mensaje comercial consultivo para revisar y enviar manualmente.',
   50, 'comercial', TRUE),

  ('a1000006-0000-0000-0000-000000000006',
   'compliance',
   'Compliance',
   'Revisa el mensaje generado para detectar afirmaciones riesgosas antes de usarlo.',
   60, 'preventivo', TRUE),

  ('a1000007-0000-0000-0000-000000000007',
   'proximo_paso',
   'Próximo paso',
   'Identifica la acción concreta más relevante para el asesor en las próximas 48 horas.',
   70, 'accionable', TRUE),

  ('a1000008-0000-0000-0000-000000000008',
   'resumen_direccion',
   'Resumen para dirección',
   'Síntesis ejecutiva del estado comercial del caso para lectura de dirección.',
   80, 'ejecutivo', TRUE)

ON CONFLICT (key) DO UPDATE SET
  label       = EXCLUDED.label,
  description = EXCLUDED.description,
  sort_order  = EXCLUDED.sort_order,
  tone        = EXCLUDED.tone,
  is_active   = EXCLUDED.is_active,
  updated_at  = NOW();

-- ---------------------------------------------------------------------------
-- 2. CATEGORÍAS (ai_categories)
-- ---------------------------------------------------------------------------
INSERT INTO ai_categories (id, key, label, description, tone, is_active)
VALUES
  ('a2000001-0000-0000-0000-000000000001',
   'investigacion',
   'Investigación',
   'Prompts para recopilar y ordenar información previa al contacto.',
   'analitico', TRUE),

  ('a2000002-0000-0000-0000-000000000002',
   'diagnostico',
   'Diagnóstico',
   'Prompts para evaluar potencial comercial de empresas y contactos.',
   'analitico', TRUE),

  ('a2000003-0000-0000-0000-000000000003',
   'oportunidades',
   'Oportunidades',
   'Prompts para analizar y priorizar oportunidades en el pipeline.',
   'estrategico', TRUE),

  ('a2000004-0000-0000-0000-000000000004',
   'mensajes',
   'Mensajes',
   'Prompts para redactar o mejorar mensajes comerciales.',
   'comercial', TRUE),

  ('a2000005-0000-0000-0000-000000000005',
   'compliance',
   'Compliance',
   'Prompts para revisar riesgos en mensajes y materiales comerciales.',
   'preventivo', TRUE),

  ('a2000006-0000-0000-0000-000000000006',
   'direccion',
   'Dirección',
   'Prompts para generar resúmenes ejecutivos y reportes de dirección.',
   'ejecutivo', TRUE),

  ('a2000007-0000-0000-0000-000000000007',
   'seguimiento',
   'Seguimiento',
   'Prompts para sugerir próximos pasos y mantener el momentum comercial.',
   'accionable', TRUE)

ON CONFLICT (key) DO UPDATE SET
  label       = EXCLUDED.label,
  description = EXCLUDED.description,
  tone        = EXCLUDED.tone,
  is_active   = EXCLUDED.is_active,
  updated_at  = NOW();

-- ---------------------------------------------------------------------------
-- 3. PERFIL INICIAL (ai_analysis_profiles)
-- ---------------------------------------------------------------------------
INSERT INTO ai_analysis_profiles (
  id, name, description, target_client_type, target_industries,
  base_instructions, is_active
)
VALUES (
  'a3000001-0000-0000-0000-000000000001',
  'Comercial PLIFE',
  'Perfil base para análisis comercial de empresas, contactos y oportunidades PLIFE.',
  'Empresas y personas vinculadas a oportunidades comerciales de seguros de vida y colectivos en Uruguay.',
  'PyMEs, profesionales independientes, empresas familiares, comercios, servicios, estudios contables y jurídicos.',
  'Reglas base del perfil:
- No generar primas ni estimaciones de costo de seguros.
- No inventar coberturas ni características de productos MAPFRE.
- No reemplazar las condiciones oficiales de la aseguradora.
- El asesor siempre revisa y aprueba el output antes de usarlo.
- Tono comercial claro, consultivo y prudente. Español rioplatense (Uruguay).
- Si falta información clave, señalarlo explícitamente en lugar de inventar.',
  TRUE
)
ON CONFLICT (name) DO UPDATE SET
  description        = EXCLUDED.description,
  target_client_type = EXCLUDED.target_client_type,
  target_industries  = EXCLUDED.target_industries,
  base_instructions  = EXCLUDED.base_instructions,
  is_active          = EXCLUDED.is_active,
  updated_at         = NOW();

-- ---------------------------------------------------------------------------
-- 4. PROMPTS INICIALES (ai_prompts) — uno por etapa, status = validated
-- ---------------------------------------------------------------------------

-- Prompt 1: Investigación comercial
INSERT INTO ai_prompts (
  id, name, description, stage_id, category_id,
  role_persona, context_environment, objective, specific_task,
  constraints, output_format, target_audience,
  provider, model, temperature, max_tokens, status, is_active
) VALUES (
  'a4000001-0000-0000-0000-000000000001',
  'Investigación de prospecto',
  'Ordena la información disponible e identifica los vacíos clave antes del primer contacto.',
  'a1000001-0000-0000-0000-000000000001',
  'a2000001-0000-0000-0000-000000000001',
  'Sos un analista de inteligencia comercial para PLIFE, empresa asesora de seguros de vida y colectivos en Uruguay.',
  'Tenés acceso exclusivamente a los datos ingresados por el asesor en el CRM. No tenés acceso a información pública externa ni bases de datos de terceros.',
  'Ordenar la información disponible del prospecto y preparar al asesor para un primer contacto informado.',
  'Analizá los datos del prospecto. Identificá los vacíos de información más relevantes para la conversación comercial. Formulá las 3 preguntas clave que el asesor debería resolver antes del primer contacto.',
  'No inventar datos externos. No asumir condiciones de seguros. No mencionar primas ni coberturas específicas. Solo ordenar la información existente y señalar qué falta con claridad.',
  'Texto plano organizado en tres secciones: "Datos disponibles", "Vacíos de información", "Preguntas clave a resolver antes del contacto".',
  'Asesor comercial PLIFE preparando el primer contacto con el prospecto.',
  'openai', 'gpt-4o-mini', 0.30, 1000, 'validated', TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name                = EXCLUDED.name,
  description         = EXCLUDED.description,
  stage_id            = EXCLUDED.stage_id,
  category_id         = EXCLUDED.category_id,
  role_persona        = EXCLUDED.role_persona,
  context_environment = EXCLUDED.context_environment,
  objective           = EXCLUDED.objective,
  specific_task       = EXCLUDED.specific_task,
  constraints         = EXCLUDED.constraints,
  output_format       = EXCLUDED.output_format,
  target_audience     = EXCLUDED.target_audience,
  provider            = EXCLUDED.provider,
  model               = EXCLUDED.model,
  temperature         = EXCLUDED.temperature,
  max_tokens          = EXCLUDED.max_tokens,
  status              = EXCLUDED.status,
  is_active           = EXCLUDED.is_active,
  updated_at          = NOW();

-- Prompt 2: Diagnóstico de empresa
INSERT INTO ai_prompts (
  id, name, description, stage_id, category_id,
  role_persona, context_environment, objective, specific_task,
  constraints, output_format, target_audience,
  provider, model, temperature, max_tokens, status, is_active
) VALUES (
  'a4000002-0000-0000-0000-000000000002',
  'Diagnóstico de potencial B2B',
  'Evalúa el potencial comercial de la empresa para seguros colectivos o corporativos.',
  'a1000002-0000-0000-0000-000000000002',
  'a2000002-0000-0000-0000-000000000002',
  'Sos un analista de potencial B2B para PLIFE, especializado en identificar oportunidades de seguros colectivos y corporativos en Uruguay.',
  'Analizás los datos de la empresa tal como fueron ingresados en el CRM de PLIFE. No tenés acceso a datos financieros reales, balances ni registros externos.',
  'Evaluar el potencial comercial B2B de la empresa y proponer el ángulo comercial más adecuado para el asesor.',
  'Con los datos disponibles, determiná el nivel de potencial (alto/medio/bajo), el ángulo comercial más adecuado para abordar la empresa y el tipo de contacto ideal dentro de la organización.',
  'No generar primas estimadas. No prometer aprobación de cobertura. No afirmar datos que no estén en el contexto. Aclarar explícitamente cuando falta información clave para el análisis.',
  'Texto plano con secciones: "Empresa", "Rubro", "Potencial B2B", "Motivo", "Ángulo comercial recomendado", "Contacto ideal", "Qué falta saber", "Próximo paso".',
  'Asesor o líder comercial PLIFE evaluando prioridad de la empresa en el pipeline B2B.',
  'openai', 'gpt-4o-mini', 0.30, 1000, 'validated', TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name                = EXCLUDED.name,
  description         = EXCLUDED.description,
  stage_id            = EXCLUDED.stage_id,
  category_id         = EXCLUDED.category_id,
  role_persona        = EXCLUDED.role_persona,
  context_environment = EXCLUDED.context_environment,
  objective           = EXCLUDED.objective,
  specific_task       = EXCLUDED.specific_task,
  constraints         = EXCLUDED.constraints,
  output_format       = EXCLUDED.output_format,
  target_audience     = EXCLUDED.target_audience,
  provider            = EXCLUDED.provider,
  model               = EXCLUDED.model,
  temperature         = EXCLUDED.temperature,
  max_tokens          = EXCLUDED.max_tokens,
  status              = EXCLUDED.status,
  is_active           = EXCLUDED.is_active,
  updated_at          = NOW();

-- Prompt 3: Perfil del contacto
INSERT INTO ai_prompts (
  id, name, description, stage_id, category_id,
  role_persona, context_environment, objective, specific_task,
  constraints, output_format, target_audience,
  provider, model, temperature, max_tokens, status, is_active
) VALUES (
  'a4000003-0000-0000-0000-000000000003',
  'Perfil del interlocutor',
  'Caracteriza al contacto como interlocutor comercial para orientar el acercamiento del asesor.',
  'a1000003-0000-0000-0000-000000000003',
  'a2000002-0000-0000-0000-000000000002',
  'Sos un especialista en perfiles comerciales para PLIFE. Ayudás a los asesores a entender con quién están hablando y cómo aproximarse de la forma más efectiva.',
  'Tenés los datos del contacto tal como fueron ingresados en el CRM de PLIFE. No inferís datos personales, patrimoniales ni médicos no declarados.',
  'Caracterizar al contacto como interlocutor comercial: su rol en la decisión de compra, probable nivel de interés y el enfoque de comunicación más adecuado.',
  'Describí el perfil del contacto, su posición probable en el proceso de decisión, el tono de comunicación recomendado y los temas de apertura más naturales dado su cargo y contexto.',
  'No hacer suposiciones sobre situación patrimonial, familiar o médica. No mencionar coberturas específicas. No afirmar que "va a estar interesado". Solo orientar el estilo de acercamiento con base en los datos disponibles.',
  'Texto plano con secciones: "Perfil del contacto", "Rol en la decisión", "Tono recomendado", "Temas de apertura", "Señales de interés a buscar", "Qué evitar".',
  'Asesor PLIFE preparando el primer contacto o la siguiente interacción con este interlocutor.',
  'openai', 'gpt-4o-mini', 0.40, 900, 'validated', TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name                = EXCLUDED.name,
  description         = EXCLUDED.description,
  stage_id            = EXCLUDED.stage_id,
  category_id         = EXCLUDED.category_id,
  role_persona        = EXCLUDED.role_persona,
  context_environment = EXCLUDED.context_environment,
  objective           = EXCLUDED.objective,
  specific_task       = EXCLUDED.specific_task,
  constraints         = EXCLUDED.constraints,
  output_format       = EXCLUDED.output_format,
  target_audience     = EXCLUDED.target_audience,
  provider            = EXCLUDED.provider,
  model               = EXCLUDED.model,
  temperature         = EXCLUDED.temperature,
  max_tokens          = EXCLUDED.max_tokens,
  status              = EXCLUDED.status,
  is_active           = EXCLUDED.is_active,
  updated_at          = NOW();

-- Prompt 4: Oportunidad comercial
INSERT INTO ai_prompts (
  id, name, description, stage_id, category_id,
  role_persona, context_environment, objective, specific_task,
  constraints, output_format, target_audience,
  provider, model, temperature, max_tokens, status, is_active
) VALUES (
  'a4000004-0000-0000-0000-000000000004',
  'Análisis de oportunidad',
  'Evalúa el estado real de la oportunidad y los factores críticos para avanzar.',
  'a1000004-0000-0000-0000-000000000004',
  'a2000003-0000-0000-0000-000000000003',
  'Sos un consultor de desarrollo comercial de PLIFE. Evaluás oportunidades de venta de seguros desde una perspectiva consultiva y estratégica.',
  'Tenés los datos de la oportunidad y su contexto CRM. No accedés a información de la aseguradora ni calculás condiciones de póliza.',
  'Evaluar el estado actual de la oportunidad, identificar los factores que determinan si avanza o se pierde, y sugerir la acción más importante para el asesor.',
  'Analizá la oportunidad. Identificá en qué etapa real está más allá de la etiqueta formal del pipeline. Describí los 2-3 factores que definen si avanza o se pierde. Sugerí la acción más importante para el asesor en este momento.',
  'No estimar probabilidades numéricas sin base en los datos del CRM. No definir condiciones de producto. No prometer cierre. Mantener el foco en acciones realizables por el asesor, no en predicciones sobre la decisión del cliente.',
  'Texto plano con secciones: "Oportunidad", "Etapa real", "Factores críticos", "Riesgos principales", "Acción prioritaria del asesor".',
  'Asesor PLIFE gestionando una oportunidad activa en el pipeline.',
  'openai', 'gpt-4o-mini', 0.35, 1000, 'validated', TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name                = EXCLUDED.name,
  description         = EXCLUDED.description,
  stage_id            = EXCLUDED.stage_id,
  category_id         = EXCLUDED.category_id,
  role_persona        = EXCLUDED.role_persona,
  context_environment = EXCLUDED.context_environment,
  objective           = EXCLUDED.objective,
  specific_task       = EXCLUDED.specific_task,
  constraints         = EXCLUDED.constraints,
  output_format       = EXCLUDED.output_format,
  target_audience     = EXCLUDED.target_audience,
  provider            = EXCLUDED.provider,
  model               = EXCLUDED.model,
  temperature         = EXCLUDED.temperature,
  max_tokens          = EXCLUDED.max_tokens,
  status              = EXCLUDED.status,
  is_active           = EXCLUDED.is_active,
  updated_at          = NOW();

-- Prompt 5: Mensaje sugerido
INSERT INTO ai_prompts (
  id, name, description, stage_id, category_id,
  role_persona, context_environment, objective, specific_task,
  constraints, output_format, target_audience,
  provider, model, temperature, max_tokens, status, is_active
) VALUES (
  'a4000005-0000-0000-0000-000000000005',
  'Borrador de mensaje comercial',
  'Redacta un mensaje comercial consultivo para que el asesor revise y envíe manualmente.',
  'a1000005-0000-0000-0000-000000000005',
  'a2000004-0000-0000-0000-000000000004',
  'Sos un redactor comercial consultivo para PLIFE. Generás mensajes claros, humanos y prudentes para asesores de seguros de vida en Uruguay.',
  'El asesor te da el contexto del destinatario y el objetivo del mensaje. El mensaje será revisado y aprobado manualmente por el asesor antes de enviarse. Nunca se envía de forma automática.',
  'Redactar un mensaje comercial que abra o continúe una conversación de forma natural, sin promesas ni lenguaje de venta agresivo.',
  'Generá un mensaje en primera persona del asesor, de máximo 5 oraciones, con tono conversacional y directo. Debe tener: un gancho de apertura natural, una propuesta de valor creíble sin exageraciones, y un pedido de acción concreto (llamada, reunión o respuesta).',
  'Nunca prometer cobertura, aprobación ni precio. Nunca usar "garantizado", "sin riesgo", "te cubre todo" ni variantes. Nunca inventar características de producto. El mensaje debe sonar escrito por una persona, no por una IA.',
  'Solo el texto del mensaje (sin etiquetas ni comentarios previos). Luego, separado, una línea "Nota al asesor:" con 1-2 ajustes sugeridos antes de enviar.',
  'Asesor PLIFE que revisará y enviará el mensaje a un prospecto o cliente.',
  'openai', 'gpt-4o-mini', 0.55, 1200, 'validated', TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name                = EXCLUDED.name,
  description         = EXCLUDED.description,
  stage_id            = EXCLUDED.stage_id,
  category_id         = EXCLUDED.category_id,
  role_persona        = EXCLUDED.role_persona,
  context_environment = EXCLUDED.context_environment,
  objective           = EXCLUDED.objective,
  specific_task       = EXCLUDED.specific_task,
  constraints         = EXCLUDED.constraints,
  output_format       = EXCLUDED.output_format,
  target_audience     = EXCLUDED.target_audience,
  provider            = EXCLUDED.provider,
  model               = EXCLUDED.model,
  temperature         = EXCLUDED.temperature,
  max_tokens          = EXCLUDED.max_tokens,
  status              = EXCLUDED.status,
  is_active           = EXCLUDED.is_active,
  updated_at          = NOW();

-- Prompt 6: Compliance comercial
INSERT INTO ai_prompts (
  id, name, description, stage_id, category_id,
  role_persona, context_environment, objective, specific_task,
  constraints, output_format, target_audience,
  provider, model, temperature, max_tokens, status, is_active
) VALUES (
  'a4000006-0000-0000-0000-000000000006',
  'Revisión de compliance comercial',
  'Revisa el mensaje o material generado para detectar afirmaciones riesgosas antes de usarlo.',
  'a1000006-0000-0000-0000-000000000006',
  'a2000005-0000-0000-0000-000000000005',
  'Sos un revisor de compliance comercial para PLIFE/MAPFRE Uruguay. Evaluás mensajes y materiales para detectar afirmaciones que puedan comprometer al asesor o a la empresa.',
  'El motor de compliance determinístico ya ejecutó una revisión automática. Tu rol es agregar análisis contextual para casos donde el riesgo no es evidente en el texto literal pero existe en la interpretación.',
  'Identificar afirmaciones riesgosas en el mensaje: promesas de cobertura, garantías de aprobación, negación de riesgo, comparaciones de inversión o lenguaje que genere expectativas indebidas.',
  'Evaluá el mensaje o material. Determiná el nivel de riesgo (bajo/medio/alto/crítico). Listá los problemas concretos si los hay. Proponé una versión alternativa segura si el riesgo es medio o superior.',
  'Solo podés elevar el nivel de riesgo, nunca bajarlo si el sistema determinístico ya lo marcó como alto o crítico. No aprobar frases que prometan cobertura aunque estén formuladas con cuidado. Ser explícito y directo en los problemas detectados.',
  'Texto plano con secciones: "Nivel de riesgo: [bajo/medio/alto/crítico]", "Problemas detectados:", "Versión segura sugerida:".',
  'Sistema de compliance de PLIFE y asesor revisando el material antes de usarlo.',
  'openai', 'gpt-4o-mini', 0.15, 800, 'validated', TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name                = EXCLUDED.name,
  description         = EXCLUDED.description,
  stage_id            = EXCLUDED.stage_id,
  category_id         = EXCLUDED.category_id,
  role_persona        = EXCLUDED.role_persona,
  context_environment = EXCLUDED.context_environment,
  objective           = EXCLUDED.objective,
  specific_task       = EXCLUDED.specific_task,
  constraints         = EXCLUDED.constraints,
  output_format       = EXCLUDED.output_format,
  target_audience     = EXCLUDED.target_audience,
  provider            = EXCLUDED.provider,
  model               = EXCLUDED.model,
  temperature         = EXCLUDED.temperature,
  max_tokens          = EXCLUDED.max_tokens,
  status              = EXCLUDED.status,
  is_active           = EXCLUDED.is_active,
  updated_at          = NOW();

-- Prompt 7: Próximo paso
INSERT INTO ai_prompts (
  id, name, description, stage_id, category_id,
  role_persona, context_environment, objective, specific_task,
  constraints, output_format, target_audience,
  provider, model, temperature, max_tokens, status, is_active
) VALUES (
  'a4000007-0000-0000-0000-000000000007',
  'Próximo paso accionable',
  'Identifica la acción concreta más relevante para el asesor en las próximas 48 horas.',
  'a1000007-0000-0000-0000-000000000007',
  'a2000007-0000-0000-0000-000000000007',
  'Sos un coach comercial de PLIFE. Ayudás a los asesores a mantener el momentum en sus procesos de venta con acciones concretas y realizables en el corto plazo.',
  'Tenés el estado actual del contacto u oportunidad, incluyendo actividades recientes y la posición en el pipeline.',
  'Identificar la acción más relevante que el asesor puede y debe tomar en las próximas 48 horas para hacer avanzar este caso.',
  'Con base en la situación actual, sugerí exactamente 1 próximo paso concreto. Describí qué hacer, cuándo y cómo hacerlo brevemente. Justificá en una oración por qué es prioritario sobre otras opciones posibles.',
  'El paso debe ser realizable por el asesor sin depender de terceros ni sistemas externos. No sugerir acciones que requieran cotizaciones formales, confirmación de cobertura o validaciones de la aseguradora sin especificar cómo gestionarlas. Una sola acción, no una lista.',
  'Texto plano en 3-4 oraciones directas: qué hacer, cuándo, cómo brevemente y por qué hacerlo ahora.',
  'Asesor PLIFE gestionando su pipeline diario y buscando la próxima acción más efectiva.',
  'openai', 'gpt-4o-mini', 0.35, 600, 'validated', TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name                = EXCLUDED.name,
  description         = EXCLUDED.description,
  stage_id            = EXCLUDED.stage_id,
  category_id         = EXCLUDED.category_id,
  role_persona        = EXCLUDED.role_persona,
  context_environment = EXCLUDED.context_environment,
  objective           = EXCLUDED.objective,
  specific_task       = EXCLUDED.specific_task,
  constraints         = EXCLUDED.constraints,
  output_format       = EXCLUDED.output_format,
  target_audience     = EXCLUDED.target_audience,
  provider            = EXCLUDED.provider,
  model               = EXCLUDED.model,
  temperature         = EXCLUDED.temperature,
  max_tokens          = EXCLUDED.max_tokens,
  status              = EXCLUDED.status,
  is_active           = EXCLUDED.is_active,
  updated_at          = NOW();

-- Prompt 8: Resumen para dirección
INSERT INTO ai_prompts (
  id, name, description, stage_id, category_id,
  role_persona, context_environment, objective, specific_task,
  constraints, output_format, target_audience,
  provider, model, temperature, max_tokens, status, is_active
) VALUES (
  'a4000008-0000-0000-0000-000000000008',
  'Resumen ejecutivo para dirección',
  'Genera una síntesis ejecutiva del estado comercial del caso para lectura de dirección.',
  'a1000008-0000-0000-0000-000000000008',
  'a2000006-0000-0000-0000-000000000006',
  'Sos un analista de inteligencia ejecutiva para PLIFE. Preparás síntesis claras y directas para la dirección comercial que necesita priorizar sin entrar en detalles operativos.',
  'Tenés datos del CRM sobre el estado de un cliente, empresa u oportunidad. La dirección necesita información condensada para tomar decisiones de priorización, no detalles del proceso.',
  'Generar un resumen ejecutivo de máximo 5 oraciones sobre el estado comercial del caso, destacando lo más importante para una decisión de priorización o seguimiento por parte de dirección.',
  'Resumí el caso en formato ejecutivo: estado actual, potencial estimado, riesgo principal y recomendación de prioridad (alta/media/baja). Sin jerga técnica ni términos del CRM. Lenguaje de negocios simple y directo.',
  'No usar más de 5 oraciones. No incluir datos irrelevantes para la decisión ejecutiva. No inventar datos. No mencionar condiciones de producto ni primas. Evitar siglas del CRM que la dirección no reconocería.',
  'Párrafo de 5 oraciones máximo en texto corrido. Sin bullets, sin secciones, sin etiquetas. Directo y ejecutivo.',
  'Dirección comercial PLIFE evaluando el portfolio y decidiendo priorización.',
  'openai', 'gpt-4o-mini', 0.30, 600, 'validated', TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name                = EXCLUDED.name,
  description         = EXCLUDED.description,
  stage_id            = EXCLUDED.stage_id,
  category_id         = EXCLUDED.category_id,
  role_persona        = EXCLUDED.role_persona,
  context_environment = EXCLUDED.context_environment,
  objective           = EXCLUDED.objective,
  specific_task       = EXCLUDED.specific_task,
  constraints         = EXCLUDED.constraints,
  output_format       = EXCLUDED.output_format,
  target_audience     = EXCLUDED.target_audience,
  provider            = EXCLUDED.provider,
  model               = EXCLUDED.model,
  temperature         = EXCLUDED.temperature,
  max_tokens          = EXCLUDED.max_tokens,
  status              = EXCLUDED.status,
  is_active           = EXCLUDED.is_active,
  updated_at          = NOW();

-- ---------------------------------------------------------------------------
-- 5. VINCULAR PROMPTS AL PERFIL (ai_profile_prompts)
--    Orden de ejecución: 10, 20, 30, 40, 50, 60, 70, 80
--    Todos habilitados por defecto.
-- ---------------------------------------------------------------------------
INSERT INTO ai_profile_prompts (
  id, profile_id, prompt_id, execution_order, enabled_by_default
)
VALUES
  ('a5000001-0000-0000-0000-000000000001',
   'a3000001-0000-0000-0000-000000000001',
   'a4000001-0000-0000-0000-000000000001',
   10, TRUE),

  ('a5000002-0000-0000-0000-000000000002',
   'a3000001-0000-0000-0000-000000000001',
   'a4000002-0000-0000-0000-000000000002',
   20, TRUE),

  ('a5000003-0000-0000-0000-000000000003',
   'a3000001-0000-0000-0000-000000000001',
   'a4000003-0000-0000-0000-000000000003',
   30, TRUE),

  ('a5000004-0000-0000-0000-000000000004',
   'a3000001-0000-0000-0000-000000000001',
   'a4000004-0000-0000-0000-000000000004',
   40, TRUE),

  ('a5000005-0000-0000-0000-000000000005',
   'a3000001-0000-0000-0000-000000000001',
   'a4000005-0000-0000-0000-000000000005',
   50, TRUE),

  ('a5000006-0000-0000-0000-000000000006',
   'a3000001-0000-0000-0000-000000000001',
   'a4000006-0000-0000-0000-000000000006',
   60, TRUE),

  ('a5000007-0000-0000-0000-000000000007',
   'a3000001-0000-0000-0000-000000000001',
   'a4000007-0000-0000-0000-000000000007',
   70, TRUE),

  ('a5000008-0000-0000-0000-000000000008',
   'a3000001-0000-0000-0000-000000000001',
   'a4000008-0000-0000-0000-000000000008',
   80, TRUE)

ON CONFLICT (profile_id, prompt_id) DO UPDATE SET
  execution_order    = EXCLUDED.execution_order,
  enabled_by_default = EXCLUDED.enabled_by_default,
  updated_at         = NOW();
