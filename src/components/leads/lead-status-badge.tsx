import { cn } from '@/lib/utils'
import type { LeadPipelineStage } from '@/domains/leads'
import { getLeadStageLabel } from '@/domains/leads'

const STAGE_COLORS: Record<LeadPipelineStage, string> = {
  nuevo: 'bg-blue-100 text-blue-800',
  contactado: 'bg-indigo-100 text-indigo-800',
  calificando: 'bg-cyan-100 text-cyan-800',
  interesado: 'bg-yellow-100 text-yellow-800',
  propuesta_reunion: 'bg-purple-100 text-purple-800',
  seguimiento: 'bg-sky-100 text-sky-800',
  convertido: 'bg-green-100 text-green-800',
  descartado: 'bg-gray-100 text-gray-800',
}

export function LeadStatusBadge({ stage, className }: { stage: LeadPipelineStage; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        STAGE_COLORS[stage],
        className
      )}
    >
      {getLeadStageLabel(stage)}
    </span>
  )
}
