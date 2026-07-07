# FASE 15A — Rediseño de motores inteligentes: sin OpenAI, sin Compliance

**Fecha:** 2026-07-07
**Rama:** `feat/lead-first-crm` (PR #3, draft, NO-GO para main)
**Roles:** Product Architect + Senior Code Auditor + Release Manager
**Naturaleza:** documento de auditoría y diseño. **No implementa cambios de código.**
**Restricciones:** no main · no PR #4 · no merge · no push (salvo autorización) · no Supabase · no Vercel · no `.env` · sin cambios destructivos sin reporte previo.

---

## 1. Resumen ejecutivo

Se audita el estado actual de los motores de inteligencia, la dependencia de OpenAI y la funcionalidad de Compliance, para preparar una **reorientación del producto**: los motores dejan de ser un "copiloto de conversación + revisor de compliance" y pasan a ser **motores comerciales** orientados a **crear propuestas, diseñar productos, detectar nichos y analizar el mercado**.

Hallazgos clave:

- **OpenAI está integrado como proveedor activo** en la capa `src/lib/ai/*` (chat + embeddings), aunque **degrada limpiamente** cuando no hay `OPENAI_API_KEY` (estados "IA no configurada", fallbacks de texto). El Motor IA de FASE 14 (Lead-first) **ya es mock y explícitamente "sin OpenAI"**.
- **Compliance está profundamente entrelazado** con la detección de riesgo de los agentes (`runAgent` ejecuta `runDeterministicCompliance` sobre cada respuesta). Existe además como **sección/menú/ruta** propia y como tablas en Supabase. Quitarlo del **menú y como sección** es directo; quitar el **concepto por completo** (incluida la red de seguridad determinística anti-promesas) tiene implicancias regulatorias que se marcan como decisión explícita.
- **Los motores actuales** (`advisor_copilot`, `b2b_research`, `compliance_agent`, `campaign_agent` + Motor IA configurable + Conocimiento) están orientados a **asistir conversaciones y cumplimiento**, no a **crear propuestas/productos/nichos**. Requieren rediseño conceptual.

Recomendación: proceder por fases (15B→15H), empezando por retirar OpenAI y Compliance del menú/rutas/config/docs, y luego rediseñar los motores como módulos conceptuales (reglas/mock) sin asumir proveedor externo.

---

## 2. Decisiones del usuario

1. **OpenAI fuera.** No se usará OpenAI en el proyecto. Eliminar toda referencia/dependencia activa. Los motores pueden quedar como **módulos conceptuales / basados en reglas / mock** hasta definir tecnología. **No asumir proveedor externo.**
2. **Compliance fuera** como **sección y concepto de menú**. Retirar ruta `/app/compliance`, ítem de sidebar y su presencia como "sección". (Ver §4 y §9 para la decisión sobre la red de seguridad determinística interna.)
3. **Motores orientados a propuestas/productos/nichos:** los motores deben ayudar a crear propuestas, diseñar productos, detectar nichos, analizar qué venden otros, hacer preguntas inteligentes al asesor y aportar según su especialidad.

---

## 3. Auditoría OpenAI

### 3.1 Código activo (dependencia real de OpenAI)

| Archivo | Tipo | Dependencia | Estado |
|---|---|---|---|
| `src/lib/ai/provider.ts` | Lib server | `fetch https://api.openai.com/v1/chat/completions`, `OPENAI_API_KEY`, modelo `gpt-4o-mini` | **Activo** (degrada sin key) |
| `src/lib/ai/embeddings.ts` | Lib server | `fetch https://api.openai.com/v1/embeddings`, `text-embedding-3-small` | **Activo** (fallback a texto) |
| `src/lib/ai/compliance.ts` | Lib server | Capa 2 usa `chatComplete` (OpenAI) para riesgo 'medio' | **Activo** (capa determinística no usa OpenAI) |
| `src/lib/ai/agents.ts` | Lib server | Orquestador que llama a `chatComplete` | **Activo** |
| `src/lib/ai/prompts.ts` | Lib server | Defaults `model: 'gpt-4o-mini'` | **Activo** |
| `src/lib/ai/trace.ts` | Lib server | Persistencia de interacciones (model/tokens) | Soporte |
| `src/domains/ai/actions.ts`, `src/domains/ai/types.ts` | Server actions/tipos | Invocan agentes | Activo |

### 3.2 UI que consume OpenAI (indirecto)

- `src/app/app/copiloto/*` (Copiloto IA), `src/components/commercial/ai-result.tsx`, `src/components/ia/entity-ai-analysis-card.tsx`, `src/app/app/campanas/[id]/campaign-ai.tsx`, `src/app/app/conocimiento/*` (búsqueda semántica).

### 3.3 Configuración / entorno

- `.env.example`, `docs/technical/env-vars.md`, `docs/technical/staging-deploy.md`, `docs/technical/staging-qa.md`, `docs/technical/ci.md` → mencionan `OPENAI_API_KEY`.
- **Producción (verificado en FASE 14L-B):** `OPENAI_API_KEY` **no** figura entre las env vars de producción; el copiloto en prod ya opera en estado "IA no configurada".

### 3.4 Tests

- `tests/unit/ai-fallback.test.ts`, `tests/e2e/copilot.spec.ts`, `tests/e2e/compliance.spec.ts`, `tests/e2e/admin-system.spec.ts`, `tests/e2e/non-technical-copy.spec.ts`.

### 3.5 SQL / documentación

- `supabase/ai-engine-schema.sql`, `supabase/ai-engine-seed.sql` (campos `model`, prompts con modelo OpenAI).
- Docs: `ai-engine-*.md`, `release-2026-07-02-plife-ai-engine.md`, `copy-style-guide.md`, `qa-test-cases.md`, etc.

### 3.6 Dependencias npm

- **No hay SDK `openai` en `package.json`.** La integración es vía `fetch` directo → eliminarla **no** requiere tocar dependencias, solo código/config.

### 3.7 Propuesta de eliminación (para fase posterior)

- Reemplazar `src/lib/ai/provider.ts` y `embeddings.ts` por un **stub sin proveedor** (o eliminarlos y ajustar consumidores a modo conceptual/mock).
- Neutralizar la capa 2 de OpenAI en `compliance.ts` (o retirar el archivo junto con Compliance, ver §4).
- Quitar `OPENAI_API_KEY` de `.env.example` y docs técnicas.
- Actualizar/retirar tests que asumen OpenAI.
- El Motor IA de Lead-first (`src/domains/ia-engine/mock-runner.ts`) **ya está libre de OpenAI** y sirve de patrón para el modo conceptual.

> **Referencias claramente muertas eliminables de inmediato:** ninguna localizada; toda referencia a OpenAI está en código activo o documentación con contexto. **No se elimina nada en esta fase.**

---

## 4. Auditoría Compliance

### 4.1 Como sección / menú / ruta

| Elemento | Archivo |
|---|---|
| Ruta | `src/app/app/compliance/page.tsx`, `src/app/app/compliance/compliance-view.tsx` |
| Sidebar | `src/components/layout/app-sidebar.tsx` (ítem `Compliance`, icono `ShieldCheck`) |
| Test E2E | `tests/e2e/compliance.spec.ts` |

### 4.2 Como concepto entrelazado (más profundo)

| Elemento | Archivo | Impacto de quitarlo |
|---|---|---|
| Motor de riesgo determinístico + capa IA | `src/lib/ai/compliance.ts` | Usado por `agents.ts` en **cada** ejecución de agente; es red de seguridad anti-promesas de seguros |
| Detección de riesgo en agentes | `src/lib/ai/agents.ts` (`runDeterministicCompliance`) | Quitar deja las respuestas sin filtro de afirmaciones prohibidas |
| Prompt `compliance_agent` | `src/lib/ai/prompts.ts` | Huérfano al quitar Compliance |
| Etapa 'Compliance' | `src/domains/ia-engine/mock-runner.ts` (`STAGE_COPY`) | Quedaría como etapa sin sentido |
| Lead-first (FASE 14) | `src/components/leads/lead-compliance-mock.tsx`, referenciado en `lead-detail-view.tsx`, `lead-actions-panel.tsx` | Componente y referencias huérfanas |
| Tablas Supabase | `compliance_rules`, `compliance_reviews` (tipos en `src/types/database.ts`: `RiskLevel`, `ComplianceAction`, `ComplianceRule`) | **No tocar Supabase ahora**; solo se retiraría del uso en código |
| Guardrails de prompts | `GLOBAL_GUARDRAILS` en `prompts.ts` | Contienen reglas anti-promesa; decisión de conservar como tono |

### 4.3 Rutas a borrar (fase posterior)

- `/app/compliance` (page + view).

### 4.4 Textos a reemplazar

- Sidebar (quitar ítem), guidance/onboarding que mencionan compliance (`getting-started-card.tsx`, dashboards), manual de usuario y glosario.

### 4.5 Componentes que quedarían huérfanos

- `lead-compliance-mock.tsx`, `compliance-view.tsx`, prompt `compliance_agent`, etapa 'Compliance' del mock-runner.

### 4.6 Impacto y decisión a tomar (marcado para el usuario)

Quitar Compliance **como sección/menú/ruta** es de bajo riesgo. Pero `runDeterministicCompliance` funciona hoy como **filtro de seguridad regulatoria** (bloquea "te cubre todo", "garantizado", "aprobación asegurada", etc.) en un producto de **seguros**. Opciones:

- **Opción 1 (recomendada):** retirar Compliance como sección/menú/feature visible, pero **conservar la red determinística como filtro interno silencioso** (renombrado, p. ej. `safe-language-filter`), sin superficie de UI.
- **Opción 2:** eliminar Compliance por completo (sección + concepto + filtro). Mayor riesgo regulatorio; requiere decisión explícita del negocio.

> Esta fase **no borra nada**. La decisión Opción 1/2 debe confirmarse antes de 15C.

---

## 5. Auditoría de motores actuales

| Motor / agente actual | Nombre en código | Ruta/superficie | Qué hace hoy | Qué debería hacer (nueva visión) | Veredicto |
|---|---|---|---|---|---|
| Copiloto Comercial | `advisor_copilot` | `/app/copiloto` | Prepara conversaciones, mensajes, próximos pasos | Base del **Motor Diagnóstico** (preguntas al asesor) | Reorientar |
| Analista B2B | `b2b_research` | Radar B2B, entity analysis | Evalúa potencial B2B de una empresa | Base del **Motor Mercado** (competidores, nichos) | Reorientar |
| Revisor Compliance | `compliance_agent` | `/app/compliance` | Revisa riesgo de mensajes | **Eliminar** como motor (ver §4) | Eliminar/degradar |
| Estratega de campañas | `campaign_agent` | Campañas | Genera material de campaña | Base del **Motor Comercial** | Reorientar |
| Motor IA configurable | `ia-engine` (`/app/ia`) | Pipeline de prompts/etapas/perfiles, **mock** | Orquesta etapas por entidad (ya sin OpenAI) | Chasis de orquestación para los nuevos motores | Reutilizar |
| Conocimiento/embeddings | `src/lib/ai/embeddings.ts`, `/app/conocimiento` | Búsqueda semántica + base de conocimiento | Indexa/busca documentos (OpenAI opcional) | Base del **Motor Aprendizaje / Biblioteca** (sin OpenAI) | Reorientar |
| — (falta) | — | — | — | **Motor Producto** (diseñar propuesta/producto) | Crear |
| — (falta) | — | — | — | **Motor Dirección** (prioridad/potencial/foco/riesgo comercial) | Crear |

**Qué está de más:** revisor de compliance como motor; dependencia OpenAI.
**Qué falta:** Motor Producto y Motor Dirección; orientación explícita a propuestas/nichos/mercado.

---

## 6. Nuevo modelo de motores

Motores como **módulos conceptuales / basados en reglas / mock** (sin OpenAI, sin proveedor externo asumido):

1. **Motor Diagnóstico** — hace preguntas al asesor; entiende necesidad, cliente, contexto y restricciones. *(evoluciona `advisor_copilot`)*
2. **Motor Mercado** — analiza qué venden otros; detecta competidores, nichos y diferenciales. *(evoluciona `b2b_research` + Radar B2B)*
3. **Motor Producto** — diseña la propuesta o producto comercial: público objetivo, valor, argumentos y límites. *(nuevo)*
4. **Motor Comercial** — transforma la propuesta en estrategia de venta: mensaje, campaña, seguimiento. *(evoluciona `campaign_agent` + Copiloto)*
5. **Motor Dirección** — evalúa prioridad, potencial, foco y riesgo comercial. *(nuevo; reutiliza señales de Lead-first/dashboards)*
6. **Motor Aprendizaje / Biblioteca** — usa conocimiento interno, productos, casos y materiales. *(evoluciona Conocimiento sin OpenAI)*

Principios:
- Cada motor tiene **especialidad**; pueden aportar en conjunto sobre un mismo Lead/propuesta.
- Sin OpenAI ni proveedor externo asumido: reglas/plantillas/mock hasta definir tecnología.
- Se apoyan en el chasis de orquestación existente (`ia-engine`) ya libre de OpenAI.

---

## 7. Nuevo menú recomendado (sin Compliance)

**Recomendado (versión simple, con Productos dentro de Propuestas):**

- PLIFE Hoy
- Leads
- Pipeline
- Campañas
- Radar B2B
- Motores
- Propuestas
- Academia / Biblioteca
- Dirección
- Admin

**Decisión "Productos":** por ahora **vive dentro de Propuestas** (una propuesta materializa un producto/paquete comercial; separarlos duplicaría navegación sin volumen que lo justifique). Se **promueve a sección propia** más adelante si el catálogo de productos crece o requiere gestión independiente.

**Fuera del menú (respecto al actual):** Compliance (eliminado), Copiloto IA / Motor IA / Conocimiento se **consolidan** bajo **Motores** + **Academia/Biblioteca**. Contactos/Empresas/Oportunidades siguen existiendo como entidades; se puede evaluar su jerarquía en una fase de IA de navegación posterior (fuera de 15A).

---

## 8. Archivos a modificar en fase posterior (no ahora)

**Retiro OpenAI (15B):**
- `src/lib/ai/provider.ts`, `embeddings.ts`, `agents.ts`, `prompts.ts`, `trace.ts`, `src/domains/ai/*`.
- Consumidores UI: `copiloto/*`, `components/ia/*`, `components/commercial/ai-result.tsx`, `campanas/[id]/campaign-ai.tsx`, `conocimiento/*`.
- Config/docs: `.env.example`, `docs/technical/env-vars.md`, `staging-*.md`, `ci.md`.
- Tests: `ai-fallback.test.ts`, `copilot.spec.ts`, `admin-system.spec.ts`, `non-technical-copy.spec.ts`.

**Retiro Compliance (15C):**
- `src/app/app/compliance/*` (ruta), sidebar, `lead-compliance-mock.tsx` + referencias en `lead-detail-view.tsx` / `lead-actions-panel.tsx`.
- `src/lib/ai/compliance.ts` (según decisión Opción 1/2), prompt `compliance_agent`, etapa 'Compliance' en `mock-runner.ts`.
- `tests/e2e/compliance.spec.ts`; docs y manual.
- **Supabase (`compliance_rules`, `compliance_reviews`): NO se toca**; solo se retira del uso en código.

**Rediseño motores (15D+):**
- `src/domains/ia-engine/*`, `src/components/ia/*`, `/app/ia`, sidebar (nuevo ítem **Motores**), nuevas rutas **Propuestas** (y Productos embebido).

---

## 9. Riesgos

1. **Regulatorio (alto):** quitar la red determinística de compliance elimina el filtro anti-promesas en un producto de seguros. → Preferir Opción 1 (§4.6).
2. **Componentes huérfanos:** múltiples componentes/tests quedan sin uso; requieren limpieza coordinada para no romper el build.
3. **Acoplamiento agentes↔compliance:** `runAgent` depende de `runDeterministicCompliance`; retirarlo exige refactor cuidadoso del orquestador.
4. **Alcance grande:** ~40 archivos tocan IA/Compliance; conviene fasear para mantener el build verde en cada paso.
5. **Tipos Supabase:** `RiskLevel`/`ComplianceAction`/tablas en `database.ts`; al no tocar Supabase, los tipos pueden quedar declarados sin uso (aceptable temporalmente).
6. **Motores conceptuales sin proveedor:** riesgo de que "Motores" quede como UI sin capacidad real hasta definir tecnología; mitigar con salida mock/plantillas útil (patrón `mock-runner.ts`).
7. **PR draft desactualizado:** PR #3 describe el estado Lead-first; deberá actualizarse tras 15B-15H.

---

## 10. Plan de implementación por fases

| Fase | Objetivo | Naturaleza |
|---|---|---|
| **15A** | Auditoría + diseño (este documento) | Docs (esta fase) |
| **15B** | Remover OpenAI del código/config/docs (stub sin proveedor; UI en modo conceptual) | Código |
| **15C** | Remover Compliance del menú/rutas/docs (según decisión Opción 1/2) | Código |
| **15D** | Rediseñar Motores como motores comerciales (Diagnóstico/Mercado/Producto/Comercial/Dirección/Aprendizaje) sobre el chasis `ia-engine` | Código |
| **15E** | Crear flujo "Propuesta nueva" (Motor Producto + Motor Comercial) | Código |
| **15F** | Crear diseño Producto/Nicho (Motor Mercado + Motor Producto) | Código |
| **15G** | Conectar Motores con Leads/Campañas/Radar | Código |
| **15H** | Actualizar manual de usuario y cuerpo del PR draft | Docs |

Cada fase debe cerrar con `type-check` + `test:unit` + `build` verdes y sin push a main. **No implementar todavía.**

---

## 11. Confirmaciones de esta fase

- No se modificó código de producto (solo se creó este documento).
- No main, no PR #4, no merge, no push (salvo autorización), no Supabase, no Vercel, no `.env`.
- No se eliminó ningún archivo ni referencia.
