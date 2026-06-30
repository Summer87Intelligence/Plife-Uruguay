import type { ContactStatus, CompanyB2BStatus, OpportunityStage, RiskLevel, ActivityType, CampaignStatus, CampaignType, UserRole, ComplianceAction } from '@/types/database'

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  interesado: 'Interesado',
  reunion_agendada: 'Reunión agendada',
  diagnostico_realizado: 'Diagnóstico realizado',
  en_seguimiento: 'En seguimiento',
  en_analisis: 'En análisis',
  cerrado_ganado: 'Cerrado ganado',
  cerrado_perdido: 'Cerrado perdido',
  seguimiento_futuro: 'Seguimiento futuro',
}

export const CONTACT_STATUS_COLORS: Record<ContactStatus, string> = {
  nuevo: 'bg-blue-100 text-blue-800',
  contactado: 'bg-indigo-100 text-indigo-800',
  interesado: 'bg-yellow-100 text-yellow-800',
  reunion_agendada: 'bg-purple-100 text-purple-800',
  diagnostico_realizado: 'bg-orange-100 text-orange-800',
  en_seguimiento: 'bg-cyan-100 text-cyan-800',
  en_analisis: 'bg-teal-100 text-teal-800',
  cerrado_ganado: 'bg-green-100 text-green-800',
  cerrado_perdido: 'bg-red-100 text-red-800',
  seguimiento_futuro: 'bg-gray-100 text-gray-800',
}

export const OPPORTUNITY_STAGE_LABELS: Record<OpportunityStage, string> = {
  nueva: 'Nueva',
  calificada: 'Calificada',
  contactada: 'Contactada',
  reunion_agendada: 'Reunión agendada',
  diagnostico_realizado: 'Diagnóstico realizado',
  propuesta_conceptual: 'Propuesta conceptual',
  validacion_plife: 'Validación PLIFE',
  seguimiento: 'Seguimiento',
  cerrada_ganada: 'Cerrada ganada',
  cerrada_perdida: 'Cerrada perdida',
  dormida: 'Dormida',
}

export const OPPORTUNITY_STAGE_COLORS: Record<OpportunityStage, string> = {
  nueva: 'bg-blue-100 text-blue-800',
  calificada: 'bg-indigo-100 text-indigo-800',
  contactada: 'bg-cyan-100 text-cyan-800',
  reunion_agendada: 'bg-purple-100 text-purple-800',
  diagnostico_realizado: 'bg-orange-100 text-orange-800',
  propuesta_conceptual: 'bg-yellow-100 text-yellow-800',
  validacion_plife: 'bg-teal-100 text-teal-800',
  seguimiento: 'bg-sky-100 text-sky-800',
  cerrada_ganada: 'bg-green-100 text-green-800',
  cerrada_perdida: 'bg-red-100 text-red-800',
  dormida: 'bg-gray-100 text-gray-800',
}

export const B2B_STATUS_LABELS: Record<CompanyB2BStatus, string> = {
  detectada: 'Detectada',
  analizada: 'Analizada',
  priorizada: 'Priorizada',
  asignada: 'Asignada',
  contactada: 'Contactada',
  reunion_agendada: 'Reunión agendada',
  en_negociacion: 'En negociación',
  descartada: 'Descartada',
  convertida: 'Convertida',
}

export const B2B_STATUS_COLORS: Record<CompanyB2BStatus, string> = {
  detectada: 'bg-gray-100 text-gray-800',
  analizada: 'bg-blue-100 text-blue-800',
  priorizada: 'bg-yellow-100 text-yellow-800',
  asignada: 'bg-indigo-100 text-indigo-800',
  contactada: 'bg-cyan-100 text-cyan-800',
  reunion_agendada: 'bg-purple-100 text-purple-800',
  en_negociacion: 'bg-orange-100 text-orange-800',
  descartada: 'bg-red-100 text-red-800',
  convertida: 'bg-green-100 text-green-800',
}

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  bajo: 'Bajo',
  medio: 'Medio',
  alto: 'Alto',
  critico: 'Crítico',
}

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  bajo: 'bg-green-100 text-green-800',
  medio: 'bg-yellow-100 text-yellow-800',
  alto: 'bg-orange-100 text-orange-800',
  critico: 'bg-red-100 text-red-800',
}

