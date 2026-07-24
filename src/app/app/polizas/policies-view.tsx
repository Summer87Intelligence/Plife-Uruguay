'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, FileCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { PoliciesSubnav } from '@/components/policies/policies-subnav'
import { PolicyFormDialog } from '@/components/policies/policy-form-dialog'
import { POLICY_BOARD_COLUMNS, POLICY_STATUS_COLORS, POLICY_STATUS_LABELS } from '@/domains/policies/types'
import type { Policy, PolicyFormData } from '@/domains/policies/types'

interface PoliciesViewProps {
  initialPolicies: Policy[]
}

let mockIdCounter = 1000

export function PoliciesView({ initialPolicies }: PoliciesViewProps) {
  const [policies, setPolicies] = useState(initialPolicies)
  const [open, setOpen] = useState(false)

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

  const byStatus = POLICY_BOARD_COLUMNS.reduce((acc, col) => {
    acc[col.status] = policies.filter(p => p.status === col.status)
    return acc
  }, {} as Record<string, Policy[]>)

  const otherStates = policies.filter(p => !POLICY_BOARD_COLUMNS.some(c => c.status === p.status))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pólizas</h1>
          <p className="text-sm text-gray-500">Vigencia, renovaciones y documentación de las pólizas gestionadas para cada cliente.</p>
          <p className="text-xs text-amber-600 mt-0.5">Prototipo visual — datos de ejemplo, sin conexión a la base de datos todavía.</p>
        </div>
        <Button variant="success" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Nueva póliza
        </Button>
      </div>

      <PoliciesSubnav />

      {policies.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="Todavía no hay pólizas registradas"
          description="Cuando una aseguradora emita una póliza para un cliente, registrala acá para hacerle seguimiento de vigencia y renovación."
          action={<Button variant="success" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Nueva póliza</Button>}
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
                <div className="space-y-2">
                  {(byStatus[col.status] ?? []).map(policy => (
                    <PolicyCard key={policy.id} policy={policy} />
                  ))}
                  {(byStatus[col.status] ?? []).length === 0 && (
                    <div className="h-14 rounded-lg border-2 border-dashed border-gray-100 flex items-center justify-center">
                      <p className="text-xs text-gray-300">Sin pólizas en este estado</p>
                    </div>
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
              {otherStates.map(policy => (
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
