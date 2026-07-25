import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { getProfile } from '@/lib/auth'
import { getLeads } from '@/domains/leads/queries'
import { LeadPipelineBoard } from '@/components/leads/lead-pipeline-board'
import { isDemoMode } from '@/lib/demo'
import { DEMO_LEADS } from '@/lib/demo/universe'

export default async function PipelinePage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const leads = isDemoMode() ? DEMO_LEADS : await getLeads()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pipeline</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Avance de cada lead por las etapas comerciales del modelo Lead-first.
          </p>
        </div>
        <Link
          href="/app/leads/new"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Nuevo lead
        </Link>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-sm font-medium text-gray-700">Todavía no hay leads en el pipeline.</p>
          <p className="mt-1 text-sm text-gray-500">
            Los leads que cargues se agruparán acá por etapa comercial.
          </p>
          <p className="mt-3 text-xs text-gray-400">
            <Link href="/app/leads/new" className="text-[#1B3A6B] hover:underline">
              Crear un lead
            </Link>{' '}
            para empezar.
          </p>
        </div>
      ) : (
        <LeadPipelineBoard leads={leads} />
      )}
    </div>
  )
}
