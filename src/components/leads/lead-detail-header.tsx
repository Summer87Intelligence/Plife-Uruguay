import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { MockLead } from '@/domains/leads/mock-data'
import { LEAD_STATUS_LABELS } from '@/domains/leads'
import { LeadStatusBadge } from './lead-status-badge'
import { LeadPriorityBadge } from './lead-priority-badge'
import { LeadTemperatureBadge } from './lead-temperature-badge'

export function LeadDetailHeader({ lead }: { lead: MockLead }) {
  return (
    <div>
      <Link
        href="/app/leads"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Leads
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900">{lead.title}</h1>
          {lead.display_name && (
            <p className="mt-0.5 text-sm text-gray-500">{lead.display_name}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LeadStatusBadge stage={lead.pipeline_stage} />
          <LeadPriorityBadge priority={lead.priority} />
          <LeadTemperatureBadge temperature={lead.temperature} />
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
            {LEAD_STATUS_LABELS[lead.status]}
          </span>
        </div>
      </div>
    </div>
  )
}
