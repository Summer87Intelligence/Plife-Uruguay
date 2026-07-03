import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DireccionView } from './direccion-view'

export default async function DireccionPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  // TEMP: open during internal product testing. Restore: if (!['admin', 'direccion'].includes(profile.role)) redirect('/app/hoy')

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
