import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ContactsList } from './contacts-list'
import { isDemoMode } from '@/lib/demo'
import { DEMO_CONTACTOS, DEMO_EMPRESAS } from '@/lib/demo/universe'

export default async function ContactosPage({
  searchParams,
}: {
  searchParams: Promise<{ nuevo?: string; empresa?: string }>
}) {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const params = await searchParams

  if (isDemoMode()) {
    return (
      <ContactsList
        contacts={DEMO_CONTACTOS}
        companies={DEMO_EMPRESAS.map(e => ({ id: e.id, name: e.name }))}
        profile={profile}
        autoOpenNew={params.nuevo === '1'}
        initialCompanyId={params.empresa}
      />
    )
  }

  const supabase = await createClient()

  let query = supabase
    .from('contacts')
    .select('*, company:companies(id, name)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100)

  if (profile.role === 'asesor') {
    query = query.eq('assigned_to', profile.id)
  }

  let companiesQuery = supabase
    .from('companies')
    .select('id, name')
    .is('deleted_at', null)
    .order('name')
    .limit(200)

  if (profile.role === 'asesor') {
    companiesQuery = companiesQuery.eq('assigned_to', profile.id)
  }

  const [{ data: contacts }, { data: companies }] = await Promise.all([query, companiesQuery])

  return (
    <ContactsList
      contacts={contacts ?? []}
      companies={companies ?? []}
      profile={profile}
      autoOpenNew={params.nuevo === '1'}
      initialCompanyId={params.empresa}
    />
  )
}
