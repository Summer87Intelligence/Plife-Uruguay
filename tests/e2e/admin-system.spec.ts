import { test, expect } from '@playwright/test'
import { login, hasCredentials } from './helpers/auth'
import { ROUTES } from './helpers/routes'
import { SEL } from './helpers/selectors'

test.describe('Admin System /app/admin/system', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasCredentials(), 'Requiere E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.test')
    await login(page)
    await page.goto(ROUTES.adminSystem)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
  })

  test('carga sin error', async ({ page }) => {
    await expect(page.getByText(SEL.internalServerError)).not.toBeVisible()
    await expect(page.getByRole('heading', { name: SEL.systemHeading })).toBeVisible({ timeout: 10_000 })
  })

  test('muestra datos de sesión actual', async ({ page }) => {
    // Should show email, role, and active status
    await expect(page.getByText(/email/i)).toBeVisible()
    await expect(page.getByText(/rol/i)).toBeVisible()
    // Should show active/inactive status
    const activeStatus = page.getByText(/activo|inactivo/i).first()
    await expect(activeStatus).toBeVisible()
  })

  test('muestra estado de IA y modo demo', async ({ page }) => {
    await expect(page.getByText(/modo demo/i)).toBeVisible()
    await expect(page.getByText(/IA \(OpenAI\)|configurada|sin configurar/i)).toBeVisible()
  })

  test('muestra contadores de tablas', async ({ page }) => {
    await expect(page.getByText(/contactos/i)).toBeVisible()
    await expect(page.getByText(/empresas/i)).toBeVisible()
    await expect(page.getByText(/oportunidades/i)).toBeVisible()
    await expect(page.getByText(/campañas/i)).toBeVisible()
  })

  test('muestra estado de base de conocimiento', async ({ page }) => {
    await expect(page.getByText(/base de conocimiento/i)).toBeVisible()
    // Shows either chunks count or SQL pending message
    const chunksOrPending = page.getByText(/chunks|SQL pendiente|knowledge-embeddings/i).first()
    await expect(chunksOrPending).toBeVisible()
  })

  test('no expone tokens, API keys ni secrets', async ({ page }) => {
    const content = await page.content()
    // Ensure no API key patterns appear in page source
    expect(content).not.toMatch(/sk-[A-Za-z0-9]{20,}/)
    expect(content).not.toMatch(/eyJ[A-Za-z0-9+/]{40,}/)
    expect(content).not.toMatch(/OPENAI_API_KEY\s*=\s*\S+/)
  })

  test('últimas interacciones IA y revisiones compliance cargan', async ({ page }) => {
    // Should show either records or "sin registros"
    const aiSection = page.getByText(/últimas.*interacciones|sin interacciones/i).first()
    await expect(aiSection).toBeVisible()
    const complianceSection = page.getByText(/últimas.*revisiones|sin revisiones/i).first()
    await expect(complianceSection).toBeVisible()
  })
})
