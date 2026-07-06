import { describe, expect, it } from 'vitest'
import {
  buildLeadInsertRow,
  CreateLeadInputSchema,
  LEAD_CREATE_DEFAULTS,
} from '@/domains/leads/validation'
import {
  LEAD_PIPELINE_ORDER,
  LEAD_PIPELINE_STAGE_LABELS,
  TERMINAL_LEAD_STAGES,
  ACTIVE_LEAD_STAGES,
  getLeadStageLabel,
  getLeadStageOrder,
  isTerminalLeadStage,
  isActiveLeadStage,
  canMoveLeadToStage,
  getNextRecommendedStage,
  sortLeadsByPipelineOrder,
  canConvertLeadToOpportunity,
  getLeadConversionReadiness,
  isLeadFollowUpOverdue,
  isLeadFollowUpToday,
  isLeadMissingNextStep,
  getLeadFollowUpBucket,
  type LeadLike,
  type LeadPipelineStage,
  type LeadStatus,
} from '@/domains/leads'

const baseLead: LeadLike = {
  id: 'lead-1',
  title: 'Lead de prueba',
  lead_type: 'unknown',
  source: 'manual',
  status: 'open',
  pipeline_stage: 'nuevo',
  priority: 'medium',
  temperature: 'warm',
  next_action: 'Llamar',
  next_action_date: '2026-07-06',
  assigned_to: 'user-1',
  created_at: '2026-07-01T00:00:00Z',
  updated_at: '2026-07-01T00:00:00Z',
  converted_at: null,
  discarded_at: null,
}

function makeLead(overrides: Partial<LeadLike>): LeadLike {
  return { ...baseLead, ...overrides }
}

const TODAY = new Date(2026, 6, 6) // 2026-07-06 local

