/**
 * Universo mock de la demo comercial de PLIFE Growth OS — universo empresarial.
 *
 * Generado una única vez por proceso, determinístico (misma semilla en cada
 * carga), a partir de pools de nombres/empresas/aseguradoras verosímiles (ver
 * ./pools.ts). Todas las entidades se referencian entre sí por id real
 * generado acá — nada queda huérfano ni desconectado.
 *
 * Compatibilidad: todos los exports que ya consumían las pantallas (Hoy,
 * Dirección, Pólizas, Leads, Pipeline, Propuestas, Campañas, Admin, [id]
 * pages, radar-b2b) se mantienen con el mismo nombre y la misma forma — solo
 * cambian los datos que contienen. Los exports nuevos (getDemo*, historias
 * transversales) son adicionales, no reemplazan nada.
 *
 * Semántica de "legado" preservada a propósito:
 * - DEMO_OPORTUNIDADES = solo las 40 abiertas (así se mostraban en Pipeline).
 *   El histórico de cierres vive aparte en DEMO_OPORTUNIDADES_HISTORICAS.
 * - DEMO_PROPUESTAS = solo las 18 vigentes (así se mostraban en Propuestas).
 *   El histórico vive aparte en DEMO_PROPUESTAS_HISTORICAS.
 * Esto evita que pantallas no tocadas en este paso (Pipeline, Propuestas)
 * reciban de golpe un array con semántica distinta a la que ya asumen.
 *
 * Activo únicamente cuando isDemoMode() === true (ver src/lib/demo.ts). No
 * escribe nada en Supabase.
 */
import { makeRng } from './prng'
import {
  NOMBRES, APELLIDOS, DEPARTAMENTOS, PUNTOS_CARDINALES,
  EMPRESA_TEMPLATES_CURADAS, SECTOR_DEFS, NOMBRE_HISTORIA_A,
  POSICIONES, ASEGURADORAS_DEMO, ASEGURADORA_WEIGHTS, RAMOS_DEMO,
  COMERCIALES_DEMO, PRODUCTOS_POR_RAMO,
} from './pools'
import type { SectorKey } from './pools'
import type {
  Company, ContactWithRelations, OpportunityWithRelations, Proposal, Campaign,
  Activity, CompanyB2BStatus, ContactStatus, InterestLevel, OpportunityStage,
  RiskLevel, ActivityType, CampaignStatus, CampaignType,
} from '@/types/database'
import type { MockLead } from '@/domains/leads/mock-data'
import type { LeadPipelineStage, LeadPriority, LeadSource, LeadTemperature } from '@/domains/leads/types'
import type { Policy, PolicyDocument, PolicyStatus } from '@/domains/policies/types'
import type { Insurer, InsuranceBranch, Team } from '@/types/database'

const SEED = 20260724
const rng = makeRng(SEED)
const NOW = new Date()

function slugify(name: string): string {
  return name
    .normalize('NFD').replace(/\p{M}/gu, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '')
    .slice(0, 14)
}

function phone(): string {
  return `+598 9${rng.int(1, 9)} ${rng.int(100, 999)} ${rng.int(100, 999)}`
}

function normalize(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}

// ---------------------------------------------------------------------------
// Equipo comercial (6): 1 Director, 1 Líder, 4 Asesores con desempeño desigual.
// ---------------------------------------------------------------------------
export const DEMO_COMERCIALES = COMERCIALES_DEMO

// ---------------------------------------------------------------------------
// Plantillas de empresa (120): 41 curadas a mano + generación por sector
// hasta el objetivo de cada uno (ver SECTOR_DEFS en pools.ts).
// ---------------------------------------------------------------------------
interface CompanyTemplateFull { name: string; industry: string; campaignType: string; sector: SectorKey }

function buildCompanyTemplates(): CompanyTemplateFull[] {
  const used = new Set(EMPRESA_TEMPLATES_CURADAS.map(t => t.name))
  const bySector = new Map<SectorKey, CompanyTemplateFull[]>()
  for (const def of SECTOR_DEFS) bySector.set(def.key, [])
  for (const t of EMPRESA_TEMPLATES_CURADAS) bySector.get(t.sector)!.push(t)

  // Historia A: nombre exacto pedido por negocio ("Transportes del Sur"), sector transporte.
  const transporteDef = SECTOR_DEFS.find(d => d.key === 'transporte')!
  bySector.get('transporte')!.push({ name: NOMBRE_HISTORIA_A, industry: transporteDef.industryLabel, campaignType: transporteDef.campaignType, sector: 'transporte' })
  used.add(NOMBRE_HISTORIA_A)

  for (const def of SECTOR_DEFS) {
    const current = bySector.get(def.key)!
    let guard = 0
    while (current.length < def.targetTotal && guard < 800) {
      guard++
      const pattern = rng.pick(def.namePatterns)
      const ap = rng.pick(APELLIDOS)
      const ap2 = rng.pick(APELLIDOS.filter(a => a !== ap))
      const card = rng.pick(PUNTOS_CARDINALES)
      const name = pattern.replace('{ap2}', ap2).replace('{ap}', ap).replace('{card}', card)
      if (used.has(name)) continue
      used.add(name)
      current.push({ name, industry: def.industryLabel, campaignType: def.campaignType, sector: def.key })
    }
  }
  return SECTOR_DEFS.flatMap(def => bySector.get(def.key)!)
}

const ALL_TEMPLATES = buildCompanyTemplates()

// ---------------------------------------------------------------------------
// Tiers de cuenta (tamaño de cartera) y madurez (historia de relación).
// ---------------------------------------------------------------------------
type Tier = 'ancla' | 'grande' | 'mediana' | 'chica'
type Madurez = 'nuevo' | 'consolidando' | 'maduro'

const TIER_RANGO_POLIZAS: Record<Tier, [number, number]> = {
  ancla: [20, 40], grande: [8, 15], mediana: [3, 8], chica: [1, 3],
}
const TIER_RANGO_CONTACTOS: Record<Tier, [number, number]> = {
  ancla: [4, 5], grande: [3, 4], mediana: [2, 3], chica: [1, 1],
}

/** 8 cuentas ancla curadas a mano (nombres ya usados en capturas previas). */
const NOMBRES_ANCLA = [
  'Sanatorio Costa Azul', 'Grupo Constructor Litoral', 'Club Náutico Carrasco',
  'Frigorífico Del Este', 'Agropecuaria Santa Rosa', 'Hotel Boutique La Barra',
  'Supermercado Varela e Hijos', 'Softlab Uruguay',
]

function buildProportionalAssignment<T extends string>(
  templates: CompanyTemplateFull[],
  targets: Record<T, number>,
  overrides: [string, T][],
): Map<string, T> {
  const pool: T[] = []
  for (const [label, count] of Object.entries(targets) as [T, number][]) {
    for (let i = 0; i < count; i++) pool.push(label)
  }
  const shuffled = rng.shuffle(pool)
  const assignment = new Map<string, T>()
  templates.forEach((t, i) => assignment.set(t.name, shuffled[i]))

  for (const [name, wanted] of overrides) {
    const current = assignment.get(name)
    if (current === wanted) continue
    const swapWith = templates.find(t => assignment.get(t.name) === wanted && !overrides.some(([n]) => n === t.name))
    if (swapWith) {
      assignment.set(swapWith.name, current!)
      assignment.set(name, wanted)
    }
  }
  return assignment
}

const TIER_BY_NAME = buildProportionalAssignment<Tier>(
  ALL_TEMPLATES,
  { ancla: 8, grande: 17, mediana: 45, chica: 50 },
  [...NOMBRES_ANCLA.map((n): [string, Tier] => [n, 'ancla']), [NOMBRE_HISTORIA_A, 'grande']],
)
const MADUREZ_BY_NAME = buildProportionalAssignment<Madurez>(
  ALL_TEMPLATES,
  { nuevo: 24, consolidando: 42, maduro: 54 },
  [...NOMBRES_ANCLA.map((n): [string, Madurez] => [n, 'maduro']), [NOMBRE_HISTORIA_A, 'consolidando']],
)

// ---------------------------------------------------------------------------
// Cartera por comercial: desigual a propósito (carteraObjetivo por persona),
// con overrides para cuentas nombradas / historias trazables.
// ---------------------------------------------------------------------------
const CARTERA_OVERRIDES: Record<string, string> = {
  'Sanatorio Costa Azul': 'com-01',
  'Grupo Constructor Litoral': 'com-01',
  'Hotel Boutique La Barra': 'com-02',
  [NOMBRE_HISTORIA_A]: 'com-02',
  'Frigorífico Del Este': 'com-03',
  'Supermercado Varela e Hijos': 'com-03',
  'Softlab Uruguay': 'com-04',
  'Club Náutico Carrasco': 'com-05',
  'Agropecuaria Santa Rosa': 'com-06',
  'Estudio Techera Auditores': 'com-06',
}

function buildCarteraAssignment(templates: CompanyTemplateFull[]): Map<string, string> {
  const assignment = new Map<string, string>()
  for (const [name, comercialId] of Object.entries(CARTERA_OVERRIDES)) assignment.set(name, comercialId)

  const restantes = templates.filter(t => !assignment.has(t.name))
  const pool: string[] = []
  for (const c of DEMO_COMERCIALES) {
    const yaAsignadas = Object.values(CARTERA_OVERRIDES).filter(id => id === c.id).length
    const restante = Math.max(0, c.carteraObjetivo - yaAsignadas)
    for (let i = 0; i < restante; i++) pool.push(c.id)
  }
  const shuffled = rng.shuffle(pool)
  restantes.forEach((t, i) => assignment.set(t.name, shuffled[i % Math.max(1, shuffled.length)]))
  return assignment
}

