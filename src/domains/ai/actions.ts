'use server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { runAgent } from '@/lib/ai/agents'
import { isAIConfigured, AI_NOT_CONFIGURED_MESSAGE } from '@/lib/ai/provider'
import { reviewCommercialMessage, type ComplianceResult } from '@/lib/ai/compliance'
import { getActiveKnowledgeContext } from '@/domains/knowledge/actions'
import { addActivity } from '@/domains/contacts/actions'
import { HELP_TYPES, CAMPAIGN_TASK_LABELS, type AIResult, type HelpType, type CampaignAITask } from '@/domains/ai/types'

export async function getAIStatus() {
  return { configured: isAIConfigured(), message: isAIConfigured() ? null : AI_NOT_CONFIGURED_MESSAGE }
}

// ---- Advisor copiloto -------------------------------------------------------

export interface CopilotInput {
  helpType: HelpType
  freeText?: string
  contactId?: string
  companyId?: string
  opportunityId?: string
  campaignId?: string
}

export async function runCopilot(input: CopilotInput): Promise<{ data?: AIResult; error?: string }> {
  const user = await requireAuth()
  if (!isAIConfigured()) return { error: AI_NOT_CONFIGURED_MESSAGE }

  const supabase = await createClient()
  const context: Record<string, unknown> = {
    tipo_de_ayuda: HELP_TYPES[input.helpType],
    indicacion_del_asesor: input.freeText || 'Sin indicaciones adicionales',
  }

  if (input.contactId) {
    const { data: c } = await supabase
      .from('contacts')
      .select('first_name, last_name, position, status, interest_level, detected_need, next_action, company:companies(name)')
      .eq('id', input.contactId).single()
    if (c) {
      context.contacto = `${c.first_name} ${c.last_name}`
      context.cargo = c.position ?? 'No especificado'
      context.empresa = c.company?.name ?? 'No especificada'
      context.estado = c.status
      context.nivel_interes = c.interest_level ?? 'No especificado'
      context.necesidad_detectada = c.detected_need ?? 'No especificada'
      context.proxima_accion = c.next_action ?? 'No definida'
    }
  }
  if (input.opportunityId) {
    const { data: o } = await supabase
      .from('opportunities')
      .select('title, stage, type, detected_need, suggested_product, probability, human_score, next_action')
      .eq('id', input.opportunityId).single()
    if (o) {
      context.oportunidad = o.title
      context.etapa = o.stage
      context.tipo_oportunidad = o.type
      context.necesidad = o.detected_need ?? 'No especificada'
      context.producto_sugerido = o.suggested_product ?? 'No especificado'
      context.probabilidad = o.probability ?? 'No definida'
    }
  }
  if (input.companyId) {
    const { data: co } = await supabase
      .from('companies')
      .select('name, industry, estimated_employees, b2b_status, commercial_angle, opportunity_detected')
      .eq('id', input.companyId).single()
    if (co) {
      context.empresa = co.name
      context.rubro = co.industry ?? 'No especificado'
      context.empleados = co.estimated_employees ?? 'Desconocido'
      context.angulo_comercial = co.commercial_angle ?? 'No definido'
    }
  }

  // Recent activities give the AI conversational history.
  if (input.contactId || input.opportunityId) {
    const col = input.opportunityId ? 'opportunity_id' : 'contact_id'
    const id = input.opportunityId ?? input.contactId!
    const { data: acts } = await supabase
      .from('activities').select('type, title, outcome, created_at')
      .eq(col, id).order('created_at', { ascending: false }).limit(5)
    if (acts && acts.length > 0) {
      context.actividades_recientes = acts.map(a => `${a.type}: ${a.title}${a.outcome ? ` → ${a.outcome}` : ''}`).join(' | ')
    }
  }

  const knowledge = await getActiveKnowledgeContext(supabase)

  try {
    const result = await runAgent({
      agentName: 'advisor_copilot',
      context,
      userId: user.id,
      knowledge: knowledge.text,
      documentsUsed: knowledge.documentIds,
      contactId: input.contactId,
      companyId: input.companyId,
      opportunityId: input.opportunityId,
      campaignId: input.campaignId,
    })

    const compliance = await reviewCommercialMessage(supabase, {
      content: result.response,
      context: HELP_TYPES[input.helpType],
      channel: 'copiloto',
      userId: user.id,
      aiInteractionId: result.interactionId ?? null,
    })

    return { data: { response: result.response, riskLevel: result.riskLevel, compliance, knowledgeUsed: result.knowledgeUsed, interactionId: result.interactionId } }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Error del copiloto IA' }
  }
}

// ---- B2B company analysis ---------------------------------------------------

