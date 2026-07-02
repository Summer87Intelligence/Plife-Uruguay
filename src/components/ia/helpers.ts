import type { AICategory, AIPrompt, AIPromptStatus, AIAnalysisProfile, AIProfilePrompt, AIExecutionRun } from '@/types/database'

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
  compliance: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
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
  const sections: string[] = []
  if (prompt.role_persona) sections.push(`## Rol\n${prompt.role_persona}`)
  if (prompt.context_environment) sections.push(`## Contexto\n${prompt.context_environment}`)
  if (prompt.objective) sections.push(`## Objetivo\n${prompt.objective}`)
  if (prompt.specific_task) sections.push(`## Tarea\n${prompt.specific_task}`)
  if (prompt.constraints) sections.push(`## Restricciones\n${prompt.constraints}`)
  if (prompt.output_format) sections.push(`## Formato de salida\n${prompt.output_format}`)
  if (prompt.target_audience) sections.push(`## Público objetivo\n${prompt.target_audience}`)
  return sections.join('\n\n') || 'Completá los campos estructurados para generar la vista previa.'
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