const CARTERA_BY_NAME = buildCarteraAssignment(ALL_TEMPLATES)

// ---------------------------------------------------------------------------
// Empresas (120)
// ---------------------------------------------------------------------------
interface EmpresaMeta { sector: SectorKey; tier: Tier; madurez: Madurez }
const EMPRESA_META = new Map<string, EmpresaMeta>()

const B2B_STATUS_NUEVO_POOL: CompanyB2BStatus[] = ['en_negociacion', 'contactada']

export const DEMO_EMPRESAS: Company[] = ALL_TEMPLATES.map((tpl, i) => {
  const id = `emp-${i + 1}`
  const comercialId = CARTERA_BY_NAME.get(tpl.name)!
  const comercial = DEMO_COMERCIALES.find(c => c.id === comercialId)!
  const tier = TIER_BY_NAME.get(tpl.name)!
  const madurez = MADUREZ_BY_NAME.get(tpl.name)!
  EMPRESA_META.set(id, { sector: tpl.sector, tier, madurez })

  // Clientes ya convertidos (madurez consolidando/maduro); los "nuevos" siguen
  // técnicamente en negociación comercial aunque ya tengan la primera póliza —
  // así Radar B2B (que filtra por status de prospección) no queda vacío.
  const b2bStatus: CompanyB2BStatus = madurez === 'nuevo' ? rng.pick(B2B_STATUS_NUEVO_POOL) : 'convertida'
  const createdDaysAgo = madurez === 'nuevo' ? rng.int(15, 150) : madurez === 'consolidando' ? rng.int(200, 700) : rng.int(700, 1800)
  const sizePool = tier === 'ancla' ? ['51-200', '201-500'] : tier === 'grande' ? ['11-50', '51-200'] : tier === 'mediana' ? ['11-50', '1-10'] : ['1-10']
  const employeesRange: [number, number] = tier === 'ancla' ? [60, 220] : tier === 'grande' ? [20, 80] : tier === 'mediana' ? [6, 30] : [2, 12]
  const scoreRange: [number, number] = tier === 'ancla' ? [78, 97] : tier === 'grande' ? [65, 90] : tier === 'mediana' ? [50, 80] : [40, 70]

  return {
    id,
    name: tpl.name,
    industry: tpl.industry,
    website: `https://www.${slugify(tpl.name)}.com.uy`,
    linkedin_url: null,
    instagram_url: null,
    location: rng.pick(DEPARTAMENTOS),
    estimated_size: rng.pick(sizePool),
    estimated_employees: rng.int(...employeesRange),
    source: rng.pick(['Referido', 'Radar B2B', 'Campaña comercial', 'Contacto directo']),
    b2b_score: rng.int(...scoreRange),
    b2b_status: b2bStatus,
    commercial_angle: null,
    ideal_contact: null,
    risk_notes: null,
    opportunity_detected: null,
    notes: null,
    assigned_to: comercial.id,
    campaign_id: null,
    ai_analysis: null,
    ai_analyzed_at: null,
    deleted_at: null,
    created_at: rng.isoOffset(NOW, -createdDaysAgo),
    updated_at: rng.isoOffset(NOW, -rng.int(0, Math.min(createdDaysAgo, 25))),
    created_by: comercial.id,
    updated_by: comercial.id,
  }
})

function ramoParaSector(sector: SectorKey): string {
  const def = SECTOR_DEFS.find(d => d.key === sector)!
  // 75% ramo afín al rubro (afinidad rubro→ramo), 25% otro — para no ser artificialmente perfecto.
  return rng.bool(0.75) ? rng.pick(def.ramosAfines) : rng.pick(RAMOS_DEMO)
}

// ---------------------------------------------------------------------------
// Contactos (~250)
// ---------------------------------------------------------------------------
const CONTACT_STATUSES: ContactStatus[] = ['contactado', 'interesado', 'en_seguimiento', 'reunion_agendada', 'diagnostico_realizado']
const INTEREST_LEVELS: InterestLevel[] = ['medio', 'alto', 'muy_alto']
const CONTACTOS_OVERRIDE: Record<string, number> = { [NOMBRE_HISTORIA_A]: 3 }

export const DEMO_CONTACTOS: ContactWithRelations[] = DEMO_EMPRESAS.flatMap((empresa, ei) => {
  const meta = EMPRESA_META.get(empresa.id)!
  const [min, max] = TIER_RANGO_CONTACTOS[meta.tier]
  const count = CONTACTOS_OVERRIDE[empresa.name] ?? rng.int(min, max)
  return Array.from({ length: count }, (_, ci) => {
    const first = rng.pick(NOMBRES)
    const last = rng.pick(APELLIDOS)
    return {
      id: `con-${ei + 1}-${ci + 1}`,
      first_name: first,
      last_name: last,
      email: `${slugify(first)}.${slugify(last)}@${slugify(empresa.name)}.com.uy`,
      phone: phone(),
      linkedin_url: null,
      position: ci === 0 ? rng.pick(POSICIONES.slice(0, 3)) : rng.pick(POSICIONES),
      source: empresa.source,
      status: rng.pick(CONTACT_STATUSES),
      interest_level: rng.pick(INTEREST_LEVELS),
      detected_need: null,
      last_interaction_at: rng.isoOffset(NOW, -rng.int(0, 25)),
      next_action: ci === 0 ? rng.pick(['Llamar para revisar renovación', 'Coordinar visita comercial', 'Enviar propuesta actualizada', null]) : null,
      next_action_date: ci === 0 ? rng.dateOffset(NOW, rng.int(-2, 10)) : null,
      notes: null,
      data_consent: true,
      data_origin: 'formulario_web',
      company_id: empresa.id,
      assigned_to: empresa.assigned_to,
      deleted_at: null,
      created_at: empresa.created_at,
      updated_at: rng.isoOffset(NOW, -rng.int(0, 15)),
      created_by: empresa.created_by,
      updated_by: empresa.updated_by,
      company: empresa,
    }
  })
})

function contactsOf(empresaId: string) {
  return DEMO_CONTACTOS.filter(c => c.company_id === empresaId)
}

// ---------------------------------------------------------------------------
// Pólizas (~800): por empresa según su tier, con cohortes EXACTAS de
// renovación "próximo mes" (50) y documentación pendiente (15) — nunca un
// número aparte, siempre pólizas reales de empresas reales.
// ---------------------------------------------------------------------------
type StatusBucket =
  | 'vigente' | 'proxima_mes' | 'proxima_otro' | 'renovacion_mes' | 'renovacion_otro'
  | 'pendiente_documentacion' | 'cancelada' | 'renovada' | 'no_renovada' | 'rechazada'

const BUCKET_TO_STATUS: Record<StatusBucket, PolicyStatus> = {
  vigente: 'vigente',
  proxima_mes: 'proxima_a_vencer',
  proxima_otro: 'proxima_a_vencer',
  renovacion_mes: 'en_renovacion',
  renovacion_otro: 'en_renovacion',
  pendiente_documentacion: 'pendiente_documentacion',
  cancelada: 'cancelada',
  renovada: 'renovada',
  no_renovada: 'no_renovada',
  rechazada: 'rechazada',
}

const POLIZAS_OVERRIDE_COUNT: Record<string, number> = { [NOMBRE_HISTORIA_A]: 12 }

interface PolicySlot { empresaId: string; empresaName: string; sector: SectorKey }

const POLICY_SLOTS: PolicySlot[] = DEMO_EMPRESAS.flatMap(empresa => {
  const meta = EMPRESA_META.get(empresa.id)!
  const [min, max] = TIER_RANGO_POLIZAS[meta.tier]
  const count = POLIZAS_OVERRIDE_COUNT[empresa.name] ?? rng.int(min, max)
  return Array.from({ length: count }, (): PolicySlot => ({ empresaId: empresa.id, empresaName: empresa.name, sector: meta.sector }))
})

// Historias trazables A y C: cohortes forzadas por empresa (se sacan del pool
// general antes de repartir el resto — así los totales exactos (50/15) nunca
// se ven afectados por lo que le toque a estas dos empresas).
const OVERRIDES_POR_EMPRESA = new Map<string, StatusBucket[]>([
  [NOMBRE_HISTORIA_A, [
    'proxima_mes', 'pendiente_documentacion', 'pendiente_documentacion', 'renovada',
    'vigente', 'vigente', 'vigente', 'vigente', 'vigente', 'vigente', 'vigente', 'vigente',
  ]],
  ['Estudio Techera Auditores', ['pendiente_documentacion', 'pendiente_documentacion']],
])

const reservedSlots: (PolicySlot & { bucket: StatusBucket })[] = []
const freeSlots: PolicySlot[] = []
const overrideCursor = new Map<string, number>()
for (const slot of POLICY_SLOTS) {
  const overrides = OVERRIDES_POR_EMPRESA.get(slot.empresaName)
  const cursor = overrideCursor.get(slot.empresaName) ?? 0
  if (overrides && cursor < overrides.length) {
    reservedSlots.push({ ...slot, bucket: overrides[cursor] })
    overrideCursor.set(slot.empresaName, cursor + 1)
  } else {
    freeSlots.push(slot)
  }
}

const cohortMesRestante = Math.max(0, 50 - reservedSlots.filter(s => s.bucket === 'proxima_mes' || s.bucket === 'renovacion_mes').length)
const cohortDocRestante = Math.max(0, 15 - reservedSlots.filter(s => s.bucket === 'pendiente_documentacion').length)
const proximaMesRestante = Math.round(cohortMesRestante * 0.75)
const renovacionMesRestante = cohortMesRestante - proximaMesRestante

