import { test, expect } from '@playwright/test'
import { login, hasCredentials } from './helpers/auth'
import { ROUTES } from './helpers/routes'
import { SEL } from './helpers/selectors'

test.describe('Copiloto IA', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasCredentials(), 'Requiere E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.test')
    await login(page)
    await page.goto(ROUTES.copiloto)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
  })

  test('página carga sin error crítico', async ({ page }) => {
    await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
  })

  test('sin OPENAI_API_KEY: muestra estado de IA no configurada', async ({ page }) => {
    // If AI is not configured, there should be a visible indicator
    const noAI = page.getByText(/IA no configurada|sin configurar|no hay API key|openai no configurad/i).first()
    const isNotConfigured = await noAI.isVisible().catch(() => false)

    if (isNotConfigured) {
      await expect(noAI).toBeVisible()
      // Page should still be usable — no crash
      await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
    } else {
      // AI is configured — validate the form is present
      test.info().annotations.push({ type: 'note', description: 'OPENAI_API_KEY configurada — copiloto en modo completo' })
      const form = page.locator('form, [role="form"], textarea').first()
      await expect(form).toBeVisible({ timeout: 5_000 })
    }
  })

  test('con IA configurada: formulario permite ingresar texto', async ({ page }) => {
    const noAI = page.getByText(/IA no configurada|sin configurar/i).first()
    const isNotConfigured = await noAI.isVisible().catch(() => false)
    test.skip(isNotConfigured, 'IA no configurada en este entorno')

    const textarea = page.getByRole('textbox').first()
    await expect(textarea).toBeVisible({ timeout: 8_000 })
    await textarea.fill('Ayudame a redactar un mensaje de seguimiento para un cliente interesado en seguro de vida.')
    await expect(textarea).toHaveValue(/ayudame/i)
  })
})
