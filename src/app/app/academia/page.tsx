import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AcademiaView } from './academia-view'

export default async function AcademiaPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  const [{ data: modules }, { data: objections }] = await Promise.all([
    supabase.from('training_modules').select('*').eq('is_active', true).order('order_index'),
    supabase.from('objections_library').select('*').eq('is_active', true).order('category'),
  ])

  return <AcademiaView profile={profile} modules={modules ?? []} objections={objections ?? []} />
}
