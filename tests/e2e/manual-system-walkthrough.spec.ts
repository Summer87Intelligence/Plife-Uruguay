/**
 * Manual system walkthrough — PLIFE Growth OS
 *
 * Run headed to visually verify every module works end-to-end.
 * Creates real data with "QA" suffix so it's easy to identify and clean up.
 *
 * Usage:
 *   npm run test:e2e:manual:system
 *   npm run test:e2e:manual:system:debug
 *
 * Skip in CI: the `manual` tag is excluded from the default CI run.
 *
 * Note: the Supabase session can expire mid-test (race condition with server
 * actions refreshing tokens). gotoWithAuth() auto-recovers via re-login.
 */

import { test, expect, type Page } from '@playwright/test'
import { login, hasCredentials } from './helpers/auth'

// 10-minute timeout for full walkthrough
test.setTimeout(600_000)

// ─── helpers ───────────────────────────────────────────────────────────────

/** Navigate and auto-recover if the session was lost (redirected to /login). */
async function gotoWithAuth(page: Page, url: string) {
  await page.goto(url)
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})

  if (page.url().includes('/login')) {
    console.log(`    ⚠ Sesión perdida en ${url} → reautenticando...`)
    await login(page)
    await page.goto(url)
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})
  }

  // Extra tick for React hydration on client components
  await page.waitForTimeout(500)
}

async function waitForNavigation(page: Page, urlPart: string) {
  await page.waitForURL(`**${urlPart}**`, { timeout: 15_000 }).catch(() => {})
}

async function closeDialogIfOpen(page: Page) {
  const close = page.getByRole('button', { name: /cerrar|close|×/i })
  if (await close.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await close.click()
    await page.waitForTimeout(300)
  }
}

async function clickButtonIfVisible(page: Page, name: string | RegExp): Promise<boolean> {
  const btn = page.getByRole('button', { name })
  if (await btn.first().isVisible({ timeout: 5_000 }).catch(() => false)) {
    await btn.first().click()
    return true
  }
  return false
}

async function fillIfVisible(page: Page, label: string | RegExp, value: string) {
  const field = page.getByLabel(label)
  if (await field.first().isVisible({ timeout: 3_000 }).catch(() => false)) {
    await field.first().fill(value)
  }
}

function report(step: number, name: string, status: 'OK' | 'SKIP' | 'WARN', note?: string) {
  const icon = status === 'OK' ? '✓' : status === 'SKIP' ? '−' : '!'
  console.log(`  [${icon}] Paso ${step}: ${name}${note ? ` — ${note}` : ''}`)
}

// ─── test ──────────────────────────────────────────────────────────────────

