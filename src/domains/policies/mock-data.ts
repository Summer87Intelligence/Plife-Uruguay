/**
 * Datos 100% mock, en memoria — sin persistencia, sin Supabase (Bloque UI-0).
 * Sirven únicamente para validar navegación, UX, columnas y CTA antes de
 * construir el backend real (Bloque Técnico 2).
 *
 * Bloque 1 (2026-07-25): Plife es agente exclusivo de MAPFRE Vida — todas
 * las pólizas de este archivo respetan esa regla única (ver
 * src/lib/business-config.ts). El titular es siempre una persona física.
 */
import type { Policy, PolicyDocument } from './types'
import { PLIFE_BUSINESS_CONFIG } from '@/lib/business-config'

const INSURER = PLIFE_BUSINESS_CONFIG.insurer
const BRANCH = PLIFE_BUSINESS_CONFIG.insuranceBranch
const PRODUCT_PENDIENTE = 'Vida individual — PENDIENTE DE VALIDAR CON PLIFE (nombre comercial)'

function doc(type: PolicyDocument['type'], name: string, addedAt: string): PolicyDocument {
  return { id: `${type}-${name}`, type, name, addedAt, addedByName: 'Ana Deleón' }
}

export const MOCK_POLICIES: Policy[] = [
  {
    id: 'pol-1',
    policyNumber: 'MAP-88213',
    holderName: 'Marcela García',
    contactName: null,
    insurerName: INSURER,
    branchName: BRANCH,
    product: PRODUCT_PENDIENTE,
    status: 'vigente',
    startDate: '2026-03-01',
    endDate: '2027-03-01',
    premium: 14500,
    currency: 'UYU',
    paymentFrequency: 'mensual',
    origin: 'cartera_heredada',
    dataCompleteness: 'completo',
    dataGapsNote: null,
    commissionValue: 12,
    commissionType: 'percentage',
    assignedToName: 'Ana Deleón',
    documents: [
      doc('poliza_emitida', 'Póliza MAP-88213.pdf', '2026-03-02'),
      doc('condiciones_generales', 'Condiciones generales vida.pdf', '2026-03-02'),
    ],
    nextAction: 'Confirmar datos de contacto actualizados',
    nextActionDate: '2026-09-15',
    notes: 'Cliente de cartera preexistente, sin incidencias.',
    createdAt: '2026-02-20',
    updatedAt: '2026-03-02',
  },
  {
    id: 'pol-2',
    policyNumber: 'MAP-40217',
    holderName: 'Jorge Pintos',
    contactName: null,
    insurerName: INSURER,
    branchName: BRANCH,
    product: PRODUCT_PENDIENTE,
    status: 'proxima_a_vencer',
    startDate: '2025-08-10',
    endDate: '2026-08-10',
    premium: 9800,
    currency: 'UYU',
    paymentFrequency: 'anual',
    origin: 'cartera_heredada',
    dataCompleteness: 'completo',
    dataGapsNote: null,
    commissionValue: 10,
    commissionType: 'percentage',
    assignedToName: 'Rodrigo Silva',
    documents: [doc('poliza_emitida', 'Póliza MAP-40217.pdf', '2025-08-11')],
    nextAction: 'Iniciar renovación con Mapfre',
    nextActionDate: '2026-07-15',
    notes: null,
    createdAt: '2025-07-28',
    updatedAt: '2026-07-10',
  },
  {
    id: 'pol-3',
    policyNumber: 'MAP-77410',
    holderName: 'Camila Bianchi',
    contactName: null,
    insurerName: INSURER,
    branchName: BRANCH,
    product: 'Vida individual con ahorro — PENDIENTE DE VALIDAR CON PLIFE (nombre comercial)',
    status: 'en_renovacion',
    startDate: '2025-06-01',
    endDate: '2026-06-01',
    premium: 21000,
    currency: 'UYU',
    paymentFrequency: 'trimestral',
    origin: 'cartera_heredada',
    dataCompleteness: 'incompleto',
    dataGapsNote: 'Falta confirmar beneficiario declarado en la solicitud original.',
    commissionValue: 15,
    commissionType: 'percentage',
    assignedToName: 'Ana Deleón',
    documents: [doc('poliza_emitida', 'Póliza MAP-77410.pdf', '2025-06-02')],
    nextAction: 'Esperando condiciones de renovación de Mapfre',
    nextActionDate: '2026-07-28',
    notes: 'Mapfre pidió actualizar declaración jurada de salud.',
    createdAt: '2025-05-15',
    updatedAt: '2026-07-05',
  },
  {
    id: 'pol-4',
    policyNumber: null,
    holderName: 'Pablo Machado',
    contactName: null,
    insurerName: INSURER,
    branchName: BRANCH,
    product: PRODUCT_PENDIENTE,
    status: 'pendiente_documentacion',
    startDate: null,
    endDate: null,
    premium: null,
    currency: 'UYU',
    paymentFrequency: null,
    origin: 'originada_en_crm',
    dataCompleteness: 'incompleto',
    dataGapsNote: 'Falta cédula del titular y cotización en trámite con Mapfre.',
    commissionValue: null,
    commissionType: null,
    assignedToName: 'Rodrigo Silva',
    documents: [doc('propuesta_cotizacion', 'Cotización Mapfre — borrador.pdf', '2026-07-18')],
    nextAction: 'Solicitar cédula del titular',
    nextActionDate: '2026-07-26',
    notes: null,
    createdAt: '2026-07-16',
    updatedAt: '2026-07-18',
  },
  {
    id: 'pol-5',
    policyNumber: 'MAP-55302',
    holderName: 'Susana Ferreira',
    contactName: null,
    insurerName: INSURER,
    branchName: BRANCH,
    product: PRODUCT_PENDIENTE,
    status: 'cancelada',
    startDate: '2025-01-10',
    endDate: '2026-01-10',
    premium: 8200,
    currency: 'UYU',
    paymentFrequency: 'mensual',
    origin: 'cartera_heredada',
    dataCompleteness: 'completo',
    dataGapsNote: null,
    commissionValue: 10,
    commissionType: 'percentage',
    assignedToName: 'Ana Deleón',
    documents: [doc('poliza_emitida', 'Póliza MAP-55302.pdf', '2025-01-11')],
    nextAction: null,
    nextActionDate: null,
    notes: 'Cliente solicitó la baja antes de la renovación.',
    createdAt: '2024-12-20',
    updatedAt: '2026-01-15',
  },
  {
    id: 'pol-6',
    policyNumber: 'MAP-91004',
    holderName: 'Federico Bianchi (h)',
    contactName: null,
    insurerName: INSURER,
    branchName: BRANCH,
    product: 'Vida individual con ahorro — PENDIENTE DE VALIDAR CON PLIFE (nombre comercial)',
    status: 'vigente',
    startDate: '2026-01-05',
    endDate: '2027-01-05',
    premium: 18500,
    currency: 'UYU',
    paymentFrequency: 'semestral',
    origin: 'originada_en_crm',
    dataCompleteness: 'completo',
    dataGapsNote: null,
    commissionValue: 14,
    commissionType: 'percentage',
    assignedToName: 'Rodrigo Silva',
    documents: [
      doc('poliza_emitida', 'Póliza MAP-91004.pdf', '2026-01-06'),
      doc('condiciones_particulares', 'Condiciones particulares.pdf', '2026-01-06'),
    ],
    nextAction: 'Confirmar datos de contacto en el aniversario de póliza',
    nextActionDate: '2026-10-01',
    notes: 'Originada como lead entrante, primer producto propio del CRM.',
    createdAt: '2025-12-18',
    updatedAt: '2026-01-06',
  },
  {
    id: 'pol-7',
    policyNumber: 'MAP-30219',
    holderName: 'Lucía Fernández',
    contactName: null,
    insurerName: INSURER,
    branchName: BRANCH,
    product: PRODUCT_PENDIENTE,
    status: 'proxima_a_vencer',
    startDate: '2025-08-20',
    endDate: '2026-08-20',
    premium: 7200,
    currency: 'UYU',
    paymentFrequency: 'anual',
    origin: 'cartera_heredada',
    dataCompleteness: 'completo',
    dataGapsNote: null,
    commissionValue: 11,
    commissionType: 'percentage',
    assignedToName: 'Ana Deleón',
    documents: [doc('poliza_emitida', 'Póliza MAP-30219.pdf', '2025-08-21')],
    nextAction: 'Iniciar renovación',
    nextActionDate: '2026-07-30',
    notes: null,
    createdAt: '2025-08-01',
    updatedAt: '2026-07-12',
  },
  {
    id: 'pol-8',
    policyNumber: null,
    holderName: 'Nicolás Ortiz',
    contactName: null,
    insurerName: INSURER,
    branchName: BRANCH,
    product: PRODUCT_PENDIENTE,
    status: 'pendiente_documentacion',
    startDate: null,
    endDate: null,
    premium: null,
    currency: 'UYU',
    paymentFrequency: null,
    origin: 'originada_en_crm',
    dataCompleteness: 'incompleto',
    dataGapsNote: 'Falta comprobante de identidad del titular.',
    commissionValue: null,
    commissionType: null,
    assignedToName: 'Rodrigo Silva',
    documents: [],
    nextAction: 'Falta comprobante de identidad del titular',
    nextActionDate: '2026-07-25',
    notes: null,
    createdAt: '2026-07-20',
    updatedAt: '2026-07-20',
  },
]

