import { redirect } from 'next/navigation'
import { FlaskConical } from 'lucide-react'
import { getProfile } from '@/lib/auth'
import { MOCK_LEADS } from '@/domains/leads/mock-data'
import { LeadPipelineBoard } from '@/components/leads/lead-pipeline-board'

// FASE 14D — Tablero conceptual con datos mock locales.
// Sin queries a Supabase: la tabla `leads` no está aplicada todavía.

export default async function PipelinePage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pipeline</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Avance de cada lead por las etapas comerciales del modelo Lead-first.
        </p>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
        <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Pipeline conceptual con datos demo.</span> Todavía no
          modifica datos reales. El movimiento de etapas llega en fases posteriores.
        </p>
      </div>

      <LeadPipelineBoard leads={MOCK_LEADS} />
    </div>
  )
}
