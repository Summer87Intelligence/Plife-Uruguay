import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getProfile } from '@/lib/auth'
import { getProposalById, type ProposalDetail } from '@/domains/proposals/queries'
import { ProposalDetailView } from '@/components/proposals/proposal-detail-view'
import { isDemoMode } from '@/lib/demo'
import { DEMO_PROPUESTAS } from '@/lib/demo/universe'

// FASE 15N — Detalle read-only de una propuesta guardada. Sin edición todavía.

export default async function PropuestaDetailPage({
  params,
}: {
  params: Promise<{ proposalId: string }>
}) {
  const { proposalId } = await params
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const proposal: ProposalDetail | null = isDemoMode()
    ? (DEMO_PROPUESTAS.find(p => p.id === proposalId) as ProposalDetail | undefined) ?? null
    : await getProposalById(proposalId)
  if (!proposal) notFound()

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/app/propuestas"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Propuestas
        </Link>
      </div>

      <ProposalDetailView proposal={proposal} />
    </div>
  )
}
