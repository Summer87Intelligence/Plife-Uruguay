import { FlaskConical } from 'lucide-react'
import type { MockLead } from '@/domains/leads/mock-data'
import { LeadDetailHeader } from './lead-detail-header'
import { LeadDetailSummary } from './lead-detail-summary'
import { LeadNextActionPanel } from './lead-next-action-panel'
import { LeadTimelineMock } from './lead-timeline-mock'
import { LeadActionsPanel } from './lead-actions-panel'
import { LeadAIAssistantMock } from './lead-ai-assistant-mock'
import { LeadComplianceMock } from './lead-compliance-mock'

export function LeadDetailView({ lead }: { lead: MockLead }) {
  return (
    <div className="space-y-5">
      <LeadDetailHeader lead={lead} />

      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
        <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Detalle conceptual con datos demo.</span> Todavía no modifica
          datos reales.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <LeadDetailSummary lead={lead} />
          <LeadNextActionPanel lead={lead} />
          <LeadTimelineMock lead={lead} />
          <LeadAIAssistantMock lead={lead} />
        </div>
        <div className="space-y-5">
          <LeadActionsPanel lead={lead} />
          <LeadComplianceMock />
        </div>
      </div>
    </div>
  )
}
