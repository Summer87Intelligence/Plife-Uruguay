import { Inbox, CalendarClock, AlertTriangle, Flame } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import type { MockLead } from '@/domains/leads/mock-data'
import { getLeadFollowUpBucket } from '@/domains/leads'

export function LeadFollowUpSummary({ leads }: { leads: MockLead[] }) {
  const open = leads.filter((l) => l.status === 'open')
  const nuevos = open.filter((l) => l.pipeline_stage === 'nuevo').length
  const paraSeguimiento = open.filter((l) => {
    const bucket = getLeadFollowUpBucket(l)
    return bucket === 'overdue' || bucket === 'today'
  }).length
  const sinProximoPaso = open.filter((l) => getLeadFollowUpBucket(l) === 'missing_next_step').length
  const calientes = open.filter((l) => l.temperature === 'hot').length

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Leads nuevos" value={nuevos} subtitle="Sin gestión inicial" icon={Inbox} color="blue" />
      <StatCard
        title="Para seguimiento"
        value={paraSeguimiento}
        subtitle="Vencidos o para hoy"
        icon={CalendarClock}
        color="red"
      />
      <StatCard
        title="Sin próximo paso"
        value={sinProximoPaso}
        subtitle="Definir acción y fecha"
        icon={AlertTriangle}
        color="yellow"
      />
      <StatCard title="Leads calientes" value={calientes} subtitle="Atención prioritaria" icon={Flame} color="purple" />
    </div>
  )
}
