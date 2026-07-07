import Link from 'next/link'
import { CheckCircle2, ArrowRightLeft, MessageSquare, TrendingUp, Trash2, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { MockLead } from '@/domains/leads/mock-data'
import {
  canConvertLeadToOpportunity,
  getLeadConversionReadiness,
  LEAD_PIPELINE_STAGE_LABELS,
  LEAD_PRIORITY_LABELS,
  LEAD_TEMPERATURE_LABELS,
} from '@/domains/leads'

// Construye el link a /app/propuestas/nueva con contexto del lead (sin persistencia).
function buildProposalHref(lead: MockLead) {
  const contextParts = [
    `Etapa: ${LEAD_PIPELINE_STAGE_LABELS[lead.pipeline_stage]}`,
    `Interés: ${lead.interest_area ?? 'sin definir'}`,
    `Próximo paso: ${lead.next_action ?? 'sin definir'}`,
    `Temperatura: ${LEAD_TEMPERATURE_LABELS[lead.temperature]}`,
    `Prioridad: ${LEAD_PRIORITY_LABELS[lead.priority]}`,
  ]
  const query: Record<string, string> = {
    source: 'lead',
    source_id: lead.id,
    source_title: lead.title,
    context: contextParts.join('. ') + '.',
    target_type: lead.lead_type,
  }
  if (lead.interest_area) query.target_description = lead.interest_area
  return { pathname: '/app/propuestas/nueva' as const, query }
}

const MOCK_ACTIONS = [
  { id: 'contacted', label: 'Marcar contactado', icon: CheckCircle2 },
  { id: 'stage', label: 'Cambiar etapa', icon: ArrowRightLeft },
  { id: 'message', label: 'Preparar mensaje', icon: MessageSquare },
  { id: 'discard', label: 'Descartar lead', icon: Trash2, variant: 'outline' as const },
]

const MOCK_HINT = 'Disponible cuando el módulo esté conectado a la base.'

export function LeadActionsPanel({ lead }: { lead: MockLead }) {
  const readiness = getLeadConversionReadiness(lead)
  const canConvert = canConvertLeadToOpportunity(lead)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Acciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-[#1B3A6B]/15 bg-[#1B3A6B]/5 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#1B3A6B]" />
            <p className="text-sm font-medium text-gray-900">Crear propuesta</p>
          </div>
          <p className="text-xs text-gray-600">
            Usá los motores para armar un borrador conceptual a partir de este lead.
          </p>
          <Button asChild className="w-full justify-center">
            <Link href={buildProposalHref(lead)}>
              <FileText className="h-4 w-4" />
              Crear propuesta desde este lead
            </Link>
          </Button>
        </div>

        <p className="text-xs text-gray-500">{MOCK_HINT}</p>

        <div className="grid gap-2 sm:grid-cols-2">
          {MOCK_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                type="button"
                variant={action.variant ?? 'secondary'}
                className="justify-start gap-2"
                disabled
                title={MOCK_HINT}
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            )
          })}
        </div>

        <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#1B3A6B]" />
            <p className="text-sm font-medium text-gray-900">Convertir a oportunidad</p>
          </div>

          {canConvert ? (
            <>
              <p className="text-xs text-green-700">
                El lead cumple los criterios de elegibilidad según los helpers del dominio.
              </p>
              <Button type="button" disabled title="Disponible en fase con persistencia real.">
                Convertir a oportunidad
              </Button>
              <p className="text-xs text-gray-500">Disponible en fase con persistencia real.</p>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-600">Todavía no se puede convertir este lead:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {readiness.reasons.map((reason) => (
                  <li key={reason} className="text-xs text-gray-600">
                    {reason}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
