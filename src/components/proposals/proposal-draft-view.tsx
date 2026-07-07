import { FileText, HelpCircle, ArrowRight, ShieldAlert, Cpu, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DRAFT_SECTION_LABELS, PROPOSAL_DISCLAIMERS } from '@/domains/proposals'
import type { ProposalDraft } from '@/domains/proposals'

function TextBlock({ label, value }: { label: string; value: string }) {
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
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>
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

export function ProposalDraftView({ draft }: { draft: ProposalDraft }) {
  return (
    <div className="space-y-5">
      {/* Disclaimers */}
      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div className="text-xs text-amber-800 space-y-0.5">
          <p>{PROPOSAL_DISCLAIMERS.notSaved}</p>
          <p>{PROPOSAL_DISCLAIMERS.noProvider}</p>
          <p>{PROPOSAL_DISCLAIMERS.humanReview}</p>
          <p>{PROPOSAL_DISCLAIMERS.noMarketData}</p>
        </div>
      </div>

      {/* Header */}
      <Card className="border-[#1B3A6B]/15">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 text-[#1B3A6B]" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-gray-900">{draft.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">Borrador conceptual de propuesta</p>
            </div>
          </div>

          <TextBlock label={DRAFT_SECTION_LABELS.summary} value={draft.summary} />
          <div className="grid sm:grid-cols-2 gap-4">
            <TextBlock label={DRAFT_SECTION_LABELS.targetAudience} value={draft.targetAudience} />
            <TextBlock label={DRAFT_SECTION_LABELS.problem} value={draft.problem} />
            <TextBlock label={DRAFT_SECTION_LABELS.opportunity} value={draft.opportunity} />
            <TextBlock label={DRAFT_SECTION_LABELS.proposedOffer} value={draft.proposedOffer} />
          </div>
        </CardContent>
      </Card>

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
      <Card className="border-amber-100 bg-amber-50/40">
        <CardContent className="p-5 space-y-1">
          <p className="text-sm font-semibold text-amber-900 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-amber-600" /> {DRAFT_SECTION_LABELS.risksOrAssumptions}
          </p>
          <ListBlock label="" items={draft.risksOrAssumptions} />
        </CardContent>
      </Card>

      {/* Aportes de cada motor */}
      <section className="space-y-3">
        <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Contribución de cada motor</p>
        <div className="grid lg:grid-cols-2 gap-4">
          {draft.engineContributions.map((c) => (
            <Card key={c.engineId} className="border-gray-100">
              <CardContent className="p-4 space-y-2">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-[#1B3A6B]" /> {c.engineName}
                </p>
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Preguntas</p>
                  <ul className="space-y-0.5">
                    {c.questions.map((q, i) => (
                      <li key={i} className="text-xs text-gray-600 italic">“{q}”</li>
                    ))}
                  </ul>
                </div>
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
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
