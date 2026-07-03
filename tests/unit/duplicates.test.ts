import { describe, expect, it } from 'vitest'
import { findPotentialCompanyDuplicates } from '@/domains/duplicates/company-duplicate-check'
import { findPotentialContactDuplicates } from '@/domains/duplicates/contact-duplicate-check'
import {
  nameSimilarity,
  normalizeEmail,
  normalizePhone,
  normalizeText,
  normalizeWebsite,
} from '@/domains/duplicates/normalize'

describe('normalizeText', () => {
  it('lowercases, trims and removes accents', () => {
    expect(normalizeText('  Estudio García S.A.  ')).toBe('estudio garcia')
  })
})

describe('normalizeEmail', () => {
  it('lowercases and trims email', () => {
    expect(normalizeEmail('  Juan@Empresa.COM ')).toBe('juan@empresa.com')
  })
})

describe('normalizePhone', () => {
  it('keeps digits and strips Uruguay prefix', () => {
    expect(normalizePhone('+598 99 123 456')).toBe('99123456')
    expect(normalizePhone('099 123 456')).toBe('99123456')
  })
})

describe('normalizeWebsite', () => {
  it('extracts hostname without www', () => {
    expect(normalizeWebsite('https://www.Ejemplo.com/path')).toBe('ejemplo.com')
  })
})

describe('nameSimilarity', () => {
  it('returns 1 for identical normalized names', () => {
    expect(nameSimilarity('Estudio García', 'estudio garcia')).toBe(1)
  })

  it('returns high similarity for minor typos', () => {
    expect(nameSimilarity('Estudio Garcia', 'Estudio García')).toBeGreaterThanOrEqual(0.85)
  })
})

describe('findPotentialCompanyDuplicates', () => {
  const candidates = [
    {
      id: '1',
      name: 'Estudio Contable García',
      industry: 'estudio_contable',
      website: 'https://garcia.com.uy',
      linkedin_url: null,
      instagram_url: null,
    },
  ]

  it('detects similar company name', () => {
    const matches = findPotentialCompanyDuplicates(
      { name: 'Estudio Contable Garcia' },
      candidates
    )
    expect(matches).toHaveLength(1)
    expect(matches[0].reasons).toContain('Nombre igual o casi igual')
  })

  it('detects same website domain', () => {
    const matches = findPotentialCompanyDuplicates(
      { name: 'Otra Empresa', website: 'http://www.garcia.com.uy' },
      candidates
    )
    expect(matches).toHaveLength(1)
    expect(matches[0].reasons).toContain('Mismo sitio web')
    expect(matches[0].severity).toBe('strong')
  })

  it('returns empty for unrelated company', () => {
    const matches = findPotentialCompanyDuplicates(
      { name: 'Agroexportadora del Sur' },
      candidates
    )
    expect(matches).toHaveLength(0)
  })
})

describe('findPotentialContactDuplicates', () => {
  const candidates = [
    {
      id: 'c1',
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan@empresa.com',
      phone: '099 123 456',
      company_id: 'co1',
      companies: { name: 'Estudio García' },
    },
  ]

  it('detects exact email match as strong', () => {
    const matches = findPotentialContactDuplicates(
      { first_name: 'Pedro', last_name: 'López', email: 'Juan@Empresa.COM' },
      candidates
    )
    expect(matches).toHaveLength(1)
    expect(matches[0].severity).toBe('strong')
    expect(matches[0].reasons).toContain('Mismo email')
  })

  it('detects same phone with different formatting', () => {
    const matches = findPotentialContactDuplicates(
      { first_name: 'Ana', last_name: 'Ruiz', phone: '+59899123456' },
      candidates
    )
    expect(matches).toHaveLength(1)
    expect(matches[0].reasons).toContain('Mismo teléfono')
  })

  it('detects similar name in same company as soft', () => {
    const matches = findPotentialContactDuplicates(
      { first_name: 'Juan', last_name: 'Perez', company_id: 'co1' },
      candidates
    )
    expect(matches).toHaveLength(1)
    expect(matches[0].severity).toBe('soft')
  })
})
