import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Route } from 'next'
import { FileText, Plus, Info, Inbox, Megaphone, Radar, PenLine } from 'lucide-react'
import { getProfile } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PROPOSALS_SECTION } from '@/domains/proposals'

// FASE 15E — Propuestas (flujo conceptual/determinístico, sin persistencia).
// FASE 15F — Las propuestas pueden nacer desde Lead, Campaña, Radar u observación manual.

const CREATE_FROM = [
  {
    icon: Inbox,
    label: 'Desde un Lead',
    description: 'Partí de un lead existente con su etapa e interés.',
    href: '/app/propuestas/nueva?source=lead',
  },
  {
    icon: Megaphone,
    label: 'Desde una Campaña',
    description: 'Reutilizá el segmento y objetivo de una campaña.',
    href: '/app/propuestas/nueva?source=campaign',
  },
  {
    icon: Radar,
    label: 'Desde Radar B2B',
    description: 'Explorá un nicho detectado en el radar (a validar).',
    href: '/app/propuestas/nueva?source=radar',
  },
  {
    icon: PenLine,
    label: 'Observación manual',
    description: 'Arrancá desde una idea propia sin origen previo.',
    href: '/app/propuestas/nueva?source=manual',
  },
] as const

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
          <span className="font-semibold">Una propuesta puede nacer desde un Lead, una Campaña, el Radar B2B o una observación manual.</span>{' '}
          El flujo es conceptual y determinístico (sin OpenAI ni proveedores externos) y todavía no se guarda.
        </p>
      </div>

      {/* Crear desde */}
      <section className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Crear desde</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CREATE_FROM.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.label} href={item.href as Route}>
                <Card className="border-gray-100 h-full transition-colors hover:border-[#1B3A6B]/30 hover:bg-gray-50">
                  <CardContent className="p-4 space-y-2">
                    <div className="h-9 w-9 rounded-lg bg-[#1B3A6B]/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-[#1B3A6B]" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

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
