/**
 * Datos 100% mock, en memoria — sin persistencia, sin Supabase (Bloque UI-0).
 * Sirven únicamente para validar navegación, UX, columnas y CTA antes de
 * construir el backend real (Bloque Técnico 2).
 */
import type { Policy, PolicyDocument } from './types'

function doc(type: PolicyDocument['type'], name: string, addedAt: string): PolicyDocument {
  return { id: `${type}-${name}`, type, name, addedAt, addedByName: 'Ana Deleón' }
}

export const MOCK_POLICIES: Policy[] = [
  {
    id: 'pol-1',
    policyNumber: 'BSE-88213',
    companyName: 'Estudio García y Asociados',
    contactName: 'Marcela García',
    insurerName: 'BSE',
    branchName: 'Accidentes de trabajo',
    product: 'Seguro colectivo de accidentes laborales',
    status: 'vigente',
    startDate: '2026-03-01',
    endDate: '2027-03-01',
    premium: 145000,
    currency: 'UYU',
    commissionValue: 12,
    commissionType: 'percentage',
    assignedToName: 'Ana Deleón',
    documents: [
      doc('poliza_emitida', 'Póliza BSE-88213.pdf', '2026-03-02'),
      doc('condiciones_generales', 'Condiciones generales AT.pdf', '2026-03-02'),
    ],
    nextAction: 'Confirmar nómina actualizada de empleados',
    nextActionDate: '2026-09-15',
    notes: 'Cliente prioritario, 22 empleados asegurados.',
    createdAt: '2026-02-20',
    updatedAt: '2026-03-02',
  },
  {
    id: 'pol-2',
    policyNumber: 'SURA-40217',
    companyName: 'Constructora del Este',
    contactName: 'Jorge Pintos',
    insurerName: 'SURA',
    branchName: 'Vehículos',
    product: 'Flota comercial 8 unidades',
    status: 'proxima_a_vencer',
    startDate: '2025-08-10',
    endDate: '2026-08-10',
    premium: 310000,
    currency: 'UYU',
    commissionValue: 10,
    commissionType: 'percentage',
    assignedToName: 'Rodrigo Silva',
    documents: [doc('poliza_emitida', 'Póliza SURA-40217.pdf', '2025-08-11')],
    nextAction: 'Iniciar renovación con SURA',
    nextActionDate: '2026-07-15',
    notes: null,
    createdAt: '2025-07-28',
    updatedAt: '2026-07-10',
  },
  {
    id: 'pol-3',
    policyNumber: 'MAP-77410',
    companyName: 'Clínica Nova Salud',
    contactName: 'Dra. Valentina Ríos',
    insurerName: 'Mapfre',
    branchName: 'Responsabilidad civil',
    product: 'RC profesional médica',
    status: 'en_renovacion',
    startDate: '2025-06-01',
    endDate: '2026-06-01',
    premium: 96000,
    currency: 'UYU',
    commissionValue: 15,
    commissionType: 'percentage',
    assignedToName: 'Ana Deleón',
    documents: [doc('poliza_emitida', 'Póliza MAP-77410.pdf', '2025-06-02')],
    nextAction: 'Esperando condiciones de renovación de Mapfre',
    nextActionDate: '2026-07-28',
    notes: 'Aseguradora pidió actualizar declaración jurada.',
    createdAt: '2025-05-15',
    updatedAt: '2026-07-05',
  },
  {
    id: 'pol-4',
    policyNumber: null,
    companyName: 'Transportes del Litoral',
    contactName: 'Pablo Machado',
    insurerName: 'Porto Seguro',
    branchName: 'Transporte',
    product: 'Carga general — cotización en trámite',
    status: 'pendiente_documentacion',
    startDate: null,
    endDate: null,
    premium: null,
    currency: 'UYU',
    commissionValue: null,
    commissionType: null,
    assignedToName: 'Rodrigo Silva',
    documents: [doc('propuesta_cotizacion', 'Cotización Porto — borrador.pdf', '2026-07-18')],
    nextAction: 'Solicitar RUT y padrones de la flota al cliente',
    nextActionDate: '2026-07-26',
    notes: null,
    createdAt: '2026-07-16',
    updatedAt: '2026-07-18',
  },
  {
    id: 'pol-5',
    policyNumber: 'BSE-55302',
    companyName: 'Panadería Los Aromos',
    contactName: 'Susana Ferreira',
    insurerName: 'BSE',
    branchName: 'Incendio',
    product: 'Incendio y contenido comercial',
    status: 'cancelada',
    startDate: '2025-01-10',
    endDate: '2026-01-10',
    premium: 42000,
    currency: 'UYU',
    commissionValue: 10,
    commissionType: 'percentage',
    assignedToName: 'Ana Deleón',
    documents: [doc('poliza_emitida', 'Póliza BSE-55302.pdf', '2025-01-11')],
    nextAction: null,
    nextActionDate: null,
    notes: 'Cliente cerró el local, canceló antes de la renovación.',
    createdAt: '2024-12-20',
    updatedAt: '2026-01-15',
  },
  {
    id: 'pol-6',
    policyNumber: 'SURA-91004',
    companyName: 'Estudio Jurídico Bianchi',
    contactName: 'Dr. Federico Bianchi',
    insurerName: 'SURA',
    branchName: 'Vida',
    product: 'Vida colectiva de socios',
    status: 'vigente',
    startDate: '2026-01-05',
    endDate: '2027-01-05',
    premium: 58000,
    currency: 'UYU',
    commissionValue: 14,
    commissionType: 'percentage',
    assignedToName: 'Rodrigo Silva',
    documents: [
      doc('poliza_emitida', 'Póliza SURA-91004.pdf', '2026-01-06'),
      doc('condiciones_particulares', 'Condiciones particulares.pdf', '2026-01-06'),
    ],
    nextAction: 'Revisar altas y bajas de socios en octubre',
    nextActionDate: '2026-10-01',
    notes: null,
    createdAt: '2025-12-18',
    updatedAt: '2026-01-06',
  },
  {
    id: 'pol-7',
    policyNumber: 'MAP-30219',
    companyName: 'Hogar Compartido S.A.',
    contactName: 'Lucía Fernández',
    insurerName: 'Mapfre',
    branchName: 'Hogar',
    product: 'Hogar — edificio administrado',
    status: 'proxima_a_vencer',
    startDate: '2025-08-20',
    endDate: '2026-08-20',
    premium: 27500,
    currency: 'UYU',
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
    companyName: 'Comercial Andes',
    contactName: 'Nicolás Ortiz',
    insurerName: 'Porto Seguro',
    branchName: 'Comercio',
    product: 'Comercio — local + mercadería',
    status: 'pendiente_documentacion',
    startDate: null,
    endDate: null,
    premium: null,
    currency: 'UYU',
    commissionValue: null,
    commissionType: null,
    assignedToName: 'Rodrigo Silva',
    documents: [],
    nextAction: 'Falta comprobante de titularidad del local',
    nextActionDate: '2026-07-25',
    notes: null,
    createdAt: '2026-07-20',
    updatedAt: '2026-07-20',
  },
]

export function getMockPolicies(): Policy[] {
  return MOCK_POLICIES
}

export function getMockPolicyById(id: string): Policy | null {
  return MOCK_POLICIES.find(p => p.id === id) ?? null
}

function daysUntil(dateStr: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

/** Próximas renovaciones: vigentes/por vencer/en renovación con fecha de vencimiento, ordenadas por urgencia. */
export function getUpcomingRenewals(): (Policy & { daysToExpiry: number })[] {
  return MOCK_POLICIES
    .filter(p => ['vigente', 'proxima_a_vencer', 'en_renovacion'].includes(p.status) && p.endDate)
    .map(p => ({ ...p, daysToExpiry: daysUntil(p.endDate!) }))
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry)
}

/** Documentación pendiente: pólizas sin documentos, o en pendiente_documentacion. */
export function getPendingDocumentation(): Policy[] {
  return MOCK_POLICIES.filter(p => p.documents.length === 0 || p.status === 'pendiente_documentacion')
}
