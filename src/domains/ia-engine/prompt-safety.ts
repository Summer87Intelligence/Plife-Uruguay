/** Términos sensibles del dominio seguros — no bloquean, generan sugerencias de compliance. */
export const INSURANCE_RISK_TERMS = [
  'prima',
  'primas',
  'cobertura',
  'coberturas',
  'exclusión',
  'exclusiones',
  'rescate',
  'elegibilidad médica',
  'aprobación',
  'garantizado',
  'garantizada',
  'MAPFRE',
  'diagnóstico médico',
  'recomendación médica',
  'recomendación legal',
] as const

/** Frases que indican límites explícitos o revisión humana. */
export const LIMIT_INDICATOR_PHRASES = [
  'no garantizar',
  'no prometer',
  'no afirmar',
  'sin compromiso',
  'sujeto a',
  'requiere validación',
  'requiere revisión',
  'revisión humana',
  'revisión obligatoria',
  'no constituye asesoramiento',
  'no reemplaza',
  'condiciones aplicables',
  'límites',
  'limitaciones',
  'no confirmar',
  'evitar afirmar',
  'no asegurar',
] as const

export const HUMAN_REVIEW_PHRASES = [
  'revisión humana',
  'revisión obligatoria',
  'revisar antes de enviar',
  'validar con asesor',
  'validar con dirección',
  'aprobación humana',
  'supervisión humana',
  'asesor debe revisar',
  'requiere revisión',
] as const

export function normalizeForScan(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

export function detectInsuranceRiskTerms(text: string): string[] {
  const normalized = normalizeForScan(text)
  return INSURANCE_RISK_TERMS.filter(term => normalized.includes(normalizeForScan(term)))
}

export function hasExplicitLimits(text: string): boolean {
  const normalized = normalizeForScan(text)
  return LIMIT_INDICATOR_PHRASES.some(phrase => normalized.includes(normalizeForScan(phrase)))
}

export function hasHumanReviewMention(text: string): boolean {
  const normalized = normalizeForScan(text)
  return HUMAN_REVIEW_PHRASES.some(phrase => normalized.includes(normalizeForScan(phrase)))
}

export function collectRiskTermsFromPrompt(fields: {
  role_persona: string
  context_environment: string
  objective: string
  specific_task: string
  constraints: string
  output_format: string
  target_audience: string
}): string[] {
  const combined = Object.values(fields).join('\n')
  return [...new Set(detectInsuranceRiskTerms(combined))]
}
