'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, TrendingUp, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import {
  OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGE_COLORS,
  PIPELINE_STAGES, RISK_LEVEL_LABELS, RISK_LEVEL_COLORS,
} from '@/lib/constants'
import { OpportunityForm } from './opportunity-form'
import type { Profile, Opportunity, Contact, Company, RiskLevel } from '@/types/database'

type OppWithRelations = Opportunity & {
  contact?: Pick<Contact, 'id' | 'first_name' | 'last_name'> | null
  company?: Pick<Company, 'id' | 'name'> | null
  assigned_profile?: { id: string; full_name: string } | null
}

const FILTER_SELECT = 'h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] cursor-pointer'

const TYPE_LABELS: Record<string, string> = {
  b2c: 'B2C – Persona',
  b2b: 'B2B – Empresa',
  reclutamiento: 'Reclutamiento',
}

interface PipelineViewProps {
  opportunities: OppWithRelations[]
  profile: Profile
}

export function PipelineView({ opportunities, profile }: PipelineViewProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'pipeline' | 'list'>('pipeline')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [riskFilter, setRiskFilter] = useState('')

  const filtered = useMemo(() => opportunities.filter(o => {
    if (typeFilter && o.type !== typeFilter) return false
    if (riskFilter && o.commercial_risk !== riskFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      o.title.toLowerCase().includes(q) ||
      (o.contact ? `${o.contact.first_name} ${o.contact.last_name}`.toLowerCase().includes(q) : false) ||
      (o.company?.name.toLowerCase().includes(q) ?? false)
    )
  }), [opportunities, typeFilter, riskFilter, search])

  const hasFilters = !!(search || typeFilter || riskFilter)

  const totalValue = useMemo(() =>
    filtered.reduce((sum, o) => sum + (o.estimated_value ?? 0), 0), [filtered])

  const byStage = useMemo(() => PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = filtered.filter(o => o.stage === stage)
    return acc
  }, {} as Record<string, OppWithRelations[]>), [filtered])

  const countLabel = hasFilters
    ? `${filtered.length} de ${opportunities.length} oportunidades`
    : `${opportunities.length} oportunidades`

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pipeline comercial</h1>
          <p className="text-sm text-gray-500">Visualizá el avance de cada conversación comercial desde el primer contacto hasta el cierre.</p>
          <p className="text-xs text-gray-400 mt-0.5">{countLabel}{totalValue > 0 ? ` · $${totalValue.toLocaleString('es-UY')} estimado` : ''}</p>
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

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por título, contacto o empresa..."
          className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={FILTER_SELECT}>
          <option value="">Todos los tipos</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className={FILTER_SELECT}>
          <option value="">Todos los riesgos</option>
          {Object.entries(RISK_LEVEL_LABELS).map(([v, l]) => (
            <option key={v} value={v}>Riesgo {l}</option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setTypeFilter(''); setRiskFilter('') }}
            className="h-8 px-3 text-xs text-gray-400 hover:text-gray-600 rounded-lg border border-gray-100 bg-white"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Resumen por etapa */}
      {filtered.length > 0 && (
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
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title={hasFilters ? 'Sin resultados para estos filtros' : 'Todavía no hay oportunidades'}
          description={
            hasFilters
              ? 'Probá ajustando los filtros o la búsqueda'
              : 'Convertí el interés de un contacto o empresa en una oportunidad y seguí su avance por el pipeline comercial.'
          }
          example={
            !hasFilters
              ? '"Seguro de vida – Familia González": detectaste la necesidad en una reunión y la movés de etapa hasta el cierre.'
              : undefined
          }
          action={
            !hasFilters
              ? <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Nueva oportunidad</Button>
              : undefined
          }
        />
      ) : view === 'pipeline' ? (
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
                    <div className="h-14 rounded-lg border-2 border-dashed border-gray-100 flex items-center justify-center">
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
          <ul className="divide-y divide-gray-50">
            {filtered.map(opp => (
              <li key={opp.id}>
                <Link href={`/app/oportunidades/${opp.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 truncate">{opp.title}</p>
                      {opp.commercial_risk && (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${RISK_LEVEL_COLORS[opp.commercial_risk]}`}>
                          Riesgo {RISK_LEVEL_LABELS[opp.commercial_risk]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-500">
                        {opp.contact ? `${opp.contact.first_name} ${opp.contact.last_name}` : opp.company?.name ?? '—'}
                      </span>
                      {opp.estimated_value != null && (
                        <span className="text-xs text-gray-400">${opp.estimated_value.toLocaleString('es-UY')}</span>
                      )}
                      {opp.next_action && (
                        <span className="text-xs text-[#1B3A6B] truncate">{opp.next_action}</span>
                      )}
                    </div>
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${OPPORTUNITY_STAGE_COLORS[opp.stage]}`}>
                    {OPPORTUNITY_STAGE_LABELS[opp.stage]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
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
      {opp.estimated_value != null && (
        <p className="text-xs font-medium text-gray-700 mt-1">${opp.estimated_value.toLocaleString('es-UY')}</p>
      )}
      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
        {opp.commercial_risk && (
          <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${RISK_LEVEL_COLORS[opp.commercial_risk as RiskLevel]}`}>
            {RISK_LEVEL_LABELS[opp.commercial_risk as RiskLevel]}
          </span>
        )}
        {opp.human_score != null && (
          <span className="text-[10px] text-gray-400">Valoración {opp.human_score}</span>
        )}
      </div>
      {opp.next_action && (
        <p className="text-[10px] text-gray-400 mt-1.5 truncate border-t border-gray-50 pt-1.5">{opp.next_action}</p>
      )}
    </Link>
  )
}
