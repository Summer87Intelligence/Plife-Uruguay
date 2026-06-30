-- =============================================================================
-- PLIFE Growth OS — CLEAR DEMO DATA
-- =============================================================================
-- Propósito: limpiar todos los datos de demo sin afectar usuarios reales.
--
-- ⚠ PRECAUCIÓN: este script ELIMINA filas permanentemente.
--   - NO toca auth.users ni public.profiles.
--   - NO borra datos que no sigan los patrones de demo documentados.
--   - Usa una transacción: si algo falla, hace ROLLBACK automático.
--
-- PATRONES DE DATOS DEMO (marcadores usados en seed-demo.sql):
--   Campañas    → IDs que empiezan con c0000000-
--   Empresas    → IDs que empiezan con b0000000- O source = 'Demo PLIFE'
--   Contactos   → IDs que empiezan con a0000000- O email LIKE '%@demo.plife'
--   Oportunidades → IDs que empiezan con d0000000-
--   Actividades → IDs que empiezan con e0000000-
--   Documentos  → IDs que empiezan con f0000000-
--   Chunks      → IDs que empiezan con f0000000- o f1000000-
--
-- ORDEN DE BORRADO (respeta foreign keys):
--   1. compliance_reviews relacionadas con IA de demo
--   2. ai_interactions vinculadas a entidades demo
--   3. notes vinculadas a entidades demo
--   4. knowledge_chunks de documentos demo
--   5. activities demo
--   6. opportunities demo
--   7. contacts demo
--   8. companies demo
--   9. campaigns demo
--  10. knowledge_documents demo
--
-- Para ver qué se borraría SIN ejecutar:
--   Reemplazá DELETE por SELECT COUNT(*) en cada bloque.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Compliance reviews relacionadas con AI interactions de demo
-- ---------------------------------------------------------------------------
DELETE FROM public.compliance_reviews
WHERE ai_interaction_id IN (
  SELECT id FROM public.ai_interactions
  WHERE contact_id::text     LIKE 'a0000000-%'
     OR company_id::text     LIKE 'b0000000-%'
     OR opportunity_id::text LIKE 'd0000000-%'
     OR campaign_id::text    LIKE 'c0000000-%'
);

-- ---------------------------------------------------------------------------
-- 2. AI interactions vinculadas a entidades demo
-- ---------------------------------------------------------------------------
DELETE FROM public.ai_interactions
WHERE contact_id::text     LIKE 'a0000000-%'
   OR company_id::text     LIKE 'b0000000-%'
   OR opportunity_id::text LIKE 'd0000000-%'
   OR campaign_id::text    LIKE 'c0000000-%';

-- ---------------------------------------------------------------------------
-- 3. Notes vinculadas a entidades demo (si las hay)
-- ---------------------------------------------------------------------------
DELETE FROM public.notes
WHERE contact_id::text     LIKE 'a0000000-%'
   OR company_id::text     LIKE 'b0000000-%'
   OR opportunity_id::text LIKE 'd0000000-%';

-- ---------------------------------------------------------------------------
-- 4. Knowledge chunks de documentos demo
-- ---------------------------------------------------------------------------
DELETE FROM public.knowledge_chunks
WHERE document_id::text LIKE 'f0000000-%'
   OR document_id::text LIKE 'f1000000-%';

-- ---------------------------------------------------------------------------
-- 5. Activities demo (por UUID fijo del seed)
-- ---------------------------------------------------------------------------
DELETE FROM public.activities
WHERE id::text LIKE 'e0000000-%';

-- ---------------------------------------------------------------------------
-- 6. Opportunities demo
-- ---------------------------------------------------------------------------
DELETE FROM public.opportunities
WHERE id::text LIKE 'd0000000-%';

-- ---------------------------------------------------------------------------
-- 7. Contacts demo (por UUID fijo O por email @demo.plife con source demo)
-- ---------------------------------------------------------------------------
DELETE FROM public.contacts
WHERE id::text LIKE 'a0000000-%'
   OR (email LIKE '%@demo.plife' AND source = 'Demo PLIFE');

-- ---------------------------------------------------------------------------
-- 8. Companies demo (por UUID fijo O por source = 'Demo PLIFE')
-- ---------------------------------------------------------------------------
DELETE FROM public.companies
WHERE id::text LIKE 'b0000000-%'
   OR source = 'Demo PLIFE';

-- ---------------------------------------------------------------------------
-- 9. Campaigns demo (por UUID fijo del seed)
-- ---------------------------------------------------------------------------
DELETE FROM public.campaigns
WHERE id::text LIKE 'c0000000-%';

-- ---------------------------------------------------------------------------
-- 10. Knowledge documents demo (por UUID fijo O por tag 'demo')
-- ---------------------------------------------------------------------------
DELETE FROM public.knowledge_documents
WHERE id::text LIKE 'f0000000-%'
   OR 'demo' = ANY(tags);

-- ---------------------------------------------------------------------------
-- Resumen: verificación post-borrado
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_contacts   int;
  v_companies  int;
  v_opps       int;
  v_campaigns  int;
  v_activities int;
  v_docs       int;
BEGIN
  SELECT COUNT(*) INTO v_contacts   FROM public.contacts   WHERE id::text LIKE 'a0000000-%';
  SELECT COUNT(*) INTO v_companies  FROM public.companies  WHERE id::text LIKE 'b0000000-%';
  SELECT COUNT(*) INTO v_opps       FROM public.opportunities WHERE id::text LIKE 'd0000000-%';
  SELECT COUNT(*) INTO v_campaigns  FROM public.campaigns  WHERE id::text LIKE 'c0000000-%';
  SELECT COUNT(*) INTO v_activities FROM public.activities WHERE id::text LIKE 'e0000000-%';
  SELECT COUNT(*) INTO v_docs       FROM public.knowledge_documents WHERE id::text LIKE 'f0000000-%';

  RAISE NOTICE 'Post-clear check:';
  RAISE NOTICE '  Contactos demo restantes:       %', v_contacts;
  RAISE NOTICE '  Empresas demo restantes:        %', v_companies;
  RAISE NOTICE '  Oportunidades demo restantes:   %', v_opps;
  RAISE NOTICE '  Campañas demo restantes:        %', v_campaigns;
  RAISE NOTICE '  Actividades demo restantes:     %', v_activities;
  RAISE NOTICE '  Documentos demo restantes:      %', v_docs;

  IF v_contacts + v_companies + v_opps + v_campaigns + v_activities + v_docs = 0 THEN
    RAISE NOTICE 'LIMPIEZA COMPLETA: todos los datos demo fueron eliminados.';
  ELSE
    RAISE WARNING 'Quedaron registros demo sin eliminar. Revisá manualmente.';
  END IF;
END $$;

COMMIT;
