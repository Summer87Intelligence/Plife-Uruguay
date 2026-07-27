import { describe, expect, it } from 'vitest'
import {
  COMMERCIAL_ENGINES,
  RECOMMENDED_FLOW,
  EXAMPLE_SCENARIO,
  getEngine,
  runEngineMock,
  type EngineId,
} from '@/domains/intelligence-engines'

// FASE 15D — Motores comerciales en modo determinístico interno.
// Sin OpenAI, sin Compliance, sin proveedores externos.
describe('commercial engines (FASE 15D)', () => {
  it('defines exactly 6 engines', () => {
    expect(COMMERCIAL_ENGINES).toHaveLength(6)
  })

  it('has the expected engine ids', () => {
    const ids = COMMERCIAL_ENGINES.map((e) => e.id).sort()
    expect(ids).toEqual(
      ['aprendizaje', 'comercial', 'diagnostico', 'direccion', 'mercado', 'producto'].sort(),
    )
  })

  it('has unique engine ids', () => {
    const ids = COMMERCIAL_ENGINES.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('does not include a compliance engine', () => {
    const ids = COMMERCIAL_ENGINES.map((e) => e.id) as string[]
    expect(ids).not.toContain('compliance')
    const serialized = JSON.stringify(COMMERCIAL_ENGINES).toLowerCase()
    expect(serialized).not.toContain('compliance')
    expect(serialized).not.toContain('cumplimiento')
  })

  it('does not reference OpenAI or external providers', () => {
    const serialized = JSON.stringify(COMMERCIAL_ENGINES).toLowerCase()
    expect(serialized).not.toContain('openai')
    expect(serialized).not.toContain('gpt')
    expect(serialized).not.toContain('api.openai.com')
  })

  it('each engine has name, questions and outputs', () => {
    for (const engine of COMMERCIAL_ENGINES) {
      expect(engine.name).toBeTruthy()
      expect(engine.shortDescription).toBeTruthy()
      expect(engine.whatItDoes.length).toBeGreaterThan(0)
      expect(engine.exampleQuestions.length).toBeGreaterThan(0)
      expect(engine.exampleOutputs.length).toBeGreaterThan(0)
    }
  })

  it('getEngine resolves each id', () => {
    for (const engine of COMMERCIAL_ENGINES) {
      expect(getEngine(engine.id).id).toBe(engine.id)
    }
  })

  it('recommended flow starts at Lead/idea and ends at Propuesta', () => {
    expect(RECOMMENDED_FLOW[0].label).toBe('Lead o idea')
    expect(RECOMMENDED_FLOW[RECOMMENDED_FLOW.length - 1].label).toBe('Propuesta')
  })

  it('example scenario steps reference valid engines', () => {
    const validIds = new Set<EngineId>(COMMERCIAL_ENGINES.map((e) => e.id))
    for (const step of EXAMPLE_SCENARIO.steps) {
      expect(validIds.has(step.engineId)).toBe(true)
      expect(step.question).toBeTruthy()
      expect(step.output).toBeTruthy()
    }
  })

  it('runEngineMock is deterministic and provider-free', () => {
    const a = runEngineMock('diagnostico', 'una idea')
    const b = runEngineMock('diagnostico', 'una idea')
    expect(a.output).toBe(b.output)
    expect(a.output.toLowerCase()).not.toContain('openai')
    expect(a.engineName).toBe(getEngine('diagnostico').name)
  })
})
