import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CampaignsList } from './campaigns-list'

export default async function CampanasPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return <CampaignsList campaigns={campaigns ?? []} profile={profile} />
}
