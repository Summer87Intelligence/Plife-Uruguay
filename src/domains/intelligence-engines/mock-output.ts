import type { CommercialEngine, EngineId } from './types'
import { getEngine } from './engine-definitions'

export interface EngineMockResult {
  engineId: EngineId
  engineName: string
  question: string
  output: string
  disclaimer: string
}

const DISCLAIMER =
  'Salida conceptual del modo determinístico interno (sin proveedor externo). Requiere revisión humana. No genera primas, coberturas ni datos reales de mercado.'

/**
 * Salida simulada, determinística y sin fuentes externas para un motor.
 * Devuelve una lectura conceptual construida a partir de la definición del motor
 * y del input opcional del asesor. NO inventa datos reales de mercado/producto.
 */
export function runEngineMock(engineId: EngineId, input?: string): EngineMockResult {
  const engine: CommercialEngine = getEngine(engineId)
  const focus = input && input.trim() ? input.trim() : 'la oportunidad o idea seleccionada'

  const lines = [
    `Motor: ${engine.name}.`,
    `Enfoque: ${engine.shortDescription}`,
    '',
    `Cómo abordaría ${focus}:`,
    ...engine.whatItDoes.map((item) => `- ${item}`),
    '',
    'Salida conceptual esperada:',
    ...engine.exampleOutputs.map((item) => `- ${item}`),
  ]

  return {
    engineId: engine.id,
    engineName: engine.name,
    question: engine.exampleQuestions[0],
    output: lines.join('\n'),
    disclaimer: DISCLAIMER,
  }
}
