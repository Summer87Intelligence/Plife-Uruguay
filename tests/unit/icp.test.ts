import { describe, expect, it } from 'vitest'
import { detectICP } from '@/lib/b2b/icp'

describe('detectICP', () => {
  it('maps accounting rubro to estudios_contables', () => {
    expect(detectICP('estudio contable')).toBe('estudios_contables')
    expect(detectICP('contador')).toBe('estudios_contables')
  })

  it('maps legal rubro to estudios_juridicos', () => {
    expect(detectICP('servicios jurídicos')).toBe('estudios_juridicos')
  })

  it('maps software rubro to empresas_tech', () => {
    expect(detectICP('software')).toBe('empresas_tech')
  })

  it('maps construction rubro to constructoras', () => {
    expect(detectICP('construcción')).toBe('constructoras')
  })

  it('maps health rubro to clinicas', () => {
    expect(detectICP('salud')).toBe('clinicas')
  })

  it('maps family business / pyme signals to socios_directores or duenos_pymes', () => {
    const family = detectICP('empresa familiar pyme')
    expect(['socios_directores', 'duenos_pymes']).toContain(family)
  })

  it('returns duenos_pymes fallback for empty or ambiguous input without throwing', () => {
    expect(detectICP(null)).toBe('duenos_pymes')
    expect(detectICP('')).toBe('duenos_pymes')
    expect(detectICP('rubro desconocido xyz')).toBe('duenos_pymes')
  })
})
