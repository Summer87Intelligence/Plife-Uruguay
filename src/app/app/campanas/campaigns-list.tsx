'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { Plus, Megaphone, Search, ArrowRight, Building2, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { SearchNoResults } from '@/components/navigation/search-no-results'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { CampaignOperationalGuide } from '@/components/campaigns/campaign-operational-guide'
import { CAMPAIGN_STATUS_LABELS, CAMPAIGN_STATUS_COLORS } from '@/lib/constants'
import {
  suggestCampaignNextStep,
  campaignStatusHint,
  type CampaignLinkCounts,
} from '@/lib/campaign-operational'
import { formatDate } from '@/lib/utils'
import { CampaignForm } from './campaign-form'
import type { Profile, Campaign } from '@/types/database'

const FILTER_SELECT = 'h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] cursor-pointer'

interface CampaignsListProps {
  campaigns: Campaign[]
  profile: Profile
  linkCounts: Record<string, CampaignLinkCounts>
}

export function CampaignsList({ campaigns, profile, linkCounts }: CampaignsListProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const canManage = ['admin', 'direccion', 'lider_comercial'].includes(profile.role)

  const filtered = useMemo(() => campaigns.filter(c => {
    if (statusFilter && c.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.target_segment?.toLowerCase().includes(q) ?? false) ||
      (c.objective?.toLowerCase().includes(q) ?? false)
    )
  }), [campaigns, statusFilter, search])

  const hasFilters = !!(search || statusFilter)
  const countLabel = hasFilters
    ? `${filtered.length} de ${campaigns.length} campañas`
    : `${campaigns.filter(c => c.status === 'activa').length} activas · ${campaigns.length} en total`

  const active = filtered.filter(c => c.status === 'activa')
  const others = filtered.filter(c => c.status !== 'activa')

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Campañas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Organizá acciones comerciales por segmento u objetivo. Una campaña no envía mensajes automáticamente: ayuda a planificar, priorizar y convertir interés en oportunidades.
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{countLabel}</p>
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0"><Plus className="h-4 w-4" /> Nueva campaña</Button>
            </DialogTrigger>
            <DialogContent title="Nueva campaña" description="Definí el segmento, objetivo y mensaje inicial">
              <CampaignForm onSuccess={() => setOpen(false)} onCancel={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <CampaignOperationalGuide />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por campaña, segmento u objetivo"
          className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={FILTER_SELECT}>
          <option value="">Todos los estados</option>
          {Object.entries(CAMPAIGN_STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="h-8 px-3 text-xs text-[#1B3A6B] hover:underline rounded-lg border border-gray-100 bg-white"
          >
            Limpiar búsqueda
          </button>
        )}
        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setStatusFilter('') }}
            className="h-8 px-3 text-xs text-gray-400 hover:text-gray-600 rounded-lg border border-gray-100 bg-white"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={hasFilters ? 'No encontramos resultados para esta búsqueda.' : 'Todavía no hay campañas'}
          description={
            hasFilters
              ? undefined
              : canManage
                ? 'Creá una campaña para ordenar una acción comercial por segmento u objetivo.'
                : 'Las campañas las gestionan líderes comerciales. Consultá con tu equipo para ver las activas.'
          }
          example={
            !hasFilters
              ? 'Campaña "Dueños de pymes": definís segmento, objetivo y mensaje de apertura para guiar al equipo.'
              : undefined
          }
          action={
            hasFilters
              ? <SearchNoResults
                  onClearSearch={() => setSearch('')}
                  onClearFilters={() => { setSearch(''); setStatusFilter('') }}
                  hasFilters={!!statusFilter}
                />
              : canManage && !hasFilters
              ? <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Nueva campaña</Button>
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {active.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Activas</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {active.map(c => (
                  <CampaignCard
                    key={c.id}
                    campaign={c}
                    counts={linkCounts[c.id] ?? { companies: 0, opportunities: 0 }}
                  />
                ))}
              </div>
            </div>
          )}
          {others.length > 0 && (
            <div>
              {active.length > 0 && <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Otras</p>}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {others.map(c => (
                  <CampaignCard
                    key={c.id}
                    campaign={c}
                    counts={linkCounts[c.id] ?? { companies: 0, opportunities: 0 }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CampaignCard({
  campaign,
  counts,
}: {
  campaign: Campaign
  counts: CampaignLinkCounts
}) {
  const nextStep = suggestCampaignNextStep(campaign, counts)
  const statusHint = campaignStatusHint(campaign.status)
  const oppHref = counts.opportunities > 0
    ? `/app/oportunidades?q=${encodeURIComponent(campaign.name)}`
    : '/app/oportunidades'

  return (
    <article className="rounded-xl border border-gray-100 bg-white p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <Link
            href={`/app/campanas/${campaign.id}` as Route}
            className="font-semibold text-gray-900 hover:text-[#1B3A6B] truncate block"
          >
            {campaign.name}
          </Link>
          {campaign.objective && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{campaign.objective}</p>
          )}
          {campaign.target_segment && (
            <p className="text-xs text-gray-500 mt-0.5">Segmento: {campaign.target_segment}</p>
          )}
        </div>
        <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CAMPAIGN_STATUS_COLORS[campaign.status] ?? 'bg-gray-100 text-gray-700'}`}>
          {CAMPAIGN_STATUS_LABELS[campaign.status]}
        </span>
      </div>

      {statusHint && (
        <p className="text-[11px] text-gray-400">{statusHint}</p>
      )}

      <p className="text-xs text-gray-500">
        {counts.companies} empresa{counts.companies !== 1 ? 's' : ''} vinculada{counts.companies !== 1 ? 's' : ''}
        {' · '}
        {counts.opportunities} oportunidad{counts.opportunities !== 1 ? 'es' : ''} vinculada{counts.opportunities !== 1 ? 's' : ''}
      </p>

      {campaign.start_date && (
        <p className="text-xs text-gray-400">
          {formatDate(campaign.start_date)}{campaign.end_date ? ` → ${formatDate(campaign.end_date)}` : ' (sin fecha fin)'}
        </p>
      )}

      <div className="rounded-lg bg-amber-50/80 border border-amber-100 px-3 py-2">
        <p className="text-[11px] font-medium text-amber-900">Próximo paso sugerido</p>
        <p className="text-[11px] text-amber-800 mt-0.5">{nextStep}</p>
      </div>

      <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-50">
        <Link
          href={`/app/campanas/${campaign.id}` as Route}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#1B3A6B] hover:underline"
        >
          Ver campaña <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href={`/app/campanas/${campaign.id}` as Route}
          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#1B3A6B] hover:underline"
        >
          <Building2 className="h-3 w-3" /> Ver empresas
        </Link>
        <Link
          href={oppHref as Route}
          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#1B3A6B] hover:underline"
        >
          <TrendingUp className="h-3 w-3" /> Ver oportunidades
        </Link>
        <Link
          href="/app/oportunidades?nuevo=1"
          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#1B3A6B] hover:underline"
        >
          Crear oportunidad
        </Link>
      </div>
    </article>
  )
}
