import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getProfile } from '@/lib/auth'
import { getMockLeadById } from '@/domains/leads/mock-data'
import { LeadDetailView } from '@/components/leads/lead-detail-view'

// FASE 14F — Detalle conceptual de lead con datos mock locales.
// Sin Supabase, sin server actions, sin persistencia.

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>
}) {
  const { leadId } = await params
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const lead = getMockLeadById(leadId)

  if (!lead) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
        <h1 className="text-xl font-bold text-gray-900">Lead demo no encontrado</h1>
        <p className="text-sm text-gray-500">
          El identificador <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{leadId}</code>{' '}
          no corresponde a ningún lead demo del catálogo local.
        </p>
        <Link
          href="/app/leads"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#1B3A6B] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Leads
        </Link>
      </div>
    )
  }

  return <LeadDetailView lead={lead} />
}
