'use client'
import Link from 'next/link'
import type { Route } from 'next'
import type { LucideIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export interface QuickActionItem {
  label: string
  href?: string
  onClick?: () => void
  icon?: LucideIcon
}

interface QuickActionsProps {
  actions: QuickActionItem[]
}

const actionClass =
  'inline-flex items-center gap-1.5 rounded-lg border border-[#1B3A6B]/20 bg-[#1B3A6B]/5 px-3 py-2 text-xs font-medium text-[#1B3A6B] hover:bg-[#1B3A6B]/10 transition-colors'

export function QuickActions({ actions }: QuickActionsProps) {
  if (actions.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Acciones rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {actions.map(action => {
            const Icon = action.icon
            const content = (
              <>
                {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                {action.label}
              </>
            )
            if (action.onClick) {
              return (
                <button key={action.label} type="button" onClick={action.onClick} className={actionClass}>
                  {content}
                </button>
              )
            }
            if (action.href) {
              return (
                <Link key={action.label} href={action.href as Route} className={actionClass}>
                  {content}
                </Link>
              )
            }
            return null
          })}
        </div>
      </CardContent>
    </Card>
  )
}
