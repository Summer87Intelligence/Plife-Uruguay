import { describe, expect, it } from 'vitest'
import { normalizeText } from '@/domains/duplicates/normalize'
import { InsurerSchema } from '@/domains/insurers/validation'
import { InsuranceBranchSchema } from '@/domains/insurance-branches/validation'

// Gestión de Pólizas — Bloque Técnico 1 (catálogos de Aseguradoras y Ramos).
// Sin Supabase: solo normalización y validación pura, siguiendo el patrón de
// tests/unit/duplicates.test.ts y tests/unit/proposals-persistence.test.ts.

describe('normalizeText — valores usados en el seed de la migración', () => {
  it('coincide con normalized_name de los seeds de insurers', () => {
    expect(normalizeText('BSE')).toBe('bse')
    expect(normalizeText('Porto Seguro')).toBe('porto seguro')
    expect(normalizeText('Mapfre')).toBe('mapfre')
    expect(normalizeText('SURA')).toBe('sura')
  })

  it('coincide con normalized_name de los seeds de insurance_branches', () => {
    expect(normalizeText('Vehículos')).toBe('vehiculos')
    expect(normalizeText('Responsabilidad civil')).toBe('responsabilidad civil')
    expect(normalizeText('Accidentes de trabajo')).toBe('accidentes de trabajo')
    expect(normalizeText('Vida')).toBe('vida')
    expect(normalizeText('Incendio')).toBe('incendio')
    expect(normalizeText('Transporte')).toBe('transporte')
    expect(normalizeText('Hogar')).toBe('hogar')
    expect(normalizeText('Comercio')).toBe('comercio')
  })

  it('detecta como duplicado un nombre con distinto casing/acentos', () => {
    expect(normalizeText('  bse  ')).toBe(normalizeText('BSE'))
    expect(normalizeText('vehiculos')).toBe(normalizeText('Vehículos'))
  })
})

describe('InsurerSchema', () => {
  it('rechaza nombre vacío', () => {
    expect(InsurerSchema.safeParse({ name: '' }).success).toBe(false)
    expect(InsurerSchema.safeParse({ name: '   ' }).success).toBe(false)
  })

  it('acepta y recorta espacios de un nombre válido', () => {
    const parsed = InsurerSchema.safeParse({ name: '  Porto Seguro  ' })
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data.name).toBe('Porto Seguro')
  })
})

describe('InsuranceBranchSchema', () => {
  it('rechaza nombre vacío', () => {
    expect(InsuranceBranchSchema.safeParse({ name: '' }).success).toBe(false)
  })

  it('acepta un nombre válido', () => {
    expect(InsuranceBranchSchema.safeParse({ name: 'Vehículos' }).success).toBe(true)
  })
})
