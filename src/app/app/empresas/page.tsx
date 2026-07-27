import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CompaniesList } from './companies-list'
import { isDemoMode } from '@/lib/demo'
import { DEMO_EMPRESAS } from '@/lib/demo/universe'

export default async function EmpresasPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  if (isDemoMode()) {
    return <CompaniesList companies={DEMO_EMPRESAS} profile={profile} />
  }

  const supabase = await createClient()

  let query = supabase
    .from('companies')
    .select('*')
    .is('deleted_at', null)
    .order('b2b_score', { ascending: false })
    .limit(100)

  if (profile.role === 'asesor') {
    query = query.eq('assigned_to', profile.id)
  }

  const { data: companies } = await query

  return <CompaniesList companies={companies ?? []} profile={profile} />
}
