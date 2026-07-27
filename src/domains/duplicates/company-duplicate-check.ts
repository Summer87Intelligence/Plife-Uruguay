import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { nameSimilarity, normalizeText, normalizeWebsite } from './normalize'
import type { CompanyDuplicateMatch, DuplicateSeverity } from './types'

const NAME_SIMILARITY_THRESHOLD = 0.85

export interface CompanyDuplicateInput {
  name: string
  website?: string | null
  linkedin_url?: string | null
  instagram_url?: string | null
  excludeId?: string
}

type CompanyRow = Pick<
  Database['public']['Tables']['companies']['Row'],
  'id' | 'name' | 'industry' | 'website' | 'linkedin_url' | 'instagram_url'
>

function scoreCompanyMatch(
  input: CompanyDuplicateInput,
  existing: CompanyRow
): CompanyDuplicateMatch | null {
  const reasons: string[] = []
  let severity: DuplicateSeverity = 'soft'

  const inputName = normalizeText(input.name)
  const existingName = normalizeText(existing.name)
  const similarity = nameSimilarity(input.name, existing.name)

  if (inputName && existingName && similarity >= NAME_SIMILARITY_THRESHOLD) {
    reasons.push(similarity >= 0.98 ? 'Nombre igual o casi igual' : 'Nombre muy parecido')
    if (similarity >= 0.98) severity = 'strong'
  }

  const inputWebsite = normalizeWebsite(input.website)
  const existingWebsite = normalizeWebsite(existing.website)
  if (inputWebsite && existingWebsite && inputWebsite === existingWebsite) {
    reasons.push('Mismo sitio web')
    severity = 'strong'
  }

  const inputLinkedin = normalizeWebsite(input.linkedin_url)
  const existingLinkedin = normalizeWebsite(existing.linkedin_url)
  if (inputLinkedin && existingLinkedin && inputLinkedin === existingLinkedin) {
    reasons.push('Mismo perfil de LinkedIn')
    severity = 'strong'
  }

  const inputInstagram = normalizeWebsite(input.instagram_url)
  const existingInstagram = normalizeWebsite(existing.instagram_url)
  if (inputInstagram && existingInstagram && inputInstagram === existingInstagram) {
    reasons.push('Mismo perfil de Instagram')
    severity = 'strong'
  }

  if (reasons.length === 0) return null

  return {
    id: existing.id,
    name: existing.name,
    industry: existing.industry,
    website: existing.website,
    linkedin_url: existing.linkedin_url,
    reasons,
    severity,
  }
}

/** Evalúa candidatos ya cargados (útil para tests unitarios). */
export function findPotentialCompanyDuplicates(
  input: CompanyDuplicateInput,
  candidates: CompanyRow[]
): CompanyDuplicateMatch[] {
  const matches: CompanyDuplicateMatch[] = []
  for (const row of candidates) {
    if (input.excludeId && row.id === input.excludeId) continue
    const match = scoreCompanyMatch(input, row)
    if (match) matches.push(match)
  }
  return matches.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === 'strong' ? -1 : 1
    return a.name.localeCompare(b.name, 'es')
  })
}

/** Busca duplicados probables en Supabase (solo lectura, sin migraciones). */
export async function queryCompanyDuplicates(
  supabase: SupabaseClient<Database>,
  input: CompanyDuplicateInput
): Promise<CompanyDuplicateMatch[]> {
  const namePart = normalizeText(input.name).slice(0, 40)
  if (!namePart) return []

  const { data, error } = await supabase
    .from('companies')
    .select('id, name, industry, website, linkedin_url, instagram_url')
    .is('deleted_at', null)
    .ilike('name', `%${namePart.replace(/[%_]/g, '')}%`)
    .limit(30)

  if (error || !data) return []

  const matches = findPotentialCompanyDuplicates(input, data)

  const inputWebsite = normalizeWebsite(input.website)
  if (inputWebsite && !matches.some(m => m.reasons.includes('Mismo sitio web'))) {
    const { data: byWeb } = await supabase
      .from('companies')
      .select('id, name, industry, website, linkedin_url, instagram_url')
      .is('deleted_at', null)
      .or(`website.ilike.%${inputWebsite}%,linkedin_url.ilike.%${inputWebsite}%`)
      .limit(10)
    if (byWeb) {
      for (const row of byWeb) {
        if (matches.some(m => m.id === row.id)) continue
        const match = scoreCompanyMatch(input, row)
        if (match) matches.push(match)
      }
    }
  }

  return matches.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === 'strong' ? -1 : 1
    return a.name.localeCompare(b.name, 'es')
  })
}
