import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

const EMAIL = process.env.E2E_USER_EMAIL ?? ''
const PASSWORD = process.env.E2E_USER_PASSWORD ?? ''

// Timeout amplio para el primer render de una ruta autenticada en el dev server:
// Next compila `/app/hoy` on-demand y el RSC de la navegación soft (`router.push`)
// puede tardar bastante en la primera visita. No es un timeout ciego: esperamos
// eventos reales (respuesta de auth, cambio de URL, nav visible).
const AUTH_RESPONSE_TIMEOUT = 30_000
const APP_READY_TIMEOUT = 60_000

export async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(EMAIL)
  await page.getByLabel('Contraseña').fill(PASSWORD)

  // Esperamos la respuesta real de Supabase Auth junto con el click, para saber
  // si el sign-in efectivamente ocurrió (y no ocultar un error de credenciales).
  const [authResponse] = await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/auth/v1/token') && r.request().method() === 'POST',
      { timeout: AUTH_RESPONSE_TIMEOUT }
    ),
    page.getByRole('button', { name: /ingresar/i }).click(),
  ])

  if (!authResponse.ok()) {
    throw new Error(
      `Login E2E: Supabase Auth respondió ${authResponse.status()} (esperado 200). Revisar credenciales E2E o el proyecto dev.`
    )
  }

  // El form hace router.push('/app/hoy') (navegación soft). En dev, la compilación
  // on-demand del RSC puede exceder timeouts cortos y dejar la URL en /login.
  // Si la navegación soft no llega a tiempo, forzamos una navegación dura: la sesión
  // ya está en cookies tras el sign-in, así que el middleware valida y renderiza.
  try {
    await page.waitForURL('**/app/hoy', { timeout: APP_READY_TIMEOUT })
  } catch {
    await page.goto('/app/hoy')
    await page.waitForURL('**/app/hoy', { timeout: APP_READY_TIMEOUT })
  }

  await expect(page.locator('nav, aside').first()).toBeVisible({ timeout: APP_READY_TIMEOUT })
}

export async function logout(page: Page) {
  // App header has an icon-only logout button with aria-label="Cerrar sesión"
  await page.getByRole('button', { name: /cerrar sesión/i }).click()
  await page.waitForURL('**/login', { timeout: 10_000 })
}

export async function expectLoggedIn(page: Page) {
  await expect(page).not.toHaveURL(/login/)
  // At least some nav element is present
  await expect(page.locator('nav, aside, [role="navigation"]').first()).toBeVisible({ timeout: 10_000 })
}

export async function expectOnLogin(page: Page) {
  await expect(page).toHaveURL(/login/, { timeout: 10_000 })
  await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible()
}

export function hasCredentials() {
  return Boolean(EMAIL && PASSWORD)
}
