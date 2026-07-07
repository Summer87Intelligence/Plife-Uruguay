import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Database, Plus } from 'lucide-react'
import { getProfile } from '@/lib/auth'
import { getLeads } from '@/domains/leads/queries'
import { LeadFollowUpSummary } from '@/components/leads/lead-follow-up-summary'
import { LeadList } from '@/components/leads/lead-list'

// FASE 14L-B — Lectura real de leads y alta real en Supabase dev.
// Conversión, descarte y movimientos de pipeline siguen deshabilitados.

export default async function LeadsPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const leads = await getLeads()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Leads</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Entrada inicial de cualquier posible venta — persona, empresa o caso sin definir.
          </p>
        </div>
        <Link
          href="/app/leads/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1B3A6B] px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#2A5298]"
        >
          <Plus className="h-4 w-4" />
          Nuevo lead
          <span className="ml-1 rounded bg-white/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
            Dev
          </span>
        </Link>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-3.5">
        <Database className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Leads conectados a Supabase dev.</span> Creación real
          habilitada en Supabase dev. Conversión, descarte y movimientos de pipeline siguen
          deshabilitados.
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-sm font-medium text-gray-700">Todavía no hay leads reales cargados.</p>
          <p className="mt-1 text-sm text-gray-500">
            Cuando existan registros en dev visibles para tu usuario, aparecerán aquí.
          </p>
          <p className="mt-3 text-xs text-gray-400">
            Podés usar{' '}
            <Link href="/app/leads/new" className="text-[#1B3A6B] hover:underline">
              Nuevo lead
            </Link>{' '}
            para registrar tu primer lead real en dev.
          </p>
        </div>
      ) : (
        <>
          <LeadFollowUpSummary leads={leads} />
          <LeadList leads={leads} />
        </>
      )}
    </div>
  )
}
