import { createClient } from '@/lib/supabase/server'
import type { MockLead } from './mock-data'
import type {
  LeadPipelineStage,
  LeadPriority,
  LeadSource,
  LeadStatus,
  LeadTemperature,
  LeadType,
} from './types'

const LEAD_COLUMNS =
  'id, title, display_name, lead_type, source, status, pipeline_stage, priority, temperature, interest_area, phone, email, next_action, next_action_date, assigned_to, created_at, updated_at, converted_at, discarded_at' as const

type LeadQueryRow = {
  id: string
  title: string
  display_name: string | null
  lead_type: string
  source: string
  status: string
  pipeline_stage: string
  priority: string
  temperature: string
  interest_area: string | null
  phone: string | null
  email: string | null
  next_action: string | null
  next_action_date: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
  converted_at: string | null
  discarded_at: string | null
}

function toMockLead(row: LeadQueryRow): MockLead {
  return {
    id: row.id,
    title: row.title,
    display_name: row.display_name,
    lead_type: row.lead_type as LeadType,
    source: row.source as LeadSource,
    status: row.status as LeadStatus,
    pipeline_stage: row.pipeline_stage as LeadPipelineStage,
    priority: row.priority as LeadPriority,
    temperature: row.temperature as LeadTemperature,
    interest_area: row.interest_area,
    phone: row.phone,
    email: row.email,
    next_action: row.next_action,
    next_action_date: row.next_action_date,
    assigned_to: row.assigned_to,
    created_at: row.created_at,
    updated_at: row.updated_at,
    converted_at: row.converted_at,
    discarded_at: row.discarded_at,
  }
}

/** Lectura read-only de leads visibles bajo RLS (sin service role). */
export async function getLeads(): Promise<MockLead[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('leads')
    .select(LEAD_COLUMNS)
    .is('deleted_at', null)
    .order('next_action_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(200)

  if (error || !data) return []
  return (data as LeadQueryRow[]).map(toMockLead)
}

/** Lectura read-only de un lead por id. Devuelve null si no existe o RLS lo oculta. */
export async function getLeadById(id: string): Promise<MockLead | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('leads')
    .select(LEAD_COLUMNS)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()

  if (error || !data) return null
  return toMockLead(data as LeadQueryRow)
}
