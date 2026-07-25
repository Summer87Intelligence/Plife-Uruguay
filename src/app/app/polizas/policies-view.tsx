'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { Plus, FileCheck, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'
import { PoliciesSubnav } from '@/components/policies/policies-subnav'
import { PolicyFormDialog } from '@/components/policies/policy-form-dialog'
import { POLICY_BOARD_COLUMNS, POLICY_STATUS_COLORS, POLICY_STATUS_LABELS } from '@/domains/policies/types'
import type { Policy, PolicyFormData, PolicyStatus } from '@/domains/policies/types'
import { filterPolicies, ALL_FILTER as ALL } from '@/domains/policies/filters'
import { isDemoMode } from '@/lib/demo'

interface PoliciesViewProps {
  initialPolicies: Policy[]
  renewalsMesCount: number
  pendingDocsCount: number
}

const CARD_LIMIT = 10
const OTHER_STATES_LIMIT = 12

let mockIdCounter = 1000

export function PoliciesView({ initialPolicies, renewalsMesCount, pendingDocsCount }: PoliciesViewProps) {
  const [policies, setPolicies] = useState(initialPolicies)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState(ALL)
  const [aseguradoraFiltro, setAseguradoraFiltro] = useState(ALL)
  const [ramoFiltro, setRamoFiltro] = useState(ALL)
  const [comercialFiltro, setComercialFiltro] = useState(ALL)
  const [vencimientoFiltro, setVencimientoFiltro] = useState(ALL)

  function handleCreate(data: PolicyFormData) {
    mockIdCounter += 1
    const now = new Date().toISOString().slice(0, 10)
    const newPolicy: Policy = {
      id: `mock-${mockIdCounter}`,
      policyNumber: null,
      companyName: data.companyName,
      contactName: data.contactName || null,
      insurerName: data.insurerName,
      branchName: data.branchName || '—',
      product: data.product || '—',
      status: 'borrador',
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      premium: data.premium ? Number(data.premium) : null,
      currency: 'UYU',
      commissionValue: null,
      commissionType: null,
      assignedToName: 'Vos',
      documents: [],
      nextAction: data.nextAction || null,
      nextActionDate: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
    }
    setPolicies(prev => [newPolicy, ...prev])
  }

  const estadoOptions = useMemo(() => {
    const presentes = Array.from(new Set(policies.map(p => p.status))) as PolicyStatus[]
    return [{ value: ALL, label: 'Todos los estados' }, ...presentes.map(s => ({ value: s, label: POLICY_STATUS_LABELS[s] }))]
  }, [policies])

  const aseguradoraOptions = useMemo(() => {
    const presentes = Array.from(new Set(policies.map(p => p.insurerName))).sort()
    return [{ value: ALL, label: 'Todas las aseguradoras' }, ...presentes.map(n => ({ value: n, label: n }))]
  }, [policies])

  const ramoOptions = useMemo(() => {
    const presentes = Array.from(new Set(policies.map(p => p.branchName))).sort()
    return [{ value: ALL, label: 'Todos los ramos' }, ...presentes.map(n => ({ value: n, label: n }))]
  }, [policies])

  const comercialOptions = useMemo(() => {
    const presentes = Array.from(new Set(policies.map(p => p.assignedToName))).sort()
    return [{ value: ALL, label: 'Todos los comerciales' }, ...presentes.map(n => ({ value: n, label: n }))]
  }, [policies])

  const vencimientoOptions = [
    { value: ALL, label: 'Cualquier vencimiento' },
    { value: 'vencidas', label: 'Ya vencidas' },
    { value: 'urgente', label: 'Próximos 7 días' },
    { value: 'mes', label: 'Próximos 30 días' },
    { value: 'trimestre', label: 'Próximos 90 días' },
  ]

  const filteredPolicies = useMemo(
    () => filterPolicies(policies, { search, estado: estadoFiltro, aseguradora: aseguradoraFiltro, ramo: ramoFiltro, comercial: comercialFiltro, vencimiento: vencimientoFiltro }),
    [policies, search, estadoFiltro, aseguradoraFiltro, ramoFiltro, comercialFiltro, vencimientoFiltro]
  )

  const hayFiltrosActivos = search.trim() !== '' || estadoFiltro !== ALL || aseguradoraFiltro !== ALL || ramoFiltro !== ALL || comercialFiltro !== ALL || vencimientoFiltro !== ALL

  const byStatus = POLICY_BOARD_COLUMNS.reduce((acc, col) => {
    acc[col.status] = filteredPolicies.filter(p => p.status === col.status)
    return acc
  }, {} as Record<string, Policy[]>)

  const otherStates = filteredPolicies.filter(p => !POLICY_BOARD_COLUMNS.some(c => c.status === p.status))
  const vigentesCount = policies.filter(p => p.status === 'vigente').length
  const aseguradorasCount = new Set(policies.map(p => p.insurerName)).size

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pólizas</h1>
          <p className="text-sm text-gray-500">Vigencia, renovaciones y documentación de las pólizas gestionadas para cada cliente.</p>
          {!isDemoMode() && (
            <p className="text-xs text-amber-600 mt-0.5">Prototipo visual — datos de ejemplo, sin conexión a la base de datos todavía.</p>
          )}
        </div>
        <Button variant="success" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Nueva póliza
        </Button>
      </div>

      <PoliciesSubnav />

      {/* Resumen de totales — siempre sobre la cartera completa, no la filtrada */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Pólizas en cartera', value: policies.length },
          { label: 'Vigentes', value: vigentesCount },
          { label: 'Aseguradoras', value: aseguradorasCount },
          { label: 'Renovaciones (próx. mes)', value: renewalsMesCount, href: '/app/polizas/renovaciones' },
          { label: 'Documentación pendiente', value: pendingDocsCount, href: '/app/polizas/documentacion' },
        ].map(stat => {
          const content = (
            <div className="rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm">
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{stat.value}</p>
            </div>
          )
          return stat.href
            ? <Link key={stat.label} href={stat.href as Route} className="hover:border-[#1B3A6B]/30 transition-colors rounded-xl">{content}</Link>
            : <div key={stat.label}>{content}</div>
        })}
      </div>

      {/* Búsqueda y filtros */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por empresa, número de póliza, contacto o producto…"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Select value={estadoFiltro} onValueChange={setEstadoFiltro} options={estadoOptions} />
          <Select value={aseguradoraFiltro} onValueChange={setAseguradoraFiltro} options={aseguradoraOptions} />
          <Select value={ramoFiltro} onValueChange={setRamoFiltro} options={ramoOptions} />
          <Select value={comercialFiltro} onValueChange={setComercialFiltro} options={comercialOptions} />
          <Select value={vencimientoFiltro} onValueChange={setVencimientoFiltro} options={vencimientoOptions} />
        </div>
        <p className="text-xs text-gray-500">
          Mostrando <span className="font-semibold text-gray-700">{filteredPolicies.length}</span> de {policies.length} pólizas
          {hayFiltrosActivos && (
            <button
              type="button"
              className="ml-2 text-[#1B3A6B] hover:underline"
              onClick={() => { setSearch(''); setEstadoFiltro(ALL); setAseguradoraFiltro(ALL); setRamoFiltro(ALL); setComercialFiltro(ALL); setVencimientoFiltro(ALL) }}
            >
              Limpiar filtros
            </button>
          )}
        </p>
      </div>

      {policies.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="Todavía no hay pólizas registradas"
          description="Cuando una aseguradora emita una póliza para un cliente, registrala acá para hacerle seguimiento de vigencia y renovación."
          action={<Button variant="success" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Nueva póliza</Button>}
        />
      ) : filteredPolicies.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Ningún resultado con estos filtros"
          description="Probá ajustar la búsqueda o limpiar los filtros aplicados."
        />
      ) : (
        <div className="overflow-x-auto -mx-6 px-6 pb-4">
          <div className="flex gap-4" style={{ minWidth: `${POLICY_BOARD_COLUMNS.length * 240}px` }}>
            {POLICY_BOARD_COLUMNS.map(col => (
              <div key={col.status} className="w-56 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${POLICY_STATUS_COLORS[col.status]}`}>
                    {col.label}
                  </span>
                  <span className="text-xs text-gray-400">{byStatus[col.status]?.length ?? 0}</span>
                </div>
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-0.5">
                  {(byStatus[col.status] ?? []).slice(0, CARD_LIMIT).map(policy => (
                    <PolicyCard key={policy.id} policy={policy} />
                  ))}
                  {(byStatus[col.status] ?? []).length === 0 && (
                    <div className="h-14 rounded-lg border-2 border-dashed border-gray-100 flex items-center justify-center">
                      <p className="text-xs text-gray-300">Sin pólizas en este estado</p>
                    </div>
                  )}
                  {(byStatus[col.status] ?? []).length > CARD_LIMIT && (
                    <p className="text-xs text-gray-400 text-center py-1.5">
                      +{(byStatus[col.status] ?? []).length - CARD_LIMIT} más — afiná la búsqueda para verlas
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {otherStates.length > 0 && (
        <div className="pt-2">
          <p className="text-xs font-medium text-gray-500 mb-2">Otros estados del ciclo de vida ({otherStates.length})</p>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-50">
              {otherStates.slice(0, OTHER_STATES_LIMIT).map(policy => (
                <li key={policy.id}>
                  <Link href={`/app/polizas/${policy.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{policy.companyName}</p>
                      <p className="text-xs text-gray-400">{policy.insurerName} · {policy.branchName}</p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${POLICY_STATUS_COLORS[policy.status]}`}>
                      {POLICY_STATUS_LABELS[policy.status]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {otherStates.length > OTHER_STATES_LIMIT && (
            <p className="text-xs text-gray-400 text-center py-1.5">
              +{otherStates.length - OTHER_STATES_LIMIT} más — usá el filtro de estado para verlas
            </p>
          )}
        </div>
      )}

      <PolicyFormDialog open={open} onOpenChange={setOpen} onSubmit={handleCreate} />
    </div>
  )
}

function PolicyCard({ policy }: { policy: Policy }) {
  return (
    <Link href={`/app/polizas/${policy.id}`} className="block rounded-lg bg-white border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-xs font-semibold text-gray-900 truncate">{policy.companyName}</p>
      <p className="text-xs text-gray-400 mt-0.5 truncate">{policy.insurerName} · {policy.branchName}</p>
      {policy.policyNumber && <p className="text-[10px] text-gray-400 mt-1">Nº {policy.policyNumber}</p>}
      <p className="text-[10px] text-gray-400 mt-0.5 truncate">{policy.assignedToName}</p>
      {policy.premium != null && (
        <p className="text-xs font-medium text-gray-700 mt-1">${policy.premium.toLocaleString('es-UY')} {policy.currency}</p>
      )}
      {policy.nextAction && (
        <div className="border-t border-gray-50 mt-1.5 pt-1.5">
          <p className="text-[10px] text-gray-400 truncate">{policy.nextAction}</p>
          {policy.nextActionDate && <p className="text-[10px] text-[#1B3A6B]/60 mt-0.5">{policy.nextActionDate}</p>}
        </div>
      )}
    </Link>
  )
}
