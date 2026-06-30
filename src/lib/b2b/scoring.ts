import type { Company, CompanyB2BStatus, CampaignType } from '@/types/database'
import { detectICP, ICP_DATA, type ICPKey } from './icp'

export interface B2BScoreResult {
  score: number
  nivel: 'bajo' | 'medio' | 'alto' | 'muy_alto'
  razonesPositivas: string[]
  riesgos: string[]
  proximoPaso: string
  icpSugerido: ICPKey
  campañaSugerida: CampaignType
}

interface ScoreBreakdown {
  icp: number
  tamaño: number
  completitud: number
  estado: number
  campaña: number
}

const ICP_SCORES: Record<ICPKey, number> = {
  clinicas: 25,
  estudios_contables: 25,
  estudios_juridicos: 22,
  empresas_tech: 20,
  socios_directores: 18,
  duenos_pymes: 16,
  constructoras: 14,
  ejecutivos: 14,
  clubes_asociaciones: 12,
  reclutamiento_asesores: 10,
}

const STATUS_SCORES: Record<CompanyB2BStatus, number> = {
  detectada: 5,
  analizada: 10,
  priorizada: 15,
  asignada: 17,
  contactada: 18,
  reunion_agendada: 19,
  en_negociacion: 20,
  convertida: 20,
  descartada: 2,
}

function sizeScore(employees: number | null | undefined): number {
  if (!employees || employees === 0) return 5
  if (employees <= 10) return 8
  if (employees <= 30) return 15
  if (employees <= 100) return 18
  if (employees <= 300) return 14
  return 10
}

function completitudScore(company: Company): { score: number; positivas: string[]; riesgos: string[] } {
  let score = 0
  const positivas: string[] = []
  const riesgos: string[] = []

  if (company.opportunity_detected?.trim()) {
    score += 7
    positivas.push('Oportunidad comercial identificada')
  } else {
    riesgos.push('Sin oportunidad comercial definida aún')
  }

  if (company.commercial_angle?.trim()) {
    score += 6
    positivas.push('Ángulo de entrada definido')
  } else {
    riesgos.push('Sin ángulo comercial para la primera conversación')
  }

  if (company.ideal_contact?.trim()) {
    score += 4
    positivas.push('Contacto clave identificado')
  } else {
    riesgos.push('Sin contacto clave definido')
  }

  if (company.location?.trim()) {
    score += 2
    positivas.push('Ubicación registrada')
  }

  if (company.notes?.trim()) {
    score += 2
  }

  return { score: Math.min(score, 21), positivas, riesgos }
}

export function calcularScoreB2B(company: Company): B2BScoreResult {
  const icp = detectICP(company.industry)
  const icpData = ICP_DATA[icp]

  const breakdown: ScoreBreakdown = {
    icp: ICP_SCORES[icp],
    tamaño: sizeScore(company.estimated_employees),
    completitud: 0,
    estado: STATUS_SCORES[company.b2b_status] ?? 5,
    campaña: company.campaign_id ? 10 : 0,
  }

  const positivas: string[] = []
  const riesgos: string[] = []

  // ICP reasons
  if (breakdown.icp >= 22) {
    positivas.push(`Rubro de alto valor para PLIFE: ${icpData.nombre}`)
  } else if (breakdown.icp >= 15) {
    positivas.push(`Rubro compatible con propuesta B2B: ${icpData.nombre}`)
  } else {
    riesgos.push(`Rubro con ciclo de venta más largo: ${icpData.nombre}`)
  }

  // Size reasons
  const emp = company.estimated_employees
  if (emp && emp >= 11 && emp <= 100) {
    positivas.push(`Tamaño ideal para beneficios B2B (${emp} empleados)`)
  } else if (emp && emp > 100) {
    riesgos.push('Empresa grande: proceso de decisión más largo')
  } else if (emp && emp <= 10) {
    riesgos.push('Empresa pequeña: menor escala para beneficios colectivos')
  } else {
    riesgos.push('Tamaño no registrado: dificulta estimar el potencial')
  }

  // Completeness
  const comp = completitudScore(company)
  breakdown.completitud = comp.score
  positivas.push(...comp.positivas)
  riesgos.push(...comp.riesgos)

  // Status reasons
  if (breakdown.estado >= 15) {
    positivas.push('Estado avanzado en el funnel B2B')
  } else if (breakdown.estado <= 5) {
    riesgos.push('Empresa sin contacto previo — en etapa inicial')
  }

  // Campaign reasons
  if (breakdown.campaña > 0) {
    positivas.push('Asociada a campaña activa')
  } else {
    riesgos.push('Sin campaña asignada — la prospección no está estructurada')
  }

  const rawScore = breakdown.icp + breakdown.tamaño + breakdown.completitud + breakdown.estado + breakdown.campaña
  const score = Math.min(100, Math.max(0, rawScore))

  const nivel: B2BScoreResult['nivel'] =
    score >= 80 ? 'muy_alto' :
    score >= 60 ? 'alto' :
    score >= 40 ? 'medio' : 'bajo'

  // Next step
  let proximoPaso: string
  if (company.b2b_status === 'detectada') {
    if (!company.commercial_angle) {
      proximoPaso = 'Definir ángulo comercial y oportunidad antes de contactar'
    } else if (!company.ideal_contact) {
      proximoPaso = 'Identificar el contacto clave dentro de la empresa'
    } else {
      proximoPaso = 'Avanzar a estado Analizada y preparar el primer contacto'
    }
  } else if (company.b2b_status === 'analizada') {
    if (!company.campaign_id) {
      proximoPaso = 'Asociar a campaña para estructurar la prospección'
    } else {
      proximoPaso = 'Avanzar a estado Priorizada y coordinar primer contacto'
    }
  } else if (company.b2b_status === 'priorizada') {
    proximoPaso = 'Coordinar primera reunión de diagnóstico'
  } else if (company.b2b_status === 'asignada') {
    proximoPaso = 'Preparar el primer contacto con el Copiloto IA'
  } else if (company.b2b_status === 'contactada' || company.b2b_status === 'reunion_agendada') {
    proximoPaso = 'Preparar la reunión de diagnóstico con el Copiloto IA'
  } else if (company.b2b_status === 'en_negociacion') {
    proximoPaso = 'Avanzar propuesta y coordinar cierre'
  } else {
    proximoPaso = 'Mantener seguimiento y documentar avances en el timeline'
  }

  return {
    score,
    nivel,
    razonesPositivas: positivas.slice(0, 5),
    riesgos: riesgos.slice(0, 4),
    proximoPaso,
    icpSugerido: icp,
    campañaSugerida: icpData.campaña_recomendada,
  }
}

export function nivelColor(nivel: B2BScoreResult['nivel']): string {
  switch (nivel) {
    case 'muy_alto': return 'bg-green-100 text-green-800'
    case 'alto': return 'bg-green-100 text-green-800'
    case 'medio': return 'bg-yellow-100 text-yellow-800'
    case 'bajo': return 'bg-gray-100 text-gray-600'
  }
}

export function nivelLabel(nivel: B2BScoreResult['nivel']): string {
  switch (nivel) {
    case 'muy_alto': return 'Muy alto'
    case 'alto': return 'Alto'
    case 'medio': return 'Medio'
    case 'bajo': return 'Bajo'
  }
}
