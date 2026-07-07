import type { EngineId } from '@/domains/intelligence-engines'

// Secuencia de motores para armar una propuesta (orden de trabajo).
export const PROPOSAL_ENGINE_SEQUENCE: EngineId[] = [
  'diagnostico',
  'mercado',
  'producto',
  'comercial',
  'direccion',
  'aprendizaje',
]

// Rol de cada motor dentro del flujo de propuesta.
export const ENGINE_ROLE_IN_PROPOSAL: Record<EngineId, string> = {
  diagnostico: 'Entiende necesidad y contexto',
  mercado: 'Explora nicho y diferenciación',
  producto: 'Estructura la propuesta/producto',
  comercial: 'Prepara la estrategia de venta',
  direccion: 'Evalúa prioridad, potencial y riesgo',
  aprendizaje: 'Aporta materiales y casos internos',
}

// Etiquetas de las secciones del borrador (orden de presentación).
export const DRAFT_SECTION_LABELS = {
  summary: 'Resumen',
  targetAudience: 'Público objetivo',
  problem: 'Problema',
  opportunity: 'Oportunidad',
  proposedOffer: 'Oferta propuesta',
  differentiators: 'Diferenciales',
  questionsToAsk: 'Preguntas a hacer',
  marketAngles: 'Ángulos de mercado',
  productIdeas: 'Ideas de producto',
  commercialStrategy: 'Estrategia comercial',
  nextSteps: 'Próximos pasos',
  risksOrAssumptions: 'Riesgos e hipótesis',
} as const
