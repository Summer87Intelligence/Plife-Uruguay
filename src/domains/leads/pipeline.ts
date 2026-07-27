import type { LeadLike, LeadPipelineStage } from './types'
import {
  LEAD_PIPELINE_ORDER,
  LEAD_PIPELINE_STAGE_LABELS,
  TERMINAL_LEAD_STAGES,
  ACTIVE_LEAD_STAGES,
} from './constants'

export function getLeadStageLabel(stage: LeadPipelineStage): string {
  return LEAD_PIPELINE_STAGE_LABELS[stage]
}

export function getLeadStageOrder(stage: LeadPipelineStage): number {
  return LEAD_PIPELINE_ORDER.indexOf(stage)
}

export function isTerminalLeadStage(stage: LeadPipelineStage): boolean {
  return TERMINAL_LEAD_STAGES.includes(stage)
}

export function isActiveLeadStage(stage: LeadPipelineStage): boolean {
  return ACTIVE_LEAD_STAGES.includes(stage)
}

// Reglas de transición:
// - Desde una etapa terminal (convertido/descartado) no se sale.
//   Reactivar un lead terminal será una acción administrativa futura, no una
//   transición normal de pipeline.
// - Entre etapas activas se puede avanzar y retroceder libremente (el contexto
//   comercial cambia; el pipeline refleja realidad, no la fuerza).
// - Cualquier etapa activa puede pasar a terminal (convertir o descartar).
export function canMoveLeadToStage(
  current: LeadPipelineStage,
  next: LeadPipelineStage
): boolean {
  if (current === next) return false
  if (isTerminalLeadStage(current)) return false
  return true
}

// Siguiente etapa sugerida en el flujo natural. Desde 'seguimiento' el paso
// recomendado es 'convertido'. Las terminales no tienen siguiente.
export function getNextRecommendedStage(
  current: LeadPipelineStage
): LeadPipelineStage | null {
  if (isTerminalLeadStage(current)) return null
  const index = LEAD_PIPELINE_ORDER.indexOf(current)
  const next = LEAD_PIPELINE_ORDER[index + 1]
  return next === 'descartado' ? null : (next ?? null)
}

export function sortLeadsByPipelineOrder<T extends LeadLike>(leads: T[]): T[] {
  return [...leads].sort(
    (a, b) => getLeadStageOrder(a.pipeline_stage) - getLeadStageOrder(b.pipeline_stage)
  )
}
