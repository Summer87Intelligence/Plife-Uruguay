import { createClient } from '@/lib/supabase/server'
import { canAccessAll, getProfile } from '@/lib/auth'
import { isDemoMode } from '@/lib/demo'
import { isAIConfigured } from '@/lib/ai/provider'
import { redirect } from 'next/navigation'
import { SystemView } from './system-view'

export default async function SystemPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  // TEMP: open during internal product testing. Restore: if (!canAccessAll(profile)) redirect('/app/hoy')

  const supabase = await createClient()

  const [
    contactsResult,
    companiesResult,
    opportunitiesResult,
    campaignsResult,
    activitiesResult,
    knowledgeResult,
    chunksResult,
    aiResult,
    complianceResult,
  ] = await Promise.all([
    supabase.from('contacts').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('companies').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('campaigns').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('activities').select('*', { count: 'exact', head: true }),
    supabase
      .from('knowledge_documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'activo')
      .is('deleted_at', null),
    supabase.from('knowledge_chunks').select('*', { count: 'exact', head: true }),
    supabase
      .from('ai_interactions')
      .select('id, agent_name, risk_level, created_at, documents_used')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('compliance_reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Try to count embedded chunks (requires knowledge-embeddings.sql)
  let embeddedChunks = 0
  const { count: embCount, error: embErr } = await supabase
    .from('knowledge_chunks')
    .select('*', { count: 'exact', head: true })
    .not('embedding', 'is', null)
  if (!embErr) embeddedChunks = embCount ?? 0

  const recentAIInteractions = (aiResult.data ?? []).map(
    ({ id, agent_name, risk_level, created_at, documents_used }) => ({
      id, agent_name, risk_level, created_at, documents_used,
    })
  )

  const recentComplianceReviews = (complianceResult.data ?? []).map(
    ({ id, content_reviewed, risk_level, action, created_at }) => ({
      id,
      content_reviewed,
      risk_level,
      action,
      created_at,
    })
  )

  return (
    <SystemView
      profile={profile}
      isAIConfigured={isAIConfigured()}
      isDemoModeActive={isDemoMode()}
      counts={{
        contacts: contactsResult.count ?? 0,
        companies: companiesResult.count ?? 0,
        opportunities: opportunitiesResult.count ?? 0,
        campaigns: campaignsResult.count ?? 0,
        activities: activitiesResult.count ?? 0,
        knowledgeDocuments: knowledgeResult.count ?? 0,
      }}
      knowledgeStats={{
        totalChunks: chunksResult.count ?? 0,
        embeddedChunks,
        embeddingsReady: !embErr,
      }}
      recentAIInteractions={recentAIInteractions}
      recentComplianceReviews={recentComplianceReviews}
    />
  )
}
