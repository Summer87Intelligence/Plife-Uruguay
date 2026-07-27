import { getEngine } from '@/domains/intelligence-engines'
import { HEDGE, HUMAN_REVIEW_NOTE, SOURCE_LABELS, TARGET_TYPE_LABELS } from './constants'
import { PROPOSAL_ENGINE_SEQUENCE } from './proposal-flow'
import type { EngineContribution, ProposalDraft, ProposalInput } from './types'

function clean(value: string | undefined, fallback: string): string {
  const v = (value ?? '').trim()
  return v.length > 0 ? v : fallback
}

// Frase de origen para el resumen. Solo describe de dónde parte la idea; no afirma datos.
function describeOrigin(input: ProposalInput): string {
  if (input.source === 'manual') return ''
  const label = SOURCE_LABELS[input.source]
  const title = (input.source_title ?? '').trim()
  return title ? ` Parte de ${label}: "${title}".` : ` Parte de ${label}.`
}

// Pregunta específica según el origen, para enfocar el diagnóstico.
function sourceQuestion(input: ProposalInput): string | null {
  switch (input.source) {
    case 'lead':
      return '¿Qué interés concreto mostró el lead y qué falta para avanzar?'
    case 'campaign':
      return '¿Qué segmento de la campaña encaja mejor con esta propuesta?'
    case 'radar':
      return '¿Qué señal del radar sugiere potencial y qué habría que confirmar?'
    case 'market_observation':
      return '¿Qué observación de mercado motiva esto y qué la respalda?'
    default:
      return null
  }
}

// Ángulo de mercado prudente según el origen (hipótesis, no hechos).
function sourceMarketAngle(input: ProposalInput): string | null {
  switch (input.source) {
    case 'radar':
      return `${HEDGE.hypothesis}: el radar sugiere un nicho a explorar; validar tamaño y demanda real.`
    case 'campaign':
      return `${HEDGE.angle}: reutilizar el segmento de la campaña como público inicial a confirmar.`
    default:
      return null
  }
}

// Primer próximo paso según el origen.
function sourceNextStep(input: ProposalInput): string | null {
  switch (input.source) {
    case 'lead':
      return 'Revisar el historial del lead antes de contactar con la propuesta.'
    case 'campaign':
      return 'Alinear la propuesta con el mensaje y segmento de la campaña.'
    case 'radar':
      return 'Confirmar la señal del radar con datos internos antes de invertir esfuerzo.'
    case 'market_observation':
      return 'Contrastar la observación de mercado con casos internos.'
    default:
      return null
  }
}

function describeAudience(input: ProposalInput): string {
  const desc = clean(input.target_description, 'público por definir')
  if (input.target_type === 'unknown') {
    return `${HEDGE.hypothesis}: el público objetivo aún no está definido (${desc}).`
  }
  return `${TARGET_TYPE_LABELS[input.target_type]}: ${desc}.`
}

/**
 * Genera un borrador de propuesta determinístico a partir del input.
 * Modo interno (sin OpenAI, sin proveedor externo, sin red). No persiste.
 * Usa frases prudentes para no afirmar datos reales de mercado como hechos.
 */
