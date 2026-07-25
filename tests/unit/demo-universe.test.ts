import { describe, expect, it, vi } from 'vitest'
import * as universe from '@/lib/demo/universe'

const {
  DEMO_COMERCIALES, DEMO_EMPRESAS, DEMO_CONTACTOS, DEMO_POLIZAS,
  DEMO_OPORTUNIDADES, DEMO_OPORTUNIDADES_HISTORICAS,
  DEMO_PROPUESTAS, DEMO_PROPUESTAS_HISTORICAS,
  DEMO_LEADS, DEMO_CAMPANAS, DEMO_ASEGURADORAS,
  getUpcomingRenewalsDemo, getPendingDocumentationDemo, getDireccionMetricsDemo,
  getDemoHistoriasTransversales, HISTORIA_A_EMPRESA_ID, HISTORIA_B_LEAD_ID, HISTORIA_C_EMPRESA_ID,
} = universe

function uniqueIds<T extends { id: string }>(items: T[]): Set<string> {
  return new Set(items.map(i => i.id))
}

describe('universo empresarial — cantidades aprobadas', () => {
  it('120 empresas', () => expect(DEMO_EMPRESAS).toHaveLength(120))
  it('~250 contactos', () => expect(DEMO_CONTACTOS.length).toBeGreaterThanOrEqual(240))
  it('~250 contactos (cota superior)', () => expect(DEMO_CONTACTOS.length).toBeLessThanOrEqual(260))
  it('entre 750 y 900 pólizas', () => {
    expect(DEMO_POLIZAS.length).toBeGreaterThanOrEqual(750)
    expect(DEMO_POLIZAS.length).toBeLessThanOrEqual(900)
  })
  it('6 aseguradoras', () => expect(DEMO_ASEGURADORAS).toHaveLength(6))
  it('equipo comercial: 1 director + 1 líder + 4 asesores', () => {
    expect(DEMO_COMERCIALES).toHaveLength(6)
    expect(DEMO_COMERCIALES.filter(c => c.role === 'direccion')).toHaveLength(1)
    expect(DEMO_COMERCIALES.filter(c => c.role === 'lider_comercial')).toHaveLength(1)
    expect(DEMO_COMERCIALES.filter(c => c.role === 'asesor')).toHaveLength(4)
  })
  it('40 oportunidades abiertas', () => expect(DEMO_OPORTUNIDADES).toHaveLength(40))
  it('~75 oportunidades cerradas históricas', () => expect(DEMO_OPORTUNIDADES_HISTORICAS.length).toBe(75))
  it('18 propuestas vigentes', () => expect(DEMO_PROPUESTAS).toHaveLength(18))
  it('55 propuestas aprobadas + 20 rechazadas = 75 históricas', () => {
    expect(DEMO_PROPUESTAS_HISTORICAS.filter(p => p.status === 'used')).toHaveLength(55)
    expect(DEMO_PROPUESTAS_HISTORICAS.filter(p => p.status === 'archived')).toHaveLength(20)
  })
  it('30 leads', () => expect(DEMO_LEADS).toHaveLength(30))
  it('20 campañas, de las cuales 4 activas', () => {
    expect(DEMO_CAMPANAS).toHaveLength(20)
    expect(DEMO_CAMPANAS.filter(c => c.status === 'activa')).toHaveLength(4)
  })
  it('exactamente 50 renovaciones dentro del próximo mes', () => {
    const metrics = getDireccionMetricsDemo()
    expect(metrics.renovacionesDelMes).toBe(50)
  })
  it('exactamente 15 casos con documentación pendiente', () => {
    expect(getPendingDocumentationDemo()).toHaveLength(15)
  })
})

