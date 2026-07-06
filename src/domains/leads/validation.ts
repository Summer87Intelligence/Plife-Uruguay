import { z } from 'zod'
import type { LeadPriority, LeadSource, LeadTemperature, LeadType } from './types'

const LEAD_TYPE_VALUES = ['person', 'company', 'unknown'] as const satisfies readonly LeadType[]
const LEAD_SOURCE_VALUES = [
  'manual',
  'referral',
  'whatsapp',
  'instagram',
  'web',
  'call',
  'campaign',
  'radar_b2b',
  'other',
] as const satisfies readonly LeadSource[]
const LEAD_PRIORITY_VALUES = ['low', 'medium', 'high'] as const satisfies readonly LeadPriority[]
const LEAD_TEMPERATURE_VALUES = ['cold', 'warm', 'hot'] as const satisfies readonly LeadTemperature[]

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(
    z.union([z.undefined(), z.literal(''), z.string().email('El email no tiene un formato válido.')])
  )
  .transform((value) => (value === '' ? undefined : value))

/** Campos que el cliente puede enviar al crear un lead. Campos de sistema se ignoran vía `.strict()`. */
export const CreateLeadInputSchema = z
  .object({
    title: z.string().trim().min(2, 'El título debe tener al menos 2 caracteres.'),
    lead_type: z.enum(LEAD_TYPE_VALUES).optional(),
    source: z.enum(LEAD_SOURCE_VALUES).optional(),
    priority: z.enum(LEAD_PRIORITY_VALUES).optional(),
    temperature: z.enum(LEAD_TEMPERATURE_VALUES).optional(),
    interest_area: optionalTrimmedString,
    phone: optionalTrimmedString,
    email: optionalEmail,
    next_action: optionalTrimmedString,
    next_action_date: optionalTrimmedString,
    notes: optionalTrimmedString,
  })
  .strict()

export type CreateLeadInput = z.infer<typeof CreateLeadInputSchema>

export type LeadInsertDefaults = {
  lead_type: LeadType
  source: LeadSource
  priority: LeadPriority
  temperature: LeadTemperature
  status: 'open'
  pipeline_stage: 'nuevo'
}

export const LEAD_CREATE_DEFAULTS: LeadInsertDefaults = {
  lead_type: 'unknown',
  source: 'manual',
  priority: 'medium',
  temperature: 'warm',
  status: 'open',
  pipeline_stage: 'nuevo',
}

export function buildLeadInsertRow(
  input: CreateLeadInput,
  userId: string
): Record<string, unknown> {
  return {
    title: input.title,
    lead_type: input.lead_type ?? LEAD_CREATE_DEFAULTS.lead_type,
    source: input.source ?? LEAD_CREATE_DEFAULTS.source,
    priority: input.priority ?? LEAD_CREATE_DEFAULTS.priority,
    temperature: input.temperature ?? LEAD_CREATE_DEFAULTS.temperature,
    status: LEAD_CREATE_DEFAULTS.status,
    pipeline_stage: LEAD_CREATE_DEFAULTS.pipeline_stage,
    interest_area: input.interest_area ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    next_action: input.next_action ?? null,
    next_action_date: input.next_action_date ?? null,
    notes: input.notes ?? null,
    created_by: userId,
    assigned_to: userId,
  }
}
