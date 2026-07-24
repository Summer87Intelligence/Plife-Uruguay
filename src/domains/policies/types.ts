/**
 * Gestión de Pólizas — UI Prototype (Bloque UI-0).
 *
 * Este dominio hoy NO tiene tabla en Supabase. Los tipos de abajo representan
 * la forma objetivo (docs/product/PLIFE-GESTION-POLIZAS-V1.md), pero los datos
 * vienen de mock-data.ts en memoria. Cuando exista persistencia real (Bloque
 * Técnico 2+), este archivo se mantiene y solo cambia el datasource
 * (mock-data.ts → queries.ts/actions.ts contra Supabase).
 */

export type PolicyStatus =
  | 'borrador'
  | 'cotizacion'
  | 'pendiente_documentacion'
  | 'enviada_a_aseguradora'
  | 'emitida'
  | 'vigente'
  | 'proxima_a_vencer'
  | 'en_renovacion'
  | 'renovada'
  | 'no_renovada'
  | 'cancelada'
  | 'rechazada'

export const POLICY_STATUS_LABELS: Record<PolicyStatus, string> = {
  borrador: 'Borrador',
  cotizacion: 'Cotización',
  pendiente_documentacion: 'Pendiente de documentación',
  enviada_a_aseguradora: 'Enviada a aseguradora',
  emitida: 'Emitida',
  vigente: 'Vigente',
  proxima_a_vencer: 'Próxima a vencer',
  en_renovacion: 'En renovación',
  renovada: 'Renovada',
  no_renovada: 'No renovada',
  cancelada: 'Cancelada',
  rechazada: 'Rechazada',
}

export const POLICY_STATUS_COLORS: Record<PolicyStatus, string> = {
  borrador: 'bg-gray-100 text-gray-700',
  cotizacion: 'bg-blue-100 text-blue-800',
  pendiente_documentacion: 'bg-amber-100 text-amber-800',
  enviada_a_aseguradora: 'bg-indigo-100 text-indigo-800',
  emitida: 'bg-cyan-100 text-cyan-800',
  vigente: 'bg-green-100 text-green-800',
  proxima_a_vencer: 'bg-orange-100 text-orange-800',
  en_renovacion: 'bg-purple-100 text-purple-800',
  renovada: 'bg-green-100 text-green-800',
  no_renovada: 'bg-red-100 text-red-800',
  cancelada: 'bg-gray-200 text-gray-600',
  rechazada: 'bg-red-100 text-red-800',
}

/**
 * Board operativo del Listado (Bloque UI-0): 5 columnas que representan cómo
 * trabaja una corredora día a día, no los 12 estados completos del ciclo de
 * vida. Estados fuera de estas columnas (borrador, cotización, enviada a
 * aseguradora, emitida, renovada, no_renovada, rechazada) existen en el
 * modelo y aparecen en la Ficha, pero no tienen columna propia en el board V1.
 */
export const POLICY_BOARD_COLUMNS: { status: PolicyStatus; label: string }[] = [
  { status: 'vigente', label: 'Vigentes' },
  { status: 'proxima_a_vencer', label: 'Por vencer' },
  { status: 'en_renovacion', label: 'En renovación' },
  { status: 'pendiente_documentacion', label: 'Pendientes de documentación' },
  { status: 'cancelada', label: 'Canceladas' },
]

export type DocumentType =
  | 'poliza_emitida'
  | 'certificado'
  | 'propuesta_cotizacion'
  | 'condiciones_particulares'
  | 'condiciones_generales'
  | 'comprobante'
  | 'endoso'
  | 'otros'

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  poliza_emitida: 'Póliza emitida',
  certificado: 'Certificado',
  propuesta_cotizacion: 'Propuesta / cotización',
  condiciones_particulares: 'Condiciones particulares',
  condiciones_generales: 'Condiciones generales',
  comprobante: 'Comprobante',
  endoso: 'Endoso',
  otros: 'Otros',
}

export interface PolicyDocument {
  id: string
  type: DocumentType
  name: string
  addedAt: string
  addedByName: string
}

/** Forma objetivo del modelo de datos — ver docs/product/PLIFE-GESTION-POLIZAS-V1.md §9. */
export interface Policy {
  id: string
  policyNumber: string | null
  companyName: string
  contactName: string | null
  insurerName: string
  branchName: string
  product: string
  status: PolicyStatus
  startDate: string | null
  endDate: string | null
  premium: number | null
  currency: string
  // Comisión: visible solo para dirección/admin (docs §9, decisión de comisión V1).
  commissionValue: number | null
  commissionType: 'percentage' | 'fixed' | null
  assignedToName: string
  documents: PolicyDocument[]
  nextAction: string | null
  nextActionDate: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface PolicyFormData {
  companyName: string
  contactName: string
  insurerName: string
  branchName: string
  product: string
  startDate: string
  endDate: string
  premium: string
  nextAction: string
}
