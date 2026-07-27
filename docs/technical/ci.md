# CI y tests — PLIFE Growth OS

> **Nota (FASE 15B):** OpenAI fue removido. Las referencias a `OPENAI_API_KEY` /
> OpenAI en este documento son **históricas**. Los motores operan en modo
> determinístico interno; los tests validan reglas determinísticas, no proveedores externos.

## Qué valida CI

El workflow `.github/workflows/ci.yml` corre en cada `push` y `pull_request` a `main`:

1. `npm ci` — instalación reproducible de dependencias
2. `npm run type-check` — TypeScript sin emitir JS
3. `npm run build` — build de producción Next.js
4. `npm run test:unit` — tests unitarios Vitest (lógica crítica sin browser ni Supabase real)

**No incluye Playwright E2E** (ver sección siguiente).

## Comandos locales

### Unit tests (Vitest)

```bash
npm run test:unit          # una corrida
npm run test:unit:watch    # modo watch
npm run test:unit:coverage # cobertura (requiere provider de coverage si se activa)
npm test                   # alias seguro → test:unit
```

Cubre:

- B2B scoring (`src/lib/b2b/scoring.ts`)
- ICP matching (`src/lib/b2b/icp.ts`)
- Compliance determinístico (`runDeterministicCompliance` en `src/lib/ai/compliance.ts`)
- Fallback IA sin `OPENAI_API_KEY` (`src/lib/ai/provider.ts`)

### Playwright E2E

```bash
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:ui
npm run test:e2e:report
```

Requiere:

- App corriendo o `webServer` de Playwright (`npm run dev`)
- `.env.test` con credenciales (no commitear)
- Supabase con seed demo cargado

Variables típicas en `.env.test`:

- `E2E_BASE_URL` — URL de la app (ej. `http://localhost:3000`)
- `E2E_USER_EMAIL` — usuario de prueba
- `E2E_USER_PASSWORD` — contraseña de prueba

### Otros

```bash
npm run type-check   # solo tipos
npm run build        # build producción
```

## Por qué Playwright no corre en CI (todavía)

E2E necesita:

- Proyecto Supabase real o staging con datos seed
- Usuario autenticado válido
- Secrets en GitHub Actions

Sin eso, los tests de auth y flujos comerciales fallarían de forma no representativa. La FASE 9 cerró E2E localmente (66 passed); CI se limita a validación rápida y sin secretos.

**Secrets futuros para E2E en CI:**

| Secret | Uso |
|--------|-----|
| `E2E_BASE_URL` | URL del deploy de staging |
| `E2E_USER_EMAIL` | Cuenta demo |
| `E2E_USER_PASSWORD` | Contraseña demo |

Opcional: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` si el build en CI apunta a staging.

## Si falla el build

1. Correr `npm run type-check` y leer el primer error de TypeScript.
2. Limpiar caché: `Remove-Item -Recurse -Force .next` (Windows) o `rm -rf .next`.
3. Verificar que `NEXT_PUBLIC_SUPABASE_*` existan en `.env.local` localmente (CI usa placeholders).
4. No commitear `.env.local` ni `.env.test`.

## Si falla compliance o scoring (unit)

1. `npm run test:unit -- tests/unit/compliance.test.ts`
2. `npm run test:unit -- tests/unit/b2b-scoring.test.ts`
3. Revisar cambios en `src/lib/b2b/*` o `src/lib/ai/compliance.ts` — los tests validan reglas determinísticas, no llamadas a OpenAI.

## Diferencia entre comandos

| Comando | Qué hace | Requiere |
|---------|----------|----------|
| `npm run test:unit` | Lógica pura en Node (Vitest) | Nada externo |
| `npm run test:e2e` | Browser + app + Supabase | `.env.test`, dev server, seed |
| `npm run type-check` | Tipos TS | `node_modules` |
| `npm run build` | Compilación Next.js | Env vars públicas de Supabase |

## FASE 10 (pendiente)

- E2E en CI con staging + secrets
- Cobertura mínima obligatoria en PR
- GRANTs / smoke de integración si se agregan más tablas
