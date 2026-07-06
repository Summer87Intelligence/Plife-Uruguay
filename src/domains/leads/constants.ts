import type {
  LeadType,
  LeadSource,
  LeadStatus,
  LeadPipelineStage,
  LeadPriority,
  LeadTemperature,
} from './types'

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  person: 'Persona',
  company: 'Empresa',
  unknown: 'Sin definir',
}

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  manual: 'Carga manual',
  referral: 'Referido',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  web: 'Web',
  call: 'Llamada',
  campaign: 'Campaña',
  radar_b2b: 'Radar B2B',
  other: 'Otro',
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  open: 'Abierto',
  converted: 'Convertido',
  discarded: 'Descartado',
  archived: 'Archivado',
}

export const LEAD_PIPELINE_STAGE_LABELS: Record<LeadPipelineStage, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  calificando: 'Calificando',
  interesado: 'Interesado',
  propuesta_reunion: 'Propuesta / reunión',
  seguimiento: 'Seguimiento',
  convertido: 'Convertido',
  descartado: 'Descartado',
}

export const LEAD_PRIORITY_LABELS: Record<LeadPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
}

export const LEAD_TEMPERATURE_LABELS: Record<LeadTemperature, string> = {
  cold: 'Frío',
  warm: 'Tibio',
  hot: 'Caliente',
}

// Orden canónico del pipeline. La posición define el avance comercial.
export const LEAD_PIPELINE_ORDER: LeadPipelineStage[] = [
  'nuevo',
  'contactado',
  'calificando',
  'interesado',
  'propuesta_reunion',
  'seguimiento',
  'convertido',
  'descartado',
]

export const TERMINAL_LEAD_STAGES: LeadPipelineStage[] = ['convertido', 'descartado']

export const ACTIVE_LEAD_STAGES: LeadPipelineStage[] = [
  'nuevo',
  'contactado',
  'calificando',
  'interesado',
  'propuesta_reunion',
  'seguimiento',
]

// Etapas desde las que un lead calificado puede convertirse en oportunidad
// (decisión FASE 13L/14A: oportunidad = negocio calificado, entidad separada).
export const CONVERTIBLE_LEAD_STAGES: LeadPipelineStage[] = [
  'interesado',
  'propuesta_reunion',
  'seguimiento',
]
