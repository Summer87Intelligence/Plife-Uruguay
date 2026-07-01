import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PipelineView } from './pipeline-view'

export default async function OportunidadesPage({
  searchParams,
}: {
  searchParams: Promise<{ nuevo?: string; contacto?: string; empresa?: string; q?: string }>
}) {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const params = await searchParams
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

  return (
    <PipelineView
      opportunities={opportunities ?? []}
      profile={profile}
      autoOpenNew={params.nuevo === '1'}
      initialContactId={params.contacto}
      initialCompanyId={params.empresa}
      initialSearch={params.q}
    />
  )
}
