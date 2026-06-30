import { describe, expect, it } from 'vitest'
import { calcularScoreB2B } from '@/lib/b2b/scoring'
import { makeCompany } from './helpers/company'

describe('calcularScoreB2B', () => {
  it('scores tech company with complete data as alto or muy_alto', () => {
    const result = calcularScoreB2B(makeCompany({
      name: 'Nubek Software',
      industry: 'tecnología/software',
      estimated_employees: 45,
      opportunity_detected: 'Retención de talento técnico senior',
      commercial_angle: 'Beneficios como diferencial de employer branding',
      ideal_contact: 'CEO / People Lead',
      location: 'Montevideo',
      b2b_status: 'priorizada',
      campaign_id: 'c0000000-0000-0000-0000-000000000001',
    }))

    expect(result.icpSugerido).toBe('empresas_tech')
    expect(['alto', 'muy_alto']).toContain(result.nivel)
    expect(result.score).toBeGreaterThanOrEqual(60)
    expect(result.razonesPositivas.length).toBeGreaterThan(0)
    expect(result.proximoPaso.trim().length).toBeGreaterThan(0)
    expect(result.campañaSugerida).toBe('empresas_tech')
  })

  it('maps health/clinic industry to clinicas ICP with medium-high score', () => {
    const result = calcularScoreB2B(makeCompany({
      name: 'Clínica Médica Sur',
      industry: 'salud / clínica',
      estimated_employees: 35,
      opportunity_detected: 'Retención de plantilla médica',
      commercial_angle: 'Beneficios para equipo de salud',
      ideal_contact: 'Director médico',
      b2b_status: 'analizada',
    }))

    expect(result.icpSugerido).toBe('clinicas')
    expect(result.score).toBeGreaterThanOrEqual(40)
    expect(result.razonesPositivas.some(r => r.toLowerCase().includes('rubro'))).toBe(true)
  })

  it('maps accounting industry to estudios_contables ICP', () => {
    const result = calcularScoreB2B(makeCompany({
      name: 'Estudio Recalde Contadores',
      industry: 'estudio contable',
      estimated_employees: 12,
      commercial_angle: 'Protección de socios y derivación a clientes pyme',
      ideal_contact: 'Socio fundador',
    }))

    expect(result.icpSugerido).toBe('estudios_contables')
    expect(result.campañaSugerida).toBe('estudios_contables')
  })

  it('handles minimal company data without throwing', () => {
    const result = calcularScoreB2B(makeCompany({
      name: 'Empresa sin datos',
      industry: null,
      estimated_employees: null,
      opportunity_detected: null,
      commercial_angle: null,
      ideal_contact: null,
      b2b_status: 'detectada',
      campaign_id: null,
    }))

    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(['bajo', 'medio']).toContain(result.nivel)
    expect(result.riesgos.length).toBeGreaterThan(0)
    expect(result.proximoPaso.trim().length).toBeGreaterThan(0)
  })

  it('keeps score within 0–100 bounds', () => {
    const high = calcularScoreB2B(makeCompany({
      industry: 'salud / clínica',
      estimated_employees: 50,
      opportunity_detected: 'Oportunidad',
      commercial_angle: 'Ángulo',
      ideal_contact: 'Contacto',
      location: 'Montevideo',
      notes: 'Notas',
      b2b_status: 'en_negociacion',
      campaign_id: 'c0000000-0000-0000-0000-000000000001',
    }))

    const low = calcularScoreB2B(makeCompany({
      industry: null,
      estimated_employees: null,
      b2b_status: 'descartada',
    }))

    expect(high.score).toBeLessThanOrEqual(100)
    expect(high.score).toBeGreaterThanOrEqual(0)
    expect(low.score).toBeLessThanOrEqual(100)
    expect(low.score).toBeGreaterThanOrEqual(0)
  })

  it('does not classify sparse company with risk_notes as perfect without warnings', () => {
    const result = calcularScoreB2B(makeCompany({
      name: 'Empresa con riesgo documentado',
      industry: 'software',
      estimated_employees: 45,
      risk_notes: 'Cliente con objeciones fuertes a seguros colectivos',
      b2b_status: 'detectada',
      campaign_id: null,
      opportunity_detected: null,
      commercial_angle: null,
      ideal_contact: null,
    }))

    expect(result.nivel).not.toBe('muy_alto')
    expect(result.riesgos.length).toBeGreaterThan(0)
    expect(result.score).toBeLessThan(80)
  })
})
