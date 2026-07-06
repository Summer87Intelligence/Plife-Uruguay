import Link from 'next/link'
import type { Route } from 'next'
import { CalendarDays, Building2, User, HelpCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MockLead } from '@/domains/leads/mock-data'
import { LEAD_SOURCE_LABELS, getLeadFollowUpBucket } from '@/domains/leads'
import { LeadStatusBadge } from './lead-status-badge'
import { LeadPriorityBadge } from './lead-priority-badge'
import { LeadTemperatureBadge } from './lead-temperature-badge'

const TYPE_ICONS = {
  person: User,
  company: Building2,
  unknown: HelpCircle,
}

function formatDate(value: string): string {
  const [y, m, d] = value.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export function LeadCard({ lead, compact = false }: { lead: MockLead; compact?: boolean }) {
  const TypeIcon = TYPE_ICONS[lead.lead_type]
  const bucket = getLeadFollowUpBucket(lead)
  const isOverdue = bucket === 'overdue'

  return (
    <Link
      href={`/app/leads/${lead.id}` as Route}
      aria-label={`Ver detalle de ${lead.title}`}
      className={cn(
        'block rounded-xl border bg-white p-4 shadow-sm transition-colors hover:border-[#1B3A6B]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3A6B] focus-visible:ring-offset-2',
        isOverdue ? 'border-red-200' : 'border-gray-100'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-gray-400">
            <TypeIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[11px] uppercase tracking-wide">
              {LEAD_SOURCE_LABELS[lead.source]}
            </span>
          </div>
          <p className="mt-0.5 text-sm font-semibold text-gray-900 truncate">{lead.title}</p>
          {lead.display_name && (
            <p className="text-xs text-gray-500 truncate">{lead.display_name}</p>
          )}
        </div>
        <LeadStatusBadge stage={lead.pipeline_stage} />
      </div>

      {!compact && lead.interest_area && (
        <p className="mt-2 text-xs text-gray-600">{lead.interest_area}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <LeadTemperatureBadge temperature={lead.temperature} />
        <LeadPriorityBadge priority={lead.priority} />
      </div>

      <div className="mt-3 border-t border-gray-50 pt-2">
        {lead.next_action ? (
          <div className="flex items-start gap-1.5 text-xs">
            <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
            <div className="min-w-0">
              <p className="text-gray-700 truncate">{lead.next_action}</p>
              {lead.next_action_date && (
                <p
                  className={cn(
                    'mt-0.5 flex items-center gap-1',
                    isOverdue ? 'font-medium text-red-600' : 'text-gray-400'
                  )}
                >
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(lead.next_action_date)}
                  {isOverdue && ' — vencido'}
                  {bucket === 'today' && ' — hoy'}
                </p>
              )}
            </div>
          </div>
        ) : lead.status === 'open' ? (
          <p className="text-xs font-medium text-orange-600">Sin próximo paso definido</p>
        ) : (
          <p className="text-xs text-gray-400">Sin gestión activa</p>
        )}
      </div>
    </Link>
  )
}