const FLEX_RATIOS: Record<string, number> = {
  proxima_otro: 0.062, renovacion_otro: 0.030, cancelada: 0.073, renovada: 0.060, no_renovada: 0.026, rechazada: 0.013,
}
const remainingFlexible = Math.max(0, freeSlots.length - proximaMesRestante - renovacionMesRestante - cohortDocRestante)
const flexCounts: Record<string, number> = {}
let flexAssigned = 0
for (const key of Object.keys(FLEX_RATIOS)) {
  const c = Math.round(FLEX_RATIOS[key] * remainingFlexible)
  flexCounts[key] = c
  flexAssigned += c
}
flexCounts.vigente = Math.max(0, remainingFlexible - flexAssigned)

const statusPool: StatusBucket[] = [
  ...Array.from({ length: proximaMesRestante }, (): StatusBucket => 'proxima_mes'),
  ...Array.from({ length: renovacionMesRestante }, (): StatusBucket => 'renovacion_mes'),
  ...Array.from({ length: cohortDocRestante }, (): StatusBucket => 'pendiente_documentacion'),
  ...Array.from({ length: flexCounts.proxima_otro }, (): StatusBucket => 'proxima_otro'),
  ...Array.from({ length: flexCounts.renovacion_otro }, (): StatusBucket => 'renovacion_otro'),
  ...Array.from({ length: flexCounts.cancelada }, (): StatusBucket => 'cancelada'),
  ...Array.from({ length: flexCounts.renovada }, (): StatusBucket => 'renovada'),
  ...Array.from({ length: flexCounts.no_renovada }, (): StatusBucket => 'no_renovada'),
  ...Array.from({ length: flexCounts.rechazada }, (): StatusBucket => 'rechazada'),
  ...Array.from({ length: flexCounts.vigente }, (): StatusBucket => 'vigente'),
]
while (statusPool.length < freeSlots.length) statusPool.push('vigente')
while (statusPool.length > freeSlots.length) statusPool.pop()

const shuffledStatusPool = rng.shuffle(statusPool)
const allPolicySlots: (PolicySlot & { bucket: StatusBucket })[] = [
  ...reservedSlots,
  ...freeSlots.map((slot, i) => ({ ...slot, bucket: shuffledStatusPool[i] })),
]

/** "2 comerciales" en algunas cuentas — parte de sus pólizas las lleva un segundo ejecutivo. */
const SEGUNDO_COMERCIAL: Record<string, string> = {
  [NOMBRE_HISTORIA_A]: 'com-03',
  'Sanatorio Costa Azul': 'com-04',
}

const INSURER_PREFIX: Record<string, string> = {
  BSE: 'BSE', 'Porto Seguro': 'POR', Mapfre: 'MAP', SURA: 'SUR', Zurich: 'ZUR', HDI: 'HDI',
}

function documentsFor(status: PolicyStatus): PolicyDocument[] {
  const base: PolicyDocument[] = []
  if (status === 'pendiente_documentacion') {
    if (rng.bool(0.3)) {
      base.push({ id: `doc-${rng.int(1, 999999)}-a`, type: 'propuesta_cotizacion', name: 'Cotización enviada al cliente.pdf', addedAt: rng.dateOffset(NOW, -rng.int(1, 10)), addedByName: rng.pick(DEMO_COMERCIALES).full_name })
    }
    return base
  }
  // Cualquier otro estado ya tiene al menos un documento — solo "pendiente
  // documentación" puede quedar con la carpeta vacía (evita que una póliza
  // rechazada/cancelada cuente por error como documentación pendiente).
  const tipoBase = status === 'rechazada' ? 'propuesta_cotizacion' : 'poliza_emitida'
  base.push({ id: `doc-${rng.int(1, 999999)}-a`, type: tipoBase, name: status === 'rechazada' ? 'Solicitud evaluada.pdf' : 'Póliza emitida.pdf', addedAt: rng.dateOffset(NOW, -rng.int(30, 200)), addedByName: rng.pick(DEMO_COMERCIALES).full_name })
  if (rng.bool(0.55)) {
    base.push({ id: `doc-${rng.int(1, 999999)}-b`, type: 'condiciones_particulares', name: 'Condiciones particulares.pdf', addedAt: rng.dateOffset(NOW, -rng.int(30, 200)), addedByName: rng.pick(DEMO_COMERCIALES).full_name })
  }
  return base
}

function fechasParaBucket(bucket: StatusBucket) {
  switch (bucket) {
    case 'vigente': {
      const nextAction = rng.pick(['Confirmar datos actualizados con el cliente', 'Sin acción pendiente por ahora', null])
      return { startDate: rng.dateOffset(NOW, -rng.int(30, 300)), endDate: rng.dateOffset(NOW, rng.int(61, 400)), nextAction, nextActionDate: nextAction ? rng.dateOffset(NOW, rng.int(15, 90)) : null, notes: null as string | null }
    }
    case 'proxima_mes':
      // Márgenes de 2 días contra los bordes de la ventana de 30 días:
      // getUpcomingRenewalsDemo() trunca fechas vía toISOString() (UTC)
      // mientras NOW es hora local — sin margen, el redondeo puede correr
      // algún caso 1 día fuera de la ventana según el huso horario del proceso.
      return { startDate: rng.dateOffset(NOW, -rng.int(300, 340)), endDate: rng.dateOffset(NOW, rng.int(1, 28)), nextAction: 'Iniciar renovación', nextActionDate: rng.dateOffset(NOW, rng.int(0, 8)), notes: null as string | null }
    case 'proxima_otro':
      return { startDate: rng.dateOffset(NOW, -rng.int(300, 340)), endDate: rng.dateOffset(NOW, rng.int(32, 60)), nextAction: 'Iniciar renovación', nextActionDate: rng.dateOffset(NOW, rng.int(10, 25)), notes: null as string | null }
    case 'renovacion_mes':
      return { startDate: rng.dateOffset(NOW, -rng.int(340, 380)), endDate: rng.dateOffset(NOW, rng.int(-3, 3)), nextAction: rng.pick(['Esperando condiciones de renovación de la aseguradora', 'Confirmar nueva prima con el cliente']), nextActionDate: rng.dateOffset(NOW, rng.int(-2, 5)), notes: rng.bool(0.4) ? 'La aseguradora solicitó actualizar datos antes de emitir la renovación.' : null }
    case 'renovacion_otro':
      return { startDate: rng.dateOffset(NOW, -rng.int(340, 390)), endDate: rng.dateOffset(NOW, rng.int(-25, -7)), nextAction: 'Confirmar nueva prima con el cliente', nextActionDate: rng.dateOffset(NOW, rng.int(-10, 0)), notes: null as string | null }
    case 'pendiente_documentacion':
      return { startDate: null, endDate: null, nextAction: rng.pick(['Solicitar RUT y padrón al cliente', 'Falta comprobante de titularidad', 'Esperando cédula del titular']), nextActionDate: rng.dateOffset(NOW, rng.int(-2, 8)), notes: null as string | null }
    case 'cancelada':
      return { startDate: rng.dateOffset(NOW, -rng.int(400, 1200)), endDate: rng.dateOffset(NOW, -rng.int(10, 300)), nextAction: null, nextActionDate: null, notes: rng.pick(['Cliente canceló por cierre de actividad.', 'Cliente cambió de aseguradora.', 'Baja solicitada por el cliente.']) }
    case 'renovada':
      return { startDate: rng.dateOffset(NOW, -rng.int(10, 60)), endDate: rng.dateOffset(NOW, rng.int(300, 365)), nextAction: null, nextActionDate: null, notes: 'Renovada con nueva vigencia.' }
    case 'no_renovada':
      return { startDate: rng.dateOffset(NOW, -rng.int(400, 700)), endDate: rng.dateOffset(NOW, -rng.int(5, 90)), nextAction: 'Evaluar recontacto comercial en el próximo semestre', nextActionDate: rng.dateOffset(NOW, rng.int(60, 150)), notes: 'Cliente decidió no renovar; evaluar recontacto más adelante.' }
    case 'rechazada':
      return { startDate: null, endDate: null, nextAction: 'Buscar alternativa con otra aseguradora', nextActionDate: rng.dateOffset(NOW, rng.int(0, 10)), notes: 'La aseguradora no emitió la póliza tras la evaluación de riesgo.' }
  }
}

export const DEMO_POLIZAS: Policy[] = allPolicySlots.map((slot, index) => {
  const empresa = DEMO_EMPRESAS.find(e => e.id === slot.empresaId)!
  const contactosEmpresa = contactsOf(empresa.id)
  const contacto = contactosEmpresa.length > 0 ? rng.pick(contactosEmpresa) : null
  const insurerName = rng.pickWeighted(ASEGURADORA_WEIGHTS)
  const branchName = ramoParaSector(slot.sector)
  const product = rng.pick(PRODUCTOS_POR_RAMO[branchName] ?? [branchName])
  const status = BUCKET_TO_STATUS[slot.bucket]

  const segundoId = SEGUNDO_COMERCIAL[empresa.name]
  const comercialId = segundoId && rng.bool(0.35) ? segundoId : (empresa.assigned_to ?? DEMO_COMERCIALES[0].id)
  const comercial = DEMO_COMERCIALES.find(c => c.id === comercialId)!

  const sinNumero = status === 'pendiente_documentacion' || status === 'rechazada'
  const policyNumber = sinNumero ? null : `${INSURER_PREFIX[insurerName] ?? 'POL'}-${rng.int(10000, 99999)}`
  const fechas = fechasParaBucket(slot.bucket)
  const sinImporte = status === 'pendiente_documentacion' || status === 'rechazada'

  return {
    id: `pol-${index + 1}`,
    policyNumber,
    companyName: empresa.name,
    contactName: contacto ? `${contacto.first_name} ${contacto.last_name}` : null,
    insurerName,
    branchName,
    product,
    status,
    startDate: fechas.startDate,
    endDate: fechas.endDate,
    premium: sinImporte ? null : rng.int(15000, 420000),
    currency: 'UYU',
    commissionValue: sinImporte ? null : rng.int(8, 16),
    commissionType: sinImporte ? null : 'percentage',
    assignedToName: comercial.full_name,
    documents: documentsFor(status),
    nextAction: fechas.nextAction,
    nextActionDate: fechas.nextActionDate,
    notes: fechas.notes,
    // pendiente_documentacion: trámite recién abierto, no un caso arrastrado
    // desde hace años — antigüedad realista de "esperando papeles".
    createdAt: status === 'pendiente_documentacion' ? rng.dateOffset(NOW, -rng.int(1, 25)) : rng.dateOffset(NOW, -rng.int(10, 1200)),
    updatedAt: rng.dateOffset(NOW, -rng.int(0, 25)),
  }
})

