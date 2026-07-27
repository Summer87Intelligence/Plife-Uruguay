import type { EngineStatus, FlowStep, ExampleScenario } from './types'

export const ENGINE_STATUS_LABELS: Record<EngineStatus, string> = {
  available_mock: 'Disponible',
  conceptual: 'Pendiente de salida operativa',
  future: 'Próximamente',
}

export const ENGINE_STATUS_STYLES: Record<EngineStatus, string> = {
  available_mock: 'bg-green-100 text-green-800',
  conceptual: 'bg-blue-100 text-blue-800',
  future: 'bg-gray-100 text-gray-600',
}

// Copy de la sección visible.
export const ENGINES_SECTION = {
  title: 'Motores',
  subtitle:
    'Sistema de motores comerciales para crear propuestas, detectar nichos y preparar estrategias.',
  intro:
    'Los motores ayudan a diagnosticar oportunidades, explorar nichos, diseñar propuestas y preparar estrategias comerciales. Cada motor aporta desde su especialidad y opera en modo determinístico interno (sin proveedores externos).',
} as const

// Flujo recomendado: Lead o idea → Diagnóstico → Mercado → Producto → Comercial → Dirección → Propuesta.
export const RECOMMENDED_FLOW: FlowStep[] = [
  { key: 'origen', label: 'Lead o idea' },
  { key: 'diagnostico', label: 'Diagnóstico', engineId: 'diagnostico' },
  { key: 'mercado', label: 'Mercado', engineId: 'mercado' },
  { key: 'producto', label: 'Producto', engineId: 'producto' },
  { key: 'comercial', label: 'Comercial', engineId: 'comercial' },
  { key: 'direccion', label: 'Dirección', engineId: 'direccion' },
  { key: 'propuesta', label: 'Propuesta' },
]

// Nota sobre Propuestas como resultado futuro (FASE 15E).
export const PROPOSALS_NOTE =
  'Las propuestas serán el resultado futuro del trabajo de los motores. Por ahora la salida es conceptual y no se persiste. La FASE 15E implementará el flujo de propuesta nueva.'

export const EXAMPLE_SCENARIO: ExampleScenario = {
  title: 'Ejemplo de uso',
  context: 'Idea: una propuesta de protección colectiva para estudios contables.',
  steps: [
    {
      engineId: 'diagnostico',
      question: '¿Qué necesita realmente un estudio contable y qué lo frena?',
      output:
        'Necesidad: proteger al equipo clave. Contexto: temporada alta, decisión del socio. Restricción: presupuesto acotado.',
    },
    {
      engineId: 'mercado',
      question: '¿Qué se ofrece hoy y qué nicho está desatendido?',
      output:
        'Nicho candidato: estudios pequeños sin beneficios formales. Diferencial posible: onboarding simple y acompañamiento.',
    },
    {
      engineId: 'producto',
      question: '¿Cómo estructuramos la propuesta y para quién?',
      output:
        'Propuesta conceptual con público (socios + equipo núcleo), valor (retención de talento) y variantes por tamaño.',
    },
    {
      engineId: 'comercial',
      question: '¿Cómo la llevamos al mercado?',
      output:
        'Mensaje de apertura consultivo + idea de campaña para estudios contables + secuencia de seguimiento en 3 pasos.',
    },
    {
      engineId: 'direccion',
      question: '¿Merece foco y qué riesgo tiene?',
      output:
        'Prioridad media-alta por volumen de estudios; riesgo: ciclo de decisión largo. Recomendación: enfocar los de mayor potencial.',
    },
  ],
  result:
    'Resultado conceptual: una propuesta lista para revisión humana. No se persiste todavía (ver FASE 15E).',
}
