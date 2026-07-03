import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CampaignsList } from './campaigns-list'
import type { CampaignLinkCounts } from '@/lib/campaign-operational'

export default async function CampanasPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const list = campaigns ?? []
  const linkCounts: Record<string, CampaignLinkCounts> = {}

  if (list.length > 0) {
    const ids = list.map(c => c.id)
    const [{ data: companies }, { data: opportunities }] = await Promise.all([
      supabase.from('companies').select('campaign_id').in('campaign_id', ids).is('deleted_at', null),
      supabase.from('opportunities').select('campaign_id').in('campaign_id', ids).is('deleted_at', null),
    ])
    for (const id of ids) {
      linkCounts[id] = { companies: 0, opportunities: 0 }
    }
    for (const row of companies ?? []) {
      if (row.campaign_id && linkCounts[row.campaign_id]) {
        linkCounts[row.campaign_id].companies++
      }
    }
    for (const row of opportunities ?? []) {
      if (row.campaign_id && linkCounts[row.campaign_id]) {
        linkCounts[row.campaign_id].opportunities++
      }
    }
  }

  return (
    <CampaignsList
      campaigns={list}
      profile={profile}
      linkCounts={linkCounts}
    />
  )
}
