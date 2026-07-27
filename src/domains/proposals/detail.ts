// FASE 15N — Normalización defensiva de una propuesta guardada para el detalle read-only.
// El draft/snapshots viven como JSONB (`Json`) en la DB: pueden venir incompletos o con
// forma antigua. Estas funciones son puras y nunca lanzan: siempre devuelven defaults seguros.

import type { Json } from '@/types/database'
import type { EngineContribution, ProposalDraft } from './types'
import type { ProposalScoreSnapshot, ProposalQualificationSnapshot } from './persistence'

function isRecord(value: Json | null | undefined): value is Record<string, Json | undefined> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function str(value: Json | undefined, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function strArray(value: Json | undefined): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === 'string')
}

function normalizeEngineContributions(value: Json | undefined): EngineContribution[] {
  if (!Array.isArray(value)) return []
  return value
    .filter(isRecord)
    .map((entry) => ({
      engineId: str(entry.engineId) as EngineContribution['engineId'],
      engineName: str(entry.engineName),
      questions: strArray(entry.questions),
      outputs: strArray(entry.outputs),
    }))
    .filter((c) => c.engineId.length > 0)
}

/**
 * Convierte el `draft` JSONB almacenado en un ProposalDraft seguro para renderizar.
 * Tolera draft parcial/incompleto (arrays o strings faltantes se completan vacíos).
 */
export function normalizeStoredDraft(draft: Json): ProposalDraft {
  const source = isRecord(draft) ? draft : {}
  return {
    title: str(source.title),
    summary: str(source.summary),
    targetAudience: str(source.targetAudience),
    problem: str(source.problem),
    opportunity: str(source.opportunity),
    proposedOffer: str(source.proposedOffer),
    differentiators: strArray(source.differentiators),
    questionsToAsk: strArray(source.questionsToAsk),
    marketAngles: strArray(source.marketAngles),
    productIdeas: strArray(source.productIdeas),
    commercialStrategy: strArray(source.commercialStrategy),
    nextSteps: strArray(source.nextSteps),
    risksOrAssumptions: strArray(source.risksOrAssumptions),
    engineContributions: normalizeEngineContributions(source.engineContributions),
  }
}

/** Normaliza el score_snapshot (JSONB, puede ser null) para mostrarlo en el detalle. */
export function normalizeScoreSnapshot(value: Json | null): ProposalScoreSnapshot | null {
  if (!isRecord(value)) return null
  const score = typeof value.score === 'number' ? value.score : null
  if (score === null) return null
  return {
    score,
    band: str(value.band),
    band_label: str(value.band_label),
    signals: Array.isArray(value.signals)
      ? value.signals.filter(isRecord).map((s) => ({
          id: str(s.id),
          label: str(s.label),
          points: typeof s.points === 'number' ? s.points : 0,
        }))
      : [],
    captured_at: str(value.captured_at),
  }
}

/** Normaliza el qualification_snapshot (JSONB, puede ser null) para mostrarlo en el detalle. */
export function normalizeQualificationSnapshot(
  value: Json | null
): ProposalQualificationSnapshot | null {
  if (!isRecord(value)) return null
  const qualification = str(value.qualification)
  if (!qualification) return null
  return {
    qualification,
    label: str(value.label),
    description: str(value.description),
    captured_at: str(value.captured_at),
  }
}
