// FASE 15M — Mapeo de ProposalInput + ProposalDraft (+ contexto opcional) a la
// fila de insert de public.proposals. Función pura y testeable: no toca Supabase.
//
// NO guarda opportunity_id (la conversión es 15O). NO guarda compliance/legal_review.
// NO guarda proveedor/modelo externo. El borrador es determinístico interno.

import type { CreateProposalData } from './validation'
import type { LeadQualificationInput } from '@/domains/leads'
import {
  calculateLeadScore,
  getLeadScoreBand,
  getLeadScoreBandLabel,
  getLeadScoreSignals,
  getSuggestedLeadQualification,
  getLeadQualificationLabel,
  getLeadQualificationDescription,
} from '@/domains/leads'

// Snapshots congelados del lead (FASE 15I) al momento de crear la propuesta.
export interface ProposalScoreSnapshot {
  score: number
  band: string
  band_label: string
  signals: { id: string; label: string; points: number }[]
  captured_at: string
}

export interface ProposalQualificationSnapshot {
  qualification: string
  label: string
  description: string
  captured_at: string
}

export interface ProposalSnapshots {
  score_snapshot?: ProposalScoreSnapshot | null
  qualification_snapshot?: ProposalQualificationSnapshot | null
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** true si el valor es un UUID canónico. Evita forzar una FK con basura textual. */
export function isUuid(value: string | null | undefined): value is string {
  return typeof value === 'string' && UUID_RE.test(value.trim())
}

/**
 * Deriva la FK fuerte al lead: solo si el origen es 'lead' y source_id es un UUID.
 * Un source_id no-UUID (referencia libre) queda solo como rastro textual.
 */
export function resolveLeadId(data: CreateProposalData): string | null {
  return data.source === 'lead' && isUuid(data.source_id) ? data.source_id! : null
}

/** Deriva la FK fuerte a la campaña: solo si el origen es 'campaign' y source_id es UUID. */
export function resolveCampaignId(data: CreateProposalData): string | null {
  return data.source === 'campaign' && isUuid(data.source_id) ? data.source_id! : null
}

/**
 * Construye la fila de insert para public.proposals.
 * `draft` (JSONB) es la fuente de verdad; summary/target_audience/problem/
 * opportunity/proposed_offer son denormalizaciones extraídas del draft para listar.
 */
export function buildProposalInsertRow(
  data: CreateProposalData,
  userId: string,
  snapshots: ProposalSnapshots = {}
): Record<string, unknown> {
  const draft = data.draft

  return {
    created_by: userId,
    assigned_to: userId,

    title: data.title,
    status: data.status ?? 'draft',

    source: data.source,
    source_id: data.source_id ?? null,
    source_title: data.source_title ?? null,
    source_context: data.source_context ?? null,

    // FKs fuertes solo cuando el origen coincide y source_id es un UUID válido.
    lead_id: resolveLeadId(data),
    campaign_id: resolveCampaignId(data),

    target_type: data.target_type,
    target_description: data.target_description ?? null,

    context: data.context,
    objective: data.objective ?? null,
    known_problem: data.known_problem ?? null,
    desired_outcome: data.desired_outcome ?? null,
    notes: data.notes ?? null,

    // Borrador completo (fuente de verdad).
    draft,
    // Denormalizaciones para listar/buscar sin deserializar el JSON.
    summary: draft.summary || null,
    target_audience: draft.targetAudience || null,
    problem: draft.problem || null,
    opportunity: draft.opportunity || null,
    proposed_offer: draft.proposedOffer || null,

    // Snapshots del lead (si vino desde lead y se pudo leer). Null si no aplica.
    score_snapshot: snapshots.score_snapshot ?? null,
    qualification_snapshot: snapshots.qualification_snapshot ?? null,

    metadata: {},
  }
}

/** Snapshot congelado del score del lead (FASE 15I). */
export function buildLeadScoreSnapshot(
  lead: LeadQualificationInput,
  capturedAt: string = new Date().toISOString()
): ProposalScoreSnapshot {
  const score = calculateLeadScore(lead)
  const band = getLeadScoreBand(score)
  return {
    score,
    band,
    band_label: getLeadScoreBandLabel(band),
    signals: getLeadScoreSignals(lead),
    captured_at: capturedAt,
  }
}

/** Snapshot congelado de la calificación sugerida del lead (FASE 15I). */
export function buildLeadQualificationSnapshot(
  lead: LeadQualificationInput,
  capturedAt: string = new Date().toISOString()
): ProposalQualificationSnapshot {
  const qualification = getSuggestedLeadQualification(lead)
  return {
    qualification,
    label: getLeadQualificationLabel(qualification),
    description: getLeadQualificationDescription(qualification),
    captured_at: capturedAt,
  }
}
