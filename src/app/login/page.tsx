import { redirect } from 'next/navigation'
import { devAuthLog, getAuthDebugInfo, getSessionAndProfile, isValidProfile } from '@/lib/auth'
import { LoginForm } from './login-form'

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const session = await getSessionAndProfile()

  if (session.user && isValidProfile(session)) {
    devAuthLog('login page redirect', { to: '/app/hoy', reason: 'valid_session' })
    redirect('/app/hoy')
  }

  const showMissingProfile =
    !!session.user &&
    (session.missingProfile || session.inactiveProfile || params.error === 'missing_profile')

  return <LoginForm showMissingProfile={showMissingProfile} debugInfo={getAuthDebugInfo(session)} />
}
