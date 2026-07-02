'use client'
import { formatDate, formatRelativeDate } from '@/lib/utils'

interface ActivitySummaryCardProps {
  nextAction?: string | null
  nextActionDate?: string | null
  lastActivityAt?: string | null
  title?: string
  className?: string
}

function followUpStatus(nextAction?: string | null, nextActionDate?: string | null) {
  if (!nextAction) return { label: 'Sin próximo paso', classes: 'bg-gray-100 text-gray-500' }
  if (!nextActionDate) return { label: 'Sin fecha', classes: 'bg-blue-100 text-blue-700' }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(nextActionDate + 'T00:00:00')
  if (due < today) return { label: 'Vencido', classes: 'bg-red-100 text-red-700' }
  return { label: 'Pendiente', classes: 'bg-yellow-100 text-yellow-700' }
}

export function ActivitySummaryCard({ nextAction, nextActionDate, lastActivityAt, title, className }: ActivitySummaryCardProps) {
  const status = followUpStatus(nextAction, nextActionDate)

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        {title && (
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        )}
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.classes}`}>
          {status.label}
        </span>
      </div>
      {nextAction ? (
        <div>
          <p className="text-sm font-medium text-gray-800">{nextAction}</p>
          {nextActionDate && (
            <p className="text-xs text-gray-500 mt-0.5">{formatDate(nextActionDate)}</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">Sin próximo paso definido.</p>
      )}
      {lastActivityAt && (
        <p className="text-[10px] text-gray-400 mt-2">
          Última actividad: {formatRelativeDate(lastActivityAt)}
        </p>
      )}
    </div>
  )
}
