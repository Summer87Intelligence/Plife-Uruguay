import { test, expect } from '@playwright/test'
import { login, hasCredentials } from './helpers/auth'
import { ROUTES } from './helpers/routes'
import { SEL } from './helpers/selectors'

const ROUTE_LIST = [
  { path: ROUTES.hoy,           label: 'Dashboard /app/hoy' },
  { path: ROUTES.demo,          label: '/app/demo' },
  { path: ROUTES.radarB2B,      label: '/app/radar-b2b' },
  { path: ROUTES.empresas,      label: '/app/empresas' },
  { path: ROUTES.contactos,     label: '/app/contactos' },
  { path: ROUTES.oportunidades,  label: '/app/oportunidades' },
  { path: ROUTES.campanas,       label: '/app/campanas' },
  { path: ROUTES.copiloto,       label: '/app/copiloto' },
  { path: ROUTES.conocimiento,   label: '/app/conocimiento' },
  { path: ROUTES.propuestas,     label: '/app/propuestas' },
  { path: ROUTES.propuestasNueva, label: '/app/propuestas/nueva' },
  { path: ROUTES.direccion,      label: '/app/direccion' },
  { path: ROUTES.admin,          label: '/app/admin' },
  { path: ROUTES.adminSystem,    label: '/app/admin/system' },
] as const

test.describe('Smoke — todas las rutas', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasCredentials(), 'Requiere E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.test')
    await login(page)
  })

  for (const { path, label } of ROUTE_LIST) {
    test(`${label} carga sin 500 ni errores críticos`, async ({ page }) => {
      const responses: number[] = []
      page.on('response', r => {
        if (r.url().includes(path)) responses.push(r.status())
      })

      await page.goto(path)
      // Wait for page to settle
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

      await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
      await expect(page.getByText(SEL.missingProfile)).not.toBeVisible()
      // Page must not have been redirected back to login (may redirect to /app/hoy for role-restricted routes)
      await expect(page).not.toHaveURL(/login/)
    })

    test(`${label} soporta reload sin error`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
      await page.reload()
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
      await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
    })
  }
})
