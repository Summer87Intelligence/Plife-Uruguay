import type { Policy } from './types'

export const ALL_FILTER = 'all'

export interface PolicyFilterCriteria {
  search?: string
  estado?: string
  aseguradora?: string
  ramo?: string
  comercial?: string
  /** 'all' | 'vencidas' | 'urgente' (7d) | 'mes' (30d) | 'trimestre' (90d) */
  vencimiento?: string
}

export function daysToExpiryOf(policy: Policy, today: Date = new Date()): number | null {
  if (!policy.endDate) return null
  const base = new Date(today); base.setHours(0, 0, 0, 0)
  return Math.round((new Date(policy.endDate + 'T00:00:00').getTime() - base.getTime()) / 86_400_000)
}

/** Filtro puro (sin estado de React) — reutilizado por la UI de Pólizas y por los tests. */
export function filterPolicies(policies: Policy[], criteria: PolicyFilterCriteria, today: Date = new Date()): Policy[] {
  const q = (criteria.search ?? '').trim().toLowerCase()
  const estado = criteria.estado ?? ALL_FILTER
  const aseguradora = criteria.aseguradora ?? ALL_FILTER
  const ramo = criteria.ramo ?? ALL_FILTER
  const comercial = criteria.comercial ?? ALL_FILTER
  const vencimiento = criteria.vencimiento ?? ALL_FILTER

  return policies.filter(p => {
    if (estado !== ALL_FILTER && p.status !== estado) return false
    if (aseguradora !== ALL_FILTER && p.insurerName !== aseguradora) return false
    if (ramo !== ALL_FILTER && p.branchName !== ramo) return false
    if (comercial !== ALL_FILTER && p.assignedToName !== comercial) return false
    if (vencimiento !== ALL_FILTER) {
      const days = daysToExpiryOf(p, today)
      if (days === null) return false
      if (vencimiento === 'vencidas' && days >= 0) return false
      if (vencimiento === 'urgente' && (days < 0 || days > 7)) return false
      if (vencimiento === 'mes' && (days < 0 || days > 30)) return false
      if (vencimiento === 'trimestre' && (days < 0 || days > 90)) return false
    }
    if (q && !(
      p.companyName.toLowerCase().includes(q) ||
      (p.policyNumber ?? '').toLowerCase().includes(q) ||
      p.product.toLowerCase().includes(q) ||
      (p.contactName ?? '').toLowerCase().includes(q)
    )) return false
    return true
  })
}
