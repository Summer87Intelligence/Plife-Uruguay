import Link from 'next/link'
import { TrendingUp, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { MockLead } from '@/domains/leads/mock-data'
import { canConvertLeadToOpportunity, getLeadConversionReadiness } from '@/domains/leads'
import { buildProposalHref } from './lead-proposal-link'

// FASE 15I — Se retiraron los botones mock (marcar contactado, cambiar etapa,
// preparar mensaje, descartar): etapa y próximo paso ya se editan con el
// formulario operativo real (14J); descartar llegará con su flujo propio.

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
