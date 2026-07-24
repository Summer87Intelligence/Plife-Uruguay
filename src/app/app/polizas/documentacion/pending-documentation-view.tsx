'use client'
import Link from 'next/link'
import { FileWarning } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { PoliciesSubnav } from '@/components/policies/policies-subnav'
import { POLICY_STATUS_COLORS, POLICY_STATUS_LABELS } from '@/domains/policies/types'
import type { Policy } from '@/domains/policies/types'

interface PendingDocumentationViewProps {
  policies: Policy[]
}

export function PendingDocumentationView({ policies }: PendingDocumentationViewProps) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Documentación pendiente</h1>
        <p className="text-sm text-gray-500">Pólizas sin ningún documento registrado, o todavía esperando documentación para avanzar.</p>
        <p className="text-xs text-amber-600 mt-0.5">Prototipo visual — datos de ejemplo.</p>
      </div>

      <PoliciesSubnav />

      {policies.length === 0 ? (
        <EmptyState icon={FileWarning} title="No hay documentación pendiente" description="Cuando falte un documento en una póliza, va a aparecer acá." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-50">
            {policies.map(policy => (
              <li key={policy.id}>
                <Link href={`/app/polizas/${policy.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{policy.companyName}</p>
                    <p className="text-xs text-gray-500">{policy.insurerName} · {policy.branchName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {policy.documents.length === 0 ? 'Sin documentos registrados' : `${policy.documents.length} documento(s) registrados`}
                    </p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${POLICY_STATUS_COLORS[policy.status]}`}>
                    {POLICY_STATUS_LABELS[policy.status]}
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
