import { Circle, FileText, GitBranch, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MockLead } from '@/domains/leads/mock-data'
import { LEAD_SOURCE_LABELS } from '@/domains/leads'

interface TimelineEvent {
  id: string
  title: string
  detail: string
  icon: typeof Plus
}

function formatDateTime(value: string): string {
  const d = new Date(value)
  return d.toLocaleDateString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildTimelineEvents(lead: MockLead): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: 'created',
      title: 'Lead creado',
      detail: `Registro demo — ${formatDateTime(lead.created_at)}`,
      icon: Plus,
    },
    {
      id: 'source',
      title: 'Origen registrado',
      detail: `Canal: ${LEAD_SOURCE_LABELS[lead.source]}`,
      icon: GitBranch,
    },
  ]

  if (lead.next_action) {
    events.push({
      id: 'next-action',
      title: 'Próximo paso definido',
      detail: lead.next_action_date
        ? `${lead.next_action} — ${lead.next_action_date.slice(0, 10).split('-').reverse().join('/')}`
        : lead.next_action,
      icon: Circle,
    })
  }

  events.push({
    id: 'note',
    title: 'Nota demo',
    detail: 'Interés inicial registrado en vista conceptual. Sin persistencia en base.',
    icon: FileText,
  })

  return events
}

export function LeadTimelineMock({ lead }: { lead: MockLead }) {
  const events = buildTimelineEvents(lead)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Timeline (demo)</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-4 border-l border-gray-200 pl-4">
          {events.map((event) => {
            const Icon = event.icon
            return (
              <li key={event.id} className="relative">
                <span className="absolute -left-[1.35rem] flex h-5 w-5 items-center justify-center rounded-full bg-white border border-gray-200">
                  <Icon className="h-3 w-3 text-gray-400" />
                </span>
                <p className="text-sm font-medium text-gray-900">{event.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{event.detail}</p>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
