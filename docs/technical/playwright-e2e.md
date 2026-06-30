# PLIFE Growth OS — Tests E2E con Playwright

## Prerrequisitos

Antes de correr los tests:

1. **Usuario admin** — debe existir un usuario en Supabase con rol `admin` o `direccion` y perfil activo (`is_active = true`, `onboarding_completed = true`).
2. **Seed demo cargado** — ejecutar `supabase/seed-demo.sql` para que los contadores no estén todos en 0.
3. **`fix-app-grants.sql` aplicado** — sin esto se producen errores 42501 en varios módulos.
4. **`knowledge-embeddings.sql`** — opcional. Sin él, la búsqueda semántica usa fallback de texto y el sistema muestra "SQL pendiente".
5. **Dev server corriendo** o variable `E2E_BASE_URL` apuntando a staging.

## Instalación

```bash
npm install
npx playwright install chromium
```

## Variables de entorno

Copiar `.env.test.example` a `.env.test` y completar:

```env
E2E_BASE_URL=http://localhost:3000
E2E_USER_EMAIL=admin@plife.uy
E2E_USER_PASSWORD=tu-password-real
NEXT_PUBLIC_DEMO_MODE=true
```

> **No commitear `.env.test`** — está en `.gitignore`.

## Scripts

```bash
# Correr todos los tests (headless)
npm run test:e2e

# Correr con UI interactiva de Playwright
npm run test:e2e:ui

# Correr con browser visible
npm run test:e2e:headed

# Ver reporte HTML del último run
npm run test:e2e:report
```

## Estructura de tests

```
tests/e2e/
├── helpers/
│   ├── auth.ts          # login(), logout(), hasCredentials()
│   ├── routes.ts        # ROUTES constantes
│   └── selectors.ts     # SEL — selectores estables por texto/role
├── auth.spec.ts          # Auth: sin sesión, login, logout, refresh F5
├── smoke-routes.spec.ts  # Smoke: todas las rutas cargan sin 500
├── dashboard.spec.ts     # Dashboard: métricas demo, recorrido
├── radar-b2b.spec.ts     # Radar B2B: ranking, filtros, análisis
├── commercial-flow.spec.ts # Empresas, Oportunidades, Campañas
├── compliance.spec.ts    # Compliance determinístico sin AI key
├── copilot.spec.ts       # Copiloto: estado sin/con API key
├── knowledge.spec.ts     # Conocimiento: docs, embeddings, búsqueda
└── admin-system.spec.ts  # Admin system: sesión, contadores, secrets
```

## Qué cubre cada spec

| Spec | Casos clave |
|------|-------------|
| `auth.spec.ts` | Sin sesión → login, login correcto, logout, F5 sin loop |
| `smoke-routes.spec.ts` | 13 rutas × 2 (carga + reload) sin 500 ni Internal Server Error |
| `dashboard.spec.ts` | Heading "Vista de Dirección", métricas demo > 0, bloque demo |
| `radar-b2b.spec.ts` | Lista empresas, búsqueda, expand análisis B2B, CTA oportunidad |
| `commercial-flow.spec.ts` | Detalle empresa + B2B panel, detalle oportunidad, detalle campaña |
| `compliance.spec.ts` | Término prohibido → riesgo crítico (sin AI); mensaje seguro → bajo |
| `copilot.spec.ts` | Estado sin API key; con key: formulario disponible |
| `knowledge.spec.ts` | Lista docs, estado embeddings, búsqueda sin crash |
| `admin-system.spec.ts` | Sesión actual, estado IA/demo, contadores, no expone secrets |

## Tests que requieren credenciales

Todos los tests de `beforeEach` usan `hasCredentials()` y se saltean con `test.skip` si no hay `E2E_USER_EMAIL` / `E2E_USER_PASSWORD`. El único test que **no** requiere credenciales es `auth.spec.ts > sin sesión: /app/hoy redirige a /login`.

## Debugging

```bash
# Ver trace de un test fallido
npx playwright show-trace test-results/<carpeta>/trace.zip

# Correr un spec específico
npx playwright test tests/e2e/compliance.spec.ts --headed

# Correr con slow-mo para ver qué pasa
npx playwright test --headed --slow-mo=500
```

## Si falla por errores 42501 (permission denied)

```sql
-- Aplicar en Supabase SQL Editor:
-- supabase/fix-app-grants.sql
```

Los tests de smoke detectarán esto como "Internal Server Error" o página vacía.

## CI

En CI, el `playwright.config.ts` está configurado con `retries: 1` y `forbidOnly: true`. Asegurarse de pasar las variables de entorno al pipeline.

```yaml
# Ejemplo GitHub Actions
env:
  E2E_BASE_URL: ${{ secrets.E2E_BASE_URL }}
  E2E_USER_EMAIL: ${{ secrets.E2E_USER_EMAIL }}
  E2E_USER_PASSWORD: ${{ secrets.E2E_USER_PASSWORD }}
```