export function generateMockProposal(input: ProposalInput): ProposalDraft {
  const focus = clean(input.title, 'la idea comercial')
  const context = clean(input.context, 'contexto por profundizar')
  const objective = clean(input.objective, 'ordenar la idea y preparar una propuesta')
  const problem = clean(input.known_problem, 'problema por confirmar con el cliente')
  const outcome = clean(input.desired_outcome, 'resultado comercial por definir')
  const audience = describeAudience(input)
  const sourceContext = clean(input.source_context, '')
  const originPhrase = describeOrigin(input)

  const contributions: EngineContribution[] = PROPOSAL_ENGINE_SEQUENCE.map((engineId) => {
    const engine = getEngine(engineId)
    let questions: string[] = []
    let outputs: string[] = []

    switch (engineId) {
      case 'diagnostico':
        questions = [
          `¿Qué necesita realmente ${audienceShort(input)} respecto a "${focus}"?`,
          `¿Qué contexto rodea a "${context}" y qué lo hace urgente o no?`,
          '¿Qué restricciones de tiempo, presupuesto o decisión existen?',
        ]
        outputs = [
          `Necesidad declarada: ${objective}.`,
          `Problema conocido: ${problem}.`,
          ...(sourceContext
            ? [`Contexto de origen (${SOURCE_LABELS[input.source]}): ${sourceContext}.`]
            : []),
          `${HEDGE.questions}: validar supuestos de contexto antes de avanzar.`,
        ]
        break
      case 'mercado':
        questions = [
          '¿Qué suelen ofrecer otros players para esta necesidad?',
          '¿Qué nicho parece desatendido dentro de este público?',
          '¿Qué diferencial podríamos sostener en el tiempo?',
        ]
        outputs = [
          `${HEDGE.hypothesis}: existe un nicho alrededor de "${focus}" por confirmar con datos.`,
          `${HEDGE.angle}: diferenciarse por acompañamiento y simpleza (sin afirmar posición de competidores).`,
          `${HEDGE.questions}: relevar competencia real antes de decidir el posicionamiento.`,
        ]
        break
      case 'producto':
        questions = [
          '¿Qué queda dentro y fuera del alcance de la propuesta?',
          '¿Qué variantes conviene ofrecer por tamaño o perfil?',
          '¿Cuál es el valor central que percibe el cliente?',
        ]
        outputs = [
          `${HEDGE.initialOffer}: una propuesta orientada a "${outcome}".`,
          'Variantes posibles: una versión base y una ampliada según necesidad.',
          `Valor propuesto para ${audienceShort(input)}: enfocar en el resultado, no en el producto.`,
        ]
        break
      case 'comercial':
        questions = [
          '¿Cómo abrimos la conversación sin ser invasivos?',
          '¿Qué campaña o segmento encaja mejor?',
          '¿Cómo estructuramos el seguimiento?',
        ]
        outputs = [
          `Mensaje inicial (borrador): plantear "${focus}" desde el problema del cliente.`,
          `${HEDGE.angle}: campaña acotada al público objetivo definido.`,
          'Secuencia de seguimiento sugerida en 3 pasos con próximo paso claro.',
        ]
        break
      case 'direccion':
        questions = [
          '¿Esto merece foco esta semana?',
          '¿Cuál es el potencial estimado de forma prudente?',
          '¿Qué riesgo comercial hay que vigilar?',
        ]
        outputs = [
          `${HEDGE.hypothesis}: prioridad media hasta validar interés real.`,
          'Potencial a estimar tras las primeras conversaciones.',
          'Riesgo: avanzar sin confirmar necesidad ni público.',
        ]
        break
      case 'aprendizaje':
        questions = [
          '¿Qué material interno validado aplica a este caso?',
          '¿Hay casos previos parecidos para reutilizar?',
          '¿Qué información de producto conviene tener a mano?',
        ]
        outputs = [
          'Consultar la biblioteca interna y materiales de producto disponibles.',
          'Buscar casos análogos internos antes de escribir la propuesta.',
          `${HEDGE.questions}: confirmar datos con fuentes internas, no asumirlos.`,
        ]
        break
    }

    return { engineId, engineName: engine.name, questions, outputs }
  })

  const byId = (id: EngineContributionId) =>
    contributions.find((c) => c.engineId === id)!

  const extraQuestion = sourceQuestion(input)
  const extraAngle = sourceMarketAngle(input)
  const extraStep = sourceNextStep(input)

  return {
    title: focus,
    summary:
      `${HEDGE.initialOffer} para "${focus}": ${objective}.` +
      originPhrase +
      ` Basada en el contexto "${context}".` +
      (sourceContext ? ` Origen: ${sourceContext}.` : '') +
      ` ${HUMAN_REVIEW_NOTE}`,
    targetAudience: audience,
    problem: `${problem} (${HEDGE.hypothesis} con el cliente).`,
    opportunity: `${HEDGE.hypothesis}: alcanzar "${outcome}" atendiendo el problema declarado.`,
    proposedOffer:
      `${HEDGE.initialOffer}: una oferta conceptual orientada a "${outcome}", ` +
      'con una versión base y variantes por perfil. Sin condiciones ni precios definidos.',
    differentiators: byId('mercado').outputs,
    questionsToAsk: [
      ...(extraQuestion ? [extraQuestion] : []),
      ...byId('diagnostico').questions,
      ...byId('mercado').questions.slice(0, 2),
    ],
    marketAngles: [
      ...(extraAngle ? [extraAngle] : []),
      ...byId('mercado').outputs,
    ],
    productIdeas: byId('producto').outputs,
    commercialStrategy: byId('comercial').outputs,
    nextSteps: [
      ...(extraStep ? [extraStep] : []),
      'Confirmar el público objetivo y el problema con una conversación de diagnóstico.',
      'Relevar competencia y nicho real antes de fijar el diferencial.',
      'Ajustar la propuesta inicial y definir la variante adecuada.',
      'Preparar el mensaje de apertura y el seguimiento.',
    ],
    risksOrAssumptions: [
      ...byId('direccion').outputs,
      `${HUMAN_REVIEW_NOTE}`,
    ],
    engineContributions: contributions,
  }
}

type EngineContributionId = EngineContribution['engineId']

function audienceShort(input: ProposalInput): string {
  const desc = (input.target_description ?? '').trim()
  if (desc) return desc
  if (input.target_type === 'unknown') return 'el público a definir'
  return TARGET_TYPE_LABELS[input.target_type].toLowerCase()
}
