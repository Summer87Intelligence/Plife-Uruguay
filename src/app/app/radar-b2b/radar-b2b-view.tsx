'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Radar, Plus, Search, Building2, TrendingUp, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { B2B_STATUS_LABELS, B2B_STATUS_COLORS } from '@/lib/constants'
import { CompanyForm } from '../empresas/company-form'
import { CompanyAIDialog } from '../empresas/[id]/company-ai'
import type { Profile, Company } from '@/types/database'

interface RadarB2BViewProps {
  companies: Company[]
  profile: Profile
}

export function RadarB2BView({ companies, profile }: RadarB2BViewProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = companies.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.industry?.toLowerCase().includes(q)
  })

  const byScore = {
    alto: filtered.filter(c => (c.b2b_score ?? 0) >= 70),
    medio: filtered.filter(c => (c.b2b_score ?? 0) >= 40 && (c.b2b_score ?? 0) < 70),
    bajo: filtered.filter(c => (c.b2b_score ?? 0) < 40),
    sinScore: filtered.filter(c => c.b2b_score == null),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Radar className="h-5 w-5 text-[#1B3A6B]" />
            Radar B2B
          </h1>
          <p className="text-sm text-gray-500">Empresas priorizadas por potencial B2B: enfocá el esfuerzo donde hay más oportunidad</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/copiloto">
            <Button variant="outline"><Bot className="h-4 w-4" /> Copiloto IA</Button>
          </Link>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Cargar empresa</Button>
            </DialogTrigger>
            <DialogContent title="Nueva empresa B2B" description="Cargá una empresa para el Radar">
              <CompanyForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-green-100 bg-green-50 p-4">
          <p className="text-xs font-medium text-green-700">Score alto (70+)</p>
          <p className="text-2xl font-bold text-green-800 mt-1">{byScore.alto.length}</p>
        </div>
        <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4">
          <p className="text-xs font-medium text-yellow-700">Score medio (40-69)</p>
          <p className="text-2xl font-bold text-yellow-800 mt-1">{byScore.medio.length}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-600">Sin score / bajo</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{byScore.bajo.length + byScore.sinScore.length}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar empresa o rubro..."
          className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Radar}
          title={search ? 'Sin resultados' : 'El radar está vacío'}
          description={search ? 'Probá con otro término o rubro' : 'Detectá y priorizá empresas con potencial comercial para enfocar el esfuerzo del equipo donde hay más oportunidad.'}
          example={!search ? 'Cargás una constructora en crecimiento y el radar te ayuda a priorizarla según su score B2B antes de contactarla.' : undefined}
          action={!search ? <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Cargar empresa</Button> : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(co => (
            <div key={co.id} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md transition-shadow">
              <Link href={`/app/empresas/${co.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-[#1B3A6B]/5 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-[#1B3A6B]" />
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
                    {co.estimated_employees ? <span className="text-xs text-gray-400">{co.estimated_employees} empleados</span> : null}
                    {co.opportunity_detected && (
                      <span className="text-xs text-[#1B3A6B] font-medium truncate">{co.opportunity_detected}</span>
                    )}
                  </div>
                  {co.commercial_angle && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">Ángulo: {co.commercial_angle}</p>
                  )}
                </div>
              </Link>
              <CompanyAIDialog company={co} />
              <div className="shrink-0 text-right">
                {co.b2b_score != null ? (
                  <div>
                    <div className={`inline-flex items-center justify-center h-10 w-10 rounded-full font-bold text-sm ${
                      co.b2b_score >= 70 ? 'bg-green-100 text-green-800' :
                      co.b2b_score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {co.b2b_score}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">Score B2B</p>
                  </div>
                ) : (
                  <span className="text-xs text-gray-300">Sin score</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