export async function analyzeCompanyB2B(companyId: string): Promise<{ data?: AIResult; error?: string }> {
  const user = await requireAuth()
  if (!isAIConfigured()) return { error: AI_NOT_CONFIGURED_MESSAGE }

  const supabase = await createClient()
  const { data: co } = await supabase
    .from('companies')
    .select('name, industry, estimated_size, estimated_employees, location, b2b_status, commercial_angle, ideal_contact, opportunity_detected, notes')
    .eq('id', companyId).single()

  if (!co) return { error: 'Empresa no encontrada' }

  const knowledge = await getActiveKnowledgeContext(supabase)

  try {
    const result = await runAgent({
      agentName: 'b2b_research',
      context: {
        empresa: co.name,
        rubro: co.industry ?? 'No especificado',
        tamano: co.estimated_size ?? 'No especificado',
        empleados: co.estimated_employees ?? 'Desconocido',
        ubicacion: co.location ?? 'No especificada',
        estado_b2b: co.b2b_status,
        angulo_actual: co.commercial_angle ?? 'No definido',
        contacto_ideal_actual: co.ideal_contact ?? 'No definido',
        oportunidad_actual: co.opportunity_detected ?? 'No definida',
        notas: co.notes ?? 'Sin notas',
      },
      userId: user.id,
      knowledge: knowledge.text,
      documentsUsed: knowledge.documentIds,
      companyId,
    })

    const compliance = await reviewCommercialMessage(supabase, {
      content: result.response,
      context: 'Análisis B2B',
      channel: 'copiloto',
      userId: user.id,
      aiInteractionId: result.interactionId ?? null,
    })

    return { data: { response: result.response, riskLevel: result.riskLevel, compliance, knowledgeUsed: result.knowledgeUsed, interactionId: result.interactionId } }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Error del análisis IA' }
  }
}

// ---- Campaign material ------------------------------------------------------

export async function runCampaignAI(campaignId: string, task: CampaignAITask): Promise<{ data?: AIResult; error?: string }> {
  const user = await requireAuth()
  if (!isAIConfigured()) return { error: AI_NOT_CONFIGURED_MESSAGE }

  const supabase = await createClient()
  const { data: c } = await supabase
    .from('campaigns')
    .select('name, type, objective, target_segment, icp_description')
    .eq('id', campaignId).single()
  if (!c) return { error: 'Campaña no encontrada' }

  const { count } = await supabase
    .from('companies').select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId).is('deleted_at', null)

  const knowledge = await getActiveKnowledgeContext(supabase)

  try {
    const result = await runAgent({
      agentName: 'campaign_agent',
      context: {
        tarea: CAMPAIGN_TASK_LABELS[task],
        campana: c.name,
        tipo: c.type,
        objetivo: c.objective ?? 'No definido',
        segmento: c.target_segment ?? 'No definido',
        icp: c.icp_description ?? 'No definido',
        empresas_asociadas: count ?? 0,
      },
      userId: user.id,
      knowledge: knowledge.text,
      documentsUsed: knowledge.documentIds,
      campaignId,
    })

    const compliance = await reviewCommercialMessage(supabase, {
      content: result.response,
      context: `Campaña: ${CAMPAIGN_TASK_LABELS[task]}`,
      channel: 'campaña',
      userId: user.id,
      aiInteractionId: result.interactionId ?? null,
    })

    return { data: { response: result.response, riskLevel: result.riskLevel, compliance, knowledgeUsed: result.knowledgeUsed, interactionId: result.interactionId } }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Error del agente de campañas' }
  }
}

// ---- Deterministic compliance (works without AI) ----------------------------

export async function checkCompliance(content: string, context?: string): Promise<{ data?: ComplianceResult; error?: string }> {
  const user = await requireAuth()
  if (!content.trim()) return { error: 'Ingresá un mensaje para revisar' }
  const supabase = await createClient()
  try {
    const result = await reviewCommercialMessage(supabase, {
      content,
      context: context ?? 'Revisión manual',
      channel: 'manual',
      userId: user.id,
    })
    return { data: result }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Error al revisar el mensaje' }
  }
}

// ---- Save an AI suggestion as a registered activity -------------------------

export async function saveAIAsActivity(input: {
  title: string
  content: string
  contactId?: string
  companyId?: string
  opportunityId?: string
}) {
  if (!input.title.trim()) return { error: 'Falta el título' }
  return addActivity({
    contact_id: input.contactId,
    company_id: input.companyId,
    opportunity_id: input.opportunityId,
    type: 'nota',
    title: input.title,
    description: 'Generado con Copiloto IA (sugerencia revisada por el asesor)',
    outcome: input.content,
    is_completed: true,
  })
}
