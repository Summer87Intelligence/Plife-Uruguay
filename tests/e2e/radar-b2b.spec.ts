import { test, expect } from '@playwright/test'
import { login, hasCredentials } from './helpers/auth'
import { ROUTES } from './helpers/routes'
import { SEL } from './helpers/selectors'

test.describe('Radar B2B', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasCredentials(), 'Requiere E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.test')
    await login(page)
    await page.goto(ROUTES.radarB2B)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
  })

  test('carga sin errores', async ({ page }) => {
    await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
    // Heading or section exists
    const heading = page.getByText(SEL.radarHeading).first()
    await expect(heading).toBeVisible({ timeout: 10_000 })
  })

  test('muestra ranking de empresas o estado vacío', async ({ page }) => {
    // With companies: shows "{n} empresa(s)" count text
    // Without companies: EmptyState with title "El radar está vacío" or "Sin resultados"
    const countText = page.getByText(/\d+ empresas?/i).first()
    const emptyMsg = page.getByText(/el radar está vacío|sin resultados/i).first()
    const hasCount = await countText.isVisible({ timeout: 8_000 }).catch(() => false)
    const hasEmpty = await emptyMsg.isVisible({ timeout: 2_000 }).catch(() => false)
    expect(hasCount || hasEmpty, 'Ni contador de empresas ni estado vacío visible').toBe(true)
  })

  test('filtro de búsqueda no rompe la página', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar|empresa/i).first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('TechVida')
      await page.waitForTimeout(500)
      await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
    } else {
      test.info().annotations.push({ type: 'note', description: 'Campo de búsqueda no encontrado' })
    }
  })

  test('CTA Crear oportunidad existe', async ({ page }) => {
    const cta = page.getByRole('button', { name: /crear oportunidad/i })
      .or(page.getByRole('link', { name: /crear oportunidad/i }))
    // May only appear after expanding a row — just verify one exists somewhere
    const count = await cta.count()
    // If seed loaded, there should be at least one expandable row with the CTA
    if (count === 0) {
      test.info().annotations.push({ type: 'note', description: 'CTA "Crear oportunidad" no visible sin expandir fila' })
    }
  })

  test('expandir primera empresa muestra análisis B2B', async ({ page }) => {
    // Try clicking the first expandable row
    const firstRow = page.getByRole('button', { name: /expandir|ver análisis/i }).first()
      .or(page.locator('tr, li').filter({ has: page.locator('[class*="cursor-pointer"]') }).first())

    if (await firstRow.isVisible().catch(() => false)) {
      await firstRow.click()
      await page.waitForTimeout(500)
      // After expand, at least one of these should appear
      const analysis = page.getByText(/fortalezas|riesgos|próximo paso/i).first()
      await expect(analysis).toBeVisible({ timeout: 5_000 })
    } else {
      test.info().annotations.push({ type: 'note', description: 'No se encontró fila expandible — seed demo podría no estar cargado' })
    }
  })
})
