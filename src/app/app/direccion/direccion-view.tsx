import Link from 'next/link'
import type { Route } from 'next'
import { SectionGuideCard } from '@/components/guidance/section-guide-card'
import { GettingStartedCard } from '@/components/onboarding/getting-started-card'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Users, Building2, TrendingUp, Megaphone, Activity, Target, AlertCircle, Clock, FileCheck2, FileText, CalendarClock, FileWarning, PieChart, UserCheck, Layers, ShieldCheck } from 'lucide-react'
import { OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGE_COLORS, PIPELINE_STAGES } from '@/lib/constants'
import { formatRelativeDate } from '@/lib/utils'
import { calcularScoreB2B, nivelColor, nivelLabel } from '@/lib/b2b/scoring'
import { ICP_NOMBRES } from '@/lib/b2b/icp'
import { POLICY_STATUS_LABELS, POLICY_ORIGIN_LABELS } from '@/domains/policies/types'
import type { Company } from '@/types/database'
import type { getExecutiveAlertsDemo, getDireccionMetricsDemo } from '@/lib/demo/universe'

type TopB2BOpp = {
  id: string
  title: string
  stage: string
  estimated_value: number | null
  next_action: string | null
  company: Pick<Company, 'id' | 'name' | 'industry' | 'b2b_score' | 'estimated_employees'> | null
  assigned_profile: { full_name: string } | null
}

type DireccionMetricsDemo = ReturnType<typeof getDireccionMetricsDemo>
type ExecutiveAlert = ReturnType<typeof getExecutiveAlertsDemo>[number]

interface DireccionViewProps {
  metrics: { totalOpps: number; totalContacts: number; totalCompanies: number; activeCampaigns: number }
  stageCounts: Record<string, number>
  recentActivities: Array<{ id: string; type: string; title: string; created_at: string; created_by_profile?: { full_name: string } | null }>
  topB2BOpps: TopB2BOpp[]
  focusMetrics: { overdueOpps: number; noNextActionOpps: number }
  /** Solo disponible en modo demo: cartera, aseguradoras, propuestas y alertas ejecutivas. */
  portfolio?: {
    totalPolicies: number
    vigentPolicies: number
    openProposals: number
    renovacionesDelMes: number
    documentacionPendiente: number
    primaAnualAdministrada: number
    comisionEstimadaTotal: number
    porEstado: DireccionMetricsDemo['porEstado']
    porOrigen: DireccionMetricsDemo['porOrigen']
    registrosIncompletos: number
    carteraPorEjecutivo: DireccionMetricsDemo['carteraPorEjecutivo']
    renovacionesPorUrgencia: DireccionMetricsDemo['renovacionesPorUrgencia']
    propuestasPorEstado: DireccionMetricsDemo['propuestasPorEstado']
    totalLeadsActivos: number
    oportunidadesGanadas: number
    oportunidadesPerdidas: number
    propuestasVigentes: number
    propuestasAprobadas: number
    propuestasRechazadas: number
  }
  executiveAlerts?: readonly ExecutiveAlert[]
  isDemoData?: boolean
}

const PROPOSAL_STATUS_LABELS_DIRECCION: Record<string, string> = {
  draft: 'Borrador', in_review: 'En revisión', ready: 'Lista', used: 'Aprobada', archived: 'Rechazada',
}

const UYU = new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 })

const ALERT_SEVERITY_STYLES: Record<ExecutiveAlert['severity'], string> = {
  alta: 'border-red-100 bg-red-50 text-red-700',
  media: 'border-amber-100 bg-amber-50 text-amber-700',
  baja: 'border-gray-100 bg-gray-50 text-gray-500',
}

