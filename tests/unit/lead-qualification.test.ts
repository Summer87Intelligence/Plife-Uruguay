import { describe, expect, it } from 'vitest'
import {
  LEAD_QUALIFICATION_LABELS,
  getLeadQualificationLabel,
  getLeadQualificationDescription,
  getLeadQualificationPriority,
  getRecommendedActionForQualification,
  getSuggestedLeadQualification,
  type LeadQualification,
  type LeadQualificationInput,
} from '@/domains/leads/qualification'
import {
  LEAD_SCORE_BAND_LABELS,
  calculateLeadScore,
  getLeadScoreBand,
  getLeadScoreBandLabel,
  getLeadScoreRecommendation,
  getLeadScoreSignals,
  type LeadScoreBand,
} from '@/domains/leads/scoring'

const TODAY = new Date(2026, 6, 7) // 2026-07-07 local

// Lead mínimo: capturado sin datos de contacto, interés ni próximo paso.
const emptyLead: LeadQualificationInput = {
  id: 'lead-1',
  title: 'Lead de prueba',
  lead_type: 'unknown',
  source: 'manual',
  status: 'open',
  pipeline_stage: 'nuevo',
  priority: 'medium',
  temperature: 'warm',
  next_action: null,
  next_action_date: null,
  assigned_to: 'user-1',
  created_at: '2026-07-01T00:00:00Z',
  updated_at: '2026-07-01T00:00:00Z',
  converted_at: null,
  discarded_at: null,
  phone: null,
  email: null,
  interest_area: null,
}

function makeLead(overrides: Partial<LeadQualificationInput>): LeadQualificationInput {
  return { ...emptyLead, ...overrides }
}

describe('calculateLeadScore / bands', () => {
  it('scores an empty lead as low (0)', () => {
    expect(calculateLeadScore(emptyLead)).toBe(0)
    expect(getLeadScoreBand(0)).toBe('low')
  })

  it('scores partial contact data as medium', () => {
    // teléfono (10) + email (10) + interés (10) = 30
    const lead = makeLead({ phone: '099123456', email: 'a@b.uy', interest_area: 'Vida' })
    const score = calculateLeadScore(lead)
    expect(score).toBe(30)
    expect(getLeadScoreBand(score)).toBe('medium')
  })

  it('scores strong commercial signals as high', () => {
    // teléfono (10) + email (10) + whatsapp (15) + prioridad alta (15) + interés (10) = 60
    const lead = makeLead({
      phone: '099123456',
      email: 'a@b.uy',
      source: 'whatsapp',
      priority: 'high',
      interest_area: 'Vida',
    })
    const score = calculateLeadScore(lead)
    expect(score).toBe(60)
    expect(getLeadScoreBand(score)).toBe('high')
  })

  it('scores a fully loaded lead as very high, clamped to 100', () => {
    const lead = makeLead({
      phone: '099123456',
      email: 'a@b.uy',
      source: 'referral',
      temperature: 'hot',
      priority: 'high',
      pipeline_stage: 'interesado',
      next_action: 'Presentar propuesta',
      next_action_date: '2026-07-09',
      interest_area: 'Vida + AAP',
    })
    const score = calculateLeadScore(lead)
    expect(score).toBe(100)
    expect(getLeadScoreBand(score)).toBe('very_high')
  })

  it('band boundaries follow 0-29 / 30-59 / 60-79 / 80-100', () => {
    expect(getLeadScoreBand(29)).toBe('low')
    expect(getLeadScoreBand(30)).toBe('medium')
    expect(getLeadScoreBand(59)).toBe('medium')
    expect(getLeadScoreBand(60)).toBe('high')
    expect(getLeadScoreBand(79)).toBe('high')
    expect(getLeadScoreBand(80)).toBe('very_high')
  })

  it('signals match the score contribution', () => {
    const lead = makeLead({ phone: '099123456', temperature: 'hot' })
    const signals = getLeadScoreSignals(lead)
    expect(signals.map((s) => s.id).sort()).toEqual(['phone', 'temperature'])
    expect(signals.reduce((sum, s) => sum + s.points, 0)).toBe(calculateLeadScore(lead))
  })
})

