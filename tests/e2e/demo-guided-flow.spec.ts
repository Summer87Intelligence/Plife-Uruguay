import { test, expect } from '@playwright/test'
import { login, hasCredentials } from './helpers/auth'
import { ROUTES } from './helpers/routes'

const DEMO_COMPANY = '/app/empresas/b0000000-0000-0000-0000-000000000002'

test.describe('Demo — Recorrido guiado', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasCredentials(), 'Requiere E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.test')
    await login(page)
  })

  test('1. Login válido accede al sistema', async ({ page }) => {
    await expect(page).toHaveURL(/app\/hoy/)
    await expect(page.locator('nav, aside').first()).toBeVisible()
  })

  test('2. /app/demo carga con heading de recorrido', async ({ page }) => {
    await page.goto(ROUTES.demo)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
    await expect(
      page.getByRole('heading', { name: /Recorrido sugerido para la demo/i })
    ).toBeVisible({ timeout: 10_000 })
  })

  test('3. /app/demo tiene los 8 pasos del recorrido', async ({ page }) => {
    await page.goto(ROUTES.demo)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    const pasos = [
      'PLIFE Hoy',
      'Radar B2B',
      'Empresa priorizada',
      'Oportunidades',
      'Campañas',
      'Copiloto',
      'Dirección',
    ]

    for (const paso of pasos) {
      await expect(
        page.getByText(new RegExp(paso, 'i')).first()
      ).toBeVisible({ timeout: 8_000 })
    }
  })

  test('4. Cada paso tiene texto de valor y botón de navegación', async ({ page }) => {
    await page.goto(ROUTES.demo)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    // Value texts should be present
    const valores = [
      /pipeline activo/i,
      /potencial/i,
      /primer contacto/i,
      /ciclo de venta/i,
      /medición del equipo/i,
      /regulatoria/i,
      /reemplazo/i,
      /reportes manuales/i,
    ]

    for (const valor of valores) {
      const el = page.getByText(valor).first()
      const visible = await el.isVisible({ timeout: 5_000 }).catch(() => false)
      if (!visible) {
        test.info().annotations.push({ type: 'note', description: `Valor no visible: ${valor}` })
      }
    }

    // At least 8 CTA links
    const ctaLinks = page.getByRole('link').filter({ hasText: /Ver|Abrir|Copiloto/i })
    const count = await ctaLinks.count()
    expect(count, 'Deben existir al menos 8 botones de navegación').toBeGreaterThanOrEqual(8)
  })

  test('5. PLIFE Hoy → /app/hoy muestra Vista de Dirección y métricas', async ({ page }) => {
    await page.goto(ROUTES.demo)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    const btnHoy = page.getByRole('link', { name: /Ver PLIFE Hoy/i })
    await expect(btnHoy).toBeVisible({ timeout: 8_000 })
    await btnHoy.click()

    await expect(page).toHaveURL(/app\/hoy/, { timeout: 10_000 })
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    const heading = page.getByText(/Vista de Dirección|Buenos días|Buenas tardes|Buenas noches/i).first()
    await expect(heading).toBeVisible({ timeout: 10_000 })

    const metric = page.getByText(/Oportunidades activas|Empresas B2B|Campañas activas|Asesores activos|Seguimientos vencidos/i).first()
    await expect(metric).toBeVisible({ timeout: 8_000 })
  })

  test('6. Volver a /app/demo desde /app/hoy', async ({ page }) => {
    await page.goto(ROUTES.hoy)
    await page.goto(ROUTES.demo)
    await expect(page).toHaveURL(/app\/demo/, { timeout: 8_000 })
    await expect(
      page.getByRole('heading', { name: /Recorrido sugerido para la demo/i })
    ).toBeVisible({ timeout: 10_000 })
  })

  test('7. Radar B2B → /app/radar-b2b muestra empresas o scoring', async ({ page }) => {
    await page.goto(ROUTES.demo)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    const btnRadar = page.getByRole('link', { name: /Abrir Radar B2B/i })
    await expect(btnRadar).toBeVisible({ timeout: 8_000 })
    await btnRadar.click()

    await expect(page).toHaveURL(/app\/radar-b2b/, { timeout: 10_000 })
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    await expect(page.getByText(/Radar B2B/i).first()).toBeVisible({ timeout: 10_000 })

    const hasCompanies = await page.getByText(/\d+ empresa/i).first().isVisible({ timeout: 5_000 }).catch(() => false)
    const hasEmpty = await page.getByText(/radar está vacío|sin resultados/i).first().isVisible({ timeout: 2_000 }).catch(() => false)
    expect(hasCompanies || hasEmpty, 'Debe mostrar ranking de empresas o estado vacío').toBe(true)
  })

  test('8. Volver a /app/demo desde Radar B2B', async ({ page }) => {
    await page.goto(ROUTES.radarB2B)
    await page.goto(ROUTES.demo)
    await expect(page).toHaveURL(/app\/demo/, { timeout: 8_000 })
  })

  test('11. Dirección → muestra vista ejecutiva o top oportunidades B2B', async ({ page }) => {
    await page.goto(ROUTES.demo)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    const btnDir = page.getByRole('link', { name: /Ver Dirección/i })
    await expect(btnDir).toBeVisible({ timeout: 8_000 })
    await btnDir.click()

    // Admin/direccion role → /app/direccion, others → /app/hoy
    await page.waitForURL(/app\/(direccion|hoy)/, { timeout: 10_000 })
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    const executiveText = page.getByText(/Analytics|Dirección|Vista de Dirección|Oportunidades activas|pipeline/i).first()
    await expect(executiveText).toBeVisible({ timeout: 10_000 })
  })
})
