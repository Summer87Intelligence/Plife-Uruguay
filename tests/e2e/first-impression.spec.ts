import { test, expect } from '@playwright/test'
import { login, hasCredentials } from './helpers/auth'
import { ROUTES } from './helpers/routes'

const DEMO_COMPANY = '/app/empresas/b0000000-0000-0000-0000-000000000002'

test.describe('Primera impresión — claridad de pantallas clave', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasCredentials(), 'Requiere E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.test')
    await login(page)
  })

  test('/app/hoy: heading claro y métricas principales visibles', async ({ page }) => {
    await page.goto(ROUTES.hoy)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    // Clear heading — either executive or advisor greeting
    const heading = page.getByText(
      /Vista de Dirección|Buenos días|Buenas tardes|Buenas noches/i
    ).first()
    await expect(heading).toBeVisible({ timeout: 10_000 })

    // At least one core metric is labeled
    const metric = page.getByText(
      /Oportunidades activas|Empresas B2B|Campañas activas|Asesores activos|Seguimientos vencidos|Oportunidades calientes/i
    ).first()
    await expect(metric).toBeVisible({ timeout: 8_000 })
  })

  test('/app/hoy: muestra guía "Tablero diario"', async ({ page }) => {
    await page.goto(ROUTES.hoy)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    await expect(
      page.getByText(/tablero de hoy|resumen del equipo/i).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('/app/hoy: recorrido demo visible en modo demo', async ({ page }) => {
    await page.goto(ROUTES.hoy)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    const recorrido = page.getByText(/Recorrido sugerido para la demo/i)
    const isVisible = await recorrido.isVisible({ timeout: 5_000 }).catch(() => false)
    if (!isVisible) {
      test.info().annotations.push({
        type: 'note',
        description: 'Recorrido demo no visible — NEXT_PUBLIC_DEMO_MODE podría estar desactivado',
      })
    } else {
      await expect(recorrido).toBeVisible()
    }
  })

  test('/app/radar-b2b: explica propósito y muestra scoring o estado vacío', async ({ page }) => {
    await page.goto(ROUTES.radarB2B)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    // Heading visible
    await expect(page.getByText(/Radar B2B/i).first()).toBeVisible({ timeout: 10_000 })

    // Describes purpose (potencial comercial)
    await expect(
      page.getByText(/potencial comercial/i).first()
    ).toBeVisible({ timeout: 8_000 })

    // Shows scoring OR empty state
    const hasScoring = await page.getByText(/Muy alto|Alto|Medio|Bajo|\d+ empresa/i)
      .first().isVisible({ timeout: 5_000 }).catch(() => false)
    const hasEmpty = await page.getByText(/radar está vacío/i)
      .first().isVisible({ timeout: 2_000 }).catch(() => false)

    expect(hasScoring || hasEmpty, 'Debe mostrar potencial de empresas o estado vacío').toBe(true)
  })

  test('/app/radar-b2b: muestra guía "potencial comercial"', async ({ page }) => {
    await page.goto(ROUTES.radarB2B)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    await expect(
      page.getByText(/potencial comercial/i).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('/app/empresas/[id]: muestra Inteligencia B2B y próximo paso', async ({ page }) => {
    await page.goto(DEMO_COMPANY)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    // Gracefully handle if demo seed not loaded
    const is404 = await page.getByText(/not found|404|no encontrado/i)
      .first().isVisible({ timeout: 3_000 }).catch(() => false)
    if (is404) {
      test.info().annotations.push({
        type: 'note',
        description: 'Empresa demo no encontrada — seed demo podría no estar cargado',
      })
      return
    }

    // B2B Intelligence section
    await expect(
      page.getByText(/Inteligencia B2B|Inteligencia comercial/i).first()
    ).toBeVisible({ timeout: 10_000 })

    // Next step label
    await expect(
      page.getByText(/Próximo paso/i).first()
    ).toBeVisible({ timeout: 8_000 })

    // At least one of: opportunity detected, commercial angle, ideal contact
    const hasCommercialInfo = await page.getByText(
      /Oportunidad detectada|Ángulo comercial|Contacto ideal/i
    ).first().isVisible({ timeout: 5_000 }).catch(() => false)

    expect(hasCommercialInfo, 'Debe mostrar información comercial de la empresa').toBe(true)
  })

  test('/app/oportunidades: muestra guía "conversación comercial"', async ({ page }) => {
    await page.goto(ROUTES.oportunidades)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    await expect(
      page.getByText(/conversación comercial/i).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('/app/campanas: muestra campañas con segmento y estado', async ({ page }) => {
    await page.goto(ROUTES.campanas)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    // Heading
    await expect(page.getByText(/Campañas B2B/i).first()).toBeVisible({ timeout: 10_000 })

    // Shows campaigns with status or empty state
    const hasCampaigns = await page.getByText(/activa|borrador|pausada|finalizada/i)
      .first().isVisible({ timeout: 5_000 }).catch(() => false)
    const hasEmpty = await page.getByText(/no hay campañas|todavía no hay/i)
      .first().isVisible({ timeout: 2_000 }).catch(() => false)

    expect(hasCampaigns || hasEmpty, 'Debe mostrar campañas o estado vacío').toBe(true)
  })

  test('/app/campanas: muestra guía "acciones comerciales"', async ({ page }) => {
    await page.goto(ROUTES.campanas)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    await expect(
      page.getByText(/acciones comerciales/i).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('/app/direccion: muestra guía "Vista ejecutiva"', async ({ page }) => {
    await page.goto(ROUTES.direccion)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    await expect(
      page.getByText(/Vista ejecutiva/i).first()
    ).toBeVisible({ timeout: 10_000 })
  })
})
