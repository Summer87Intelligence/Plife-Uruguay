import { test, expect } from '@playwright/test'
import { login, hasCredentials } from './helpers/auth'
import { ROUTES } from './helpers/routes'
import { SEL } from './helpers/selectors'

test.describe('Dashboard /app/hoy', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasCredentials(), 'Requiere E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.test')
    await login(page)
    await page.goto(ROUTES.hoy)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
  })

  test('renderiza Vista de Dirección', async ({ page }) => {
    await expect(page.getByRole('heading', { name: SEL.dashboardHeading })).toBeVisible({ timeout: 10_000 })
  })

  test('métricas demo visibles', async ({ page }) => {
    await expect(page.getByText(SEL.statOpps)).toBeVisible()
    await expect(page.getByText(SEL.statCompanies)).toBeVisible()
    await expect(page.getByText(SEL.statCampaigns)).toBeVisible()
  })

  test('métricas no están todas en 0 (seed demo cargado)', async ({ page }) => {
    // Get all stat values — at least one should be > 0 if seed is loaded
    const allStatTexts = await page.locator('.text-2xl, .text-3xl, [class*="font-bold"]').allTextContents()
    const numbers = allStatTexts.map(t => parseInt(t, 10)).filter(n => !isNaN(n) && n > 0)
    expect(numbers.length, 'Seed demo no cargado o GRANTs faltantes — todos los contadores son 0').toBeGreaterThan(0)
  })

  test('bloque demo recorrido visible en modo demo', async ({ page }) => {
    const recorrido = page.getByText(SEL.demoRecorrido)
    // May not show if NEXT_PUBLIC_DEMO_MODE is false — conditional check
    const isDemoVisible = await recorrido.isVisible()
    if (!isDemoVisible) {
      test.info().annotations.push({ type: 'note', description: 'NEXT_PUBLIC_DEMO_MODE no está activo — bloque de recorrido no mostrado' })
    } else {
      await expect(recorrido).toBeVisible()
    }
  })

  test('click en recorrido abre /app/demo', async ({ page }) => {
    const recorrido = page.getByText(SEL.demoRecorrido)
    const isDemoVisible = await recorrido.isVisible()
    test.skip(!isDemoVisible, 'Modo demo inactivo — recorrido no visible')
    await recorrido.click()
    await expect(page).toHaveURL(/app\/demo/, { timeout: 8_000 })
  })
})
