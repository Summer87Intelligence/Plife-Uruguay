export const INDUSTRY_LABELS: Record<string, string> = {
  tecnologia: 'Tecnología',
  construccion: 'Construcción',
  salud: 'Salud / Clínicas',
  estudio_contable: 'Estudio Contable',
  estudio_juridico: 'Estudio Jurídico',
  comercio: 'Comercio',
  industria: 'Industria',
  agropecuaria: 'Agropecuaria',
  educacion: 'Educación',
  servicios: 'Servicios profesionales',
  otro: 'Otro',
}

export function industryLabel(slug: string | null | undefined): string | null {
  if (!slug) return null
  return INDUSTRY_LABELS[slug] ?? slug
}
