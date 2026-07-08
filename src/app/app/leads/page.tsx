import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { getProfile } from '@/lib/auth'
import { getLeads } from '@/domains/leads/queries'
import { LeadFollowUpSummary } from '@/components/leads/lead-follow-up-summary'
import { LeadList } from '@/components/leads/lead-list'

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
        </Link>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-sm font-medium text-gray-700">Todavía no hay leads cargados.</p>
          <p className="mt-1 text-sm text-gray-500">
            Cuando registres contactos comerciales, aparecerán acá para priorizar y hacer seguimiento.
          </p>
          <p className="mt-3 text-xs text-gray-400">
            Podés usar{' '}
            <Link href="/app/leads/new" className="text-[#1B3A6B] hover:underline">
              Nuevo lead
            </Link>{' '}
            para cargar el primero.
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
