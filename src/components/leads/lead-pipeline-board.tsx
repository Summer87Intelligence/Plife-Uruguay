import type { MockLead } from '@/domains/leads/mock-data'
import { LEAD_PIPELINE_ORDER, LEAD_PIPELINE_STAGE_LABELS } from '@/domains/leads'
import { LeadCard } from './lead-card'

export function LeadPipelineBoard({ leads }: { leads: MockLead[] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-3">
        {LEAD_PIPELINE_ORDER.map((stage) => {
          const stageLeads = leads.filter((lead) => lead.pipeline_stage === stage)
          return (
            <div key={stage} className="w-64 shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {LEAD_PIPELINE_STAGE_LABELS[stage]}
                </p>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                  {stageLeads.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 rounded-xl bg-gray-50/70 p-2 min-h-24">
                {stageLeads.length === 0 ? (
                  <p className="py-4 text-center text-[11px] text-gray-400">Sin leads</p>
                ) : (
                  stageLeads.map((lead) => <LeadCard key={lead.id} lead={lead} compact />)
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
