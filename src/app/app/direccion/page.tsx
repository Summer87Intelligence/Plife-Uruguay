import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DireccionView } from './direccion-view'

export default async function DireccionPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!['admin', 'direccion'].includes(profile.role)) redirect('/app/hoy')

  const supabase = await createClient()

  const [
    { count: totalOpps },
    { count: totalContacts },
    { count: totalCompanies },
    { count: activeCampaigns },
    { data: stageStats },
    { data: lossReasons },
    { data: recentActivities },
  ] = await Promise.all([
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('companies').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'activa'),
    supabase.from('opportunities').select('stage').is('deleted_at', null),
    supabase.from('opportunities').select('loss_reason').not('loss_reason', 'is', null).is('deleted_at', null).limit(50),
    supabase.from('activities').select('*, created_by_profile:profiles!activities_created_by_fkey(full_name)').order('created_at', { ascending: false }).limit(10),
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
    />
  )
}
