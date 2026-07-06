'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  buildLeadInsertRow,
  CreateLeadInputSchema,
  type CreateLeadInput,
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
