import { describe, expect, it } from 'vitest'
import { runDeterministicCompliance } from '@/lib/ai/compliance'

const CRITICAL_OR_HIGH = ['critico', 'alto'] as const

describe('runDeterministicCompliance', () => {
  it('flags approval promise and risk denial as critical/high with rules triggered', () => {
    const result = runDeterministicCompliance('Te aprueban seguro y no tiene riesgo.')

    expect(CRITICAL_OR_HIGH).toContain(result.riskLevel)
    expect(['bloqueado', 'revision_requerida']).toContain(result.action)
    expect(result.triggeredRules.length).toBeGreaterThan(0)
    expect(result.riskReasons.length).toBeGreaterThan(0)
  })

  it('flags total coverage promise as critical', () => {
    const result = runDeterministicCompliance('Esto te cubre todo.')

    expect(['critico', 'alto']).toContain(result.riskLevel)
    expect(result.action).not.toBe('aprobado')
    expect(result.triggeredRules.length).toBeGreaterThan(0)
  })

  it('flags insurer acceptance promise as high/critical', () => {
    const result = runDeterministicCompliance('MAPFRE seguro lo acepta.')

    expect(['critico', 'alto']).toContain(result.riskLevel)
    expect(['bloqueado', 'revision_requerida']).toContain(result.action)
  })

  it('flags performance promise as high/critical', () => {
    const result = runDeterministicCompliance('Vas a ganar X con este producto.')

    expect(['critico', 'alto']).toContain(result.riskLevel)
    expect(result.action).not.toBe('aprobado')
  })

  it('approves compliant consultative language as low risk', () => {
    const result = runDeterministicCompliance(
      'Podemos analizar alternativas de protección según tu situación y validar condiciones correspondientes.'
    )

    expect(result.riskLevel).toBe('bajo')
    expect(result.action).toBe('aprobado')
    expect(result.triggeredRules).toHaveLength(0)
  })

  it('handles empty text without throwing', () => {
    const result = runDeterministicCompliance('')

    expect(result.riskLevel).toBe('bajo')
    expect(result.action).toBe('aprobado')
    expect(result.triggeredRules).toHaveLength(0)
    expect(result.suggestedVersion).toBeNull()
  })
})
