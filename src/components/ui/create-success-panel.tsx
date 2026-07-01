'use client'
import Link from 'next/link'
import type { Route } from 'next'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ActionLink {
  label: string
  href: string
}

interface CreateSuccessPanelProps {
  message: string
  primaryAction: ActionLink
  secondaryAction?: ActionLink
  onClose?: () => void
}

export function CreateSuccessPanel({ message, primaryAction, secondaryAction, onClose }: CreateSuccessPanelProps) {
  return (
    <div className="space-y-5 py-2">
      <div className="flex flex-col items-center text-center gap-3">
        <CheckCircle2 className="h-10 w-10 text-green-500" />
        <p className="text-sm text-gray-700">{message}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 justify-end">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose} className="sm:mr-auto">
            Cerrar
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" asChild>
            <Link href={secondaryAction.href as Route}>{secondaryAction.label}</Link>
          </Button>
        )}
        <Button asChild>
          <Link href={primaryAction.href as Route}>{primaryAction.label}</Link>
        </Button>
      </div>
    </div>
  )
}
