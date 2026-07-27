import type { AIPromptStatus } from '@/types/database'
import {
  collectRiskTermsFromPrompt,
  hasExplicitLimits,
  hasHumanReviewMention,
} from './prompt-safety'

export type PromptSuggestion = {
  suggestion_type: string
  reason: string
  suggested_content?: string
}

export type PromptValidationResult = {
  status: 'ok' | 'warning' | 'error'
  suggestions: PromptSuggestion[]
}

export type StructuredPromptValidationInput = {
  name: string
  role_persona: string
  context_environment: string
  objective: string
  specific_task: string
  constraints: string
  output_format: string
  target_audience: string
  status: AIPromptStatus
  categoryKey?: string | null
}

const STRUCTURED_FIELDS: { key: keyof StructuredPromptValidationInput; label: string; type: string }[] = [
  { key: 'role_persona', label: 'Rol / Persona', type: 'missing_field' },
  { key: 'context_environment', label: 'Contexto / Entorno', type: 'missing_field' },
  { key: 'objective', label: 'Objetivo', type: 'missing_field' },
  { key: 'specific_task', label: 'Tarea específica', type: 'missing_field' },
  { key: 'constraints', label: 'Restricciones / Limitaciones', type: 'missing_field' },
  { key: 'output_format', label: 'Formato de salida', type: 'missing_field' },
  { key: 'target_audience', label: 'Público objetivo', type: 'missing_field' },
]

const MIN_OUTPUT_FORMAT_LENGTH = 40
const MIN_CONSTRAINTS_LENGTH = 60

function isEmpty(value: string | undefined | null): boolean {
  return !value || value.trim().length === 0
}

function aggregateStatus(suggestions: PromptSuggestion[]): PromptValidationResult['status'] {
  if (suggestions.some(s => s.suggestion_type === 'error' || s.suggestion_type === 'validated_incomplete')) {
    return 'error'
  }
  if (suggestions.length > 0) return 'warning'
  return 'ok'
}

export function validateStructuredPrompt(prompt: StructuredPromptValidationInput): PromptValidationResult {
  const suggestions: PromptSuggestion[] = []

  if (isEmpty(prompt.name)) {
    suggestions.push({
      suggestion_type: 'error',
      reason: 'El prompt no tiene nombre.',
      suggested_content: 'Asigná un nombre descriptivo al prompt comercial.',
    })
  }

  const missingFields: string[] = []
  for (const { key, label } of STRUCTURED_FIELDS) {
    const value = prompt[key]
    if (typeof value === 'string' && isEmpty(value)) {
      missingFields.push(label)
      suggestions.push({
        suggestion_type: prompt.status === 'validated' ? 'validated_incomplete' : 'missing_field',
        reason: `Campo incompleto: ${label}.`,
        suggested_content: `Completá el campo "${label}" con contenido específico para el contexto comercial PLIFE.`,
      })
    }
  }

  if (prompt.status === 'validated' && missingFields.length > 0) {
    suggestions.push({
      suggestion_type: 'validated_incomplete',
      reason: `El prompt está marcado como validado pero tiene ${missingFields.length} campo(s) incompleto(s).`,
      suggested_content: 'Cambiá el estado a borrador hasta completar todos los campos, o completá los campos faltantes.',
    })
  }

  if (!isEmpty(prompt.output_format) && prompt.output_format.trim().length < MIN_OUTPUT_FORMAT_LENGTH) {
    suggestions.push({
      suggestion_type: 'weak_output_format',
      reason: 'El formato de salida es demasiado corto para guiar una respuesta consistente.',
      suggested_content: 'Describí estructura, tono, longitud y secciones esperadas en el formato de salida (mínimo ~40 caracteres).',
    })
  }

  if (!isEmpty(prompt.constraints) && prompt.constraints.trim().length < MIN_CONSTRAINTS_LENGTH) {
    suggestions.push({
      suggestion_type: 'weak_constraints',
      reason: 'Las restricciones son demasiado breves para mitigar riesgos comerciales.',
      suggested_content: 'Ampliá las restricciones con límites explícitos, prohibiciones y requisitos de revisión humana.',
    })
  } else if (!isEmpty(prompt.constraints) && !hasExplicitLimits(prompt.constraints)) {
    suggestions.push({
      suggestion_type: 'weak_constraints',
      reason: 'Las restricciones no declaran límites explícitos (no prometer, sujeto a validación, etc.).',
      suggested_content: 'Incluí frases como "no prometer coberturas", "sujeto a revisión humana" o "no constituye asesoramiento".',
    })
  }

  const categoryKey = prompt.categoryKey?.toLowerCase() ?? null

  if (categoryKey === 'mensajes' && !hasHumanReviewMention(`${prompt.constraints}\n${prompt.output_format}`)) {
    suggestions.push({
      suggestion_type: 'human_review',
      reason: 'Prompt de mensajes comerciales sin mención de revisión humana.',
      suggested_content: 'Indicá que el asesor PLIFE debe revisar y aprobar el mensaje antes de enviarlo al cliente.',
    })
  }

  const riskTerms = collectRiskTermsFromPrompt({
    role_persona: prompt.role_persona,
    context_environment: prompt.context_environment,
    objective: prompt.objective,
    specific_task: prompt.specific_task,
    constraints: prompt.constraints,
    output_format: prompt.output_format,
    target_audience: prompt.target_audience,
  })

  if (riskTerms.length > 0 && !hasExplicitLimits(prompt.constraints)) {
    suggestions.push({
      suggestion_type: 'insurance_risk',
      reason: `El prompt menciona términos sensibles (${riskTerms.slice(0, 4).join(', ')}${riskTerms.length > 4 ? '…' : ''}) sin límites explícitos en restricciones.`,
      suggested_content: 'Aclará en restricciones que no se deben prometer primas, coberturas, aprobaciones ni elegibilidad sin validación humana y condiciones aplicables.',
    })
  }

  if (riskTerms.length > 0 && !hasHumanReviewMention(`${prompt.constraints}\n${prompt.output_format}`)) {
    suggestions.push({
      suggestion_type: 'human_review',
      reason: 'El prompt trata temas sensibles de seguros pero no exige revisión humana.',
      suggested_content: 'Incluí en restricciones o formato de salida que la salida requiere revisión humana antes de usarse comercialmente.',
    })
  }

  return {
    status: aggregateStatus(suggestions),
    suggestions,
  }
}
