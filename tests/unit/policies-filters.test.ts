import { describe, expect, it } from 'vitest'
import { filterPolicies, daysToExpiryOf } from '@/domains/policies/filters'
import type { Policy } from '@/domains/policies/types'

// Bloque 1 (2026-07-25): Plife es agente exclusivo de MAPFRE Vida — el
// fixture por defecto respeta esa regla (aseguradora Mapfre, ramo Vida,
// titular persona física). El describe "estado / aseguradora / ramo /
// comercial" sigue probando el mecanismo genérico de filterPolicies (que no
// conoce la regla de negocio) con valores de prueba claramente ficticios,
// nunca con nombres reales de otras aseguradoras.
function pol(overrides: Partial<Policy>): Policy {
  return {
    id: 'pol-x',
    policyNumber: 'MAP-1',
    holderName: 'Titular X',
    contactName: null,
    insurerName: 'Mapfre',
    branchName: 'Vida',
    product: 'Vida individual — PENDIENTE DE VALIDAR CON PLIFE (nombre comercial)',
    status: 'vigente',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    premium: 100000,
    currency: 'UYU',
    paymentFrequency: 'mensual',
    origin: 'cartera_heredada',
    dataCompleteness: 'completo',
    dataGapsNote: null,
    commissionValue: 10,
    commissionType: 'percentage',
    assignedToName: 'Ana Deleón',
    documents: [],
    nextAction: null,
    nextActionDate: null,
    notes: null,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  }
}

const HOY = new Date('2026-07-24T12:00:00Z')

describe('filterPolicies — sin filtros', () => {
  it('sin criterios devuelve todas las pólizas', () => {
    const policies = [pol({ id: 'a' }), pol({ id: 'b' })]
    expect(filterPolicies(policies, {})).toHaveLength(2)
  })
})

describe('filterPolicies — búsqueda', () => {
  const policies = [
    pol({ id: 'a', holderName: 'Lucía García', policyNumber: 'MAP-100' }),
    pol({ id: 'b', holderName: 'Nicolás Fernández', policyNumber: 'MAP-200' }),
  ]
  it('busca por titular (case-insensitive)', () => {
    expect(filterPolicies(policies, { search: 'lucía' }).map(p => p.id)).toEqual(['a'])
  })
  it('busca por número de póliza', () => {
    expect(filterPolicies(policies, { search: 'map-200' }).map(p => p.id)).toEqual(['b'])
  })
  it('sin coincidencias devuelve vacío', () => {
    expect(filterPolicies(policies, { search: 'no existe esto' })).toHaveLength(0)
  })
})

describe('filterPolicies — estado / aseguradora / ramo / comercial', () => {
  // insurerName/branchName ficticios a propósito (el mecanismo genérico de
  // filterPolicies no conoce la regla de negocio de Plife) — nunca nombres
  // reales de otras aseguradoras/ramos.
  const policies = [
    pol({ id: 'a', status: 'vigente', insurerName: 'Aseguradora Test Uno', branchName: 'Ramo Test Uno', assignedToName: 'Ana Deleón' }),
    pol({ id: 'b', status: 'proxima_a_vencer', insurerName: 'Aseguradora Test Dos', branchName: 'Ramo Test Dos', assignedToName: 'Rodrigo Silva' }),
  ]
  it('filtra por estado', () => {
    expect(filterPolicies(policies, { estado: 'proxima_a_vencer' }).map(p => p.id)).toEqual(['b'])
  })
  it('filtra por aseguradora', () => {
    expect(filterPolicies(policies, { aseguradora: 'Aseguradora Test Uno' }).map(p => p.id)).toEqual(['a'])
  })
  it('filtra por ramo', () => {
    expect(filterPolicies(policies, { ramo: 'Ramo Test Dos' }).map(p => p.id)).toEqual(['b'])
  })
  it('filtra por comercial', () => {
    expect(filterPolicies(policies, { comercial: 'Rodrigo Silva' }).map(p => p.id)).toEqual(['b'])
  })
  it('combina varios filtros a la vez (AND)', () => {
    expect(filterPolicies(policies, { estado: 'vigente', aseguradora: 'Aseguradora Test Uno' }).map(p => p.id)).toEqual(['a'])
    expect(filterPolicies(policies, { estado: 'vigente', aseguradora: 'Aseguradora Test Dos' })).toHaveLength(0)
  })
})

describe('filterPolicies — vencimiento', () => {
  const policies = [
    pol({ id: 'vencida', endDate: '2026-07-10' }), // -14 días
    pol({ id: 'urgente', endDate: '2026-07-28' }),  // +4 días
    pol({ id: 'mes', endDate: '2026-08-15' }),      // +22 días
    pol({ id: 'trimestre', endDate: '2026-09-20' }), // +58 días
    pol({ id: 'lejos', endDate: '2027-01-01' }),
    pol({ id: 'sin-fecha', endDate: null, status: 'pendiente_documentacion' }),
  ]
  it('"vencidas" solo incluye daysToExpiry negativo', () => {
    expect(filterPolicies(policies, { vencimiento: 'vencidas' }, HOY).map(p => p.id)).toEqual(['vencida'])
  })
  it('"urgente" incluye 0-7 días', () => {
    expect(filterPolicies(policies, { vencimiento: 'urgente' }, HOY).map(p => p.id)).toEqual(['urgente'])
  })
  it('"mes" incluye 0-30 días', () => {
    expect(filterPolicies(policies, { vencimiento: 'mes' }, HOY).map(p => p.id).sort()).toEqual(['urgente', 'mes'].sort())
  })
  it('pólizas sin fecha de vencimiento quedan fuera de cualquier filtro de vencimiento', () => {
    expect(filterPolicies(policies, { vencimiento: 'trimestre' }, HOY).map(p => p.id)).not.toContain('sin-fecha')
  })
})

describe('daysToExpiryOf', () => {
  it('calcula días hasta el vencimiento contra la fecha dada', () => {
    expect(daysToExpiryOf(pol({ endDate: '2026-08-03' }), HOY)).toBe(10)
  })
  it('devuelve null si no hay endDate', () => {
    expect(daysToExpiryOf(pol({ endDate: null }), HOY)).toBeNull()
  })
})
