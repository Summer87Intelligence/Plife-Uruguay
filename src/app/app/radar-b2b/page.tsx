import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { RadarB2BView } from './radar-b2b-view'

export default async function RadarB2BPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .is('deleted_at', null)
    .in('b2b_status', ['detectada', 'analizada', 'priorizada', 'asignada'])
    .order('b2b_score', { ascending: false })
    .limit(50)

  return <RadarB2BView companies={companies ?? []} profile={profile} />
}