export function DireccionView({ metrics, stageCounts, recentActivities, topB2BOpps, focusMetrics, portfolio, executiveAlerts, isDemoData = false }: DireccionViewProps) {
  const maxStageCount = Math.max(...PIPELINE_STAGES.map(s => stageCounts[s] ?? 0), 1)
  const totalPipelineLeads = PIPELINE_STAGES.reduce((sum, stage) => sum + (stageCounts[stage] ?? 0), 0)
  const isCommerciallyEmpty =
    metrics.totalOpps === 0 &&
    metrics.totalContacts === 0 &&
    metrics.totalCompanies === 0 &&
    metrics.activeCampaigns === 0
  const maxEstado = portfolio ? Math.max(...Object.values(portfolio.porEstado), 1) : 1

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900">Dirección</h1>
          {isDemoData && <Badge variant="secondary">Datos de demostración</Badge>}
        </div>
        <p className="text-sm text-gray-500">Vista ejecutiva de cómo está funcionando PLIFE: cartera, seguimiento comercial y prioridades.</p>
      </div>

      <SectionGuideCard
        title="Cómo usar esta vista"
        description="Revisá métricas del equipo e identificá alertas de seguimiento. Operá desde Leads, Pipeline y Propuestas."
        primaryActionLabel="Ver leads"
        primaryActionHref="/app/leads"
        compact
      />

      {/* Alertas ejecutivas */}
      {executiveAlerts && executiveAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[#1B3A6B]" />
              Alertas ejecutivas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {executiveAlerts.map(alert => (
                <Link
                  key={alert.id}
                  href={alert.href as Route}
                  className={`rounded-lg border px-3 py-2.5 transition-colors hover:opacity-80 ${ALERT_SEVERITY_STYLES[alert.severity]}`}
                >
                  <p className="text-sm font-semibold">{alert.title}</p>
                  <p className="mt-0.5 text-xs opacity-80">{alert.detail}</p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Foco comercial */}
      {(focusMetrics.overdueOpps > 0 || focusMetrics.noNextActionOpps > 0) && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3.5">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Foco comercial del equipo</h2>
          <div className="flex flex-wrap gap-2">
            {focusMetrics.overdueOpps > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700">
                <AlertCircle className="h-3 w-3" />
                {focusMetrics.overdueOpps} seguimiento{focusMetrics.overdueOpps > 1 ? 's' : ''} vencido{focusMetrics.overdueOpps > 1 ? 's' : ''}
              </span>
            )}
            {focusMetrics.noNextActionOpps > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-medium text-orange-700">
                <Clock className="h-3 w-3" />
                {focusMetrics.noNextActionOpps} registro{focusMetrics.noNextActionOpps > 1 ? 's' : ''} sin próximo paso
              </span>
            )}
          </div>
        </div>
      )}

      {isCommerciallyEmpty && <GettingStartedCard />}

      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Empresas en cartera B2B" value={metrics.totalCompanies} icon={Building2} color="green" />
        <StatCard
          title="Oportunidades totales"
          value={metrics.totalOpps}
          subtitle={portfolio ? `${portfolio.oportunidadesGanadas} ganadas · ${portfolio.oportunidadesPerdidas} perdidas (histórico)` : undefined}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard title="Contactos" value={metrics.totalContacts} icon={Users} color="purple" />
        <StatCard title="Campañas activas" value={metrics.activeCampaigns} icon={Megaphone} color="yellow" />
        {portfolio && <StatCard title="Leads activos" value={portfolio.totalLeadsActivos} icon={Users} color="purple" />}
      </div>

      {portfolio && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Pólizas vigentes" value={portfolio.vigentPolicies} subtitle={`${portfolio.totalPolicies} pólizas en cartera en total`} icon={FileCheck2} color="green" />
          <StatCard
            title="Propuestas vigentes"
            value={portfolio.propuestasVigentes}
            subtitle={`${portfolio.propuestasAprobadas} aprobadas · ${portfolio.propuestasRechazadas} rechazadas (histórico)`}
            icon={FileText}
            color="blue"
          />
          <StatCard title="Renovaciones (próximo mes)" value={portfolio.renovacionesDelMes} subtitle="Mismo criterio que Pólizas — próximos 30 días" icon={CalendarClock} color="yellow" />
          <StatCard title="Documentación pendiente" value={portfolio.documentacionPendiente} icon={FileWarning} color="red" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline por etapa */}
        {totalPipelineLeads > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Distribución del Pipeline</CardTitle>
              <Link href="/app/pipeline" className="text-xs text-[#1B3A6B] hover:underline">Ver pipeline</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PIPELINE_STAGES.map(stage => {
                const count = stageCounts[stage] ?? 0
                const pct = Math.round((count / maxStageCount) * 100)
                return (
                  <div key={stage} className="flex items-center gap-3">
                    <p className="text-xs text-gray-600 w-36 shrink-0">{OPPORTUNITY_STAGE_LABELS[stage]}</p>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-[#1B3A6B] h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-5 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pipeline comercial</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 text-center py-6">
              Todavía no hay oportunidades ni leads en seguimiento. Empezá cargando un lead desde{' '}
              <Link href="/app/leads/new" className="text-[#1B3A6B] hover:underline">
                Leads
              </Link>
              .
            </p>
          </CardContent>
        </Card>
        )}

        {/* Actividad reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#1B3A6B]" />
              Actividad reciente del equipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Sin actividad reciente</p>
            ) : (
              <ul className="space-y-3">
                {recentActivities.map(act => (
                  <li key={act.id} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#1B3A6B] shrink-0 mt-1.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{act.title}</p>
                      <p className="text-xs text-gray-400">
                        {act.created_by_profile?.full_name ?? 'Asesor'} · {formatRelativeDate(act.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {portfolio && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribución por estado de póliza */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-[#1B3A6B]" />
                Pólizas por estado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(portfolio.porEstado)
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => (
                    <div key={status} className="flex items-center gap-3">
                      <p className="text-xs text-gray-600 w-32 shrink-0 truncate">{POLICY_STATUS_LABELS[status as keyof typeof POLICY_STATUS_LABELS] ?? status}</p>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-[#1B3A6B] h-2 rounded-full transition-all"
                          style={{ width: `${Math.round((count / maxEstado) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 w-8 text-right">{count}</span>
                    </div>
                  ))}
              </div>
              <p className="mt-3 text-xs text-gray-400">
                {portfolio.totalPolicies} pólizas en total — cartera especializada en vida individual Mapfre.
              </p>
            </CardContent>
          </Card>

          {/* Actividad y capacidad de seguimiento por comercial */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-[#1B3A6B]" />
                Capacidad de seguimiento del equipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {portfolio.carteraPorEjecutivo.map(c => (
                  <li key={c.comercial} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.comercial}</p>
                      <p className="text-xs text-gray-400">{c.empresas} empresas · {c.polizas} pólizas · {c.oportunidadesAbiertas} oport. abiertas</p>
                    </div>
                    {c.seguimientosVencidos > 0 ? (
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
                        <Clock className="h-3 w-3" />
                        {c.seguimientosVencidos} vencido{c.seguimientosVencidos > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="shrink-0 text-[11px] font-medium text-green-600">Al día</span>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {portfolio && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Distribución por origen: cartera heredada vs. originada en el CRM */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Layers className="h-4 w-4 text-[#1B3A6B]" />
                Pólizas por origen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(portfolio.porOrigen)
                  .sort((a, b) => b[1] - a[1])
                  .map(([origin, count]) => (
                    <div key={origin} className="flex items-center gap-2">
                      <p className="text-xs text-gray-600 w-24 shrink-0 truncate">{POLICY_ORIGIN_LABELS[origin as keyof typeof POLICY_ORIGIN_LABELS] ?? origin}</p>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-[#1B3A6B] h-1.5 rounded-full transition-all" style={{ width: `${Math.round((count / Math.max(...Object.values(portfolio.porOrigen), 1)) * 100)}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 w-7 text-right">{count}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Propuestas por estado (vigentes + histórico) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-[#1B3A6B]" />
                Propuestas por estado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(portfolio.propuestasPorEstado)
                  .sort((a, b) => b[1] - a[1])
                  .map(([estado, count]) => (
                    <div key={estado} className="flex items-center gap-2">
                      <p className="text-xs text-gray-600 w-24 shrink-0 truncate">{PROPOSAL_STATUS_LABELS_DIRECCION[estado] ?? estado}</p>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-[#1B3A6B] h-1.5 rounded-full transition-all" style={{ width: `${Math.round((count / Math.max(...Object.values(portfolio.propuestasPorEstado), 1)) * 100)}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 w-7 text-right">{count}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Renovaciones por nivel de urgencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <CalendarClock className="h-4 w-4 text-[#1B3A6B]" />
                Renovaciones por urgencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: 'Crítica (≤7 días)', value: portfolio.renovacionesPorUrgencia.critica, className: 'bg-red-500' },
                  { label: 'Próximo mes (8-30 días)', value: portfolio.renovacionesPorUrgencia.proximoMes, className: 'bg-orange-400' },
                  { label: 'Seguimiento (31-60 días)', value: portfolio.renovacionesPorUrgencia.seguimiento60, className: 'bg-gray-300' },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-2">
                    <p className="text-xs text-gray-600 w-32 shrink-0">{row.label}</p>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div className={`${row.className} h-1.5 rounded-full transition-all`} style={{ width: `${Math.round((row.value / Math.max(portfolio.renovacionesPorUrgencia.critica, portfolio.renovacionesPorUrgencia.proximoMes, portfolio.renovacionesPorUrgencia.seguimiento60, 1)) * 100)}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-7 text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {portfolio && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calidad de datos de la cartera */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#1B3A6B]" />
                Calidad de datos de la cartera
              </CardTitle>
            </CardHeader>
            <CardContent>
              {portfolio.totalPolicies === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Sin pólizas registradas todavía.</p>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900">{portfolio.totalPolicies - portfolio.registrosIncompletos}</p>
                    <p className="text-sm text-gray-500">de {portfolio.totalPolicies} registros completos</p>
                  </div>
                  {portfolio.registrosIncompletos > 0 && (
                    <p className="mt-2 text-xs text-amber-600">
                      {portfolio.registrosIncompletos} póliza{portfolio.registrosIncompletos === 1 ? '' : 's'} con datos pendientes de completar — ver detalle en la ficha de cada una.
                    </p>
                  )}
                </>
              )}
              <p className="mt-3 text-xs text-gray-400">Nunca se completa un dato faltante con un valor inventado.</p>
            </CardContent>
          </Card>

          {/* Ingresos administrados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#1B3A6B]" />
                Ingresos bajo gestión
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">{UYU.format(portfolio.primaAnualAdministrada)}</p>
                <p className="text-xs text-gray-500">Prima anual administrada — suma de pólizas vigentes, por vencer y en renovación.</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700">{UYU.format(portfolio.comisionEstimadaTotal)}</p>
                <p className="text-xs text-gray-500">Comisión estimada sobre esa misma cartera activa.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top oportunidades B2B */}
      {topB2BOpps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[#1B3A6B]" />
              Top oportunidades B2B activas
            </CardTitle>
            <CardDescription>Montos en valor estimado de la oportunidad (UYU), no facturado.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topB2BOpps.map(opp => {
                const companyScore = opp.company ? calcularScoreB2B(opp.company as Company) : null
                return (
                  <div key={opp.id} className="flex items-center gap-4 rounded-xl border border-gray-100 p-3">
                    {companyScore && (
                      <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold ${nivelColor(companyScore.nivel)}`}>
                        {companyScore.score}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{opp.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {opp.company && (
                          <span className="text-xs text-gray-500">{opp.company.name}</span>
                        )}
                        {companyScore && (
                          <span className="text-[10px] text-[#1B3A6B]">{ICP_NOMBRES[companyScore.icpSugerido]}</span>
                        )}
                        {opp.assigned_profile && (
                          <span className="text-[10px] text-gray-400">{opp.assigned_profile.full_name}</span>
                        )}
                      </div>
                      {opp.next_action && (
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">Próximo: {opp.next_action}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${OPPORTUNITY_STAGE_COLORS[opp.stage as keyof typeof OPPORTUNITY_STAGE_COLORS] ?? 'bg-gray-100 text-gray-600'}`}>
                        {OPPORTUNITY_STAGE_LABELS[opp.stage as keyof typeof OPPORTUNITY_STAGE_LABELS] ?? opp.stage}
                      </span>
                      {opp.estimated_value != null && (
                        <p className="text-xs font-bold text-[#1B3A6B] mt-1" title="Valor estimado de la oportunidad (UYU)">
                          {UYU.format(opp.estimated_value)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
