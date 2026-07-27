import { SOURCE_OPTIONS, TARGET_TYPE_OPTIONS } from './constants'
import type { ProposalInput, ProposalSource, ProposalTargetType } from './types'

type RawParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

const VALID_SOURCES = new Set<string>(SOURCE_OPTIONS.map((o) => o.value))
const VALID_TARGET_TYPES = new Set<string>(TARGET_TYPE_OPTIONS.map((o) => o.value))

/**
 * Construye un prefill seguro del formulario de propuesta a partir de query params.
 * Solo acepta campos conocidos y valida enums. No consulta datos externos.
 */
export function parseProposalPrefill(params: RawParams): Partial<ProposalInput> {
  const prefill: Partial<ProposalInput> = {}

  const source = first(params.source)
  if (VALID_SOURCES.has(source)) prefill.source = source as ProposalSource

  const targetType = first(params.target_type)
  if (VALID_TARGET_TYPES.has(targetType)) {
    prefill.target_type = targetType as ProposalTargetType
  }

  const sourceId = first(params.source_id).trim()
  if (sourceId) prefill.source_id = sourceId

  const sourceTitle = first(params.source_title).trim()
  if (sourceTitle) {
    prefill.source_title = sourceTitle
    // Si no llega título propio, usar el del origen como sugerencia inicial.
    prefill.title = sourceTitle
  }

  const context = first(params.context).trim()
  if (context) {
    prefill.context = context
    prefill.source_context = context
  }

  const targetDescription = first(params.target_description).trim()
  if (targetDescription) prefill.target_description = targetDescription

  return prefill
}
