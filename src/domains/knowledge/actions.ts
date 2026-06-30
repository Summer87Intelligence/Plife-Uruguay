'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, DocumentStatus } from '@/types/database'
import { indexDocumentChunks, reindexDocumentChunks } from '@/lib/ai/embeddings'

const DocSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  category: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(['activo', 'inactivo', 'en_revision', 'archivado']).optional(),
})

export type KnowledgeDocFormData = z.infer<typeof DocSchema>

export async function createKnowledgeDocument(data: KnowledgeDocFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const parsed = DocSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { data: doc, error } = await supabase
    .from('knowledge_documents')
    .insert({
      name: parsed.data.name,
      description: parsed.data.description || null,
      category: parsed.data.category || null,
      tags: parsed.data.tags ? parsed.data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      status: (parsed.data.status as DocumentStatus) || 'en_revision',
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Store manual text content as a single chunk.
  if (parsed.data.content && parsed.data.content.trim()) {
    await supabase.from('knowledge_chunks').insert({
      document_id: doc.id,
      content: parsed.data.content.trim(),
      chunk_index: 0,
    })
  }

  revalidatePath('/app/conocimiento')
  return { data: doc }
}

export async function setKnowledgeStatus(id: string, status: DocumentStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('knowledge_documents')
    .update({ status })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/app/conocimiento')
  revalidatePath(`/app/conocimiento/${id}`)
  return { success: true }
}

// TAREA 2 — index all unembedded chunks for a document.
export async function indexKnowledgeDocument(documentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const result = await indexDocumentChunks(supabase, documentId)
  if (!result.success) return { error: result.error ?? 'Error al indexar' }

  revalidatePath('/app/conocimiento')
  return {
    success: true,
    chunksIndexed: result.chunksIndexed,
    chunksSkipped: result.chunksSkipped,
    fallback: result.fallback,
  }
}

// TAREA 3 — semantic search (or text fallback). Callable from client components.
export async function searchKnowledgeDocuments(query: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  if (!query.trim()) return { data: { chunks: [], usedSemantic: false } }
  const { searchKnowledgeSemantic } = await import('@/lib/ai/embeddings')
  const result = await searchKnowledgeSemantic(supabase, query.trim(), { matchCount: 6 })
  return { data: result }
}

// TAREA 2 — force reindex: clears embeddings then regenerates.
export async function reindexKnowledgeDocument(documentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const result = await reindexDocumentChunks(supabase, documentId)
  if (!result.success) return { error: result.error ?? 'Error al reindexar' }

  revalidatePath('/app/conocimiento')
  return {
    success: true,
    chunksIndexed: result.chunksIndexed,
    chunksSkipped: result.chunksSkipped,
    fallback: result.fallback,
  }
}

// Loads validated (active) knowledge as a text block for AI grounding.
// Returns empty string if there is no validated base yet.
// documentNames is included so callers can surface source attribution in UI.
export async function getActiveKnowledgeContext(
  supabase: SupabaseClient<Database>,
  limit = 8
): Promise<{ text: string; documentIds: string[]; documentNames: string[] }> {
  const { data: docs } = await supabase
    .from('knowledge_documents')
    .select('id, name, description, category')
    .eq('status', 'activo')
    .is('deleted_at', null)
    .limit(limit)

  if (!docs || docs.length === 0) return { text: '', documentIds: [], documentNames: [] }

  const ids = docs.map(d => d.id)
  const names = docs.map(d => d.name)

  const { data: chunks } = await supabase
    .from('knowledge_chunks')
    .select('document_id, content, chunk_index')
    .in('document_id', ids)
    .order('chunk_index')

  const byDoc = new Map<string, string[]>()
  for (const ch of chunks ?? []) {
    const arr = byDoc.get(ch.document_id) ?? []
    arr.push(ch.content)
    byDoc.set(ch.document_id, arr)
  }

  const blocks = docs.map(d => {
    const body = (byDoc.get(d.id) ?? []).join('\n') || d.description || ''
    return `# ${d.name}${d.category ? ` (${d.category})` : ''}\n${body}`.trim()
  }).filter(b => b.length > 0)

  return { text: blocks.join('\n\n'), documentIds: ids, documentNames: names }
}
