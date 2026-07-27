import { notFound } from 'next/navigation'
import { getProfile } from '@/lib/auth'
import { getMockPolicyById } from '@/domains/policies/mock-data'
import { PolicyDetail } from './policy-detail'

// Bloque UI-0 (prototipo visual): la póliza es mock, pero el rol es real
// (reutiliza el sistema de auth existente) para probar la regla de
// visibilidad de comisión definida en docs/product/PLIFE-GESTION-POLIZAS-V1.md.
export default async function PolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const policy = getMockPolicyById(id)
  if (!policy) notFound()

  const profile = await getProfile()
  const canSeeCommission = profile?.role === 'admin' || profile?.role === 'direccion'

  return <PolicyDetail policy={policy} canSeeCommission={canSeeCommission} />
}
