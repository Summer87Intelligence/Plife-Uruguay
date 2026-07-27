import { describe, expect, it, afterEach } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { getMockPolicies, getMockPolicyById, getUpcomingRenewals, getPendingDocumentation, MOCK_POLICIES } from '@/domains/policies/mock-data'
import { POLICY_BOARD_COLUMNS } from '@/domains/policies/types'
import { DEMO_POLIZAS, DEMO_COMERCIALES, DEMO_ASEGURADORAS, DEMO_RAMOS } from '@/lib/demo/universe'
import { PLIFE_BUSINESS_CONFIG } from '@/lib/business-config'

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

describe('modo demo — Pólizas conectado al universo de vida individual Mapfre (Bloque 1)', () => {
  const prevFlag = process.env.NEXT_PUBLIC_DEMO_MODE
  afterEach(() => { process.env.NEXT_PUBLIC_DEMO_MODE = prevFlag })

  it('getMockPolicies() en demo mode devuelve el dataset chico de Bloque 1 (exactamente 26)', () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
    const policies = getMockPolicies()
    expect(policies).toHaveLength(26)
    expect(policies.length).toBe(DEMO_POLIZAS.length)
  })

  it('getMockPolicyById() resuelve cualquier póliza real del universo', () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
    const muestra = [DEMO_POLIZAS[0], DEMO_POLIZAS[Math.floor(DEMO_POLIZAS.length / 2)], DEMO_POLIZAS[DEMO_POLIZAS.length - 1]]
    for (const p of muestra) {
      expect(getMockPolicyById(p.id)).toEqual(p)
    }
  })

  it('getMockPolicyById() sigue devolviendo null para un id inexistente en demo mode', () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
    expect(getMockPolicyById('no-existe')).toBeNull()
  })

  it('exactamente 5 renovaciones dentro del próximo mes (mismo cálculo que Dirección)', () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
    const delMes = getUpcomingRenewals().filter(r => r.daysToExpiry <= 30 && r.daysToExpiry >= -5)
    expect(delMes).toHaveLength(5)
  })

  it('exactamente 4 casos de documentación pendiente', () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
    expect(getPendingDocumentation()).toHaveLength(4)
  })

  it('toda póliza del universo referencia un comercial real, y es Mapfre/Vida (aseguradora y ramo únicos)', () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
    const nombresComerciales = new Set(DEMO_COMERCIALES.map(c => c.full_name))
    const policies = getMockPolicies()
    expect(policies.every(p => nombresComerciales.has(p.assignedToName))).toBe(true)
    expect(policies.every(p => p.insurerName === PLIFE_BUSINESS_CONFIG.insurer)).toBe(true)
    expect(policies.every(p => p.branchName === PLIFE_BUSINESS_CONFIG.insuranceBranch)).toBe(true)
  })

  it('la única aseguradora y el único ramo del universo son Mapfre y Vida', () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
    expect(DEMO_ASEGURADORAS.map(a => a.name)).toEqual(['Mapfre'])
    expect(DEMO_RAMOS.map(r => r.name)).toEqual(['Vida'])
  })

  it('la documentación pendiente tiene antigüedad plausible (trámite reciente, no arrastrado por años)', () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
    const pendientes = getPendingDocumentation().filter(p => p.status === 'pendiente_documentacion')
    const hoy = new Date()
    for (const p of pendientes) {
      const dias = Math.round((hoy.getTime() - new Date(p.createdAt).getTime()) / 86_400_000)
      expect(dias).toBeLessThanOrEqual(30)
    }
  })
})

