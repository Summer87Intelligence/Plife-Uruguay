// High-level agent runner. Orchestrates: resolve prompt -> call provider
// (internal deterministic) -> persist trace. Server-side only.
import { createClient } from '@/lib/supabase/server'
import { chatComplete, isAIConfigured, AINotConfiguredError, AI_NOT_CONFIGURED_MESSAGE } from '@/lib/ai/provider'
import { resolvePrompt, renderUserPrompt, type AgentName } from '@/lib/ai/prompts'
import { logAIInteraction } from '@/lib/ai/trace'
import type { RiskLevel } from '@/types/database'

export { AI_NOT_CONFIGURED_MESSAGE, isAIConfigured }

export interface AgentInput {
  agentName: AgentName
  context: Record<string, unknown>
  userId: string
  /** Extra validated knowledge passed to the model as grounding context. */
  knowledge?: string
  documentsUsed?: string[]
  documentNames?: string[]
  contactId?: string
  companyId?: string
  opportunityId?: string
  campaignId?: string
}

export interface AgentOutput {
  response: string
  riskLevel: RiskLevel
  riskFlags: string[]
  documentsUsed: string[]
  documentNames: string[]
  tokensUsed: number
  interactionId?: string
  knowledgeUsed: boolean
}

export async function runAgent(input: AgentInput): Promise<AgentOutput> {
  if (!isAIConfigured()) {
    throw new AINotConfiguredError()
  }

  const supabase = await createClient()
  const prompt = await resolvePrompt(supabase, input.agentName)

  let userPrompt = renderUserPrompt(prompt.userPromptTemplate, input.context)
  const hasKnowledge = Boolean(input.knowledge && input.knowledge.trim())
  if (hasKnowledge) {
    userPrompt += `\n\n--- BASE DE CONOCIMIENTO VALIDADA ---\n${input.knowledge}\n--- FIN BASE ---\nUsá esta base como fuente de verdad. Si algo no está acá, aclaralo y no lo afirmes.`
  } else {
    userPrompt += `\n\n(No hay base de conocimiento validada disponible. No afirmes condiciones de producto; ayudá solo a estructurar la conversación.)`
  }

  const { content, model, tokensUsed } = await chatComplete({
    system: prompt.systemPrompt,
    user: userPrompt,
    model: prompt.model,
    temperature: prompt.temperature,
    maxTokens: prompt.maxTokens,
  })

  // Motor interno determinístico: sin capa de análisis de riesgo (removida en
  // FASE 15C). La traza registra un nivel de riesgo neutro por defecto.
  const riskLevel: RiskLevel = 'bajo'
  const riskFlags: string[] = []

  const interactionId = await logAIInteraction(supabase, {
    agentName: input.agentName,
    promptVersionId: prompt.promptVersionId,
    userId: input.userId,
    inputContext: input.context,
    fullPrompt: userPrompt,
    response: content,
    modelUsed: model,
    tokensUsed,
    riskLevel,
    riskFlags,
    documentsUsed: input.documentsUsed,
    contactId: input.contactId,
    companyId: input.companyId,
    opportunityId: input.opportunityId,
    campaignId: input.campaignId,
  })

  return {
    response: content,
    riskLevel,
    riskFlags,
    documentsUsed: input.documentsUsed ?? [],
    documentNames: input.documentNames ?? [],
    tokensUsed: tokensUsed ?? 0,
    interactionId: interactionId ?? undefined,
    knowledgeUsed: hasKnowledge,
  }
}
