import { getMockPolicies, getUpcomingRenewals, getPendingDocumentation } from '@/domains/policies/mock-data'
import { PoliciesView } from './policies-view'

// Bloque UI-0 (prototipo visual): datos mock en memoria, sin Supabase todavía.
// Los totales de renovaciones/documentación se calculan con los mismos
// helpers que usan las pantallas dedicadas (nunca un número aparte).
export default function PoliciesPage() {
  const policies = getMockPolicies()
  const renewalsMes = getUpcomingRenewals().filter(r => r.daysToExpiry <= 30 && r.daysToExpiry >= -5).length
  const pendingDocs = getPendingDocumentation().length
  return <PoliciesView initialPolicies={policies} renewalsMesCount={renewalsMes} pendingDocsCount={pendingDocs} />
}
