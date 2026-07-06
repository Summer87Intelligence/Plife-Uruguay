import type { LeadLike, LeadFollowUpBucket } from './types'

// Comparación de fechas por clave YYYY-MM-DD en hora local, sin zonas horarias
// complejas: next_action_date es DATE en el schema (sin hora), y el criterio
// operativo es "el día del asesor". Mismo enfoque que el follow-up center
// de oportunidades.

function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function normalizeDateKey(value: string): string {
  // Acepta 'YYYY-MM-DD' o ISO completo; se queda con la parte de fecha.
  return value.slice(0, 10)
}

function isInActiveFollowUp(lead: LeadLike): boolean {
  return lead.status === 'open'
}

export function isLeadMissingNextStep(lead: LeadLike): boolean {
  if (!isInActiveFollowUp(lead)) return false
  return !lead.next_action?.trim() || !lead.next_action_date
}

export function isLeadFollowUpOverdue(lead: LeadLike, today: Date = new Date()): boolean {
  if (!isInActiveFollowUp(lead) || !lead.next_action_date) return false
  return normalizeDateKey(lead.next_action_date) < toDateKey(today)
}

export function isLeadFollowUpToday(lead: LeadLike, today: Date = new Date()): boolean {
  if (!isInActiveFollowUp(lead) || !lead.next_action_date) return false
  return normalizeDateKey(lead.next_action_date) === toDateKey(today)
}

export function getLeadFollowUpBucket(
  lead: LeadLike,
  today: Date = new Date()
): LeadFollowUpBucket {
  if (!isInActiveFollowUp(lead)) return 'none'
  if (isLeadMissingNextStep(lead)) return 'missing_next_step'
  if (isLeadFollowUpOverdue(lead, today)) return 'overdue'
  if (isLeadFollowUpToday(lead, today)) return 'today'
  return 'none'
}
