'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Plus, AlertTriangle, Calendar, Pencil, Trophy, CircleX, UserCircle, Megaphone, Building2, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Input, Textarea } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Timeline } from '@/components/commercial/timeline'
import type { TimelineActivity } from '@/components/commercial/timeline'
import { ActivityForm } from '@/components/commercial/activity-form'
import { AIAssistantDialog } from '@/components/commercial/ai-assistant-dialog'
import { runCopilot, saveAIAsActivity } from '@/domains/ai/actions'
import { OpportunityForm } from '../opportunity-form'
import { SimpleBreadcrumb } from '@/components/navigation/simple-breadcrumb'
import { QuickActions } from '@/components/navigation/quick-actions'
import { EntitySummary } from '@/components/navigation/entity-summary'
import { DetailBackLink } from '@/components/navigation/detail-back-link'
import { OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGE_COLORS, RISK_LEVEL_LABELS, RISK_LEVEL_COLORS, PIPELINE_STAGES, CLOSED_STAGES } from '@/lib/constants'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import { updateOpportunityStage, updateOpportunity, closeOpportunity } from '@/domains/opportunities/actions'
import { useRouter } from 'next/navigation'
import type { Profile, Opportunity, Note, Contact, Company, AIExecutionRun } from '@/types/database'
import { EntityAIAnalysisCard } from '@/components/ia/entity-ai-analysis-card'
import { SectionGuideCard } from '@/components/guidance/section-guide-card'

type OpportunityWithRelations = Opportunity & {
  contact?: Pick<Contact, 'id' | 'first_name' | 'last_name' | 'phone' | 'email'> | null
  company?: Pick<Company, 'id' | 'name'> | null
  assigned_profile?: { id: string; full_name: string } | null
}

interface OpportunityDetailProps {
  opportunity: OpportunityWithRelations
  activities: TimelineActivity[]
  notes: Note[]
  advisors: { id: string; full_name: string }[]
  campaign: { id: string; name: string } | null
  profile: Profile
  aiProfile?: { id: string; name: string } | null
  latestAiRun?: AIExecutionRun | null
}

const allStages = [...PIPELINE_STAGES, ...CLOSED_STAGES]
const stageOptions = allStages.map(s => ({ value: s, label: OPPORTUNITY_STAGE_LABELS[s] }))

