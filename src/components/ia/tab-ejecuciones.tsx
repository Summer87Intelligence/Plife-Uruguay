'use client'

import { Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { formatRelativeDate } from '@/lib/utils'
import type { IAEngineProps } from './types'
import { ENTITY_TYPE_LABELS, RUN_STATUS_LABELS } from './helpers'

export function EjecucionesTab({ executionRuns, profiles }: Pick<IAEngineProps, 'executionRuns' | 'profiles'>) {
  if (executionRuns.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="Sin ejecuciones"
        description="Todavía no hay ejecuciones del Motor IA."
      />
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 font-medium">Entidad</th>
                <th className="px-5 py-3 font-medium">Perfil</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Inicio</th>
                <th className="px-5 py-3 font-medium">Fin</th>
                <th className="px-5 py-3 font-medium">Resultado</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {executionRuns.map(run => {
                const runProfile = profiles.find(p => p.id === run.profile_id)
                const resultLabel = run.status === 'completed'
                  ? 'Completado'
                  : run.status === 'failed'
                    ? run.error_message ?? 'Error'
                    : run.status === 'completed_with_errors'
                      ? 'Con errores'
                      : '—'

                return (
                  <tr key={run.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 text-gray-900">{ENTITY_TYPE_LABELS[run.entity_type]}</td>
                    <td className="px-5 py-3.5 text-gray-600">{runProfile?.name ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={
                        run.status === 'completed' ? 'success'
                          : run.status === 'failed' ? 'destructive'
                            : run.status === 'running' ? 'warning'
                              : 'secondary'
                      }>
                        {RUN_STATUS_LABELS[run.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{run.started_at ? formatRelativeDate(run.started_at) : '—'}</td>
                    <td className="px-5 py-3.5 text-gray-500">{run.finished_at ? formatRelativeDate(run.finished_at) : '—'}</td>
                    <td className="px-5 py-3.5 text-gray-600 max-w-xs truncate">{resultLabel}</td>
                    <td className="px-5 py-3.5">
                      <Button size="sm" variant="ghost" disabled title="Detalle disponible en próxima fase">
                        Ver detalle
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