// Garantizar "2 comerciales" en Historia A incluso si el sorteo (35%) no le
// tocó a ninguna de sus 12 pólizas — probabilidad de eso es ínfima pero esta
// historia es explícita, no debe depender de la suerte del RNG.
{
  const polizasHistoriaA = DEMO_POLIZAS.filter(p => p.companyName === NOMBRE_HISTORIA_A)
  if (polizasHistoriaA.length > 0 && !polizasHistoriaA.some(p => p.assignedToName === 'Rodrigo Silva')) {
    polizasHistoriaA[0].assignedToName = 'Rodrigo Silva'
  }
}

/** Empresas fuera del tier "ancla" — usadas para poblar leads/oportunidades/propuestas nuevas (las cuentas ancla ya están saturadas de historia, no de prospección). */
function empresaEnCrecimiento(): Company {
  const pool = rng.bool(0.8) ? DEMO_EMPRESAS.filter(e => EMPRESA_META.get(e.id)!.tier !== 'ancla') : DEMO_EMPRESAS
  return rng.pick(pool)
}

// ---------------------------------------------------------------------------
// Leads (30) — incluye la Historia B (lead que evolucionó a oportunidad y
// propuesta, todavía sin convertirse en cliente).
// ---------------------------------------------------------------------------
const LEAD_STAGES: LeadPipelineStage[] = ['nuevo', 'contactado', 'calificando', 'interesado', 'propuesta_reunion', 'seguimiento']
const LEAD_SOURCES: LeadSource[] = ['referral', 'web', 'campaign', 'radar_b2b', 'call', 'whatsapp']
const LEAD_PRIORITIES: LeadPriority[] = ['low', 'medium', 'high']
const LEAD_TEMPERATURES: LeadTemperature[] = ['cold', 'warm', 'hot']

const LEAD_PROSPECT_TEMPLATES = [
  { name: 'Metalúrgica Bentancor', industry: 'Industria' },
  { name: 'Farmacia Central Rivera', industry: 'Comercio' },
  { name: 'Estudio de Diseño Methol', industry: 'Servicios profesionales' },
  { name: 'Cooperativa Agraria del Norte', industry: 'Agropecuario' },
  { name: 'Autoservicio Techera', industry: 'Comercio' },
  { name: 'Instituto de Idiomas Quiroga', industry: 'Educación' },
  { name: 'Taller Mecánico Olivera', industry: 'Servicios' },
  { name: 'Inmobiliaria Costa Este', industry: 'Inmobiliaria' },
]

function buildLead(id: string, stage: LeadPipelineStage, forcedTemplate?: { name: string; industry: string }): MockLead {
  const usaEmpresaExistente = !forcedTemplate && rng.bool(0.45)
  const empresa = usaEmpresaExistente ? empresaEnCrecimiento() : null
  const prospecto = forcedTemplate ?? (!empresa ? rng.pick(LEAD_PROSPECT_TEMPLATES) : null)
  const nombre = empresa?.name ?? prospecto!.name
  const sector = empresa ? EMPRESA_META.get(empresa.id)!.sector : rng.pick(SECTOR_DEFS).key
  const branch = ramoParaSector(sector)
  const comercial = rng.pick(DEMO_COMERCIALES.filter(c => c.role === 'asesor'))
  const source = rng.pick(LEAD_SOURCES)
  const createdDaysAgo = rng.int(0, 60)

  return {
    id,
    title: `${nombre} — interés en ${branch.toLowerCase()}`,
    display_name: nombre,
    lead_type: 'company',
    source,
    status: 'open',
    pipeline_stage: stage,
    priority: rng.pick(LEAD_PRIORITIES),
    temperature: rng.pick(LEAD_TEMPERATURES),
    interest_area: branch,
    phone: phone(),
    email: `contacto@${slugify(nombre)}.com.uy`,
    next_action: rng.pick(['Llamar para calificar interés', 'Coordinar primera reunión', 'Enviar información inicial', 'Confirmar datos de contacto']),
    next_action_date: rng.dateOffset(NOW, rng.int(-1, 10)),
    assigned_to: comercial.id,
    created_at: rng.isoOffset(NOW, -createdDaysAgo),
    updated_at: rng.isoOffset(NOW, -rng.int(0, createdDaysAgo)),
    converted_at: null,
    discarded_at: null,
  } satisfies MockLead
}

const HISTORIA_B_LEAD: MockLead = buildLead('lead-historia-b', 'propuesta_reunion', { name: 'Metalúrgica Bentancor', industry: 'Industria' })

export const DEMO_LEADS: MockLead[] = [
  HISTORIA_B_LEAD,
  ...Array.from({ length: 29 }, (_, i) => buildLead(`lead-${i + 1}`, rng.pick(LEAD_STAGES))),
]

// ---------------------------------------------------------------------------
// Oportunidades — 40 abiertas (DEMO_OPORTUNIDADES, semántica legacy de
// Pipeline) + histórico de cierres aparte (75: 45 ganadas + 30 perdidas).
// ---------------------------------------------------------------------------
const PIPELINE_STAGES_DEMO: OpportunityStage[] = [
  'nueva', 'calificada', 'contactada', 'reunion_agendada',
  'diagnostico_realizado', 'propuesta_conceptual', 'validacion_plife', 'seguimiento',
]
const RISK_LEVELS: RiskLevel[] = ['bajo', 'medio', 'alto']

function buildOpportunity(id: string, stage: OpportunityStage, empresa: Company | null, leadId: string | null): OpportunityWithRelations {
  const contactosEmpresa = empresa ? contactsOf(empresa.id) : []
  const contacto = contactosEmpresa.length > 0 ? rng.pick(contactosEmpresa) : null
  const comercial = empresa
    ? (DEMO_COMERCIALES.find(c => c.id === empresa.assigned_to) ?? rng.pick(DEMO_COMERCIALES))
    : rng.pick(DEMO_COMERCIALES.filter(c => c.role === 'asesor'))
  const sector = empresa ? EMPRESA_META.get(empresa.id)!.sector : rng.pick(SECTOR_DEFS).key
  const branch = ramoParaSector(sector)
  const closed = stage === 'cerrada_ganada' || stage === 'cerrada_perdida'

  return {
    id,
    title: `${rng.pick(PRODUCTOS_POR_RAMO[branch] ?? [branch])} — ${empresa?.name ?? 'Prospecto sin convertir'}`,
    type: 'b2b',
    stage,
    estimated_value: rng.int(20000, 380000),
    probability: closed ? (stage === 'cerrada_ganada' ? 100 : 0) : rng.int(20, 80),
    ai_score: null,
    human_score: rng.int(40, 95),
    detected_need: `Necesidad de cobertura de ${branch.toLowerCase()} detectada en seguimiento comercial`,
    suggested_product: branch,
    commercial_risk: rng.pick(RISK_LEVELS),
    risk_notes: null,
    next_action: closed ? null : rng.pick(['Coordinar reunión de diagnóstico', 'Enviar propuesta conceptual', 'Hacer seguimiento telefónico', 'Confirmar interés con el contacto']),
    next_action_date: closed ? null : rng.dateOffset(NOW, rng.int(-2, 12)),
    loss_reason: stage === 'cerrada_perdida' ? rng.pick(['Eligió otra correduría', 'Postergó la decisión', 'Precio']) : null,
    notes: null,
    contact_id: contacto?.id ?? null,
    company_id: empresa?.id ?? null,
    assigned_to: comercial.id,
    campaign_id: null,
    lead_id: leadId,
    last_activity_at: rng.isoOffset(NOW, -rng.int(0, 20)),
    deleted_at: null,
    created_at: closed ? rng.isoOffset(NOW, -rng.int(60, 900)) : rng.isoOffset(NOW, -rng.int(10, 200)),
    updated_at: closed ? rng.isoOffset(NOW, -rng.int(20, 400)) : rng.isoOffset(NOW, -rng.int(0, 15)),
    created_by: comercial.id,
    updated_by: comercial.id,
    contact: contacto ?? null,
    company: empresa ?? null,
    assigned_profile: { id: comercial.id, email: `${slugify(comercial.full_name)}@plife.com.uy`, full_name: comercial.full_name, avatar_url: null, role: comercial.role, phone: null, is_active: true, onboarding_completed: true, created_at: rng.isoOffset(NOW, -400), updated_at: rng.isoOffset(NOW, -10) },
  }
}

export const DEMO_OPORTUNIDADES: OpportunityWithRelations[] = [
  buildOpportunity('opp-historia-b', 'propuesta_conceptual', null, HISTORIA_B_LEAD.id),
  ...Array.from({ length: 39 }, (_, i) => buildOpportunity(`opp-${i + 1}`, rng.pick(PIPELINE_STAGES_DEMO), empresaEnCrecimiento(), null)),
]

