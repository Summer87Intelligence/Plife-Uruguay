import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PipelineView } from './pipeline-view'

export default async function OportunidadesPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  let query = supabase
    .from('opportunities')
    .select('*, contact:contacts(id, first_name, last_name), company:companies(id, name), assigned_profile:profiles!opportunities_assigned_to_fkey(id, full_name)')
    .is('deleted_at', null)
    .not('stage', 'in', '("cerrada_ganada","cerrada_perdida","dormida")')
    .order('created_at', { ascending: false })

  if (profile.role === 'asesor') {
    query = query.eq('assigned_to', profile.id)
  }

  const { data: opportunities } = await query

  return <PipelineView opportunities={opportunities ?? []} profile={profile} />
}
