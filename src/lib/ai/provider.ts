// AI provider abstraction. Server-side only.
// Decouples the rest of the app from the concrete LLM vendor (currently OpenAI).
// If OPENAI_API_KEY is absent, every call fails in a controlled way and the UI
// can render an "IA no configurada" state without crashing.

export const AI_NOT_CONFIGURED_MESSAGE =
  'IA no configurada. Agregá OPENAI_API_KEY para activar el copiloto.'

export class AINotConfiguredError extends Error {
  constructor() {
    super(AI_NOT_CONFIGURED_MESSAGE)
    this.name = 'AINotConfiguredError'
  }
}

export function isAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim())
}

export interface ChatRequest {
  system: string
  user: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface ChatResult {
  content: string
  model: string
  tokensUsed: number | null
}

const DEFAULT_MODEL = 'gpt-4o-mini'

// Performs a single chat completion. Throws AINotConfiguredError when there is no
// key, or a generic controlled Error on transport/API failures.
export async function chatComplete(req: ChatRequest): Promise<ChatResult> {
  if (!isAIConfigured()) {
    throw new AINotConfiguredError()
  }

  const model = req.model || DEFAULT_MODEL

  let response: Response
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature: req.temperature ?? 0.5,
        max_tokens: req.maxTokens ?? 1200,
        messages: [
          { role: 'system', content: req.system },
          { role: 'user', content: req.user },
        ],
      }),
    })
  } catch {
    throw new Error('No se pudo conectar con el proveedor de IA. Intentá nuevamente.')
  }

  if (!response.ok) {
    // Avoid leaking raw provider errors / keys to the UI.
    throw new Error('El proveedor de IA devolvió un error. Revisá la configuración e intentá nuevamente.')
  }

  const data = await response.json()
  const content: string = data.choices?.[0]?.message?.content ?? ''
  const tokensUsed: number | null = data.usage?.total_tokens ?? null

  return { content, model, tokensUsed }
}
