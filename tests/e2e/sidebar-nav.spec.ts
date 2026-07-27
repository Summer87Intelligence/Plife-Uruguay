import { test, expect } from '@playwright/test'
import { login, hasCredentials } from './helpers/auth'

// FASE 15G — Menú principal simplificado (foco Lead-first + Propuestas + Motores).
const SIDEBAR_LINKS = [
  'PLIFE Hoy',
  'Leads',
  'Pipeline',
  'Propuestas',
  'Campañas',
  'Motores',
  'Dirección',
  'Admin',
] as const

// Secciones ocultadas del menú principal (rutas conservadas, accesibles por URL).
const HIDDEN_FROM_SIDEBAR = [
  'Contactos',
  'Empresas',
  'Oportunidades',
  'Radar B2B',
  'Copiloto',
  'Conocimiento',
  'Academia',
] as const

test.describe('FASE 13G/13H — smoke sidebar', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasCredentials(), 'Requiere credenciales E2E')
    await login(page)
  })

  test('sidebar: links principales visibles sin ambigüedad', async ({ page }) => {
    await page.goto('/app/hoy')
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    const sidebar = page.getByTestId('app-sidebar-nav')
    await expect(sidebar).toBeVisible()

    for (const label of SIDEBAR_LINKS) {
      await expect(sidebar.getByRole('link', { name: label, exact: true })).toBeVisible()
    }
  })

  test('sidebar: secciones simplificadas no aparecen en el menú', async ({ page }) => {
    await page.goto('/app/hoy')
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    const sidebar = page.getByTestId('app-sidebar-nav')
    await expect(sidebar).toBeVisible()

    for (const label of HIDDEN_FROM_SIDEBAR) {
      await expect(sidebar.getByRole('link', { name: label, exact: true })).toHaveCount(0)
    }
    // Compliance no debe reaparecer nunca.
    await expect(sidebar.getByRole('link', { name: 'Compliance', exact: true })).toHaveCount(0)
  })
})
