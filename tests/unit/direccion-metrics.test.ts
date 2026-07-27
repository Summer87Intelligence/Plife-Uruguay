import { describe, expect, it, vi } from 'vitest'
import * as universe from '@/lib/demo/universe'
import { getMockPolicies, getUpcomingRenewals, getPendingDocumentation } from '@/domains/policies/mock-data'

const {
  DEMO_EMPRESAS, DEMO_CONTACTOS, DEMO_POLIZAS, DEMO_COMERCIALES, DEMO_CAMPANAS,
  DEMO_OPORTUNIDADES, DEMO_OPORTUNIDADES_HISTORICAS, DEMO_PROPUESTAS, DEMO_PROPUESTAS_HISTORICAS,
  DEMO_LEADS, DEMO_ASEGURADORAS, DEMO_RAMOS,
  getDireccionMetricsDemo, getExecutiveAlertsDemo, getDemoExecutiveMetrics,
} = universe

describe('Dirección — totales base coinciden con universe.ts', () => {
  const m = getDireccionMetricsDemo()

  it('empresas, contactos y campañas activas', () => {
    expect(m.totalCompanies).toBe(DEMO_EMPRESAS.length)
    expect(m.totalContacts).toBe(DEMO_CONTACTOS.length)
    expect(m.activeCampaigns).toBe(DEMO_CAMPANAS.filter(c => c.status === 'activa').length)
  })

  it('leads activos coincide con DEMO_LEADS (todos open)', () => {
    expect(m.totalLeadsActivos).toBe(DEMO_LEADS.filter(l => l.status === 'open').length)
    expect(m.totalLeadsActivos).toBeGreaterThan(0)
  })

  it('oportunidades: abiertas, ganadas y perdidas históricas', () => {
    expect(m.totalOpps).toBe(DEMO_OPORTUNIDADES.length)
    expect(m.oportunidadesGanadas).toBe(DEMO_OPORTUNIDADES_HISTORICAS.filter(o => o.stage === 'cerrada_ganada').length)
    expect(m.oportunidadesPerdidas).toBe(DEMO_OPORTUNIDADES_HISTORICAS.filter(o => o.stage === 'cerrada_perdida').length)
  })

  it('propuestas: vigentes, aprobadas y rechazadas', () => {
    expect(m.propuestasVigentes).toBe(DEMO_PROPUESTAS.length)
    expect(m.propuestasAprobadas).toBe(DEMO_PROPUESTAS_HISTORICAS.filter(p => p.status === 'used').length)
    expect(m.propuestasRechazadas).toBe(DEMO_PROPUESTAS_HISTORICAS.filter(p => p.status === 'archived').length)
  })

  it('pólizas totales y vigentes', () => {
    expect(m.totalPolicies).toBe(DEMO_POLIZAS.length)
    expect(m.vigentPolicies).toBe(DEMO_POLIZAS.filter(p => p.status === 'vigente').length)
  })

  it('helper getDemoExecutiveMetrics() es un alias exacto de getDireccionMetricsDemo()', () => {
    expect(getDemoExecutiveMetrics()).toEqual(m)
  })
})

// Bloque 1 (2026-07-25): "distribución por aseguradora" y "distribución por
// ramo" se retiraron de Dirección — con una única aseguradora (Mapfre) y un
// único ramo (Vida) no hay concentración ni distribución que medir. En su
// lugar: distribución por estado de póliza y por origen (cartera heredada
// vs. originada en el CRM).
describe('Dirección — distribución por estado de póliza', () => {
  const m = getDireccionMetricsDemo()

  it('suma de la distribución por estado iguala el total de pólizas', () => {
    const suma = Object.values(m.porEstado).reduce((a, b) => a + b, 0)
    expect(suma).toBe(DEMO_POLIZAS.length)
  })

  it('los estados que aparecen son estados válidos de PolicyStatus', () => {
    const ESTADOS_VALIDOS = new Set([
      'borrador', 'cotizacion', 'pendiente_documentacion', 'enviada_a_aseguradora', 'emitida',
      'vigente', 'proxima_a_vencer', 'en_renovacion', 'renovada', 'no_renovada', 'cancelada', 'rechazada',
    ])
    for (const estado of Object.keys(m.porEstado)) expect(ESTADOS_VALIDOS.has(estado)).toBe(true)
  })
})

