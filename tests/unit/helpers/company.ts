import type { Company } from '@/types/database'

export function makeCompany(overrides: Partial<Company> = {}): Company {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Empresa Test',
    industry: null,
    website: null,
    linkedin_url: null,
    instagram_url: null,
    location: null,
    estimated_size: null,
    estimated_employees: null,
    source: null,
    b2b_score: null,
    b2b_status: 'detectada',
    commercial_angle: null,
    ideal_contact: null,
    risk_notes: null,
    opportunity_detected: null,
    notes: null,
    assigned_to: null,
    campaign_id: null,
    ai_analysis: null,
    ai_analyzed_at: null,
    deleted_at: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    created_by: null,
    updated_by: null,
    ...overrides,
  }
}