describe('CreateLeadInputSchema', () => {
  it('accepts minimal valid input', () => {
    const parsed = CreateLeadInputSchema.safeParse({ title: 'Lead mínimo' })
    expect(parsed.success).toBe(true)
    if (!parsed.success) return
    expect(parsed.data.title).toBe('Lead mínimo')
  })

  it('rejects empty title', () => {
    const parsed = CreateLeadInputSchema.safeParse({ title: '  ' })
    expect(parsed.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const parsed = CreateLeadInputSchema.safeParse({
      title: 'Lead con email',
      email: 'no-es-email',
    })
    expect(parsed.success).toBe(false)
  })

  it('applies expected defaults in insert row', () => {
    const parsed = CreateLeadInputSchema.parse({ title: 'Lead demo' })
    const row = buildLeadInsertRow(parsed, 'user-abc')
    expect(row).toMatchObject({
      title: 'Lead demo',
      lead_type: LEAD_CREATE_DEFAULTS.lead_type,
      source: LEAD_CREATE_DEFAULTS.source,
      priority: LEAD_CREATE_DEFAULTS.priority,
      temperature: LEAD_CREATE_DEFAULTS.temperature,
      status: 'open',
      pipeline_stage: 'nuevo',
      created_by: 'user-abc',
      assigned_to: 'user-abc',
    })
  })

  it('rejects server-controlled fields from client input', () => {
    const parsed = CreateLeadInputSchema.safeParse({
      title: 'Lead con stage',
      pipeline_stage: 'convertido',
      status: 'converted',
      created_by: 'otro-user',
      assigned_to: 'otro-user',
    })
    expect(parsed.success).toBe(false)
  })
})

describe('labels', () => {
  it('has a Spanish label for every pipeline stage', () => {
    for (const stage of LEAD_PIPELINE_ORDER) {
      expect(LEAD_PIPELINE_STAGE_LABELS[stage]).toBeTruthy()
    }
  })

  it('returns expected labels', () => {
    expect(getLeadStageLabel('nuevo')).toBe('Nuevo')
    expect(getLeadStageLabel('propuesta_reunion')).toBe('Propuesta / reunión')
    expect(getLeadStageLabel('convertido')).toBe('Convertido')
  })
})

describe('pipeline order', () => {
  it('orders stages canonically', () => {
    expect(getLeadStageOrder('nuevo')).toBe(0)
    expect(getLeadStageOrder('contactado')).toBe(1)
    expect(getLeadStageOrder('seguimiento')).toBe(5)
    expect(getLeadStageOrder('descartado')).toBe(7)
  })

  it('active + terminal stages cover the full order', () => {
    expect([...ACTIVE_LEAD_STAGES, ...TERMINAL_LEAD_STAGES].sort()).toEqual(
      [...LEAD_PIPELINE_ORDER].sort()
    )
  })
})

describe('terminal stages', () => {
  it('convertido and descartado are terminal', () => {
    expect(isTerminalLeadStage('convertido')).toBe(true)
    expect(isTerminalLeadStage('descartado')).toBe(true)
    expect(isTerminalLeadStage('nuevo')).toBe(false)
    expect(isTerminalLeadStage('seguimiento')).toBe(false)
  })

  it('active stages are not terminal', () => {
    for (const stage of ACTIVE_LEAD_STAGES) {
      expect(isActiveLeadStage(stage)).toBe(true)
      expect(isTerminalLeadStage(stage)).toBe(false)
    }
  })
})

describe('canMoveLeadToStage', () => {
  it('blocks any move out of terminal stages', () => {
    for (const next of LEAD_PIPELINE_ORDER) {
      if (next !== 'convertido') expect(canMoveLeadToStage('convertido', next)).toBe(false)
      if (next !== 'descartado') expect(canMoveLeadToStage('descartado', next)).toBe(false)
    }
  })

  it('allows moving forward between active stages', () => {
    expect(canMoveLeadToStage('nuevo', 'contactado')).toBe(true)
    expect(canMoveLeadToStage('calificando', 'interesado')).toBe(true)
  })

  it('allows moving backward between active stages', () => {
    expect(canMoveLeadToStage('interesado', 'calificando')).toBe(true)
    expect(canMoveLeadToStage('seguimiento', 'contactado')).toBe(true)
  })

  it('allows moving from active to terminal', () => {
    expect(canMoveLeadToStage('seguimiento', 'convertido')).toBe(true)
    expect(canMoveLeadToStage('calificando', 'descartado')).toBe(true)
  })

  it('rejects a no-op move to the same stage', () => {
    expect(canMoveLeadToStage('nuevo', 'nuevo')).toBe(false)
  })
})

describe('getNextRecommendedStage', () => {
  it('recommends the natural next stage', () => {
    expect(getNextRecommendedStage('nuevo')).toBe('contactado')
    expect(getNextRecommendedStage('interesado')).toBe('propuesta_reunion')
    expect(getNextRecommendedStage('seguimiento')).toBe('convertido')
  })

  it('returns null for terminal stages', () => {
    expect(getNextRecommendedStage('convertido')).toBeNull()
    expect(getNextRecommendedStage('descartado')).toBeNull()
  })
})

describe('sortLeadsByPipelineOrder', () => {
  it('sorts by pipeline order without mutating input', () => {
    const leads = [
      makeLead({ id: 'c', pipeline_stage: 'seguimiento' }),
      makeLead({ id: 'a', pipeline_stage: 'nuevo' }),
      makeLead({ id: 'b', pipeline_stage: 'interesado' }),
    ]
    const sorted = sortLeadsByPipelineOrder(leads)
    expect(sorted.map((l) => l.id)).toEqual(['a', 'b', 'c'])
    expect(leads.map((l) => l.id)).toEqual(['c', 'a', 'b'])
  })
})

describe('conversion rules', () => {
  const notQualified: LeadPipelineStage[] = ['nuevo', 'contactado', 'calificando']
  const qualified: LeadPipelineStage[] = ['interesado', 'propuesta_reunion', 'seguimiento']

  it.each(notQualified)('blocks conversion in stage %s', (stage) => {
    const lead = makeLead({ pipeline_stage: stage })
    expect(canConvertLeadToOpportunity(lead)).toBe(false)
    expect(getLeadConversionReadiness(lead).reasons).toContain(
      'El lead todavía no está calificado.'
    )
  })

  it.each(qualified)('allows conversion in stage %s', (stage) => {
    const lead = makeLead({ pipeline_stage: stage })
    expect(canConvertLeadToOpportunity(lead)).toBe(true)
    expect(getLeadConversionReadiness(lead).reasons).toEqual([])
  })

  it('blocks re-converting an already converted lead', () => {
    const lead = makeLead({
      status: 'converted',
      pipeline_stage: 'convertido',
      converted_at: '2026-07-05T00:00:00Z',
    })
    expect(canConvertLeadToOpportunity(lead)).toBe(false)
    expect(getLeadConversionReadiness(lead).reasons).toContain('El lead ya fue convertido.')
  })

  it('blocks converting discarded and archived leads', () => {
    expect(canConvertLeadToOpportunity(makeLead({ status: 'discarded' }))).toBe(false)
    expect(canConvertLeadToOpportunity(makeLead({ status: 'archived' }))).toBe(false)
  })

  it('requires a next action to convert', () => {
    const lead = makeLead({ pipeline_stage: 'interesado', next_action: null })
    expect(canConvertLeadToOpportunity(lead)).toBe(false)
    expect(getLeadConversionReadiness(lead).reasons).toContain(
      'Falta definir un próximo paso antes de convertir.'
    )
  })

  it('requires a title to convert', () => {
    const lead = makeLead({ pipeline_stage: 'interesado', title: '   ' })
    expect(getLeadConversionReadiness(lead).reasons).toContain('El lead no tiene título.')
  })
})

describe('follow-up buckets', () => {
  it('detects overdue leads', () => {
    const lead = makeLead({ next_action_date: '2026-07-05' })
    expect(isLeadFollowUpOverdue(lead, TODAY)).toBe(true)
    expect(getLeadFollowUpBucket(lead, TODAY)).toBe('overdue')
  })

  it('detects leads due today', () => {
    const lead = makeLead({ next_action_date: '2026-07-06' })
    expect(isLeadFollowUpToday(lead, TODAY)).toBe(true)
    expect(getLeadFollowUpBucket(lead, TODAY)).toBe('today')
  })

  it('future dates fall in no bucket', () => {
    const lead = makeLead({ next_action_date: '2026-07-10' })
    expect(getLeadFollowUpBucket(lead, TODAY)).toBe('none')
  })

  it('detects missing next step', () => {
    expect(isLeadMissingNextStep(makeLead({ next_action: null }))).toBe(true)
    expect(isLeadMissingNextStep(makeLead({ next_action_date: null }))).toBe(true)
    expect(getLeadFollowUpBucket(makeLead({ next_action: null }), TODAY)).toBe(
      'missing_next_step'
    )
  })

  it('accepts ISO timestamps in next_action_date', () => {
    const lead = makeLead({ next_action_date: '2026-07-05T15:30:00Z' })
    expect(isLeadFollowUpOverdue(lead, TODAY)).toBe(true)
  })

  const terminalStatuses: LeadStatus[] = ['converted', 'discarded', 'archived']

  it.each(terminalStatuses)('excludes %s leads from active follow-up', (status) => {
    const overdue = makeLead({ status, next_action_date: '2026-07-01' })
    expect(isLeadFollowUpOverdue(overdue, TODAY)).toBe(false)
    expect(isLeadFollowUpToday(makeLead({ status }), TODAY)).toBe(false)
    expect(isLeadMissingNextStep(makeLead({ status, next_action: null }))).toBe(false)
    expect(getLeadFollowUpBucket(overdue, TODAY)).toBe('none')
  })
})