describe('Pólizas — sin consultas a Supabase (comprobable por código fuente)', () => {
  const SRC = join(process.cwd(), 'src')
  const ARCHIVOS_POLIZAS = [
    'app/app/polizas/page.tsx',
    'app/app/polizas/[id]/page.tsx',
    'app/app/polizas/[id]/policy-detail.tsx',
    'app/app/polizas/policies-view.tsx',
    'app/app/polizas/renovaciones/page.tsx',
    'app/app/polizas/renovaciones/renewals-view.tsx',
    'app/app/polizas/documentacion/page.tsx',
    'app/app/polizas/documentacion/pending-documentation-view.tsx',
    'app/app/polizas/configuracion/page.tsx',
    'app/app/polizas/configuracion/configuracion-view.tsx',
    'components/policies/policy-form-dialog.tsx',
    'domains/policies/mock-data.ts',
    'domains/policies/filters.ts',
  ]

  it('ningún archivo de Pólizas importa el cliente de Supabase', () => {
    for (const rel of ARCHIVOS_POLIZAS) {
      const source = readFileSync(join(SRC, rel), 'utf8')
      expect(source, `${rel} no debería importar Supabase`).not.toMatch(/createClient|@supabase\/|from ['"]@\/lib\/supabase/)
    }
  })

  it('ningún archivo de Pólizas consulta las tablas insurers/insurance_branches', () => {
    for (const rel of ARCHIVOS_POLIZAS) {
      const source = readFileSync(join(SRC, rel), 'utf8')
      expect(source, `${rel} no debería consultar insurers/insurance_branches`).not.toMatch(/from\(['"]insurers['"]\)|from\(['"]insurance_branches['"]\)/)
    }
  })
})

/**
 * Bloque 1 (2026-07-25) — regla de negocio aprobada: Plife es agente
 * exclusivo de MAPFRE Vida. Estos tests blindan esa regla a nivel de código
 * fuente, no solo de datos: ningún archivo del dominio de Pólizas ni del
 * universo demo debería volver a mencionar otra aseguradora.
 */
describe('Pólizas — regla de negocio Bloque 1 (Mapfre/Vida exclusivo)', () => {
  it('PLIFE_BUSINESS_CONFIG declara exactamente una aseguradora y un ramo permitidos', () => {
    expect(PLIFE_BUSINESS_CONFIG.allowedInsurers).toHaveLength(1)
    expect(PLIFE_BUSINESS_CONFIG.allowedBranches).toHaveLength(1)
    expect(PLIFE_BUSINESS_CONFIG.allowedInsurers[0]).toBe('Mapfre')
    expect(PLIFE_BUSINESS_CONFIG.allowedBranches[0]).toBe('Vida')
  })

  it('MOCK_POLICIES (fuera de modo demo) también respeta aseguradora y ramo únicos', () => {
    expect(MOCK_POLICIES.length).toBeGreaterThan(0)
    for (const p of MOCK_POLICIES) {
      expect(p.insurerName).toBe('Mapfre')
      expect(p.branchName).toBe('Vida')
      expect(p.holderName.trim().length).toBeGreaterThan(0)
    }
  })

  it('MOCK_POLICIES respeta el invariante de dataGapsNote', () => {
    for (const p of MOCK_POLICIES) {
      if (p.dataCompleteness === 'completo') expect(p.dataGapsNote).toBeNull()
      else expect(p.dataGapsNote).toBeTruthy()
    }
  })

  function listTsFiles(dir: string): string[] {
    const out: string[] = []
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) out.push(...listTsFiles(full))
      else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) out.push(full)
    }
    return out
  }

  it('ningún archivo de src/domains/policies o src/lib/demo menciona otra aseguradora', () => {
    const PROHIBIDAS = ['BSE', 'SURA', 'Porto Seguro', 'Zurich', 'HDI']
    const dirs = [join(process.cwd(), 'src/domains/policies'), join(process.cwd(), 'src/lib/demo')]
    for (const dir of dirs) {
      for (const file of listTsFiles(dir)) {
        const source = readFileSync(file, 'utf8')
        for (const term of PROHIBIDAS) {
          expect(source, `${file} no debería mencionar "${term}"`).not.toContain(term)
        }
      }
    }
  })
})
