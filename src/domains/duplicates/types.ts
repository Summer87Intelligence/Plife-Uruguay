export type DuplicateSeverity = 'strong' | 'soft'

export interface CompanyDuplicateMatch {
  id: string
  name: string
  industry: string | null
  website: string | null
  linkedin_url: string | null
  reasons: string[]
  severity: DuplicateSeverity
}

export interface ContactDuplicateMatch {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  company_id: string | null
  company_name: string | null
  reasons: string[]
  severity: DuplicateSeverity
}
