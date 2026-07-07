import Link from 'next/link'
import type { Route } from 'next'
import { Building2, Users, TrendingUp, Megaphone, ArrowRight, Compass } from 'lucide-react'

const steps = [
  {
    n: 1,
    icon: Building2,
    title: 'Crear una empresa',
    desc: 'La empresa es la base del seguimiento comercial.',
    cta: 'Crear empresa',
    href: '/app/empresas' as Route,
  },
  {
    n: 2,
    icon: Users,
    title: 'Agregar un contacto',
    desc: 'El contacto es la persona real con la que va a hablar el asesor.',
    cta: 'Agregar contacto',
    href: '/app/contactos' as Route,
  },
  {
    n: 3,
    icon: TrendingUp,
    title: 'Crear una oportunidad',
    desc: 'La oportunidad representa una conversación comercial concreta.',
    cta: 'Crear oportunidad',
    href: '/app/oportunidades' as Route,
  },
  {
    n: 4,
    icon: Megaphone,
    title: 'Crear o revisar campañas',
    desc: 'Las campañas ordenan el trabajo comercial por segmento.',
    cta: 'Ver campañas',
    href: '/app/campanas' as Route,
  },
]

interface GettingStartedCardProps {
  mode?: 'empty' | 'demo'
}

export function GettingStartedCard({ mode = 'empty' }: GettingStartedCardProps) {
  return (
    <div className="rounded-xl border border-[#1B3A6B]/15 bg-[#1B3A6B]/[0.03] p-5">
      <div className="flex items-center gap-2 mb-1">
        <Compass className="h-4 w-4 text-[#1B3A6B] shrink-0" />
        <p className="text-sm font-semibold text-[#1B3A6B]">¿Por dónde empiezo?</p>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        {mode === 'demo'
          ? 'Estás viendo datos de ejemplo. En uso real, el sistema empieza cargando una empresa, un contacto y una oportunidad.'
          : 'Todavía no hay datos cargados. Empezá por estos pasos para activar el sistema.'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map(step => {
          const Icon = step.icon
          return (
            <div key={step.n} className="flex flex-col gap-2 rounded-lg bg-white border border-gray-100 p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1B3A6B]/10 text-[10px] font-bold text-[#1B3A6B]">
                  {step.n}
                </span>
                <p className="text-xs font-semibold text-gray-900 leading-snug">{step.title}</p>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug flex-1">{step.desc}</p>
              <Link
                href={step.href}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1B3A6B] hover:underline"
              >
                {step.cta} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
