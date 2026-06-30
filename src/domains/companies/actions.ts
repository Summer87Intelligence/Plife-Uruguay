'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { CompanyB2BStatus } from '@/types/database'

const CompanySchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  estimated_size: z.string().optional(),
  estimated_employees: z.coerce.number().optional(),
  source: z.string().optional(),
  b2b_score: z.coerce.number().min(0).max(100).optional(),
  b2b_status: z.enum(['detectada','analizada','priorizada','asignada','contactada','reunion_agendada','en_negociacion','descartada','convertida']).optional(),
  commercial_angle: z.string().optional(),
  notes: z.string().optional(),
  opportunity_detected: z.string().optional(),
  assigned_to: z.string().uuid().optional().or(z.literal('')),
})

export type CompanyFormData = z.infer<typeof CompanySchema>

export async function createCompany(data: CompanyFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const parsed = CompanySchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const clean = {
    ...parsed.data,
    website: parsed.data.website || null,
    linkedin_url: parsed.data.linkedin_url || null,
    assigned_to: parsed.data.assigned_to || user.id,
    created_by: user.id,
  }

  const { data: company, error } = await supabase.from('companies').insert(clean).select().single()
  if (error) return { error: error.message }

  await supabase.rpc('log_audit_event', {
    p_event_type: 'company_created',
    p_entity_type: 'company',
    p_entity_id: company.id,
    p_new_data: company,
  })

  revalidatePath('/app/empresas')
  revalidatePath('/app/radar-b2b')
  return { data: company }
}

export async function updateCompanyStatus(id: string, b2b_status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data, error } = await supabase
    .from('companies')
    .update({ b2b_status: b2b_status as CompanyB2BStatus, updated_by: user.id })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/app/empresas')
  revalidatePath(`/app/empresas/${id}`)
  return { data }
}

export async function updateCompany(id: string, data: Partial<CompanyFormData>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: company, error } = await supabase
    .from('companies')
    .update({ ...data, updated_by: user.id })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/app/empresas')
  revalidatePath(`/app/empresas/${id}`)
  return { data: company }
}
