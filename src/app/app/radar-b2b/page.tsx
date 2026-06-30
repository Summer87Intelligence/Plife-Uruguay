import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { RadarB2BView } from './radar-b2b-view'

export default async function RadarB2BPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  const [{ data: companies }, { data: campaigns }] = await Promise.all([
    supabase
      .from('companies')
      .select('*')
      .is('deleted_at', null)
      .in('b2b_status', ['detectada', 'analizada', 'priorizada', 'asignada', 'contactada', 'reunion_agendada', 'en_negociacion'])
      .limit(100),
    supabase
      .from('campaigns')
      .select('id, name, type')
      .in('status', ['activa', 'borrador']),
  ])

  return <RadarB2BView companies={companies ?? []} campaigns={campaigns ?? []} profile={profile} />
}
