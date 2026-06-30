import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

const EMAIL = process.env.E2E_USER_EMAIL ?? ''
const PASSWORD = process.env.E2E_USER_PASSWORD ?? ''

export async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(EMAIL)
  await page.getByLabel('Contraseña').fill(PASSWORD)
  await page.getByRole('button', { name: /ingresar/i }).click()
  await page.waitForURL('**/app/hoy', { timeout: 15_000 })
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
