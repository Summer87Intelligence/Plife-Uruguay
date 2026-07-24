import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { isInternalOpenAccessEnabled } from '@/lib/internal-open-access'
import { redirect } from 'next/navigation'
import { getAllInsurers } from '@/domains/insurers/queries'
import { getAllInsuranceBranches } from '@/domains/insurance-branches/queries'
import { AdminView } from './admin-view'

export default async function AdminPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!isInternalOpenAccessEnabled() && profile.role !== 'admin') redirect('/app/hoy')

  const supabase = await createClient()

  const [{ data: users }, { data: teams }, { data: prompts }, insurers, insuranceBranches] = await Promise.all([
    supabase.from('profiles').select('*').eq('is_active', true).order('full_name'),
    supabase.from('teams').select('*, leader:profiles!teams_leader_id_fkey(full_name)').eq('is_active', true),
    supabase.from('ai_prompt_versions').select('*').eq('is_active', true).order('agent_name'),
    getAllInsurers(),
    getAllInsuranceBranches(),
  ])

  return (
    <AdminView
      users={users ?? []}
      teams={teams ?? []}
      prompts={prompts ?? []}
      insurers={insurers}
      insuranceBranches={insuranceBranches}
    />
  )
}
