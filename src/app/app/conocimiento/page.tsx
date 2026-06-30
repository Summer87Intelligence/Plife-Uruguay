import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { KnowledgeView } from './knowledge-view'

export default async function ConocimientoPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const { data: documents } = await supabase
    .from('knowledge_documents')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return <KnowledgeView documents={documents ?? []} profile={profile} />
}
