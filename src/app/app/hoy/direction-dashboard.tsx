import Link from 'next/link'
import type { Route } from 'next'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { GettingStartedCard } from '@/components/onboarding/getting-started-card'
import { Users, Building2, TrendingUp, Megaphone, AlertCircle, Clock, Route as RouteIcon, ArrowRight } from 'lucide-react'
import { OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGE_COLORS, PIPELINE_STAGES } from '@/lib/constants'
import { formatRelativeDate } from '@/lib/utils'
import { isDemoMode } from '@/lib/demo'
import { FollowUpCenter } from '@/components/follow-up/follow-up-center'
import type { FollowUpOpp } from '@/components/follow-up/follow-up-center'
import type { Profile, Opportunity, OpportunityStage, Contact } from '@/types/database'

interface DirectionDashboardProps {
  /** FASE 14K — foco Lead-first renderizado por el server (LeadTodayPanel). */
  leadPanel?: React.ReactNode
  metrics: {
    totalOpps: number
    totalCompanies: number
    activeCampaigns: number
    activeAdvisors: number
  }
  recentOpps: Partial<Opportunity>[]
  stageCounts: Partial<Record<OpportunityStage, number>>
  globalOverdue: Partial<Contact>[]
  abandonedOpps: Partial<Opportunity>[]
  profile: Profile
  dirOverdueOpps: Partial<Opportunity>[]
  dirTodayOpps: Partial<Opportunity>[]
  dirNoNextStepOpps: Partial<Opportunity>[]
}

