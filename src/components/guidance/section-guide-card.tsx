'use client'
import Link from 'next/link'
import type { Route } from 'next'
import { ArrowRight, Info } from 'lucide-react'

export interface SectionGuideCardProps {
  title: string
  description: string
  primaryActionLabel?: string
  primaryActionHref?: string
  secondaryActionLabel?: string
  secondaryActionHref?: string
  steps?: string[]
  nextStep?: string
  compact?: boolean
}

export function SectionGuideCard({
  title,
  description,
  primaryActionLabel,
  primaryActionHref,
  secondaryActionLabel,
  secondaryActionHref,
  steps,
  nextStep,
  compact = false,
}: SectionGuideCardProps) {
  const showSteps = !compact && steps && steps.length > 0

  return (
    <div className={`border border-gray-100 bg-white rounded-xl shadow-sm ${compact ? 'px-3 py-2.5' : 'p-4'}`}>
      <div className="flex items-start gap-2.5">
        <div className="shrink-0 mt-0.5">
          <Info className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-[#1B3A6B]/50`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-gray-800 ${compact ? 'text-xs' : 'text-sm'}`}>{title}</p>
          <p className={`text-gray-500 mt-0.5 text-xs leading-relaxed`}>{description}</p>

          {showSteps && (
            <ol className="mt-3 space-y-1.5">
              {steps.slice(0, 4).map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1B3A6B]/10 text-[10px] font-bold text-[#1B3A6B] mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-xs text-gray-600 leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          )}

          {(primaryActionHref || secondaryActionHref || nextStep) && (
            <div className="flex flex-wrap items-center gap-3 mt-2.5">
              {primaryActionHref && primaryActionLabel && (
                <Link
                  href={primaryActionHref as Route}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#1B3A6B] hover:underline"
                >
                  {primaryActionLabel}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}

              {secondaryActionHref && secondaryActionLabel && (
                <Link
                  href={secondaryActionHref as Route}
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-[#1B3A6B] hover:underline"
                >
                  {secondaryActionLabel}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}

              {nextStep && (
                <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {nextStep}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
