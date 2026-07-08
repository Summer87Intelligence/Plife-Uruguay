import { test, expect } from '@playwright/test'
import { login, hasCredentials } from './helpers/auth'
import { ROUTES } from './helpers/routes'
import { SEL } from './helpers/selectors'

// FASE 15R / 15R-B — Smoke autenticado con base comercial limpia + registros de
// validación cargados en 15R (1 lead + 1 propuesta). No re-crea datos: verifica
// que aparezcan en las secciones y que no haya datos demo. La creación por UI se
// valida aparte; acá evitamos duplicar el lead/propuesta de validación.

const LEAD_TITLE = 'Lead inicial de validación'
const PROPOSAL_TITLE = 'Propuesta inicial de validación'
const DEMO_TOKENS = /\b(demo|mock|smoke|pérez qa|perez qa|seed)\b/i

test.describe('FASE 15R-B — smoke autenticado con base limpia', () => {
  // El dev server compila rutas on-demand: la primera visita a cada ruta puede
  // tardar. Damos margen para login + compilación sin usar waits ciegos.
  test.describe.configure({ timeout: 120_000 })

  test.skip(!hasCredentials(), 'Requiere E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.test')

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('login redirige a /app/hoy y muestra navegación', async ({ page }) => {
    await expect(page).toHaveURL(/app\/hoy/)
    await expect(page.locator('nav, aside').first()).toBeVisible()
    await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
  })

  test('la sesión persiste al navegar por las secciones principales', async ({ page }) => {
    for (const route of [ROUTES.leads, ROUTES.pipeline, ROUTES.propuestas, ROUTES.propuestasNueva]) {
      await page.goto(route)
      await expect(page).not.toHaveURL(/login/)
      await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
    }
  })

  test('el lead de validación aparece en Leads y Pipeline', async ({ page }) => {
    await page.goto(ROUTES.leads)
    await expect(page.getByText(LEAD_TITLE).first()).toBeVisible({ timeout: 15_000 })

    await page.goto(ROUTES.pipeline)
    await expect(page.getByText(LEAD_TITLE).first()).toBeVisible({ timeout: 15_000 })
  })

  test('la propuesta de validación aparece y su detalle abre', async ({ page }) => {
    await page.goto(ROUTES.propuestas)
    const proposalLink = page.getByText(PROPOSAL_TITLE).first()
    await expect(proposalLink).toBeVisible({ timeout: 15_000 })

    await proposalLink.click()
    await expect(page).toHaveURL(/\/app\/propuestas\/[0-9a-f-]{36}/, { timeout: 15_000 })
    await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
    await expect(page.getByText(PROPOSAL_TITLE).first()).toBeVisible({ timeout: 15_000 })
  })

  test('el formulario de nueva propuesta carga', async ({ page }) => {
    await page.goto(ROUTES.propuestasNueva)
    await expect(page.getByRole('heading', { name: /nueva propuesta/i })).toBeVisible({ timeout: 15_000 })
  })

  test('las secciones no muestran datos demo/seed', async ({ page }) => {
    for (const route of [ROUTES.hoy, ROUTES.leads, ROUTES.pipeline, ROUTES.propuestas]) {
      await page.goto(route)
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
      const body = await page.locator('body').innerText()
      expect(body, `Ruta ${route} contiene tokens demo`).not.toMatch(DEMO_TOKENS)
    }
  })
})
