import { cn } from '@/lib/utils'
import type { LeadPriority } from '@/domains/leads'
import { LEAD_PRIORITY_LABELS } from '@/domains/leads'

const PRIORITY_COLORS: Record<LeadPriority, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-50 text-blue-700',
  high: 'bg-red-100 text-red-800',
}

export function LeadPriorityBadge({ priority, className }: { priority: LeadPriority; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
        PRIORITY_COLORS[priority],
        className
      )}
    >
      Prioridad {LEAD_PRIORITY_LABELS[priority].toLowerCase()}
    </span>
  )
}
