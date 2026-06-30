'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Users, Building2, TrendingUp, Radar, Megaphone,
  Bot, BookOpen, ShieldCheck, GraduationCap, BarChart3, Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import type { Profile } from '@/types/database'

const icons = { Home, Users, Building2, TrendingUp, Radar, Megaphone, Bot, BookOpen, ShieldCheck, GraduationCap, BarChart3, Settings }

const navItems = [
  { href: '/app/hoy', label: 'PLIFE Hoy', icon: 'Home' },
  { href: '/app/contactos', label: 'Contactos', icon: 'Users' },
  { href: '/app/empresas', label: 'Empresas', icon: 'Building2' },
  { href: '/app/oportunidades', label: 'Oportunidades', icon: 'TrendingUp' },
  { href: '/app/radar-b2b', label: 'Radar B2B', icon: 'Radar' },
  { href: '/app/campanas', label: 'Campañas', icon: 'Megaphone' },
  { href: '/app/copiloto', label: 'Copiloto IA', icon: 'Bot' },
  { href: '/app/conocimiento', label: 'Conocimiento', icon: 'BookOpen' },
  { href: '/app/compliance', label: 'Compliance', icon: 'ShieldCheck' },
  { href: '/app/academia', label: 'Academia', icon: 'GraduationCap' },
  { href: '/app/direccion', label: 'Dirección', icon: 'BarChart3' },
  { href: '/app/admin', label: 'Admin', icon: 'Settings' },
] as const

const DIRECTION_ONLY = ['/app/direccion', '/app/admin']
const ADMIN_ONLY = ['/app/admin']

interface AppSidebarProps {
  profile: Profile
}

export function AppSidebar({ profile }: AppSidebarProps) {
  const pathname = usePathname()
  const isAdmin = profile.role === 'admin'
  const canSeeDirection = ['admin', 'direccion'].includes(profile.role)

  const visibleItems = navItems.filter(item => {
    if (ADMIN_ONLY.includes(item.href)) return isAdmin
    if (DIRECTION_ONLY.includes(item.href)) return canSeeDirection
    return true
  })

  return (
    <aside className="flex h-full w-56 flex-col border-r border-gray-100 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center px-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-[#1B3A6B] flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">PLIFE</p>
            <p className="text-[10px] text-gray-400 leading-none mt-0.5">Growth OS</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {visibleItems.map(item => {
          const Icon = icons[item.icon as keyof typeof icons]
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors mb-0.5',
                isActive
                  ? 'bg-[#1B3A6B] text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <Avatar name={profile.full_name} src={profile.avatar_url} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{profile.full_name}</p>
            <p className="text-[10px] text-gray-400 truncate capitalize">{profile.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
