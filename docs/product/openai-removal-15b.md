# FASE 15B — Remoción completa de OpenAI

> Estado: **COMPLETADO** en la rama `feat/lead-first-crm`.
> Decisión de producto: el proyecto **no usa OpenAI** ni ningún proveedor externo de IA.

---

## 1. Alcance

Eliminar toda dependencia activa, configuración y copy que implique que el
proyecto usa OpenAI. Resultado exigido:

- Cero llamadas a `api.openai.com`.
- Cero uso de `OPENAI_API_KEY`.
- Cero modelos `gpt-*` / `text-embedding-*` en código activo.
- Cero proveedor OpenAI.
- Motores en **modo determinístico interno** hasta definir tecnología futura.
- Tests y documentación actualizados.

Fuera de alcance (fases posteriores):

- Rediseño funcional de los motores (FASE 15D+).
- Eliminación de Compliance como sección/menú (FASE 15C). En 15B solo se removió
  la **referencia OpenAI directa** dentro de Compliance (capa 2 de refinamiento IA).
- Implementación de un proveedor alternativo (no se implementa ninguno).

---

## 2. Archivos modificados

### Código activo (`src/`)
- `src/lib/ai/provider.ts` — reescrito. Se eliminó el `fetch` a
  `api.openai.com/v1/chat/completions`, la dependencia de `OPENAI_API_KEY` y el
  modelo `gpt-4o-mini`. `chatComplete()` ahora devuelve una respuesta
  determinística interna (sin red). Se agregaron `AI_INTERNAL_MODE_MESSAGE` e
  `INTERNAL_ENGINE_MODEL = 'internal-deterministic'`. `isAIConfigured()` devuelve
  `true` (motor interno siempre disponible). Se conservan `AINotConfiguredError`
  y `AI_NOT_CONFIGURED_MESSAGE` (alias) por compatibilidad de imports.
- `src/lib/ai/embeddings.ts` — se eliminó el `fetch` a
  `api.openai.com/v1/embeddings` y `text-embedding-3-small`. `generateEmbedding()`
  devuelve `null`. `indexDocumentChunks()` devuelve `fallback=true` sin generar
  vectores. `searchKnowledgeSemantic()` usa siempre búsqueda por texto (`ilike`).
- `src/lib/ai/compliance.ts` — se eliminó la **capa 2** de refinamiento IA (única
  referencia OpenAI). El motor de compliance queda 100% determinístico.
- `src/lib/ai/prompts.ts` — `model: 'gpt-4o-mini'` → `'internal-deterministic'`
  (4 ocurrencias).
- `src/lib/ai/agents.ts` — sin cambios de referencia OpenAI (ya usa `chatComplete`,
  ahora determinístico). Firma pública `runAgent` intacta.
- Copy UI:
  - `src/app/app/admin/system/system-view.tsx` — "IA (OpenAI)" → "Motores internos"
    con badge "Modo determinístico".
  - `src/components/ia/entity-ai-analysis-card.tsx` — copy sin mención a OpenAI.
  - `src/components/ia/mock-execution-form.tsx` — copy sin mención a OpenAI.
  - `src/domains/ia-engine/mock-runner.ts` — copy sin mención a OpenAI.

### Config
- `.env.example` — se eliminó `OPENAI_API_KEY`. Se agregó nota: los motores
  internos operan sin API externa.

### Tests
- `tests/unit/ai-fallback.test.ts` — reescrito: valida modo determinístico interno,
  `isAIConfigured() === true`, `chatComplete` sin `fetch` externo y determinístico,
  compliance determinístico sigue funcionando. Sin `OPENAI_API_KEY`.
- `tests/e2e/copilot.spec.ts` — actualizado al comportamiento de motor interno.
- `tests/e2e/admin-system.spec.ts` — etiqueta y guardas de secretos sin OpenAI.
- `tests/e2e/compliance.spec.ts` — título del test sin `OPENAI_API_KEY`.
- `tests/e2e/non-technical-copy.spec.ts` — se removió `OPENAI_API_KEY` de la lista
  de términos prohibidos (ya no aplica).

### Docs / SQL (marcados como histórico)
- `docs/technical/env-vars.md` — sección `OPENAI_API_KEY` marcada como REMOVIDA.
- `docs/technical/ci.md`, `staging-deploy.md`, `staging-qa.md`, `qa-checklist.md`
  — banner histórico 15B.
- `.github/workflows/ci.yml` — comentario actualizado.
- `docs/product/*` (ai-engine-*, release-*, backlog, sprints, role-matrix,
  qa-test-cases, copy-style-guide, known-issues, user-manual, ux-audit,
  pr-13, release-notes) — banner histórico 15B.
- `supabase/ai-engine-schema.sql`, `ai-engine-seed.sql`, `knowledge-embeddings.sql`
  — banner histórico. **No se aplicó ningún cambio a Supabase.**

---

## 3. Comportamiento anterior

- `chatComplete()` llamaba a `api.openai.com/v1/chat/completions` con
  `OPENAI_API_KEY` y modelo `gpt-4o-mini`. Sin clave → `AINotConfiguredError`.
- `generateEmbedding()` llamaba a `api.openai.com/v1/embeddings`
  (`text-embedding-3-small`).
- Compliance capa 2 refinaba riesgo "medio" con una llamada a OpenAI.
- La UI y config presentaban OpenAI como proveedor (opcional/requerido).

## 4. Comportamiento nuevo

- `chatComplete()` devuelve una respuesta **determinística interna** claramente
  etiquetada ("Motor interno — modo determinístico"), sin llamadas de red, sin
  inventar datos. Firma pública intacta.
- `isAIConfigured()` devuelve `true` (motor interno siempre disponible). Los
  motores no fallan por falta de proveedor.
- Embeddings deshabilitados de forma controlada: la búsqueda de conocimiento
  usa texto (`ilike`).
- Compliance 100% determinístico (reglas + patrones), sin proveedor externo.
- La UI ya no menciona OpenAI.

## 5. Qué quedó pendiente

- Búsqueda semántica real (embeddings) — requiere definir tecnología.
- Rediseño funcional de los motores comerciales (FASE 15D+).
- Eliminación de Compliance como sección/menú (FASE 15C).
- Definición del proveedor/tecnología de generación futura.

## 6. QA

- `npm run type-check` — ver reporte de ejecución en el PR/commit.
- `npm run build` — ver reporte.
- `npm run test:unit` — ver reporte.
- Verificación `rg` sobre `src tests .env.example package.json`: cero referencias
  activas a OpenAI (`api.openai.com`, `OPENAI_API_KEY`, `gpt-*`, `text-embedding-*`).

## 7. Confirmación

El proyecto **no usa OpenAI**. No hay llamadas runtime a `api.openai.com`, no se
lee `OPENAI_API_KEY`, no hay modelos `gpt-*`/`text-embedding-*` en código activo,
y no se introdujo ningún proveedor externo alternativo. Los motores operan en
modo determinístico interno hasta definir tecnología futura.
