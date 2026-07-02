import type { PriorityTone } from '@/lib/commercial-priority'

const TONE_CLASSES: Record<PriorityTone, string> = {
  danger: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  success: 'bg-emerald-100 text-emerald-700',
  muted: 'bg-gray-100 text-gray-400',
}

interface PriorityBadgeProps {
  label: 'Alta' | 'Media' | 'Baja'
  tone: PriorityTone
  reason?: string
  size?: 'sm' | 'xs'
}

export function PriorityBadge({ label, tone, reason, size = 'xs' }: PriorityBadgeProps) {
  const textSize = size === 'sm' ? 'text-xs' : 'text-[10px]'
  const px = size === 'sm' ? 'px-2 py-0.5' : 'px-1.5 py-0.5'
  return (
    <span
      title={reason}
      className={`inline-flex items-center rounded-full font-medium shrink-0 ${textSize} ${px} ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  )
}