const OPORTUNIDADES_GANADAS: OpportunityWithRelations[] = Array.from({ length: 45 }, (_, i) =>
  buildOpportunity(`opp-hist-won-${i + 1}`, 'cerrada_ganada', empresaEnCrecimiento(), null))
const OPORTUNIDADES_PERDIDAS: OpportunityWithRelations[] = Array.from({ length: 30 }, (_, i) =>
  buildOpportunity(`opp-hist-lost-${i + 1}`, 'cerrada_perdida', empresaEnCrecimiento(), null))
export const DEMO_OPORTUNIDADES_HISTORICAS: OpportunityWithRelations[] = [...OPORTUNIDADES_GANADAS, ...OPORTUNIDADES_PERDIDAS]

// ---------------------------------------------------------------------------
// Campañas (20) — 4 activas, 16 históricas (finalizadas/pausadas).
// ---------------------------------------------------------------------------
const CAMPAIGN_TYPES_DEMO: CampaignType[] = [
  'estudios_contables', 'estudios_juridicos', 'clinicas', 'constructoras',
  'empresas_tech', 'clubes_asociaciones', 'profesionales_independientes', 'duenos_pymes',
]
const CAMPAIGN_NAMES: Record<CampaignType, string> = {
  duenos_pymes: 'Dueños de pymes — cobertura integral',
  empresas_familiares: 'Empresas familiares — continuidad',
  estudios_contables: 'Estudios contables — RC profesional',
  estudios_juridicos: 'Estudios jurídicos — RC profesional',
  clinicas: 'Clínicas y centros de salud',
  empresas_tech: 'Empresas tech — RC directores',
  constructoras: 'Constructoras — accidentes de trabajo',
  clubes_asociaciones: 'Clubes y asociaciones — RC e incendio',
  profesionales_independientes: 'Profesionales independientes',
  ejecutivos: 'Ejecutivos — vida y accidentes',
  reclutamiento_asesores: 'Reclutamiento de asesores',
  general: 'Cartera general — renovaciones',
}

export const DEMO_CAMPANAS: Campaign[] = Array.from({ length: 20 }, (_, i) => {
  const type = i < CAMPAIGN_TYPES_DEMO.length ? CAMPAIGN_TYPES_DEMO[i] : rng.pick(CAMPAIGN_TYPES_DEMO)
  const comercial = rng.pick(DEMO_COMERCIALES.filter(c => c.role !== 'direccion'))
  const status: CampaignStatus = i < 4 ? 'activa' : rng.pick(['pausada', 'finalizada', 'finalizada'])
  const targets = rng.int(15, 70)
  const contacted = Math.round(targets * rng.pick([0.4, 0.6, 0.8, 1]))
  const responses = Math.round(contacted * rng.pick([0.2, 0.35, 0.5]))
  const meetings = Math.round(responses * rng.pick([0.3, 0.5]))
  const converted = Math.round(meetings * rng.pick([0.2, 0.4]))
  const antiguedadDias = i < 4 ? rng.int(20, 90) : rng.int(120, 1400)
  return {
    id: `camp-${i + 1}`,
    name: `${CAMPAIGN_NAMES[type]}${i >= CAMPAIGN_TYPES_DEMO.length ? ` (${rng.pick(DEPARTAMENTOS)})` : ''}`.trim(),
    type,
    status,
    objective: `Generar ${Math.max(5, Math.round(targets * 0.2))} reuniones comerciales calificadas en el segmento`,
    target_segment: SECTOR_DEFS.find(d => d.campaignType === type)?.industryLabel ?? 'Pymes en general',
    icp_description: 'Empresas con necesidad de renovar o ampliar cobertura de seguros en los próximos meses.',
    initial_message: 'Hola, te contacto de PLIFE Corredores de Seguros para revisar la cobertura vigente de tu empresa.',
    call_script: null,
    expected_objections: ['Ya tengo corredor', 'Es caro', 'Lo voy a pensar'],
    follow_up_sequence: null,
    start_date: rng.dateOffset(NOW, -antiguedadDias),
    end_date: status === 'finalizada' ? rng.dateOffset(NOW, -rng.int(1, Math.max(2, antiguedadDias - 30))) : status === 'activa' ? rng.dateOffset(NOW, rng.int(15, 60)) : rng.dateOffset(NOW, -rng.int(1, 10)),
    total_targets: targets,
    total_contacted: contacted,
    total_responses: responses,
    total_meetings: meetings,
    total_converted: converted,
    responsible_id: comercial.id,
    deleted_at: null,
    created_at: rng.isoOffset(NOW, -antiguedadDias),
    updated_at: rng.isoOffset(NOW, -rng.int(0, Math.min(antiguedadDias, 15))),
    created_by: comercial.id,
  }
})

// ---------------------------------------------------------------------------
// Propuestas — 18 vigentes (DEMO_PROPUESTAS, semántica legacy) + histórico
// aparte (75: 55 aprobadas → status 'used', 20 rechazadas → status 'archived').
// ---------------------------------------------------------------------------
const PROPOSAL_SOURCES = ['lead', 'campaign', 'manual', 'radar'] as const

function buildProposal(id: string, status: 'draft' | 'in_review' | 'ready' | 'used' | 'archived', empresa: Company | null, leadId: string | null): Proposal {
  const sector = empresa ? EMPRESA_META.get(empresa.id)!.sector : rng.pick(SECTOR_DEFS).key
  const branch = ramoParaSector(sector)
  const comercial = empresa
    ? (DEMO_COMERCIALES.find(c => c.id === empresa.assigned_to) ?? rng.pick(DEMO_COMERCIALES))
    : rng.pick(DEMO_COMERCIALES.filter(c => c.role === 'asesor'))
  const source = leadId ? 'lead' : rng.pick(PROPOSAL_SOURCES)
  const title = `${rng.pick(PRODUCTOS_POR_RAMO[branch] ?? [branch])} — ${empresa?.name ?? 'Prospecto sin convertir'}`
  const isHistorico = status === 'used' || status === 'archived'
  const targetDescription = empresa?.industry ?? 'Prospecto en evaluación'
  const nombreDestino = empresa?.name ?? 'el prospecto'

  return {
    id,
    created_at: isHistorico ? rng.isoOffset(NOW, -rng.int(60, 900)) : rng.isoOffset(NOW, -rng.int(1, 90)),
    updated_at: isHistorico ? rng.isoOffset(NOW, -rng.int(20, 400)) : rng.isoOffset(NOW, -rng.int(0, 10)),
    deleted_at: null,
    created_by: comercial.id,
    assigned_to: comercial.id,
    title,
    status,
    source,
    source_id: null,
    source_title: source === 'campaign' ? rng.pick(DEMO_CAMPANAS).name : null,
    source_context: null,
    lead_id: leadId,
    campaign_id: null,
    radar_context: null,
    target_type: 'company',
    target_description: targetDescription,
    context: `Se detectó necesidad de ${branch.toLowerCase()} en una conversación comercial con ${nombreDestino}.`,
    objective: 'Ordenar la propuesta comercial y preparar el envío formal al cliente',
    known_problem: `${nombreDestino} no tiene actualizada su cobertura de ${branch.toLowerCase()}`,
    desired_outcome: 'Cerrar una póliza que cubra el riesgo detectado con condiciones competitivas',
    notes: null,
    draft: {
      summary: `Propuesta de ${branch} para ${nombreDestino}`,
      target_audience: targetDescription,
      problem: `Cobertura de ${branch.toLowerCase()} desactualizada o inexistente`,
      opportunity: `Ofrecer ${title} con acompañamiento de PLIFE`,
      proposed_offer: `Cotización de ${title} con ${rng.pick(ASEGURADORAS_DEMO)}`,
    },
    summary: `Propuesta de ${branch} para ${nombreDestino}`,
    target_audience: targetDescription,
    problem: `Cobertura de ${branch.toLowerCase()} desactualizada o inexistente`,
    opportunity: `Ofrecer ${title} con acompañamiento de PLIFE`,
    proposed_offer: `Cotización de ${title} con ${rng.pick(ASEGURADORAS_DEMO)}`,
    score_snapshot: null,
    qualification_snapshot: null,
    metadata: {},
  }
}

const empresaHistoriaA = DEMO_EMPRESAS.find(e => e.name === NOMBRE_HISTORIA_A)!

export const DEMO_PROPUESTAS: Proposal[] = [
  buildProposal('prop-historia-b', 'in_review', null, HISTORIA_B_LEAD.id),
  buildProposal('prop-historia-a', 'in_review', empresaHistoriaA, null),
  ...Array.from({ length: 16 }, (_, i) => buildProposal(`prop-${i + 1}`, rng.pick(['draft', 'in_review', 'ready']), empresaEnCrecimiento(), null)),
]

const PROPUESTAS_APROBADAS: Proposal[] = Array.from({ length: 55 }, (_, i) =>
  buildProposal(`prop-hist-used-${i + 1}`, 'used', empresaEnCrecimiento(), null))
const PROPUESTAS_RECHAZADAS: Proposal[] = Array.from({ length: 20 }, (_, i) =>
  buildProposal(`prop-hist-archived-${i + 1}`, 'archived', empresaEnCrecimiento(), null))
export const DEMO_PROPUESTAS_HISTORICAS: Proposal[] = [...PROPUESTAS_APROBADAS, ...PROPUESTAS_RECHAZADAS]

