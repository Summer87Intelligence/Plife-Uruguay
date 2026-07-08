'use server'

// FASE 15M — Crear una propuesta real desde la UI.
// Valida server-side (Zod), lee el lead bajo RLS para snapshots si el origen es un
// lead, y persiste en public.proposals con el Supabase server client (cookies/session).
// NO usa service role. NO crea opportunity. NO toca compliance. NO usa OpenAI.

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getLeadById } from '@/domains/leads/queries'
import {
  CreateProposalInputSchema,
  buildProposalInsertRow,
  buildLeadScoreSnapshot,
  buildLeadQualificationSnapshot,
  isUuid,
  type CreateProposalInput,
  type ProposalSnapshots,
} from '@/domains/proposals'

export type CreateProposalActionResult =
  | { success: true; id: string; leadSnapshot: boolean }
  | { success: false; error: string }

export async function createProposalAction(
  input: CreateProposalInput
): Promise<CreateProposalActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Debés iniciar sesión para guardar una propuesta.' }
  }

  const parsed = CreateProposalInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  }
  const data = parsed.data

  // Snapshots del lead (FASE 15I) si la propuesta nace de un lead con id UUID.
  // Si no se puede leer (RLS/no existe), NO se rompe la creación: se guarda sin snapshot.
  const snapshots: ProposalSnapshots = {}
  let leadSnapshot = false
  if (data.source === 'lead' && isUuid(data.source_id)) {
    const lead = await getLeadById(data.source_id)
    if (lead) {
      const capturedAt = new Date().toISOString()
      snapshots.score_snapshot = buildLeadScoreSnapshot(lead, capturedAt)
      snapshots.qualification_snapshot = buildLeadQualificationSnapshot(lead, capturedAt)
      leadSnapshot = true
    }
    // else: warning controlado — propuesta manual sin snapshot (el lead no es visible).
  }

  const row = buildProposalInsertRow(data, user.id, snapshots)

  const { data: inserted, error } = await supabase
    .from('proposals')
    .insert(row)
    .select('id')
    .single()

  if (error || !inserted) {
    return { success: false, error: error?.message ?? 'No se pudo guardar la propuesta.' }
  }

  revalidatePath('/app/propuestas')

  return { success: true, id: inserted.id, leadSnapshot }
}
