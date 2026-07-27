// FASE 15M — Validación server-side para crear una propuesta real.
// NO confía en el cliente: los campos derivados (lead_id/campaign_id, snapshots,
// denormalizaciones) se calculan en el servidor, no se aceptan del payload.
// Sin OpenAI ni proveedor externo. Sin Compliance.

import { z } from 'zod'
import type { ProposalSource, ProposalTargetType } from './types'

// Estados del ciclo de vida comercial (coinciden con el CHECK de la tabla).
// SIN estado de compliance.
export const PROPOSAL_STATUS_VALUES = [
  'draft',
  'in_review',
  'ready',
  'used',
  'archived',
] as const
export type ProposalStatus = (typeof PROPOSAL_STATUS_VALUES)[number]

const PROPOSAL_SOURCE_VALUES = [
  'lead',
  'campaign',
  'radar',
  'manual',
  'market_observation',
  'other',
] as const satisfies readonly ProposalSource[]

const PROPOSAL_TARGET_TYPE_VALUES = [
  'person',
  'company',
  'segment',
  'unknown',
] as const satisfies readonly ProposalTargetType[]

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))

// El borrador (ProposalDraft) es la fuente de verdad; se persiste íntegro como JSONB.
// Se valida su forma para no guardar basura, pero se mantiene tal cual llega.
const engineContributionSchema = z.object({
  engineId: z.string(),
  engineName: z.string(),
  questions: z.array(z.string()),
  outputs: z.array(z.string()),
})

export const ProposalDraftSchema = z.object({
  title: z.string(),
  summary: z.string(),
  targetAudience: z.string(),
  problem: z.string(),
  opportunity: z.string(),
  proposedOffer: z.string(),
  differentiators: z.array(z.string()),
  questionsToAsk: z.array(z.string()),
  marketAngles: z.array(z.string()),
  productIdeas: z.array(z.string()),
  commercialStrategy: z.array(z.string()),
  nextSteps: z.array(z.string()),
  risksOrAssumptions: z.array(z.string()),
  engineContributions: z.array(engineContributionSchema),
})

/**
 * Payload que el cliente puede enviar al crear una propuesta. `.strict()` rechaza
 * cualquier campo de sistema o derivado (lead_id, campaign_id, snapshots,
 * denormalizaciones, created_by, deleted_at, opportunity_id, compliance...): esos
 * se calculan en el servidor. El input del asesor + el draft son lo único confiable.
 */
export const CreateProposalInputSchema = z
  .object({
    title: z.string().trim().min(1, 'El título es requerido.'),
    context: z.string().trim().min(1, 'El contexto es requerido.'),
    status: z.enum(PROPOSAL_STATUS_VALUES).optional(),
    source: z.enum(PROPOSAL_SOURCE_VALUES),
    target_type: z.enum(PROPOSAL_TARGET_TYPE_VALUES),
    target_description: optionalTrimmedString,
    // source_id es texto libre (puede no ser UUID). El servidor decide si además
    // corresponde asignar la FK fuerte lead_id/campaign_id.
    source_id: optionalTrimmedString,
    source_title: optionalTrimmedString,
    source_context: optionalTrimmedString,
    objective: optionalTrimmedString,
    known_problem: optionalTrimmedString,
    desired_outcome: optionalTrimmedString,
    notes: optionalTrimmedString,
    draft: ProposalDraftSchema,
  })
  .strict()

export type CreateProposalInput = z.input<typeof CreateProposalInputSchema>
export type CreateProposalData = z.output<typeof CreateProposalInputSchema>
