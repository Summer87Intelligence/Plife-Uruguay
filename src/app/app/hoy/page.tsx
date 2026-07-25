import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdvisorDashboard } from './advisor-dashboard'
import { DirectionDashboard } from './direction-dashboard'
import { getLeads } from '@/domains/leads/queries'
import { LeadTodayPanel } from '@/components/leads/lead-today-panel'
import { isDemoMode } from '@/lib/demo'
import { DEMO_LEADS, DEMO_COMERCIALES, DEMO_CAMPANAS, actividadesDeHoyPara, getAttentionItemsDemo, getUpcomingRenewalsDemo, getPendingDocumentationDemo } from '@/lib/demo/universe'
import { AttentionPanel } from '@/components/hoy/attention-panel'

export default async function HoyPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  if (isDemoMode()) {
    const leads = DEMO_LEADS
    if (['admin', 'direccion'].includes(profile.role)) {
      const attentionItems = getAttentionItemsDemo()
      return (
        <DirectionDashboard
          leadPanel={<LeadTodayPanel leads={leads} />}
          attentionPanel={<AttentionPanel items={attentionItems} />}
          attentionSummary={{
            priorityActions: attentionItems.length,
            upcomingRenewals: getUpcomingRenewalsDemo().length,
            proposalsToFollow: attentionItems.filter(i => i.kind === 'propuesta').length,
            pendingDocs: getPendingDocumentationDemo().length,
          }}
          isDemoData
          metrics={{
            activeCampaigns: DEMO_CAMPANAS.filter(c => c.status === 'activa').length,
            activeAdvisors: DEMO_COMERCIALES.filter(c => c.role === 'asesor').length,
          }}
          activeLeadCount={leads.length}
        />
      )
    }
    const comercial = DEMO_COMERCIALES[0]
    const attentionItems = getAttentionItemsDemo(comercial.id)
    return (
      <AdvisorDashboard
        leadPanel={<LeadTodayPanel leads={leads} />}
        attentionPanel={<AttentionPanel items={attentionItems} />}
        attentionSummary={{
          priorityActions: attentionItems.length,
          upcomingRenewals: getUpcomingRenewalsDemo().filter(p => p.assignedToName === comercial.full_name).length,
          proposalsToFollow: attentionItems.filter(i => i.kind === 'propuesta').length,
          pendingDocs: getPendingDocumentationDemo().filter(p => p.assignedToName === comercial.full_name).length,
        }}
        isDemoData
        profile={profile}
        todayActivities={actividadesDeHoyPara(comercial.id)}
        activeCampaigns={DEMO_CAMPANAS.filter(c => c.status === 'activa').slice(0, 5)}
        activeLeadCount={leads.length}
      />
    )
  }

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
