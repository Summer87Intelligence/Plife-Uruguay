import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { isInternalOpenAccessEnabled } from '@/lib/internal-open-access'
import { redirect } from 'next/navigation'
import { DireccionView } from './direccion-view'
import { isDemoMode } from '@/lib/demo'
import { DEMO_OPORTUNIDADES, DEMO_CONTACTOS, DEMO_EMPRESAS, DEMO_CAMPANAS, DEMO_ACTIVIDADES_RECIENTES, getDireccionMetricsDemo, getExecutiveAlertsDemo } from '@/lib/demo/universe'

export default async function DireccionPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!isInternalOpenAccessEnabled() && !['admin', 'direccion'].includes(profile.role)) redirect('/app/hoy')

  if (isDemoMode()) {
    const stageCounts: Record<string, number> = {}
    for (const opp of DEMO_OPORTUNIDADES) stageCounts[opp.stage] = (stageCounts[opp.stage] ?? 0) + 1

    const openOpps = DEMO_OPORTUNIDADES.filter(o => !['cerrada_ganada', 'cerrada_perdida'].includes(o.stage))
    const todayStr = new Date().toISOString().split('T')[0]
    const topB2BOpps = [...openOpps]
      .sort((a, b) => (b.estimated_value ?? 0) - (a.estimated_value ?? 0))
      .slice(0, 6)
      .map(o => ({
        id: o.id,
        title: o.title,
        stage: o.stage,
        estimated_value: o.estimated_value,
        next_action: o.next_action,
        company: o.company ? { id: o.company.id, name: o.company.name, industry: o.company.industry, b2b_score: o.company.b2b_score, estimated_employees: o.company.estimated_employees } : null,
        assigned_profile: o.assigned_profile ? { full_name: o.assigned_profile.full_name } : null,
      }))

    return (
      <DireccionView
        metrics={{
          totalOpps: DEMO_OPORTUNIDADES.length,
          totalContacts: DEMO_CONTACTOS.length,
          totalCompanies: DEMO_EMPRESAS.length,
          activeCampaigns: DEMO_CAMPANAS.filter(c => c.status === 'activa').length,
        }}
        stageCounts={stageCounts}
        recentActivities={DEMO_ACTIVIDADES_RECIENTES}
        topB2BOpps={topB2BOpps}
        focusMetrics={{
          overdueOpps: openOpps.filter(o => o.next_action_date && o.next_action_date < todayStr).length,
          noNextActionOpps: openOpps.filter(o => !o.next_action).length,
        }}
        portfolio={(() => {
          const m = getDireccionMetricsDemo()
          return {
            totalPolicies: m.totalPolicies,
            vigentPolicies: m.vigentPolicies,
            openProposals: m.openProposals,
            renovacionesProximas: m.renovacionesProximas,
            documentacionPendiente: m.documentacionPendiente,
            primaAnualAdministrada: m.primaAnualAdministrada,
            comisionEstimadaTotal: m.comisionEstimadaTotal,
            porAseguradora: m.porAseguradora,
            carteraPorEjecutivo: m.carteraPorEjecutivo,
            facturacionPorEmpresa: m.facturacionPorEmpresa,
          }
        })()}
        executiveAlerts={getExecutiveAlertsDemo()}
        isDemoData
      />
    )
  }

  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [
    { count: totalOpps },
    { count: totalContacts },
    { count: totalCompanies },
    { count: activeCampaigns },
    { data: stageStats },
    { data: lossReasons },
    { data: recentActivities },
    { data: topB2BOpps },
    { count: overdueOpps },
    { count: noNextActionOpps },
  ] = await Promise.all([
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('companies').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'activa'),
    supabase.from('opportunities').select('stage').is('deleted_at', null),
    supabase.from('opportunities').select('loss_reason').not('loss_reason', 'is', null).is('deleted_at', null).limit(50),
    supabase.from('activities').select('*, created_by_profile:profiles!activities_created_by_fkey(full_name)').order('created_at', { ascending: false }).limit(10),
    supabase.from('opportunities')
      .select('id, title, stage, estimated_value, next_action, company:companies(id, name, industry, b2b_score, estimated_employees), assigned_profile:profiles!opportunities_assigned_to_fkey(full_name)')
      .eq('type', 'b2b')
      .not('stage', 'in', '("ganada","perdida")')
      .is('deleted_at', null)
      .order('estimated_value', { ascending: false, nullsFirst: false })
      .limit(6),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).lt('next_action_date', today).not('stage', 'in', '("ganada","perdida")').is('deleted_at', null),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).is('next_action', null).not('stage', 'in', '("ganada","perdida")').is('deleted_at', null),
  ])

  // Calcular estadísticas por etapa
  const stageCounts: Record<string, number> = {}
  stageStats?.forEach(opp => {
    stageCounts[opp.stage] = (stageCounts[opp.stage] ?? 0) + 1
  })

  return (
    <DireccionView
      metrics={{
        totalOpps: totalOpps ?? 0,
        totalContacts: totalContacts ?? 0,
        totalCompanies: totalCompanies ?? 0,
        activeCampaigns: activeCampaigns ?? 0,
      }}
      stageCounts={stageCounts}
      recentActivities={recentActivities ?? []}
      topB2BOpps={topB2BOpps ?? []}
      focusMetrics={{ overdueOpps: overdueOpps ?? 0, noNextActionOpps: noNextActionOpps ?? 0 }}
    />
  )
}
