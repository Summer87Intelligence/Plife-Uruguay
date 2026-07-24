import { describe, expect, it } from 'vitest'
import { getMockPolicies, getMockPolicyById, getUpcomingRenewals, getPendingDocumentation } from '@/domains/policies/mock-data'
import { POLICY_BOARD_COLUMNS } from '@/domains/policies/types'

// Bloque UI-0 (Gestión de Pólizas) — solo funciones puras sobre datos mock,
// sin Supabase. Cuando exista persistencia real, este archivo se reemplaza
// por tests de queries.ts.

describe('getMockPolicies / getMockPolicyById', () => {
  it('devuelve una lista no vacía y permite buscar por id', () => {
    const policies = getMockPolicies()
    expect(policies.length).toBeGreaterThan(0)
    expect(getMockPolicyById(policies[0].id)).toEqual(policies[0])
  })

  it('devuelve null para un id inexistente', () => {
    expect(getMockPolicyById('no-existe')).toBeNull()
  })
})

describe('getUpcomingRenewals', () => {
  it('solo incluye vigente/proxima_a_vencer/en_renovacion con fecha de vencimiento', () => {
    const renewals = getUpcomingRenewals()
    for (const r of renewals) {
      expect(['vigente', 'proxima_a_vencer', 'en_renovacion']).toContain(r.status)
      expect(r.endDate).not.toBeNull()
    }
  })

  it('ordena por urgencia ascendente (menor daysToExpiry primero)', () => {
    const renewals = getUpcomingRenewals()
    for (let i = 1; i < renewals.length; i++) {
      expect(renewals[i].daysToExpiry).toBeGreaterThanOrEqual(renewals[i - 1].daysToExpiry)
    }
  })
})

describe('getPendingDocumentation', () => {
  it('incluye pólizas sin documentos o en pendiente_documentacion', () => {
    const pending = getPendingDocumentation()
    expect(pending.length).toBeGreaterThan(0)
    for (const p of pending) {
      expect(p.documents.length === 0 || p.status === 'pendiente_documentacion').toBe(true)
    }
  })
})

describe('POLICY_BOARD_COLUMNS', () => {
  it('tiene exactamente las 5 columnas operativas definidas por el usuario', () => {
    expect(POLICY_BOARD_COLUMNS.map(c => c.label)).toEqual([
      'Vigentes', 'Por vencer', 'En renovación', 'Pendientes de documentación', 'Canceladas',
    ])
  })
})
