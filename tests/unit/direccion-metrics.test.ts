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

describe('Dirección — distribución por aseguradora', () => {
  const m = getDireccionMetricsDemo()

  it('suma de la distribución por aseguradora iguala el total de pólizas', () => {
    const suma = Object.values(m.porAseguradora).reduce((a, b) => a + b, 0)
    expect(suma).toBe(DEMO_POLIZAS.length)
  })

  it('las 6 aseguradoras del universo están representadas', () => {
    for (const ins of DEMO_ASEGURADORAS) {
      expect(m.porAseguradora[ins.name]).toBeGreaterThan(0)
    }
  })
})

describe('Dirección — distribución por ramo', () => {
  const m = getDireccionMetricsDemo()

  it('suma de la distribución por ramo iguala el total de pólizas', () => {
    const suma = Object.values(m.porRamo).reduce((a, b) => a + b, 0)
    expect(suma).toBe(DEMO_POLIZAS.length)
  })

  it('los ramos que aparecen existen en el catálogo DEMO_RAMOS', () => {
    const nombresRamos = new Set(DEMO_RAMOS.map(r => r.name))
    for (const ramo of Object.keys(m.porRamo)) {
      expect(nombresRamos.has(ramo)).toBe(true)
    }
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

  it('renovacionesDelMes es exactamente 50, según el universo aprobado', () => {
    expect(m.renovacionesDelMes).toBe(50)
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
  it('exactamente 15, según el universo aprobado', () => {
    expect(getDireccionMetricsDemo().documentacionPendiente).toBe(15)
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

  it('la alerta de concentración por aseguradora refleja la participación real de la principal', () => {
    const m = getDireccionMetricsDemo()
    const alerta = alertas.find(a => a.id === 'alerta-concentracion-aseguradora')
    const top = Object.entries(m.porAseguradora).sort((a, b) => b[1] - a[1])[0]
    const share = top[1] / DEMO_POLIZAS.length
    if (share > 0.25) {
      expect(alerta).toBeDefined()
      expect(alerta!.title).toContain(top[0])
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
