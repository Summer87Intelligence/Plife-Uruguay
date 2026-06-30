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

  // Manual text content is stored as chunks; build a per-document content map.
  const ids = (documents ?? []).map(d => d.id)
  const contentMap: Record<string, string> = {}
  if (ids.length > 0) {
    const { data: chunks } = await supabase
      .from('knowledge_chunks')
      .select('document_id, content, chunk_index')
      .in('document_id', ids)
      .order('chunk_index')
    for (const ch of chunks ?? []) {
      contentMap[ch.document_id] = (contentMap[ch.document_id] ? contentMap[ch.document_id] + '\n' : '') + ch.content
    }
  }

  return <KnowledgeView documents={documents ?? []} contentMap={contentMap} profile={profile} />
}
