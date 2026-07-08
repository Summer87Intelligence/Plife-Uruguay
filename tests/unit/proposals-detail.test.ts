import { describe, expect, it } from 'vitest'
import {
  normalizeStoredDraft,
  normalizeScoreSnapshot,
  normalizeQualificationSnapshot,
  generateMockProposal,
  type ProposalInput,
} from '@/domains/proposals'

// FASE 15N — Normalización defensiva del draft/snapshots guardados para el detalle
// read-only. El draft/snapshots viven como JSONB: pueden venir completos, parciales
// o con forma antigua/rota. Sin OpenAI, sin Compliance, sin opportunity.

const INPUT: ProposalInput = {
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

describe('normalizeStoredDraft — draft completo', () => {
  it('devuelve el ProposalDraft completo tal cual viene de generateMockProposal', () => {
    const draft = generateMockProposal(INPUT)
    const stored = JSON.parse(JSON.stringify(draft)) // simula ida y vuelta por JSONB
    const normalized = normalizeStoredDraft(stored)

    expect(normalized.title).toBe(draft.title)
    expect(normalized.summary).toBe(draft.summary)
    expect(normalized.engineContributions).toHaveLength(6)
    expect(normalized.questionsToAsk.length).toBeGreaterThan(0)
    expect(normalized.nextSteps.length).toBeGreaterThan(0)
  })
})

describe('normalizeStoredDraft — draft parcial/roto', () => {
  it('no rompe si el draft es {} (sin campos)', () => {
    const normalized = normalizeStoredDraft({})
    expect(normalized.title).toBe('')
    expect(normalized.summary).toBe('')
    expect(normalized.differentiators).toEqual([])
    expect(normalized.engineContributions).toEqual([])
  })

  it('no rompe si el draft es null', () => {
    const normalized = normalizeStoredDraft(null)
    expect(normalized.questionsToAsk).toEqual([])
    expect(normalized.risksOrAssumptions).toEqual([])
  })

  it('no rompe si faltan arrays esperados (llegan como null/undefined)', () => {
    const normalized = normalizeStoredDraft({
      title: 'Solo título',
      summary: 'Solo resumen',
      differentiators: null,
      nextSteps: undefined,
    } as never)
    expect(normalized.title).toBe('Solo título')
    expect(normalized.summary).toBe('Solo resumen')
    expect(normalized.differentiators).toEqual([])
    expect(normalized.nextSteps).toEqual([])
  })

  it('filtra elementos no-string dentro de un array', () => {
    const normalized = normalizeStoredDraft({
      nextSteps: ['paso real', 42, null, { weird: true }, 'otro paso'],
    } as never)
    expect(normalized.nextSteps).toEqual(['paso real', 'otro paso'])
  })

  it('descarta contribuciones de motor sin engineId', () => {
    const normalized = normalizeStoredDraft({
      engineContributions: [
        { engineId: 'diagnostico', engineName: 'Diagnóstico', questions: ['q1'], outputs: ['o1'] },
        { engineName: 'Sin id', questions: [], outputs: [] },
      ],
    } as never)
    expect(normalized.engineContributions).toHaveLength(1)
    expect(normalized.engineContributions[0]?.engineId).toBe('diagnostico')
  })

  it('no aparecen OpenAI/GPT/Compliance en el resultado normalizado', () => {
    const draft = generateMockProposal(INPUT)
    const normalized = normalizeStoredDraft(JSON.parse(JSON.stringify(draft)))
    const serialized = JSON.stringify(normalized).toLowerCase()
    expect(serialized).not.toContain('openai')
    expect(serialized).not.toContain('gpt')
    expect(serialized).not.toContain('compliance')
  })
})

describe('normalizeScoreSnapshot', () => {
  it('formatea un snapshot válido', () => {
    const snap = normalizeScoreSnapshot({
      score: 80,
      band: 'very_high',
      band_label: 'Muy alto',
      signals: [{ id: 'temperature', label: 'Temperatura caliente', points: 20 }],
      captured_at: '2026-07-08T00:00:00.000Z',
    })
    expect(snap?.score).toBe(80)
    expect(snap?.band_label).toBe('Muy alto')
    expect(snap?.signals).toHaveLength(1)
  })

  it('devuelve null si es null', () => {
    expect(normalizeScoreSnapshot(null)).toBeNull()
  })

  it('devuelve null si no tiene score numérico', () => {
    expect(normalizeScoreSnapshot({ band: 'high' } as never)).toBeNull()
  })

  it('devuelve null si es un array o string suelto', () => {
    expect(normalizeScoreSnapshot([] as never)).toBeNull()
    expect(normalizeScoreSnapshot('80' as never)).toBeNull()
  })
})

describe('normalizeQualificationSnapshot', () => {
  it('formatea un snapshot válido', () => {
    const snap = normalizeQualificationSnapshot({
      qualification: 'ready_for_proposal',
      label: 'Listo para propuesta',
      description: 'Hay interés claro...',
      captured_at: '2026-07-08T00:00:00.000Z',
    })
    expect(snap?.qualification).toBe('ready_for_proposal')
    expect(snap?.label).toBe('Listo para propuesta')
  })

  it('devuelve null si es null', () => {
    expect(normalizeQualificationSnapshot(null)).toBeNull()
  })

  it('devuelve null si falta qualification', () => {
    expect(normalizeQualificationSnapshot({ label: 'x' } as never)).toBeNull()
  })
})