// Vincular empresas (y sus oportunidades) a una campaña del mismo sector, para
// que los contadores de "empresas/oportunidades por campaña" no queden en 0.
const CAMPAIGNTYPE_BY_SECTOR = new Map(SECTOR_DEFS.map(d => [d.key, d.campaignType]))
for (const camp of DEMO_CAMPANAS) {
  const candidatas = DEMO_EMPRESAS.filter(e => CAMPAIGNTYPE_BY_SECTOR.get(EMPRESA_META.get(e.id)!.sector) === camp.type && !e.campaign_id)
  let linked = 0
  for (const emp of candidatas) {
    if (linked >= 5) break
    emp.campaign_id = camp.id
    linked++
  }
}
for (const opp of DEMO_OPORTUNIDADES) {
  const empresa = opp.company_id ? DEMO_EMPRESAS.find(e => e.id === opp.company_id) : null
  if (empresa?.campaign_id) opp.campaign_id = empresa.campaign_id
}

// ---------------------------------------------------------------------------
// Actividades de hoy (dashboard del asesor) y actividad reciente del equipo.
// ---------------------------------------------------------------------------
const ACTIVITY_TYPES: ActivityType[] = ['llamada', 'reunion', 'whatsapp', 'email', 'tarea']

export function actividadesDeHoyPara(comercialId: string): Activity[] {
  const contactosDelComercial = DEMO_CONTACTOS.filter(c => c.assigned_to === comercialId)
  const count = Math.min(6, Math.max(3, contactosDelComercial.length > 0 ? rng.int(3, 6) : 0))
  return Array.from({ length: count }, (_, i) => {
    const contacto = contactosDelComercial.length > 0 ? rng.pick(contactosDelComercial) : rng.pick(DEMO_CONTACTOS)
    const type = rng.pick(ACTIVITY_TYPES)
    return {
      id: `act-${comercialId}-${i + 1}`,
      type,
      title: `${type === 'llamada' ? 'Llamar a' : type === 'reunion' ? 'Reunión con' : 'Seguimiento a'} ${contacto.first_name} ${contacto.last_name} — ${contacto.company?.name ?? ''}`.trim(),
      description: null,
      outcome: null,
      duration_minutes: null,
      scheduled_at: rng.isoOffset(NOW, 0),
      completed_at: null,
      is_completed: false,
      contact_id: contacto.id,
      company_id: contacto.company_id,
      opportunity_id: null,
      created_at: rng.isoOffset(NOW, -1),
      updated_at: rng.isoOffset(NOW, -1),
      created_by: comercialId,
    }
  })
}

export const DEMO_ACTIVIDADES_RECIENTES = Array.from({ length: 10 }, (_, i) => {
  const contacto = rng.pick(DEMO_CONTACTOS)
  const comercial = DEMO_COMERCIALES.find(c => c.id === contacto.assigned_to) ?? rng.pick(DEMO_COMERCIALES)
  const type = rng.pick(ACTIVITY_TYPES)
  const titles: Record<string, string> = {
    llamada: `Llamada con ${contacto.first_name} ${contacto.last_name} (${contacto.company?.name ?? ''})`,
    reunion: `Reunión con ${contacto.first_name} ${contacto.last_name} (${contacto.company?.name ?? ''})`,
    whatsapp: `Seguimiento por WhatsApp a ${contacto.company?.name ?? ''}`,
    email: `Envío de información a ${contacto.company?.name ?? ''}`,
    tarea: `Tarea completada para ${contacto.company?.name ?? ''}`,
  }
  return {
    id: `act-recent-${i + 1}`,
    type,
    title: titles[type] ?? `Actividad con ${contacto.company?.name ?? ''}`,
    created_at: rng.isoOffset(NOW, -rng.int(0, 6)),
    created_by_profile: { full_name: comercial.full_name },
  }
})

// ---------------------------------------------------------------------------
// Catálogo demo de Aseguradoras / Ramos (Admin) y Equipo comercial.
// ---------------------------------------------------------------------------
export const DEMO_ASEGURADORAS: Insurer[] = ASEGURADORAS_DEMO.map((name, i) => ({
  id: `ins-${i + 1}`,
  name,
  normalized_name: normalize(name),
  is_active: true,
  created_at: rng.isoOffset(NOW, -1800),
  updated_at: rng.isoOffset(NOW, -30),
  created_by: null,
  updated_by: null,
}))

export const DEMO_RAMOS: InsuranceBranch[] = RAMOS_DEMO.map((name, i) => ({
  id: `ram-${i + 1}`,
  name,
  normalized_name: normalize(name),
  is_active: true,
  created_at: rng.isoOffset(NOW, -1800),
  updated_at: rng.isoOffset(NOW, -30),
  created_by: null,
  updated_by: null,
}))

/** Un único equipo comercial (antes había 2 con 2 líderes; ahora hay 1 solo Líder Comercial). */
export const DEMO_EQUIPOS: (Team & { leader?: { full_name: string } | null })[] = [
  {
    id: 'team-1',
    name: 'Equipo Comercial PLIFE',
    description: 'Equipo comercial completo, bajo la dirección de Ana Deleón y liderazgo operativo de Sofía Machado.',
    leader_id: 'com-02',
    is_active: true,
    created_at: rng.isoOffset(NOW, -1800),
    updated_at: rng.isoOffset(NOW, -30),
    created_by: 'com-01',
    leader: { full_name: 'Sofía Machado' },
  },
]

// ---------------------------------------------------------------------------
// Getters de conveniencia (para minimizar el cambio en cada page.tsx) — se
// mantienen con el mismo nombre y forma que antes de ampliar el universo.
// ---------------------------------------------------------------------------
/** Ventana de renovación real (~60 días): evita listar toda la cartera vigente. */
export function getUpcomingRenewalsDemo() {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return DEMO_POLIZAS
    .filter(p => ['vigente', 'proxima_a_vencer', 'en_renovacion'].includes(p.status) && p.endDate)
    .map(p => {
      const target = new Date(p.endDate + 'T00:00:00')
      const daysToExpiry = Math.round((target.getTime() - today.getTime()) / 86_400_000)
      return { ...p, daysToExpiry }
    })
    .filter(p => p.daysToExpiry <= 60)
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry)
}

export function getPendingDocumentationDemo() {
  return DEMO_POLIZAS.filter(p => p.documents.length === 0 || p.status === 'pendiente_documentacion')
}

/** Cartera con vigencia activa (base de prima administrada y comisión estimada). */
const CARTERA_ACTIVA_STATUSES = ['vigente', 'proxima_a_vencer', 'en_renovacion']

function primaAdministradaDe(polizas: Policy[]): number {
  return polizas
    .filter(p => CARTERA_ACTIVA_STATUSES.includes(p.status))
    .reduce((s, p) => s + (p.premium ?? 0), 0)
}

function comisionEstimadaDe(polizas: Policy[]): number {
  return polizas
    .filter(p => CARTERA_ACTIVA_STATUSES.includes(p.status) && p.premium != null && p.commissionValue != null)
    .reduce((s, p) => s + (p.premium! * (p.commissionValue! / 100)), 0)
}

export function getDireccionMetricsDemo() {
  const stageCounts: Record<string, number> = {}
  for (const opp of DEMO_OPORTUNIDADES) stageCounts[opp.stage] = (stageCounts[opp.stage] ?? 0) + 1

  const porAseguradora: Record<string, number> = {}
  for (const pol of DEMO_POLIZAS) porAseguradora[pol.insurerName] = (porAseguradora[pol.insurerName] ?? 0) + 1

  const todayStr = NOW.toISOString().slice(0, 10)

  const carteraPorEjecutivo = DEMO_COMERCIALES.map(c => {
    const polizasComercial = DEMO_POLIZAS.filter(p => p.assignedToName === c.full_name)
    const oportunidadesComercial = DEMO_OPORTUNIDADES.filter(o => o.assigned_to === c.id)
    const oportunidadesAbiertas = oportunidadesComercial.filter(o => !['cerrada_ganada', 'cerrada_perdida'].includes(o.stage))
    return {
      comercial: c.full_name,
      empresas: DEMO_EMPRESAS.filter(e => e.assigned_to === c.id).length,
      polizas: polizasComercial.length,
      primaTotal: primaAdministradaDe(polizasComercial),
      oportunidadesAbiertas: oportunidadesAbiertas.length,
      seguimientosVencidos: oportunidadesAbiertas.filter(o => o.next_action_date && o.next_action_date < todayStr).length,
    }
  }).sort((a, b) => b.primaTotal - a.primaTotal)

  const facturacionPorEmpresa = DEMO_EMPRESAS.map(e => {
    const polizasEmpresa = DEMO_POLIZAS.filter(p => p.companyName === e.name)
    return {
      empresa: e.name,
      primaTotal: primaAdministradaDe(polizasEmpresa),
      polizas: polizasEmpresa.length,
    }
  }).filter(e => e.polizas > 0).sort((a, b) => b.primaTotal - a.primaTotal).slice(0, 8)

  const propuestasAbiertas = DEMO_PROPUESTAS.filter(p => p.status === 'draft' || p.status === 'in_review')

  const porRamo: Record<string, number> = {}
  for (const pol of DEMO_POLIZAS) porRamo[pol.branchName] = (porRamo[pol.branchName] ?? 0) + 1

  const todasLasPropuestas = [...DEMO_PROPUESTAS, ...DEMO_PROPUESTAS_HISTORICAS]
  const propuestasPorEstado: Record<string, number> = {}
  for (const p of todasLasPropuestas) propuestasPorEstado[p.status] = (propuestasPorEstado[p.status] ?? 0) + 1

  const renewals = getUpcomingRenewalsDemo()
  const renovacionesPorUrgencia = {
    critica: renewals.filter(r => r.daysToExpiry <= 7).length,
    proximoMes: renewals.filter(r => r.daysToExpiry > 7 && r.daysToExpiry <= 30).length,
    seguimiento60: renewals.filter(r => r.daysToExpiry > 30 && r.daysToExpiry <= 60).length,
  }

  return {
    totalOpps: DEMO_OPORTUNIDADES.length,
    totalContacts: DEMO_CONTACTOS.length,
    totalCompanies: DEMO_EMPRESAS.length,
    totalPolicies: DEMO_POLIZAS.length,
    vigentPolicies: DEMO_POLIZAS.filter(p => p.status === 'vigente').length,
    activeCampaigns: DEMO_CAMPANAS.filter(c => c.status === 'activa').length,
    openProposals: propuestasAbiertas.length,
    stageCounts,
    porAseguradora,
    porRamo,
    carteraPorEjecutivo,
    facturacionPorEmpresa,
    renovacionesDelMes: getUpcomingRenewalsDemo().filter(p => p.daysToExpiry <= 30 && p.daysToExpiry >= -5).length,
    renovacionesProximas: getUpcomingRenewalsDemo().length,
    renovacionesPorUrgencia,
    polizasPorVencer: DEMO_POLIZAS.filter(p => p.status === 'proxima_a_vencer').length,
    documentacionPendiente: getPendingDocumentationDemo().length,
    primaAnualAdministrada: primaAdministradaDe(DEMO_POLIZAS),
    comisionEstimadaTotal: comisionEstimadaDe(DEMO_POLIZAS),
    // Cartera y actividad comercial adicional (Dirección) — todo derivado de
    // las mismas listas base, nunca un número aparte.
    totalLeadsActivos: DEMO_LEADS.filter(l => l.status === 'open').length,
    oportunidadesGanadas: DEMO_OPORTUNIDADES_HISTORICAS.filter(o => o.stage === 'cerrada_ganada').length,
    oportunidadesPerdidas: DEMO_OPORTUNIDADES_HISTORICAS.filter(o => o.stage === 'cerrada_perdida').length,
    propuestasVigentes: DEMO_PROPUESTAS.length,
    propuestasAprobadas: DEMO_PROPUESTAS_HISTORICAS.filter(p => p.status === 'used').length,
    propuestasRechazadas: DEMO_PROPUESTAS_HISTORICAS.filter(p => p.status === 'archived').length,
    propuestasPorEstado,
  }
}

