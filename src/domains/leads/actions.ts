'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  buildLeadInsertRow,
  buildLeadOperationalUpdate,
  CreateLeadInputSchema,
  updateLeadOperationalSchema,
  type CreateLeadInput,
  type UpdateLeadOperationalInput,
} from './validation'

export type CreateLeadActionResult =
  | { success: true; id: string }
  | { success: false; error: string }

export async function createLeadAction(input: CreateLeadInput): Promise<CreateLeadActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Debés iniciar sesión para crear un lead.' }
  }

  const parsed = CreateLeadInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  }

  const row = buildLeadInsertRow(parsed.data, user.id)

  const { data, error } = await supabase.from('leads').insert(row).select('id').single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/app/leads')
  revalidatePath('/app/pipeline')

  return { success: true, id: data.id }
}

export type UpdateLeadOperationalActionResult =
  | { success: true; id: string }
  | { success: false; error: string }

// FASE 14J — Update de campos operativos (etapa activa, prioridad, temperatura,
// próximo paso, fecha, notas). No toca status, soft-delete ni conversión.
export async function updateLeadOperationalAction(
  input: UpdateLeadOperationalInput
): Promise<UpdateLeadOperationalActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Debés iniciar sesión para actualizar un lead.' }
  }

  const parsed = updateLeadOperationalSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  }

  const { data, error } = await supabase
    .from('leads')
    .update(buildLeadOperationalUpdate(parsed.data))
    .eq('id', parsed.data.lead_id)
    .is('deleted_at', null)
    .select('id')

  if (error) {
    return { success: false, error: error.message }
  }

  if (!data || data.length === 0) {
    return {
      success: false,
      error: 'No se pudo actualizar el lead: no existe, fue eliminado o no tenés permisos.',
    }
  }

  revalidatePath('/app/leads')
  revalidatePath('/app/pipeline')
  revalidatePath(`/app/leads/${parsed.data.lead_id}`)

  return { success: true, id: parsed.data.lead_id }
}