describe('Dirección — distribución por origen (cartera heredada vs. CRM)', () => {
  const m = getDireccionMetricsDemo()

  it('suma de la distribución por origen iguala el total de pólizas', () => {
    const suma = Object.values(m.porOrigen).reduce((a, b) => a + b, 0)
    expect(suma).toBe(DEMO_POLIZAS.length)
  })

  it('solo existen los dos orígenes válidos', () => {
    for (const origen of Object.keys(m.porOrigen)) {
      expect(['cartera_heredada', 'originada_en_crm']).toContain(origen)
    }
  })
})

describe('Dirección — calidad de datos de la cartera', () => {
  it('registrosIncompletos coincide con las pólizas dataCompleteness === "incompleto"', () => {
    const m = getDireccionMetricsDemo()
    expect(m.registrosIncompletos).toBe(DEMO_POLIZAS.filter(p => p.dataCompleteness === 'incompleto').length)
  })
})

describe('Dirección — regla de negocio Bloque 1 (Mapfre/Vida exclusivo)', () => {
  it('1 aseguradora y 1 ramo en todo el universo', () => {
    expect(DEMO_ASEGURADORAS).toHaveLength(1)
    expect(DEMO_RAMOS).toHaveLength(1)
    expect(DEMO_ASEGURADORAS[0].name).toBe('Mapfre')
    expect(DEMO_RAMOS[0].name).toBe('Vida')
  })

  it('getDireccionMetricsDemo() ya no expone porAseguradora, porRamo ni facturacionPorEmpresa', () => {
    const m = getDireccionMetricsDemo() as Record<string, unknown>
    expect(m.porAseguradora).toBeUndefined()
    expect(m.porRamo).toBeUndefined()
    expect(m.facturacionPorEmpresa).toBeUndefined()
  })
})

describe('Dirección — distribución por comercial (carteraPorEjecutivo)', () => {
  const m = getDireccionMetricsDemo()

  it('incluye a los 6 comerciales del universo', () => {
    expect(m.carteraPorEjecutivo).toHaveLength(6)
  })

  it('la suma de empresas por comercial iguala el total de empresas', () => {
    const suma = m.carteraPorEjecutivo.reduce((s, c) => s + c.empresas, 0)
    expect(suma).toBe(DEMO_EMPRESAS.length)
  })

  it('la suma de pólizas por comercial iguala el total de pólizas', () => {
    const suma = m.carteraPorEjecutivo.reduce((s, c) => s + c.polizas, 0)
    expect(suma).toBe(DEMO_POLIZAS.length)
  })

  it('hay variación real de carga entre comerciales (no todos iguales)', () => {
    const empresas = m.carteraPorEjecutivo.map(c => c.empresas)
    expect(new Set(empresas).size).toBeGreaterThan(1)
  })
})

describe('Dirección — oportunidades por etapa', () => {
  const m = getDireccionMetricsDemo()

  it('la suma de stageCounts iguala las oportunidades abiertas', () => {
    const suma = Object.values(m.stageCounts).reduce((a, b) => a + b, 0)
    expect(suma).toBe(DEMO_OPORTUNIDADES.length)
  })

  it('ninguna etapa cerrada aparece en stageCounts (DEMO_OPORTUNIDADES son solo abiertas)', () => {
    expect(m.stageCounts['cerrada_ganada']).toBeUndefined()
    expect(m.stageCounts['cerrada_perdida']).toBeUndefined()
  })
})

describe('Dirección — propuestas por estado', () => {
  const m = getDireccionMetricsDemo()

  it('la suma de propuestasPorEstado iguala vigentes + históricas', () => {
    const suma = Object.values(m.propuestasPorEstado).reduce((a, b) => a + b, 0)
    expect(suma).toBe(DEMO_PROPUESTAS.length + DEMO_PROPUESTAS_HISTORICAS.length)
  })
})

