'use client'
import Link from 'next/link'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import { OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGE_COLORS, B2B_STATUS_LABELS, B2B_STATUS_COLORS, PIPELINE_STAGES } from '@/lib/constants'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { AlertCircle, Calendar, TrendingUp, Building2, Bot, CheckCircle2, Megaphone, Clock } from 'lucide-react'
import type { Profile, Activity, Contact, Opportunity, Company, Campaign } from '@/types/database'

interface AdvisorDashboardProps {
  profile: Profile
  todayActivities: Partial<Activity>[]
  overdueActions: Partial<Contact>[]
  hotOpps: Partial<Opportunity>[]
  assignedCompanies: Partial<Company>[]
  upcomingOpps: Partial<Opportunity>[]
  activeCampaigns: Partial<Campaign>[]
  staleOpps: Partial<Opportunity>[]
}

export function AdvisorDashboard({
  profile, todayActivities, overdueActions, hotOpps, assignedCompanies,
  upcomingOpps, activeCampaigns, staleOpps,
}: AdvisorDashboardProps) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{greeting}, {profile.full_name.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Esto es lo que conviene atender hoy · {new Date().toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link href="/app/copiloto">
          <Button><Bot className="h-4 w-4" />Preparar contacto con IA</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tareas hoy" value={todayActivities.length} icon={Calendar} color="blue" />
        <StatCard title="Seguimientos vencidos" value={overdueActions.length} icon={AlertCircle} color={overdueActions.length > 0 ? 'red' : 'green'} />
        <StatCard title="Oportunidades calientes" value={hotOpps.length} icon={TrendingUp} color="yellow" />
        <StatCard title="Empresas B2B" value={assignedCompanies.length} icon={Building2} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-red-500" />Seguimientos vencidos</CardTitle>
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
                    <Link href={`/app/contactos/${c.id}`} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50">
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500" />Próximas acciones</CardTitle>
              <Link href="/app/oportunidades" className="text-xs text-[#1B3A6B] hover:underline">Ver pipeline</Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingOpps.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">Sin acciones programadas próximamente</p>
            ) : (
              <ul className="space-y-2">
                {upcomingOpps.map(opp => (
                  <li key={opp.id}>
                    <Link href={`/app/oportunidades/${opp.id}`} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{opp.title}</p>
                        <p className="text-xs text-gray-500 truncate">{opp.next_action}</p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">{opp.next_action_date ? formatDate(opp.next_action_date) : '—'}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-yellow-500" />Oportunidades calientes</CardTitle>
              <Link href="/app/oportunidades" className="text-xs text-[#1B3A6B] hover:underline">Ver pipeline</Link>
            </div>
          </CardHeader>
          <CardContent>
            {hotOpps.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No hay oportunidades calientes</p>
            ) : (
              <ul className="space-y-2">
                {hotOpps.map(opp => (
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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-[#1B3A6B]" />Campañas activas</CardTitle>
              <Link href="/app/campanas" className="text-xs text-[#1B3A6B] hover:underline">Ver campañas</Link>
            </div>
          </CardHeader>
          <CardContent>
            {activeCampaigns.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No hay campañas activas</p>
            ) : (
              <ul className="space-y-2">
                {activeCampaigns.map(c => (
                  <li key={c.id}>
                    <Link href={`/app/campanas/${c.id}`} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">{c.name}</p>
                      <span className="text-xs text-gray-400">{c.total_converted ?? 0}/{c.total_targets ?? 0} conv.</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-500" />Agenda de hoy</CardTitle>
          </CardHeader>
          <CardContent>
            {todayActivities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">Sin actividades programadas para hoy</p>
            ) : (
              <ul className="space-y-2">
                {todayActivities.map(a => (
                  <li key={a.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50">
                    <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                      {a.scheduled_at && (
                        <p className="text-xs text-gray-500">{new Date(a.scheduled_at).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Building2 className="h-4 w-4 text-purple-500" />Empresas B2B priorizadas</CardTitle>
              <Link href="/app/empresas" className="text-xs text-[#1B3A6B] hover:underline">Ver todas</Link>
            </div>
          </CardHeader>
          <CardContent>
            {assignedCompanies.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">Sin empresas asignadas</p>
            ) : (
              <ul className="space-y-2">
                {assignedCompanies.map(co => (
                  <li key={co.id}>
                    <Link href={`/app/empresas/${co.id}`} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">{co.name}</p>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {co.b2b_score != null && <span className="text-xs font-bold text-[#1B3A6B]">{co.b2b_score}</span>}
                        {co.b2b_status && (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${B2B_STATUS_COLORS[co.b2b_status]}`}>
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

        {staleOpps.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700"><AlertCircle className="h-4 w-4" />Oportunidades sin actividad reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {staleOpps.map(opp => (
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
      </div>
    </div>
  )
}
