import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdvisorDashboard } from './advisor-dashboard'
import { DirectionDashboard } from './direction-dashboard'

export default async function HoyPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  if (['admin', 'direccion'].includes(profile.role)) {
    // Métricas ejecutivas
    const [
      { count: totalOpps },
      { count: totalCompanies },
      { count: activeCampaigns },
      { count: activeAdvisors },
      { data: recentOpps },
    ] = await Promise.all([
      supabase.from('opportunities').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('companies').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'activa'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('role', 'asesor'),
      supabase.from('opportunities').select('id, title, stage, type, assigned_to').is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
    ])

    return (
      <DirectionDashboard
        metrics={{
          totalOpps: totalOpps ?? 0,
          totalCompanies: totalCompanies ?? 0,
          activeCampaigns: activeCampaigns ?? 0,
          activeAdvisors: activeAdvisors ?? 0,
        }}
        recentOpps={recentOpps ?? []}
        profile={profile}
      />
    )
  }

  // Dashboard de asesor
  const [
    { data: todayActivities },
    { data: overdueActions },
    { data: hotOpps },
    { data: assignedCompanies },
  ] = await Promise.all([
    supabase.from('activities').select('*').eq('created_by', profile.id).eq('is_completed', false).gte('scheduled_at', today + 'T00:00:00').lte('scheduled_at', today + 'T23:59:59').order('scheduled_at'),
    supabase.from('contacts').select('id, first_name, last_name, next_action, next_action_date, status').eq('assigned_to', profile.id).is('deleted_at', null).lt('next_action_date', today).not('next_action_date', 'is', null).limit(10),
    supabase.from('opportunities').select('id, title, stage, contact_id, company_id, next_action, next_action_date').eq('assigned_to', profile.id).is('deleted_at', null).in('stage', ['reunion_agendada', 'propuesta_conceptual', 'validacion_plife']).limit(5),
    supabase.from('companies').select('id, name, b2b_status, b2b_score').eq('assigned_to', profile.id).is('deleted_at', null).limit(5),
  ])

  return (
    <AdvisorDashboard
      profile={profile}
      todayActivities={todayActivities ?? []}
      overdueActions={overdueActions ?? []}
      hotOpps={hotOpps ?? []}
      assignedCompanies={assignedCompanies ?? []}
    />
  )
}
