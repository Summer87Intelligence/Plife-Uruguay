import { test, expect } from '@playwright/test'
import { login, hasCredentials } from './helpers/auth'

const SIDEBAR_LINKS = [
  'Contactos',
  'Empresas',
  'Oportunidades',
  'Campañas',
  'Motor IA',
  'Dirección',
  'Admin',
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
})
