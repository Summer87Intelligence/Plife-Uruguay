'use client'

import { useState, Fragment } from 'react'
import { Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { formatRelativeDate } from '@/lib/utils'
import type { IAEngineProps } from './types'
import { ENTITY_TYPE_LABELS, RUN_STATUS_LABELS, getOutputsForRun } from './helpers'
import { MockExecutionForm } from './mock-execution-form'
import { ExecutionDetail } from './execution-detail'

interface EjecucionesTabProps extends Pick<IAEngineProps, 'executionRuns' | 'executionOutputs' | 'profiles' | 'prompts' | 'stages'> {
  activeProfileId: string
}

export function EjecucionesTab({
  executionRuns, executionOutputs, profiles, prompts, stages, activeProfileId,
}: EjecucionesTabProps) {
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <MockExecutionForm profiles={profiles} defaultProfileId={activeProfileId} />

      {executionRuns.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Sin ejecuciones"
          description="Todavía no hay ejecuciones del Motor IA."
        />
      ) : (
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
                    <th className="px-5 py-3 font-medium">Outputs</th>
                    <th className="px-5 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {executionRuns.map(run => {
                    const runProfile = profiles.find(p => p.id === run.profile_id)
                    const runOutputs = getOutputsForRun(run.id, executionOutputs)
                    const isExpanded = expandedRunId === run.id

                    return (
                      <Fragment key={run.id}>
                        <tr className="hover:bg-gray-50/50">
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
                          <td className="px-5 py-3.5 text-gray-600">{runOutputs.length}</td>
                          <td className="px-5 py-3.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                            >
                              {isExpanded ? 'Ocultar' : 'Ver detalle'}
                            </Button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="p-0">
                              <ExecutionDetail outputs={runOutputs} prompts={prompts} stages={stages} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
