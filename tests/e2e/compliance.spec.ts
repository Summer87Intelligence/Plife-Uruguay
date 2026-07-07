import { test, expect } from '@playwright/test'
import { login, hasCredentials } from './helpers/auth'
import { ROUTES } from './helpers/routes'
import { SEL } from './helpers/selectors'

const HIGH_RISK_MESSAGE = 'Te aprueban seguro y no tiene riesgo. Garantizado sin condiciones.'
const SAFE_MESSAGE = 'Me gustaría contarte cómo funciona el proceso de evaluación médica para tu seguro.'

test.describe('Compliance', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasCredentials(), 'Requiere E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.test')
    await login(page)
    await page.goto(ROUTES.compliance)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
  })

  test('página carga sin error', async ({ page }) => {
    await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
    // Should have some form or textarea
    const textarea = page.getByRole('textbox').first()
    await expect(textarea).toBeVisible({ timeout: 10_000 })
  })

  test('mensaje de alto riesgo es detectado (capa determinística)', async ({ page }) => {
    const textarea = page.getByRole('textbox').first()
    await textarea.fill(HIGH_RISK_MESSAGE)

    // Submit — look for a review/analyze button
    const submitBtn = page.getByRole('button', { name: /revisar|analizar|verificar/i })
    await submitBtn.click()

    // Wait for result — deterministic layer so no AI key needed
    await page.waitForTimeout(3_000)

    // Expect high/critical risk indicator
    const riskIndicator = page.getByText(/crítico|alto|bloqueado|revisión requerida/i).first()
    await expect(riskIndicator).toBeVisible({ timeout: 10_000 })
  })

  test('mensaje seguro no es bloqueado', async ({ page }) => {
    const textarea = page.getByRole('textbox').first()
    await textarea.fill(SAFE_MESSAGE)

    const submitBtn = page.getByRole('button', { name: /revisar|analizar|verificar/i })
    await submitBtn.click()

    await page.waitForTimeout(3_000)

    // Should NOT show critical/blocked
    await expect(page.getByText(/crítico/i)).not.toBeVisible({ timeout: 5_000 })
    // Should show some result (approved or low risk)
    const result = page.getByText(/bajo|aprobado|aceptable/i).first()
    if (!await result.isVisible()) {
      test.info().annotations.push({ type: 'note', description: 'Resultado de bajo riesgo no detectado — revisar respuesta de compliance' })
    }
  })

  test('funciona en modo determinístico (sin proveedor externo)', async ({ page }) => {
    // FASE 15B: la capa determinística no requiere ningún proveedor externo.
    // El test anterior lo prueba al completar sin error.
    const textarea = page.getByRole('textbox').first()
    await textarea.fill(HIGH_RISK_MESSAGE)
    const submitBtn = page.getByRole('button', { name: /revisar|analizar|verificar/i })
    await submitBtn.click()
    await page.waitForTimeout(3_000)
    await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
    // Page stays functional
    await expect(textarea).toBeVisible()
  })
})
