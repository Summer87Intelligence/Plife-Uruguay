'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ActivityType } from '@/types/database'

const ContactSchema = z.object({
  first_name: z.string().min(1, 'Nombre requerido'),
  last_name: z.string().min(1, 'Apellido requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  linkedin_url: z.string().url('URL inválida').optional().or(z.literal('')),
  position: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(['nuevo', 'contactado', 'interesado', 'reunion_agendada', 'diagnostico_realizado', 'en_seguimiento', 'en_analisis', 'cerrado_ganado', 'cerrado_perdido', 'seguimiento_futuro']).optional(),
  interest_level: z.enum(['bajo', 'medio', 'alto', 'muy_alto']).optional(),
  detected_need: z.string().optional(),
  next_action: z.string().optional(),
  next_action_date: z.string().optional(),
  notes: z.string().optional(),
  data_consent: z.boolean().optional(),
  data_origin: z.string().optional(),
  company_id: z.string().uuid().optional().or(z.literal('')),
  assigned_to: z.string().uuid().optional().or(z.literal('')),
})

export type ContactFormData = z.infer<typeof ContactSchema>

export async function createContact(data: ContactFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const parsed = ContactSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const clean = {
    ...parsed.data,
    email: parsed.data.email || null,
    linkedin_url: parsed.data.linkedin_url || null,
    company_id: parsed.data.company_id || null,
    assigned_to: parsed.data.assigned_to || user.id,
    created_by: user.id,
  }

  const { data: contact, error } = await supabase.from('contacts').insert(clean).select().single()
  if (error) return { error: error.message }

  // Auditoría
  await supabase.rpc('log_audit_event', {
    p_event_type: 'contact_created',
    p_entity_type: 'contact',
    p_entity_id: contact.id,
    p_new_data: contact,
  })

  revalidatePath('/app/contactos')
  return { data: contact }
}

export async function updateContact(id: string, data: Partial<ContactFormData>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: old } = await supabase.from('contacts').select().eq('id', id).single()

  const { data: contact, error } = await supabase
    .from('contacts')
    .update({ ...data, updated_by: user.id })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  await supabase.rpc('log_audit_event', {
    p_event_type: 'contact_updated',
    p_entity_type: 'contact',
    p_entity_id: id,
    p_old_data: old,
    p_new_data: contact,
  })

  revalidatePath('/app/contactos')
  revalidatePath(`/app/contactos/${id}`)
  return { data: contact }
}

export async function deleteContact(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('contacts')
    .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', id)

  if (error) return { error: error.message }

  await supabase.rpc('log_audit_event', {
    p_event_type: 'contact_deleted',
    p_entity_type: 'contact',
    p_entity_id: id,
  })

  revalidatePath('/app/contactos')
  return { success: true }
}

export async function addActivity(data: {
  contact_id?: string
  opportunity_id?: string
  company_id?: string
  type: string
  title: string
  description?: string
  outcome?: string
  scheduled_at?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: activity, error } = await supabase
    .from('activities')
    .insert({ ...data, type: data.type as ActivityType, created_by: user.id })
    .select()
    .single()

  if (error) return { error: error.message }

  if (data.contact_id) {
    await supabase.from('contacts').update({ last_interaction_at: new Date().toISOString() }).eq('id', data.contact_id)
    revalidatePath(`/app/contactos/${data.contact_id}`)
  }

  revalidatePath('/app/contactos')
  return { data: activity }
}
