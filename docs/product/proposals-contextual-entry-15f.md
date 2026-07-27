# FASE 15F — Propuestas contextuales (Lead / Campaña / Radar / Manual)

**Fecha:** 2026-07-07
**Rama:** `feat/lead-first-crm` (PR #3, draft, NO-GO para main)
**Roles:** Product Architect + Senior Frontend Engineer + QA Lead
**Naturaleza:** cambio de código (dominio + UI + tests + docs).
**Restricciones respetadas:** no main · no PR #4 · no merge · no push · no Supabase remoto · no Vercel · no `.env` · no SQL · sin OpenAI · sin proveedor externo · sin reintroducir Compliance · **sin persistencia real** · **sin server actions**.

---

## 1. Objetivo

Permitir que el flujo "Nueva propuesta" parta de un contexto de origen: un **lead**, una **campaña**, el **radar B2B** o una **observación manual**. El contexto prellena el formulario y mejora el borrador generado. Todo sigue siendo mock/determinístico y sin persistencia.

---

## 2. Fuentes soportadas

| Origen (`source`) | Entrada |
|---|---|
| `lead` | CTA "Crear propuesta desde este lead" en el detalle del lead |
| `campaign` | CTA "Crear propuesta" en Acciones rápidas del detalle de campaña |
| `radar` | Card "Desde Radar B2B" en `/app/propuestas` (per-item en el radar: pendiente) |
| `manual` / `market_observation` / `other` | Card "Observación manual" y formulario directo |

---

## 3. Cómo se prellena el formulario

`/app/propuestas/nueva` acepta query params seguros, parseados por `parseProposalPrefill`:

- `source` — validado contra los orígenes conocidos.
- `source_id` — referencia local (no se consulta a Supabase).
- `source_title` — usado también como título inicial sugerido.
- `context` — usado como contexto y como `source_context`.
- `target_type` — validado contra los tipos conocidos.
- `target_description`.

Ejemplo:
`/app/propuestas/nueva?source=lead&source_title=Lead%20Demo&context=Consulta%20por%20seguro`

El generador (`generateMockProposal`) usa el contexto de origen para mejorar:
- **resumen** (frase de origen + contexto),
- **preguntas** (pregunta específica por origen),
- **ángulos de mercado** (hipótesis prudente para radar/campaña),
- **próximos pasos** (primer paso según origen),
- salida del **Motor Diagnóstico** (incluye el contexto de origen).

Siempre con lenguaje prudente ("Hipótesis a validar", "Ángulo posible", "Preguntas para confirmar") y sin afirmar datos reales de mercado como hechos.

---

## 4. CTA desde Lead

En `/app/leads/[leadId]` (panel de Acciones) se agregó **"Crear propuesta desde este lead"** que enlaza a `/app/propuestas/nueva` con `source=lead`, `source_id`, `source_title` y un `context` armado con: etapa, interés, próximo paso, temperatura y prioridad. No hace consultas adicionales a Supabase ni crea propuestas reales.

---

## 5. CTA desde Campaña / Radar

- **Campaña:** en `/app/campanas/[id]` (Acciones rápidas) se agregó **"Crear propuesta"** con `source=campaign`, `source_id`, `source_title` y contexto con segmento/objetivo (`target_type=segment`). No toca la lógica de campañas.
- **Radar B2B:** el origen `radar` está disponible desde el hub `/app/propuestas` (card "Desde Radar B2B"). El **CTA por empresa dentro del radar queda pendiente** para una fase posterior, porque la vista `RadarB2BView` concentra bastante lógica y no conviene tocarla en esta fase.

---

## 6. Límites actuales

- Sin persistencia, sin server actions, sin llamadas a Supabase para propuestas.
- CTA por-ítem en radar: pendiente.
- El contexto de origen es solo referencia local; no se resuelven datos del `source_id`.

## 7. Sin persistencia · 8. Sin OpenAI · 9. Sin Compliance

Generación local y determinística. Sin `fetch`, sin `OPENAI_API_KEY`, sin modelos externos. No se reintroduce Compliance en ninguna forma.

---

## 10. Próximos pasos

- CTA por empresa dentro del Radar B2B.
- Resolver `source_id` para traer datos reales del origen (cuando haya persistencia).
- Persistencia real de propuestas (tabla + RLS + server actions).
- Conectar propuestas con oportunidades/campañas de forma bidireccional.

---

## 11. QA

- `npm run type-check` · `npm run build` · `npm run test:unit` (incluye casos contextuales y `parseProposalPrefill`).
