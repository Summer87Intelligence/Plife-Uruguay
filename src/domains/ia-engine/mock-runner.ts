import type { AIExecutionEntityType } from '@/types/database'

export type RunMockAIEngineInput = {
  entityType: AIExecutionEntityType
  entityId: string
  profileId: string
  profileName: string
  prompts: Array<{
    id: string
    name: string
    stageLabel?: string | null
    categoryLabel?: string | null
    executionOrder: number
    promptPreview: string
  }>
}

export type MockEngineOutput = {
  promptId: string
  executionOrder: number
  status: 'completed'
  output: string
  durationMs: number
}

const ENTITY_LABELS: Record<AIExecutionEntityType, string> = {
  company: 'la empresa seleccionada',
  contact: 'el contacto seleccionado',
  opportunity: 'la oportunidad seleccionada',
  campaign: 'la campaña seleccionada',
}

const STAGE_COPY: Record<string, { focus: string; detail: string }> = {
  'Investigación comercial': {
    focus: 'ordenar la información disponible del prospecto',
    detail: 'Este módulo revisaría la información disponible de la entidad y prepararía un resumen comercial para el asesor PLIFE.',
  },
  'Diagnóstico de empresa': {
    focus: 'evaluar el potencial comercial B2B de la empresa',
    detail: 'Este módulo estructuraría señales de tamaño, sector y madurez comercial sin afirmar elegibilidad ni coberturas.',
  },
  'Perfil del contacto': {
    focus: 'caracterizar al interlocutor y su rol en la decisión',
    detail: 'Este módulo ayudaría a identificar tono, prioridades y temas de apertura consultiva para el asesor.',
  },
  'Oportunidad comercial': {
    focus: 'evaluar el estado de la oportunidad en el pipeline',
    detail: 'Este módulo resumiría factores críticos para avanzar, sin prometer cierre ni condiciones comerciales.',
  },
  'Mensaje sugerido': {
    focus: 'proponer un borrador de mensaje comercial consultivo',
    detail: 'Este módulo generaría un borrador prudente para revisión del asesor antes de cualquier envío.',
  },
  'Próximo paso': {
    focus: 'sugerir la acción más relevante para las próximas 48 horas',
    detail: 'Este módulo propondría un siguiente paso concreto y verificable para el seguimiento comercial.',
  },
  'Resumen para dirección': {
    focus: 'sintetizar el estado del caso para lectura ejecutiva',
    detail: 'Este módulo prepararía una síntesis breve para dirección PLIFE, sin conclusiones definitivas.',
  },
}

const LIMITS_BLOCK = `Límites:
- No genera primas.
- No inventa coberturas.
- No reemplaza condiciones MAPFRE.
- Requiere revisión humana del asesor.`

function deterministicDuration(promptId: string, executionOrder: number): number {
  let hash = executionOrder * 47
  for (let i = 0; i < promptId.length; i++) {
    hash = (hash + promptId.charCodeAt(i) * (i + 1)) % 400
  }
  return 120 + hash
}

function buildStageOutput(
  prompt: RunMockAIEngineInput['prompts'][number],
  entityType: AIExecutionEntityType,
  profileName: string,
): string {
  const stageLabel = prompt.stageLabel ?? prompt.name
  const copy = STAGE_COPY[stageLabel] ?? {
    focus: `ejecutar la etapa "${stageLabel}"`,
    detail: `Este módulo simularía el análisis de la etapa ${stageLabel} dentro del perfil ${profileName}.`,
  }

  const categoryLine = prompt.categoryLabel
    ? `Categoría: ${prompt.categoryLabel}.\n`
    : ''

  return [
    `Resultado simulado para la etapa ${stageLabel}.`,
    '',
    copy.detail,
    '',
    `Contexto simulado: ${ENTITY_LABELS[entityType]} (modo prueba, sin consulta externa).`,
    `Perfil: ${profileName}.`,
    `Objetivo de la etapa: ${copy.focus}.`,
    '',
    categoryLine.trim(),
    LIMITS_BLOCK,
    '',
    'Modo: ejecución mock de los Motores PLIFE — determinístico interno, sin proveedor ni fuentes externas.',
  ].filter(Boolean).join('\n')
}

export function runMockAIEngine(input: RunMockAIEngineInput): MockEngineOutput[] {
  const sorted = [...input.prompts].sort((a, b) => a.executionOrder - b.executionOrder)

  return sorted.map(prompt => ({
    promptId: prompt.id,
    executionOrder: prompt.executionOrder,
    status: 'completed' as const,
    output: buildStageOutput(prompt, input.entityType, input.profileName),
    durationMs: deterministicDuration(prompt.id, prompt.executionOrder),
  }))
}
