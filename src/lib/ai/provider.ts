// AI provider abstraction. Server-side only.
// OpenAI fue removido en FASE 15B. El proyecto NO usa ningún proveedor externo.
// Los motores operan en modo determinístico interno hasta definir proveedor/tecnología.
// Ninguna función llama a APIs externas ni depende de claves de proveedor.

export const AI_INTERNAL_MODE_MESSAGE =
  'Motores internos en modo determinístico hasta definir proveedor/tecnología.'

// Alias retrocompatible: se mantiene para no romper imports existentes.
export const AI_NOT_CONFIGURED_MESSAGE = AI_INTERNAL_MODE_MESSAGE

// Identificador del "modelo" interno. No corresponde a ningún proveedor externo.
export const INTERNAL_ENGINE_MODEL = 'internal-deterministic'

// Se conserva la clase por compatibilidad de imports. En el modo determinístico
// interno no se lanza en el flujo normal (los motores no fallan por falta de proveedor).
export class AINotConfiguredError extends Error {
  constructor() {
    super(AI_INTERNAL_MODE_MESSAGE)
    this.name = 'AINotConfiguredError'
  }
}

// Los motores internos están siempre disponibles en modo determinístico.
// No requieren ninguna clave ni proveedor externo.
export function isAIConfigured(): boolean {
  return true
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

// Completion determinística y libre de proveedor. NUNCA llama a una API externa.
// Devuelve una respuesta estructurada y segura que deja explícito que el motor
// opera en modo interno hasta definir una tecnología de generación.
// La firma pública se mantiene para no romper a los consumidores (runAgent, etc.).
export async function chatComplete(req: ChatRequest): Promise<ChatResult> {
  return {
    content: buildDeterministicResponse(req),
    model: INTERNAL_ENGINE_MODEL,
    tokensUsed: null,
  }
}

function buildDeterministicResponse(req: ChatRequest): string {
  const intent = firstMeaningfulLine(req.user) || firstMeaningfulLine(req.system)
  return [
    '[Motor interno — modo determinístico]',
    '',
    AI_INTERNAL_MODE_MESSAGE,
    '',
    intent ? `Contexto recibido: ${intent}` : 'Sin contexto adicional provisto.',
    '',
    'Este motor todavía no está conectado a una tecnología de generación.',
    'No inventa datos, precios ni condiciones. Requiere revisión humana del asesor.',
  ].join('\n')
}

function firstMeaningfulLine(text: string): string {
  const line = text
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0)
  if (!line) return ''
  return line.length > 160 ? `${line.slice(0, 157)}…` : line
}
