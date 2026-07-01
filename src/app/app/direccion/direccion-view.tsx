import Link from 'next/link'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Users, Building2, TrendingUp, Megaphone, Activity, Target } from 'lucide-react'
import { OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGE_COLORS, PIPELINE_STAGES } from '@/lib/constants'
import { formatRelativeDate } from '@/lib/utils'
import { calcularScoreB2B, nivelColor, nivelLabel } from '@/lib/b2b/scoring'
import { ICP_NOMBRES } from '@/lib/b2b/icp'
import type { Company } from '@/types/database'

type TopB2BOpp = {
  id: string
  title: string
  stage: string
  estimated_value: number | null
  next_action: string | null
  company: Pick<Company, 'id' | 'name' | 'industry' | 'b2b_score' | 'estimated_employees'> | null
  assigned_profile: { full_name: string } | null
}

interface DireccionViewProps {
  metrics: { totalOpps: number; totalContacts: number; totalCompanies: number; activeCampaigns: number }
  stageCounts: Record<string, number>
  recentActivities: Array<{ id: string; type: string; title: string; created_at: string; created_by_profile?: { full_name: string } | null }>
  topB2BOpps: TopB2BOpp[]
}

export function DireccionView({ metrics, stageCounts, recentActivities, topB2BOpps }: DireccionViewProps) {
  const maxStageCount = Math.max(...PIPELINE_STAGES.map(s => stageCounts[s] ?? 0), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dirección</h1>
        <p className="text-sm text-gray-500">Vista ejecutiva para decidir dónde enfocar al equipo comercial.</p>
        <p className="text-xs text-gray-400 mt-0.5">Esta vista toma sentido cuando ya hay oportunidades y campañas cargadas.</p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Oportunidades totales" value={metrics.totalOpps} icon={TrendingUp} color="blue" />
        <StatCard title="Contactos" value={metrics.totalContacts} icon={Users} color="purple" />
        <StatCard title="Empresas B2B" value={metrics.totalCompanies} icon={Building2} color="green" />
        <StatCard title="Campañas activas" value={metrics.activeCampaigns} icon={Megaphone} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline por etapa */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución del Pipeline</CardTitle>
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

      {/* Top oportunidades B2B */}
      {topB2BOpps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[#1B3A6B]" />
              Top oportunidades B2B activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topB2BOpps.map(opp => {
                const companyScore = opp.company ? calcularScoreB2B(opp.company as Company) : null
                return (
                  <Link key={opp.id} href={`/app/oportunidades/${opp.id}`} className="flex items-center gap-4 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
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
                        <p className="text-xs font-bold text-[#1B3A6B] mt-1">${opp.estimated_value.toLocaleString('es-UY')}</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
