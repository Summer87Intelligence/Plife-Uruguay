import { redirect } from 'next/navigation'
import { Database } from 'lucide-react'
import { getProfile } from '@/lib/auth'
import { getLeads } from '@/domains/leads/queries'
import { LeadPipelineBoard } from '@/components/leads/lead-pipeline-board'

// FASE 14H — Pipeline con lectura real desde Supabase dev (read-only).

export default async function PipelinePage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const leads = await getLeads()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pipeline</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Avance de cada lead por las etapas comerciales del modelo Lead-first.
        </p>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-3.5">
        <Database className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Pipeline conectado a Supabase dev en modo lectura.</span>{' '}
          Sin drag & drop ni cambios de etapa reales todavía.
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-sm font-medium text-gray-700">Todavía no hay leads en el pipeline.</p>
          <p className="mt-1 text-sm text-gray-500">
            Los leads reales visibles en dev se agruparán aquí por etapa.
          </p>
        </div>
      ) : (
        <LeadPipelineBoard leads={leads} />
      )}
    </div>
  )
}
