import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getProfile } from '@/lib/auth'
import { LeadCreateForm } from '@/components/leads/lead-create-form'

// FASE 14E — Alta conceptual de lead. Sin persistencia: la tabla `leads`
// no está aplicada y no existen server actions para este módulo.

export default async function NewLeadPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <Link
          href="/app/leads"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Leads
        </Link>
        <h1 className="mt-2 text-xl font-bold text-gray-900">Nuevo lead</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Registrá el interés inicial. No hace falta empresa ni contacto para empezar.
        </p>
      </div>

      <LeadCreateForm />
    </div>
  )
}
