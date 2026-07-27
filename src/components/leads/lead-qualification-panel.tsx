// FASE 15I — Panel de calificación simple y score del lead.
// Todo se calcula en runtime desde los datos actuales; nada se guarda.

import Link from 'next/link'
import { Gauge, FileText, Info, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { MockLead } from '@/domains/leads/mock-data'
import {
  calculateLeadScore,
  getLeadScoreBand,
  getLeadScoreBandLabel,
  getLeadScoreSignals,
  getSuggestedLeadQualification,
  getLeadQualificationLabel,
  getLeadQualificationDescription,
  getRecommendedActionForQualification,
  type LeadScoreBand,
} from '@/domains/leads'
import { buildProposalHref } from './lead-proposal-link'

const BAND_STYLES: Record<LeadScoreBand, { chip: string; bar: string }> = {
  low: { chip: 'bg-gray-100 text-gray-600', bar: 'bg-gray-300' },
  medium: { chip: 'bg-blue-50 text-blue-700', bar: 'bg-blue-400' },
  high: { chip: 'bg-orange-50 text-orange-700', bar: 'bg-orange-400' },
  very_high: { chip: 'bg-red-100 text-red-800', bar: 'bg-red-500' },
}

export function LeadQualificationPanel({ lead }: { lead: MockLead }) {
  const score = calculateLeadScore(lead)
  const band = getLeadScoreBand(score)
  const signals = getLeadScoreSignals(lead)
  const qualification = getSuggestedLeadQualification(lead)
  const styles = BAND_STYLES[band]

  const shouldHighlightProposal =
    band === 'high' ||
    band === 'very_high' ||
    qualification === 'hot' ||
    qualification === 'ready_for_proposal'
  const isTerminal = qualification === 'not_viable' || lead.status !== 'open'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Gauge className="h-4 w-4 text-[#1B3A6B]" />
          Calificación del lead
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score + banda */}
        <div className="flex items-center gap-3">
          <p className="text-2xl font-bold text-gray-900">{score}</p>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                  styles.chip
                )}
              >
                Score {getLeadScoreBandLabel(band).toLowerCase()}
              </span>
              <span className="text-[11px] text-gray-400">de 100</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={cn('h-full rounded-full', styles.bar)}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Calificación sugerida */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Calificación sugerida
          </p>
          <p className="mt-0.5 text-sm font-semibold text-gray-900">
            {getLeadQualificationLabel(qualification)}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {getLeadQualificationDescription(qualification)}
          </p>
        </div>

        {/* Señales detectadas */}
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
            Señales detectadas
          </p>
          {signals.length === 0 ? (
            <p className="text-xs text-gray-500">
              Sin señales todavía. Completá teléfono, email o interés para empezar a puntuar.
            </p>
          ) : (
            <ul className="space-y-1">
              {signals.map((signal) => (
                <li key={signal.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-gray-600">{signal.label}</span>
                  <span className="shrink-0 font-medium text-gray-400">+{signal.points}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Siguiente acción recomendada */}
        <div className="flex items-start gap-2 rounded-lg border border-[#1B3A6B]/15 bg-[#1B3A6B]/5 px-3 py-2.5">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1B3A6B]" />
          <p className="text-xs text-gray-700">
            <span className="font-semibold">Siguiente acción:</span>{' '}
            {getRecommendedActionForQualification(qualification)}
          </p>
        </div>

        {/* Orientación hacia propuesta */}
        {!isTerminal &&
          (shouldHighlightProposal ? (
            <Button asChild className="w-full justify-center">
              <Link href={buildProposalHref(lead)}>
                <FileText className="h-4 w-4" />
                Crear propuesta desde este lead
              </Link>
            </Button>
          ) : (
            <p className="text-xs text-gray-500">
              Conviene completar información antes de crear una propuesta.
            </p>
          ))}

        <p className="flex items-start gap-1.5 text-[11px] text-gray-400">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          Cálculo interno determinístico. No reemplaza el criterio comercial.
        </p>
      </CardContent>
    </Card>
  )
}
