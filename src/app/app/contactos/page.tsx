import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ContactsList } from './contacts-list'

export default async function ContactosPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  let query = supabase
    .from('contacts')
    .select('*, company:companies(id, name)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100)

  // Asesores solo ven sus contactos
  if (profile.role === 'asesor') {
    query = query.eq('assigned_to', profile.id)
  }

  const { data: contacts } = await query

  return <ContactsList contacts={contacts ?? []} profile={profile} />
}
