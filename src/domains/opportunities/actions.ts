'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { OpportunityStage, Opportunity } from '@/types/database'

const OpportunitySchema = z.object({
  title: z.string().min(1, 'Título requerido'),
  type: z.enum(['b2c', 'b2b', 'reclutamiento']),
  stage: z.enum(['nueva','calificada','contactada','reunion_agendada','diagnostico_realizado','propuesta_conceptual','validacion_plife','seguimiento','cerrada_ganada','cerrada_perdida','dormida']).optional(),
  estimated_value: z.coerce.number().optional(),
  probability: z.coerce.number().min(0).max(100).optional(),
  human_score: z.coerce.number().min(0).max(100).optional(),
  detected_need: z.string().optional(),
  suggested_product: z.string().optional(),
  commercial_risk: z.enum(['bajo','medio','alto','critico']).optional(),
  next_action: z.string().optional(),
  next_action_date: z.string().optional(),
  loss_reason: z.string().optional(),
  notes: z.string().optional(),
  contact_id: z.string().uuid().optional().or(z.literal('')),
  company_id: z.string().uuid().optional().or(z.literal('')),
  campaign_id: z.string().uuid().optional().or(z.literal('')),
  assigned_to: z.string().uuid().optional().or(z.literal('')),
})

export type OpportunityFormData = z.infer<typeof OpportunitySchema>

export async function createOpportunity(data: OpportunityFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const parsed = OpportunitySchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const clean = {
    ...parsed.data,
    stage: parsed.data.stage || 'nueva',
    contact_id: parsed.data.contact_id || null,
    company_id: parsed.data.company_id || null,
    campaign_id: parsed.data.campaign_id || null,
    assigned_to: parsed.data.assigned_to || user.id,
    created_by: user.id,
  }

  const { data: opp, error } = await supabase.from('opportunities').insert(clean).select().single()
  if (error) return { error: error.message }

  await supabase.rpc('log_audit_event', {
    p_event_type: 'opportunity_created',
    p_entity_type: 'opportunity',
    p_entity_id: opp.id,
    p_new_data: opp,
  })

  revalidatePath('/app/oportunidades')
  return { data: opp }
}

export async function updateOpportunityStage(id: string, stage: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: old } = await supabase.from('opportunities').select('stage').eq('id', id).single()

  const { data, error } = await supabase
    .from('opportunities')
    .update({ stage: stage as OpportunityStage, last_activity_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  await supabase.rpc('log_audit_event', {
    p_event_type: 'opportunity_stage_changed',
    p_entity_type: 'opportunity',
    p_entity_id: id,
    p_old_data: old,
    p_new_data: { stage },
  })

  revalidatePath('/app/oportunidades')
  revalidatePath(`/app/oportunidades/${id}`)
  return { data }
}

export async function updateOpportunity(id: string, data: Partial<OpportunityFormData>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const parsed = OpportunitySchema.partial().safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const clean: Record<string, unknown> = { ...parsed.data, updated_by: user.id }
  for (const key of ['contact_id', 'company_id', 'campaign_id', 'assigned_to'] as const) {
    if (key in clean && clean[key] === '') clean[key] = null
  }

  const { data: opp, error } = await supabase
    .from('opportunities')
    .update(clean as Partial<Opportunity>)
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/app/oportunidades')
  revalidatePath(`/app/oportunidades/${id}`)
  return { data: opp }
}

export async function closeOpportunity(id: string, result: 'ganada' | 'perdida', loss_reason?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const stage = result === 'ganada' ? 'cerrada_ganada' : 'cerrada_perdida'
  const { data: old } = await supabase.from('opportunities').select('stage').eq('id', id).single()

  const { data, error } = await supabase
    .from('opportunities')
    .update({
      stage,
      probability: result === 'ganada' ? 100 : 0,
      loss_reason: result === 'perdida' ? (loss_reason || null) : null,
      last_activity_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  await supabase.rpc('log_audit_event', {
    p_event_type: 'opportunity_closed',
    p_entity_type: 'opportunity',
    p_entity_id: id,
    p_old_data: old,
    p_new_data: { stage, loss_reason: loss_reason ?? null },
  })

  revalidatePath('/app/oportunidades')
  revalidatePath(`/app/oportunidades/${id}`)
  return { data }
}
