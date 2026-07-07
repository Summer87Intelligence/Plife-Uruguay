import Link from 'next/link'
import type { Route } from 'next'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import {
  Radar, Building2, Sparkles, TrendingUp, Bot,
  ClipboardList, BarChart3, ArrowRight, Route as RouteIcon,
} from 'lucide-react'

const DEMO_COMPANY = '/app/empresas/b0000000-0000-0000-0000-000000000002'

const steps = [
  { n: 1, icon: BarChart3, title: 'PLIFE Hoy — el pulso del equipo', desc: 'El tablero muestra lo que importa hoy: seguimientos vencidos, reuniones pendientes y alertas del pipeline. El asesor empieza acá para priorizar su jornada.', href: '/app/hoy', cta: 'Ver PLIFE Hoy', value: 'Visibilidad inmediata del pipeline activo' },
  { n: 2, icon: Radar, title: 'Radar B2B — dónde enfocar el esfuerzo', desc: 'Las empresas aparecen ordenadas por potencial comercial. Con un vistazo sabés dónde hay más oportunidad sin revisar empresa por empresa.', href: '/app/radar-b2b', cta: 'Abrir Radar B2B', value: 'Priorización automática por potencial' },
  { n: 3, icon: Building2, title: 'Empresa priorizada — inteligencia comercial', desc: 'Revisá el ángulo de apertura, el contacto clave y la oportunidad detectada. Todo lo que necesitás para entrar preparado al primer contacto.', href: DEMO_COMPANY, cta: 'Abrir empresa demo', value: 'Contexto para preparar el primer contacto' },
  { n: 4, icon: TrendingUp, title: 'Oportunidades — seguimiento del pipeline', desc: 'El pipeline muestra cada oportunidad con su etapa, valor estimado y próxima acción. El asesor sabe en todo momento dónde está cada negocio y cuál es el paso siguiente.', href: '/app/oportunidades', cta: 'Ver pipeline', value: 'Gestión visual del ciclo de venta' },
  { n: 5, icon: ClipboardList, title: 'Campañas — esfuerzo comercial coordinado', desc: 'Las campañas organizan la prospección por segmento. Todos los asesores trabajan con el mismo mensaje, guion y métricas de conversión para el equipo completo.', href: '/app/campanas', cta: 'Ver Campañas', value: 'Coordinación y medición del equipo' },
  { n: 6, icon: Bot, title: 'Copiloto IA — asistencia controlada', desc: 'El copiloto sugiere pasos, mensajes y respuestas a objeciones. IA avanzada no configurada en esta demo — el sistema valida el flujo comercial antes de activar IA real.', href: '/app/copiloto', cta: 'Ver Copiloto IA', value: 'IA como apoyo del asesor, no como reemplazo' },
  { n: 7, icon: Sparkles, title: 'Dirección — resultados en tiempo real', desc: 'El módulo de Dirección consolida pipeline total, campañas activas, potencial promedio y seguimientos vencidos. El líder toma decisiones con datos actualizados.', href: '/app/direccion', cta: 'Ver Dirección', value: 'Gobernanza comercial sin reportes manuales' },
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
          <p className="text-sm text-gray-500">Siete pasos para mostrar el valor comercial de PLIFE Growth OS de punta a punta.</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-900 mb-2">Cómo probar esta demo</p>
        <p className="text-sm text-gray-600">
          Recorré las pantallas en orden. En cada paso fijate qué problema resuelve, qué decisión ayuda a tomar y qué parte potenciaría a un asesor o a Dirección.
        </p>
        <p className="text-xs text-gray-400 mt-2 border-t border-gray-100 pt-2">
          No hace falta conocer tecnología para probarla. La demo está pensada para validar si el flujo comercial se entiende.
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
                <p className="text-xs font-medium text-[#1B3A6B] mt-1.5">{step.value}</p>
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
