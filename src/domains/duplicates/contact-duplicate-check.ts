import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { nameSimilarity, normalizeEmail, normalizePhone } from './normalize'
import type { ContactDuplicateMatch, DuplicateSeverity } from './types'

const NAME_SIMILARITY_THRESHOLD = 0.85
const MIN_PHONE_DIGITS = 8

export interface ContactDuplicateInput {
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  company_id?: string | null
  excludeId?: string
}

type ContactRow = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  company_id: string | null
  companies?: { name: string } | { name: string }[] | null
}

function companyName(row: ContactRow): string | null {
  if (!row.companies) return null
  if (Array.isArray(row.companies)) return row.companies[0]?.name ?? null
  return row.companies.name
}

function scoreContactMatch(
  input: ContactDuplicateInput,
  existing: ContactRow
): ContactDuplicateMatch | null {
  const reasons: string[] = []
  let severity: DuplicateSeverity = 'soft'

  const inputEmail = normalizeEmail(input.email)
  const existingEmail = normalizeEmail(existing.email)
  if (inputEmail && existingEmail && inputEmail === existingEmail) {
    reasons.push('Mismo email')
    severity = 'strong'
  }

  const inputPhone = normalizePhone(input.phone)
  const existingPhone = normalizePhone(existing.phone)
  if (
    inputPhone.length >= MIN_PHONE_DIGITS &&
    existingPhone.length >= MIN_PHONE_DIGITS &&
    inputPhone === existingPhone
  ) {
    reasons.push('Mismo teléfono')
    severity = 'strong'
  }

  const fullInput = `${input.first_name} ${input.last_name}`.trim()
  const fullExisting = `${existing.first_name} ${existing.last_name}`.trim()
  const sameCompany =
    input.company_id && existing.company_id && input.company_id === existing.company_id

  if (sameCompany) {
    const similarity = nameSimilarity(fullInput, fullExisting)
    if (similarity >= NAME_SIMILARITY_THRESHOLD) {
      reasons.push('Nombre muy parecido en la misma empresa')
      if (severity !== 'strong') severity = 'soft'
    }
  }

  if (reasons.length === 0) return null

  return {
    id: existing.id,
    first_name: existing.first_name,
    last_name: existing.last_name,
    email: existing.email,
    phone: existing.phone,
    company_id: existing.company_id,
    company_name: companyName(existing),
    reasons,
    severity,
  }
}

/** Evalúa candidatos ya cargados (útil para tests unitarios). */
export function findPotentialContactDuplicates(
  input: ContactDuplicateInput,
  candidates: ContactRow[]
): ContactDuplicateMatch[] {
  const matches: ContactDuplicateMatch[] = []
  for (const row of candidates) {
    if (input.excludeId && row.id === input.excludeId) continue
    const match = scoreContactMatch(input, row)
    if (match) matches.push(match)
  }
  return matches.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === 'strong' ? -1 : 1
    return `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`, 'es')
  })
}

/** Busca duplicados probables en Supabase (solo lectura, sin migraciones). */
export async function queryContactDuplicates(
  supabase: SupabaseClient<Database>,
  input: ContactDuplicateInput
): Promise<ContactDuplicateMatch[]> {
  const seen = new Set<string>()
  const matches: ContactDuplicateMatch[] = []

  function addMatches(rows: ContactRow[]) {
    for (const row of rows) {
      if (seen.has(row.id)) continue
      if (input.excludeId && row.id === input.excludeId) continue
      const match = scoreContactMatch(input, row)
      if (match) {
        seen.add(row.id)
        matches.push(match)
      }
    }
  }

  const select = 'id, first_name, last_name, email, phone, company_id, companies(name)'

  const inputEmail = normalizeEmail(input.email)
  if (inputEmail) {
    const { data } = await supabase
      .from('contacts')
      .select(select)
      .is('deleted_at', null)
      .ilike('email', inputEmail)
      .limit(10)
    if (data) addMatches(data as ContactRow[])
  }

  const inputPhone = normalizePhone(input.phone)
  if (inputPhone.length >= MIN_PHONE_DIGITS) {
    const { data } = await supabase
      .from('contacts')
      .select(select)
      .is('deleted_at', null)
      .not('phone', 'is', null)
      .limit(50)
    if (data) {
      const phoneMatches = (data as ContactRow[]).filter(
        row => normalizePhone(row.phone) === inputPhone
      )
      addMatches(phoneMatches)
    }
  }

  if (input.company_id) {
    const searchFirst = input.first_name.trim().slice(0, 20).replace(/[%_]/g, '')
    const searchLast = input.last_name.trim().slice(0, 20).replace(/[%_]/g, '')
    const { data } = await supabase
      .from('contacts')
      .select(select)
      .is('deleted_at', null)
      .eq('company_id', input.company_id)
      .or(`first_name.ilike.%${searchFirst}%,last_name.ilike.%${searchLast}%`)
      .limit(20)
    if (data) addMatches(data as ContactRow[])
  }

  return matches.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === 'strong' ? -1 : 1
    return `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`, 'es')
  })
}
