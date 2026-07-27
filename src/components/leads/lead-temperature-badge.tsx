import { cn } from '@/lib/utils'
import { Flame, Snowflake, Thermometer } from 'lucide-react'
import type { LeadTemperature } from '@/domains/leads'
import { LEAD_TEMPERATURE_LABELS } from '@/domains/leads'

const TEMPERATURE_STYLES: Record<LeadTemperature, { color: string; icon: typeof Flame }> = {
  cold: { color: 'bg-slate-100 text-slate-600', icon: Snowflake },
  warm: { color: 'bg-orange-50 text-orange-700', icon: Thermometer },
  hot: { color: 'bg-red-100 text-red-800', icon: Flame },
}

export function LeadTemperatureBadge({ temperature, className }: { temperature: LeadTemperature; className?: string }) {
  const { color, icon: Icon } = TEMPERATURE_STYLES[temperature]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
        color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {LEAD_TEMPERATURE_LABELS[temperature]}
    </span>
  )
}