export type AlertSeverity = 'alta' | 'media' | 'baja'
export interface ExecutiveAlertDemo {
  id: string
  severity: AlertSeverity
  title: string
  detail: string
  href: string
}

/**
 * Alertas ejecutivas derivadas de condiciones reales del universo — nunca
 * texto hardcodeado. Se evalúan 7 categorías como mínimo (renovaciones,
 * documentación, concentración por aseguradora, carga del equipo,
 * propuestas sin seguimiento, clientes estratégicos en riesgo, pólizas sin
 * responsable); solo se devuelven las que representan una condición real
 * (severidad alta o media), para no llenar la pantalla con tarjetas "todo
 * bien". Sin IA, sin scoring nuevo, sin predicciones — son condiciones y
 * umbrales fijos sobre datos ya existentes.
 */
export function getExecutiveAlertsDemo(): ExecutiveAlertDemo[] {
  const renewals = getUpcomingRenewalsDemo()
  const renovacionesCriticas = renewals.filter(p => p.daysToExpiry <= 7)
  const pendingDocs = getPendingDocumentationDemo()
  const openOpps = DEMO_OPORTUNIDADES.filter(o => !['cerrada_ganada', 'cerrada_perdida'].includes(o.stage))
  const todayStr = NOW.toISOString().slice(0, 10)
  const seguimientosVencidos = openOpps.filter(o => o.next_action_date && o.next_action_date < todayStr)

  // Concentración por aseguradora: participación de la principal sobre el total de pólizas.
  const porAseguradora: Record<string, number> = {}
  for (const pol of DEMO_POLIZAS) porAseguradora[pol.insurerName] = (porAseguradora[pol.insurerName] ?? 0) + 1
  const topAseguradora = Object.entries(porAseguradora).sort((a, b) => b[1] - a[1])[0]
  const shareTopAseguradora = topAseguradora ? topAseguradora[1] / DEMO_POLIZAS.length : 0

  // Carga desbalanceada: comparar la cartera de empresas entre asesor/líder (se excluye
  // al Director, cuya cartera chica y estratégica es intencional, no un desbalance).
  const cargaEquipo = DEMO_COMERCIALES
    .filter(c => c.role !== 'direccion')
    .map(c => ({ comercial: c.full_name, empresas: DEMO_EMPRESAS.filter(e => e.assigned_to === c.id).length }))
  const maxCarga = Math.max(...cargaEquipo.map(c => c.empresas))
  const minCarga = Math.min(...cargaEquipo.map(c => c.empresas))
  const comercialSobrecargado = cargaEquipo.find(c => c.empresas === maxCarga)
  const ratioCarga = minCarga > 0 ? maxCarga / minCarga : maxCarga

  // Propuestas sin seguimiento (vigentes, sin cambios hace 3+ días) — distinto de "seguimiento vencido" de oportunidades.
  const propuestasSinSeguimiento = DEMO_PROPUESTAS
    .filter(p => p.status === 'draft' || p.status === 'in_review')
    .filter(p => diasDesde(p.updated_at) >= 3)

  // Clientes estratégicos (score alto o cartera grande) con una señal de riesgo real: renovación crítica o documentación pendiente.
  const empresasConRiesgo = DEMO_EMPRESAS.filter(e => {
    const esEstrategica = (e.b2b_score ?? 0) >= 80
    if (!esEstrategica) return false
    const polizasEmpresa = DEMO_POLIZAS.filter(p => p.companyName === e.name)
    return polizasEmpresa.some(p => p.status === 'pendiente_documentacion') ||
      renewals.some(r => r.companyName === e.name && r.daysToExpiry <= 7)
  })

  // Pólizas sin responsable — no debería existir en un universo bien formado; se valida en vivo, no se asume.
  const polizasSinResponsable = DEMO_POLIZAS.filter(p => !p.assignedToName || p.assignedToName.trim() === '')

  const candidatas: ExecutiveAlertDemo[] = [
    {
      id: 'alerta-renovaciones',
      severity: renovacionesCriticas.length > 5 ? 'alta' : renovacionesCriticas.length > 0 ? 'alta' : 'baja',
      title: `${renovacionesCriticas.length} renovacion${renovacionesCriticas.length === 1 ? '' : 'es'} vence${renovacionesCriticas.length === 1 ? '' : 'n'} en los próximos 7 días`,
      detail: 'Ingreso recurrente en riesgo si no se gestiona la renovación a tiempo.',
      href: '/app/polizas/renovaciones',
    },
    {
      id: 'alerta-documentacion',
      severity: pendingDocs.length > 10 ? 'alta' : pendingDocs.length > 0 ? 'media' : 'baja',
      title: `${pendingDocs.length} póliza${pendingDocs.length === 1 ? '' : 's'} bloqueada${pendingDocs.length === 1 ? '' : 's'} por documentación pendiente`,
      detail: 'No pueden emitirse ni renovarse hasta recibir la documentación del cliente.',
      href: '/app/polizas/documentacion',
    },
    {
      id: 'alerta-seguimiento',
      severity: seguimientosVencidos.length > 5 ? 'alta' : seguimientosVencidos.length > 0 ? 'media' : 'baja',
      title: `${seguimientosVencidos.length} oportunidad${seguimientosVencidos.length === 1 ? '' : 'es'} con seguimiento vencido`,
      detail: 'El equipo tiene próximos pasos sin cumplir en oportunidades abiertas.',
      href: '/app/oportunidades',
    },
    {
      id: 'alerta-concentracion-aseguradora',
      severity: shareTopAseguradora > 0.35 ? 'alta' : shareTopAseguradora > 0.25 ? 'media' : 'baja',
      title: topAseguradora ? `${Math.round(shareTopAseguradora * 100)}% de la cartera está concentrada en ${topAseguradora[0]}` : 'Sin datos de aseguradoras',
      detail: 'Alta dependencia de una sola aseguradora: un cambio de condiciones afecta buena parte de la cartera.',
      href: '/app/polizas',
    },
    {
      id: 'alerta-carga-equipo',
      severity: ratioCarga >= 1.6 ? 'alta' : ratioCarga >= 1.3 ? 'media' : 'baja',
      title: comercialSobrecargado ? `${comercialSobrecargado.comercial} tiene la cartera más cargada del equipo (${comercialSobrecargado.empresas} empresas)` : 'Carga del equipo pareja',
      detail: 'La distribución de cuentas entre comerciales no es pareja; puede afectar el seguimiento.',
      href: '/app/direccion',
    },
    {
      id: 'alerta-propuestas',
      severity: propuestasSinSeguimiento.length > 5 ? 'alta' : propuestasSinSeguimiento.length > 0 ? 'media' : 'baja',
      title: `${propuestasSinSeguimiento.length} propuesta${propuestasSinSeguimiento.length === 1 ? '' : 's'} vigente${propuestasSinSeguimiento.length === 1 ? '' : 's'} sin seguimiento reciente`,
      detail: 'Propuestas ya iniciadas sin actividad en los últimos días — riesgo de perder el negocio por inacción.',
      href: '/app/propuestas',
    },
    {
      id: 'alerta-clientes-estrategicos',
      severity: empresasConRiesgo.length > 3 ? 'alta' : empresasConRiesgo.length > 0 ? 'media' : 'baja',
      title: `${empresasConRiesgo.length} cliente${empresasConRiesgo.length === 1 ? '' : 's'} estratégico${empresasConRiesgo.length === 1 ? '' : 's'} con riesgo abierto`,
      detail: 'Cuentas de alto potencial con una renovación crítica o documentación pendiente sin resolver.',
      href: '/app/polizas',
    },
    ...(polizasSinResponsable.length > 0 ? [{
      id: 'alerta-sin-responsable',
      severity: 'alta' as AlertSeverity,
      title: `${polizasSinResponsable.length} póliza${polizasSinResponsable.length === 1 ? '' : 's'} sin comercial responsable`,
      detail: 'Ninguna cuenta debería quedar sin un responsable asignado.',
      href: '/app/polizas',
    }] : []),
  ]

  const orden: Record<AlertSeverity, number> = { alta: 0, media: 1, baja: 2 }
  return candidatas
    .filter(a => a.severity !== 'baja')
    .sort((a, b) => orden[a.severity] - orden[b.severity])
    .slice(0, 6)
}

