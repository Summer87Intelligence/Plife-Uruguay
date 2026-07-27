import { createClient } from '@/lib/supabase/server'
import { getProfile, canAccessAll } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { CompanyDetail } from './company-detail'
import type { AIExecutionRun } from '@/types/database'
import { isDemoMode } from '@/lib/demo'
import { DEMO_EMPRESAS, DEMO_CONTACTOS, DEMO_OPORTUNIDADES, DEMO_CAMPANAS } from '@/lib/demo/universe'

export default async function EmpresaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getProfile()
  if (!profile) redirect('/login')

  if (isDemoMode()) {
    const company = DEMO_EMPRESAS.find(e => e.id === id)
    if (!company) notFound()
    return (
      <CompanyDetail
        company={company}
        contacts={DEMO_CONTACTOS.filter(c => c.company_id === id)}
        activities={[]}
        opportunities={DEMO_OPORTUNIDADES.filter(o => o.company_id === id)}
        campaigns={DEMO_CAMPANAS.map(c => ({ id: c.id, name: c.name }))}
        profile={profile}
        aiProfile={null}
        latestAiRun={null}
      />
    )
  }

  const supabase = await createClient()

  const [
    { data: company },
    { data: contacts },
    { data: activities },
    { data: opportunities },
    { data: campaigns },
  ] = await Promise.all([
    supabase.from('companies').select('*').eq('id', id).is('deleted_at', null).single(),
    supabase.from('contacts').select('id, first_name, last_name, position, status').eq('company_id', id).is('deleted_at', null),
    supabase.from('activities').select('*, created_by_profile:profiles!activities_created_by_fkey(full_name)').eq('company_id', id).order('created_at', { ascending: false }).limit(15),
    supabase.from('opportunities').select('id, title, stage, type, next_action, next_action_date').eq('company_id', id).is('deleted_at', null),
    supabase.from('campaigns').select('id, name').is('deleted_at', null).order('name'),
  ])

  if (!company) notFound()

  let aiProfile: { id: string; name: string } | null = null
  let latestAiRun: AIExecutionRun | null = null

  if (canAccessAll(profile)) {
    const [{ data: prof, error: profErr }, { data: run }] = await Promise.all([
      supabase.from('ai_analysis_profiles').select('id, name').eq('is_active', true).order('name').limit(1).maybeSingle(),
      supabase.from('ai_execution_runs').select('*').eq('entity_type', 'company').eq('entity_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ])
    if (!profErr || profErr.code !== '42P01') {
      aiProfile = prof
      latestAiRun = run
    }
  }

  return (
    <CompanyDetail
      company={company}
      contacts={contacts ?? []}
      activities={activities ?? []}
      opportunities={opportunities ?? []}
      campaigns={campaigns ?? []}
      profile={profile}
      aiProfile={aiProfile}
      latestAiRun={latestAiRun}
    />
  )
}