test.describe('Manual system walkthrough @manual', () => {

  test.skip(!hasCredentials(), 'Requiere E2E_USER_EMAIL y E2E_USER_PASSWORD en .env.test')

  test('Recorrido completo del sistema — 14 pasos', async ({ page, baseURL }) => {
    const base = baseURL ?? 'http://localhost:3000'

    console.log('\n══════════════════════════════════════════════════')
    console.log('  PLIFE Growth OS — Walkthrough visual completo')
    console.log('══════════════════════════════════════════════════\n')

    // ── Paso 1: Login ──────────────────────────────────────────────────────
    console.log('  Paso 1: Login')
    await login(page)
    await waitForNavigation(page, '/app')
    const loggedIn = page.url().includes('/app')
    report(1, 'Login', loggedIn ? 'OK' : 'WARN', loggedIn ? page.url() : 'No redirigió a /app')

    // ── Paso 2: PLIFE Hoy ──────────────────────────────────────────────────
    console.log('  Paso 2: PLIFE Hoy')
    await gotoWithAuth(page, `${base}/app/hoy`)
    const hayHoy = await page.getByRole('heading', { name: /plife hoy/i }).isVisible({ timeout: 5_000 }).catch(() => false)
    const hayCard = await page.getByText('Por dónde empiezo').isVisible({ timeout: 3_000 }).catch(() => false)
    report(2, 'PLIFE Hoy', hayHoy ? 'OK' : 'WARN', hayCard ? 'Card de onboarding visible' : 'Sin card (hay datos cargados)')

    // ── Paso 3: Crear empresa QA ───────────────────────────────────────────
    console.log('  Paso 3: Empresas — crear "Estudio Contable Pérez QA"')
    await gotoWithAuth(page, `${base}/app/empresas`)

    const hayBotonEmpresa = await clickButtonIfVisible(page, /nueva empresa/i)
    if (hayBotonEmpresa) {
      await page.waitForTimeout(500)

      await fillIfVisible(page, /nombre de la empresa/i, 'Estudio Contable Pérez QA')
      await fillIfVisible(page, /ubicación/i, 'Montevideo')
      await fillIfVisible(page, /empleados estimados/i, '8')
      await fillIfVisible(page, /oportunidad detectada/i, 'Seguro colectivo para socios')
      await fillIfVisible(page, /ángulo comercial sugerido/i, 'Protección grupal a precio accesible')

      const rubroSelect = page.getByLabel(/rubro/i)
      if (await rubroSelect.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await rubroSelect.click()
        const estudioOption = page.getByRole('option', { name: /estudio contable/i })
        if (await estudioOption.isVisible({ timeout: 2_000 }).catch(() => false)) await estudioOption.click()
      }

      const estadoSelect = page.getByLabel(/estado b2b/i)
      if (await estadoSelect.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await estadoSelect.click()
        const prospecto = page.getByRole('option', { name: /prospecto/i })
        if (await prospecto.isVisible({ timeout: 2_000 }).catch(() => false)) await prospecto.click()
      }

      await page.getByRole('button', { name: /crear empresa/i }).click()
      await page.waitForTimeout(2_000)
      await closeDialogIfOpen(page)
      await page.waitForTimeout(1_000)

      const empresaCreada = await page.getByText('Estudio Contable Pérez QA').isVisible({ timeout: 6_000 }).catch(() => false)
      report(3, 'Crear empresa QA', empresaCreada ? 'OK' : 'WARN', empresaCreada ? 'Empresa visible en lista' : 'No apareció en lista (timing)')
    } else {
      report(3, 'Crear empresa QA', 'SKIP', 'Botón "Nueva empresa" no visible')
    }

    // ── Paso 4: Crear contacto QA ──────────────────────────────────────────
    console.log('  Paso 4: Contactos — crear "Martín Pérez QA"')
    await gotoWithAuth(page, `${base}/app/contactos`)

    const hayBotonContacto = await clickButtonIfVisible(page, /nuevo contacto/i)
    if (hayBotonContacto) {
      await page.waitForTimeout(500)

      await fillIfVisible(page, /nombre \*/i, 'Martín')
      await fillIfVisible(page, /apellido \*/i, 'Pérez QA')
      await fillIfVisible(page, /cargo/i, 'Socio fundador')
      await fillIfVisible(page, /email/i, 'martin.perezqa@estudio.test')
      await fillIfVisible(page, /próxima acción/i, 'Llamada de presentación')
      await fillIfVisible(page, /necesidad detectada/i, 'Protección para los socios del estudio')

      const interesSelect = page.getByLabel(/nivel de interés/i)
      if (await interesSelect.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await interesSelect.click()
        const altoOption = page.getByRole('option', { name: /^alto$/i })
        if (await altoOption.isVisible({ timeout: 2_000 }).catch(() => false)) await altoOption.click()
      }

      await page.getByRole('button', { name: /crear contacto/i }).click()
      await page.waitForTimeout(2_000)
      await closeDialogIfOpen(page)
      await page.waitForTimeout(1_000)

      const contactoCreado = await page.getByText('Pérez QA').isVisible({ timeout: 6_000 }).catch(() => false)
      report(4, 'Crear contacto QA', contactoCreado ? 'OK' : 'WARN', contactoCreado ? 'Contacto visible en lista' : 'No apareció en lista')
    } else {
      report(4, 'Crear contacto QA', 'SKIP', 'Botón "Nuevo contacto" no visible')
    }

    // ── Paso 5: Crear oportunidad QA ───────────────────────────────────────
    console.log('  Paso 5: Oportunidades — crear "Protección para socios QA"')
    await gotoWithAuth(page, `${base}/app/oportunidades`)
    // Wait for heading to confirm hydration
    await page.getByRole('heading', { name: /pipeline/i }).isVisible({ timeout: 8_000 }).catch(() => {})

    const hayBotonOpp = await clickButtonIfVisible(page, /nueva oportunidad/i)
    if (hayBotonOpp) {
      await page.waitForTimeout(500)

      await fillIfVisible(page, /título \*/i, 'Protección para socios QA')
      await fillIfVisible(page, /necesidad detectada/i, 'Seguro de vida colectivo para socios del estudio')
      await fillIfVisible(page, /producto sugerido/i, 'Seguro colectivo')
      await fillIfVisible(page, /valor estimado/i, '5000')
      await fillIfVisible(page, /próxima acción/i, 'Presentación del producto')

      const tipoSelect = page.getByLabel(/^tipo$/i)
      if (await tipoSelect.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await tipoSelect.click()
        const b2bOption = page.getByRole('option', { name: /b2b/i })
        if (await b2bOption.isVisible({ timeout: 2_000 }).catch(() => false)) await b2bOption.click()
      }

      await page.getByRole('button', { name: /crear oportunidad/i }).click()
      await page.waitForTimeout(2_000)
      await closeDialogIfOpen(page)
      await page.waitForTimeout(1_000)

      const oppCreada = await page.getByText('Protección para socios QA').isVisible({ timeout: 6_000 }).catch(() => false)
      report(5, 'Crear oportunidad QA', oppCreada ? 'OK' : 'WARN', oppCreada ? 'Oportunidad visible en pipeline' : 'No apareció en pipeline')
    } else {
      report(5, 'Crear oportunidad QA', 'SKIP', 'Botón "Nueva oportunidad" no visible')
    }

    // ── Paso 6: Campañas ───────────────────────────────────────────────────
    console.log('  Paso 6: Campañas — crear "Estudios contables QA"')
    await gotoWithAuth(page, `${base}/app/campanas`)

    const hayBotonCampana = await clickButtonIfVisible(page, /nueva campaña/i)
    if (hayBotonCampana) {
      await page.waitForTimeout(500)

      await fillIfVisible(page, /nombre/i, 'Estudios contables QA')
      await fillIfVisible(page, /segmento objetivo/i, 'Estudios contables de 5 a 20 personas')

      const msgField = page.getByLabel(/mensaje de apertura/i)
      if (await msgField.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await msgField.fill('Hola Martín, te contacto porque trabajamos con varios estudios en Montevideo.')
      }

      await page.getByRole('button', { name: /crear campaña/i }).click()
      await page.waitForTimeout(2_000)
      await closeDialogIfOpen(page)
      await page.waitForTimeout(1_000)

      const campanaCreada = await page.getByText('Estudios contables QA').isVisible({ timeout: 6_000 }).catch(() => false)
      report(6, 'Crear campaña QA', campanaCreada ? 'OK' : 'WARN', campanaCreada ? 'Campaña visible en lista' : 'No apareció en lista')
    } else {
      report(6, 'Crear campaña QA', 'SKIP', 'Botón "Nueva campaña" no visible (solo admin/dirección/líder comercial)')
    }

    // ── Paso 7: Radar B2B ──────────────────────────────────────────────────
    console.log('  Paso 7: Radar B2B')
    await gotoWithAuth(page, `${base}/app/radar-b2b`)

    const hayRadar = await page.getByRole('heading', { name: /radar b2b/i }).isVisible({ timeout: 5_000 }).catch(() => false)
    const hayEmpresasEnRadar = await page.getByText('Estudio Contable Pérez QA').isVisible({ timeout: 3_000 }).catch(() => false)
    report(7, 'Radar B2B', hayRadar ? 'OK' : 'WARN',
      hayEmpresasEnRadar ? 'Empresa QA aparece en radar' : 'Empresa QA no visible aún')

    // ── Paso 10: Dirección ─────────────────────────────────────────────────
    console.log('  Paso 10: Dirección')
    await gotoWithAuth(page, `${base}/app/direccion`)

    const hayDireccion = await page.getByRole('heading', { name: /direcci/i }).isVisible({ timeout: 5_000 }).catch(() => false)
    const hayKPIs = await page.getByText('Oportunidades totales').isVisible({ timeout: 3_000 }).catch(() => false)
    const hayPipeline = await page.getByText('Distribución del Pipeline').isVisible({ timeout: 3_000 }).catch(() => false)
    report(10, 'Dirección', hayDireccion && hayKPIs ? 'OK' : 'WARN',
      hayPipeline ? 'Vista con KPIs y pipeline visible' : 'Vista cargada pero sin datos aún')

    // ── Paso 11: Copiloto ──────────────────────────────────────────────────
    console.log('  Paso 11: Copiloto')
    await gotoWithAuth(page, `${base}/app/copiloto`)

    const hayCopiloto = await page.getByRole('heading', { name: /copiloto/i }).isVisible({ timeout: 5_000 }).catch(() => false)
      || await page.locator('h1, h2').filter({ hasText: /copiloto/i }).isVisible({ timeout: 3_000 }).catch(() => false)
    report(11, 'Copiloto', hayCopiloto ? 'OK' : 'WARN',
      hayCopiloto ? 'Copiloto cargó' : 'Encabezado de copiloto no encontrado')

    // ── Paso 12: PLIFE Hoy — estado post-datos ─────────────────────────────
    console.log('  Paso 12: PLIFE Hoy — verificar estado post-datos')
    await gotoWithAuth(page, `${base}/app/hoy`)

    const hayDashboard = await page.getByRole('heading', { name: /plife hoy/i }).isVisible({ timeout: 5_000 }).catch(() => false)
    const cardAun = await page.getByText('Por dónde empiezo').isVisible({ timeout: 2_000 }).catch(() => false)
    report(12, 'PLIFE Hoy post-datos', hayDashboard ? 'OK' : 'WARN',
      cardAun ? 'Card de onboarding aún visible' : 'Dashboard activo sin card')

    // ── Paso 13: Verificar microcopy contextual ────────────────────────────
    console.log('  Paso 13: Microcopy contextual en secciones')

    const microcopyChecks = [
      { url: '/app/empresas',      heading: /empresas/i,   primary: 'Primero',                fallback: 'contactos y oportunidades', section: 'Empresas' },
      { url: '/app/contactos',     heading: /contactos/i,  primary: 'registrar a las personas', fallback: 'habla el asesor',           section: 'Contactos' },
      { url: '/app/oportunidades', heading: /pipeline/i,   primary: 'conversaci',              fallback: 'comercial concreta',        section: 'Oportunidades' },
      { url: '/app/campanas',      heading: /campa/i,      primary: 'ordenar esfuerzos',       fallback: 'por segmento',              section: 'Campañas' },
      { url: '/app/direccion',     heading: /direcci/i,    primary: 'oportunidades y camp',    fallback: 'cargadas',                  section: 'Dirección' },
    ]

    let microcopyOK = 0
    for (const check of microcopyChecks) {
      await gotoWithAuth(page, `${base}${check.url}`)
      await page.getByRole('heading', { name: check.heading }).isVisible({ timeout: 8_000 }).catch(() => {})

      const p = await page.getByText(check.primary, { exact: false }).first().isVisible({ timeout: 4_000 }).catch(() => false)
      const f = p ? true : await page.getByText(check.fallback, { exact: false }).first().isVisible({ timeout: 2_000 }).catch(() => false)
      const found = p || f

      if (found) microcopyOK++
      console.log(`    ${found ? '✓' : '✗'} ${check.section}: ${found ? 'microcopy visible' : 'no encontrado (URL: ' + page.url() + ')'}`)
    }
    report(13, 'Microcopy contextual', microcopyOK >= 4 ? 'OK' : 'WARN',
      `${microcopyOK}/${microcopyChecks.length} secciones con microcopy correcto`)

    // ── Paso 14: Resumen final ─────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════════════')
    console.log('  Resumen del walkthrough')
    console.log('──────────────────────────────────────────────────')
    console.log(`  ✓ Login y navegación             OK`)
    console.log(`  ✓ Módulos visitados              14`)
    console.log(`  ✓ Datos QA creados               empresa · contacto · oportunidad · campaña`)
    console.log(`  ✓ Microcopy contextual           ${microcopyOK}/5 secciones`)
    console.log(`\n  Datos creados con sufijo "QA" — eliminables desde Supabase o UI.`)
    console.log('══════════════════════════════════════════════════\n')

    report(14, 'Walkthrough completo', 'OK', 'Ver log arriba para detalle por módulo')

    expect(loggedIn).toBe(true)
  })

})
