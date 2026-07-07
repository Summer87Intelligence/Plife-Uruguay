# FASE 15D — Rediseño de "Motor IA" como Motores comerciales

**Fecha:** 2026-07-07
**Rama:** `feat/lead-first-crm` (PR #3, draft, NO-GO para main)
**Roles:** Product Architect + Senior Frontend Engineer + QA Lead
**Naturaleza:** cambio de código (UI + dominio conceptual + tests + docs).
**Restricciones respetadas:** no main · no `feat/operational-readiness-13` · no PR #4 · no merge · no push · no Supabase remoto · no Vercel · no `.env` · no SQL · sin proveedor externo · sin reintroducir OpenAI · sin reintroducir Compliance · sin persistencia nueva de propuestas/productos.

> **Resultado FASE 15E (ejecutada):** se implementó el flujo mock "Nueva propuesta".
> Nuevo dominio `src/domains/proposals/` con `generateMockProposal` (determinístico,
> usa los 6 motores), rutas `/app/propuestas` y `/app/propuestas/nueva`, componentes
> `proposal-create-form` y `proposal-draft-view`, ítem de sidebar **Propuestas** y CTA
> "Crear nueva propuesta" desde `/app/ia`. Sin persistencia, sin server actions, sin
> OpenAI, sin Compliance. Detalle en [`proposals-mock-flow-15e.md`](./proposals-mock-flow-15e.md).
>
> **Resultado FASE 15F (ejecutada):** las propuestas pueden nacer desde Lead, Campaña,
> Radar u observación manual (prefill por query params + CTAs contextuales). Detalle en
> [`proposals-contextual-entry-15f.md`](./proposals-contextual-entry-15f.md).

---

## 1. Decisión

La sección de "IA / Motor IA / Copiloto IA" dejaba de comunicar valor comercial y sonaba a "IA genérica". Se reorienta hacia **Motores comerciales**: un sistema de motores especializados que ayudan a **diagnosticar oportunidades, explorar nichos, diseñar propuestas y preparar estrategias comerciales**.

Todo opera en **modo determinístico/mock interno**, sin proveedores externos, sin OpenAI y sin Compliance. Las **propuestas** son el resultado futuro (FASE 15E); por ahora la salida es conceptual y no se persiste.

---

## 2. Nuevo modelo de motores

Se crea el dominio conceptual `src/domains/intelligence-engines/`:

- `types.ts` — `EngineId`, `EngineStatus`, `CommercialEngine`, `FlowStep`, `ExampleStep`, `ExampleScenario`.
- `engine-definitions.ts` — `COMMERCIAL_ENGINES` (los 6 motores) + `getEngine()`.
- `constants.ts` — copy de sección, `RECOMMENDED_FLOW`, `PROPOSALS_NOTE`, `EXAMPLE_SCENARIO`, labels/estilos de estado.
- `mock-output.ts` — `runEngineMock()` determinístico (sin red, sin datos reales).
- `index.ts` — barrel de exportación.

Cada motor tiene: `id`, `name`, `shortDescription`, `whatItDoes[]`, `exampleQuestions[]`, `exampleOutputs[]`, `status` (`available_mock` / `conceptual` / `future`).

---

## 3. Motores definidos

| id | Nombre | Función | Estado |
|---|---|---|---|
| `diagnostico` | Motor Diagnóstico | Hace preguntas al asesor; entiende cliente, necesidad, contexto y restricciones | Disponible (simulado) |
| `mercado` | Motor Mercado | Analiza competidores de forma conceptual; detecta nichos y diferenciales | Conceptual |
| `producto` | Motor Producto | Diseña propuesta/producto; define público, valor, límites y variantes | Conceptual |
| `comercial` | Motor Comercial | Convierte la propuesta en estrategia: mensaje, campaña y seguimiento | Disponible (simulado) |
| `direccion` | Motor Dirección | Evalúa prioridad, foco, potencial y riesgo comercial | Conceptual |
| `aprendizaje` | Motor Aprendizaje / Biblioteca | Usa conocimiento interno, casos y materiales | Disponible (simulado) |

Ninguno usa APIs externas. No existe motor de compliance ni referencias a OpenAI.

---

## 4. Menú recomendado

- La entrada de sidebar `Motor IA` → **`Motores`** (ruta `/app/ia`).
- La entrada `Copiloto IA` → **`Copiloto`** (se conserva el copiloto del asesor; se retira el rótulo "IA genérica").

**Ruta técnica heredada:** `/app/ia` se mantiene por ahora. Renombrar a `/app/motores` implicaría demasiados cambios de rutas/tests para esta fase; se documenta como ruta técnica heredada con la sección visible renombrada a "Motores".

---

## 5. Flujo Lead/Idea → Motores → Propuesta

```
Lead o idea → Diagnóstico → Mercado → Producto → Comercial → Dirección → Propuesta
```

La UI de `/app/ia` presenta cuatro bloques:

1. **Qué hacen los motores** — introducción de la sección.
2. **Motores disponibles** — 6 tarjetas con qué hace, preguntas de ejemplo, salidas de ejemplo y estado.
3. **Flujo recomendado** — la cadena de arriba + nota de "Propuestas" como concepto futuro.
4. **Ejemplo de uso** — un escenario que atraviesa cada motor (pregunta → entrega).

Debajo se conserva la **Configuración técnica (motor de prompts PLIFE, FASE 12O-B)** con sus tabs, sin cambios funcionales.

---

## 6. Cambios de código

**Nuevos:**
- `src/domains/intelligence-engines/{types,constants,engine-definitions,mock-output,index}.ts`
- `src/components/ia/commercial-engines-overview.tsx`
- `tests/unit/commercial-engines.test.ts`

**Modificados (UI/copy):**
- `src/app/app/ia/ia-view.tsx` — hero "Motores" + overview + divisor + config técnica reencuadrada.
- `src/components/layout/app-sidebar.tsx`, `src/lib/constants.ts` — labels `Motores` / `Copiloto`.
- `src/components/ia/{entity-ai-analysis-card,mock-execution-form,tab-ejecuciones,tab-dashboard,tab-categorias}.tsx` — copy.
- `src/app/app/hoy/advisor-dashboard.tsx`, `src/app/app/demo/page.tsx` — copy/quick actions.
- `src/app/app/contactos/[id]/contact-detail.tsx`, `src/app/app/oportunidades/[id]/opportunity-detail.tsx` — títulos de actividad.
- `src/domains/ai/actions.ts`, `src/lib/b2b/scoring.ts`, `src/domains/ia-engine/mock-runner.ts` — copy.
- `src/types/database.ts` — comentarios de sección ("Motor de prompts PLIFE").

**Tests actualizados:** `tests/e2e/{sidebar-nav,copilot,demo-guided-flow,manual-system-walkthrough}.spec.ts`.

---

## 7. Límites actuales

- Salida **conceptual/mock**; no consulta mercado real ni genera datos reales.
- **No hay persistencia** de propuestas ni de productos.
- La UI de motores es **presentación + ejemplo**, no un ejecutor conversacional nuevo.
- El "motor de prompts" técnico (FASE 12O-B) sigue existiendo como capa avanzada bajo `/app/ia`.

---

## 8. Qué queda para 15E+

- **15E:** flujo "Propuesta nueva" (Motor Producto + Motor Comercial) con persistencia.
- **15F:** diseño Producto/Nicho (Motor Mercado + Motor Producto).
- **15G:** conectar Motores con Leads/Campañas/Radar.
- **15H:** actualizar manual de usuario y cuerpo del PR draft.
- Definición de tecnología de generación/embeddings (sin OpenAI).

---

## 9. QA

- `npm run type-check` — ver reporte de ejecución.
- `npm run build` — ver reporte de ejecución.
- `npm run test:unit` — incluye `commercial-engines.test.ts`.

Verificación: cero referencias activas a OpenAI/GPT/Compliance en `src`/`tests`; cero "Motor IA"/"Copiloto IA" como sección activa.
