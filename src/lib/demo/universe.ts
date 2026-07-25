/**
 * Universo mock de la demo comercial de PLIFE Growth OS.
 *
 * Generado una única vez por proceso, de forma determinística (misma semilla
 * en cada carga), a partir de pools de nombres/empresas/aseguradoras
 * verosímiles (ver ./pools.ts). Todas las entidades se referencian entre sí
 * por id real generado acá — nada queda huérfano ni desconectado.
 *
 * Activo únicamente cuando isDemoMode() === true (ver src/lib/demo.ts). No
 * escribe nada en Supabase: es una capa de datos 100% en memoria que las
 * páginas consumen en reemplazo de sus queries reales mientras dure la demo.
 */
import { makeRng } from './prng'
import {
  NOMBRES, APELLIDOS, DEPARTAMENTOS, EMPRESA_TEMPLATES, POSICIONES,
  ASEGURADORAS_DEMO, RAMOS_DEMO, COMERCIALES_DEMO, PRODUCTOS_POR_RAMO,
} from './pools'
import type {
  Company, ContactWithRelations, OpportunityWithRelations, Proposal, Campaign,
  Activity, CompanyB2BStatus, ContactStatus, InterestLevel, OpportunityStage,
  OpportunityType, RiskLevel, ActivityType, CampaignStatus, CampaignType,
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

// ---------------------------------------------------------------------------
// Comerciales (referencia embebida — no son cuentas reales de usuario)
// ---------------------------------------------------------------------------
export const DEMO_COMERCIALES = COMERCIALES_DEMO

function comercialFor(index: number) {
  return DEMO_COMERCIALES[index % DEMO_COMERCIALES.length]
}

// ---------------------------------------------------------------------------
// Empresas
// ---------------------------------------------------------------------------
const B2B_STATUSES: CompanyB2BStatus[] = ['priorizada', 'asignada', 'contactada', 'en_negociacion', 'convertida']

export const DEMO_EMPRESAS: Company[] = EMPRESA_TEMPLATES.map((tpl, i) => {
  const comercial = comercialFor(i)
  const createdDaysAgo = rng.int(30, 320)
  return {
    id: `emp-${i + 1}`,
    name: tpl.name,
    industry: tpl.industry,
    website: `https://www.${slugify(tpl.name)}.com.uy`,
    linkedin_url: null,
    instagram_url: null,
    location: rng.pick(DEPARTAMENTOS),
    estimated_size: rng.pick(['1-10', '11-50', '51-200', '201-500']),
    estimated_employees: rng.int(4, 220),
    source: rng.pick(['Referido', 'Radar B2B', 'Campaña comercial', 'Contacto directo']),
    b2b_score: rng.int(45, 96),
    b2b_status: rng.pick(B2B_STATUSES),
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
    updated_at: rng.isoOffset(NOW, -rng.int(0, Math.min(createdDaysAgo, 20))),
    created_by: comercial.id,
    updated_by: comercial.id,
  }
})

// ---------------------------------------------------------------------------
// Contactos (2 a 4 por empresa)
// ---------------------------------------------------------------------------
const CONTACT_STATUSES: ContactStatus[] = ['contactado', 'interesado', 'en_seguimiento', 'reunion_agendada', 'en_analisis']
const INTEREST_LEVELS: InterestLevel[] = ['medio', 'alto', 'muy_alto']

export const DEMO_CONTACTOS: ContactWithRelations[] = DEMO_EMPRESAS.flatMap((empresa, ei) => {
  const count = rng.int(2, 4)
  return Array.from({ length: count }, (_, ci) => {
    const first = rng.pick(NOMBRES)
    const last = rng.pick(APELLIDOS)
    const id = `con-${ei + 1}-${ci + 1}`
    return {
      id,
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
// Pólizas (180) — distribuidas para que el board de 5 columnas se vea real
// ---------------------------------------------------------------------------
const POLICY_STATUS_PLAN: { status: PolicyStatus; count: number }[] = [
  { status: 'vigente', count: 115 },
  { status: 'proxima_a_vencer', count: 20 },
  { status: 'en_renovacion', count: 10 },
  { status: 'pendiente_documentacion', count: 15 },
  { status: 'cancelada', count: 12 },
  { status: 'renovada', count: 3 },
  { status: 'no_renovada', count: 3 },
  { status: 'rechazada', count: 2 },
]

const INSURER_PREFIX: Record<string, string> = {
  BSE: 'BSE', 'Porto Seguro': 'POR', Mapfre: 'MAP', SURA: 'SUR', Zurich: 'ZUR', HDI: 'HDI',
}

function documentsFor(status: PolicyStatus): PolicyDocument[] {
  const base: PolicyDocument[] = []
  if (!['borrador', 'cotizacion', 'pendiente_documentacion', 'rechazada'].includes(status)) {
    base.push({ id: `doc-${rng.int(1, 999999)}-a`, type: 'poliza_emitida', name: 'Póliza emitida.pdf', addedAt: rng.dateOffset(NOW, -rng.int(30, 200)), addedByName: rng.pick(DEMO_COMERCIALES).full_name })
  }
  if (rng.bool(0.55)) {
    base.push({ id: `doc-${rng.int(1, 999999)}-b`, type: 'condiciones_particulares', name: 'Condiciones particulares.pdf', addedAt: rng.dateOffset(NOW, -rng.int(30, 200)), addedByName: rng.pick(DEMO_COMERCIALES).full_name })
  }
  if (status === 'pendiente_documentacion') {
    base.push({ id: `doc-${rng.int(1, 999999)}-c`, type: 'propuesta_cotizacion', name: 'Cotización enviada al cliente.pdf', addedAt: rng.dateOffset(NOW, -rng.int(1, 10)), addedByName: rng.pick(DEMO_COMERCIALES).full_name })
  }
  return base
}

function buildPolicy(index: number, status: PolicyStatus): Policy {
  const empresa = rng.pick(DEMO_EMPRESAS)
  const contactosEmpresa = contactsOf(empresa.id)
  const contacto = contactosEmpresa.length > 0 ? rng.pick(contactosEmpresa) : null
  const insurerName = rng.pick(ASEGURADORAS_DEMO)
  const branchName = rng.pick(RAMOS_DEMO)
  const product = rng.pick(PRODUCTOS_POR_RAMO[branchName] ?? [branchName])
  const comercial = DEMO_COMERCIALES.find(c => c.id === empresa.assigned_to) ?? rng.pick(DEMO_COMERCIALES)
  const policyNumber = `${INSURER_PREFIX[insurerName] ?? 'POL'}-${rng.int(10000, 99999)}`

  let startDate: string | null = null
  let endDate: string | null = null
  let nextAction: string | null = null
  let nextActionDate: string | null = null
  let notes: string | null = null

  switch (status) {
    case 'vigente':
      startDate = rng.dateOffset(NOW, -rng.int(30, 300))
      endDate = rng.dateOffset(NOW, rng.int(70, 300))
      nextAction = rng.pick(['Confirmar datos actualizados con el cliente', 'Sin acción pendiente por ahora', null])
      nextActionDate = nextAction ? rng.dateOffset(NOW, rng.int(15, 90)) : null
      break
    case 'proxima_a_vencer':
      startDate = rng.dateOffset(NOW, -rng.int(300, 340))
      endDate = rng.dateOffset(NOW, rng.int(5, 45))
      nextAction = 'Iniciar renovación'
      nextActionDate = rng.dateOffset(NOW, rng.int(0, 10))
      break
    case 'en_renovacion':
      startDate = rng.dateOffset(NOW, -rng.int(340, 380))
      endDate = rng.dateOffset(NOW, rng.int(-20, 5))
      nextAction = rng.pick(['Esperando condiciones de renovación de la aseguradora', 'Confirmar nueva prima con el cliente'])
      nextActionDate = rng.dateOffset(NOW, rng.int(-3, 7))
      notes = rng.bool(0.4) ? 'La aseguradora solicitó actualizar datos antes de emitir la renovación.' : null
      break
    case 'pendiente_documentacion':
      startDate = null
      endDate = null
      nextAction = rng.pick(['Solicitar RUT y padrón al cliente', 'Falta comprobante de titularidad', 'Esperando cédula del titular'])
      nextActionDate = rng.dateOffset(NOW, rng.int(-2, 8))
      break
    case 'cancelada':
      startDate = rng.dateOffset(NOW, -rng.int(200, 400))
      endDate = rng.dateOffset(NOW, -rng.int(5, 120))
      notes = rng.pick(['Cliente canceló por cierre de actividad.', 'Cliente cambió de aseguradora.', 'Baja solicitada por el cliente.'])
      break
    case 'renovada':
      startDate = rng.dateOffset(NOW, -rng.int(10, 40))
      endDate = rng.dateOffset(NOW, rng.int(320, 360))
      notes = 'Renovada con nueva vigencia.'
      break
    case 'no_renovada':
      startDate = rng.dateOffset(NOW, -rng.int(370, 400))
      endDate = rng.dateOffset(NOW, -rng.int(5, 30))
      nextAction = 'Evaluar recontacto comercial en el próximo semestre'
      nextActionDate = rng.dateOffset(NOW, rng.int(60, 120))
      notes = 'Cliente decidió no renovar; evaluar recontacto más adelante.'
      break
    case 'rechazada':
      nextAction = 'Buscar alternativa con otra aseguradora'
      nextActionDate = rng.dateOffset(NOW, rng.int(0, 10))
      notes = 'La aseguradora no emitió la póliza tras la evaluación de riesgo.'
      break
    default:
      break
  }

  return {
    id: `pol-${index}`,
    policyNumber: ['borrador', 'cotizacion', 'pendiente_documentacion'].includes(status) ? null : policyNumber,
    companyName: empresa.name,
    contactName: contacto ? `${contacto.first_name} ${contacto.last_name}` : null,
    insurerName,
    branchName,
    product,
    status,
    startDate,
    endDate,
    premium: status === 'pendiente_documentacion' ? null : rng.int(15000, 420000),
    currency: 'UYU',
    commissionValue: status === 'pendiente_documentacion' ? null : rng.int(8, 16),
    commissionType: status === 'pendiente_documentacion' ? null : 'percentage',
    assignedToName: comercial.full_name,
    documents: documentsFor(status),
    nextAction,
    nextActionDate,
    notes,
    createdAt: rng.dateOffset(NOW, -rng.int(10, 340)),
    updatedAt: rng.dateOffset(NOW, -rng.int(0, 20)),
  }
}

export const DEMO_POLIZAS: Policy[] = POLICY_STATUS_PLAN.flatMap(({ status, count }, groupIdx) =>
  Array.from({ length: count }, (_, i) => buildPolicy(groupIdx * 1000 + i, status))
)

// ---------------------------------------------------------------------------
// Oportunidades (35)
// ---------------------------------------------------------------------------
const PIPELINE_STAGES_DEMO: OpportunityStage[] = [
  'nueva', 'calificada', 'contactada', 'reunion_agendada',
  'diagnostico_realizado', 'propuesta_conceptual', 'validacion_plife', 'seguimiento',
]
const RISK_LEVELS: RiskLevel[] = ['bajo', 'medio', 'alto']

export const DEMO_OPORTUNIDADES: OpportunityWithRelations[] = Array.from({ length: 35 }, (_, i) => {
  const empresa = rng.pick(DEMO_EMPRESAS)
  const contactosEmpresa = contactsOf(empresa.id)
  const contacto = contactosEmpresa.length > 0 ? rng.pick(contactosEmpresa) : null
  const comercial = DEMO_COMERCIALES.find(c => c.id === empresa.assigned_to) ?? rng.pick(DEMO_COMERCIALES)
  const closed = rng.bool(0.15)
  const stage: OpportunityStage = closed ? rng.pick(['cerrada_ganada', 'cerrada_ganada', 'cerrada_perdida']) : rng.pick(PIPELINE_STAGES_DEMO)
  const branch = rng.pick(RAMOS_DEMO)
  const type: OpportunityType = 'b2b'

  return {
    id: `opp-${i + 1}`,
    title: `${rng.pick(PRODUCTOS_POR_RAMO[branch] ?? [branch])} — ${empresa.name}`,
    type,
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
    company_id: empresa.id,
    assigned_to: comercial.id,
    campaign_id: null,
    lead_id: null,
    last_activity_at: rng.isoOffset(NOW, -rng.int(0, 20)),
    deleted_at: null,
    created_at: rng.isoOffset(NOW, -rng.int(10, 200)),
    updated_at: rng.isoOffset(NOW, -rng.int(0, 15)),
    created_by: comercial.id,
    updated_by: comercial.id,
    contact: contacto ?? null,
    company: empresa,
    assigned_profile: { id: comercial.id, email: `${slugify(comercial.full_name)}@plife.com.uy`, full_name: comercial.full_name, avatar_url: null, role: comercial.role, phone: null, is_active: true, onboarding_completed: true, created_at: rng.isoOffset(NOW, -400), updated_at: rng.isoOffset(NOW, -10) },
  }
})

// ---------------------------------------------------------------------------
// Campañas (15)
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

export const DEMO_CAMPANAS: Campaign[] = Array.from({ length: 15 }, (_, i) => {
  const type = i < CAMPAIGN_TYPES_DEMO.length ? CAMPAIGN_TYPES_DEMO[i] : rng.pick(CAMPAIGN_TYPES_DEMO)
  const comercial = rng.pick(DEMO_COMERCIALES)
  const status: CampaignStatus = i < 10 ? 'activa' : rng.pick(['pausada', 'finalizada'])
  const targets = rng.int(15, 60)
  const contacted = Math.round(targets * rng.pick([0.4, 0.6, 0.8, 1]))
  const responses = Math.round(contacted * rng.pick([0.2, 0.35, 0.5]))
  const meetings = Math.round(responses * rng.pick([0.3, 0.5]))
  const converted = Math.round(meetings * rng.pick([0.2, 0.4]))
  return {
    id: `camp-${i + 1}`,
    name: `${CAMPAIGN_NAMES[type]} ${i >= CAMPAIGN_TYPES_DEMO.length ? `(${rng.pick(DEPARTAMENTOS)})` : ''}`.trim(),
    type,
    status,
    objective: `Generar ${Math.max(5, Math.round(targets * 0.2))} reuniones comerciales calificadas en el segmento`,
    target_segment: rng.pick(EMPRESA_TEMPLATES.filter(t => t.campaignType === type).map(t => t.industry)) ?? 'Pymes en general',
    icp_description: 'Empresas con necesidad de renovar o ampliar cobertura de seguros en los próximos meses.',
    initial_message: 'Hola, te contacto de PLIFE Corredores de Seguros para revisar la cobertura vigente de tu empresa.',
    call_script: null,
    expected_objections: ['Ya tengo corredor', 'Es caro', 'Lo voy a pensar'],
    follow_up_sequence: null,
    start_date: rng.dateOffset(NOW, -rng.int(20, 180)),
    end_date: status === 'finalizada' ? rng.dateOffset(NOW, -rng.int(1, 15)) : rng.dateOffset(NOW, rng.int(15, 60)),
    total_targets: targets,
    total_contacted: contacted,
    total_responses: responses,
    total_meetings: meetings,
    total_converted: converted,
    responsible_id: comercial.id,
    deleted_at: null,
    created_at: rng.isoOffset(NOW, -rng.int(20, 180)),
    updated_at: rng.isoOffset(NOW, -rng.int(0, 10)),
    created_by: comercial.id,
  }
})

// ---------------------------------------------------------------------------
// Propuestas (18)
// ---------------------------------------------------------------------------
const PROPOSAL_STATUSES = ['draft', 'in_review', 'ready', 'used'] as const
const PROPOSAL_SOURCES = ['lead', 'campaign', 'manual', 'radar'] as const

export const DEMO_PROPUESTAS: Proposal[] = Array.from({ length: 18 }, (_, i) => {
  const empresa = rng.pick(DEMO_EMPRESAS)
  const branch = rng.pick(RAMOS_DEMO)
  const comercial = DEMO_COMERCIALES.find(c => c.id === empresa.assigned_to) ?? rng.pick(DEMO_COMERCIALES)
  const status = rng.pick(PROPOSAL_STATUSES)
  const source = rng.pick(PROPOSAL_SOURCES)
  const title = `${rng.pick(PRODUCTOS_POR_RAMO[branch] ?? [branch])} — ${empresa.name}`
  return {
    id: `prop-${i + 1}`,
    created_at: rng.isoOffset(NOW, -rng.int(1, 90)),
    updated_at: rng.isoOffset(NOW, -rng.int(0, 10)),
    deleted_at: null,
    created_by: comercial.id,
    assigned_to: comercial.id,
    title,
    status,
    source,
    source_id: null,
    source_title: source === 'campaign' ? rng.pick(DEMO_CAMPANAS).name : null,
    source_context: null,
    lead_id: null,
    campaign_id: null,
    radar_context: null,
    target_type: 'company',
    target_description: empresa.industry,
    context: `Se detectó necesidad de ${branch.toLowerCase()} en una conversación comercial con ${empresa.name}.`,
    objective: 'Ordenar la propuesta comercial y preparar el envío formal al cliente',
    known_problem: `${empresa.name} no tiene actualizada su cobertura de ${branch.toLowerCase()}`,
    desired_outcome: 'Cerrar una póliza que cubra el riesgo detectado con condiciones competitivas',
    notes: null,
    draft: {
      summary: `Propuesta de ${branch} para ${empresa.name}`,
      target_audience: empresa.industry,
      problem: `Cobertura de ${branch.toLowerCase()} desactualizada o inexistente`,
      opportunity: `Ofrecer ${title} con acompañamiento de PLIFE`,
      proposed_offer: `Cotización de ${title} con ${rng.pick(ASEGURADORAS_DEMO)}`,
    },
    summary: `Propuesta de ${branch} para ${empresa.name}`,
    target_audience: empresa.industry,
    problem: `Cobertura de ${branch.toLowerCase()} desactualizada o inexistente`,
    opportunity: `Ofrecer ${title} con acompañamiento de PLIFE`,
    proposed_offer: `Cotización de ${title} con ${rng.pick(ASEGURADORAS_DEMO)}`,
    score_snapshot: null,
    qualification_snapshot: null,
    metadata: {},
  }
})

// ---------------------------------------------------------------------------
// Leads (50)
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

export const DEMO_LEADS: MockLead[] = Array.from({ length: 50 }, (_, i) => {
  const usaEmpresaExistente = rng.bool(0.5)
  const empresa = usaEmpresaExistente ? rng.pick(DEMO_EMPRESAS) : null
  const prospecto = !empresa ? rng.pick(LEAD_PROSPECT_TEMPLATES) : null
  const nombre = empresa?.name ?? prospecto!.name
  const branch = rng.pick(RAMOS_DEMO)
  const comercial = rng.pick(DEMO_COMERCIALES)
  const stage = rng.pick(LEAD_STAGES)
  const source = rng.pick(LEAD_SOURCES)
  const createdDaysAgo = rng.int(0, 60)

  return {
    id: `lead-${i + 1}`,
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
})

// ---------------------------------------------------------------------------
// Actividades de hoy (para el dashboard del asesor)
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

// Vincular algunas empresas (y sus oportunidades) a la campaña de su mismo
// rubro, para que los contadores de "empresas/oportunidades por campaña" no
// queden en cero.
for (const camp of DEMO_CAMPANAS) {
  const matchingIds = new Set(
    EMPRESA_TEMPLATES
      .map((t, i) => ({ t, id: DEMO_EMPRESAS[i]?.id }))
      .filter(({ t }) => t.campaignType === camp.type)
      .map(({ id }) => id)
  )
  let linked = 0
  for (const emp of DEMO_EMPRESAS) {
    if (linked >= 4) break
    if (matchingIds.has(emp.id)) { emp.campaign_id = camp.id; linked++ }
  }
}
for (const opp of DEMO_OPORTUNIDADES) {
  const empresa = DEMO_EMPRESAS.find(e => e.id === opp.company_id)
  if (empresa?.campaign_id) opp.campaign_id = empresa.campaign_id
}

/** Actividad reciente agregada de toda la cartera, para el panel de Dirección. */
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
// Catálogo demo de Aseguradoras / Ramos (Admin) y Equipos comerciales
// ---------------------------------------------------------------------------
function normalize(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}

export const DEMO_ASEGURADORAS: Insurer[] = ASEGURADORAS_DEMO.map((name, i) => ({
  id: `ins-${i + 1}`,
  name,
  normalized_name: normalize(name),
  is_active: true,
  created_at: rng.isoOffset(NOW, -200),
  updated_at: rng.isoOffset(NOW, -30),
  created_by: null,
  updated_by: null,
}))

export const DEMO_RAMOS: InsuranceBranch[] = RAMOS_DEMO.map((name, i) => ({
  id: `ram-${i + 1}`,
  name,
  normalized_name: normalize(name),
  is_active: true,
  created_at: rng.isoOffset(NOW, -200),
  updated_at: rng.isoOffset(NOW, -30),
  created_by: null,
  updated_by: null,
}))

export const DEMO_EQUIPOS: (Team & { leader?: { full_name: string } | null })[] = [
  { id: 'team-1', name: 'Equipo Montevideo', description: 'Cartera de empresas de Montevideo y área metropolitana', leader_id: 'com-01', is_active: true, created_at: rng.isoOffset(NOW, -300), updated_at: rng.isoOffset(NOW, -30), created_by: 'com-01', leader: { full_name: 'Ana Deleón' } },
  { id: 'team-2', name: 'Equipo Interior', description: 'Cartera del interior del país', leader_id: 'com-08', is_active: true, created_at: rng.isoOffset(NOW, -280), updated_at: rng.isoOffset(NOW, -30), created_by: 'com-08', leader: { full_name: 'Sofía Machado' } },
]

// ---------------------------------------------------------------------------
// Getters de conveniencia (para minimizar el cambio en cada page.tsx)
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
    carteraPorEjecutivo,
    facturacionPorEmpresa,
    renovacionesDelMes: getUpcomingRenewalsDemo().filter(p => p.daysToExpiry <= 30 && p.daysToExpiry >= -5).length,
    renovacionesProximas: getUpcomingRenewalsDemo().length,
    polizasPorVencer: DEMO_POLIZAS.filter(p => p.status === 'proxima_a_vencer').length,
    documentacionPendiente: getPendingDocumentationDemo().length,
    primaAnualAdministrada: primaAdministradaDe(DEMO_POLIZAS),
    comisionEstimadaTotal: comisionEstimadaDe(DEMO_POLIZAS),
  }
}

/** 3 alertas ejecutivas derivadas de condiciones reales del universo (no hardcodeadas). */
export function getExecutiveAlertsDemo() {
  const renewals = getUpcomingRenewalsDemo()
  const renovacionesCriticas = renewals.filter(p => p.daysToExpiry <= 7)
  const pendingDocs = getPendingDocumentationDemo()
  const openOpps = DEMO_OPORTUNIDADES.filter(o => !['cerrada_ganada', 'cerrada_perdida'].includes(o.stage))
  const todayStr = NOW.toISOString().slice(0, 10)
  const seguimientosVencidos = openOpps.filter(o => o.next_action_date && o.next_action_date < todayStr)

  return [
    {
      id: 'alerta-renovaciones',
      severity: renovacionesCriticas.length > 0 ? 'alta' : 'baja',
      title: `${renovacionesCriticas.length} renovacion${renovacionesCriticas.length === 1 ? '' : 'es'} vence${renovacionesCriticas.length === 1 ? '' : 'n'} en los próximos 7 días`,
      detail: 'Ingreso recurrente en riesgo si no se gestiona la renovación a tiempo.',
      href: '/app/polizas/renovaciones',
    },
    {
      id: 'alerta-documentacion',
      severity: pendingDocs.length > 3 ? 'alta' : pendingDocs.length > 0 ? 'media' : 'baja',
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
  ] as const
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