export const COMPLIANCE_ACTION_LABELS: Record<ComplianceAction, string> = {
  aprobado: 'Aprobado',
  modificado: 'Requiere ajustes',
  revision_requerida: 'Revisión requerida',
  bloqueado: 'Bloqueado',
}

export const COMPLIANCE_ACTION_COLORS: Record<ComplianceAction, string> = {
  aprobado: 'bg-green-100 text-green-800',
  modificado: 'bg-yellow-100 text-yellow-800',
  revision_requerida: 'bg-orange-100 text-orange-800',
  bloqueado: 'bg-red-100 text-red-800',
}

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  llamada: 'Llamada',
  reunion: 'Reunión',
  mensaje: 'Mensaje',
  email: 'Email',
  nota: 'Nota',
  tarea: 'Tarea',
  whatsapp: 'WhatsApp',
  linkedin: 'LinkedIn',
}

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  borrador: 'Borrador',
  activa: 'Activa',
  pausada: 'Pausada',
  finalizada: 'Finalizada',
  archivada: 'Archivada',
}

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  borrador: 'bg-gray-100 text-gray-700',
  activa: 'bg-green-100 text-green-800',
  pausada: 'bg-yellow-100 text-yellow-800',
  finalizada: 'bg-blue-100 text-blue-800',
  archivada: 'bg-gray-100 text-gray-500',
}

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  duenos_pymes: 'Dueños de Pymes',
  empresas_familiares: 'Empresas familiares',
  estudios_contables: 'Estudios contables',
  estudios_juridicos: 'Estudios jurídicos',
  clinicas: 'Clínicas / Salud',
  empresas_tech: 'Empresas tech',
  constructoras: 'Constructoras',
  clubes_asociaciones: 'Clubes y asociaciones',
  profesionales_independientes: 'Profesionales independientes',
  ejecutivos: 'Ejecutivos',
  reclutamiento_asesores: 'Reclutamiento de asesores',
  general: 'General',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  direccion: 'Dirección',
  lider_comercial: 'Líder Comercial',
  asesor: 'Asesor',
  compliance: 'Compliance',
  capacitacion: 'Capacitación',
  viewer: 'Solo Lectura',
}

export const PIPELINE_STAGES: OpportunityStage[] = [
  'nueva', 'calificada', 'contactada', 'reunion_agendada',
  'diagnostico_realizado', 'propuesta_conceptual', 'validacion_plife', 'seguimiento',
]

export const CLOSED_STAGES: OpportunityStage[] = ['cerrada_ganada', 'cerrada_perdida', 'dormida']

export const NAV_ITEMS = [
  { href: '/app/hoy', label: 'PLIFE Hoy', icon: 'Home' },
  { href: '/app/contactos', label: 'Contactos', icon: 'Users' },
  { href: '/app/empresas', label: 'Empresas', icon: 'Building2' },
  { href: '/app/oportunidades', label: 'Oportunidades', icon: 'TrendingUp' },
  { href: '/app/radar-b2b', label: 'Radar B2B', icon: 'Radar' },
  { href: '/app/campanas', label: 'Campañas', icon: 'Megaphone' },
  { href: '/app/copiloto', label: 'Copiloto IA', icon: 'Bot' },
  { href: '/app/conocimiento', label: 'Conocimiento', icon: 'BookOpen' },
  { href: '/app/compliance', label: 'Compliance', icon: 'ShieldCheck' },
  { href: '/app/academia', label: 'Academia', icon: 'GraduationCap' },
  { href: '/app/direccion', label: 'Dirección', icon: 'BarChart3' },
  { href: '/app/admin', label: 'Admin', icon: 'Settings' },
] as const
