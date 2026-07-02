'use client'

import { Badge } from '@/components/ui/badge'
import type { AIExecutionOutput, AIPrompt, AIStage } from '@/types/database'

interface ExecutionDetailProps {
  outputs: AIExecutionOutput[]
  prompts: AIPrompt[]
  stages: AIStage[]
}

export function ExecutionDetail({ outputs, prompts, stages }: ExecutionDetailProps) {
  const sorted = [...outputs].sort((a, b) => a.execution_order - b.execution_order)

  if (sorted.length === 0) {
    return <p className="text-sm text-gray-400 px-5 py-4">Sin outputs registrados para esta ejecución.</p>
  }

  return (
    <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4 space-y-3">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Detalle de outputs ({sorted.length})</p>
      {sorted.map(output => {
        const prompt = prompts.find(p => p.id === output.prompt_id)
        const stage = stages.find(s => s.id === output.stage_id)
        const label = stage?.label ?? prompt?.name ?? 'Etapa desconocida'

        return (
          <div key={output.id} className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-gray-400">#{output.execution_order}</span>
              <p className="text-sm font-medium text-gray-900">{label}</p>
              {prompt && <span className="text-xs text-gray-500">· {prompt.name}</span>}
              <Badge variant={output.status === 'completed' ? 'success' : output.status === 'failed' ? 'destructive' : 'secondary'}>
                {output.status}
              </Badge>
              {output.duration_ms != null && (
                <span className="text-xs text-gray-400">{output.duration_ms} ms</span>
              )}
            </div>
            {output.error_message && (
              <p className="text-sm text-red-600">{output.error_message}</p>
            )}
            {output.output && (
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto bg-gray-50 rounded p-3">
                {output.output}
              </pre>
            )}
          </div>
        )
      })}
    </div>
  )
}
