'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Building2, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { SearchNoResults } from '@/components/navigation/search-no-results'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { B2B_STATUS_LABELS, B2B_STATUS_COLORS } from '@/lib/constants'

const FILTER_SELECT = 'h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] cursor-pointer'
import { industryLabel } from '@/lib/industry-labels'
import { getCompanyPriority } from '@/lib/commercial-priority'
import { PriorityBadge } from '@/components/commercial/priority-badge'
import { CompanyForm } from './company-form'
import type { Profile, Company } from '@/types/database'

interface CompaniesListProps {
  companies: Company[]
  profile: Profile
}

export function CompaniesList({ companies, profile }: CompaniesListProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = companies.filter(c => {
    if (statusFilter && c.b2b_status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.industry?.toLowerCase().includes(q) || c.location?.toLowerCase().includes(q)
  })

  const hasFilters = !!(search || statusFilter)
  const countLabel = hasFilters
    ? `${filtered.length} de ${companies.length} empresas`
    : `${companies.length} empresas`

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Empresas B2B</h1>
          <p className="text-sm text-gray-500">Acá cargás organizaciones, negocios o clientes potenciales. Es el primer paso para ordenar el trabajo comercial.</p>
          <p className="text-xs text-gray-400 mt-0.5">Primero cargá empresas, después asociá contactos y oportunidades.</p>
          <p className="text-xs text-gray-400 mt-0.5">{countLabel}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Nueva empresa</Button>
          </DialogTrigger>
          <DialogContent title="Nueva empresa" description="Registrá los datos básicos de la empresa">
            <CompanyForm onSuccess={() => setOpen(false)} onCancel={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por empresa, rubro o ciudad"
          className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={FILTER_SELECT}>
          <option value="">Estado comercial: todos</option>
          {Object.entries(B2B_STATUS_LABELS).map(([v, l]) => (
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
          icon={hasFilters ? Search : Building2}
          title={hasFilters ? 'No encontramos empresas con esos filtros.' : 'Todavía no hay empresas cargadas.'}
          description={hasFilters ? 'Probá cambiar la búsqueda o limpiar filtros.' : 'Empezá creando una empresa para poder asociar contactos y oportunidades.'}
          example={!hasFilters ? 'Cargá un estudio contable de 25 empleados y vinculá a su socio fundador como contacto clave.' : undefined}
          action={
            hasFilters
              ? <SearchNoResults
                  onClearSearch={() => setSearch('')}
                  onClearFilters={() => { setSearch(''); setStatusFilter('') }}
                  hasFilters={!!statusFilter}
                />
              : <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Nueva empresa</Button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-50">
            {filtered.map(co => (
              <li key={co.id}>
                <Link href={`/app/empresas/${co.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{co.name}</p>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${B2B_STATUS_COLORS[co.b2b_status]}`}>
                        {B2B_STATUS_LABELS[co.b2b_status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {co.industry && <span className="text-xs text-gray-500">{industryLabel(co.industry) ?? co.industry}</span>}
                      {co.location && <span className="text-xs text-gray-400">{co.location}</span>}
                      {co.estimated_employees && <span className="text-xs text-gray-400">{co.estimated_employees} empleados</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {(() => { const p = getCompanyPriority(co); return p.label !== 'Baja' ? <PriorityBadge label={p.label} tone={p.tone} reason={p.reason} size="sm" /> : null })()}
                    {co.b2b_score != null && (
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-[#1B3A6B]">{co.b2b_score}</span>
                        <span className="text-[10px] text-gray-400">Potencial comercial</span>
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
