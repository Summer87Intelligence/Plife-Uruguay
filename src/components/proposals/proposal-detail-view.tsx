import { FileText, HelpCircle, ArrowRight, ShieldAlert, Cpu, Info, Link as LinkIcon, Gauge, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  DRAFT_SECTION_LABELS,
  SOURCE_LABELS,
  PROPOSAL_STATUS_LABELS,
  TARGET_TYPE_LABELS,
  normalizeStoredDraft,
  normalizeScoreSnapshot,
  normalizeQualificationSnapshot,
} from '@/domains/proposals'
import type { ProposalDetail } from '@/domains/proposals/queries'

// FASE 15N — Detalle read-only de una propuesta ya guardada. A diferencia de
// ProposalDraftView (borrador recién generado, "todavía no guardado"), este
// componente habla en pasado: la propuesta YA está persistida.
// Cálculo interno, sin OpenAI ni proveedor externo. Sin Compliance.

function TextBlock({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-700">{value}</p>
    </div>
  )
}

function ListBlock({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div className="space-y-1">
      {label && <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>}
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={`${label}-${i}`} className="text-sm text-gray-700 flex gap-2">
            <span className="text-[#1B3A6B] shrink-0">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-UY', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function ProposalDetailView({ proposal }: { proposal: ProposalDetail }) {
  const draft = normalizeStoredDraft(proposal.draft)
  const scoreSnapshot = normalizeScoreSnapshot(proposal.score_snapshot)
  const qualificationSnapshot = normalizeQualificationSnapshot(proposal.qualification_snapshot)

  const sourceLabel = SOURCE_LABELS[proposal.source] ?? proposal.source
  const statusLabel = PROPOSAL_STATUS_LABELS[proposal.status] ?? proposal.status
  const targetTypeLabel = TARGET_TYPE_LABELS[proposal.target_type] ?? proposal.target_type

  return (
    <div className="space-y-5">
      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-xs text-amber-800">
          Cálculo interno (sin OpenAI ni proveedor externo). Requiere validación comercial humana.
        </p>
      </div>

      {/* Header */}
      <Card className="border-[#1B3A6B]/15">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 text-[#1B3A6B]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-gray-900">{proposal.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {statusLabel}
                </span>
                <span className="rounded-full bg-[#1B3A6B]/10 px-2 py-0.5 text-xs font-medium text-[#1B3A6B]">
                  {sourceLabel}
                </span>
                <span className="text-xs text-gray-400">Guardada el {formatDate(proposal.created_at)}</span>
              </div>
            </div>
          </div>

          {(proposal.source_title || proposal.source_context) && (
            <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
              <LinkIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
              <p className="text-xs text-blue-800">
                Origen: <span className="font-medium">{sourceLabel}</span>
                {proposal.source_title ? ` — "${proposal.source_title}"` : ''}
                {proposal.source_context ? `. ${proposal.source_context}` : ''}
              </p>
            </div>
          )}

          <TextBlock label={DRAFT_SECTION_LABELS.summary} value={draft.summary} />
          <div className="grid sm:grid-cols-2 gap-4">
            <TextBlock
              label={DRAFT_SECTION_LABELS.targetAudience}
              value={draft.targetAudience || `${targetTypeLabel}${proposal.target_description ? `: ${proposal.target_description}` : ''}`}
            />
            <TextBlock label={DRAFT_SECTION_LABELS.problem} value={draft.problem} />
            <TextBlock label={DRAFT_SECTION_LABELS.opportunity} value={draft.opportunity} />
            <TextBlock label={DRAFT_SECTION_LABELS.proposedOffer} value={draft.proposedOffer} />
          </div>
        </CardContent>
      </Card>

      {/* Snapshots del lead (si vino desde lead) */}
      {(scoreSnapshot || qualificationSnapshot) && (
        <Card className="border-gray-100">
          <CardContent className="p-5 space-y-3">
            <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Snapshot del lead al crear la propuesta
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {scoreSnapshot && (
                <div className="flex items-start gap-2">
                  <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-[#1B3A6B]" />
                  <div>
                    <p className="text-sm text-gray-700">
                      Score: <span className="font-semibold">{scoreSnapshot.score}</span>
                      {scoreSnapshot.band_label ? ` (${scoreSnapshot.band_label})` : ''}
                    </p>
                  </div>
                </div>
              )}
              {qualificationSnapshot && (
                <div className="flex items-start gap-2">
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-[#1B3A6B]" />
                  <div>
                    <p className="text-sm text-gray-700">
                      Calificación: <span className="font-semibold">{qualificationSnapshot.label}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Congelado al momento de crear la propuesta; no se recalcula en vivo.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Listas conceptuales */}
      <Card className="border-gray-100">
        <CardContent className="p-5 grid md:grid-cols-2 gap-5">
          <ListBlock label={DRAFT_SECTION_LABELS.differentiators} items={draft.differentiators} />
          <ListBlock label={DRAFT_SECTION_LABELS.marketAngles} items={draft.marketAngles} />
          <ListBlock label={DRAFT_SECTION_LABELS.productIdeas} items={draft.productIdeas} />
          <ListBlock label={DRAFT_SECTION_LABELS.commercialStrategy} items={draft.commercialStrategy} />
        </CardContent>
      </Card>

      {/* Preguntas y próximos pasos */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-gray-100">
          <CardContent className="p-5 space-y-1">
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-[#1B3A6B]" /> {DRAFT_SECTION_LABELS.questionsToAsk}
            </p>
            <ListBlock label="" items={draft.questionsToAsk} />
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-5 space-y-1">
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <ArrowRight className="h-4 w-4 text-green-600" /> {DRAFT_SECTION_LABELS.nextSteps}
            </p>
            <ListBlock label="" items={draft.nextSteps} />
          </CardContent>
        </Card>
      </div>

      {/* Riesgos */}
      {draft.risksOrAssumptions.length > 0 && (
        <Card className="border-amber-100 bg-amber-50/40">
          <CardContent className="p-5 space-y-1">
            <p className="text-sm font-semibold text-amber-900 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-amber-600" /> {DRAFT_SECTION_LABELS.risksOrAssumptions}
            </p>
            <ListBlock label="" items={draft.risksOrAssumptions} />
          </CardContent>
        </Card>
      )}

      {/* Aportes de cada motor */}
      {draft.engineContributions.length > 0 && (
        <section className="space-y-3">
          <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Contribución de cada motor</p>
          <div className="grid lg:grid-cols-2 gap-4">
            {draft.engineContributions.map((c) => (
              <Card key={c.engineId} className="border-gray-100">
                <CardContent className="p-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-[#1B3A6B]" /> {c.engineName}
                  </p>
                  {c.questions.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Preguntas</p>
                      <ul className="space-y-0.5">
                        {c.questions.map((q, i) => (
                          <li key={i} className="text-xs text-gray-600 italic">“{q}”</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {c.outputs.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Aportes</p>
                      <ul className="space-y-0.5">
                        {c.outputs.map((o, i) => (
                          <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                            <span className="text-green-600">·</span>{o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
