export type {
  ProposalTargetType,
  ProposalSource,
  ProposalInput,
  ProposalDraft,
  EngineContribution,
} from './types'
export {
  TARGET_TYPE_OPTIONS,
  TARGET_TYPE_LABELS,
  SOURCE_OPTIONS,
  SOURCE_LABELS,
  PROPOSAL_STATUS_LABELS,
  HEDGE,
  HUMAN_REVIEW_NOTE,
  PROPOSAL_DISCLAIMERS,
  PROPOSALS_SECTION,
} from './constants'
export {
  PROPOSAL_ENGINE_SEQUENCE,
  ENGINE_ROLE_IN_PROPOSAL,
  DRAFT_SECTION_LABELS,
} from './proposal-flow'
export { generateMockProposal } from './mock-generator'
export { parseProposalPrefill } from './prefill'

// FASE 15M — persistencia real
export {
  CreateProposalInputSchema,
  ProposalDraftSchema,
  PROPOSAL_STATUS_VALUES,
  type CreateProposalInput,
  type CreateProposalData,
  type ProposalStatus,
} from './validation'
export {
  buildProposalInsertRow,
  buildLeadScoreSnapshot,
  buildLeadQualificationSnapshot,
  resolveLeadId,
  resolveCampaignId,
  isUuid,
  type ProposalSnapshots,
  type ProposalScoreSnapshot,
  type ProposalQualificationSnapshot,
} from './persistence'
// NOTA: queries.ts (getProposals) es server-only (usa next/headers). No se
// re-exporta desde este barrel para no arrastrarlo a bundles de cliente;
// se importa directo desde '@/domains/proposals/queries' en Server Components.
