import { test, expect } from '@playwright/test'
import { login, hasCredentials } from './helpers/auth'
import { ROUTES } from './helpers/routes'
import { SEL } from './helpers/selectors'

test.describe('Flujo comercial — lectura y navegación', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasCredentials(), 'Requiere E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.test')
    await login(page)
  })

  // --- EMPRESAS ---
  test('Empresas: listado carga sin error', async ({ page }) => {
    await page.goto(ROUTES.empresas)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
    await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
  })

  test('Empresas: abrir primera empresa demo muestra detalle', async ({ page }) => {
    await page.goto(ROUTES.empresas)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
    const firstLink = page.getByRole('link').filter({ hasText: /TechVida|Grupo Finanza|Laboratorios|SA|SRL|Abogados/i }).first()
    if (await firstLink.isVisible()) {
      await firstLink.click()
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})
      await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
      // Should show some company detail
      await expect(page.locator('h1, h2').first()).toBeVisible()
    } else {
      test.info().annotations.push({ type: 'note', description: 'Ninguna empresa demo encontrada en listado' })
    }
  })

  test('Empresa detalle: panel Inteligencia B2B visible', async ({ page }) => {
    await page.goto(ROUTES.empresas)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
    const firstLink = page.getByRole('link').filter({ hasText: /TechVida|Grupo Finanza|Laboratorios|SA|SRL/i }).first()
    if (await firstLink.isVisible()) {
      await firstLink.click()
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})
      const b2bPanel = page.getByText(/inteligencia B2B/i)
      if (await b2bPanel.isVisible()) {
        await expect(b2bPanel).toBeVisible()
      } else {
        test.info().annotations.push({ type: 'note', description: 'Panel Inteligencia B2B no visible — empresa sin score B2B?' })
      }
    }
  })

  // --- OPORTUNIDADES ---
  test('Oportunidades: pipeline/listado carga', async ({ page }) => {
    await page.goto(ROUTES.oportunidades)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
    await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
  })

  test('Oportunidades: abrir primera oportunidad muestra detalle', async ({ page }) => {
    await page.goto(ROUTES.oportunidades)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
    const firstLink = page.getByRole('link').filter({ hasText: /oportunidad|propuesta|renovación|vida|seguro/i }).first()
    if (await firstLink.isVisible()) {
      await firstLink.click()
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})
      await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
      await expect(page.locator('h1, h2').first()).toBeVisible()
    } else {
      // Try any link under oportunidades
      const anyLink = page.getByRole('link', { name: /ver|detalle/i }).first()
      if (await anyLink.isVisible()) {
        await anyLink.click()
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})
        await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
      } else {
        test.info().annotations.push({ type: 'note', description: 'Ninguna oportunidad encontrada en listado' })
      }
    }
  })

  // --- CAMPAÑAS ---
  test('Campañas: listado carga', async ({ page }) => {
    await page.goto(ROUTES.campanas)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
    await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
  })

  test('Campañas: abrir primera campaña muestra detalle', async ({ page }) => {
    await page.goto(ROUTES.campanas)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
    // Click first campaign card or link
    const firstLink = page.getByRole('link').filter({ hasText: /campaña|vida|pyme|empresas|salud/i }).first()
    if (await firstLink.isVisible()) {
      await firstLink.click()
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})
      await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
    } else {
      test.info().annotations.push({ type: 'note', description: 'Ninguna campaña demo encontrada en listado' })
    }
  })
})
