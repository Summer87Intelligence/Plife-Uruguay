// FASE 14K — Agrupación de leads para el foco operativo de PLIFE Hoy.
// Helpers puros sobre LeadLike: sin Supabase, sin mutaciones.

import type { LeadLike } from './types'
import { isTerminalLeadStage } from './pipeline'
import {
  isLeadFollowUpOverdue,
  isLeadFollowUpToday,
  isLeadMissingNextStep,
} from './follow-up'

export interface LeadDashboardBuckets<T extends LeadLike = LeadLike> {
  newLeads: T[]
  overdueLeads: T[]
  todayLeads: T[]
  missingNextStepLeads: T[]
  hotLeads: T[]
  followUpLeads: T[]
}

export interface LeadDashboardSummary {
  totalActive: number
  newCount: number
  overdueCount: number
  todayCount: number
  missingNextStepCount: number
  hotCount: number
  followUpCount: number
}

// Activo = gestionable hoy: abierto y en etapa no terminal. Convertidos,
// descartados y archivados quedan fuera de todos los buckets.
export function isLeadDashboardActive(lead: LeadLike): boolean {
  return lead.status === 'open' && !isTerminalLeadStage(lead.pipeline_stage)
}

export function getLeadDashboardBuckets<T extends LeadLike>(
  leads: T[],
  today: Date = new Date()
): LeadDashboardBuckets<T> {
  const active = leads.filter(isLeadDashboardActive)
  return {
    newLeads: active.filter((lead) => lead.pipeline_stage === 'nuevo'),
    overdueLeads: active.filter((lead) => isLeadFollowUpOverdue(lead, today)),
    todayLeads: active.filter((lead) => isLeadFollowUpToday(lead, today)),
    missingNextStepLeads: active.filter((lead) => isLeadMissingNextStep(lead)),
    hotLeads: active.filter((lead) => lead.temperature === 'hot'),
    followUpLeads: active.filter((lead) => lead.pipeline_stage === 'seguimiento'),
  }
}

export function getLeadDashboardSummary(
  leads: LeadLike[],
  today: Date = new Date()
): LeadDashboardSummary {
  const buckets = getLeadDashboardBuckets(leads, today)
  return {
    totalActive: leads.filter(isLeadDashboardActive).length,
    newCount: buckets.newLeads.length,
    overdueCount: buckets.overdueLeads.length,
    todayCount: buckets.todayLeads.length,
    missingNextStepCount: buckets.missingNextStepLeads.length,
    hotCount: buckets.hotLeads.length,
    followUpCount: buckets.followUpLeads.length,
  }
}
