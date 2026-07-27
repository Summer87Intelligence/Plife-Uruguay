import { test, expect } from '@playwright/test'
import { login, hasCredentials } from './helpers/auth'
import { ROUTES } from './helpers/routes'

test.describe('Ayuda contextual ��� orientación de uso por sección', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasCredentials(), 'Requiere E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.test')
    await login(page)
  })

  test('/app/empresas: muestra orientación de uso', async ({ page }) => {
    await page.goto(ROUTES.empresas)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    await expect(
      page.getByText(/Primero cargá empresas/i).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('/app/contactos: muestra orientación de uso', async ({ page }) => {
    await page.goto(ROUTES.contactos)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    await expect(
      page.getByText(/personas con las que habla el asesor/i).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('/app/oportunidades: muestra orientación de uso', async ({ page }) => {
    await page.goto(ROUTES.oportunidades)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    await expect(
      page.getByText(/conversación comercial concreta/i).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('/app/campanas: muestra orientación de uso', async ({ page }) => {
    await page.goto(ROUTES.campanas)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    await expect(
      page.getByText(/acciones comerciales por segmento/i).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('/app/radar-b2b: muestra orientación de uso', async ({ page }) => {
    await page.goto(ROUTES.radarB2B)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    await expect(
      page.getByText(/funciona mejor cuando hay empresas cargadas/i).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('/app/direccion: muestra orientación de uso', async ({ page }) => {
    await page.goto(ROUTES.direccion)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    await expect(
      page.getByText(/toma sentido cuando ya hay oportunidades/i).first()
    ).toBeVisible({ timeout: 10_000 })
  })
})
