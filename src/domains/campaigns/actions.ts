'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { CampaignType, CampaignStatus, Campaign } from '@/types/database'

const CampaignSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  type: z.enum([
    'duenos_pymes', 'empresas_familiares', 'estudios_contables', 'estudios_juridicos',
    'clinicas', 'empresas_tech', 'constructoras', 'clubes_asociaciones',
    'profesionales_independientes', 'ejecutivos', 'reclutamiento_asesores', 'general',
  ]),
  status: z.enum(['borrador', 'activa', 'pausada', 'finalizada', 'archivada']).optional(),
  objective: z.string().optional(),
  target_segment: z.string().optional(),
  icp_description: z.string().optional(),
  initial_message: z.string().optional(),
  call_script: z.string().optional(),
  expected_objections: z.array(z.string()).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})

export type CampaignFormData = z.infer<typeof CampaignSchema>

export async function createCampaign(data: CampaignFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const parsed = CampaignSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .insert({
      ...parsed.data,
      type: parsed.data.type as CampaignType,
      status: (parsed.data.status as CampaignStatus) || 'borrador',
      start_date: parsed.data.start_date || null,
      end_date: parsed.data.end_date || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/app/campanas')
  return { data: campaign }
}

export async function updateCampaign(id: string, data: Partial<CampaignFormData>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const parsed = CampaignSchema.partial().safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const clean: Record<string, unknown> = { ...parsed.data }
  for (const key of ['start_date', 'end_date'] as const) {
    if (key in clean && clean[key] === '') clean[key] = null
  }

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .update(clean as Partial<Campaign>)
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/app/campanas')
  revalidatePath(`/app/campanas/${id}`)
  return { data: campaign }
}

export async function updateCampaignStatus(id: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data, error } = await supabase
    .from('campaigns')
    .update({ status: status as CampaignStatus })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/app/campanas')
  revalidatePath(`/app/campanas/${id}`)
  return { data }
}