export function OpportunityDetail({ opportunity, activities, advisors, campaign, aiProfile, latestAiRun }: OpportunityDetailProps) {
  const router = useRouter()
  const [activityOpen, setActivityOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [lostOpen, setLostOpen] = useState(false)
  const [lossReason, setLossReason] = useState(opportunity.loss_reason ?? '')
  const [nextAction, setNextAction] = useState(opportunity.next_action ?? '')
  const [nextActionDate, setNextActionDate] = useState(opportunity.next_action_date ?? '')
  const [probability, setProbability] = useState(opportunity.probability != null ? String(opportunity.probability) : '')
  const [humanScore, setHumanScore] = useState(opportunity.human_score != null ? String(opportunity.human_score) : '')
  const [busy, setBusy] = useState(false)

  const isClosed = (CLOSED_STAGES as string[]).includes(opportunity.stage)

  async function handleStageChange(stage: string) {
    await updateOpportunityStage(opportunity.id, stage)
    router.refresh()
  }
  async function handleAssign(advisorId: string) {
    await updateOpportunity(opportunity.id, { assigned_to: advisorId })
    router.refresh()
  }
  async function handleSaveScores() {
    setBusy(true)
    await updateOpportunity(opportunity.id, {
      probability: probability !== '' ? Number(probability) : undefined,
      human_score: humanScore !== '' ? Number(humanScore) : undefined,
    })
    setBusy(false)
    router.refresh()
  }
  async function handleSaveNextAction() {
    setBusy(true)
    await updateOpportunity(opportunity.id, { next_action: nextAction, next_action_date: nextActionDate })
    setBusy(false)
    router.refresh()
  }
  async function handleWin() {
    setBusy(true)
    await closeOpportunity(opportunity.id, 'ganada')
    setBusy(false)
    router.refresh()
  }
  async function handleLose() {
    setBusy(true)
    await closeOpportunity(opportunity.id, 'perdida', lossReason)
    setBusy(false)
    setLostOpen(false)
    router.refresh()
  }

  const typeLabel = { b2c: 'B2C', b2b: 'B2B', reclutamiento: 'Reclutamiento' }[opportunity.type]
  const advisorOptions = advisors.map(a => ({ value: a.id, label: a.full_name }))

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <DetailBackLink href="/app/oportunidades" label="Volver a oportunidades" />
        <SimpleBreadcrumb items={[
          { label: 'Oportunidades', href: '/app/oportunidades' },
          { label: opportunity.title },
        ]} />
      </div>

      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-400 uppercase">{typeLabel}</span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${OPPORTUNITY_STAGE_COLORS[opportunity.stage]}`}>
              {OPPORTUNITY_STAGE_LABELS[opportunity.stage]}
            </span>
            {opportunity.commercial_risk && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${RISK_LEVEL_COLORS[opportunity.commercial_risk]}`}>
                <AlertTriangle className="h-3 w-3" />Riesgo {RISK_LEVEL_LABELS[opportunity.commercial_risk]}
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900">{opportunity.title}</h1>
          {opportunity.estimated_value != null && (
            <p className="text-2xl font-bold text-[#1B3A6B] mt-1">${opportunity.estimated_value.toLocaleString('es-UY')} <span className="text-sm font-normal text-gray-400">valor estimado</span></p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-1">
            {opportunity.contact && (
              <Link href={`/app/contactos/${opportunity.contact.id}`} className="text-sm text-[#1B3A6B] hover:underline">
                {opportunity.contact.first_name} {opportunity.contact.last_name}
              </Link>
            )}
            {opportunity.company && (
              <Link href={`/app/empresas/${opportunity.company.id}`} className="text-sm text-[#1B3A6B] hover:underline">
                {opportunity.company.name}
              </Link>
            )}
            {campaign && (
              <Link href={`/app/campanas/${campaign.id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#1B3A6B]">
                <Megaphone className="h-3 w-3" />{campaign.name}
              </Link>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <AIAssistantDialog
            triggerLabel="Asistir con IA"
            title="Copiloto — oportunidad"
            description={opportunity.title}
            actions={[
              { id: 'proximo', label: 'Sugerir próximo paso', run: () => runCopilot({ helpType: 'proximo_paso', opportunityId: opportunity.id }) },
              { id: 'reunion', label: 'Preparar reunión', run: () => runCopilot({ helpType: 'preparar_reunion', opportunityId: opportunity.id }) },
              { id: 'seguimiento', label: 'Generar seguimiento', run: () => runCopilot({ helpType: 'seguimiento', opportunityId: opportunity.id }) },
              { id: 'objecion', label: 'Responder objeción', run: () => runCopilot({ helpType: 'objecion', opportunityId: opportunity.id }) },
            ]}
            onSaveActivity={async (content) => { await saveAIAsActivity({ title: 'Copiloto IA', content, opportunityId: opportunity.id }); router.refresh() }}
          />
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Pencil className="h-4 w-4" />Editar</Button>
            </DialogTrigger>
            <DialogContent title="Editar oportunidad">
              <OpportunityForm
                mode="edit"
                opportunityId={opportunity.id}
                initial={{
                  title: opportunity.title,
                  type: opportunity.type,
                  stage: opportunity.stage,
                  estimated_value: opportunity.estimated_value ?? undefined,
                  detected_need: opportunity.detected_need ?? '',
                  suggested_product: opportunity.suggested_product ?? '',
                  commercial_risk: opportunity.commercial_risk ?? 'bajo',
                  next_action: opportunity.next_action ?? '',
                  next_action_date: opportunity.next_action_date ?? '',
                  notes: opportunity.notes ?? '',
                }}
                onSuccess={() => setEditOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={activityOpen} onOpenChange={setActivityOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4" />Registrar</Button>
            </DialogTrigger>
            <DialogContent title="Registrar actividad">
              <ActivityForm opportunityId={opportunity.id} onSuccess={() => setActivityOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <EntitySummary
        items={[
          { label: 'Etapa', value: OPPORTUNITY_STAGE_LABELS[opportunity.stage], highlight: true },
          {
            label: 'Empresa',
            value: opportunity.company
              ? <Link href={`/app/empresas/${opportunity.company.id}`} className="text-[#1B3A6B] hover:underline">{opportunity.company.name}</Link>
              : null,
          },
          {
            label: 'Contacto',
            value: opportunity.contact
              ? <Link href={`/app/contactos/${opportunity.contact.id}`} className="text-[#1B3A6B] hover:underline">{opportunity.contact.first_name} {opportunity.contact.last_name}</Link>
              : null,
          },
          { label: 'Próximo paso', value: opportunity.next_action },
          {
            label: 'Valor estimado',
            value: opportunity.estimated_value != null
              ? `$${opportunity.estimated_value.toLocaleString('es-UY')}`
              : null,
            highlight: true,
          },
          ...(campaign
            ? [{
                label: 'Campaña',
                value: <Link href={`/app/campanas/${campaign.id}`} className="text-[#1B3A6B] hover:underline">{campaign.name}</Link>,
              }]
            : []),
        ]}
      />

      <QuickActions
        actions={[
          ...(opportunity.company
            ? [{ label: 'Ver empresa', href: `/app/empresas/${opportunity.company.id}`, icon: Building2 }]
            : []),
          ...(opportunity.contact
            ? [{ label: 'Ver contacto', href: `/app/contactos/${opportunity.contact.id}`, icon: UserCircle }]
            : []),
          ...(campaign
            ? [{ label: 'Ver campaña', href: `/app/campanas/${campaign.id}`, icon: Megaphone }]
            : []),
          { label: 'Ir al pipeline', href: '/app/oportunidades', icon: List },
        ]}
      />

      {/* Pipeline progress indicator */}
      {!isClosed && (
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex items-center gap-1 overflow-x-auto">
            {PIPELINE_STAGES.map((stage, i) => {
              const stageIndex = PIPELINE_STAGES.indexOf(opportunity.stage)
              const isActive = stage === opportunity.stage
              const isPast = i < stageIndex
              return (
                <div key={stage} className="flex items-center gap-1 shrink-0">
                  <div className={`flex flex-col items-center ${isActive ? '' : ''}`}>
                    <div className={`h-2 w-16 rounded-full ${
                      isActive ? 'bg-[#1B3A6B]' :
                      isPast ? 'bg-[#1B3A6B]/30' :
                      'bg-gray-100'
                    }`} />
                    {isActive && (
                      <span className="text-[9px] font-medium text-[#1B3A6B] mt-1 whitespace-nowrap">{OPPORTUNITY_STAGE_LABELS[stage]}</span>
                    )}
                  </div>
                  {i < PIPELINE_STAGES.length - 1 && <div className="w-1" />}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Etapa y cierre</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select label="Etapa" value={opportunity.stage} onValueChange={handleStageChange} options={stageOptions} />
              {!isClosed ? (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button variant="outline" size="sm" loading={busy} onClick={handleWin} className="text-green-700 border-green-200 hover:bg-green-50">
                    <Trophy className="h-4 w-4" />Ganada
                  </Button>
                  <Dialog open={lostOpen} onOpenChange={setLostOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-700 border-red-200 hover:bg-red-50"><CircleX className="h-4 w-4" />Perdida</Button>
                    </DialogTrigger>
                    <DialogContent title="Marcar como perdida" description="Registrá el motivo para aprender del cierre">
                      <div className="space-y-4">
                        <Textarea label="Motivo de pérdida" value={lossReason} onChange={e => setLossReason(e.target.value)} rows={3} placeholder="Precio, timing, eligió competencia..." />
                        <div className="flex justify-end">
                          <Button variant="destructive" loading={busy} onClick={handleLose}>Confirmar pérdida</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-sm font-medium text-gray-700">{OPPORTUNITY_STAGE_LABELS[opportunity.stage]}</p>
                  {opportunity.loss_reason && <p className="text-xs text-gray-500 mt-1">Motivo: {opportunity.loss_reason}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><UserCircle className="h-4 w-4 text-[#1B3A6B]" />Responsable</CardTitle></CardHeader>
            <CardContent>
              <Select value={opportunity.assigned_to ?? ''} onValueChange={handleAssign} options={advisorOptions} placeholder="Sin asignar" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Potencial de cierre</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input label="Probabilidad de cierre (%)" type="number" min={0} max={100} value={probability} onChange={e => setProbability(e.target.value)} />
              <Input label="Potencial comercial (0–100)" type="number" min={0} max={100} value={humanScore} onChange={e => setHumanScore(e.target.value)} />
              <Button variant="outline" size="sm" className="w-full" loading={busy} onClick={handleSaveScores}>Guardar potencial</Button>
              {opportunity.probability != null && (
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-[#1B3A6B] h-2 rounded-full" style={{ width: `${opportunity.probability}%` }} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Calendar className="h-4 w-4" />Seguimiento</CardTitle>
                {(() => {
                  if (!opportunity.next_action) return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-500">Sin próximo paso</span>
                  if (!opportunity.next_action_date) return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700">Sin fecha</span>
                  const today = new Date(); today.setHours(0, 0, 0, 0)
                  const due = new Date(opportunity.next_action_date + 'T00:00:00')
                  if (due < today) return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-red-100 text-red-700">Vencido</span>
                  return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-yellow-100 text-yellow-700">Pendiente</span>
                })()}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {opportunity.next_action ? (
                <div className="rounded-lg bg-[#1B3A6B]/5 px-3 py-2.5">
                  <p className="text-sm font-medium text-gray-900">{opportunity.next_action}</p>
                  {opportunity.next_action_date && (
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(opportunity.next_action_date)}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Esta oportunidad todavía no tiene próximo paso definido.</p>
              )}
              <Input label="Próximo paso" value={nextAction} onChange={e => setNextAction(e.target.value)} placeholder="Qué hay que hacer a continuación..." />
              <Input label="Fecha" type="date" value={nextActionDate} onChange={e => setNextActionDate(e.target.value)} />
              <Button variant="outline" size="sm" className="w-full" loading={busy} onClick={handleSaveNextAction}>Guardar seguimiento</Button>
              {opportunity.last_activity_at && (
                <p className="text-[10px] text-gray-400 border-t border-gray-50 pt-2">
                  Última actividad: {formatRelativeDate(opportunity.last_activity_at)}
                </p>
              )}
            </CardContent>
          </Card>

          {!opportunity.next_action && !isClosed && (
            <SectionGuideCard
              title="Definí un próximo paso"
              description="Esta oportunidad no tiene próximo paso definido. Sin seguimiento, puede perderse."
              nextStep="Atención: sin próximo paso"
              compact
            />
          )}

          {aiProfile && (
            <>
              <EntityAIAnalysisCard
                entityType="opportunity"
                entityId={opportunity.id}
                entityLabel={opportunity.title}
                profileId={aiProfile.id}
                profileName={aiProfile.name}
                latestRun={latestAiRun}
                compact
              />
              <p className="text-xs text-gray-400 -mt-3 px-1">
                El análisis IA ayuda a preparar el seguimiento, pero no define primas, coberturas ni condiciones de póliza.
              </p>
            </>
          )}

          {(opportunity.detected_need || opportunity.suggested_product) && (
            <Card>
              <CardHeader><CardTitle>Necesidad detectada</CardTitle></CardHeader>
              <CardContent>
                {opportunity.detected_need && <p className="text-sm text-gray-700">{opportunity.detected_need}</p>}
                {opportunity.suggested_product && (
                  <div className="mt-3 border-t border-gray-50 pt-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Producto sugerido</p>
                    <p className="text-sm text-gray-700">{opportunity.suggested_product}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Timeline comercial</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActivityOpen(true)}><Plus className="h-4 w-4" />Nueva</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Timeline activities={activities} emptyText="Sin actividades en esta oportunidad" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
