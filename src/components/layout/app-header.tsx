'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import type { Profile } from '@/types/database'

interface AppHeaderProps {
  profile: Profile
}

export function AppHeader({ profile }: AppHeaderProps) {
  const supabase = createClient()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-100 bg-white px-6">
      <div className="flex items-center gap-2">
        <Avatar name={profile.full_name} src={profile.avatar_url} size="sm" />
        <div>
          <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-gray-500">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-500">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
