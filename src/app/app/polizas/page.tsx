import { getMockPolicies } from '@/domains/policies/mock-data'
import { PoliciesView } from './policies-view'

// Bloque UI-0 (prototipo visual): datos mock en memoria, sin Supabase todavía.
export default function PoliciesPage() {
  const policies = getMockPolicies()
  return <PoliciesView initialPolicies={policies} />
}
