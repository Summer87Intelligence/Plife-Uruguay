# FASE 15I — Calificación simple y scoring de Leads

**Fecha:** 2026-07-07
**Rama:** `feat/lead-first-crm`
**Producción / Supabase remoto / Vercel:** no tocados. Sin SQL, sin persistencia nueva, sin push.

---

## Objetivo

Que Leads ayude a **priorizar** (recomendación central de la auditoría 15H):
cada lead muestra una calificación comercial simple, un score de prioridad,
las señales que lo justifican, la siguiente acción recomendada y orientación
para crear una propuesta. Todo calculado en runtime desde los campos actuales
del lead — nada se guarda.

## Referencia conceptual

Clasificación CRM moderna (embudo de calificación por intención y datos),
**simplificada y traducida al vocabulario PLIFE**. Deliberadamente no se usan
las siglas de la industria (MQL, SQL, PQL, Service Qualified Lead) ni en la UI
ni en el código visible: el equipo comercial no debería necesitar un glosario.

## Calificaciones usadas

| Valor | Label | Definición PLIFE |
|---|---|---|
| `unqualified` | Sin calificar | Lead capturado, pero falta información básica |
| `evaluating` | En evaluación | Hay datos iniciales, pero falta entender necesidad, perfil o contexto |
| `interested` | Interesado | Mostró interés real, pero falta confirmar necesidad o próximos pasos |
| `hot` | Caliente | Señales fuertes: temperatura alta, prioridad alta, contacto directo, próximo paso cercano o vencido |
| `ready_for_proposal` | Listo para propuesta | Interés claro, datos suficientes y próximo paso definido |
| `not_viable` | No viable | No corresponde avanzar por ahora; solo se sugiere ante descarte/archivo |

Reglas de sugerencia (`getSuggestedLeadQualification`, en orden):

1. Descartado/archivado (status o etapa) → **No viable**.
2. Convertido → **Listo para propuesta** (registro del punto máximo alcanzado).
3. Interés claro (etapa interesado/propuesta_reunion/seguimiento o temperatura
   caliente) + contacto directo + interés declarado + próximo paso con fecha →
   **Listo para propuesta**.
4. ≥2 señales fuertes (temperatura caliente, prioridad alta, teléfono,
   seguimiento hoy/vencido) → **Caliente**.
5. Interés claro sin lo anterior → **Interesado**.
6. Algún dato inicial (contacto, interés, próximo paso, etapa contactado/
   calificando) → **En evaluación**.
7. Resto → **Sin calificar**.

## Campos usados para el score (0–100, recortado a 100)

| Señal | Puntos |
|---|---|
| Tiene teléfono | +10 |
| Tiene email | +10 |
| Origen WhatsApp / llamada / referido | +15 |
| Temperatura caliente | +20 |
| Prioridad alta | +15 |
| Etapa interesado / propuesta_reunion / seguimiento | +20 |
| Próximo paso con fecha | +10 |
| Interés declarado (`interest_area`) | +10 |

Bandas: 0–29 **Bajo** · 30–59 **Medio** · 60–79 **Alto** · 80–100 **Muy alto**.

Recomendaciones por banda: Bajo "Completar datos antes de avanzar." · Medio
"Calificar necesidad y definir próximo paso." · Alto "Contactar pronto y
preparar enfoque comercial." · Muy alto "Priorizar hoy y considerar propuesta."

## Dónde se muestra

- **Card de lead** (listado y pipeline): chip "Score N" coloreado por banda,
  calificación sugerida y recomendación breve (formato "Score 75 · Caliente ·
  Contactar pronto…"). En modo compacto solo score + calificación.
- **Detalle del lead**: nuevo `LeadQualificationPanel` (columna derecha, arriba
  de Acciones): score con barra, banda, calificación sugerida con descripción,
  señales detectadas con puntos, siguiente acción recomendada y el disclaimer
  "Cálculo interno determinístico. No reemplaza el criterio comercial."
- **Puente a Propuestas**: si banda Alto/Muy alto o calificación Caliente/Listo
  para propuesta, el panel destaca el CTA "Crear propuesta desde este lead"
  (link con contexto, helper compartido `lead-proposal-link.ts`). Si banda
  Bajo/Medio: "Conviene completar información antes de crear una propuesta."
  El CTA del panel de Acciones nunca se bloquea — solo se orienta.

## Mocks reducidos (TAREA 7)

- `LeadAIAssistantMock` retirado del detalle: el panel de calificación cumple
  su promesa (señales + recomendación) con lógica real. El archivo queda en el
  repo por si se reusa; candidato a borrarse en limpieza futura.
- Botones mock del panel de Acciones retirados ("Marcar contactado", "Cambiar
  etapa", "Preparar mensaje", "Descartar lead"): los dos primeros ya son reales
  vía el formulario operativo (14J); descartar llegará con su flujo propio.
- **Pendiente documentado**: `LeadTimelineMock` sigue visible (contexto
  conceptual de historial); se reemplazará cuando exista registro real de
  actividad. `lead-ai-assistant-mock.tsx` queda sin uso.

## Límites

- Score y calificación son **sugerencias en pantalla**: no se guardan, no
  disparan automatismos, no reemplazan el criterio comercial.
- El cálculo usa solo campos del lead; no hay datos de mercado ni históricos.
- Convertidos muestran "Listo para propuesta" como registro del punto máximo;
  cuando exista persistencia de calificación se revisará ese caso.
- Sin IA externa (sin OpenAI ni proveedores); determinístico y auditable.
- Sin persistencia nueva: cero cambios de schema, cero server actions nuevas.

## Próximos pasos

1. **15J** — Propuestas con persistencia: guardar el vínculo lead→propuesta y
   el estado de calificación al momento de crearla.
2. Persistir la calificación confirmada por el asesor (override manual sobre la
   sugerida) cuando haya decisión de schema.
3. Ordenar el listado y PLIFE Hoy por score/prioridad de calificación.
4. Reemplazar `LeadTimelineMock` por actividad real.

## Bug preexistente corregido durante QA

El smoke autenticado detectó que **todo `Button asChild` del producto crasheaba
en runtime** ("Slot failed to slot onto its children", 500 en el detalle del
lead y en cualquier página con ese patrón, incluido el CTA de Propuestas de
15F). Causa: `@radix-ui/react-slot` 1.3.0 exige exactamente un hijo válido y el
`Button` emitía una expresión falsy extra (el slot del spinner de loading),
haciendo `Children.count = 2`. El fix de b8126ae era anterior a esa exigencia.
Corregido en `src/components/ui/button.tsx`: con `asChild` se pasa `children`
solo. Verificado con el smoke (detalle + navegación al CTA de propuesta).

## Archivos tocados

- `src/domains/leads/qualification.ts` (nuevo)
- `src/domains/leads/scoring.ts` (nuevo)
- `src/domains/leads/index.ts` (exports)
- `src/components/leads/lead-proposal-link.ts` (nuevo, extraído de actions panel)
- `src/components/leads/lead-qualification-panel.tsx` (nuevo)
- `src/components/leads/lead-card.tsx`
- `src/components/leads/lead-actions-panel.tsx` (mocks retirados)
- `src/components/leads/lead-detail-view.tsx`
- `tests/unit/lead-qualification.test.ts` (nuevo)
- `src/components/ui/button.tsx` (fix `asChild` con Slot 1.3.0, detectado en QA)
