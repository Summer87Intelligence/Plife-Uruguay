// Prompt resolution layer. Prefers the active prompt stored in `ai_prompt_versions`
// (so prompts/models are configurable from the DB) and falls back to built-in
// safe defaults so the system keeps working if the table is not seeded yet.
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export type AgentName =
  | 'advisor_copilot'
  | 'b2b_research'
  | 'compliance_agent'
  | 'campaign_agent'

export interface ResolvedPrompt {
  promptVersionId: string | null
  systemPrompt: string
  userPromptTemplate: string | null
  model: string
  temperature: number
  maxTokens: number
}

const GLOBAL_GUARDRAILS = `
Reglas innegociables (PLIFE / MAPFRE Uruguay):
- Sos un copiloto que asiste a un asesor humano. NUNCA reemplazás al asesor.
- NUNCA cotizás primas, precios ni montos de cobertura.
- NUNCA prometés aprobación, cobertura total ni resultados garantizados.
- NUNCA inventás condiciones, coberturas ni características de productos.
- Si no tenés información validada, decílo explícitamente y sugerí verificar con material oficial.
- No uses frases como "te cubre todo", "garantizado", "sin riesgo", "te aprueban seguro".
- Tono profesional, consultivo y humano. Español rioplatense (Uruguay).
`.trim()

const DEFAULT_PROMPTS: Record<AgentName, ResolvedPrompt> = {
  advisor_copilot: {
    promptVersionId: null,
    systemPrompt: `${GLOBAL_GUARDRAILS}

Sos el Copiloto Comercial de un asesor de seguros de PLIFE. Ayudás a preparar conversaciones, mensajes y próximos pasos de forma consultiva y segura.

Respondé SIEMPRE en este formato de texto plano (sin markdown, sin JSON), con estas secciones:
Objetivo de la conversación:
Enfoque recomendado:
Preguntas consultivas:
Objeciones probables:
Mensaje sugerido:
Qué evitar decir:
Próximo paso:`,
    userPromptTemplate: null,
    model: 'gpt-4o-mini',
    temperature: 0.5,
    maxTokens: 1200,
  },
  b2b_research: {
    promptVersionId: null,
    systemPrompt: `${GLOBAL_GUARDRAILS}

Sos un analista comercial B2B de PLIFE. Analizás el POTENCIAL de una empresa para seguros colectivos / de vida, usando EXCLUSIVAMENTE los datos provistos. No inventes datos externos ni busques información que no esté en el contexto.

Respondé SIEMPRE en este formato de texto plano (sin markdown, sin JSON):
Empresa:
Rubro:
Potencial B2B:
Motivo:
Ángulo recomendado:
Contacto ideal:
Riesgo:
Próximo paso:`,
    userPromptTemplate: null,
    model: 'gpt-4o-mini',
    temperature: 0.4,
    maxTokens: 1000,
  },
  compliance_agent: {
    promptVersionId: null,
    systemPrompt: `${GLOBAL_GUARDRAILS}

Sos un revisor de compliance comercial para seguros. Evaluás un mensaje y detectás afirmaciones riesgosas (promesas de cobertura, garantías, negación de riesgo, comparaciones de inversión, etc.).

Respondé en texto plano:
Nivel de riesgo: (bajo / medio / alto / critico)
Problemas detectados:
Versión sugerida (segura):`,
    userPromptTemplate: null,
    model: 'gpt-4o-mini',
    temperature: 0.2,
    maxTokens: 800,
  },
  campaign_agent: {
    promptVersionId: null,
    systemPrompt: `${GLOBAL_GUARDRAILS}

Sos un estratega de campañas B2B de PLIFE. Generás material comercial para un segmento, usando solo el contexto provisto. No cotices ni prometas coberturas.

Según lo que se te pida, generá texto plano claro y accionable (mensaje inicial, guion de llamada, objeciones esperadas o secuencia de seguimiento).`,
    userPromptTemplate: null,
    model: 'gpt-4o-mini',
    temperature: 0.6,
    maxTokens: 1200,
  },
}

export async function resolvePrompt(
  supabase: SupabaseClient<Database>,
  agentName: AgentName
): Promise<ResolvedPrompt> {
  const fallback = DEFAULT_PROMPTS[agentName]

  const { data } = await supabase
    .from('ai_prompt_versions')
    .select('*')
    .eq('agent_name', agentName)
    .eq('is_active', true)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return fallback

  return {
    promptVersionId: data.id,
    systemPrompt: data.system_prompt || fallback.systemPrompt,
    userPromptTemplate: data.user_prompt_template ?? null,
    model: data.model || fallback.model,
    temperature: data.temperature ?? fallback.temperature,
    maxTokens: data.max_tokens ?? fallback.maxTokens,
  }
}

// Renders a user prompt: uses the DB template ({{key}} interpolation) when present,
// otherwise serializes the context into a readable block.
export function renderUserPrompt(
  template: string | null,
  context: Record<string, unknown>
): string {
  if (template) {
    let out = template
    for (const [key, value] of Object.entries(context)) {
      out = out.replaceAll(`{{${key}}}`, String(value ?? ''))
    }
    return out
  }
  return Object.entries(context)
    .filter(([, v]) => v != null && String(v).trim() !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')
}
