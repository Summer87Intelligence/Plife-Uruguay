import type { LeadLike, LeadConversionReadiness } from './types'
import { CONVERTIBLE_LEAD_STAGES } from './constants'

// Regla FASE 13L/14A: la oportunidad es el negocio calificado.
// Un lead solo puede convertirse en oportunidad cuando:
// - sigue abierto (no convertido, no descartado, no archivado)
// - alcanzó una etapa calificada (interesado, propuesta_reunion, seguimiento)
// - tiene título y próximo paso definidos
// Estos helpers NO crean la oportunidad — solo evalúan elegibilidad (la
// creación real llega en 14F con server actions).

export function getLeadConversionReadiness(lead: LeadLike): LeadConversionReadiness {
  const reasons: string[] = []

  if (lead.status === 'converted') {
    reasons.push('El lead ya fue convertido.')
  } else if (lead.status === 'discarded') {
    reasons.push('El lead fue descartado.')
  } else if (lead.status === 'archived') {
    reasons.push('El lead está archivado.')
  }

  if (lead.status === 'open' && !CONVERTIBLE_LEAD_STAGES.includes(lead.pipeline_stage)) {
    reasons.push('El lead todavía no está calificado.')
  }

  if (!lead.title.trim()) {
    reasons.push('El lead no tiene título.')
  }

  if (!lead.next_action?.trim()) {
    reasons.push('Falta definir un próximo paso antes de convertir.')
  }

  return { ready: reasons.length === 0, reasons }
}

export function canConvertLeadToOpportunity(lead: LeadLike): boolean {
  return getLeadConversionReadiness(lead).ready
}
