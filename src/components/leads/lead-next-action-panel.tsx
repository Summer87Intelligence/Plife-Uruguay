import { AlertTriangle, CalendarClock, ArrowRight, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MockLead } from '@/domains/leads/mock-data'
import { getLeadFollowUpBucket } from '@/domains/leads'
import type { LeadFollowUpBucket } from '@/domains/leads'

const BUCKET_CONFIG: Record<
  LeadFollowUpBucket,
  { label: string; description: string; icon: typeof CalendarClock; className: string }
> = {
  overdue: {
    label: 'Vencido',
    description: 'La fecha del próximo paso ya pasó. Retomar contacto cuanto antes.',
    icon: AlertTriangle,
    className: 'border-red-200 bg-red-50 text-red-800',
  },
  today: {
    label: 'Hoy',
    description: 'Hay una acción programada para hoy. Priorizá este lead en PLIFE Hoy.',
    icon: CalendarClock,
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  missing_next_step: {
    label: 'Sin próximo paso',
    description: 'Definí qué hacer y cuándo. Sin esto, el lead puede perderse en el pipeline.',
    icon: HelpCircle,
    className: 'border-orange-200 bg-orange-50 text-orange-800',
  },
  none: {
    label: 'Ninguno',
    description: 'Próximo paso programado a futuro o lead sin gestión activa.',
    icon: ArrowRight,
    className: 'border-gray-200 bg-gray-50 text-gray-700',
  },
}

function formatDate(value: string): string {
  const [y, m, d] = value.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export function LeadNextActionPanel({ lead }: { lead: MockLead }) {
  const bucket = getLeadFollowUpBucket(lead)
  const config = BUCKET_CONFIG[bucket]
  const Icon = config.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Próximo paso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={cn('flex items-start gap-2.5 rounded-lg border px-3 py-2.5', config.className)}>
          <Icon className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide">{config.label}</p>
            <p className="mt-0.5 text-xs opacity-90">{config.description}</p>
          </div>
        </div>

        {lead.next_action ? (
          <div className="rounded-lg border border-gray-100 bg-white px-3 py-2.5">
            <p className="text-sm font-medium text-gray-900">{lead.next_action}</p>
            {lead.next_action_date && (
              <p className="mt-1 text-xs text-gray-500">
                Fecha: {formatDate(lead.next_action_date)}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Todavía no hay un próximo paso definido para este lead demo.</p>
        )}
      </CardContent>
    </Card>
  )
}
