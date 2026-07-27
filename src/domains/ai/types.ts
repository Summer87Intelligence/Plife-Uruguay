// Shared AI types & constants. Kept out of the 'use server' actions file because
// a "use server" module may only export async functions (not objects/values).
import type { RiskLevel } from '@/types/database'

export interface AIResult {
  response: string
  riskLevel: RiskLevel
  knowledgeUsed: boolean
  interactionId?: string
  documentsUsed?: string[]
  documentNames?: string[]
}

export const HELP_TYPES = {
  preparar_contacto: 'Preparar contacto',
  preparar_reunion: 'Preparar reunión',
  mensaje_inicial: 'Generar mensaje inicial',
  seguimiento: 'Generar seguimiento',
  objecion: 'Responder objeción',
  resumir_notas: 'Resumir notas',
  proximo_paso: 'Sugerir próximo paso',
} as const

export type HelpType = keyof typeof HELP_TYPES

export type CampaignAITask = 'mensaje_inicial' | 'guion_llamada' | 'objeciones' | 'secuencia_seguimiento'

export const CAMPAIGN_TASK_LABELS: Record<CampaignAITask, string> = {
  mensaje_inicial: 'Generá el mensaje inicial de apertura para el primer contacto.',
  guion_llamada: 'Generá un guion de llamada estructurado.',
  objeciones: 'Generá una lista de objeciones esperadas con respuestas sugeridas (una por línea).',
  secuencia_seguimiento: 'Generá una secuencia de seguimiento en pasos.',
}
