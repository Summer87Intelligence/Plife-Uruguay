import { createClient } from '@/lib/supabase/server'
import type { AIInteraction, Json } from '@/types/database'

export interface AgentInput {
  agentName: string
  context: Record<string, unknown>
  userId: string
  contactId?: string
  companyId?: string
  opportunityId?: string
  campaignId?: string
}

export interface AgentOutput {
  response: string
  riskLevel: 'bajo' | 'medio' | 'alto' | 'critico'
  riskFlags: string[]
  documentsUsed: string[]
  tokensUsed: number
  interactionId?: string
}

export async function runAgent(input: AgentInput): Promise<AgentOutput> {
  const supabase = await createClient()

  // Obtener prompt activo del agente
  const { data: promptVersion } = await supabase
    .from('ai_prompt_versions')
    .select('*')
    .eq('agent_name', input.agentName)
    .eq('is_active', true)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  if (!promptVersion) {
    throw new Error(`No hay prompt activo para el agente: ${input.agentName}`)
  }

  // Construir prompt de usuario desde template
  let userPrompt = promptVersion.user_prompt_template || ''
  Object.entries(input.context).forEach(([key, value]) => {
    userPrompt = userPrompt.replace(`{{${key}}}`, String(value ?? ''))
  })

  const fullPrompt = userPrompt || JSON.stringify(input.context)

  // Llamar a OpenAI
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: promptVersion.model,
      temperature: Number(promptVersion.temperature),
      max_tokens: promptVersion.max_tokens || 2000,
      messages: [
        { role: 'system', content: promptVersion.system_prompt },
        { role: 'user', content: fullPrompt },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Error OpenAI: ${err}`)
  }

  const data = await response.json()
  const aiResponse: string = data.choices[0]?.message?.content ?? ''
  const tokensUsed: number = data.usage?.total_tokens ?? 0

  // Detectar riesgo básico en la respuesta
  const { riskLevel, riskFlags } = detectRisk(aiResponse)

  // Guardar interacción para trazabilidad
  const { data: interaction } = await supabase
    .from('ai_interactions')
    .insert({
      agent_name: input.agentName,
      prompt_version_id: promptVersion.id,
      user_id: input.userId,
      input_context: input.context as Json,
      full_prompt: fullPrompt,
      response: aiResponse,
      model_used: promptVersion.model,
      tokens_used: tokensUsed,
      risk_level: riskLevel,
      risk_flags: riskFlags,
      contact_id: input.contactId ?? null,
      company_id: input.companyId ?? null,
      opportunity_id: input.opportunityId ?? null,
      campaign_id: input.campaignId ?? null,
    })
    .select('id')
    .single()

  return {
    response: aiResponse,
    riskLevel,
    riskFlags,
    documentsUsed: [],
    tokensUsed,
    interactionId: interaction?.id,
  }
}

const DANGEROUS_PATTERNS = [
  { pattern: /te cubre todo/i, flag: 'promesa_cobertura_total' },
  { pattern: /está garantizado/i, flag: 'garantia_absoluta' },
  { pattern: /te aprueban seguro/i, flag: 'promesa_aprobacion' },
  { pattern: /no tiene riesgo/i, flag: 'negacion_riesgo' },
  { pattern: /vas a ganar/i, flag: 'promesa_rendimiento' },
  { pattern: /mejor que cualquier inversión/i, flag: 'comparacion_inversion' },
  { pattern: /MAPFRE seguro lo acepta/i, flag: 'garantia_aseguradora' },
  { pattern: /sin letra chica/i, flag: 'negacion_condiciones' },
  { pattern: /te aseguro que/i, flag: 'certeza_absoluta' },
]

const HIGH_RISK_PATTERNS = [
  { pattern: /garantiz/i, flag: 'garantia' },
  { pattern: /sin riesgo/i, flag: 'sin_riesgo' },
  { pattern: /100% aprobado/i, flag: 'aprobacion_total' },
]

function detectRisk(text: string): { riskLevel: 'bajo' | 'medio' | 'alto' | 'critico'; riskFlags: string[] } {
  const flags: string[] = []

  for (const { pattern, flag } of DANGEROUS_PATTERNS) {
    if (pattern.test(text)) flags.push(flag)
  }

  if (flags.length > 0) return { riskLevel: 'critico', riskFlags: flags }

  for (const { pattern, flag } of HIGH_RISK_PATTERNS) {
    if (pattern.test(text)) flags.push(flag)
  }

  if (flags.length > 0) return { riskLevel: 'alto', riskFlags: flags }
  return { riskLevel: 'bajo', riskFlags: [] }
}
