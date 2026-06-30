import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { OpportunityDetail } from './opportunity-detail'

export default async function OportunidadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  const [
    { data: opportunity },
    { data: activities },
    { data: notes },
  ] = await Promise.all([
    supabase.from('opportunities').select('*, contact:contacts(id, first_name, last_name, phone, email), company:companies(id, name), assigned_profile:profiles!opportunities_assigned_to_fkey(id, full_name)').eq('id', id).is('deleted_at', null).single(),
    supabase.from('activities').select('*').eq('opportunity_id', id).order('created_at', { ascending: false }).limit(20),
    supabase.from('notes').select('*').eq('opportunity_id', id).order('created_at', { ascending: false }),
  ])

  if (!opportunity) notFound()

  return <OpportunityDetail opportunity={opportunity} activities={activities ?? []} notes={notes ?? []} profile={profile} />
}
