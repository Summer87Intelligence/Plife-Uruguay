'use client'
import Link from 'next/link'
import type { Route } from 'next'
import { usePathname } from 'next/navigation'
import {
  Home, Users, Building2, TrendingUp, Radar, Megaphone,
  Bot, BookOpen, ShieldCheck, GraduationCap, BarChart3, Settings,
  Route as RouteIcon, Database, Cpu, Inbox, Columns3, FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { isDemoMode } from '@/lib/demo'
import { isInternalOpenAccessEnabled } from '@/lib/internal-open-access'
import type { Profile } from '@/types/database'

const icons = {
  Home, Users, Building2, TrendingUp, Radar, Megaphone,
  Bot, BookOpen, ShieldCheck, GraduationCap, BarChart3, Settings,
  RouteIcon, Database, Cpu, Inbox, Columns3, FileText,
}

// FASE 15G — Navegación simplificada. El menú visible se reduce al foco actual
// (Lead-first + Propuestas + Motores). Las rutas NO se borran: siguen accesibles
// por URL directa y desde widgets/quick actions; solo se ocultan del sidebar.
// El orden define el menú visible recomendado.
const navItems = [
  { href: '/app/hoy',            label: 'PLIFE Hoy',          icon: 'Home' },
  { href: '/app/leads',          label: 'Leads',              icon: 'Inbox' },
  { href: '/app/pipeline',       label: 'Pipeline',           icon: 'Columns3' },
  { href: '/app/propuestas',     label: 'Propuestas',         icon: 'FileText' },
  { href: '/app/campanas',       label: 'Campañas',           icon: 'Megaphone' },
  { href: '/app/ia',             label: 'Motores',            icon: 'Cpu' },
  { href: '/app/direccion',      label: 'Dirección',          icon: 'BarChart3' },
  { href: '/app/admin',          label: 'Admin',              icon: 'Settings' },
  // --- Ocultas del menú principal (rutas conservadas) ---
  { href: '/app/contactos',      label: 'Contactos',          icon: 'Users' },
  { href: '/app/empresas',       label: 'Empresas',           icon: 'Building2' },
  { href: '/app/oportunidades',  label: 'Oportunidades',      icon: 'TrendingUp' },
  { href: '/app/radar-b2b',      label: 'Radar B2B',          icon: 'Radar' },
  { href: '/app/copiloto',       label: 'Copiloto',           icon: 'Bot' },
  { href: '/app/conocimiento',   label: 'Conocimiento',       icon: 'BookOpen' },
  { href: '/app/academia',       label: 'Academia',           icon: 'GraduationCap' },
  { href: '/app/admin/system',   label: 'Estado del sistema', icon: 'Database' },
] as const

// FASE 15G — Ocultas del sidebar principal (siguen existiendo como rutas).
// Empresas/Contactos/Radar/Copiloto/Academia/Conocimiento pasan a internas o futuras;
// Oportunidades y Estado del sistema salen del menú para dejar el foco recomendado.
const HIDDEN_FROM_NAV: string[] = [
  '/app/contactos',
  '/app/empresas',
  '/app/oportunidades',
  '/app/radar-b2b',
  '/app/copiloto',
  '/app/conocimiento',
  '/app/academia',
  '/app/admin/system',
]

// Rutas solo para admin (propietario del sistema)
const ADMIN_ONLY: string[] = ['/app/admin']
// Rutas para admin + dirección (diagnóstico y configuración avanzada)
const DIRECTION_ALLOWED: string[] = ['/app/direccion', '/app/admin/system', '/app/ia']
// Items que se muestran con estilo secundario (diagnóstico/config)
const SECONDARY_ITEMS: string[] = ['/app/admin/system']

interface AppSidebarProps {
  profile: Profile
}

function filterNavItems(profile: Profile) {
  // La simplificación del menú aplica siempre, incluso en modo open-access.
  const visible = navItems.filter(item => !HIDDEN_FROM_NAV.includes(item.href))

  if (isInternalOpenAccessEnabled()) return visible

  const isAdmin = profile.role === 'admin'
  const canSeeDirection = ['admin', 'direccion'].includes(profile.role)

  return visible.filter(item => {
    if (ADMIN_ONLY.includes(item.href)) return isAdmin
    if (DIRECTION_ALLOWED.includes(item.href)) return canSeeDirection
    return true
  })
}

export function AppSidebar({ profile }: AppSidebarProps) {
  const pathname = usePathname()
  const baseItems = filterNavItems(profile)

  const visibleItems = isDemoMode()
    ? [{ href: '/app/demo', label: 'Recorrido demo', icon: 'RouteIcon' } as const, ...baseItems]
    : baseItems

  return (
    <aside data-testid="app-sidebar" className="hidden md:flex h-full w-56 flex-col border-r border-gray-100 bg-white shrink-0">
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
      <nav data-testid="app-sidebar-nav" className="flex-1 overflow-y-auto py-3 px-2">
        {visibleItems.map(item => {
          const Icon = icons[item.icon as keyof typeof icons]
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const isSecondary = SECONDARY_ITEMS.includes(item.href)
          const showDivider = item.href === '/app/admin/system'

          return (
            <div key={item.href}>
              {showDivider && <div className="mx-1 my-1.5 h-px bg-gray-100" />}
              <Link
                href={item.href as Route}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 transition-colors mb-0.5',
                  isSecondary ? 'py-1.5 text-xs' : 'py-2 text-sm font-medium',
                  isActive
                    ? 'bg-[#1B3A6B] text-white'
                    : isSecondary
                    ? 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className={cn('shrink-0', isSecondary ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
                {item.label}
              </Link>
            </div>
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
