// Hybrid compliance engine.
// Layer 1 (always available, no AI): deterministic rules from `compliance_rules`
// plus built-in fallback patterns covering forbidden insurance claims.
// Layer 2 (optional): the compliance_agent refines complex cases when AI is configured.
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, RiskLevel, ComplianceAction, ComplianceRule } from '@/types/database'

export interface ComplianceResult {
  riskLevel: RiskLevel
  triggeredRules: string[]
  riskReasons: string[]
  action: ComplianceAction
  suggestedVersion: string | null
}

interface BuiltinRule {
  pattern: string
  risk: RiskLevel
  reason: string
  alternative: string
}

// Built-in safety net so compliance works even if `compliance_rules` is not seeded.
const BUILTIN_RULES: BuiltinRule[] = [
  { pattern: 'te cubre todo', risk: 'critico', reason: 'Promesa de cobertura total', alternative: 'este plan tiene coberturas específicas que conviene revisar en detalle' },
  { pattern: 'cubre todo', risk: 'critico', reason: 'Promesa de cobertura total', alternative: 'tiene coberturas específicas según la póliza' },
  { pattern: 'garantizado', risk: 'critico', reason: 'Garantía absoluta no permitida', alternative: 'está sujeto a las condiciones de la póliza' },
  { pattern: 'esta garantizado', risk: 'critico', reason: 'Garantía absoluta no permitida', alternative: 'está sujeto a las condiciones de la póliza' },
  { pattern: 'garantiza', risk: 'alto', reason: 'Lenguaje de garantía', alternative: 'contempla, según condiciones,' },
  { pattern: 'te aprueban seguro', risk: 'critico', reason: 'Promesa de aprobación', alternative: 'la aprobación depende de la evaluación de la aseguradora' },
  { pattern: 'aprobacion asegurada', risk: 'critico', reason: 'Promesa de aprobación', alternative: 'la aprobación depende de la evaluación de la aseguradora' },
  { pattern: '100% aprobado', risk: 'critico', reason: 'Promesa de aprobación total', alternative: 'la aprobación depende de la evaluación' },
  { pattern: 'no tiene riesgo', risk: 'alto', reason: 'Negación de riesgo', alternative: 'como toda decisión financiera, conviene evaluar tu situación' },
  { pattern: 'sin riesgo', risk: 'alto', reason: 'Negación de riesgo', alternative: 'con riesgos acotados según el plan' },
  { pattern: 'vas a ganar', risk: 'alto', reason: 'Promesa de rendimiento', alternative: 'los resultados dependen de cada situación' },
  { pattern: 'mejor que cualquier inversion', risk: 'alto', reason: 'Comparación de inversión indebida', alternative: 'es una opción a considerar según tus objetivos' },
  { pattern: 'no necesitas leer condiciones', risk: 'critico', reason: 'Desestima condiciones contractuales', alternative: 'te recomiendo revisar las condiciones de la póliza' },
  { pattern: 'sin letra chica', risk: 'critico', reason: 'Desestima condiciones contractuales', alternative: 'con condiciones claras que conviene revisar' },
  { pattern: 'mapfre seguro lo acepta', risk: 'alto', reason: 'Promesa de aceptación de la aseguradora', alternative: 'la aceptación depende de la evaluación de la aseguradora' },
  { pattern: 'seguro lo acepta', risk: 'alto', reason: 'Promesa de aceptación', alternative: 'la aceptación depende de la evaluación de la aseguradora' },
  { pattern: 'te aseguro que', risk: 'medio', reason: 'Certeza absoluta', alternative: 'según mi experiencia,' },
]

const RISK_RANK: Record<RiskLevel, number> = { bajo: 0, medio: 1, alto: 2, critico: 3 }

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function actionForRisk(risk: RiskLevel): ComplianceAction {
  switch (risk) {
    case 'critico': return 'bloqueado'
    case 'alto': return 'revision_requerida'
    case 'medio': return 'modificado'
    default: return 'aprobado'
  }
}

// Pure deterministic analysis. No IO, no AI.
export function runDeterministicCompliance(
  content: string,
  dbRules: ComplianceRule[] = []
): ComplianceResult {
  const normContent = normalize(content)
  const triggeredRules: string[] = []
  const riskReasons: string[] = []
  let highest: RiskLevel = 'bajo'
  let suggested = content

  const apply = (label: string, risk: RiskLevel, reason: string, rawPattern: string, alternative: string | null, isRegex: boolean) => {
    let matched = false
    if (isRegex) {
      try {
        const re = new RegExp(rawPattern, 'gi')
        if (re.test(content)) {
          matched = true
          if (alternative) suggested = suggested.replace(new RegExp(rawPattern, 'gi'), alternative)
        }
      } catch {
        matched = false
      }
    } else {
      if (normContent.includes(normalize(rawPattern))) {
        matched = true
        if (alternative) {
          const re = new RegExp(rawPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
          suggested = suggested.replace(re, alternative)
        }
      }
    }
    if (matched) {
      triggeredRules.push(label)
      riskReasons.push(reason)
      if (RISK_RANK[risk] > RISK_RANK[highest]) highest = risk
    }
  }

  for (const rule of dbRules) {
    apply(rule.name, rule.risk_level, rule.description || rule.name, rule.pattern, rule.suggested_alternative, rule.is_regex)
  }
  for (const rule of BUILTIN_RULES) {
    apply(rule.pattern, rule.risk, rule.reason, rule.pattern, rule.alternative, false)
  }

  const action = actionForRisk(highest)
  const suggestedVersion = triggeredRules.length > 0 && suggested !== content ? suggested : null

  return {
    riskLevel: triggeredRules.length === 0 ? 'bajo' : highest,
    triggeredRules: [...new Set(triggeredRules)],
    riskReasons: [...new Set(riskReasons)],
    action,
    suggestedVersion,
  }
}

export interface ReviewInput {
  content: string
  context?: string
  channel?: string
  userId: string
  aiInteractionId?: string | null
}

// Runs the deterministic engine, persists a `compliance_reviews` row and returns
// the result. Always works without AI.
export async function reviewCommercialMessage(
  supabase: SupabaseClient<Database>,
  input: ReviewInput
): Promise<ComplianceResult> {
  const { data: rules } = await supabase
    .from('compliance_rules')
    .select('*')
    .eq('is_active', true)

  const result = runDeterministicCompliance(input.content, rules ?? [])

  await supabase.from('compliance_reviews').insert({
    ai_interaction_id: input.aiInteractionId ?? null,
    content_reviewed: input.content,
    risk_level: result.riskLevel,
    risk_reasons: result.riskReasons,
    action: result.action,
    suggested_version: result.suggestedVersion,
    reviewed_by: input.userId,
    reviewed_at: new Date().toISOString(),
    rules_triggered: result.triggeredRules,
  })

  return result
}
