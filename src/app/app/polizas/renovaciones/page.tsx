import { getUpcomingRenewals } from '@/domains/policies/mock-data'
import { RenewalsView } from './renewals-view'

export default function RenewalsPage() {
  const renewals = getUpcomingRenewals()
  return <RenewalsView renewals={renewals} />
}
