'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, DocumentStatus } from '@/types/database'

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

  // Store manual text content as a single knowledge chunk (no schema change).
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

// Loads validated (active) knowledge as a single text block for AI grounding.
// Returns empty string if there is no validated base yet.
export async function getActiveKnowledgeContext(
  supabase: SupabaseClient<Database>,
  limit = 8
): Promise<{ text: string; documentIds: string[] }> {
  const { data: docs } = await supabase
    .from('knowledge_documents')
    .select('id, name, description, category')
    .eq('status', 'activo')
    .is('deleted_at', null)
    .limit(limit)

  if (!docs || docs.length === 0) return { text: '', documentIds: [] }

  const ids = docs.map(d => d.id)
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

  return { text: blocks.join('\n\n'), documentIds: ids }
}
