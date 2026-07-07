'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Cpu, Play } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRelativeDate } from '@/lib/utils'
import type { AIExecutionRun } from '@/types/database'
import { runMockAnalysis } from '@/app/app/ia/actions'
import { RUN_STATUS_LABELS } from './helpers'

interface EntityAIAnalysisCardProps {
  entityType: 'company' | 'opportunity'
  entityId: string
  entityLabel: string
  profileId: string
  profileName: string
  latestRun?: AIExecutionRun | null
  compact?: boolean
}

export function EntityAIAnalysisCard({
  entityType, entityId, entityLabel, profileId, profileName, latestRun, compact = false,
}: EntityAIAnalysisCardProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleRun = () => {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const result = await runMockAnalysis({
        entityType,
        entityId,
        profileId,
      })
      if (result.error) {
        setError(result.error)
        return
      }
      setSuccess('Análisis simulado completado. Revisá los resultados en Motores.')
      router.refresh()
    })
  }

  return (
    <Card className={`border-[#1B3A6B]/15 ${compact ? '' : 'shadow-sm'}`}>
      <CardContent className={compact ? 'p-4 space-y-3' : 'p-5 space-y-4'}>
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
            <Cpu className="h-4 w-4 text-[#1B3A6B]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">Análisis comercial</p>
            <p className="text-xs text-gray-500 mt-1">
              Ejecutá los Motores PLIFE en modo simulado para generar una lectura comercial por etapas.
              Opera en modo determinístico interno (sin proveedor externo) y requiere revisión humana.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600 space-y-1">
          <p><span className="text-gray-500">Entidad:</span> {entityLabel}</p>
          <p><span className="text-gray-500">Perfil:</span> {profileName}</p>
          {latestRun ? (
            <p className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-500">Última ejecución:</span>
              <Badge variant={latestRun.status === 'completed' ? 'success' : latestRun.status === 'failed' ? 'destructive' : 'secondary'}>
                {RUN_STATUS_LABELS[latestRun.status]}
              </Badge>
              <span>{formatRelativeDate(latestRun.created_at)}</span>
            </p>
          ) : (
            <p className="text-gray-400">Sin ejecuciones previas para esta entidad.</p>
          )}
        </div>

        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Este análisis no genera primas, coberturas ni condiciones de póliza.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={handleRun} loading={isPending} disabled={isPending}>
            <Play className="h-3.5 w-3.5" />
            Ejecutar análisis IA
          </Button>
          <Link href="/app/ia" className="text-xs text-[#1B3A6B] hover:underline">
            Ver en Motores
          </Link>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
      </CardContent>
    </Card>
  )
}
