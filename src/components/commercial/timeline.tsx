import { Phone, Users, MessageSquare, Mail, StickyNote, SquareCheck as CheckSquare, MessageCircle, Link2, Clock, CheckCircle2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ACTIVITY_TYPE_LABELS } from '@/lib/constants'
import { formatRelativeDate } from '@/lib/utils'
import type { Activity, ActivityType } from '@/types/database'

export type TimelineActivity = Pick<
  Activity,
  'id' | 'type' | 'title' | 'description' | 'outcome' | 'created_at' | 'scheduled_at' | 'is_completed'
> & {
  created_by_profile?: { full_name: string } | null
}

const ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
  llamada: Phone,
  reunion: Users,
  mensaje: MessageSquare,
  email: Mail,
  nota: StickyNote,
  tarea: CheckSquare,
  whatsapp: MessageCircle,
  linkedin: Link2,
}

interface TimelineProps {
  activities: TimelineActivity[]
  emptyText?: string
}

export function Timeline({ activities, emptyText = 'Sin actividades registradas' }: TimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">{emptyText}</p>
        <p className="text-xs mt-1">Registrá llamadas, reuniones, mensajes y notas</p>
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {activities.map((act, idx) => {
        const Icon = ACTIVITY_ICONS[act.type] ?? StickyNote
        const isLast = idx === activities.length - 1
        return (
          <li key={act.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-[#1B3A6B]" />
              </div>
              {!isLast && <div className="flex-1 w-px bg-gray-100 mt-2" />}
            </div>
            <div className="pb-4 min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{act.title}</p>
                  <span className="shrink-0 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                    {ACTIVITY_TYPE_LABELS[act.type]}
                  </span>
                  {act.is_completed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                  )}
                </div>
                <span className="text-xs text-gray-400 shrink-0">{formatRelativeDate(act.created_at)}</span>
              </div>
              {act.description && <p className="text-xs text-gray-500 mt-1">{act.description}</p>}
              {act.outcome && (
                <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                  <p className="text-xs text-blue-800">{act.outcome}</p>
                </div>
              )}
              {act.created_by_profile?.full_name && (
                <p className="text-[11px] text-gray-400 mt-1.5">Registrado por {act.created_by_profile.full_name}</p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
