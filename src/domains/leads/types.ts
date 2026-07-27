// FASE 14C — Tipos del dominio Lead (capa TypeScript pura).
// La tabla `leads` NO está aplicada todavía (ver supabase/leads-schema-draft.sql).
// Estos tipos son la fuente de verdad para helpers y UI futura; cuando el schema
// se aplique (14B+), src/types/database.ts debe alinearse con estos unions.

export type LeadType = 'person' | 'company' | 'unknown'

export type LeadSource =
  | 'manual'
  | 'referral'
  | 'whatsapp'
  | 'instagram'
  | 'web'
  | 'call'
  | 'campaign'
  | 'radar_b2b'
  | 'other'

export type LeadStatus = 'open' | 'converted' | 'discarded' | 'archived'

export type LeadPipelineStage =
  | 'nuevo'
  | 'contactado'
  | 'calificando'
  | 'interesado'
  | 'propuesta_reunion'
  | 'seguimiento'
  | 'convertido'
  | 'descartado'

export type LeadPriority = 'low' | 'medium' | 'high'

export type LeadTemperature = 'cold' | 'warm' | 'hot'

// Campos mínimos que consumen los helpers del dominio.
// No modela la tabla completa a propósito: cualquier objeto con este shape
// (fila real futura, fixture de test, draft de UI) funciona con los helpers.
export interface LeadLike {
  id: string
  title: string
  lead_type: LeadType
  source: LeadSource
  status: LeadStatus
  pipeline_stage: LeadPipelineStage
  priority: LeadPriority
  temperature: LeadTemperature
  next_action: string | null
  next_action_date: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
  converted_at: string | null
  discarded_at: string | null
}

export type LeadFollowUpBucket = 'overdue' | 'today' | 'missing_next_step' | 'none'

export interface LeadConversionReadiness {
  ready: boolean
  reasons: string[]
}
