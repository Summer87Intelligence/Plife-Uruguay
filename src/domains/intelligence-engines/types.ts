// Motores comerciales PLIFE (FASE 15D).
// Modelo conceptual/determinístico. NO usa proveedores externos ni OpenAI.
// La salida es conceptual/no persistente hasta definir tecnología y flujo real.

export type EngineId =
  | 'diagnostico'
  | 'mercado'
  | 'producto'
  | 'comercial'
  | 'direccion'
  | 'aprendizaje'

/**
 * - `available_mock`: se puede ejecutar en modo simulado determinístico.
 * - `conceptual`: definido como concepto; salida ilustrativa, sin ejecución real.
 * - `future`: previsto para una fase posterior.
 */
export type EngineStatus = 'available_mock' | 'conceptual' | 'future'

export interface CommercialEngine {
  id: EngineId
  name: string
  shortDescription: string
  whatItDoes: string[]
  exampleQuestions: string[]
  exampleOutputs: string[]
  status: EngineStatus
}

/** Un paso del flujo recomendado Lead/Idea → Motores → Propuesta. */
export interface FlowStep {
  key: string
  label: string
  /** Motor asociado, si el paso corresponde a un motor. */
  engineId?: EngineId
}

/** Un paso del ejemplo de uso: qué motor interviene, qué pregunta y qué entrega. */
export interface ExampleStep {
  engineId: EngineId
  question: string
  output: string
}

export interface ExampleScenario {
  title: string
  context: string
  steps: ExampleStep[]
  result: string
}
