'use server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { runAgent } from '@/lib/ai/agents'

export interface CopilotInput {
  contact_name?: string
  position?: string
  company?: string
  need?: string
  history?: string
  stage?: string
  opportunity_id?: string
  contact_id?: string
  company_id?: string
}

export async function runAdvisorCopilot(input: CopilotInput) {
  const user = await requireAuth()

  try {
    const result = await runAgent({
      agentName: 'advisor_copilot',
      context: {
        contact_name: input.contact_name ?? 'No especificado',
        position: input.position ?? 'No especificado',
        company: input.company ?? 'No especificado',
        need: input.need ?? 'No especificado',
        history: input.history ?? 'Sin historial previo',
        stage: input.stage ?? 'nueva',
      },
      userId: user.id,
      contactId: input.contact_id,
      companyId: input.company_id,
      opportunityId: input.opportunity_id,
    })

    return { data: result }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Error del agente IA' }
  }
}

export interface B2BAnalysisInput {
  company_name: string
  industry?: string
  data?: string
  employees?: string
  campaign_objective?: string
  company_id?: string
}

export async function runB2BAnalysis(input: B2BAnalysisInput) {
  const user = await requireAuth()

  try {
    const result = await runAgent({
      agentName: 'b2b_research',
      context: {
        company_name: input.company_name,
        industry: input.industry ?? 'No especificado',
        data: input.data ?? 'Sin datos adicionales',
        employees: input.employees ?? 'Desconocido',
        campaign_objective: input.campaign_objective ?? 'Seguros colectivos / vida',
      },
      userId: user.id,
      companyId: input.company_id,
    })

    return { data: result }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Error del agente IA' }
  }
}

export async function runComplianceCheck(content: string, context?: string) {
  const user = await requireAuth()

  try {
    const result = await runAgent({
      agentName: 'compliance_agent',
      context: {
        message_content: content,
        context: context ?? 'Mensaje comercial de asesor',
        channel: 'whatsapp',
      },
      userId: user.id,
    })

    return { data: result }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Error del agente IA' }
  }
}

export async function runCampaignAgent(input: {
  campaign_name: string
  segment: string
  icp: string
  channel: string
  objective: string
  campaign_id?: string
}) {
  const user = await requireAuth()

  try {
    const result = await runAgent({
      agentName: 'campaign_agent',
      context: input,
      userId: user.id,
      campaignId: input.campaign_id,
    })

    return { data: result }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Error del agente IA' }
  }
}
