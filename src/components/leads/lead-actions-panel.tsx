import { CheckCircle2, ArrowRightLeft, MessageSquare, TrendingUp, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { MockLead } from '@/domains/leads/mock-data'
import { canConvertLeadToOpportunity, getLeadConversionReadiness } from '@/domains/leads'

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
