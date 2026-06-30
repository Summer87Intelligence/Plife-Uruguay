import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CopilotoView } from './copiloto-view'

export default async function CopilotoPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  return <CopilotoView profile={profile} />
}
