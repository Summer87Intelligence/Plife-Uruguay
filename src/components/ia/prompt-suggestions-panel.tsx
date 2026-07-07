'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Lightbulb, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { AICategory, AIPrompt, AIPromptSuggestion } from '@/types/database'
import { regeneratePromptSuggestions } from '@/app/app/ia/actions'
import { getOpenSuggestionsForPrompt } from './helpers'

const SUGGESTION_TYPE_LABELS: Record<string, string> = {
  missing_field: 'Campo incompleto',
  validated_incomplete: 'Validación inconsistente',
  weak_output_format: 'Formato de salida',
  weak_constraints: 'Restricciones débiles',
  human_review: 'Revisión humana',
  insurance_risk: 'Riesgo comercial',
  error: 'Error',
}

interface PromptSuggestionsPanelProps {
  prompt: AIPrompt
  categories: AICategory[]
  suggestions: AIPromptSuggestion[]
  compact?: boolean
  onRegenerated?: () => void
}

export function PromptSuggestionsPanel({
  prompt, categories, suggestions, compact = false, onRegenerated,
}: PromptSuggestionsPanelProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [lastStatus, setLastStatus] = useState<string | null>(null)
  const router = useRouter()

  const openSuggestions = getOpenSuggestionsForPrompt(prompt.id, suggestions)
  const category = categories.find(c => c.id === prompt.category_id)

  const handleRegenerate = () => {
    setError(null)
    setLastStatus(null)
    startTransition(async () => {
      const result = await regeneratePromptSuggestions(prompt.id)
      if (result.error) {
        setError(result.error)
        return
      }
      setLastStatus(result.data?.status ?? 'ok')
      router.refresh()
      onRegenerated?.()
    })
  }

  return (
    <div className={compact ? 'space-y-3' : 'rounded-lg border border-dashed border-gray-200 bg-white/60 p-4 space-y-3'}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Sugerencias de mejora
          </p>
          {openSuggestions.length > 0 && (
            <Badge variant="warning">{openSuggestions.length} abierta{openSuggestions.length !== 1 ? 's' : ''}</Badge>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={handleRegenerate} loading={isPending} disabled={isPending}>
          <RefreshCw className="h-3.5 w-3.5" />
          Regenerar sugerencias
        </Button>
      </div>

      {category && (
        <p className="text-xs text-gray-400">Categoría: {category.label}</p>
      )}

      {lastStatus && (
        <p className="text-xs text-green-600">
          Validación local completada — estado: {lastStatus === 'ok' ? 'OK' : lastStatus === 'warning' ? 'Advertencias' : 'Errores'}
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {openSuggestions.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">Sin sugerencias registradas para este prompt.</p>
      ) : (
        <ul className="space-y-2">
          {openSuggestions.map(s => (
            <li key={s.id} className="rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2.5">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant="outline" className="text-xs">
                  {SUGGESTION_TYPE_LABELS[s.suggestion_type] ?? s.suggestion_type}
                </Badge>
              </div>
              <p className="text-sm text-gray-800">{s.reason}</p>
              {s.suggested_content && (
                <p className="text-xs text-gray-600 mt-1.5 italic">{s.suggested_content}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