// En modo demo comercial, Pólizas se sirve desde el universo mock completo
// (ver src/lib/demo/universe.ts, dataset chico y coherente de vida
// individual Mapfre — Bloque 1); fuera de demo, se mantiene este set chico
// original (8 pólizas ilustrativas).
import { isDemoMode } from '@/lib/demo'
import { DEMO_POLIZAS, getUpcomingRenewalsDemo, getPendingDocumentationDemo } from '@/lib/demo/universe'

export function getMockPolicies(): Policy[] {
  return isDemoMode() ? DEMO_POLIZAS : MOCK_POLICIES
}

export function getMockPolicyById(id: string): Policy | null {
  const source = isDemoMode() ? DEMO_POLIZAS : MOCK_POLICIES
  return source.find(p => p.id === id) ?? null
}

/** Próximas renovaciones: vigentes/por vencer/en renovación con fecha de vencimiento, ordenadas por urgencia. */
export function getUpcomingRenewals(): (Policy & { daysToExpiry: number })[] {
  if (isDemoMode()) return getUpcomingRenewalsDemo()
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return MOCK_POLICIES
    .filter(p => ['vigente', 'proxima_a_vencer', 'en_renovacion'].includes(p.status) && p.endDate)
    .map(p => ({ ...p, daysToExpiry: Math.round((new Date(p.endDate + 'T00:00:00').getTime() - today.getTime()) / 86_400_000) }))
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry)
}

/** Documentación pendiente: pólizas sin documentos, o en pendiente_documentacion. */
export function getPendingDocumentation(): Policy[] {
  if (isDemoMode()) return getPendingDocumentationDemo()
  return MOCK_POLICIES.filter(p => p.documents.length === 0 || p.status === 'pendiente_documentacion')
}
