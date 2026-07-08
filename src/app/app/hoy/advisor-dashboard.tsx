'use client'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GettingStartedCard } from '@/components/onboarding/getting-started-card'
import { Plus, Megaphone, Calendar, Inbox, Columns3, FileText } from 'lucide-react'
import { SectionGuideCard } from '@/components/guidance/section-guide-card'
import type { Profile, Activity, Campaign } from '@/types/database'

interface AdvisorDashboardProps {
  leadPanel?: React.ReactNode
  profile: Profile
  todayActivities: Partial<Activity>[]
  activeCampaigns: Partial<Campaign>[]
  activeLeadCount?: number
}

export function AdvisorDashboard({
  leadPanel,
  profile,
  todayActivities,
  activeCampaigns,
  activeLeadCount = 0,
}: AdvisorDashboardProps) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  const isEmpty =
    activeLeadCount === 0 && todayActivities.length === 0 && activeCampaigns.length === 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{greeting}, {profile.full_name.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Tu tablero de hoy: leads, pipeline, propuestas y campañas.
          </p>
        </div>
        <Link href="/app/leads/new">
          <Button><Plus className="h-4 w-4" />Nuevo lead</Button>
        </Link>
      </div>

      {leadPanel}

      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Acciones rápidas</h2>
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
            href="/app/propuestas/nueva"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1B3A6B]/10 px-3 py-1.5 text-xs font-medium text-[#1B3A6B] hover:bg-[#1B3A6B]/20 transition-colors"
          >
            <FileText className="h-3 w-3" />
            Nueva propuesta
          </Link>
          <Link
            href="/app/propuestas"
            className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
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
        </div>
      </div>

      {isEmpty && <GettingStartedCard />}

      <SectionGuideCard
        title={isEmpty ? 'Cómo avanzar hoy' : 'Flujo recomendado'}
        description={
          isEmpty
            ? 'Empezá cargando un lead, hacelo avanzar por el pipeline y prepará una propuesta con los motores.'
            : 'Trabajá desde Leads y el Pipeline hacia una Propuesta con próximo paso definido.'
        }
        steps={
          isEmpty
            ? [
                'Lead — registrá un contacto o empresa potencial',
                'Pipeline — revisá en qué etapa está cada lead',
                'Propuesta — prepará un borrador con los motores',
                'Campaña — coordiná el esfuerzo comercial por segmento',
              ]
            : undefined
        }
        primaryActionLabel={isEmpty ? 'Nuevo lead' : 'Ver pipeline'}
        primaryActionHref={isEmpty ? '/app/leads/new' : '/app/pipeline'}
        secondaryActionLabel={isEmpty ? undefined : 'Nueva propuesta'}
        secondaryActionHref={isEmpty ? undefined : '/app/propuestas/nueva'}
        nextStep={isEmpty ? 'Siguiente: ver pipeline' : undefined}
        compact={!isEmpty}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-[#1B3A6B]" />
                Campañas activas
              </CardTitle>
              <Link href="/app/campanas" className="text-xs text-[#1B3A6B] hover:underline">
                Ver campañas
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {activeCampaigns.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                No hay campañas activas.{' '}
                <Link href="/app/campanas" className="text-[#1B3A6B] hover:underline">
                  Crear o revisar campañas
                </Link>
              </p>
            ) : (
              <ul className="space-y-2">
                {activeCampaigns.map(c => (
                  <li key={c.id}>
                    <Link
                      href={`/app/campanas/${c.id}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50"
                    >
                      <p className="text-sm font-medium text-gray-900">{c.name}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Agenda de hoy
            </CardTitle>
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
                        <p className="text-xs text-gray-500">
                          {new Date(a.scheduled_at).toLocaleTimeString('es-UY', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
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
