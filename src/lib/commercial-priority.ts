export type PriorityTone = 'danger' | 'warning' | 'success' | 'muted'

export interface CommercialPriority {
  label: 'Alta' | 'Media' | 'Baja'
  reason: string
  tone: PriorityTone
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export function getOpportunityPriority(opp: {
  next_action?: string | null
  next_action_date?: string | null
  human_score?: number | null
}): CommercialPriority {
  const today = todayStr()
  if (opp.next_action_date && opp.next_action_date < today) {
    return { label: 'Alta', reason: 'Seguimiento vencido', tone: 'danger' }
  }
  if (opp.human_score != null && opp.human_score >= 70 && opp.next_action) {
    return { label: 'Alta', reason: `Potencial ${opp.human_score}`, tone: 'warning' }
  }
  if (opp.next_action) {
    return { label: 'Media', reason: 'Próximo paso definido', tone: 'warning' }
  }
  return { label: 'Baja', reason: 'Sin próximo paso', tone: 'muted' }
}

export function getContactPriority(contact: {
  next_action?: string | null
  next_action_date?: string | null
}): CommercialPriority {
  const today = todayStr()
  if (contact.next_action_date && contact.next_action_date < today) {
    return { label: 'Alta', reason: 'Seguimiento vencido', tone: 'danger' }
  }
  if (contact.next_action) {
    return { label: 'Media', reason: 'Próximo paso definido', tone: 'warning' }
  }
  return { label: 'Baja', reason: 'Sin próximo paso', tone: 'muted' }
}

export function getCompanyPriority(company: {
  b2b_score?: number | null
  b2b_status?: string | null
}): CommercialPriority {
  const score = company.b2b_score ?? 0
  const status = company.b2b_status ?? ''
  if (score >= 65 && ['detectada', 'analizada', 'priorizada'].includes(status)) {
    return { label: 'Alta', reason: `Potencial ${score}`, tone: 'warning' }
  }
  if (['contactada', 'en_negociacion', 'reunion_agendada', 'asignada'].includes(status)) {
    return { label: 'Media', reason: 'En proceso activo', tone: 'success' }
  }
  return { label: 'Baja', reason: 'Sin actividad comercial', tone: 'muted' }
}
