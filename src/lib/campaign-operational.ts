import type { Campaign, CampaignStatus } from '@/types/database'

export interface CampaignLinkCounts {
  companies: number
  opportunities: number
}

/** Próximo paso inferido sin métricas inventadas — solo estado y vínculos reales. */
export function suggestCampaignNextStep(
  campaign: Campaign,
  counts: CampaignLinkCounts
): string {
  const { companies, opportunities } = counts

  if (campaign.status === 'borrador') {
    return 'Revisá objetivo y segmento, luego activá la campaña cuando esté lista para trabajar.'
  }
  if (campaign.status === 'pausada') {
    return 'Reactivá la campaña o documentá qué quedó pendiente antes de pausarla.'
  }
  if (campaign.status === 'finalizada' || campaign.status === 'archivada') {
    return 'Revisá empresas y oportunidades vinculadas para cerrar aprendizajes del ciclo.'
  }

  // activa
  if (companies === 0) {
    return 'Asociá empresas a esta campaña desde el detalle o Radar B2B.'
  }
  if (opportunities === 0) {
    return 'Registrá conversaciones reales y creá oportunidades cuando aparezca interés.'
  }
  return 'Revisá el seguimiento de las oportunidades vinculadas y definí próximos pasos.'
}

export function campaignStatusHint(status: CampaignStatus): string | null {
  switch (status) {
    case 'borrador':
      return 'Borrador — aún no está activa para el equipo.'
    case 'pausada':
      return 'Pausada — el seguimiento queda en espera.'
    case 'finalizada':
      return 'Finalizada — revisá resultados y vínculos.'
    case 'archivada':
      return 'Archivada — solo consulta histórica.'
    default:
      return null
  }
}
