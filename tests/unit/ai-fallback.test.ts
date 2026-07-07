import { afterEach, describe, expect, it, vi } from 'vitest'
import { runDeterministicCompliance } from '@/lib/ai/compliance'
import {
  AI_INTERNAL_MODE_MESSAGE,
  INTERNAL_ENGINE_MODEL,
  chatComplete,
  isAIConfigured,
} from '@/lib/ai/provider'

// FASE 15B — OpenAI removido. Los motores operan en modo determinístico interno,
// sin proveedor externo y sin llamadas de red.
describe('internal deterministic engines (no external provider)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('isAIConfigured() returns true (internal engine always available)', () => {
    expect(isAIConfigured()).toBe(true)
  })

  it('chatComplete never performs an external network request', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    const result = await chatComplete({ system: 'test', user: 'hola' })

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(result.model).toBe(INTERNAL_ENGINE_MODEL)
    expect(result.tokensUsed).toBeNull()
  })

  it('chatComplete returns a controlled deterministic response', async () => {
    const result = await chatComplete({ system: 'sistema', user: 'consulta comercial' })

    expect(result.content).toContain(AI_INTERNAL_MODE_MESSAGE)
    // No debe filtrar claves ni referencias a proveedores externos.
    expect(result.content).not.toMatch(/sk-/)
    expect(result.content.toLowerCase()).not.toContain('openai')
  })

  it('chatComplete is deterministic for the same input', async () => {
    const a = await chatComplete({ system: 's', user: 'mismo input' })
    const b = await chatComplete({ system: 's', user: 'mismo input' })
    expect(a.content).toBe(b.content)
  })

  it('deterministic compliance still works without any provider', () => {
    const result = runDeterministicCompliance('Esto te cubre todo.')
    expect(result.riskLevel).toBe('critico')
    expect(result.action).toBe('bloqueado')
  })
})
