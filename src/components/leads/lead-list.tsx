'use client'

import { useMemo, useState } from 'react'
import type { MockLead } from '@/domains/leads/mock-data'
import type { LeadPipelineStage, LeadPriority, LeadTemperature } from '@/domains/leads'
import {
  LEAD_PIPELINE_ORDER,
  LEAD_PIPELINE_STAGE_LABELS,
  LEAD_PRIORITY_LABELS,
  LEAD_TEMPERATURE_LABELS,
  sortLeadsByPipelineOrder,
} from '@/domains/leads'
import { LeadCard } from './lead-card'

type StageFilter = LeadPipelineStage | 'all'
type PriorityFilter = LeadPriority | 'all'
type TemperatureFilter = LeadTemperature | 'all'

const selectClass =
  'rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20'

export function LeadList({ leads }: { leads: MockLead[] }) {
  const [stage, setStage] = useState<StageFilter>('all')
  const [priority, setPriority] = useState<PriorityFilter>('all')
  const [temperature, setTemperature] = useState<TemperatureFilter>('all')

  const filtered = useMemo(() => {
    const result = leads.filter(
      (lead) =>
        (stage === 'all' || lead.pipeline_stage === stage) &&
        (priority === 'all' || lead.priority === priority) &&
        (temperature === 'all' || lead.temperature === temperature)
    )
    return sortLeadsByPipelineOrder(result)
  }, [leads, stage, priority, temperature])

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          className={selectClass}
          value={stage}
          onChange={(e) => setStage(e.target.value as StageFilter)}
          aria-label="Filtrar por etapa"
        >
          <option value="all">Todas las etapas</option>
          {LEAD_PIPELINE_ORDER.map((s) => (
            <option key={s} value={s}>
              {LEAD_PIPELINE_STAGE_LABELS[s]}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={priority}
          onChange={(e) => setPriority(e.target.value as PriorityFilter)}
          aria-label="Filtrar por prioridad"
        >
          <option value="all">Todas las prioridades</option>
          {(Object.keys(LEAD_PRIORITY_LABELS) as LeadPriority[]).map((p) => (
            <option key={p} value={p}>
              {LEAD_PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={temperature}
          onChange={(e) => setTemperature(e.target.value as TemperatureFilter)}
          aria-label="Filtrar por temperatura"
        >
          <option value="all">Todas las temperaturas</option>
          {(Object.keys(LEAD_TEMPERATURE_LABELS) as LeadTemperature[]).map((t) => (
            <option key={t} value={t}>
              {LEAD_TEMPERATURE_LABELS[t]}
            </option>
          ))}
        </select>

        <span className="ml-auto text-xs text-gray-400">
          {filtered.length} de {leads.length} leads demo
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
          Ningún lead demo coincide con los filtros seleccionados.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  )
}