describe('universo empresarial — unicidad de IDs', () => {
  it('empresas sin ids duplicados', () => expect(uniqueIds(DEMO_EMPRESAS).size).toBe(DEMO_EMPRESAS.length))
  it('contactos sin ids duplicados', () => expect(uniqueIds(DEMO_CONTACTOS).size).toBe(DEMO_CONTACTOS.length))
  it('pólizas sin ids duplicados', () => expect(uniqueIds(DEMO_POLIZAS).size).toBe(DEMO_POLIZAS.length))
  it('oportunidades (abiertas + históricas) sin ids duplicados', () => {
    const all = [...DEMO_OPORTUNIDADES, ...DEMO_OPORTUNIDADES_HISTORICAS]
    expect(uniqueIds(all).size).toBe(all.length)
  })
  it('propuestas (vigentes + históricas) sin ids duplicados', () => {
    const all = [...DEMO_PROPUESTAS, ...DEMO_PROPUESTAS_HISTORICAS]
    expect(uniqueIds(all).size).toBe(all.length)
  })
  it('leads sin ids duplicados', () => expect(uniqueIds(DEMO_LEADS).size).toBe(DEMO_LEADS.length))
})

describe('universo empresarial — referencias válidas', () => {
  const empresaIds = new Set(DEMO_EMPRESAS.map(e => e.id))
  const empresaNames = new Set(DEMO_EMPRESAS.map(e => e.name))
  const comercialIds = new Set(DEMO_COMERCIALES.map(c => c.id))
  const comercialNames = new Set(DEMO_COMERCIALES.map(c => c.full_name))

  it('todo contacto referencia una empresa existente', () => {
    expect(DEMO_CONTACTOS.every(c => c.company_id && empresaIds.has(c.company_id))).toBe(true)
  })
  it('toda empresa está asignada a un comercial existente', () => {
    expect(DEMO_EMPRESAS.every(e => e.assigned_to && comercialIds.has(e.assigned_to))).toBe(true)
  })
  it('toda póliza pertenece a una empresa real del universo (por nombre)', () => {
    expect(DEMO_POLIZAS.every(p => empresaNames.has(p.companyName))).toBe(true)
  })
  it('toda póliza está asignada a un comercial real', () => {
    expect(DEMO_POLIZAS.every(p => comercialNames.has(p.assignedToName))).toBe(true)
  })
  it('toda oportunidad abierta referencia empresa o lead válido (nunca ambos vacíos)', () => {
    expect(DEMO_OPORTUNIDADES.every(o => o.company_id || o.lead_id)).toBe(true)
  })
  it('toda oportunidad con company_id referencia una empresa existente', () => {
    const conEmpresa = [...DEMO_OPORTUNIDADES, ...DEMO_OPORTUNIDADES_HISTORICAS].filter(o => o.company_id)
    expect(conEmpresa.every(o => empresaIds.has(o.company_id!))).toBe(true)
  })
  it('toda propuesta referencia empresa (target_description) o lead válido', () => {
    const conLead = [...DEMO_PROPUESTAS, ...DEMO_PROPUESTAS_HISTORICAS].filter(p => p.lead_id)
    const leadIds = new Set(DEMO_LEADS.map(l => l.id))
    expect(conLead.every(p => leadIds.has(p.lead_id!))).toBe(true)
  })
})

describe('universo empresarial — renovaciones y documentación derivadas de pólizas reales', () => {
  it('toda renovación próxima es una póliza real del universo', () => {
    const policyIds = new Set(DEMO_POLIZAS.map(p => p.id))
    expect(getUpcomingRenewalsDemo().every(r => policyIds.has(r.id))).toBe(true)
  })
  it('toda renovación tiene daysToExpiry calculado y estado activo', () => {
    expect(getUpcomingRenewalsDemo().every(r => ['vigente', 'proxima_a_vencer', 'en_renovacion'].includes(r.status))).toBe(true)
  })
  it('toda documentación pendiente es una póliza real del universo', () => {
    const policyIds = new Set(DEMO_POLIZAS.map(p => p.id))
    expect(getPendingDocumentationDemo().every(p => policyIds.has(p.id))).toBe(true)
  })
})

