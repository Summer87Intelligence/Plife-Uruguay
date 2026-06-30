import { redirect } from 'next/navigation'
import { devAuthLog, getSessionAndProfile, isValidProfile } from '@/lib/auth'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionAndProfile()

  if (!session.user) {
    devAuthLog('app layout redirect', { to: '/login', reason: 'no_session' })
    redirect('/login')
  }

  if (!isValidProfile(session)) {
    devAuthLog('app layout redirect', {
      to: '/login?error=missing_profile',
      reason: session.missingProfile ? 'missing_profile' : 'inactive_profile',
    })
    redirect('/login?error=missing_profile')
  }

  const profile = session.profile!

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AppSidebar profile={profile} />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <AppHeader profile={profile} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
