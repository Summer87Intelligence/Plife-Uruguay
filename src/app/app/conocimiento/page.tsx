import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { KnowledgeView } from './knowledge-view'

export default async function ConocimientoPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const { data: documents } = await supabase
    .from('knowledge_documents')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const ids = (documents ?? []).map(d => d.id)
  const contentMap: Record<string, string> = {}
  const chunkCount: Record<string, number> = {}
  const embeddedCount: Record<string, number> = {}
  let embeddingsReady = false

  if (ids.length > 0) {
    // Always load chunk content
    const { data: chunks } = await supabase
      .from('knowledge_chunks')
      .select('document_id, content, chunk_index')
      .in('document_id', ids)
      .order('chunk_index')

    for (const ch of chunks ?? []) {
      contentMap[ch.document_id] = (contentMap[ch.document_id] ? contentMap[ch.document_id] + '\n' : '') + ch.content
      chunkCount[ch.document_id] = (chunkCount[ch.document_id] ?? 0) + 1
    }

    // Try to count embedded chunks (requires knowledge-embeddings.sql to be applied)
    const { data: embedded, error: embErr } = await supabase
      .from('knowledge_chunks')
      .select('document_id')
      .in('document_id', ids)
      .not('embedding', 'is', null)

    if (!embErr && embedded) {
      embeddingsReady = true
      for (const ch of embedded) {
        embeddedCount[ch.document_id] = (embeddedCount[ch.document_id] ?? 0) + 1
      }
    }
  }

  return (
    <KnowledgeView
      documents={documents ?? []}
      contentMap={contentMap}
      chunkCount={chunkCount}
      embeddedCount={embeddedCount}
      embeddingsReady={embeddingsReady}
      profile={profile}
    />
  )
}