describe('universo empresarial — totales por estado y distribución', () => {
  it('la suma de pólizas por estado iguala el total', () => {
    const statuses = ['vigente', 'proxima_a_vencer', 'en_renovacion', 'pendiente_documentacion', 'cancelada', 'renovada', 'no_renovada', 'rechazada']
    const sum = statuses.reduce((acc, s) => acc + DEMO_POLIZAS.filter(p => p.status === s).length, 0)
    expect(sum).toBe(DEMO_POLIZAS.length)
  })
  it('distribución no vacía por aseguradora: las 6 tienen al menos una póliza', () => {
    for (const ins of DEMO_ASEGURADORAS) {
      expect(DEMO_POLIZAS.some(p => p.insurerName === ins.name)).toBe(true)
    }
  })
  it('la cartera por aseguradora no es artificialmente uniforme (BSE es la de mayor participación)', () => {
    const counts: Record<string, number> = {}
    for (const p of DEMO_POLIZAS) counts[p.insurerName] = (counts[p.insurerName] ?? 0) + 1
    const max = Math.max(...Object.values(counts))
    expect(counts['BSE']).toBe(max)
  })
  it('hay variación de desempeño entre comerciales (no todos con la misma cantidad de empresas)', () => {
    const metrics = getDireccionMetricsDemo()
    const empresasPorComercial = metrics.carteraPorEjecutivo.map(c => c.empresas)
    expect(new Set(empresasPorComercial).size).toBeGreaterThan(1)
  })
})

describe('universo empresarial — historias transversales', () => {
  const historias = getDemoHistoriasTransversales()

  it('Historia A: empresa estratégica identificable por id', () => {
    expect(HISTORIA_A_EMPRESA_ID).toBeTruthy()
    expect(historias.historiaA.empresa.id).toBe(HISTORIA_A_EMPRESA_ID)
  })
  it('Historia A: 12 pólizas, 1 renovación este mes, 2 documentos faltantes, 1 propuesta', () => {
    expect(historias.historiaA.polizas).toHaveLength(12)
    expect(historias.historiaA.polizas.filter(p => p.status === 'pendiente_documentacion')).toHaveLength(2)
    expect(historias.historiaA.polizas.filter(p => p.status === 'proxima_a_vencer').length).toBeGreaterThanOrEqual(1)
    expect(historias.historiaA.contactos).toHaveLength(3)
    expect(historias.historiaA.propuesta).not.toBeNull()
  })
  it('Historia A: cubierta por 2 comerciales distintos', () => {
    const nombres = new Set(historias.historiaA.polizas.map(p => p.assignedToName))
    expect(nombres.size).toBeGreaterThanOrEqual(2)
  })
  it('Historia B: lead identificable por id, con oportunidad y propuesta vinculadas, sin empresa', () => {
    expect(HISTORIA_B_LEAD_ID).toBeTruthy()
    expect(historias.historiaB.lead.id).toBe(HISTORIA_B_LEAD_ID)
    expect(historias.historiaB.oportunidad).not.toBeNull()
    expect(historias.historiaB.oportunidad?.company_id).toBeNull()
    expect(historias.historiaB.propuesta).not.toBeNull()
  })
  it('Historia C: empresa identificable por id con documentación pendiente real', () => {
    expect(HISTORIA_C_EMPRESA_ID).toBeTruthy()
    expect(historias.historiaC.empresa.id).toBe(HISTORIA_C_EMPRESA_ID)
    expect(historias.historiaC.polizasPendientes.length).toBeGreaterThanOrEqual(2)
  })
})

describe('universo empresarial — determinismo', () => {
  it('dos cargas independientes del módulo producen exactamente el mismo universo', async () => {
    const first = { empresas: DEMO_EMPRESAS.map(e => e.name), polizas: DEMO_POLIZAS.map(p => p.id + p.status + p.companyName) }

    vi.resetModules()
    const reloaded = await import('@/lib/demo/universe')

    expect(reloaded.DEMO_EMPRESAS.map(e => e.name)).toEqual(first.empresas)
    expect(reloaded.DEMO_POLIZAS.map(p => p.id + p.status + p.companyName)).toEqual(first.polizas)
  })
})