describe('getSuggestedLeadQualification', () => {
  it('suggests unqualified for an incomplete lead', () => {
    expect(getSuggestedLeadQualification(emptyLead, TODAY)).toBe('unqualified')
  })

  it('suggests evaluating for a lead with partial data', () => {
    const lead = makeLead({ phone: '099123456' })
    expect(getSuggestedLeadQualification(lead, TODAY)).toBe('evaluating')
    const contacted = makeLead({ pipeline_stage: 'contactado' })
    expect(getSuggestedLeadQualification(contacted, TODAY)).toBe('evaluating')
  })

  it('suggests interested when there is real interest without next steps', () => {
    const lead = makeLead({ pipeline_stage: 'interesado' })
    expect(getSuggestedLeadQualification(lead, TODAY)).toBe('interested')
  })

  it('suggests hot for a lead with strong signals', () => {
    // temperatura caliente + prioridad alta = 2 señales fuertes, sin datos para propuesta
    const lead = makeLead({ temperature: 'hot', priority: 'high' })
    expect(getSuggestedLeadQualification(lead, TODAY)).toBe('hot')
  })

  it('suggests ready_for_proposal with clear interest, enough data and next step', () => {
    const lead = makeLead({
      pipeline_stage: 'interesado',
      phone: '099123456',
      interest_area: 'Seguro de vida',
      next_action: 'Preparar propuesta',
      next_action_date: '2026-07-09',
    })
    expect(getSuggestedLeadQualification(lead, TODAY)).toBe('ready_for_proposal')
  })

  it('suggests not_viable for discarded or archived leads', () => {
    expect(
      getSuggestedLeadQualification(makeLead({ status: 'discarded' }), TODAY)
    ).toBe('not_viable')
    expect(
      getSuggestedLeadQualification(makeLead({ status: 'archived' }), TODAY)
    ).toBe('not_viable')
    expect(
      getSuggestedLeadQualification(
        makeLead({ pipeline_stage: 'descartado' }),
        TODAY
      )
    ).toBe('not_viable')
  })

  it('priority ordering puts ready_for_proposal first and not_viable last', () => {
    expect(getLeadQualificationPriority('ready_for_proposal')).toBeGreaterThan(
      getLeadQualificationPriority('hot')
    )
    expect(getLeadQualificationPriority('hot')).toBeGreaterThan(
      getLeadQualificationPriority('interested')
    )
    expect(getLeadQualificationPriority('not_viable')).toBe(0)
  })
})

describe('copy hygiene', () => {
  const qualifications = Object.keys(LEAD_QUALIFICATION_LABELS) as LeadQualification[]
  const bands = Object.keys(LEAD_SCORE_BAND_LABELS) as LeadScoreBand[]

  const allCopy = [
    ...qualifications.flatMap((q) => [
      getLeadQualificationLabel(q),
      getLeadQualificationDescription(q),
      getRecommendedActionForQualification(q),
    ]),
    ...bands.map((b) => getLeadScoreBandLabel(b)),
    ...[0, 45, 70, 95].map((s) => getLeadScoreRecommendation(s)),
  ]

  it('never mentions OpenAI or external AI providers', () => {
    for (const text of allCopy) {
      expect(text).not.toMatch(/openai|gpt/i)
    }
  })

  it('never mentions Compliance', () => {
    for (const text of allCopy) {
      expect(text).not.toMatch(/compliance|cumplimiento|revisión legal/i)
    }
  })

  it('never uses industry acronyms (MQL/SQL/PQL/Service Qualified)', () => {
    for (const text of allCopy) {
      expect(text).not.toMatch(/\b(MQL|SQL|PQL)\b/i)
      expect(text).not.toMatch(/service qualified/i)
    }
  })
})
