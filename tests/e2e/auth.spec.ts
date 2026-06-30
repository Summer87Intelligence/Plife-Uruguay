import { test, expect } from '@playwright/test'
import { login, logout, expectOnLogin, hasCredentials } from './helpers/auth'
import { ROUTES } from './helpers/routes'
import { SEL } from './helpers/selectors'

test.describe('Auth', () => {
  test('sin sesión: /app/hoy redirige a /login sin loop', async ({ page }) => {
    await page.goto(ROUTES.hoy)
    await expectOnLogin(page)
    // Verify no redirect loop (URL stays at /login)
    await page.waitForTimeout(1000)
    await expect(page).toHaveURL(/login/)
    await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
  })

  test('sin sesión: /app/admin redirige a /login', async ({ page }) => {
    await page.goto(ROUTES.admin)
    await expect(page).toHaveURL(/login/, { timeout: 10_000 })
  })

  test('login incorrecto muestra error', async ({ page }) => {
    await page.goto(ROUTES.login)
    await page.getByLabel(SEL.emailInput).fill('noexiste@plife.uy')
    await page.getByLabel(SEL.passwordInput).fill('contraseñaWrong123')
    await page.getByRole('button', { name: /ingresar/i }).click()
    await expect(page.getByText(/email o contraseña incorrectos/i)).toBeVisible({ timeout: 8_000 })
    await expect(page).toHaveURL(/login/)
  })

  test('login válido: accede a /app/hoy', async ({ page }) => {
    test.skip(!hasCredentials(), 'Requiere E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.test')
    await login(page)
    await expect(page).toHaveURL(/app\/hoy/)
    // Should show some nav content
    await expect(page.locator('nav, aside').first()).toBeVisible()
  })

  test('logout: vuelve a /login', async ({ page }) => {
    test.skip(!hasCredentials(), 'Requiere E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.test')
    await login(page)
    await logout(page)
    await expectOnLogin(page)
  })

  test('refresh F5 en /app/hoy no rompe ni redirige en loop', async ({ page }) => {
    test.skip(!hasCredentials(), 'Requiere E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.test')
    await login(page)
    await page.reload()
    await expect(page).toHaveURL(/app\/hoy/, { timeout: 15_000 })
    await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
    await expect(page.getByText(SEL.tooManyRedirects)).not.toBeVisible()
  })

  test.skip('usuario sin profile muestra mensaje y no hace loop', async () => {
    // Requiere fixture de usuario sin profile — no crear usuarios desde tests.
    // Preparar manualmente: usuario en auth.users sin fila en profiles.
    // Validar: /login?error=missing_profile visible, mensaje "Cuenta sin perfil".
  })
})
