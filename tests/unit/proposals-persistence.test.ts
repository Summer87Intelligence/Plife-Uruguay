import { describe, expect, it } from 'vitest'
import {
  CreateProposalInputSchema,
  buildProposalInsertRow,
  buildLeadScoreSnapshot,
  buildLeadQualificationSnapshot,
  resolveLeadId,
  resolveCampaignId,
  isUuid,
  generateMockProposal,
  type CreateProposalInput,
  type ProposalInput,
} from '@/domains/proposals'
import type { LeadQualificationInput } from '@/domains/leads'

// FASE 15M — Persistencia de propuestas: mapper puro ProposalInput+Draft → insert row.
// Sin Supabase, sin OpenAI, sin Compliance, sin opportunity.

const UUID = '0c7f8fa7-1111-4222-8333-444455556666'
const USER = '9fb93ddc-aaaa-4bbb-8ccc-dddddddd8404'

const BASE_INPUT: ProposalInput = {
  title: 'Protección colectiva para estudios contables',
  context: 'Detectamos varios estudios pequeños sin beneficios formales',
  target_type: 'segment',
  target_description: 'estudios contables pequeños',
  source: 'manual',
  objective: 'ordenar la idea y preparar una propuesta',
  known_problem: 'no logran retener talento clave',
  desired_outcome: 'ofrecer un beneficio simple y accesible',
  notes: '',
}

function makePayload(overrides: Partial<CreateProposalInput> = {}): CreateProposalInput {
  const input = { ...BASE_INPUT, ...overrides }
  return { ...input, draft: generateMockProposal(input as ProposalInput), ...overrides }
}

/** Valida el payload por el schema y devuelve el CreateProposalData (z.output). */
function parse(payload: CreateProposalInput) {
  return CreateProposalInputSchema.parse(payload)
}

describe('isUuid', () => {
  it('accepts canonical uuids and rejects free text', () => {
    expect(isUuid(UUID)).toBe(true)
    expect(isUuid('lead-123')).toBe(false)
    expect(isUuid('')).toBe(false)
    expect(isUuid(undefined)).toBe(false)
    expect(isUuid(null)).toBe(false)
  })
})

describe('buildProposalInsertRow — mapeo base', () => {
  it('mapea input + draft y setea autor/asignado', () => {
    const data = parse(makePayload())
    const row = buildProposalInsertRow(data, USER)

    expect(row.title).toBe(BASE_INPUT.title)
    expect(row.context).toBe(BASE_INPUT.context)
    expect(row.target_type).toBe('segment')
    expect(row.status).toBe('draft')
    expect(row.created_by).toBe(USER)
    expect(row.assigned_to).toBe(USER)
  })

  it('mantiene el draft JSONB completo como fuente de verdad', () => {
    const data = parse(makePayload())
    const row = buildProposalInsertRow(data, USER)
    expect(row.draft).toEqual(data.draft)
    expect((row.draft as { engineContributions: unknown[] }).engineContributions).toHaveLength(6)
  })

  it('extrae los campos denormalizados desde el draft', () => {
    const data = parse(makePayload())
    const row = buildProposalInsertRow(data, USER)
    expect(row.summary).toBe(data.draft.summary)
    expect(row.target_audience).toBe(data.draft.targetAudience)
    expect(row.problem).toBe(data.draft.problem)
    expect(row.opportunity).toBe(data.draft.opportunity)
    expect(row.proposed_offer).toBe(data.draft.proposedOffer)
  })
})

describe('buildProposalInsertRow — FKs de origen', () => {
  it('source=lead con uuid válido asigna lead_id (y no campaign_id)', () => {
    const data = parse(makePayload({ source: 'lead', source_id: UUID }))
    const row = buildProposalInsertRow(data, USER)
    expect(row.lead_id).toBe(UUID)
    expect(row.campaign_id).toBeNull()
    expect(resolveLeadId(data)).toBe(UUID)
  })

  it('source=campaign con uuid válido asigna campaign_id (y no lead_id)', () => {
    const data = parse(makePayload({ source: 'campaign', source_id: UUID }))
    const row = buildProposalInsertRow(data, USER)
    expect(row.campaign_id).toBe(UUID)
    expect(row.lead_id).toBeNull()
    expect(resolveCampaignId(data)).toBe(UUID)
  })

  it('source=lead con source_id NO uuid no fuerza la FK (queda rastro textual)', () => {
    const data = parse(makePayload({ source: 'lead', source_id: 'lead-123' }))
    const row = buildProposalInsertRow(data, USER)
    expect(row.lead_id).toBeNull()
    expect(row.source_id).toBe('lead-123')
  })

  it('source=radar/manual no fuerza ninguna FK aunque haya source_id uuid', () => {
    const radar = buildProposalInsertRow(parse(makePayload({ source: 'radar', source_id: UUID })), USER)
    expect(radar.lead_id).toBeNull()
    expect(radar.campaign_id).toBeNull()

    const manual = buildProposalInsertRow(parse(makePayload({ source: 'manual' })), USER)
    expect(manual.lead_id).toBeNull()
    expect(manual.campaign_id).toBeNull()
  })
})

