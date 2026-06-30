import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { ContactDetail } from './contact-detail'

export default async function ContactoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  const [
    { data: contact },
    { data: activities },
    { data: notes },
    { data: opportunities },
  ] = await Promise.all([
    supabase.from('contacts').select('*, company:companies(id, name, industry)').eq('id', id).is('deleted_at', null).single(),
    supabase.from('activities').select('*').eq('contact_id', id).order('created_at', { ascending: false }).limit(20),
    supabase.from('notes').select('*').eq('contact_id', id).order('created_at', { ascending: false }),
    supabase.from('opportunities').select('id, title, stage, type').eq('contact_id', id).is('deleted_at', null),
  ])

  if (!contact) notFound()

  return (
    <ContactDetail
      contact={contact}
      activities={activities ?? []}
      notes={notes ?? []}
      opportunities={opportunities ?? []}
      profile={profile}
    />
  )
}
