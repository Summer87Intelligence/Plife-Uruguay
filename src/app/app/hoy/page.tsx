import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdvisorDashboard } from './advisor-dashboard'
import { DirectionDashboard } from './direction-dashboard'
import { getLeads } from '@/domains/leads/queries'
import { LeadTodayPanel } from '@/components/leads/lead-today-panel'

export default async function HoyPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const leads = await getLeads()

  if (['admin', 'direccion'].includes(profile.role)) {
    const [{ count: activeCampaigns }, { count: activeAdvisors }] = await Promise.all([
      supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'activa'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('role', 'asesor'),
    ])

    return (
      <DirectionDashboard
        leadPanel={<LeadTodayPanel leads={leads} />}
        metrics={{
          activeCampaigns: activeCampaigns ?? 0,
          activeAdvisors: activeAdvisors ?? 0,
        }}
        activeLeadCount={leads.length}
      />
    )
  }

  const [{ data: todayActivities }, { data: activeCampaigns }] = await Promise.all([
    supabase
      .from('activities')
      .select('*')
      .eq('created_by', profile.id)
      .eq('is_completed', false)
      .gte('scheduled_at', today + 'T00:00:00')
      .lte('scheduled_at', today + 'T23:59:59')
      .order('scheduled_at'),
    supabase.from('campaigns').select('id, name, status').eq('status', 'activa').limit(5),
  ])

  return (
    <AdvisorDashboard
      leadPanel={<LeadTodayPanel leads={leads} />}
      profile={profile}
      todayActivities={todayActivities ?? []}
      activeCampaigns={activeCampaigns ?? []}
      activeLeadCount={leads.length}
    />
  )
}
