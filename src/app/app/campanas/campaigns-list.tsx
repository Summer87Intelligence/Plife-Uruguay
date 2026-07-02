'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { Plus, Megaphone, Search, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { SearchNoResults } from '@/components/navigation/search-no-results'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { CAMPAIGN_STATUS_LABELS, CAMPAIGN_STATUS_COLORS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import { CampaignForm } from './campaign-form'
import type { Profile, Campaign } from '@/types/database'

const FILTER_SELECT = 'h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] cursor-pointer'

interface CampaignsListProps {
  campaigns: Campaign[]
  profile: Profile
}

export function CampaignsList({ campaigns, profile }: CampaignsListProps) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Campañas B2B</h1>
          <p className="text-sm text-gray-500">Las campañas sirven para organizar acciones comerciales por segmento u objetivo. No envían mensajes automáticamente: ayudan a planificar, priorizar y convertir respuestas en oportunidades.</p>
          <p className="text-xs text-gray-400 mt-0.5">{countLabel}</p>
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Nueva campaña</Button>
            </DialogTrigger>
            <DialogContent title="Nueva campaña" description="Definí el segmento, objetivo y mensaje inicial">
              <CampaignForm onSuccess={() => setOpen(false)} onCancel={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por campaña, segmento u objetivo"
          className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
        />
      </div>

      {/* Filtros */}
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
                ? 'Creá una campaña para organizar tus acciones comerciales por segmento.'
                : 'Las campañas las gestionan líderes comerciales. Consultá con tu equipo para ver las activas.'
          }
          example={
            !hasFilters
              ? 'Campaña "Dueños de pymes": definís el mensaje de apertura, el guion de llamada y la meta de reuniones del trimestre.'
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
                {active.map(c => <CampaignCard key={c.id} campaign={c} />)}
              </div>
            </div>
          )}
          {others.length > 0 && (
            <div>
              {active.length > 0 && <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Otras</p>}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {others.map(c => <CampaignCard key={c.id} campaign={c} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const convRate = campaign.total_targets > 0
    ? Math.round((campaign.total_converted / campaign.total_targets) * 100)
    : 0

  return (
    <Link href={`/app/campanas/${campaign.id}` as Route} className="block rounded-xl border border-gray-100 bg-white p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{campaign.name}</p>
          {campaign.target_segment && (
            <p className="text-xs text-gray-500 mt-0.5">{campaign.target_segment}</p>
          )}
        </div>
        <span className={`ml-2 shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CAMPAIGN_STATUS_COLORS[campaign.status] ?? 'bg-gray-100 text-gray-700'}`}>
          {CAMPAIGN_STATUS_LABELS[campaign.status]}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: 'Objetivo', value: campaign.total_targets },
          { label: 'Contactados', value: campaign.total_contacted },
          { label: 'Reuniones', value: campaign.total_meetings },
          { label: 'Cierres', value: campaign.total_converted },
        ].map(stat => (
          <div key={stat.label} className="rounded-lg bg-gray-50 p-2">
            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            <p className="text-[10px] text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {campaign.start_date && (
        <p className="text-xs text-gray-400 mt-3">
          {formatDate(campaign.start_date)}{campaign.end_date ? ` → ${formatDate(campaign.end_date)}` : ' (sin fecha fin)'}
        </p>
      )}
      {campaign.total_contacted === 0 && campaign.status === 'activa' && (
        <div className="mt-3 border-t border-gray-50 pt-2 flex items-start gap-1.5">
          <Info className="h-3 w-3 text-[#1B3A6B]/50 shrink-0 mt-0.5" />
          <p className="text-[11px] text-gray-400">Siguiente paso: revisá a qué empresas o contactos aplicar esta campaña y convertí respuestas en oportunidades.</p>
        </div>
      )}
    </Link>
  )
}
