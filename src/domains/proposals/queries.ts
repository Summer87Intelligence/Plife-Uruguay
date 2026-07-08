// FASE 15M — Lectura read-only de propuestas del usuario bajo RLS (sin service role).
// La política proposals_select ya filtra por visibilidad; igual pedimos deleted_at IS NULL.

import { createClient } from '@/lib/supabase/server'
import type { ProposalSource } from './types'
import type { ProposalStatus } from './validation'

export interface ProposalListItem {
  id: string
  title: string
  status: ProposalStatus
  source: ProposalSource
  summary: string | null
  created_at: string
}

const LIST_COLUMNS = 'id, title, status, source, summary, created_at' as const

/** Últimas propuestas activas visibles bajo RLS. Vacío si no hay o ante error. */
export async function getProposals(limit = 50): Promise<ProposalListItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposals')
    .select(LIST_COLUMNS)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status as ProposalStatus,
    source: row.source as ProposalSource,
    summary: row.summary,
    created_at: row.created_at,
  }))
}
