-- HISTÓRICO — OpenAI removido en FASE 15B.
-- La columna embedding (1536 dims, originalmente pensada para text-embedding-3-small
-- de OpenAI) queda como registro histórico. La app YA NO genera embeddings vía
-- proveedor externo; la búsqueda de conocimiento usa texto (ilike). La búsqueda
-- semántica real queda pendiente de definir una tecnología. Sin cambios a Supabase.
--
-- FASE 8: Semantic knowledge base (pgvector)
-- Run this in Supabase SQL Editor (once) before deploying FASE 8.
-- Idempotent: safe to re-run.

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to knowledge_chunks (1536 dims = text-embedding-3-small)
ALTER TABLE public.knowledge_chunks
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 3. IVFFlat index for cosine-similarity ANN search
--    (Lists tuned for <100k chunks; increase if corpus grows.)
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx
  ON public.knowledge_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 4. Implement the search_knowledge RPC (signature already declared in database.ts types).
--    Only returns chunks from active, non-deleted documents above the similarity threshold.
CREATE OR REPLACE FUNCTION public.search_knowledge(
  query_embedding vector(1536),
  match_threshold  float DEFAULT 0.6,
  match_count      int   DEFAULT 5
)
RETURNS TABLE (
  id            uuid,
  document_id   uuid,
  content       text,
  similarity    float,
  metadata      jsonb,
  document_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.document_id,
    kc.content,
    (1 - (kc.embedding <=> query_embedding))::float AS similarity,
    kc.metadata::jsonb,
    kd.name AS document_name
  FROM public.knowledge_chunks kc
  JOIN public.knowledge_documents kd ON kd.id = kc.document_id
  WHERE
    kd.status    = 'activo'
    AND kd.deleted_at IS NULL
    AND kc.embedding  IS NOT NULL
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. Grant authenticated users permission to call the function
GRANT EXECUTE ON FUNCTION public.search_knowledge TO authenticated;
