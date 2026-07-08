import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ENGINE_STATUS_LABELS } from '@/domains/intelligence-engines/constants'

const SRC = join(process.cwd(), 'src')

function readSrc(relPath: string): string {
  return readFileSync(join(SRC, relPath), 'utf8')
}

describe('UI anti-demo (FASE 15P)', () => {
  it('engine status labels avoid simulado in user-facing copy', () => {
    expect(ENGINE_STATUS_LABELS.available_mock).toBe('Disponible')
    expect(ENGINE_STATUS_LABELS.conceptual).toBe('Pendiente de salida operativa')
    expect(Object.values(ENGINE_STATUS_LABELS).join(' ').toLowerCase()).not.toContain('simulado')
  })

  it('lead detail view does not render timeline mock', () => {
    const source = readSrc('components/leads/lead-detail-view.tsx')
    expect(source).not.toContain('LeadTimelineMock')
    expect(source).not.toContain('Timeline (demo)')
  })

  it('lead actions panel does not show convertir a oportunidad button', () => {
    const source = readSrc('components/leads/lead-actions-panel.tsx')
    expect(source).not.toContain('Convertir a oportunidad')
  })

  it('advisor dashboard avoids hidden-route CTAs', () => {
    const source = readSrc('app/app/hoy/advisor-dashboard.tsx')
    expect(source).not.toMatch(/\/app\/oportunidades/)
    expect(source).not.toMatch(/\/app\/contactos/)
    expect(source).not.toMatch(/\/app\/empresas/)
    expect(source).not.toMatch(/\/app\/radar-b2b/)
    expect(source).not.toMatch(/\/app\/copiloto/)
  })

  it('sidebar does not inject recorrido demo link', () => {
    const source = readSrc('components/layout/app-sidebar.tsx')
    expect(source).not.toContain('Recorrido demo')
    expect(source).not.toContain("href: '/app/demo'")
  })
})
