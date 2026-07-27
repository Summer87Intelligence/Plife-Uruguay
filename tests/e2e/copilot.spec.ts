import { test, expect } from '@playwright/test'
import { login, hasCredentials } from './helpers/auth'
import { ROUTES } from './helpers/routes'
import { SEL } from './helpers/selectors'

test.describe('Copiloto', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasCredentials(), 'Requiere E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.test')
    await login(page)
    await page.goto(ROUTES.copiloto)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
  })

  test('página carga sin error crítico', async ({ page }) => {
    await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
  })

  test('motores internos en modo determinístico: la página es usable sin crash', async ({ page }) => {
    // FASE 15B: sin proveedor externo, los motores operan en modo determinístico
    // interno. La página debe cargar y ofrecer el formulario, sin errores críticos.
    await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
    const form = page.locator('form, [role="form"], textarea').first()
    await expect(form).toBeVisible({ timeout: 8_000 })
  })

  test('el formulario permite ingresar texto', async ({ page }) => {
    const textarea = page.getByRole('textbox').first()
    await expect(textarea).toBeVisible({ timeout: 8_000 })
    await textarea.fill('Ayudame a redactar un mensaje de seguimiento para un cliente interesado en seguro de vida.')
    await expect(textarea).toHaveValue(/ayudame/i)
  })
})
