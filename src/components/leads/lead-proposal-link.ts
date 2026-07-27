import type { MockLead } from '@/domains/leads/mock-data'
import {
  LEAD_PIPELINE_STAGE_LABELS,
  LEAD_PRIORITY_LABELS,
  LEAD_TEMPERATURE_LABELS,
} from '@/domains/leads'

// Construye el link a /app/propuestas/nueva con contexto del lead (sin persistencia).
// Compartido por el panel de acciones y el panel de calificación (FASE 15I).
export function buildProposalHref(lead: MockLead) {
  const contextParts = [
    `Etapa: ${LEAD_PIPELINE_STAGE_LABELS[lead.pipeline_stage]}`,
    `Interés: ${lead.interest_area ?? 'sin definir'}`,
    `Próximo paso: ${lead.next_action ?? 'sin definir'}`,
    `Temperatura: ${LEAD_TEMPERATURE_LABELS[lead.temperature]}`,
    `Prioridad: ${LEAD_PRIORITY_LABELS[lead.priority]}`,
  ]
  const query: Record<string, string> = {
    source: 'lead',
    source_id: lead.id,
    source_title: lead.title,
    context: contextParts.join('. ') + '.',
    target_type: lead.lead_type,
  }
  if (lead.interest_area) query.target_description = lead.interest_area
  return { pathname: '/app/propuestas/nueva' as const, query }
}
