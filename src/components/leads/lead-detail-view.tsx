import { FlaskConical } from 'lucide-react'
import type { MockLead } from '@/domains/leads/mock-data'
import { LeadDetailHeader } from './lead-detail-header'
import { LeadDetailSummary } from './lead-detail-summary'
import { LeadNextActionPanel } from './lead-next-action-panel'
import { LeadOperationalEditForm } from './lead-operational-edit-form'
import { LeadQualificationPanel } from './lead-qualification-panel'
import { LeadTimelineMock } from './lead-timeline-mock'
import { LeadActionsPanel } from './lead-actions-panel'

interface LeadDetailViewProps {
  lead: MockLead
  /** FASE 14H — banner según origen de datos */
  dataSource?: 'mock' | 'dev-readonly'
}

export function LeadDetailView({ lead, dataSource = 'mock' }: LeadDetailViewProps) {
  const banner =
    dataSource === 'dev-readonly'
      ? {
          title: 'Detalle conectado a Supabase dev.',
          body: 'Los campos operativos son editables; convertir, descartar y eliminar siguen deshabilitados.',
        }
      : {
          title: 'Detalle conceptual con datos demo.',
          body: 'Todavía no modifica datos reales.',
        }

  return (
    <div className="space-y-5">
      <LeadDetailHeader lead={lead} />

      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
        <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">{banner.title}</span> {banner.body}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <LeadDetailSummary lead={lead} />
          <LeadNextActionPanel lead={lead} />
          {dataSource === 'dev-readonly' && <LeadOperationalEditForm lead={lead} />}
          {/* FASE 15I — LeadAIAssistantMock retirado: el panel de calificación lo reemplaza. */}
          <LeadTimelineMock lead={lead} />
        </div>
        <div className="space-y-5">
          <LeadQualificationPanel lead={lead} />
          <LeadActionsPanel lead={lead} />
        </div>
      </div>
    </div>
  )
}
