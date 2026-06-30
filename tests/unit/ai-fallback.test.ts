import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { runDeterministicCompliance } from '@/lib/ai/compliance'
import {
  AINotConfiguredError,
  AI_NOT_CONFIGURED_MESSAGE,
  chatComplete,
  isAIConfigured,
} from '@/lib/ai/provider'

describe('AI fallback without OPENAI_API_KEY', () => {
  const originalKey = process.env.OPENAI_API_KEY

  beforeEach(() => {
    delete process.env.OPENAI_API_KEY
  })

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.OPENAI_API_KEY
    } else {
      process.env.OPENAI_API_KEY = originalKey
    }
    vi.restoreAllMocks()
  })

  it('isAIConfigured() returns false when OPENAI_API_KEY is absent', () => {
    expect(isAIConfigured()).toBe(false)
  })

  it('isAIConfigured() returns false for placeholder key', () => {
    process.env.OPENAI_API_KEY = 'your-openai-key-here'
    expect(isAIConfigured()).toBe(false)
  })

  it('chatComplete throws AINotConfiguredError without exposing secrets', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    await expect(chatComplete({ system: 'test', user: 'hola' })).rejects.toBeInstanceOf(
      AINotConfiguredError
    )

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('AINotConfiguredError message is controlled and does not leak API key', () => {
    const err = new AINotConfiguredError()
    expect(err.message).toBe(AI_NOT_CONFIGURED_MESSAGE)
    expect(err.message).not.toMatch(/sk-/)
    expect(err.stack).not.toMatch(/sk-/)
  })

  it('deterministic compliance still works without AI', () => {
    const result = runDeterministicCompliance('Esto te cubre todo.')
    expect(result.riskLevel).toBe('critico')
    expect(result.action).toBe('bloqueado')
  })
})
