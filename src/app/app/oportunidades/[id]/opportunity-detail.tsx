'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Bot, Plus, AlertTriangle, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGE_COLORS, RISK_LEVEL_LABELS, RISK_LEVEL_COLORS, PIPELINE_STAGES, CLOSED_STAGES, ACTIVITY_TYPE_LABELS } from '@/lib/constants'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import { updateOpportunityStage, updateOpportunity } from '@/domains/opportunities/actions'
import { addActivity } from '@/domains/contacts/actions'
import { useRouter } from 'next/navigation'
import type { Profile, Opportunity, Activity, Note, Contact, Company } from '@/types/database'

type OpportunityWithRelations = Opportunity & {
  contact?: Pick<Contact, 'id' | 'first_name' | 'last_name' | 'phone' | 'email'> | null
  company?: Pick<Company, 'id' | 'name'> | null
  assigned_profile?: { id: string; full_name: string } | null
}

interface OpportunityDetailProps {
  opportunity: OpportunityWithRelations
  activities: Activity[]
  notes: Note[]
  profile: Profile
}

const allStages = [...PIPELINE_STAGES, ...CLOSED_STAGES]
const stageOptions = allStages.map(s => ({ value: s, label: OPPORTUNITY_STAGE_LABELS[s] }))
const activityTypeOptions = Object.entries(ACTIVITY_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))

export function OpportunityDetail({ opportunity, activities, notes, profile }: OpportunityDetailProps) {
  const router = useRouter()
  const [activityOpen, setActivityOpen] = useState(false)
  const [activityForm, setActivityForm] = useState({ type: 'llamada', title: '', description: '', outcome: '' })
  const [loading, setLoading] = useState(false)
  const [nextAction, setNextAction] = useState(opportunity.next_action ?? '')
  const [nextActionDate, setNextActionDate] = useState(opportunity.next_action_date ?? '')

  async function handleStageChange(stage: string) {
    await updateOpportunityStage(opportunity.id, stage)
    router.refresh()
  }

  async function handleSaveNextAction() {
    await updateOpportunity(opportunity.id, { next_action: nextAction, next_action_date: nextActionDate })
    router.refresh()
  }

  async function handleAddActivity(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await addActivity({ opportunity_id: opportunity.id, ...activityForm })
    setActivityOpen(false)
    setLoading(false)
    router.refresh()
  }

  const typeLabel = { b2c: 'B2C', b2b: 'B2B', reclutamiento: 'Reclutamiento' }[opportunity.type]

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Link href="/app/oportunidades">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-400 uppercase">{typeLabel}</span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${OPPORTUNITY_STAGE_COLORS[opportunity.stage]}`}>
              {OPPORTUNITY_STAGE_LABELS[opportunity.stage]}
            </span>
            {opportunity.commercial_risk && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${RISK_LEVEL_COLORS[opportunity.commercial_risk]}`}>
                <AlertTriangle className="h-3 w-3" />
                Riesgo {RISK_LEVEL_LABELS[opportunity.commercial_risk]}
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900">{opportunity.title}</h1>
          <div className="flex items-center gap-3 mt-1">
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
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/app/copiloto?opportunity_id=${opportunity.id}`}>
            <Button variant="outline" size="sm"><Bot className="h-4 w-4" />Preparar con IA</Button>
          </Link>
          <Dialog open={activityOpen} onOpenChange={setActivityOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4" />Registrar</Button>
            </DialogTrigger>
            <DialogContent title="Registrar actividad">
              <form onSubmit={handleAddActivity} className="space-y-4">
                <Select label="Tipo" value={activityForm.type} onValueChange={v => setActivityForm(p => ({ ...p, type: v }))} options={activityTypeOptions} />
                <Input label="Título *" value={activityForm.title} onChange={e => setActivityForm(p => ({ ...p, title: e.target.value }))} required />
                <Textarea label="Resultado" value={activityForm.outcome} onChange={e => setActivityForm(p => ({ ...p, outcome: e.target.value }))} rows={3} />
                <div className="flex justify-end">
                  <Button type="submit" loading={loading}>Guardar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Mover etapa</CardTitle></CardHeader>
            <CardContent>
              <Select value={opportunity.stage} onValueChange={handleStageChange} options={stageOptions} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-4 w-4" />Próxima acción</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input
                label="Acción"
                value={nextAction}
                onChange={e => setNextAction(e.target.value)}
                placeholder="Qué hay que hacer..."
              />
              <Input
                label="Fecha"
                type="date"
                value={nextActionDate}
                onChange={e => setNextActionDate(e.target.value)}
              />
              <Button variant="outline" size="sm" className="w-full" onClick={handleSaveNextAction}>
                Guardar próxima acción
              </Button>
            </CardContent>
          </Card>

          {opportunity.detected_need && (
            <Card>
              <CardHeader><CardTitle>Necesidad detectada</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{opportunity.detected_need}</p>
                {opportunity.suggested_product && (
                  <div className="mt-3 border-t border-gray-50 pt-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Producto sugerido</p>
                    <p className="text-sm text-gray-700">{opportunity.suggested_product}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {opportunity.probability != null && (
            <Card>
              <CardHeader><CardTitle>Probabilidad de cierre</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-[#1B3A6B]">{opportunity.probability}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-[#1B3A6B] h-2 rounded-full" style={{ width: `${opportunity.probability}%` }} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Historial de actividades</CardTitle></CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">Sin actividades</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {activities.map(act => (
                    <li key={act.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-[#1B3A6B]">{act.type.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 w-px bg-gray-100 mt-2" />
                      </div>
                      <div className="pb-4 min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{act.title}</p>
                          <span className="text-xs text-gray-400 shrink-0 ml-2">{formatRelativeDate(act.created_at)}</span>
                        </div>
                        {act.outcome && (
                          <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                            <p className="text-xs text-blue-800">{act.outcome}</p>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
