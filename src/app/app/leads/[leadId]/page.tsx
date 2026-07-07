import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getProfile } from '@/lib/auth'
import { getLeadById } from '@/domains/leads/queries'
import { LeadDetailView } from '@/components/leads/lead-detail-view'

// FASE 14L-B — Detalle con lectura y update operativo real desde Supabase dev.
// IA/compliance mock, conversión y descarte siguen deshabilitados.

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>
}) {
  const { leadId } = await params
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const lead = await getLeadById(leadId)

  if (!lead) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
        <h1 className="text-xl font-bold text-gray-900">Lead no encontrado o sin acceso</h1>
        <p className="text-sm text-gray-500">
          El identificador <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{leadId}</code>{' '}
          no corresponde a un lead visible en Supabase dev para tu usuario, o fue eliminado
          lógicamente.
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

  return <LeadDetailView lead={lead} dataSource="dev-readonly" />
}
