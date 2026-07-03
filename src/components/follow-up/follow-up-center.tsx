'use client'
import Link from 'next/link'
import { AlertCircle, Calendar, HelpCircle, Clock, CheckCircle2 } from 'lucide-react'
import { OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGE_COLORS } from '@/lib/constants'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import type { OpportunityStage } from '@/types/database'

export interface FollowUpOpp {
  id: string
  title?: string | null
  stage?: OpportunityStage | null
  next_action?: string | null
  next_action_date?: string | null
  last_activity_at?: string | null
}

interface FollowUpGroup {
  label: string
  color: string
  bgColor: string
  borderColor: string
  textColor: string
  icon: React.ReactNode
  items: FollowUpOpp[]
  ctaLabel: string
  showDate?: 'overdue' | 'today' | 'activity'
}

interface FollowUpCenterProps {
  overdue: FollowUpOpp[]
  today: FollowUpOpp[]
  missingNextStep: FollowUpOpp[]
  stalled: FollowUpOpp[]
}

export function FollowUpCenter({ overdue, today, missingNextStep, stalled }: FollowUpCenterProps) {
  const totalCount = overdue.length + today.length + missingNextStep.length + stalled.length

  if (totalCount === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white px-5 py-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">Seguimiento comercial</h2>
        <div className="flex items-start gap-2 text-sm text-gray-500 mt-3">
          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
          <p>Sin seguimientos pendientes por ahora. Mantené cada oportunidad con próximo paso y fecha para que el sistema pueda ayudarte.</p>
        </div>
      </div>
    )
  }

  const groups: FollowUpGroup[] = ([
    {
      label: 'Vencidas',
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
      textColor: 'text-red-700',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      items: overdue,
      ctaLabel: 'Ver oportunidad',
      showDate: 'overdue' as const,
    },
    {
      label: 'Para hoy',
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      textColor: 'text-blue-700',
      icon: <Calendar className="h-3.5 w-3.5" />,
      items: today,
      ctaLabel: 'Ver oportunidad',
      showDate: 'today' as const,
    },
    {
      label: 'Sin próximo paso',
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
      textColor: 'text-orange-700',
      icon: <HelpCircle className="h-3.5 w-3.5" />,
      items: missingNextStep,
      ctaLabel: 'Definir próximo paso',
    },
    {
      label: 'Estancadas',
      color: 'gray',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-600',
      icon: <Clock className="h-3.5 w-3.5" />,
      items: stalled,
      ctaLabel: 'Ver oportunidad',
      showDate: 'activity' as const,
    },
  ] satisfies FollowUpGroup[]).filter(g => g.items.length > 0)

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-5 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Seguimiento comercial</h2>
          <p className="text-xs text-gray-400 mt-0.5">Prioriza oportunidades que necesitan acción: vencidas, para hoy o sin próximo paso.</p>
        </div>
        <Link href="/app/oportunidades" className="text-xs text-[#1B3A6B] hover:underline shrink-0 ml-4">
          Ver pipeline
        </Link>
      </div>

      <div className="space-y-3">
        {groups.map(group => (
          <div key={group.label} className={`rounded-lg border ${group.borderColor} ${group.bgColor} px-4 py-3`}>
            <div className={`flex items-center gap-1.5 mb-2 text-xs font-semibold ${group.textColor}`}>
              {group.icon}
              <span>{group.label}</span>
              <span className="font-normal opacity-70">({group.items.length})</span>
            </div>
            <ul className="space-y-1.5">
              {group.items.map(opp => (
                <li key={opp.id}>
                  <Link
                    href={`/app/oportunidades/${opp.id}`}
                    className="flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-white/70 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{opp.title ?? '(sin título)'}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {opp.stage && (
                          <span className={`inline-flex rounded-full px-1.5 py-0 text-xs font-medium ${OPPORTUNITY_STAGE_COLORS[opp.stage]}`}>
                            {OPPORTUNITY_STAGE_LABELS[opp.stage]}
                          </span>
                        )}
                        {opp.next_action && group.showDate !== undefined && (
                          <span className="text-xs text-gray-400 truncate">{opp.next_action}</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-0.5">
                      {group.showDate === 'overdue' && opp.next_action_date && (
                        <span className="text-xs font-medium text-red-600">{formatRelativeDate(opp.next_action_date)}</span>
                      )}
                      {group.showDate === 'today' && opp.next_action_date && (
                        <span className="text-xs text-blue-600">{formatDate(opp.next_action_date)}</span>
                      )}
                      {group.showDate === 'activity' && opp.last_activity_at && (
                        <span className="text-xs text-gray-400">{formatRelativeDate(opp.last_activity_at)}</span>
                      )}
                      <span className={`text-xs ${group.textColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                        {group.ctaLabel} →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        El seguimiento depende de que las oportunidades tengan próximo paso y fecha cargada.
      </p>
    </div>
  )
}
