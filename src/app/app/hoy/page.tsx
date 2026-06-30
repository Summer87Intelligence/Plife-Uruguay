import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdvisorDashboard } from './advisor-dashboard'
import { DirectionDashboard } from './direction-dashboard'
import type { OpportunityStage } from '@/types/database'

export default async function HoyPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  if (['admin', 'direccion'].includes(profile.role)) {
    const [
      { count: totalOpps },
      { count: totalCompanies },
      { count: activeCampaigns },
      { count: activeAdvisors },
      { data: recentOpps },
      { data: stageStats },
      { data: globalOverdue },
      { data: abandonedOpps },
    ] = await Promise.all([
      supabase.from('opportunities').select('*', { count: 'exact', head: true }).is('deleted_at', null).not('stage', 'in', '("cerrada_ganada","cerrada_perdida","dormida")'),
      supabase.from('companies').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'activa'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('role', 'asesor'),
      supabase.from('opportunities').select('id, title, stage, type, assigned_to').is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
      supabase.from('opportunities').select('stage').is('deleted_at', null).not('stage', 'in', '("cerrada_ganada","cerrada_perdida","dormida")'),
      supabase.from('contacts').select('id, first_name, last_name, next_action, next_action_date').is('deleted_at', null).lt('next_action_date', today).not('next_action_date', 'is', null).limit(10),
      supabase.from('opportunities').select('id, title, stage, last_activity_at').is('deleted_at', null).not('stage', 'in', '("cerrada_ganada","cerrada_perdida","dormida")').or(`last_activity_at.is.null,last_activity_at.lt.${sevenDaysAgo}`).limit(10),
    ])

    const stageCounts: Partial<Record<OpportunityStage, number>> = {}
    stageStats?.forEach(opp => {
      stageCounts[opp.stage] = (stageCounts[opp.stage] ?? 0) + 1
    })

    return (
      <DirectionDashboard
        metrics={{
          totalOpps: totalOpps ?? 0,
          totalCompanies: totalCompanies ?? 0,
          activeCampaigns: activeCampaigns ?? 0,
          activeAdvisors: activeAdvisors ?? 0,
        }}
        recentOpps={recentOpps ?? []}
        stageCounts={stageCounts}
        globalOverdue={globalOverdue ?? []}
        abandonedOpps={abandonedOpps ?? []}
        profile={profile}
      />
    )
  }

  const [
    { data: todayActivities },
    { data: overdueActions },
    { data: hotOpps },
    { data: assignedCompanies },
    { data: upcomingOpps },
    { data: activeCampaigns },
    { data: staleOpps },
  ] = await Promise.all([
    supabase.from('activities').select('*').eq('created_by', profile.id).eq('is_completed', false).gte('scheduled_at', today + 'T00:00:00').lte('scheduled_at', today + 'T23:59:59').order('scheduled_at'),
    supabase.from('contacts').select('id, first_name, last_name, next_action, next_action_date, status').eq('assigned_to', profile.id).is('deleted_at', null).lt('next_action_date', today).not('next_action_date', 'is', null).limit(10),
    supabase.from('opportunities').select('id, title, stage, contact_id, company_id, next_action, next_action_date').eq('assigned_to', profile.id).is('deleted_at', null).in('stage', ['reunion_agendada', 'propuesta_conceptual', 'validacion_plife']).limit(5),
    supabase.from('companies').select('id, name, b2b_status, b2b_score').eq('assigned_to', profile.id).is('deleted_at', null).order('b2b_score', { ascending: false, nullsFirst: false }).limit(5),
    supabase.from('opportunities').select('id, title, stage, next_action, next_action_date').eq('assigned_to', profile.id).is('deleted_at', null).not('stage', 'in', '("cerrada_ganada","cerrada_perdida","dormida")').gte('next_action_date', today).not('next_action_date', 'is', null).order('next_action_date').limit(8),
    supabase.from('campaigns').select('id, name, status, total_targets, total_converted').eq('status', 'activa').limit(5),
    supabase.from('opportunities').select('id, title, stage, last_activity_at').eq('assigned_to', profile.id).is('deleted_at', null).not('stage', 'in', '("cerrada_ganada","cerrada_perdida","dormida")').or(`last_activity_at.is.null,last_activity_at.lt.${sevenDaysAgo}`).limit(5),
  ])

  return (
    <AdvisorDashboard
      profile={profile}
      todayActivities={todayActivities ?? []}
      overdueActions={overdueActions ?? []}
      hotOpps={hotOpps ?? []}
      assignedCompanies={assignedCompanies ?? []}
      upcomingOpps={upcomingOpps ?? []}
      activeCampaigns={activeCampaigns ?? []}
      staleOpps={staleOpps ?? []}
    />
  )
}
