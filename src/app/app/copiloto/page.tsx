import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAIStatus } from '@/domains/ai/actions'
import { CopilotoView } from './copiloto-view'

export default async function CopilotoPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const [{ data: contacts }, { data: companies }, { data: opportunities }, { data: campaigns }, aiStatus] = await Promise.all([
    supabase.from('contacts').select('id, first_name, last_name').is('deleted_at', null).order('created_at', { ascending: false }).limit(200),
    supabase.from('companies').select('id, name').is('deleted_at', null).order('created_at', { ascending: false }).limit(200),
    supabase.from('opportunities').select('id, title').is('deleted_at', null).order('created_at', { ascending: false }).limit(200),
    supabase.from('campaigns').select('id, name').is('deleted_at', null).order('created_at', { ascending: false }).limit(200),
    getAIStatus(),
  ])

  return (
    <CopilotoView
      profile={profile}
      aiConfigured={aiStatus.configured}
      contacts={(contacts ?? []).map(c => ({ id: c.id, label: `${c.first_name} ${c.last_name}` }))}
      companies={(companies ?? []).map(c => ({ id: c.id, label: c.name }))}
      opportunities={(opportunities ?? []).map(o => ({ id: o.id, label: o.title }))}
      campaigns={(campaigns ?? []).map(c => ({ id: c.id, label: c.name }))}
    />
  )
}
