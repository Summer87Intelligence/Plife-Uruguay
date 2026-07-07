import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Plus, Info } from 'lucide-react'
import { getProfile } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { PROPOSALS_SECTION } from '@/domains/proposals'

// FASE 15E — Propuestas (flujo conceptual/determinístico, sin persistencia).

export default async function PropuestasPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{PROPOSALS_SECTION.title}</h1>
          <p className="mt-0.5 text-sm text-gray-500 max-w-2xl">{PROPOSALS_SECTION.subtitle}</p>
        </div>
        <Button asChild>
          <Link href="/app/propuestas/nueva">
            <Plus className="h-4 w-4" />
            Nueva propuesta
          </Link>
        </Button>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-3.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Flujo conceptual en modo determinístico.</span>{' '}
          Los borradores usan los motores comerciales internos (sin OpenAI ni proveedores externos)
          y todavía no se guardan.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
          <FileText className="h-5 w-5 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-700">{PROPOSALS_SECTION.emptyState}</p>
        <p className="mt-1 text-sm text-gray-500">
          Empezá desde una idea y dejá que los motores ordenen el borrador.
        </p>
        <div className="mt-4 flex justify-center">
          <Button asChild variant="outline" size="sm">
            <Link href="/app/propuestas/nueva">
              <Plus className="h-4 w-4" />
              Crear borrador conceptual
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
