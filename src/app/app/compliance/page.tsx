import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ComplianceView } from './compliance-view'

export default async function CompliancePage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  const [{ data: rules }, { data: recentReviews }, { data: interactions }] = await Promise.all([
    supabase.from('compliance_rules').select('*').eq('is_active', true).order('risk_level'),
    supabase.from('compliance_reviews').select('*').order('created_at', { ascending: false }).limit(20),
    supabase
      .from('ai_interactions')
      .select('id, agent_name, response, risk_level, risk_flags, documents_used, created_at, contact_id, company_id, opportunity_id, campaign_id, user:profiles!ai_interactions_user_id_fkey(full_name)')
      .order('created_at', { ascending: false })
      .limit(25),
  ])

  return (
    <ComplianceView
      profile={profile}
      rules={rules ?? []}
      recentReviews={recentReviews ?? []}
      interactions={interactions ?? []}
    />
  )
}
