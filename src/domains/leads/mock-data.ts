// FASE 14D — Datos mock locales para la UI conceptual de Leads/Pipeline.
// SIN conexión a Supabase: la tabla `leads` todavía no existe aplicada.
// Todos los registros son claramente demo ("Lead Demo ...").

import type { LeadLike, LeadSource, LeadType } from './types'

export interface MockLead extends LeadLike {
  display_name: string | null
  interest_area: string | null
  phone?: string | null
  email?: string | null
  notes?: string | null
}

function dateKey(daysFromToday: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromToday)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function iso(daysFromToday: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromToday)
  return d.toISOString()
}

function mockLead(input: {
  id: string
  title: string
  display_name: string
  lead_type: LeadType
  source: LeadSource
  pipeline_stage: LeadLike['pipeline_stage']
  status?: LeadLike['status']
  priority?: LeadLike['priority']
  temperature?: LeadLike['temperature']
  interest_area?: string
  phone?: string | null
  email?: string | null
  next_action?: string | null
  next_action_days?: number | null
  converted_at?: string | null
  discarded_at?: string | null
  created_days_ago?: number
}): MockLead {
  const createdDaysAgo = input.created_days_ago ?? 7
  return {
    id: input.id,
    title: input.title,
    display_name: input.display_name,
    lead_type: input.lead_type,
    source: input.source,
    status: input.status ?? 'open',
    pipeline_stage: input.pipeline_stage,
    priority: input.priority ?? 'medium',
    temperature: input.temperature ?? 'warm',
    interest_area: input.interest_area ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    next_action: input.next_action ?? null,
    next_action_date:
      input.next_action_days === null || input.next_action_days === undefined
        ? null
        : dateKey(input.next_action_days),
    assigned_to: 'demo-advisor',
    created_at: iso(-createdDaysAgo),
    updated_at: iso(-1),
    converted_at: input.converted_at ?? null,
    discarded_at: input.discarded_at ?? null,
  }
}

export const MOCK_LEADS: MockLead[] = [
  mockLead({
    id: 'demo-lead-01',
    title: 'Lead Demo Juan Vida',
    display_name: 'Juan Demo',
    lead_type: 'person',
    source: 'whatsapp',
    pipeline_stage: 'nuevo',
    priority: 'high',
    temperature: 'warm',
    interest_area: 'Seguro de vida',
    phone: '+598 99 111 222',
    email: 'juan.demo@ejemplo.uy',
    next_action: null,
    next_action_days: null,
    created_days_ago: 1,
  }),
  mockLead({
    id: 'demo-lead-02',
    title: 'Lead Demo Consulta Web Ahorro',
    display_name: 'Carla Demo',
    lead_type: 'person',
    source: 'web',
    pipeline_stage: 'nuevo',
    temperature: 'cold',
    interest_area: 'Plan de ahorro',
    next_action: 'Llamar para primer contacto',
    next_action_days: 1,
    created_days_ago: 2,
  }),
  mockLead({
    id: 'demo-lead-03',
    title: 'Lead Demo Empresa Beneficios',
    display_name: 'Empresa Demo Beneficios SRL',
    lead_type: 'company',
    source: 'call',
    pipeline_stage: 'contactado',
    priority: 'high',
    interest_area: 'Beneficios para empleados',
    next_action: 'Enviar información institucional',
    next_action_days: 0,
    created_days_ago: 5,
  }),
  mockLead({
    id: 'demo-lead-04',
    title: 'Lead Demo Referido Ahorro',
    display_name: 'Marta Demo',
    lead_type: 'person',
    source: 'referral',
    pipeline_stage: 'calificando',
    temperature: 'warm',
    interest_area: 'Ahorro programado',
    next_action: 'Confirmar interés y capacidad de pago',
    next_action_days: 2,
    created_days_ago: 8,
  }),
  mockLead({
    id: 'demo-lead-05',
    title: 'Lead Demo Radar Clínica',
    display_name: 'Clínica Demo Integral',
    lead_type: 'company',
    source: 'radar_b2b',
    pipeline_stage: 'calificando',
    priority: 'high',
    temperature: 'warm',
    interest_area: 'Cobertura corporativa',
    next_action: 'Identificar interlocutor de RRHH',
    next_action_days: 3,
    created_days_ago: 6,
  }),
  mockLead({
    id: 'demo-lead-06',
    title: 'Lead Demo Campaña Pymes',
    display_name: 'Estudio Demo Contable',
    lead_type: 'company',
    source: 'campaign',
    pipeline_stage: 'interesado',
    priority: 'high',
    temperature: 'hot',
    interest_area: 'Seguro para socios',
    phone: '+598 2 400 5566',
    email: 'contacto@estudiodemo.uy',
    next_action: 'Preparar propuesta conceptual',
    next_action_days: 1,
    created_days_ago: 12,
  }),
  mockLead({
    id: 'demo-lead-07',
    title: 'Lead Demo Instagram Salud',
    display_name: 'Lucía Demo',
    lead_type: 'person',
    source: 'instagram',
    pipeline_stage: 'propuesta_reunion',
    temperature: 'hot',
    interest_area: 'Seguro de salud',
    next_action: 'Reunión de presentación',
    next_action_days: 2,
    created_days_ago: 15,
  }),
  mockLead({
    id: 'demo-lead-08',
    title: 'Lead Demo Seguimiento Vencido',
    display_name: 'Pedro Demo',
    lead_type: 'person',
    source: 'manual',
    pipeline_stage: 'seguimiento',
    temperature: 'warm',
    interest_area: 'Seguro de vida',
    next_action: 'Retomar conversación postergada',
    next_action_days: -3,
    created_days_ago: 30,
  }),
  mockLead({
    id: 'demo-lead-09',
    title: 'Lead Demo Convertido Corporativo',
    display_name: 'Empresa Demo Convertida SA',
    lead_type: 'company',
    source: 'referral',
    pipeline_stage: 'convertido',
    status: 'converted',
    temperature: 'hot',
    interest_area: 'Beneficios corporativos',
    next_action: null,
    next_action_days: null,
    converted_at: iso(-4),
    created_days_ago: 40,
  }),
  mockLead({
    id: 'demo-lead-10',
    title: 'Lead Demo Descartado Sin Interés',
    display_name: 'Contacto Demo Frío',
    lead_type: 'unknown',
    source: 'other',
    pipeline_stage: 'descartado',
    status: 'discarded',
    temperature: 'cold',
    priority: 'low',
    next_action: null,
    next_action_days: null,
    discarded_at: iso(-10),
    created_days_ago: 45,
  }),
]

export function getMockLeadById(id: string): MockLead | undefined {
  return MOCK_LEADS.find((lead) => lead.id === id)
}
