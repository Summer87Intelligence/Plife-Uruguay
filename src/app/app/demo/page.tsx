import Link from 'next/link'
import type { Route } from 'next'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import {
  Radar, Building2, Sparkles, TrendingUp, CalendarClock,
  ShieldCheck, ClipboardList, BarChart3, ArrowRight, Route as RouteIcon,
} from 'lucide-react'

const DEMO_COMPANY = '/app/empresas/b0000000-0000-0000-0000-000000000002'
const DEMO_OPPORTUNITY = '/app/oportunidades/d0000000-0000-0000-0000-000000000004'

const steps = [
  { n: 1, icon: Radar, title: 'Ver empresas B2B priorizadas', desc: 'El Radar ordena las empresas por potencial comercial para enfocar el esfuerzo donde más rinde.', href: '/app/radar-b2b', cta: 'Abrir Radar B2B' },
  { n: 2, icon: Building2, title: 'Abrir una empresa', desc: 'Entrá a una empresa priorizada y revisá su inteligencia comercial: ángulo, contacto ideal y riesgo.', href: DEMO_COMPANY, cta: 'Abrir empresa demo' },
  { n: 3, icon: Sparkles, title: 'Analizar con IA', desc: 'El copiloto sugiere potencial, ángulo y próximo paso usando solo los datos cargados. Si la IA no está configurada, se muestra un estado claro.', href: DEMO_COMPANY, cta: 'Analizar empresa' },
  { n: 4, icon: TrendingUp, title: 'Crear una oportunidad', desc: 'Convertí el interés en una oportunidad concreta dentro del pipeline.', href: DEMO_OPPORTUNITY, cta: 'Ver oportunidad demo' },
  { n: 5, icon: CalendarClock, title: 'Preparar la reunión', desc: 'El copiloto arma objetivo, enfoque, preguntas y un mensaje sugerido para la reunión.', href: DEMO_OPPORTUNITY, cta: 'Preparar con IA' },
  { n: 6, icon: ShieldCheck, title: 'Revisar compliance', desc: 'Probá un mensaje riesgoso y mirá cómo el sistema lo bloquea y sugiere una versión segura.', href: '/app/compliance', cta: 'Abrir Compliance' },
  { n: 7, icon: ClipboardList, title: 'Registrar la actividad', desc: 'Cada interacción queda documentada en el timeline de la oportunidad y el contacto.', href: DEMO_OPPORTUNITY, cta: 'Ver timeline' },
  { n: 8, icon: BarChart3, title: 'Ver el impacto en Dirección', desc: 'El tablero de Dirección refleja pipeline, campañas, seguimientos vencidos y alertas comerciales.', href: '/app/hoy', cta: 'Ver tablero' },
]

export default async function DemoPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#1B3A6B] flex items-center justify-center">
          <RouteIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Recorrido sugerido para la demo</h1>
          <p className="text-sm text-gray-500">Ocho pasos para mostrar el valor comercial de PLIFE Growth OS de punta a punta.</p>
        </div>
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
        <p className="text-sm text-blue-800">
          Seguí los pasos en orden. Cada uno te lleva directo a la pantalla correspondiente. Los datos son de demostración.
        </p>
      </div>

      <div className="space-y-3">
        {steps.map(step => (
          <Card key={step.n}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B3A6B]/10 text-sm font-bold text-[#1B3A6B]">
                {step.n}
              </div>
              <div className="flex-1 min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <step.icon className="h-4 w-4 text-[#1B3A6B]" /> {step.title}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
              </div>
              <Link
                href={step.href as Route}
                className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-[#1B3A6B] px-3 py-2 text-xs font-medium text-white hover:bg-[#2A5298] transition-colors"
              >
                {step.cta} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
