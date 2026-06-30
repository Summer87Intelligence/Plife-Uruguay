import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Users, Building2, TrendingUp, Megaphone, Activity } from 'lucide-react'
import { OPPORTUNITY_STAGE_LABELS, PIPELINE_STAGES } from '@/lib/constants'
import { formatRelativeDate } from '@/lib/utils'

interface DireccionViewProps {
  metrics: { totalOpps: number; totalContacts: number; totalCompanies: number; activeCampaigns: number }
  stageCounts: Record<string, number>
  recentActivities: Array<{ id: string; type: string; title: string; created_at: string; created_by_profile?: { full_name: string } | null }>
}

export function DireccionView({ metrics, stageCounts, recentActivities }: DireccionViewProps) {
  const maxStageCount = Math.max(...PIPELINE_STAGES.map(s => stageCounts[s] ?? 0), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analytics — Dirección</h1>
        <p className="text-sm text-gray-500">Vista ejecutiva del pipeline y actividad comercial</p>
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
    </div>
  )
}
