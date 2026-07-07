// FASE 14K — Foco operativo Lead-first en PLIFE Hoy.
// Server component de solo lectura: agrupa leads reales de Supabase dev y
// linkea al detalle. Ninguna acción muta datos desde acá.

import Link from 'next/link'
import {
  AlertTriangle,
  CalendarClock,
  Flame,
  HelpCircle,
  Repeat,
  Sparkles,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MockLead } from '@/domains/leads/mock-data'
import { getLeadStageLabel } from '@/domains/leads'
import { getLeadDashboardBuckets, getLeadDashboardSummary } from '@/domains/leads/dashboard'
import { LeadPriorityBadge } from './lead-priority-badge'
import { LeadTemperatureBadge } from './lead-temperature-badge'

const LIST_LIMIT = 5

function LeadCompactItem({ lead }: { lead: MockLead }) {
  return (
    <li>
      <Link
        href={`/app/leads/${lead.id}`}
        className="block rounded-lg border border-gray-100 bg-white px-3 py-2 transition-colors hover:border-[#1B3A6B]/30 hover:bg-gray-50"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-medium text-gray-900">{lead.title}</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
            {getLeadStageLabel(lead.pipeline_stage)}
          </span>
          <LeadTemperatureBadge temperature={lead.temperature} />
          <LeadPriorityBadge priority={lead.priority} />
        </div>
        {lead.next_action && (
          <p className="mt-1 text-xs text-gray-500">
            Próximo paso: {lead.next_action}
            {lead.next_action_date && ` · ${lead.next_action_date.slice(0, 10)}`}
          </p>
        )}
      </Link>
    </li>
  )
}

function LeadCompactList({
  title,
  icon: Icon,
  iconClassName,
  leads,
  emptyText,
}: {
  title: string
  icon: typeof AlertTriangle
  iconClassName: string
  leads: MockLead[]
  emptyText: string
}) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <Icon className={cn('h-3.5 w-3.5', iconClassName)} />
        {title}
        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
          {leads.length}
        </span>
      </h3>
      {leads.length === 0 ? (
        <p className="text-xs text-gray-400">{emptyText}</p>
      ) : (
        <ul className="space-y-1.5">
          {leads.slice(0, LIST_LIMIT).map((lead) => (
            <LeadCompactItem key={lead.id} lead={lead} />
          ))}
          {leads.length > LIST_LIMIT && (
            <li className="text-xs text-gray-400">
              +{leads.length - LIST_LIMIT} más en{' '}
              <Link href="/app/leads" className="text-[#1B3A6B] hover:underline">
                Leads
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

function SummaryStat({
  label,
  value,
  highlightClassName,
}: {
  label: string
  value: number
  highlightClassName: string
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2">
      <p className={cn('text-lg font-bold', value > 0 ? highlightClassName : 'text-gray-300')}>
        {value}
      </p>
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
    </div>
  )
}

export function LeadTodayPanel({ leads }: { leads: MockLead[] }) {
  const summary = getLeadDashboardSummary(leads)
  const buckets = getLeadDashboardBuckets(leads)

  return (
    <section className="rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3.5">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Target className="h-4 w-4 text-[#1B3A6B]" />
          Foco de leads
        </h2>
        <Link href="/app/leads" className="text-xs text-[#1B3A6B] hover:underline">
          Ver todos los leads
        </Link>
      </div>
      <p className="mb-3 text-xs text-gray-400">
        Lectura desde Supabase dev. Las acciones se gestionan desde el detalle del lead.
      </p>

      {summary.totalActive === 0 ? (
        <p className="text-sm text-gray-500">
          Todavía no hay leads activos.{' '}
          <Link href="/app/leads/new" className="text-[#1B3A6B] hover:underline">
            Creá el primero desde Leads.
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            <SummaryStat label="Nuevos" value={summary.newCount} highlightClassName="text-[#1B3A6B]" />
            <SummaryStat label="Vencidos" value={summary.overdueCount} highlightClassName="text-red-600" />
            <SummaryStat label="Para hoy" value={summary.todayCount} highlightClassName="text-amber-600" />
            <SummaryStat
              label="Sin próximo paso"
              value={summary.missingNextStepCount}
              highlightClassName="text-orange-600"
            />
            <SummaryStat label="Calientes" value={summary.hotCount} highlightClassName="text-red-600" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <LeadCompactList
              title="Vencidos"
              icon={AlertTriangle}
              iconClassName="text-red-500"
              leads={buckets.overdueLeads}
              emptyText="Sin seguimientos vencidos."
            />
            <LeadCompactList
              title="Para hoy"
              icon={CalendarClock}
              iconClassName="text-amber-500"
              leads={buckets.todayLeads}
              emptyText="Nada agendado para hoy."
            />
            <LeadCompactList
              title="Sin próximo paso"
              icon={HelpCircle}
              iconClassName="text-orange-500"
              leads={buckets.missingNextStepLeads}
              emptyText="Todos los leads tienen próximo paso."
            />
            <LeadCompactList
              title="Calientes"
              icon={Flame}
              iconClassName="text-red-500"
              leads={buckets.hotLeads}
              emptyText="Sin leads calientes por ahora."
            />
          </div>

          {(summary.newCount > 0 || summary.followUpCount > 0) && (
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
              {summary.newCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#1B3A6B]" />
                  {summary.newCount} lead{summary.newCount > 1 ? 's' : ''} nuevo
                  {summary.newCount > 1 ? 's' : ''} sin contactar
                </span>
              )}
              {summary.followUpCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Repeat className="h-3 w-3 text-[#1B3A6B]" />
                  {summary.followUpCount} en seguimiento
                </span>
              )}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
