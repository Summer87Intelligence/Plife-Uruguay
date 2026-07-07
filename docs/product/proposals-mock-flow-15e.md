# FASE 15E — Flujo mock "Nueva propuesta"

**Fecha:** 2026-07-07
**Rama:** `feat/lead-first-crm` (PR #3, draft, NO-GO para main)
**Roles:** Product Architect + Senior Frontend Engineer + QA Lead
**Naturaleza:** cambio de código (dominio + UI + tests + docs).
**Restricciones respetadas:** no main · no PR #4 · no merge · no push · no Supabase remoto · no Vercel · no `.env` · no SQL · sin OpenAI · sin proveedor externo · sin reintroducir Compliance · **sin persistencia real** · **sin server actions**.

---

## 1. Objetivo

Ofrecer al asesor una experiencia guiada para **armar una nueva propuesta comercial usando los motores**: ordenar una idea, hacer preguntas inteligentes, detectar nicho, definir público, diseñar producto/propuesta, preparar estrategia y sugerir próximos pasos. Todo en **modo mock/determinístico interno**.

---

## 2. Alcance

- Nuevo dominio `src/domains/proposals/`.
- Nuevas rutas `/app/propuestas` (listado + empty state) y `/app/propuestas/nueva` (formulario + resultado).
- Nuevos componentes `proposal-create-form.tsx` y `proposal-draft-view.tsx`.
- Ítem de sidebar **Propuestas**.
- CTA "Crear nueva propuesta" desde `/app/ia` (Motores).
- Generación 100% en cliente/helper determinístico (sin Supabase, sin server action, sin red).

Fuera de alcance: persistencia, server actions, edición/guardado, datos reales de mercado.

---

## 3. Campos del formulario (`ProposalInput`)

| Campo | Requerido | Descripción |
|---|---|---|
| `title` | Sí | Título de la propuesta |
| `context` | Sí | De dónde surge la idea / observación |
| `target_type` | — | `person` / `company` / `segment` / `unknown` |
| `target_description` | — | Descripción del público objetivo |
| `source` | — | `lead` / `campaign` / `radar` / `manual` / `market_observation` / `other` |
| `objective` | — | Qué se busca lograr |
| `known_problem` | — | Problema conocido del cliente |
| `desired_outcome` | — | Resultado deseado |
| `notes` | — | Detalles adicionales |

---

## 4. Salida generada (`ProposalDraft`)

`summary`, `targetAudience`, `problem`, `opportunity`, `proposedOffer`, `differentiators[]`, `questionsToAsk[]`, `marketAngles[]`, `productIdeas[]`, `commercialStrategy[]`, `nextSteps[]`, `risksOrAssumptions[]`, `engineContributions[]`.

Cada `EngineContribution` incluye `engineId`, `engineName`, `questions[]`, `outputs[]`.

La salida usa lenguaje prudente: *"Hipótesis a validar"*, *"Ángulo posible"*, *"Preguntas para confirmar"*, *"Propuesta inicial"*, *"No sustituye análisis comercial humano"*.

---

## 5. Cómo aporta cada motor

| Motor | Aporte en la propuesta |
|---|---|
| **Diagnóstico** | Preguntas para entender necesidad y contexto |
| **Mercado** | Hipótesis de nicho, ángulos de diferenciación, preguntas sobre competidores |
| **Producto** | Estructura de propuesta/producto y variantes posibles |
| **Comercial** | Estrategia de contacto, mensaje inicial y campaña sugerida |
| **Dirección** | Prioridad, potencial y riesgos comerciales |
| **Aprendizaje / Biblioteca** | Materiales internos a consultar y casos/documentos necesarios |

---

## 6. Límites actuales

- El borrador **no se guarda** (sin persistencia).
- Salida **conceptual**; no consulta mercado real ni afirma competidores específicos como hechos.
- No hay **server actions** ni llamadas a Supabase en este flujo.
- No hay edición, exportación ni conversión a oportunidad todavía.

---

## 7. Sin OpenAI

La generación es determinística y local (`generateMockProposal`), sin `fetch`, sin `OPENAI_API_KEY` ni modelos externos.

## 8. Sin Compliance

No se reintroduce Compliance en ninguna forma (ni sección, ni motor, ni validación legal).

## 9. Sin persistencia

No se crean tablas, migraciones ni server actions. El estado del borrador vive sólo en el cliente durante la sesión.

---

## 10. Próximos pasos

- **15F:** diseño Producto/Nicho con mayor profundidad (Motor Mercado + Motor Producto).
- **15G:** conectar propuestas/motores con Leads/Campañas/Radar (prefill desde una entidad).
- Persistencia real de propuestas (tabla + RLS + server actions) cuando se decida el modelo de datos.
- Definición de tecnología de generación (sin OpenAI).

---

## 11. QA

- `npm run type-check` — ver reporte de ejecución.
- `npm run build` — ver reporte de ejecución.
- `npm run test:unit` — incluye `proposals.test.ts` (6 motores, preguntas, próximos pasos, sin OpenAI/Compliance, lenguaje prudente, input mínimo, determinismo).
