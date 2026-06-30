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
    { data: advisors },
    { data: campaigns },
  ] = await Promise.all([
    supabase.from('opportunities').select('*, contact:contacts(id, first_name, last_name, phone, email), company:companies(id, name), assigned_profile:profiles!opportunities_assigned_to_fkey(id, full_name)').eq('id', id).is('deleted_at', null).single(),
    supabase.from('activities').select('*, created_by_profile:profiles!activities_created_by_fkey(full_name)').eq('opportunity_id', id).order('created_at', { ascending: false }).limit(20),
    supabase.from('notes').select('*').eq('opportunity_id', id).order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, full_name').eq('is_active', true).in('role', ['asesor', 'lider_comercial', 'direccion', 'admin']).order('full_name'),
    supabase.from('campaigns').select('id, name').is('deleted_at', null).order('name'),
  ])

  if (!opportunity) notFound()

  const campaign = opportunity.campaign_id ? (campaigns ?? []).find(c => c.id === opportunity.campaign_id) ?? null : null

  return (
    <OpportunityDetail
      opportunity={opportunity}
      activities={activities ?? []}
      notes={notes ?? []}
      advisors={advisors ?? []}
      campaign={campaign}
      profile={profile}
    />
  )
}
