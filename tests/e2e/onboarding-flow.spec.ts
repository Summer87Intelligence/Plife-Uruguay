import { test, expect } from '@playwright/test'
import { login, hasCredentials } from './helpers/auth'
import { ROUTES } from './helpers/routes'

test.describe('Onboarding — flujo de primeros pasos', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasCredentials(), 'Requiere E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.test')
    await login(page)
  })

  test('1. /app/hoy muestra tarjeta "¿Por dónde empiezo?"', async ({ page }) => {
    await page.goto(ROUTES.hoy)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    await expect(
      page.getByText('¿Por dónde empiezo?').first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('2. Los 4 pasos del flujo operativo están visibles', async ({ page }) => {
    await page.goto(ROUTES.hoy)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    await expect(page.getByText('Crear una empresa').first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Agregar un contacto').first()).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText('Crear una oportunidad').first()).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText('Crear o revisar campañas').first()).toBeVisible({ timeout: 8_000 })
  })

  test('3. Click en "Crear empresa" navega a /app/empresas', async ({ page }) => {
    await page.goto(ROUTES.hoy)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    const link = page.getByRole('link', { name: /Crear empresa/i }).first()
    await expect(link).toBeVisible({ timeout: 10_000 })
    await link.click()
    await expect(page).toHaveURL(/app\/empresas/, { timeout: 10_000 })
  })

  test('4. Click en "Agregar contacto" navega a /app/contactos', async ({ page }) => {
    await page.goto(ROUTES.hoy)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    const link = page.getByRole('link', { name: /Agregar contacto/i }).first()
    await expect(link).toBeVisible({ timeout: 10_000 })
    await link.click()
    await expect(page).toHaveURL(/app\/contactos/, { timeout: 10_000 })
  })

  test('5. Click en "Crear oportunidad" navega a /app/oportunidades', async ({ page }) => {
    await page.goto(ROUTES.hoy)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    const link = page.getByRole('link', { name: /Crear oportunidad/i }).first()
    await expect(link).toBeVisible({ timeout: 10_000 })
    await link.click()
    await expect(page).toHaveURL(/app\/oportunidades/, { timeout: 10_000 })
  })

})
