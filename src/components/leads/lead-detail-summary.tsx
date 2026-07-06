import { Building2, User, HelpCircle, Mail, Phone, Calendar, UserCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MockLead } from '@/domains/leads/mock-data'
import { LEAD_TYPE_LABELS, LEAD_SOURCE_LABELS } from '@/domains/leads'

const TYPE_ICONS = {
  person: User,
  company: Building2,
  unknown: HelpCircle,
}

function formatDateTime(value: string): string {
  const d = new Date(value)
  return d.toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-900 text-right">{value}</span>
    </div>
  )
}

export function LeadDetailSummary({ lead }: { lead: MockLead }) {
  const TypeIcon = TYPE_ICONS[lead.lead_type]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <TypeIcon className="h-4 w-4 text-gray-400" />
          Resumen del lead
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <SummaryRow label="Tipo" value={LEAD_TYPE_LABELS[lead.lead_type]} />
        <SummaryRow label="Origen" value={LEAD_SOURCE_LABELS[lead.source]} />
        {lead.interest_area && (
          <SummaryRow label="Interés" value={lead.interest_area} />
        )}
        {lead.phone && (
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              Teléfono
            </span>
            <span className="text-gray-900">{lead.phone}</span>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Email
            </span>
            <span className="text-gray-900 truncate">{lead.email}</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-gray-500 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Creado (demo)
          </span>
          <span className="text-gray-900">{formatDateTime(lead.created_at)}</span>
        </div>
        {lead.assigned_to && (
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-gray-500 flex items-center gap-1.5">
              <UserCircle className="h-3.5 w-3.5" />
              Asignado
            </span>
            <span className="text-gray-900">Asesor demo</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
