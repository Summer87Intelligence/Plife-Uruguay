import { getPendingDocumentation } from '@/domains/policies/mock-data'
import { PendingDocumentationView } from './pending-documentation-view'

export default function PendingDocumentationPage() {
  const policies = getPendingDocumentation()
  return <PendingDocumentationView policies={policies} />
}
