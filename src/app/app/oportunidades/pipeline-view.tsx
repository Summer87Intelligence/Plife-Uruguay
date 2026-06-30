'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGE_COLORS, PIPELINE_STAGES } from '@/lib/constants'
import { OpportunityForm } from './opportunity-form'
import { updateOpportunityStage } from '@/domains/opportunities/actions'
import type { Profile, Opportunity, Contact, Company } from '@/types/database'

type OppWithRelations = Opportunity & {
  contact?: Pick<Contact, 'id' | 'first_name' | 'last_name'> | null
  company?: Pick<Company, 'id' | 'name'> | null
  assigned_profile?: { id: string; full_name: string } | null
}

interface PipelineViewProps {
  opportunities: OppWithRelations[]
  profile: Profile
}

export function PipelineView({ opportunities, profile }: PipelineViewProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'pipeline' | 'list'>('pipeline')

  const byStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = opportunities.filter(o => o.stage === stage)
    return acc
  }, {} as Record<string, OppWithRelations[]>)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500">{opportunities.length} oportunidades activas</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden">
            <button onClick={() => setView('pipeline')} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === 'pipeline' ? 'bg-[#1B3A6B] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Pipeline</button>
            <button onClick={() => setView('list')} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === 'list' ? 'bg-[#1B3A6B] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Lista</button>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Nueva oportunidad</Button>
            </DialogTrigger>
            <DialogContent title="Nueva oportunidad">
              <OpportunityForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Resumen visual por etapa */}
      <div className="flex flex-wrap gap-2">
        {PIPELINE_STAGES.map(stage => {
          const count = byStage[stage]?.length ?? 0
          if (count === 0) return null
          return (
            <span key={stage} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${OPPORTUNITY_STAGE_COLORS[stage]}`}>
              {OPPORTUNITY_STAGE_LABELS[stage]}
              <span className="font-bold">{count}</span>
            </span>
          )
        })}
      </div>

      {view === 'pipeline' ? (
        <div className="overflow-x-auto -mx-6 px-6 pb-4">
          <div className="flex gap-4" style={{ minWidth: `${PIPELINE_STAGES.length * 220}px` }}>
            {PIPELINE_STAGES.map(stage => (
              <div key={stage} className="w-52 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${OPPORTUNITY_STAGE_COLORS[stage]}`}>
                    {OPPORTUNITY_STAGE_LABELS[stage]}
                  </span>
                  <span className="text-xs text-gray-400">{byStage[stage]?.length ?? 0}</span>
                </div>
                <div className="space-y-2">
                  {(byStage[stage] ?? []).map(opp => (
                    <OppCard key={opp.id} opp={opp} />
                  ))}
                  {(byStage[stage] ?? []).length === 0 && (
                    <div className="h-16 rounded-lg border-2 border-dashed border-gray-100 flex items-center justify-center">
                      <p className="text-xs text-gray-300">Vacío</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {opportunities.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="Todavía no hay oportunidades"
              description="Convertí el interés de un contacto o empresa en una oportunidad y seguí su avance por el pipeline comercial."
              example="“Seguro de vida – Familia González”: detectaste la necesidad en una reunión y la movés de etapa hasta el cierre."
              action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Nueva oportunidad</Button>}
              className="py-12"
            />
          ) : (
            <ul className="divide-y divide-gray-50">
              {opportunities.map(opp => (
                <li key={opp.id}>
                  <Link href={`/app/oportunidades/${opp.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{opp.title}</p>
                      <p className="text-xs text-gray-500">
                        {opp.contact ? `${opp.contact.first_name} ${opp.contact.last_name}` : opp.company?.name ?? '—'}
                      </p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${OPPORTUNITY_STAGE_COLORS[opp.stage]}`}>
                      {OPPORTUNITY_STAGE_LABELS[opp.stage]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function OppCard({ opp }: { opp: OppWithRelations }) {
  return (
    <Link href={`/app/oportunidades/${opp.id}`} className="block rounded-lg bg-white border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-xs font-semibold text-gray-900 truncate">{opp.title}</p>
      <p className="text-xs text-gray-400 mt-1 truncate">
        {opp.contact ? `${opp.contact.first_name} ${opp.contact.last_name}` : opp.company?.name ?? '—'}
      </p>
      {opp.next_action && (
        <p className="text-[10px] text-gray-400 mt-1 truncate border-t border-gray-50 pt-1">{opp.next_action}</p>
      )}
    </Link>
  )
}
