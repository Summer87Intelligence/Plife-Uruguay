import Link from 'next/link'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Users, Building2, TrendingUp, Megaphone, AlertCircle } from 'lucide-react'
import { OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGE_COLORS } from '@/lib/constants'
import type { Profile, Opportunity } from '@/types/database'

interface DirectionDashboardProps {
  metrics: {
    totalOpps: number
    totalCompanies: number
    activeCampaigns: number
    activeAdvisors: number
  }
  recentOpps: Partial<Opportunity>[]
  profile: Profile
}

export function DirectionDashboard({ metrics, recentOpps, profile }: DirectionDashboardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Vista de Dirección</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {new Date().toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Oportunidades activas" value={metrics.totalOpps} icon={TrendingUp} color="blue" />
        <StatCard title="Empresas B2B" value={metrics.totalCompanies} icon={Building2} color="purple" />
        <StatCard title="Campañas activas" value={metrics.activeCampaigns} icon={Megaphone} color="yellow" />
        <StatCard title="Asesores activos" value={metrics.activeAdvisors} icon={Users} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Oportunidades recientes</CardTitle>
              <Link href="/app/oportunidades" className="text-xs text-[#1B3A6B] hover:underline">Ver pipeline</Link>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recentOpps.map(opp => (
                <li key={opp.id}>
                  <Link href={`/app/oportunidades/${opp.id}`} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50">
                    <p className="text-sm font-medium text-gray-900 truncate">{opp.title}</p>
                    {opp.stage && (
                      <span className={`ml-3 shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${OPPORTUNITY_STAGE_COLORS[opp.stage]}`}>
                        {OPPORTUNITY_STAGE_LABELS[opp.stage]}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accesos rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {([
                { href: '/app/direccion', label: 'Analytics', icon: TrendingUp },
                { href: '/app/radar-b2b', label: 'Radar B2B', icon: AlertCircle },
                { href: '/app/campanas', label: 'Campañas', icon: Megaphone },
                { href: '/app/admin', label: 'Admin', icon: Users },
              ] as const).map(item => (
                <Link key={item.href} href={item.href} className="flex items-center gap-2 rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
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
