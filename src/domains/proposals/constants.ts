import type { ProposalTargetType, ProposalSource } from './types'

export const TARGET_TYPE_OPTIONS: { value: ProposalTargetType; label: string }[] = [
  { value: 'unknown', label: 'Sin definir todavía' },
  { value: 'person', label: 'Persona' },
  { value: 'company', label: 'Empresa' },
  { value: 'segment', label: 'Segmento / nicho' },
]

export const TARGET_TYPE_LABELS: Record<ProposalTargetType, string> = {
  person: 'Persona',
  company: 'Empresa',
  segment: 'Segmento / nicho',
  unknown: 'Sin definir',
}

export const SOURCE_OPTIONS: { value: ProposalSource; label: string }[] = [
  { value: 'manual', label: 'Idea manual' },
  { value: 'lead', label: 'Lead' },
  { value: 'campaign', label: 'Campaña' },
  { value: 'radar', label: 'Radar B2B' },
  { value: 'market_observation', label: 'Observación de mercado' },
  { value: 'other', label: 'Otro' },
]

export const SOURCE_LABELS: Record<ProposalSource, string> = {
  lead: 'Lead',
  campaign: 'Campaña',
  radar: 'Radar B2B',
  manual: 'Idea manual',
  market_observation: 'Observación de mercado',
  other: 'Otro',
}

// FASE 15M — Etiquetas del ciclo de vida comercial (sin estado de compliance).
export const PROPOSAL_STATUS_LABELS: Record<
  'draft' | 'in_review' | 'ready' | 'used' | 'archived',
  string
> = {
  draft: 'Borrador',
  in_review: 'En revisión',
  ready: 'Lista',
  used: 'Usada',
  archived: 'Archivada',
}

// Frases prudentes que el generador usa para no afirmar datos reales como hechos.
export const HEDGE = {
  hypothesis: 'Hipótesis a validar',
  angle: 'Ángulo posible',
  questions: 'Preguntas para confirmar',
  initialOffer: 'Propuesta inicial',
} as const

export const HUMAN_REVIEW_NOTE = 'No sustituye análisis comercial humano.'

export const PROPOSAL_DISCLAIMERS = {
  notSaved: 'Este borrador no está guardado. Es conceptual y no se persiste en esta fase.',
  noProvider: 'Generado en modo determinístico interno, sin OpenAI ni proveedores externos.',
  humanReview: 'Es un borrador conceptual que requiere validación humana antes de usarse.',
  noMarketData: 'No afirma datos reales de mercado ni competidores específicos como hechos.',
} as const

export const PROPOSALS_SECTION = {
  title: 'Propuestas',
  subtitle:
    'Flujo conceptual para ordenar una idea comercial con los motores y generar un borrador de propuesta.',
  emptyState:
    'Todavía no hay propuestas guardadas. En esta fase podés generar un borrador conceptual.',
} as const