export function DirectionDashboard({ leadPanel, metrics, recentOpps, stageCounts, globalOverdue, abandonedOpps, dirOverdueOpps, dirTodayOpps, dirNoNextStepOpps }: DirectionDashboardProps) {
  const isEmpty = metrics.totalCompanies === 0 && metrics.totalOpps === 0 && metrics.activeCampaigns === 0
  const isDemo = isDemoMode()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Vista de Dirección</h1>
        <p className="text-sm text-gray-500 mt-0.5">Resumen del equipo: pipeline, alertas y acceso a herramientas de gestión.</p>
      </div>

      {leadPanel && (
        <div className="space-y-1">
          {leadPanel}
          <p className="text-[11px] text-gray-400">
            El nuevo foco Lead-first se muestra en paralelo al flujo vigente.
          </p>
        </div>
      )}

      {isDemo && (
        <Link href={'/app/demo' as Route} className="block">
          <div className="flex items-center gap-3 rounded-xl border border-[#1B3A6B]/15 bg-[#1B3A6B]/5 px-4 py-3 hover:bg-[#1B3A6B]/10 transition-colors">
            <RouteIcon className="h-5 w-5 text-[#1B3A6B] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1B3A6B]">Recorrido sugerido para la demo</p>
              <p className="text-xs text-[#1B3A6B]/70">Ocho pasos para mostrar el valor del sistema de punta a punta.</p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#1B3A6B] shrink-0" />
          </div>
        </Link>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Oportunidades activas" value={metrics.totalOpps} icon={TrendingUp} color="blue" />
        <StatCard title="Empresas B2B" value={metrics.totalCompanies} icon={Building2} color="purple" />
        <StatCard title="Campañas activas" value={metrics.activeCampaigns} icon={Megaphone} color="yellow" />
        <StatCard title="Asesores activos" value={metrics.activeAdvisors} icon={Users} color="green" />
      </div>

      {(isEmpty || (!isEmpty && isDemo)) && (
        <GettingStartedCard mode={isEmpty ? 'empty' : 'demo'} />
      )}

      <FollowUpCenter
        overdue={dirOverdueOpps as FollowUpOpp[]}
        today={dirTodayOpps as FollowUpOpp[]}
        missingNextStep={dirNoNextStepOpps as FollowUpOpp[]}
        stalled={abandonedOpps as FollowUpOpp[]}
      />

      {/* Alertas del equipo */}
      {(globalOverdue.length > 0 || abandonedOpps.length > 0) && (
        <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
          <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />Alertas del equipo
          </p>
          <div className="flex flex-wrap gap-2">
            {globalOverdue.length > 0 && (
              <Link href="/app/contactos" className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors">
                <AlertCircle className="h-3 w-3" />
                {globalOverdue.length} contacto{globalOverdue.length > 1 ? 's' : ''} sin seguimiento al día
              </Link>
            )}
            {abandonedOpps.length > 0 && (
              <Link href="/app/oportunidades" className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-200 transition-colors">
                <Clock className="h-3 w-3" />
                {abandonedOpps.length} oportunidad{abandonedOpps.length > 1 ? 'es' : ''} sin actividad reciente
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Pipeline por etapa */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pipeline por etapa</CardTitle>
              <p className="text-xs text-gray-400 mt-0.5">Dónde están hoy las oportunidades en el proceso comercial.</p>
            </div>
            <Link href="/app/oportunidades" className="text-xs text-[#1B3A6B] hover:underline">Ver pipeline completo</Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {PIPELINE_STAGES.map(stage => (
              <div key={stage} className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{stageCounts[stage] ?? 0}</p>
                <p className={`text-[10px] font-medium mt-1 leading-tight ${OPPORTUNITY_STAGE_COLORS[stage].replace('bg-', 'text-').split(' ')[1]}`}>
                  {OPPORTUNITY_STAGE_LABELS[stage]}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Oportunidades recientes</CardTitle>
              <Link href="/app/oportunidades" className="text-xs text-[#1B3A6B] hover:underline">Ver pipeline</Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentOpps.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">Sin oportunidades registradas</p>
            ) : (
              <ul className="space-y-2">
                {recentOpps.map(opp => (
                  <li key={opp.id}>
                    <Link href={`/app/oportunidades/${opp.id}`} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900 truncate">{opp.title}</p>
                      {opp.stage && (
                        <span className={`ml-3 shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${OPPORTUNITY_STAGE_COLORS[opp.stage]}`}>
                          {OPPORTUNITY_STAGE_LABELS[opp.stage]}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-red-500" />Seguimientos vencidos (global)</CardTitle>
          </CardHeader>
          <CardContent>
            {globalOverdue.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">Sin seguimientos vencidos en el equipo</p>
            ) : (
              <ul className="space-y-2">
                {globalOverdue.map(c => (
                  <li key={c.id}>
                    <Link href={`/app/contactos/${c.id}`} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.first_name} {c.last_name}</p>
                        <p className="text-xs text-gray-500 truncate">{c.next_action}</p>
                      </div>
                      <span className="text-xs text-red-600 shrink-0 ml-2">{c.next_action_date ? formatRelativeDate(c.next_action_date) : '—'}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {abandonedOpps.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700"><Clock className="h-4 w-4" />Oportunidades abandonadas (+7 días sin actividad)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {abandonedOpps.map(opp => (
                  <li key={opp.id}>
                    <Link href={`/app/oportunidades/${opp.id}`} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-orange-50 border border-orange-100">
                      <p className="text-sm text-gray-900 truncate">{opp.title}</p>
                      {opp.stage && (
                        <span className={`ml-2 shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${OPPORTUNITY_STAGE_COLORS[opp.stage]}`}>
                          {OPPORTUNITY_STAGE_LABELS[opp.stage]}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Accesos rápidos</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {([
                { href: '/app/direccion', label: 'Analytics', icon: TrendingUp },
                { href: '/app/radar-b2b', label: 'Radar B2B', icon: AlertCircle },
                { href: '/app/campanas', label: 'Campañas', icon: Megaphone },
                { href: '/app/admin', label: 'Admin', icon: Users },
              ] as const).map(item => (
                <Link key={item.href} href={item.href} className="flex items-center gap-2 rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                  <item.icon className="h-4 w-4 text-[#1B3A6B]" />
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
