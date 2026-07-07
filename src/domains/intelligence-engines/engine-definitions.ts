import type { CommercialEngine, EngineId } from './types'

// Los 6 motores comerciales. Orden = orden natural de trabajo comercial.
export const COMMERCIAL_ENGINES: CommercialEngine[] = [
  {
    id: 'diagnostico',
    name: 'Motor Diagnóstico',
    shortDescription:
      'Hace las preguntas correctas para entender al cliente, su necesidad y su contexto.',
    whatItDoes: [
      'Formula preguntas consultivas al asesor',
      'Ordena necesidad, cliente, contexto y restricciones',
      'Identifica qué falta saber antes de proponer',
    ],
    exampleQuestions: [
      '¿Qué problema comercial querés resolver?',
      '¿Quién es el cliente y qué lo mueve a decidir?',
      '¿Qué restricciones de tiempo, presupuesto o normativa existen?',
    ],
    exampleOutputs: [
      'Resumen estructurado de necesidad y contexto',
      'Lista de supuestos a validar con el cliente',
      'Preguntas abiertas pendientes antes de avanzar',
    ],
    status: 'available_mock',
  },
  {
    id: 'mercado',
    name: 'Motor Mercado',
    shortDescription:
      'Explora el mercado de forma conceptual: competidores, nichos y diferenciales posibles.',
    whatItDoes: [
      'Analiza competidores de forma conceptual',
      'Detecta nichos y segmentos potenciales',
      'Sugiere diferenciales posibles a validar',
    ],
    exampleQuestions: [
      '¿Qué suelen ofrecer otros players en este segmento?',
      '¿Qué nicho parece desatendido?',
      '¿Qué diferencial podríamos sostener?',
    ],
    exampleOutputs: [
      'Mapa conceptual de competidores (sin datos reales)',
      'Lista de nichos candidatos',
      'Diferenciales potenciales a validar',
    ],
    status: 'conceptual',
  },
  {
    id: 'producto',
    name: 'Motor Producto',
    shortDescription:
      'Diseña una propuesta o variante de producto comercial.',
    whatItDoes: [
      'Define público objetivo y propuesta de valor',
      'Establece límites y variantes de la propuesta',
      'Estructura la propuesta comercial conceptual',
    ],
    exampleQuestions: [
      '¿Para qué público diseñamos esta propuesta?',
      '¿Cuál es el valor central que ofrece?',
      '¿Qué queda dentro y qué fuera del alcance?',
    ],
    exampleOutputs: [
      'Borrador de propuesta/producto conceptual',
      'Público objetivo y propuesta de valor',
      'Límites y variantes sugeridas',
    ],
    status: 'conceptual',
  },
  {
    id: 'comercial',
    name: 'Motor Comercial',
    shortDescription:
      'Convierte la propuesta en una estrategia de venta accionable.',
    whatItDoes: [
      'Sugiere el mensaje de apertura',
      'Propone campaña y segmento',
      'Diseña una secuencia de seguimiento',
    ],
    exampleQuestions: [
      '¿Cómo abrimos la conversación?',
      '¿Qué campaña encaja con esta propuesta?',
      '¿Cómo hacemos seguimiento sin ser invasivos?',
    ],
    exampleOutputs: [
      'Mensaje de apertura sugerido (borrador)',
      'Idea de campaña por segmento',
      'Secuencia de seguimiento en pasos',
    ],
    status: 'available_mock',
  },
  {
    id: 'direccion',
    name: 'Motor Dirección',
    shortDescription:
      'Evalúa prioridad, foco, potencial y riesgo comercial.',
    whatItDoes: [
      'Evalúa prioridad y foco comercial',
      'Estima el potencial de la oportunidad',
      'Señala riesgos comerciales a considerar',
    ],
    exampleQuestions: [
      '¿Esto merece foco esta semana?',
      '¿Cuál es el potencial estimado?',
      '¿Qué riesgo comercial hay que vigilar?',
    ],
    exampleOutputs: [
      'Nivel de prioridad sugerido',
      'Lectura de potencial y foco',
      'Riesgos comerciales a monitorear',
    ],
    status: 'conceptual',
  },
  {
    id: 'aprendizaje',
    name: 'Motor Aprendizaje / Biblioteca',
    shortDescription:
      'Aprovecha el conocimiento interno: productos, casos y materiales.',
    whatItDoes: [
      'Consulta conocimiento interno validado',
      'Recupera casos y materiales relevantes',
      'Aporta contexto de producto al resto de motores',
    ],
    exampleQuestions: [
      '¿Qué material validado aplica a este caso?',
      '¿Hay casos previos parecidos?',
      '¿Qué sabemos del producto involucrado?',
    ],
    exampleOutputs: [
      'Referencias a material interno (conceptual)',
      'Casos análogos sugeridos',
      'Notas de producto para apoyar la propuesta',
    ],
    status: 'available_mock',
  },
]

export const ENGINES_BY_ID: Record<EngineId, CommercialEngine> = COMMERCIAL_ENGINES.reduce(
  (acc, engine) => {
    acc[engine.id] = engine
    return acc
  },
  {} as Record<EngineId, CommercialEngine>,
)

export function getEngine(id: EngineId): CommercialEngine {
  return ENGINES_BY_ID[id]
}
