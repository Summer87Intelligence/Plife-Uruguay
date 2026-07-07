import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getProfile } from '@/lib/auth'
import { ProposalCreateForm } from '@/components/proposals/proposal-create-form'

// FASE 15E — Nueva propuesta (mock/determinístico, sin persistencia ni server action).

export default async function NuevaPropuestaPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

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
        <h1 className="mt-1 text-xl font-bold text-gray-900">Nueva propuesta</h1>
        <p className="mt-0.5 text-sm text-gray-500 max-w-2xl">
          Cargá una idea y los motores comerciales generan un borrador conceptual. No se guarda
          ni usa proveedores externos; el resultado requiere validación humana.
        </p>
      </div>

      <ProposalCreateForm />
    </div>
  )
}
