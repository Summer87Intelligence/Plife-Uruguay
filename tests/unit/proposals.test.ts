import { describe, expect, it } from 'vitest'
import {
  generateMockProposal,
  parseProposalPrefill,
  type ProposalInput,
} from '@/domains/proposals'
import { COMMERCIAL_ENGINES } from '@/domains/intelligence-engines'

// FASE 15E — Flujo mock "Nueva propuesta". Determinístico, sin OpenAI, sin Compliance,
// sin proveedor externo y sin persistencia.

const MIN_INPUT: ProposalInput = {
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

const BARE_INPUT: ProposalInput = {
  title: 'Idea comercial',
  context: 'Surge de una conversación',
  target_type: 'unknown',
  target_description: '',
  source: 'manual',
  objective: '',
  known_problem: '',
  desired_outcome: '',
  notes: '',
}

describe('generateMockProposal (FASE 15E)', () => {
  it('returns a draft with the given title', () => {
    const draft = generateMockProposal(MIN_INPUT)
    expect(draft.title).toBe(MIN_INPUT.title)
    expect(draft.summary).toBeTruthy()
  })

  it('includes contributions from the 6 commercial engines', () => {
    const draft = generateMockProposal(MIN_INPUT)
    expect(draft.engineContributions).toHaveLength(6)
    const ids = draft.engineContributions.map((c) => c.engineId).sort()
    expect(ids).toEqual(COMMERCIAL_ENGINES.map((e) => e.id).sort())
    for (const c of draft.engineContributions) {
      expect(c.engineName).toBeTruthy()
      expect(c.questions.length).toBeGreaterThan(0)
      expect(c.outputs.length).toBeGreaterThan(0)
    }
  })

  it('includes questions to ask and next steps', () => {
    const draft = generateMockProposal(MIN_INPUT)
    expect(draft.questionsToAsk.length).toBeGreaterThan(0)
    expect(draft.nextSteps.length).toBeGreaterThan(0)
    expect(draft.risksOrAssumptions.length).toBeGreaterThan(0)
  })

  it('does not reference OpenAI, GPT or Compliance', () => {
    const serialized = JSON.stringify(generateMockProposal(MIN_INPUT)).toLowerCase()
    expect(serialized).not.toContain('openai')
    expect(serialized).not.toContain('gpt')
    expect(serialized).not.toContain('api.openai.com')
    expect(serialized).not.toContain('compliance')
    expect(serialized).not.toContain('cumplimiento')
  })

  it('does not assert real market data as facts (uses hedged language)', () => {
    const draft = generateMockProposal(MIN_INPUT)
    const market = draft.marketAngles.join(' ')
    // Los ángulos de mercado deben venir como hipótesis/ángulos a validar.
    expect(market).toMatch(/Hipótesis a validar|Ángulo posible|Preguntas para confirmar/)
    // Deja explícito que no reemplaza el análisis humano.
    expect(JSON.stringify(draft)).toContain('No sustituye análisis comercial humano')
  })

  it('produces useful output from a minimal input', () => {
    const draft = generateMockProposal(BARE_INPUT)
    expect(draft.title).toBe('Idea comercial')
    expect(draft.engineContributions).toHaveLength(6)
    expect(draft.questionsToAsk.length).toBeGreaterThan(0)
    expect(draft.proposedOffer).toBeTruthy()
    expect(draft.targetAudience).toBeTruthy()
  })

  it('is deterministic for the same input', () => {
    const a = generateMockProposal(MIN_INPUT)
    const b = generateMockProposal(MIN_INPUT)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })
})

describe('generateMockProposal — contextual sources (FASE 15F)', () => {
  it('uses source_context from a lead in the draft', () => {
    const draft = generateMockProposal({
      ...MIN_INPUT,
      source: 'lead',
      source_id: 'lead-123',
      source_title: 'Lead Demo',
      source_context: 'Etapa: Interesado. Próximo paso: llamar.',
    })
    expect(draft.summary).toContain('Lead Demo')
    const diag = draft.engineContributions.find((c) => c.engineId === 'diagnostico')!
    expect(diag.outputs.join(' ')).toContain('Etapa: Interesado')
  })

  it('adjusts questions when coming from a campaign', () => {
    const draft = generateMockProposal({ ...MIN_INPUT, source: 'campaign', source_title: 'Campaña Pymes' })
    expect(draft.questionsToAsk.join(' ')).toMatch(/segmento de la campaña/i)
    expect(draft.summary).toContain('Campaña Pymes')
  })

  it('uses prudent niche/market language when coming from radar', () => {
    const draft = generateMockProposal({ ...MIN_INPUT, source: 'radar', source_title: 'Empresa X' })
    const market = draft.marketAngles.join(' ')
    expect(market).toMatch(/nicho a explorar|Hipótesis a validar/i)
    // No afirma la señal del radar como un hecho.
    expect(market.toLowerCase()).not.toContain('confirmado')
  })

  it('manual source does not add an origin phrase', () => {
    const draft = generateMockProposal({ ...MIN_INPUT, source: 'manual', source_title: '' })
    expect(draft.summary).not.toContain('Parte de')
  })

  it('still generates output with default/manual input', () => {
    const draft = generateMockProposal(BARE_INPUT)
    expect(draft.engineContributions).toHaveLength(6)
    expect(draft.nextSteps.length).toBeGreaterThan(0)
  })
})

describe('parseProposalPrefill (FASE 15F)', () => {
  it('parses valid source and target_type', () => {
    const prefill = parseProposalPrefill({ source: 'lead', target_type: 'company' })
    expect(prefill.source).toBe('lead')
    expect(prefill.target_type).toBe('company')
  })

  it('ignores invalid enum values', () => {
    const prefill = parseProposalPrefill({ source: 'hacker', target_type: 'evil' })
    expect(prefill.source).toBeUndefined()
    expect(prefill.target_type).toBeUndefined()
  })

  it('maps source_title to title and context to source_context', () => {
    const prefill = parseProposalPrefill({
      source_title: 'Lead Demo',
      context: 'Interés por seguro',
      source_id: 'abc',
    })
    expect(prefill.title).toBe('Lead Demo')
    expect(prefill.source_title).toBe('Lead Demo')
    expect(prefill.context).toBe('Interés por seguro')
    expect(prefill.source_context).toBe('Interés por seguro')
    expect(prefill.source_id).toBe('abc')
  })

  it('handles array query params by taking the first value', () => {
    const prefill = parseProposalPrefill({ source: ['campaign', 'lead'] })
    expect(prefill.source).toBe('campaign')
  })
})