export interface AttentionItem {
  id: string
  kind: 'renovacion' | 'documentacion' | 'propuesta' | 'cliente'
  title: string
  clientName: string
  responsible: string
  dueLabel: string
  actionLabel: string
  href: string
  urgent: boolean
}

function diasDesde(iso: string): number {
  return Math.max(0, Math.round((NOW.getTime() - new Date(iso).getTime()) / 86_400_000))
}

/**
 * Ítems que responden "¿qué necesita atención hoy?": renovaciones urgentes,
 * documentación que bloquea una póliza, propuestas sin seguimiento y clientes
 * prioritarios. Si se pasa comercialId, se filtra solo lo asignado a esa
 * persona (vista de asesor); sin filtro, es la vista de todo el equipo.
 */
export function getAttentionItemsDemo(comercialId?: string): AttentionItem[] {
  const comercial = comercialId ? DEMO_COMERCIALES.find(c => c.id === comercialId) : undefined
  const items: AttentionItem[] = []

  const renewals = getUpcomingRenewalsDemo()
    .filter(p => p.daysToExpiry <= 15)
    .filter(p => !comercial || p.assignedToName === comercial.full_name)
  for (const p of renewals) {
    items.push({
      id: `att-ren-${p.id}`,
      kind: 'renovacion',
      title: `Renovación de ${p.branchName.toLowerCase()} próxima a vencer`,
      clientName: p.companyName,
      responsible: p.assignedToName,
      dueLabel: p.daysToExpiry < 0
        ? `Vencida hace ${-p.daysToExpiry} día${p.daysToExpiry === -1 ? '' : 's'}`
        : p.daysToExpiry === 0 ? 'Vence hoy' : `Vence en ${p.daysToExpiry} día${p.daysToExpiry === 1 ? '' : 's'}`,
      actionLabel: p.nextAction ?? 'Iniciar renovación',
      href: '/app/polizas/renovaciones',
      urgent: p.daysToExpiry <= 5,
    })
  }

  const pendingDocs = getPendingDocumentationDemo()
    .filter(p => !comercial || p.assignedToName === comercial.full_name)
  for (const p of pendingDocs) {
    const antiguedad = diasDesde(p.createdAt)
    items.push({
      id: `att-doc-${p.id}`,
      kind: 'documentacion',
      title: 'Documentación pendiente bloquea la póliza',
      clientName: p.companyName,
      responsible: p.assignedToName,
      dueLabel: antiguedad === 0 ? 'Abierta hoy' : `Pendiente hace ${antiguedad} día${antiguedad === 1 ? '' : 's'}`,
      actionLabel: p.nextAction ?? 'Solicitar documentación al cliente',
      href: '/app/polizas/documentacion',
      urgent: antiguedad > 5,
    })
  }

  const propuestasSinSeguimiento = DEMO_PROPUESTAS
    .filter(p => p.status === 'draft' || p.status === 'in_review')
    .filter(p => !comercial || p.assigned_to === comercial.id)
    .filter(p => diasDesde(p.updated_at) >= 3)
  for (const p of propuestasSinSeguimiento) {
    const responsable = DEMO_COMERCIALES.find(c => c.id === p.assigned_to)?.full_name ?? '—'
    const antiguedad = diasDesde(p.updated_at)
    items.push({
      id: `att-prop-${p.id}`,
      kind: 'propuesta',
      title: 'Propuesta sin seguimiento',
      clientName: p.title.split(' — ').pop() ?? p.title,
      responsible: responsable,
      dueLabel: `Sin cambios hace ${antiguedad} días`,
      actionLabel: 'Retomar contacto y avanzar la propuesta',
      href: `/app/propuestas/${p.id}`,
      urgent: antiguedad >= 7,
    })
  }

  const clientesPrioritarios = DEMO_EMPRESAS
    .filter(e => (e.b2b_score ?? 0) >= 80 && ['contactada', 'en_negociacion'].includes(e.b2b_status))
    .filter(e => !comercial || e.assigned_to === comercial.id)
    .sort((a, b) => (b.b2b_score ?? 0) - (a.b2b_score ?? 0))
    .slice(0, comercial ? 3 : 6)
  for (const e of clientesPrioritarios) {
    const responsable = DEMO_COMERCIALES.find(c => c.id === e.assigned_to)?.full_name ?? '—'
    items.push({
      id: `att-cli-${e.id}`,
      kind: 'cliente',
      title: `Cliente prioritario (score B2B ${e.b2b_score}) en negociación activa`,
      clientName: e.name,
      responsible: responsable,
      dueLabel: `Última actividad ${formatRelativeDateDemo(e.updated_at)}`,
      actionLabel: 'Mantener seguimiento cercano esta semana',
      href: `/app/empresas/${e.id}`,
      urgent: false,
    })
  }

  return items.sort((a, b) => {
    if (a.urgent !== b.urgent) return a.urgent ? -1 : 1
    return 0
  })
}

function formatRelativeDateDemo(iso: string): string {
  const dias = diasDesde(iso)
  if (dias === 0) return 'hoy'
  if (dias === 1) return 'ayer'
  if (dias < 7) return `hace ${dias} días`
  return `hace ${Math.floor(dias / 7)} semanas`
}

// ---------------------------------------------------------------------------
// Helpers nuevos pedidos para auditar el universo — alias de lectura sobre
// las mismas listas/funciones de arriba. No agregan datos ni cálculos
// paralelos: todo se deriva de los arrays ya generados.
// ---------------------------------------------------------------------------
export function getDemoCompanies() { return DEMO_EMPRESAS }
export function getDemoContacts() { return DEMO_CONTACTOS }
export function getDemoPolicies() { return DEMO_POLIZAS }
export function getDemoLeads() { return DEMO_LEADS }
export function getDemoOpportunities() {
  return { abiertas: DEMO_OPORTUNIDADES, historicas: DEMO_OPORTUNIDADES_HISTORICAS, todas: [...DEMO_OPORTUNIDADES, ...DEMO_OPORTUNIDADES_HISTORICAS] }
}
export function getDemoProposals() {
  return { vigentes: DEMO_PROPUESTAS, historicas: DEMO_PROPUESTAS_HISTORICAS, todas: [...DEMO_PROPUESTAS, ...DEMO_PROPUESTAS_HISTORICAS] }
}
export function getDemoRenewals() { return getUpcomingRenewalsDemo() }
export function getDemoPendingDocuments() { return getPendingDocumentationDemo() }
export function getDemoCampaigns() { return DEMO_CAMPANAS }
export function getDemoCommercialTeam() { return DEMO_COMERCIALES }
export function getDemoExecutiveMetrics() { return getDireccionMetricsDemo() }

// ---------------------------------------------------------------------------
// Historias transversales — identificables por id/helper, no por texto.
// ---------------------------------------------------------------------------
export const HISTORIA_A_EMPRESA_ID = DEMO_EMPRESAS.find(e => e.name === NOMBRE_HISTORIA_A)!.id
export const HISTORIA_B_LEAD_ID = HISTORIA_B_LEAD.id
export const HISTORIA_C_EMPRESA_ID = DEMO_EMPRESAS.find(e => e.name === 'Estudio Techera Auditores')!.id

export function getDemoHistoriasTransversales() {
  const empresaA = DEMO_EMPRESAS.find(e => e.id === HISTORIA_A_EMPRESA_ID)!
  const empresaC = DEMO_EMPRESAS.find(e => e.id === HISTORIA_C_EMPRESA_ID)!
  return {
    historiaA: {
      descripcion: 'Cliente estratégico con varias pólizas, renovación próxima y propuesta abierta.',
      empresa: empresaA,
      polizas: DEMO_POLIZAS.filter(p => p.companyName === empresaA.name),
      contactos: DEMO_CONTACTOS.filter(c => c.company_id === empresaA.id),
      propuesta: DEMO_PROPUESTAS.find(p => p.id === 'prop-historia-a') ?? null,
    },
    historiaB: {
      descripcion: 'Lead reciente que evolucionó a oportunidad y propuesta, todavía sin convertirse en cliente.',
      lead: DEMO_LEADS.find(l => l.id === HISTORIA_B_LEAD_ID)!,
      oportunidad: DEMO_OPORTUNIDADES.find(o => o.lead_id === HISTORIA_B_LEAD_ID) ?? null,
      propuesta: DEMO_PROPUESTAS.find(p => p.lead_id === HISTORIA_B_LEAD_ID) ?? null,
    },
    historiaC: {
      descripcion: 'Cliente con documentación pendiente que genera riesgo operativo y requiere atención administrativa.',
      empresa: empresaC,
      polizasPendientes: DEMO_POLIZAS.filter(p => p.companyName === empresaC.name && p.status === 'pendiente_documentacion'),
    },
  }
}
