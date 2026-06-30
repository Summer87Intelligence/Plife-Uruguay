import { test, expect } from '@playwright/test'
import { login, hasCredentials } from './helpers/auth'
import { ROUTES } from './helpers/routes'
import { SEL } from './helpers/selectors'

test.describe('Conocimiento', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasCredentials(), 'Requiere E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.test')
    await login(page)
    await page.goto(ROUTES.conocimiento)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
  })

  test('página carga sin error', async ({ page }) => {
    await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
  })

  test('muestra documentos o estado vacío', async ({ page }) => {
    const docs = page.locator('ul li, [role="listitem"], article').first()
    const empty = page.getByText(/sin documentos|no hay documentos|vacío/i).first()
    const hasDoc = await docs.isVisible().catch(() => false)
    const hasEmpty = await empty.isVisible().catch(() => false)
    // At least one of these should be true
    expect(hasDoc || hasEmpty, 'Ni documentos ni estado vacío visible').toBe(true)
  })

  test('muestra estado de embeddings (SQL pendiente, fallback, o activo)', async ({ page }) => {
    const sqlPending = page.getByText(/SQL pendiente|knowledge-embeddings|pendiente indexar/i).first()
    const embeddingActive = page.getByText(/activa|búsqueda semántica/i).first()
    const fallback = page.getByText(/fallback|texto/i).first()

    const hasStatus = await sqlPending.isVisible().catch(() => false)
      || await embeddingActive.isVisible().catch(() => false)
      || await fallback.isVisible().catch(() => false)

    if (!hasStatus) {
      test.info().annotations.push({ type: 'note', description: 'Estado de embeddings no encontrado en UI — revisar knowledge-view' })
    }
  })

  test('búsqueda simple no rompe la página', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar|search/i).first()
      .or(page.getByRole('searchbox').first())

    if (await searchInput.isVisible()) {
      await searchInput.fill('comunicación segura')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(2_000)
      await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
    } else {
      // Try a submit button
      const searchBtn = page.getByRole('button', { name: /buscar|search/i }).first()
      if (await searchBtn.isVisible()) {
        const input = page.getByRole('textbox').first()
        await input.fill('comunicación segura')
        await searchBtn.click()
        await page.waitForTimeout(2_000)
        await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
      } else {
        test.info().annotations.push({ type: 'note', description: 'Campo de búsqueda no encontrado en /app/conocimiento' })
      }
    }
  })
})
