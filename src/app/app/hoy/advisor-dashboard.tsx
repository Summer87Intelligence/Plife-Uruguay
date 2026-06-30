'use client'
import Link from 'next/link'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import { OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGE_COLORS, B2B_STATUS_LABELS, B2B_STATUS_COLORS } from '@/lib/constants'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { AlertCircle, Calendar, TrendingUp, Building2, Bot, CheckCircle2 } from 'lucide-react'
import type { Profile, Activity, Contact, Opportunity, Company } from '@/types/database'

interface AdvisorDashboardProps {
  profile: Profile
  todayActivities: Partial<Activity>[]
  overdueActions: Partial<Contact>[]
  hotOpps: Partial<Opportunity>[]
  assignedCompanies: Partial<Company>[]
}

export function AdvisorDashboard({ profile, todayActivities, overdueActions, hotOpps, assignedCompanies }: AdvisorDashboardProps) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{greeting}, {profile.full_name.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link href="/app/copiloto">
          <Button>
            <Bot className="h-4 w-4" />
            Preparar contacto con IA
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tareas hoy" value={todayActivities.length} icon={Calendar} color="blue" />
        <StatCard title="Seguimientos vencidos" value={overdueActions.length} icon={AlertCircle} color={overdueActions.length > 0 ? 'red' : 'green'} />
        <StatCard title="Oportunidades calientes" value={hotOpps.length} icon={TrendingUp} color="yellow" />
        <StatCard title="Empresas asignadas" value={assignedCompanies.length} icon={Building2} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seguimientos vencidos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Seguimientos vencidos
              </CardTitle>
              <Link href="/app/contactos" className="text-xs text-[#1B3A6B] hover:underline">Ver todos</Link>
            </div>
          </CardHeader>
          <CardContent>
            {overdueActions.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-400 mb-2" />
                <p className="text-sm text-gray-500">Sin seguimientos vencidos</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {overdueActions.map(c => (
                  <li key={c.id}>
                    <Link href={`/app/contactos/${c.id}`} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.first_name} {c.last_name}</p>
                        <p className="text-xs text-gray-500 truncate">{c.next_action}</p>
                      </div>
                      <span className="text-xs text-red-600 font-medium shrink-0 ml-3">
                        {c.next_action_date ? formatRelativeDate(c.next_action_date) : '—'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Oportunidades calientes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-yellow-500" />
                Oportunidades calientes
              </CardTitle>
              <Link href="/app/oportunidades" className="text-xs text-[#1B3A6B] hover:underline">Ver pipeline</Link>
            </div>
          </CardHeader>
          <CardContent>
            {hotOpps.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-gray-500">No hay oportunidades calientes</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {hotOpps.map(opp => (
                  <li key={opp.id}>
                    <Link href={`/app/oportunidades/${opp.id}`} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{opp.title}</p>
                        <p className="text-xs text-gray-500 truncate">{opp.next_action}</p>
                      </div>
                      {opp.stage && (
                        <span className={`ml-3 shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${OPPORTUNITY_STAGE_COLORS[opp.stage]}`}>
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

        {/* Tareas del día */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Agenda de hoy
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {todayActivities.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Calendar className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Sin actividades programadas para hoy</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {todayActivities.map(a => (
                  <li key={a.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50">
                    <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                      {a.scheduled_at && (
                        <p className="text-xs text-gray-500">
                          {new Date(a.scheduled_at).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Empresas asignadas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-500" />
                Empresas B2B
              </CardTitle>
              <Link href="/app/empresas" className="text-xs text-[#1B3A6B] hover:underline">Ver todas</Link>
            </div>
          </CardHeader>
          <CardContent>
            {assignedCompanies.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-gray-500">Sin empresas asignadas</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {assignedCompanies.map(co => (
                  <li key={co.id}>
                    <Link href={`/app/empresas/${co.id}`} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">{co.name}</p>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {co.b2b_score != null && (
                          <span className="text-xs font-bold text-[#1B3A6B]">{co.b2b_score}</span>
                        )}
                        {co.b2b_status && (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${B2B_STATUS_COLORS[co.b2b_status]}`}>
                            {B2B_STATUS_LABELS[co.b2b_status]}
                          </span>
                        )}
                      </div>
                    </Link>
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
