'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ActivityType, Contact } from '@/types/database'

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
    next_action_date: parsed.data.next_action_date || null,
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

  const parsed = ContactSchema.partial().safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const clean: Record<string, unknown> = { ...parsed.data, updated_by: user.id }
  for (const key of ['email', 'linkedin_url', 'company_id', 'next_action_date', 'assigned_to'] as const) {
    if (key in clean && clean[key] === '') clean[key] = null
  }

  const { data: old } = await supabase.from('contacts').select().eq('id', id).single()

  const { data: contact, error } = await supabase
    .from('contacts')
    .update(clean as Partial<Contact>)
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

const ActivitySchema = z.object({
  contact_id: z.string().uuid().optional(),
  opportunity_id: z.string().uuid().optional(),
  company_id: z.string().uuid().optional(),
  type: z.enum(['llamada', 'reunion', 'mensaje', 'email', 'nota', 'tarea', 'whatsapp', 'linkedin']),
  title: z.string().min(1, 'Título requerido'),
  description: z.string().optional(),
  outcome: z.string().optional(),
  scheduled_at: z.string().optional(),
  is_completed: z.boolean().optional(),
})

export type ActivityFormData = z.infer<typeof ActivitySchema>

export async function addActivity(data: ActivityFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const parsed = ActivitySchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const now = new Date().toISOString()
  const { data: activity, error } = await supabase
    .from('activities')
    .insert({
      ...parsed.data,
      type: parsed.data.type as ActivityType,
      scheduled_at: parsed.data.scheduled_at || null,
      is_completed: parsed.data.is_completed ?? true,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  if (parsed.data.contact_id) {
    await supabase.from('contacts').update({ last_interaction_at: now }).eq('id', parsed.data.contact_id)
    revalidatePath(`/app/contactos/${parsed.data.contact_id}`)
  }
  if (parsed.data.opportunity_id) {
    await supabase.from('opportunities').update({ last_activity_at: now }).eq('id', parsed.data.opportunity_id)
    revalidatePath(`/app/oportunidades/${parsed.data.opportunity_id}`)
  }
  if (parsed.data.company_id) {
    revalidatePath(`/app/empresas/${parsed.data.company_id}`)
  }

  revalidatePath('/app/contactos')
  return { data: activity }
}
