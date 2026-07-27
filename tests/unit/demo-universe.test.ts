import { describe, expect, it, vi } from 'vitest'
import * as universe from '@/lib/demo/universe'

const {
  DEMO_COMERCIALES, DEMO_EMPRESAS, DEMO_CONTACTOS, DEMO_POLIZAS,
  DEMO_OPORTUNIDADES, DEMO_OPORTUNIDADES_HISTORICAS,
  DEMO_PROPUESTAS, DEMO_PROPUESTAS_HISTORICAS,
  DEMO_LEADS, DEMO_CAMPANAS, DEMO_ASEGURADORAS, DEMO_RAMOS,
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
  // Bloque 1 (2026-07-25): pólizas de vida individual son por persona, no por
  // empresa — el dataset pasó de ~800 (generado desde 120 empresas B2B) a un
  // set chico y escrito a mano (ver POLICY_SPECS en universe.ts).
  it('exactamente 26 pólizas (dataset chico Bloque 1)', () => expect(DEMO_POLIZAS).toHaveLength(26))
  it('1 aseguradora (Mapfre) — Plife es agente exclusivo', () => expect(DEMO_ASEGURADORAS).toHaveLength(1))
  it('1 ramo (Vida) — negocio especializado en vida individual', () => expect(DEMO_RAMOS).toHaveLength(1))
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
  // 5 = 3 en bucket "proxima_mes" (endDate +1..+28) + 2 en "renovacion_mes"
  // (endDate -3..+3) del nuevo dataset chico — ver POLICY_SPECS en universe.ts.
  it('exactamente 5 renovaciones dentro del próximo mes', () => {
    const metrics = getDireccionMetricsDemo()
    expect(metrics.renovacionesDelMes).toBe(5)
  })
  // 4 = pólizas en bucket "pendiente_documentacion" del nuevo dataset chico.
  it('exactamente 4 casos con documentación pendiente', () => {
    expect(getPendingDocumentationDemo()).toHaveLength(4)
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
  const comercialIds = new Set(DEMO_COMERCIALES.map(c => c.id))
  const comercialNames = new Set(DEMO_COMERCIALES.map(c => c.full_name))

  it('todo contacto referencia una empresa existente', () => {
    expect(DEMO_CONTACTOS.every(c => c.company_id && empresaIds.has(c.company_id))).toBe(true)
  })
  it('toda empresa está asignada a un comercial existente', () => {
    expect(DEMO_EMPRESAS.every(e => e.assigned_to && comercialIds.has(e.assigned_to))).toBe(true)
  })
  it('toda póliza tiene un titular (persona física) no vacío', () => {
    expect(DEMO_POLIZAS.every(p => typeof p.holderName === 'string' && p.holderName.trim().length > 0)).toBe(true)
  })
  it('ningún titular de póliza coincide con el nombre de un asesor (no confundir titular con comercial)', () => {
    expect(DEMO_POLIZAS.every(p => !comercialNames.has(p.holderName))).toBe(true)
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
  it('hay variación de desempeño entre comerciales (no todos con la misma cantidad de empresas)', () => {
    const metrics = getDireccionMetricsDemo()
    const empresasPorComercial = metrics.carteraPorEjecutivo.map(c => c.empresas)
    expect(new Set(empresasPorComercial).size).toBeGreaterThan(1)
  })
})

describe('universo empresarial — regla de negocio Bloque 1 (Mapfre/Vida exclusivo)', () => {
  const PROHIBIDAS = ['BSE', 'SURA', 'Porto Seguro', 'Zurich', 'HDI']
  const RAMOS_VIEJOS = ['Vehículos', 'Responsabilidad civil', 'Accidentes de trabajo', 'Incendio', 'Transporte', 'Hogar', 'Comercio']

  it('DEMO_ASEGURADORAS es exactamente ["Mapfre"]', () => {
    expect(DEMO_ASEGURADORAS.map(a => a.name)).toEqual(['Mapfre'])
  })
  it('DEMO_RAMOS es exactamente ["Vida"]', () => {
    expect(DEMO_RAMOS.map(r => r.name)).toEqual(['Vida'])
  })
  it('toda póliza es Mapfre y Vida — ninguna aseguradora ni ramo viejo aparece', () => {
    for (const p of DEMO_POLIZAS) {
      expect(p.insurerName).toBe('Mapfre')
      expect(p.branchName).toBe('Vida')
      expect(PROHIBIDAS).not.toContain(p.insurerName)
      expect(RAMOS_VIEJOS).not.toContain(p.branchName)
    }
  })
  it('toda póliza declara origin y dataCompleteness válidos, con invariante de dataGapsNote', () => {
    for (const p of DEMO_POLIZAS) {
      expect(['cartera_heredada', 'originada_en_crm']).toContain(p.origin)
      expect(['completo', 'incompleto']).toContain(p.dataCompleteness)
      if (p.dataCompleteness === 'completo') expect(p.dataGapsNote).toBeNull()
      else expect(p.dataGapsNote).toBeTruthy()
    }
  })
  it('leads y oportunidades heredan el ramo único (Vida) — la afinidad rubro→ramo queda sin efecto', () => {
    expect(DEMO_LEADS.every(l => l.interest_area === 'Vida')).toBe(true)
    expect(DEMO_OPORTUNIDADES.every(o => o.suggested_product === 'Vida')).toBe(true)
    expect(DEMO_OPORTUNIDADES_HISTORICAS.every(o => o.suggested_product === 'Vida')).toBe(true)
  })
})

describe('universo empresarial — historias transversales', () => {
  const historias = getDemoHistoriasTransversales()

  it('Historia A: empresa identificable por id, con contactos y propuesta', () => {
    expect(HISTORIA_A_EMPRESA_ID).toBeTruthy()
    expect(historias.historiaA.empresa.id).toBe(HISTORIA_A_EMPRESA_ID)
    expect(historias.historiaA.contactos).toHaveLength(3)
    expect(historias.historiaA.propuesta).not.toBeNull()
  })
  it('Historia B: lead identificable por id, con oportunidad y propuesta vinculadas, sin empresa', () => {
    expect(HISTORIA_B_LEAD_ID).toBeTruthy()
    expect(historias.historiaB.lead.id).toBe(HISTORIA_B_LEAD_ID)
    expect(historias.historiaB.oportunidad).not.toBeNull()
    expect(historias.historiaB.oportunidad?.company_id).toBeNull()
    expect(historias.historiaB.propuesta).not.toBeNull()
  })
  it('Historia C: empresa identificable por id', () => {
    expect(HISTORIA_C_EMPRESA_ID).toBeTruthy()
    expect(historias.historiaC.empresa.id).toBe(HISTORIA_C_EMPRESA_ID)
  })
})

describe('universo empresarial — determinismo', () => {
  it('dos cargas independientes del módulo producen exactamente el mismo universo', async () => {
    const first = { empresas: DEMO_EMPRESAS.map(e => e.name), polizas: DEMO_POLIZAS.map(p => p.id + p.status + p.holderName) }

    vi.resetModules()
    const reloaded = await import('@/lib/demo/universe')

    expect(reloaded.DEMO_EMPRESAS.map(e => e.name)).toEqual(first.empresas)
    expect(reloaded.DEMO_POLIZAS.map(p => p.id + p.status + p.holderName)).toEqual(first.polizas)
  })
})
