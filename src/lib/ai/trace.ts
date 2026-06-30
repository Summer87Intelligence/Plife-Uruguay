// AI traceability. Every AI response must be recorded in `ai_interactions`.
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json, RiskLevel } from '@/types/database'

export interface TraceInput {
  agentName: string
  promptVersionId: string | null
  userId: string
  inputContext: Record<string, unknown>
  fullPrompt: string
  response: string
  modelUsed: string
  tokensUsed: number | null
  riskLevel: RiskLevel
  riskFlags: string[]
  documentsUsed?: string[]
  contactId?: string | null
  companyId?: string | null
  opportunityId?: string | null
  campaignId?: string | null
}

// Inserts the interaction record and returns its id (or null if the insert failed,
// without throwing — tracing must never block a legitimate AI response).
export async function logAIInteraction(
  supabase: SupabaseClient<Database>,
  input: TraceInput
): Promise<string | null> {
  const { data, error } = await supabase
    .from('ai_interactions')
    .insert({
      agent_name: input.agentName,
      prompt_version_id: input.promptVersionId,
      user_id: input.userId,
      input_context: input.inputContext as Json,
      full_prompt: input.fullPrompt,
      response: input.response,
      model_used: input.modelUsed,
      tokens_used: input.tokensUsed,
      risk_level: input.riskLevel,
      risk_flags: input.riskFlags,
      documents_used: input.documentsUsed ?? [],
      contact_id: input.contactId ?? null,
      company_id: input.companyId ?? null,
      opportunity_id: input.opportunityId ?? null,
      campaign_id: input.campaignId ?? null,
    })
    .select('id')
    .single()

  if (error) return null
  return data.id
}
