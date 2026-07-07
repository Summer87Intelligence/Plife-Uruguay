import { describe, expect, it } from 'vitest'
import { suggestCampaignNextStep, campaignStatusHint } from '@/lib/campaign-operational'
import type { Campaign } from '@/types/database'

const base: Campaign = {
  id: '1',
  name: 'Test',
  type: 'general',
  status: 'activa',
  objective: 'Objetivo',
  target_segment: null,
  icp_description: null,
  initial_message: null,
  call_script: null,
  expected_objections: null,
  follow_up_sequence: null,
  start_date: null,
  end_date: null,
  total_targets: 0,
  total_contacted: 0,
  total_responses: 0,
  total_meetings: 0,
  total_converted: 0,
  responsible_id: null,
  deleted_at: null,
  created_at: '',
  updated_at: '',
  created_by: null,
}

describe('suggestCampaignNextStep', () => {
  it('suggests activation for borrador', () => {
    const step = suggestCampaignNextStep({ ...base, status: 'borrador' }, { companies: 0, opportunities: 0 })
    expect(step).toMatch(/activá la campaña/i)
  })

  it('suggests linking companies when active with none', () => {
    const step = suggestCampaignNextStep(base, { companies: 0, opportunities: 0 })
    expect(step).toMatch(/empresas/i)
  })

  it('suggests opportunities when companies exist but none linked', () => {
    const step = suggestCampaignNextStep(base, { companies: 3, opportunities: 0 })
    expect(step).toMatch(/oportunidades/i)
  })

  it('suggests follow-up when opportunities exist', () => {
    const step = suggestCampaignNextStep(base, { companies: 2, opportunities: 1 })
    expect(step).toMatch(/seguimiento/i)
  })
})

describe('campaignStatusHint', () => {
  it('returns hint for borrador', () => {
    expect(campaignStatusHint('borrador')).toMatch(/borrador/i)
  })

  it('returns null for activa', () => {
    expect(campaignStatusHint('activa')).toBeNull()
  })
})
