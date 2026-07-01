import { test, expect } from '@playwright/test'
import { login, hasCredentials } from './helpers/auth'
import { ROUTES } from './helpers/routes'

// Palabras técnicas que NO deben aparecer en pantallas de usuario.
// Excepción: /app/admin/system sí puede tenerlas.
const FORBIDDEN = [
  { term: 'embedding',      pattern: /\bembedding\b/i },
  { term: 'fallback',       pattern: /\bfallback\b/i },
  { term: 'provider',       pattern: /\bprovider\b/i },
  { term: 'raw',            pattern: /\braw\b/i },
  { term: 'JSON',           pattern: /\bJSON\b/ },
  { term: 'SQL pendiente',  pattern: /SQL pendiente/i },
  { term: 'debug',          pattern: /\bdebug\b/i },
  { term: 'stack trace',    pattern: /stack trace/i },
  { term: 'RLS',            pattern: /\bRLS\b/ },
  { term: 'GRANT',          pattern: /\bGRANT\b/ },
  { term: 'MCP',            pattern: /\bMCP\b/ },
  { term: 'OPENAI_API_KEY', pattern: /OPENAI_API_KEY/ },
]

const PAGES = [
  { name: 'PLIFE Hoy',     route: ROUTES.hoy },
  { name: 'Demo',          route: ROUTES.demo },
  { name: 'Radar B2B',     route: ROUTES.radarB2B },
  { name: 'Empresas',      route: ROUTES.empresas },
  { name: 'Oportunidades', route: ROUTES.oportunidades },
  { name: 'Campañas',      route: ROUTES.campanas },
  { name: 'Compliance',    route: ROUTES.compliance },
  { name: 'Copiloto',      route: ROUTES.copiloto },
  { name: 'Dirección',     route: ROUTES.direccion },
]

test.describe('Textos técnicos prohibidos en pantallas de usuario', () => {
  // Un solo login; visita las 9 pantallas secuencialmente en el mismo test
  // para evitar timeouts repetidos de autenticación en suites largas.
  test('ninguna pantalla de usuario muestra lenguaje técnico', async ({ page }) => {
    test.skip(!hasCredentials(), 'Requiere E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.test')
    test.setTimeout(180_000) // 3 min — visita 9 páginas secuencialmente

    await login(page)

    const allFailures: string[] = []

    for (const { name, route } of PAGES) {
      await page.goto(route)
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

      const bodyText = await page.locator('body').innerText()

      for (const { term, pattern } of FORBIDDEN) {
        if (pattern.test(bodyText)) {
          const match = bodyText.match(pattern)
          const idx = match ? bodyText.indexOf(match[0]) : -1
          const snippet = idx >= 0
            ? bodyText.substring(Math.max(0, idx - 40), idx + term.length + 40).replace(/\n/g, ' ')
            : ''
          const msg = `[${name}] "${term}"${snippet ? ` → ...${snippet}...` : ''}`
          allFailures.push(msg)
          test.info().annotations.push({ type: 'fail', description: msg })
        }
      }
    }

    expect(
      allFailures,
      `Lenguaje técnico encontrado:\n${allFailures.join('\n')}`
    ).toHaveLength(0)
  })
})
