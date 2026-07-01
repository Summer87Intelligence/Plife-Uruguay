'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Building2, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { B2B_STATUS_LABELS, B2B_STATUS_COLORS } from '@/lib/constants'
import { CompanyForm } from './company-form'
import type { Profile, Company } from '@/types/database'

interface CompaniesListProps {
  companies: Company[]
  profile: Profile
}

export function CompaniesList({ companies, profile }: CompaniesListProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = companies.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.industry?.toLowerCase().includes(q) || c.location?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Empresas B2B</h1>
          <p className="text-sm text-gray-500">Centralizá empresas, contactos, oportunidades y señales de potencial B2B.</p>
          <p className="text-xs text-gray-400 mt-0.5">Primero cargá empresas. Después asociá contactos y oportunidades.</p>
          <p className="text-xs text-gray-400 mt-0.5">{companies.length} empresas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Nueva empresa</Button>
          </DialogTrigger>
          <DialogContent title="Nueva empresa" description="Registrá los datos de la empresa">
            <CompanyForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar empresa, rubro, ubicación..."
          className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={search ? 'Sin resultados' : 'Todavía no cargaste empresas'}
          description={search ? 'Probá con otro término' : 'Empezá cargando una empresa para construir oportunidades comerciales.'}
          example={!search ? 'Cargá un estudio contable de 25 empleados y vinculá a su socio fundador como contacto clave.' : undefined}
          action={!search ? <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Nueva empresa</Button> : undefined}
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
                      {co.industry && <span className="text-xs text-gray-500">{co.industry}</span>}
                      {co.location && <span className="text-xs text-gray-400">{co.location}</span>}
                      {co.estimated_employees && <span className="text-xs text-gray-400">{co.estimated_employees} empleados</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {co.b2b_score != null && (
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-[#1B3A6B]">{co.b2b_score}</span>
                        <span className="text-[10px] text-gray-400">Potencial B2B</span>
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
