'use client'
import Link from 'next/link'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { GettingStartedCard } from '@/components/onboarding/getting-started-card'
import { Users, Megaphone, Inbox, Columns3, FileText, ListChecks, CalendarClock, FileWarning } from 'lucide-react'

interface AttentionSummary {
  priorityActions: number
  upcomingRenewals: number
  proposalsToFollow: number
  pendingDocs: number
}

interface DirectionDashboardProps {
  leadPanel?: React.ReactNode
  attentionPanel?: React.ReactNode
  attentionSummary?: AttentionSummary
  isDemoData?: boolean
  metrics: {
    activeCampaigns: number
    activeAdvisors: number
  }
  activeLeadCount?: number
}

export function DirectionDashboard({ leadPanel, attentionPanel, attentionSummary, isDemoData = false, metrics, activeLeadCount = 0 }: DirectionDashboardProps) {
  const isEmpty =
    activeLeadCount === 0 && metrics.activeCampaigns === 0 && metrics.activeAdvisors <= 1

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900">Vista de Dirección</h1>
          {isDemoData && <Badge variant="secondary">Datos de demostración</Badge>}
        </div>
        <p className="text-sm text-gray-500 mt-0.5">
          Resumen del equipo: leads, campañas y acceso a herramientas de gestión.
        </p>
      </div>

      {attentionSummary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Acciones prioritarias hoy" value={attentionSummary.priorityActions} icon={ListChecks} color="red" />
          <StatCard title="Renovaciones próximas" value={attentionSummary.upcomingRenewals} icon={CalendarClock} color="yellow" />
          <StatCard title="Propuestas a seguir" value={attentionSummary.proposalsToFollow} icon={FileText} color="blue" />
          <StatCard title="Documentación pendiente" value={attentionSummary.pendingDocs} icon={FileWarning} color="purple" />
        </div>
      )}

      {attentionPanel}

      {leadPanel}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Campañas activas" value={metrics.activeCampaigns} icon={Megaphone} color="yellow" />
        <StatCard title="Asesores activos" value={metrics.activeAdvisors} icon={Users} color="green" />
      </div>

      {isEmpty && <GettingStartedCard />}

      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Acciones del equipo</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/app/leads"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1B3A6B]/10 px-3 py-1.5 text-xs font-medium text-[#1B3A6B] hover:bg-[#1B3A6B]/20 transition-colors"
          >
            <Inbox className="h-3 w-3" />
            Ver leads
          </Link>
          <Link
            href="/app/pipeline"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1B3A6B]/10 px-3 py-1.5 text-xs font-medium text-[#1B3A6B] hover:bg-[#1B3A6B]/20 transition-colors"
          >
            <Columns3 className="h-3 w-3" />
            Ver pipeline
          </Link>
          <Link
            href="/app/propuestas"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1B3A6B]/10 px-3 py-1.5 text-xs font-medium text-[#1B3A6B] hover:bg-[#1B3A6B]/20 transition-colors"
          >
            <FileText className="h-3 w-3" />
            Ver propuestas
          </Link>
          <Link
            href="/app/campanas"
            className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Megaphone className="h-3 w-3" />
            Campañas
          </Link>
          <Link
            href="/app/direccion"
            className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Dirección
          </Link>
          <Link
            href="/app/admin"
            className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accesos rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {([
              { href: '/app/campanas', label: 'Campañas', icon: Megaphone },
              { href: '/app/admin', label: 'Admin', icon: Users },
            ] as const).map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
              >
                <item.icon className="h-4 w-4 text-[#1B3A6B]" />
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