describe('Dirección — renovaciones', () => {
  const m = getDireccionMetricsDemo()

  // 5 = 3 en bucket "proxima_mes" + 2 en "renovacion_mes" del dataset chico
  // de Bloque 1 (POLICY_SPECS en universe.ts) — ver demo-universe.test.ts.
  it('renovacionesDelMes es exactamente 5, según el dataset chico aprobado (Bloque 1)', () => {
    expect(m.renovacionesDelMes).toBe(5)
  })

  it('renovacionesPorUrgencia suma exactamente a renovacionesProximas (ventana de 60 días)', () => {
    const { critica, proximoMes, seguimiento60 } = m.renovacionesPorUrgencia
    expect(critica + proximoMes + seguimiento60).toBe(m.renovacionesProximas)
  })

  it('renovacionesDelMes (con piso de -5 días) nunca supera a critica+proximoMes (sin piso)', () => {
    // renovacionesDelMes acota lo vencido a -5 días (para no contar renovaciones
    // muy atrasadas como "de este mes"); "crítica" del desglose de urgencia no
    // tiene ese piso — por diseño no son la misma ventana, pero una nunca
    // puede superar a la otra.
    const { critica, proximoMes } = m.renovacionesPorUrgencia
    expect(m.renovacionesDelMes).toBeLessThanOrEqual(critica + proximoMes)
  })
})

describe('Dirección — documentación pendiente', () => {
  // 4 = pólizas en bucket "pendiente_documentacion" del dataset chico (Bloque 1).
  it('exactamente 4, según el dataset chico aprobado (Bloque 1)', () => {
    expect(getDireccionMetricsDemo().documentacionPendiente).toBe(4)
  })
})

describe('Dirección — alertas ejecutivas', () => {
  const alertas = getExecutiveAlertsDemo()

  it('solo devuelve alertas con severidad alta o media (sin ruido de "todo bien")', () => {
    expect(alertas.every(a => a.severity === 'alta' || a.severity === 'media')).toBe(true)
  })

  it('cada alerta tiene un href real de la aplicación', () => {
    for (const a of alertas) {
      expect(a.href.startsWith('/app/')).toBe(true)
    }
  })

  it('no hay más de 6 alertas a la vez (evita saturar la pantalla)', () => {
    expect(alertas.length).toBeLessThanOrEqual(6)
  })

  it('están ordenadas por severidad (alta antes que media)', () => {
    const orden: Record<string, number> = { alta: 0, media: 1 }
    for (let i = 1; i < alertas.length; i++) {
      expect(orden[alertas[i].severity]).toBeGreaterThanOrEqual(orden[alertas[i - 1].severity])
    }
  })

  it('no existe ninguna alerta de concentración por aseguradora ni de clientes estratégicos por empresa (retiradas en Bloque 1)', () => {
    expect(alertas.find(a => a.id === 'alerta-concentracion-aseguradora')).toBeUndefined()
    expect(alertas.find(a => a.id === 'alerta-clientes-estrategicos')).toBeUndefined()
  })

  it('la alerta de calidad de datos refleja registrosIncompletos', () => {
    const m = getDireccionMetricsDemo()
    const alerta = alertas.find(a => a.id === 'alerta-calidad-datos')
    if (m.registrosIncompletos > 0) {
      expect(alerta).toBeDefined()
      expect(alerta!.title).toContain(String(m.registrosIncompletos))
    } else {
      expect(alerta).toBeUndefined()
    }
  })
})

describe('Dirección — coherencia con Pólizas (mismos totales base)', () => {
  const prevFlag = process.env.NEXT_PUBLIC_DEMO_MODE

  it('total de pólizas, renovaciones del mes y documentación pendiente son idénticos en ambas pantallas', () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
    const m = getDireccionMetricsDemo()
    expect(getMockPolicies().length).toBe(m.totalPolicies)
    const renewalsMes = getUpcomingRenewals().filter(r => r.daysToExpiry <= 30 && r.daysToExpiry >= -5).length
    expect(renewalsMes).toBe(m.renovacionesDelMes)
    expect(getPendingDocumentation().length).toBe(m.documentacionPendiente)
    process.env.NEXT_PUBLIC_DEMO_MODE = prevFlag
  })
})

describe('Dirección — determinismo', () => {
  it('dos cargas del módulo devuelven exactamente las mismas métricas ejecutivas', async () => {
    const first = getDireccionMetricsDemo()
    vi.resetModules()
    const reloaded = await import('@/lib/demo/universe')
    expect(reloaded.getDireccionMetricsDemo()).toEqual(first)
  })
})
