// FASE 15I — Calificación comercial simple de leads.
// Vocabulario propio de PLIFE (sin siglas de la industria). Todo se calcula en
// runtime desde los campos actuales del lead: no hay persistencia ni IA externa.

import type { LeadLike } from './types'
import { CONVERTIBLE_LEAD_STAGES } from './constants'
import { isLeadFollowUpOverdue, isLeadFollowUpToday } from './follow-up'

export type LeadQualification =
  | 'unqualified'
  | 'evaluating'
  | 'interested'
  | 'hot'
  | 'ready_for_proposal'
  | 'not_viable'

// Campos opcionales de contacto/interés que viven en la fila real (MockLead)
// pero no en LeadLike. Cualquier objeto con este shape puede calificarse.
export interface LeadQualificationInput extends LeadLike {
  phone?: string | null
  email?: string | null
  interest_area?: string | null
}

export const LEAD_QUALIFICATION_LABELS: Record<LeadQualification, string> = {
  unqualified: 'Sin calificar',
  evaluating: 'En evaluación',
  interested: 'Interesado',
  hot: 'Caliente',
  ready_for_proposal: 'Listo para propuesta',
  not_viable: 'No viable',
}

const LEAD_QUALIFICATION_DESCRIPTIONS: Record<LeadQualification, string> = {
  unqualified: 'Lead capturado, pero falta información básica.',
  evaluating: 'Hay datos iniciales, pero falta entender necesidad, perfil o contexto.',
  interested:
    'Mostró interés real, pero todavía falta confirmar necesidad o próximos pasos.',
  hot: 'Tiene señales fuertes: temperatura alta, prioridad alta, contacto directo, próximo paso cercano o vencido.',
  ready_for_proposal:
    'Hay interés claro, datos suficientes y próximo paso definido para preparar una propuesta.',
  not_viable: 'No corresponde avanzar por ahora.',
}

// Prioridad de atención: mayor número = atender antes.
const LEAD_QUALIFICATION_PRIORITY: Record<LeadQualification, number> = {
  ready_for_proposal: 5,
  hot: 4,
  interested: 3,
  evaluating: 2,
  unqualified: 1,
  not_viable: 0,
}

const RECOMMENDED_ACTIONS: Record<LeadQualification, string> = {
  unqualified: 'Completar los datos básicos del lead antes de avanzar.',
  evaluating: 'Contactar para entender necesidad, perfil y contexto.',
  interested: 'Confirmar la necesidad y acordar el próximo paso.',
  hot: 'Contactar hoy y preparar el enfoque comercial.',
  ready_for_proposal: 'Preparar una propuesta desde este lead.',
  not_viable: 'No invertir tiempo comercial por ahora; revisar más adelante si cambia el contexto.',
}

export function getLeadQualificationLabel(qualification: LeadQualification): string {
  return LEAD_QUALIFICATION_LABELS[qualification]
}

export function getLeadQualificationDescription(qualification: LeadQualification): string {
  return LEAD_QUALIFICATION_DESCRIPTIONS[qualification]
}

export function getLeadQualificationPriority(qualification: LeadQualification): number {
  return LEAD_QUALIFICATION_PRIORITY[qualification]
}

export function getRecommendedActionForQualification(
  qualification: LeadQualification
): string {
  return RECOMMENDED_ACTIONS[qualification]
}

function hasDirectContact(lead: LeadQualificationInput): boolean {
  return Boolean(lead.phone?.trim() || lead.email?.trim())
}

function hasDefinedNextStep(lead: LeadQualificationInput): boolean {
  return Boolean(lead.next_action?.trim() && lead.next_action_date)
}

function hasClearInterest(lead: LeadQualificationInput): boolean {
  return CONVERTIBLE_LEAD_STAGES.includes(lead.pipeline_stage) || lead.temperature === 'hot'
}

function countStrongSignals(lead: LeadQualificationInput, today: Date): number {
  let signals = 0
  if (lead.temperature === 'hot') signals++
  if (lead.priority === 'high') signals++
  if (Boolean(lead.phone?.trim())) signals++
  if (isLeadFollowUpOverdue(lead, today) || isLeadFollowUpToday(lead, today)) signals++
  return signals
}

/**
 * Sugerencia determinística de calificación a partir de los datos actuales.
 * No se guarda: es orientación en pantalla, no reemplaza el criterio comercial.
 */
export function getSuggestedLeadQualification(
  lead: LeadQualificationInput,
  today: Date = new Date()
): LeadQualification {
  // Descartado/archivado: no corresponde avanzar por ahora.
  if (
    lead.status === 'discarded' ||
    lead.status === 'archived' ||
    lead.pipeline_stage === 'descartado'
  ) {
    return 'not_viable'
  }

  // Convertido: el lead ya recorrió el embudo; queda registrado en su punto máximo.
  if (lead.status === 'converted' || lead.pipeline_stage === 'convertido') {
    return 'ready_for_proposal'
  }

  // Listo para propuesta: interés claro + datos suficientes + próximo paso definido.
  if (
    hasClearInterest(lead) &&
    hasDirectContact(lead) &&
    Boolean(lead.interest_area?.trim()) &&
    hasDefinedNextStep(lead)
  ) {
    return 'ready_for_proposal'
  }

  // Caliente: al menos dos señales fuertes.
  if (countStrongSignals(lead, today) >= 2) {
    return 'hot'
  }

  // Interesado: interés real pero faltan datos o próximo paso.
  if (hasClearInterest(lead)) {
    return 'interested'
  }

  // En evaluación: hay algo con qué trabajar.
  if (
    hasDirectContact(lead) ||
    Boolean(lead.interest_area?.trim()) ||
    Boolean(lead.next_action?.trim()) ||
    lead.pipeline_stage === 'contactado' ||
    lead.pipeline_stage === 'calificando'
  ) {
    return 'evaluating'
  }

  return 'unqualified'
}
