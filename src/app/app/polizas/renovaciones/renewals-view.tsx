'use client'
import Link from 'next/link'
import { CalendarClock } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { PoliciesSubnav } from '@/components/policies/policies-subnav'
import { POLICY_STATUS_COLORS, POLICY_STATUS_LABELS } from '@/domains/policies/types'
import type { Policy } from '@/domains/policies/types'
import { isDemoMode } from '@/lib/demo'

interface RenewalsViewProps {
  renewals: (Policy & { daysToExpiry: number })[]
}

function urgencyBadge(days: number) {
  if (days < 0) return <span className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700">Vencida hace {Math.abs(days)}d</span>
  if (days <= 7) return <span className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700">En {days}d</span>
  if (days <= 30) return <span className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700">En {days}d</span>
  return <span className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">En {days}d</span>
}

export function RenewalsView({ renewals }: RenewalsViewProps) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Próximas renovaciones</h1>
        <p className="text-sm text-gray-500">Pólizas vigentes, por vencer o en renovación, ordenadas por urgencia.</p>
        {!isDemoMode() && <p className="text-xs text-amber-600 mt-0.5">Prototipo visual — datos de ejemplo.</p>}
      </div>

      <PoliciesSubnav />

      {renewals.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No hay renovaciones próximas" description="Las pólizas vigentes con fecha de vencimiento van a aparecer acá ordenadas por urgencia." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-50">
            {renewals.map(policy => (
              <li key={policy.id}>
                <Link href={`/app/polizas/${policy.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{policy.companyName}</p>
                    <p className="text-xs text-gray-500">{policy.insurerName} · {policy.branchName} · vence {policy.endDate}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${POLICY_STATUS_COLORS[policy.status]}`}>
                    {POLICY_STATUS_LABELS[policy.status]}
                  </span>
                  {urgencyBadge(policy.daysToExpiry)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
