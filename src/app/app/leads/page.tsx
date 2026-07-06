import { redirect } from 'next/navigation'
import { FlaskConical, Plus } from 'lucide-react'
import { getProfile } from '@/lib/auth'
import { MOCK_LEADS } from '@/domains/leads/mock-data'
import { LeadFollowUpSummary } from '@/components/leads/lead-follow-up-summary'
import { LeadList } from '@/components/leads/lead-list'

// FASE 14D — Vista conceptual con datos mock locales.
// Sin queries a Supabase: la tabla `leads` no está aplicada todavía.

export default async function LeadsPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Leads</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Entrada inicial de cualquier posible venta — persona, empresa o caso sin definir.
          </p>
        </div>
        <button
          type="button"
          disabled
          title="Disponible en Fase 14E"
          className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-gray-100 px-3.5 py-2 text-sm font-medium text-gray-400"
        >
          <Plus className="h-4 w-4" />
          Nuevo lead
          <span className="ml-1 text-[10px] uppercase tracking-wide">Fase 14E</span>
        </button>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
        <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Vista conceptual con datos demo.</span> El módulo Leads
          todavía no está conectado a la base. Nada de lo que se muestra modifica datos reales.
        </p>
      </div>

      <LeadFollowUpSummary leads={MOCK_LEADS} />

      <LeadList leads={MOCK_LEADS} />
    </div>
  )
}
