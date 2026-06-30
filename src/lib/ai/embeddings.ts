// Embedding generation + semantic search. Server-side only.
// Degrades gracefully when OPENAI_API_KEY is absent:
//   generateEmbedding → returns null
//   indexDocumentChunks → success with fallback=true (chunks stored without embedding)
//   searchKnowledgeSemantic → falls back to plain-text search

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { isAIConfigured } from '@/lib/ai/provider'

const EMBEDDING_MODEL = 'text-embedding-3-small'
const MAX_INPUT_CHARS = 8000

export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!isAIConfigured()) return null
  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: EMBEDDING_MODEL, input: text.slice(0, MAX_INPUT_CHARS) }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.data?.[0]?.embedding ?? null
  } catch {
    return null
  }
}

export interface IndexResult {
  success: boolean
  chunksIndexed: number
  chunksSkipped: number
  /** true when AI key is absent — chunks exist but have no embeddings yet */
  fallback: boolean
  error?: string
}

// Generates embeddings for every chunk of a document that doesn't have one yet.
// Chunks that already have an embedding are skipped (idempotent).
// Requires knowledge-embeddings.sql to have been applied in Supabase.
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

  if (!isAIConfigured()) {
    return { success: true, chunksIndexed: 0, chunksSkipped: chunks.length, fallback: true }
  }

  let indexed = 0
  let skipped = 0

  for (const chunk of chunks) {
    if (chunk.embedding != null) { skipped++; continue }
    const embedding = await generateEmbedding(chunk.content)
    if (embedding) {
      const { error: updErr } = await supabase
        .from('knowledge_chunks')
        .update({ embedding } as never)
        .eq('id', chunk.id)
      if (!updErr) indexed++
    }
  }

  return { success: true, chunksIndexed: indexed, chunksSkipped: skipped, fallback: false }
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

// Semantic search. With AI key: embed query → pgvector cosine similarity.
// Without AI key or if search returns 0 results: plain-text ilike fallback.
export async function searchKnowledgeSemantic(
  supabase: SupabaseClient<Database>,
  query: string,
  options: { matchCount?: number; threshold?: number } = {}
): Promise<SemanticSearchResult> {
  const { matchCount = 5, threshold = 0.6 } = options

  if (isAIConfigured()) {
    const embedding = await generateEmbedding(query)
    if (embedding) {
      const { data } = await supabase.rpc('search_knowledge', {
        query_embedding: embedding,
        match_threshold: threshold,
        match_count: matchCount,
      })
      if (data && data.length > 0) {
        return {
          chunks: data.map(r => ({
            id: r.id,
            document_id: r.document_id,
            document_name: r.document_name,
            content: r.content,
            similarity: r.similarity,
          })),
          usedSemantic: true,
        }
      }
    }
  }

  // Text fallback
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