describe('buildProposalInsertRow — límites de alcance', () => {
  it('no incluye opportunity_id, compliance ni provider/model externo', () => {
    const data = parse(makePayload({ source: 'lead', source_id: UUID }))
    const row = buildProposalInsertRow(data, USER)
    expect(row).not.toHaveProperty('opportunity_id')
    expect(row).not.toHaveProperty('compliance')
    expect(row).not.toHaveProperty('legal_review')
    expect(row).not.toHaveProperty('provider')
    expect(row).not.toHaveProperty('model')

    const serialized = JSON.stringify(row).toLowerCase()
    expect(serialized).not.toContain('openai')
    expect(serialized).not.toContain('gpt')
    expect(serialized).not.toContain('compliance')
  })

  it('snapshots quedan null si no se proveen', () => {
    const data = parse(makePayload())
    const row = buildProposalInsertRow(data, USER)
    expect(row.score_snapshot).toBeNull()
    expect(row.qualification_snapshot).toBeNull()
  })

  it('persiste snapshots cuando se proveen', () => {
    const data = parse(makePayload({ source: 'lead', source_id: UUID }))
    const lead = makeLead()
    const row = buildProposalInsertRow(data, USER, {
      score_snapshot: buildLeadScoreSnapshot(lead, '2026-07-08T00:00:00.000Z'),
      qualification_snapshot: buildLeadQualificationSnapshot(lead, '2026-07-08T00:00:00.000Z'),
    })
    expect((row.score_snapshot as { score: number }).score).toBeGreaterThan(0)
    expect((row.qualification_snapshot as { qualification: string }).qualification).toBeTruthy()
  })
})

function makeLead(): LeadQualificationInput {
  return {
    id: UUID,
    title: 'Lead Demo',
    lead_type: 'company',
    source: 'whatsapp',
    status: 'open',
    pipeline_stage: 'interesado',
    priority: 'high',
    temperature: 'hot',
    next_action: 'Llamar',
    next_action_date: '2026-07-10',
    assigned_to: USER,
    created_at: '2026-07-01T00:00:00.000Z',
    updated_at: '2026-07-07T00:00:00.000Z',
    converted_at: null,
    discarded_at: null,
    phone: '099111222',
    email: 'demo@empresa.com',
    interest_area: 'seguro colectivo',
  }
}

describe('snapshots desde lead (FASE 15I congelado)', () => {
  it('score snapshot incluye score, band y señales', () => {
    const snap = buildLeadScoreSnapshot(makeLead(), '2026-07-08T00:00:00.000Z')
    expect(snap.score).toBeGreaterThan(0)
    expect(snap.band).toBeTruthy()
    expect(Array.isArray(snap.signals)).toBe(true)
    expect(snap.captured_at).toBe('2026-07-08T00:00:00.000Z')
  })

  it('qualification snapshot incluye calificación y etiqueta', () => {
    const snap = buildLeadQualificationSnapshot(makeLead(), '2026-07-08T00:00:00.000Z')
    expect(snap.qualification).toBeTruthy()
    expect(snap.label).toBeTruthy()
    expect(snap.captured_at).toBe('2026-07-08T00:00:00.000Z')
  })
})

describe('CreateProposalInputSchema (validación server-side)', () => {
  it('acepta un payload válido', () => {
    const result = CreateProposalInputSchema.safeParse(makePayload())
    expect(result.success).toBe(true)
  })

  it('rechaza título vacío', () => {
    const result = CreateProposalInputSchema.safeParse(makePayload({ title: '   ' }))
    expect(result.success).toBe(false)
  })

  it('rechaza contexto vacío', () => {
    const result = CreateProposalInputSchema.safeParse(makePayload({ context: '' }))
    expect(result.success).toBe(false)
  })

  it('rechaza source inválido', () => {
    const result = CreateProposalInputSchema.safeParse(
      makePayload({ source: 'hacker' as never })
    )
    expect(result.success).toBe(false)
  })

  it('rechaza campos de sistema no esperados (strict)', () => {
    const result = CreateProposalInputSchema.safeParse({
      ...makePayload(),
      lead_id: UUID,
      score_snapshot: { score: 100 },
    } as never)
    expect(result.success).toBe(false)
  })
})
