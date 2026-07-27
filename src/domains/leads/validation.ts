import { z } from 'zod'
import type {
  LeadPipelineStage,
  LeadPriority,
  LeadSource,
  LeadTemperature,
  LeadType,
} from './types'

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

// FASE 14J — Update operativo básico. Solo etapas activas: los estados terminales
// (convertido/descartado) se manejarán por los flujos de conversión/descarte, no acá.
const UPDATABLE_LEAD_STAGE_VALUES = [
  'nuevo',
  'contactado',
  'calificando',
  'interesado',
  'propuesta_reunion',
  'seguimiento',
] as const satisfies readonly LeadPipelineStage[]

/**
 * Campos operativos editables desde el detalle del lead. `.strict()` rechaza
 * cualquier campo de sistema (status, deleted_at, assigned_to, created_by,
 * converted_at, discarded_at, opportunity_id, company_id, contact_id, etc.).
 */
export const updateLeadOperationalSchema = z
  .object({
    lead_id: z.string().uuid('El identificador del lead no es válido.'),
    pipeline_stage: z.enum(UPDATABLE_LEAD_STAGE_VALUES, {
      message: 'La etapa del pipeline no es válida para un update operativo.',
    }),
    priority: z.enum(LEAD_PRIORITY_VALUES, { message: 'La prioridad no es válida.' }),
    temperature: z.enum(LEAD_TEMPERATURE_VALUES, { message: 'La temperatura no es válida.' }),
    next_action: optionalTrimmedString,
    next_action_date: optionalTrimmedString,
    notes: optionalTrimmedString,
  })
  .strict()

export type UpdateLeadOperationalInput = z.input<typeof updateLeadOperationalSchema>
export type UpdateLeadOperationalData = z.output<typeof updateLeadOperationalSchema>
export type UpdatableLeadStage = (typeof UPDATABLE_LEAD_STAGE_VALUES)[number]

export type LeadOperationalUpdate = {
  pipeline_stage: UpdatableLeadStage
  priority: LeadPriority
  temperature: LeadTemperature
  next_action: string | null
  next_action_date: string | null
  notes: string | null
}

/** Construye el payload de UPDATE. Campos opcionales vacíos limpian la columna (null). */
export function buildLeadOperationalUpdate(data: UpdateLeadOperationalData): LeadOperationalUpdate {
  return {
    pipeline_stage: data.pipeline_stage,
    priority: data.priority,
    temperature: data.temperature,
    next_action: data.next_action ?? null,
    next_action_date: data.next_action_date ?? null,
    notes: data.notes ?? null,
  }
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
