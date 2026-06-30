import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { CompanyDetail } from './company-detail'

export default async function EmpresaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  const [
    { data: company },
    { data: contacts },
    { data: activities },
    { data: opportunities },
    { data: campaigns },
  ] = await Promise.all([
    supabase.from('companies').select('*').eq('id', id).is('deleted_at', null).single(),
    supabase.from('contacts').select('id, first_name, last_name, position, status').eq('company_id', id).is('deleted_at', null),
    supabase.from('activities').select('*, created_by_profile:profiles!activities_created_by_fkey(full_name)').eq('company_id', id).order('created_at', { ascending: false }).limit(15),
    supabase.from('opportunities').select('id, title, stage, type, next_action, next_action_date').eq('company_id', id).is('deleted_at', null),
    supabase.from('campaigns').select('id, name').is('deleted_at', null).order('name'),
  ])

  if (!company) notFound()

  return (
    <CompanyDetail
      company={company}
      contacts={contacts ?? []}
      activities={activities ?? []}
      opportunities={opportunities ?? []}
      campaigns={campaigns ?? []}
      profile={profile}
    />
  )
}
