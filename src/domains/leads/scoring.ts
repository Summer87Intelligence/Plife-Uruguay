// FASE 15I — Score simple de prioridad de leads (0–100).
// Cálculo determinístico en runtime desde los campos actuales del lead.
// Sin IA externa, sin datos de mercado, sin persistencia.

import type { LeadSource } from './types'
import type { LeadQualificationInput } from './qualification'

export type LeadScoreBand = 'low' | 'medium' | 'high' | 'very_high'

export interface LeadScoreSignal {
  id: string
  label: string
  points: number
}

const HIGH_INTENT_SOURCES: LeadSource[] = ['whatsapp', 'call', 'referral']
const ADVANCED_STAGES = ['interesado', 'propuesta_reunion', 'seguimiento'] as const

export const LEAD_SCORE_BAND_LABELS: Record<LeadScoreBand, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
  very_high: 'Muy alto',
}

const LEAD_SCORE_RECOMMENDATIONS: Record<LeadScoreBand, string> = {
  low: 'Completar datos antes de avanzar.',
  medium: 'Calificar necesidad y definir próximo paso.',
  high: 'Contactar pronto y preparar enfoque comercial.',
  very_high: 'Priorizar hoy y considerar propuesta.',
}

/**
 * Señales detectadas en el lead con su aporte al score.
 * La suma teórica máxima supera 100; el score se recorta a 100.
 */
export function getLeadScoreSignals(lead: LeadQualificationInput): LeadScoreSignal[] {
  const signals: LeadScoreSignal[] = []

  if (lead.phone?.trim()) {
    signals.push({ id: 'phone', label: 'Tiene teléfono de contacto', points: 10 })
  }
  if (lead.email?.trim()) {
    signals.push({ id: 'email', label: 'Tiene email de contacto', points: 10 })
  }
  if (HIGH_INTENT_SOURCES.includes(lead.source)) {
    signals.push({ id: 'source', label: 'Origen de contacto directo (WhatsApp, llamada o referido)', points: 15 })
  }
  if (lead.temperature === 'hot') {
    signals.push({ id: 'temperature', label: 'Temperatura caliente', points: 20 })
  }
  if (lead.priority === 'high') {
    signals.push({ id: 'priority', label: 'Prioridad alta', points: 15 })
  }
  if ((ADVANCED_STAGES as readonly string[]).includes(lead.pipeline_stage)) {
    signals.push({ id: 'stage', label: 'Etapa avanzada del pipeline', points: 20 })
  }
  if (lead.next_action?.trim() && lead.next_action_date) {
    signals.push({ id: 'next_step', label: 'Próximo paso definido con fecha', points: 10 })
  }
  if (lead.interest_area?.trim()) {
    signals.push({ id: 'interest', label: 'Interés declarado', points: 10 })
  }

  return signals
}

export function calculateLeadScore(lead: LeadQualificationInput): number {
  const total = getLeadScoreSignals(lead).reduce((sum, signal) => sum + signal.points, 0)
  return Math.min(100, total)
}

export function getLeadScoreBand(score: number): LeadScoreBand {
  if (score >= 80) return 'very_high'
  if (score >= 60) return 'high'
  if (score >= 30) return 'medium'
  return 'low'
}

export function getLeadScoreBandLabel(band: LeadScoreBand): string {
  return LEAD_SCORE_BAND_LABELS[band]
}

export function getLeadScoreRecommendation(score: number): string {
  return LEAD_SCORE_RECOMMENDATIONS[getLeadScoreBand(score)]
}
