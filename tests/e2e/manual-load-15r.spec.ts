import { test, expect } from '@playwright/test'
import { login, hasCredentials } from './helpers/auth'

const LEAD_TITLE = 'Lead inicial de validación'

test.describe('FASE 15R — carga manual mínima', () => {
  test.skip(!hasCredentials(), 'Requiere E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.test')

  test('crear lead y propuesta desde UI', async ({ page }) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const followUpDate = tomorrow.toISOString().slice(0, 10)

    await login(page)

    await page.goto('/app/leads/new')
    await page.getByLabel('Título *').fill(LEAD_TITLE)
    await page.getByLabel('Interés').fill('protección familiar')
    await page.getByLabel('Próximo paso').fill('Contactar para validar necesidad')
    await page.getByLabel('Fecha de seguimiento').fill(followUpDate)
    await page.getByRole('button', { name: 'Crear lead' }).click()

    await expect(page.getByText('Lead registrado correctamente')).toBeVisible({ timeout: 15_000 })

    await page.goto('/app/leads')
    await expect(page.getByText(LEAD_TITLE)).toBeVisible()

    await page.goto('/app/pipeline')
    await expect(page.getByText(LEAD_TITLE)).toBeVisible()

    await page.goto('/app/hoy')
    await expect(page.getByText(LEAD_TITLE)).toBeVisible()

    await page.getByText(LEAD_TITLE).click()
    await page.getByRole('link', { name: /Crear propuesta desde este lead/i }).click()

    await expect(page).toHaveURL(/\/app\/propuestas\/nueva/)
    await page.getByLabel('Título').fill('Propuesta inicial de validación')
    await page.getByLabel('Contexto').fill('Validación funcional post-limpieza de base dev.')
    await page.getByRole('button', { name: /Generar borrador/i }).click()

    await expect(page.getByText('Borrador generado')).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: /Guardar propuesta/i }).click()
    await expect(page.getByText('Propuesta guardada')).toBeVisible({ timeout: 15_000 })

    await page.goto('/app/propuestas')
    await expect(page.getByText('Propuesta inicial de validación')).toBeVisible()
  })
})
