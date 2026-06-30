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
    { data: companies },
  ] = await Promise.all([
    supabase.from('contacts').select('*, company:companies(id, name, industry), assigned_profile:profiles!contacts_assigned_to_fkey(id, full_name)').eq('id', id).is('deleted_at', null).single(),
    supabase.from('activities').select('*, created_by_profile:profiles!activities_created_by_fkey(full_name)').eq('contact_id', id).order('created_at', { ascending: false }).limit(20),
    supabase.from('notes').select('*').eq('contact_id', id).order('created_at', { ascending: false }),
    supabase.from('opportunities').select('id, title, stage, type').eq('contact_id', id).is('deleted_at', null),
    supabase.from('companies').select('id, name').is('deleted_at', null).order('name'),
  ])

  if (!contact) notFound()

  return (
    <ContactDetail
      contact={contact}
      activities={activities ?? []}
      notes={notes ?? []}
      opportunities={opportunities ?? []}
      companies={companies ?? []}
      profile={profile}
    />
  )
}
