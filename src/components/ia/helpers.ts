import type { AICategory, AIPrompt, AIPromptStatus, AIAnalysisProfile, AIProfilePrompt, AIExecutionRun, AIPromptSuggestion, AIExecutionOutput } from '@/types/database'
import type { EntityNameMap } from './types'
import { buildStructuredPrompt } from '@/domains/ia-engine/prompt-builder'

export const PROMPT_STATUS_LABELS: Record<AIPromptStatus, string> = {
  draft: 'Borrador',
  validated: 'Validado',
  archived: 'Archivado',
}

export const PROMPT_STATUS_VARIANTS: Record<AIPromptStatus, 'warning' | 'success' | 'secondary'> = {
  draft: 'warning',
  validated: 'success',
  archived: 'secondary',
}

export const RUN_STATUS_LABELS: Record<AIExecutionRun['status'], string> = {
  queued: 'En cola',
  running: 'En ejecución',
  completed: 'Completada',
  completed_with_errors: 'Con errores',
  failed: 'Fallida',
}

export const ENTITY_TYPE_LABELS: Record<AIExecutionRun['entity_type'], string> = {
  company: 'Empresa',
  contact: 'Contacto',
  opportunity: 'Oportunidad',
  campaign: 'Campaña',
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  investigacion: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  diagnostico: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' },
  oportunidades: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  mensajes: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  direccion: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800', dot: 'bg-slate-500' },
  seguimiento: { bg: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-800', dot: 'bg-teal-500' },
}

const FALLBACK_COLOR = { bg: 'bg-gray-50', border: 'border-gray-100', text: 'text-gray-800', dot: 'bg-gray-400' }

export function getCategoryColor(category?: AICategory | null) {
  if (!category) return FALLBACK_COLOR
  return CATEGORY_COLORS[category.key] ?? FALLBACK_COLOR
}

export function buildPromptPreview(prompt: Pick<
  AIPrompt,
  'role_persona' | 'context_environment' | 'objective' | 'specific_task' |
  'constraints' | 'output_format' | 'target_audience'
>) {
  return buildStructuredPrompt(prompt)
}

export function getOpenSuggestionsForPrompt(promptId: string, suggestions: AIPromptSuggestion[]) {
  return suggestions.filter(s => s.prompt_id === promptId && s.status === 'open')
}

export function getPromptQualityBadge(prompt: AIPrompt, suggestions: AIPromptSuggestion[]): {
  label: string
  variant: 'warning' | 'success' | 'secondary'
} {
  if (prompt.status === 'draft') {
    return { label: 'Borrador', variant: 'warning' }
  }
  const openCount = getOpenSuggestionsForPrompt(prompt.id, suggestions).length
  if (openCount > 0) {
    return { label: 'Revisión', variant: 'warning' }
  }
  return { label: 'OK', variant: 'success' }
}

export function getActiveProfile(profiles: AIAnalysisProfile[]) {
  return profiles.find(p => p.is_active) ?? profiles[0] ?? null
}

export function countPromptsByCategory(prompts: AIPrompt[], categories: AICategory[]) {
  return categories.map(cat => ({
    category: cat,
    count: prompts.filter(p => p.category_id === cat.id).length,
    colors: getCategoryColor(cat),
  }))
}

export function getProfilePrompts(
  profileId: string,
  profilePrompts: AIProfilePrompt[],
  prompts: AIPrompt[],
) {
  const links = profilePrompts
    .filter(pp => pp.profile_id === profileId)
    .sort((a, b) => a.execution_order - b.execution_order)
  return links.map(link => ({
    link,
    prompt: prompts.find(p => p.id === link.prompt_id) ?? null,
  }))
}

export function getLatestRun(runs: AIExecutionRun[]) {
  if (runs.length === 0) return null
  return [...runs].sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
}

export function getOutputsForRun(runId: string, outputs: AIExecutionOutput[]) {
  return outputs.filter(o => o.run_id === runId)
}

export function shortUuid(id: string): string {
  return `${id.slice(0, 8)}…`
}

export function formatRunEntityLabel(
  run: AIExecutionRun,
  entityNames: EntityNameMap,
): string {
  const key = `${run.entity_type}:${run.entity_id}`
  const name = entityNames[key]
  const typeLabel = ENTITY_TYPE_LABELS[run.entity_type]
  if (name) return `${typeLabel} · ${name}`
  return `${run.entity_type} · ${shortUuid(run.entity_id)}`
}
