// Dominio de Propuestas (FASE 15E) — flujo mock/determinístico.
// NO usa OpenAI ni proveedores externos. NO persiste datos. NO reintroduce Compliance.
// La salida es un borrador conceptual que requiere validación humana.

import type { EngineId } from '@/domains/intelligence-engines'

export type ProposalTargetType = 'person' | 'company' | 'segment' | 'unknown'

export type ProposalSource =
  | 'lead'
  | 'campaign'
  | 'radar'
  | 'manual'
  | 'market_observation'
  | 'other'

export interface ProposalInput {
  title: string
  context: string
  target_type: ProposalTargetType
  target_description: string
  source: ProposalSource
  /** Contexto de origen (opcional). Solo referencia local; no se consulta a Supabase. */
  source_id?: string
  source_title?: string
  source_context?: string
  objective: string
  known_problem: string
  desired_outcome: string
  notes: string
}

export interface EngineContribution {
  engineId: EngineId
  engineName: string
  questions: string[]
  outputs: string[]
}

export interface ProposalDraft {
  title: string
  summary: string
  targetAudience: string
  problem: string
  opportunity: string
  proposedOffer: string
  differentiators: string[]
  questionsToAsk: string[]
  marketAngles: string[]
  productIdeas: string[]
  commercialStrategy: string[]
  nextSteps: string[]
  risksOrAssumptions: string[]
  engineContributions: EngineContribution[]
}
