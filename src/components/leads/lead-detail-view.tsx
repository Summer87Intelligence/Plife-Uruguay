import type { MockLead } from '@/domains/leads/mock-data'
import { LeadDetailHeader } from './lead-detail-header'
import { LeadDetailSummary } from './lead-detail-summary'
import { LeadNextActionPanel } from './lead-next-action-panel'
import { LeadOperationalEditForm } from './lead-operational-edit-form'
import { LeadQualificationPanel } from './lead-qualification-panel'
import { LeadActionsPanel } from './lead-actions-panel'

interface LeadDetailViewProps {
  lead: MockLead
}

export function LeadDetailView({ lead }: LeadDetailViewProps) {
  return (
    <div className="space-y-5">
      <LeadDetailHeader lead={lead} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <LeadDetailSummary lead={lead} />
          <LeadNextActionPanel lead={lead} />
          <LeadOperationalEditForm lead={lead} />
        </div>
        <div className="space-y-5">
          <LeadQualificationPanel lead={lead} />
          <LeadActionsPanel lead={lead} />
        </div>
      </div>
    </div>
  )
}
