'use client'
import Link from 'next/link'
import type { Route } from 'next'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const ITEMS: { href: Route; label: string }[] = [
  { href: '/app/polizas', label: 'Listado' },
  { href: '/app/polizas/renovaciones', label: 'Próximas renovaciones' },
  { href: '/app/polizas/documentacion', label: 'Documentación pendiente' },
  { href: '/app/polizas/configuracion', label: 'Configuración' },
]

/** Sub-navegación de Pólizas (Bloque UI-0). Mismo estilo de tabs que Admin, pero como rutas reales. */
export function PoliciesSubnav() {
  const pathname = usePathname()

  return (
    <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden w-fit">
      {ITEMS.map(item => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-[#1B3A6B] text-white' : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
