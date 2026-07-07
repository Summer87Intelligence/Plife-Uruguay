// Embedding generation + semantic search. Server-side only.
// OpenAI fue removido en FASE 15B. No se generan embeddings vía proveedor externo.
// Comportamiento actual (sin proveedor):
//   generateEmbedding → devuelve null (búsqueda semántica real queda pendiente)
//   indexDocumentChunks → success con fallback=true (chunks guardados sin embedding)
//   searchKnowledgeSemantic → usa siempre búsqueda por texto (ilike)

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// PENDIENTE: la búsqueda semántica real requiere una tecnología de embeddings
// aún no definida. Hasta entonces devolvemos null (sin llamadas externas).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateEmbedding(_text: string): Promise<number[] | null> {
  return null
}

export interface IndexResult {
  success: boolean
  chunksIndexed: number
  chunksSkipped: number
  /** true: sin proveedor de embeddings — los chunks existen pero no se indexan */
  fallback: boolean
  error?: string
}

// Sin proveedor de embeddings (OpenAI removido en 15B) no se generan vectores.
// Se conserva la firma pública: valida que existan chunks y devuelve fallback=true
// (los chunks quedan almacenados sin embedding hasta definir una tecnología).
export async function indexDocumentChunks(
  supabase: SupabaseClient<Database>,
  documentId: string
): Promise<IndexResult> {
  const { data: chunks, error: fetchErr } = await supabase
    .from('knowledge_chunks')
    .select('id, content, embedding')
    .eq('document_id', documentId)

  if (fetchErr) {
    return {
      success: false, chunksIndexed: 0, chunksSkipped: 0, fallback: false,
      error: fetchErr.message.includes('column') && fetchErr.message.includes('embedding')
        ? 'Columna embedding no encontrada. Aplicá supabase/knowledge-embeddings.sql antes de indexar.'
        : fetchErr.message,
    }
  }
  if (!chunks || chunks.length === 0) {
    return { success: false, chunksIndexed: 0, chunksSkipped: 0, fallback: false, error: 'Sin chunks para indexar. Creá el documento con contenido.' }
  }

  // Modo determinístico interno: no hay generación de embeddings.
  return { success: true, chunksIndexed: 0, chunksSkipped: chunks.length, fallback: true }
}

// Like indexDocumentChunks but clears all existing embeddings first (force reindex).
export async function reindexDocumentChunks(
  supabase: SupabaseClient<Database>,
  documentId: string
): Promise<IndexResult> {
  await supabase
    .from('knowledge_chunks')
    .update({ embedding: null } as never)
    .eq('document_id', documentId)

  return indexDocumentChunks(supabase, documentId)
}

export interface SemanticChunk {
  id: string
  document_id: string
  document_name: string
  content: string
  similarity: number
}

export interface SemanticSearchResult {
  chunks: SemanticChunk[]
  usedSemantic: boolean
}

// Búsqueda de conocimiento. Sin proveedor de embeddings (15B) se usa siempre
// búsqueda por texto (ilike). La búsqueda semántica real queda pendiente de
// definir una tecnología de embeddings.
export async function searchKnowledgeSemantic(
  supabase: SupabaseClient<Database>,
  query: string,
  options: { matchCount?: number; threshold?: number } = {}
): Promise<SemanticSearchResult> {
  const { matchCount = 5 } = options

  // Text fallback (único modo disponible sin proveedor de embeddings)
  const q = query.slice(0, 100)
  const { data: chunkRows } = await supabase
    .from('knowledge_chunks')
    .select('id, document_id, content')
    .ilike('content', `%${q}%`)
    .limit(matchCount)

  if (!chunkRows || chunkRows.length === 0) return { chunks: [], usedSemantic: false }

  const docIds = [...new Set(chunkRows.map(c => c.document_id))]
  const { data: docRows } = await supabase
    .from('knowledge_documents')
    .select('id, name')
    .in('id', docIds)
    .eq('status', 'activo')
    .is('deleted_at', null)

  const docNameMap = new Map(docRows?.map(d => [d.id, d.name]) ?? [])

  return {
    chunks: chunkRows
      .filter(ch => docNameMap.has(ch.document_id))
      .map(ch => ({
        id: ch.id,
        document_id: ch.document_id,
        document_name: docNameMap.get(ch.document_id)!,
        content: ch.content,
        similarity: 0,
      })),
    usedSemantic: false,
  }
}
