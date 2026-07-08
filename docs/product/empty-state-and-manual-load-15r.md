# FASE 15R — Empty states + carga manual mínima

**Fecha:** 2026-07-08  
**Modelo:** Composer 2.5 (continuación de sesión 15Q con Opus 4.8)  
**Rama:** `feat/lead-first-crm`  
**Proyecto dev:** `plife-crm` / `ayvnloxijnfnooaefrlm`  
**Base:** limpieza 15Q (`dev-data-cleanup-15q.md`), UI anti-demo 15P

---

## 1. Objetivo

Validar que PLIFE Growth OS se vea ordenado con base comercial vacía, corregir empty states, cargar **1 lead** y **1 propuesta** controlados, y verificar el flujo lead → propuesta sin reintroducir demo/mocks visibles.

**Restricciones respetadas:** no producción, no `main`, no PR #4, no `feat/operational-readiness-13`, no Vercel, no `.env`, no push, no SQL aplicado en esta fase, no borrado adicional de tablas, no OpenAI, no Compliance.

---

## 2. Estado inicial (base vacía confirmada)

Read-only en Supabase dev **antes** de la carga manual:

| Recurso | Activos | Notas |
|---|---|---|
| leads | 0 | 6 soft-deleted (15Q) |
| proposals | 0 | 3 soft-deleted (15Q) |
| companies | 0 | |
| contacts | 0 | |
| opportunities | 0 | |
| campaigns | 0 | |
| profiles | 1 | Andrés Larghero (admin) |
| teams | 2 | conservados |
| ai_stages / ai_prompts | 8 / 8 | config IA conservada |

---

## 3. Secciones validadas (empty state)

Auditoría de código + smoke lógico post-correcciones:

| Ruta | Resultado | Empty state / CTA |
|---|---|---|
| `/app/hoy` | OK | `isEmpty` considera leads + campañas + asesores; CTA **Nuevo lead** vía guía |
| `/app/leads` | OK | Lista vacía; CTA **Nuevo lead** |
| `/app/pipeline` | OK | Columnas sin cards inventadas |
| `/app/propuestas` | OK | Listado vacío; oculta cards “Crear desde lead/campaña/radar” sin datos; mantiene manual |
| `/app/campanas` | OK | Vacío real; sin métricas infladas |
| `/app/ia` | OK | Sin copy “FASE 12O-D”; mensaje admin user-facing |
| `/app/direccion` | OK corregido | `GettingStartedCard` + pipeline sin barras en cero |
| `/app/admin` | OK corregido | Empty state en tab Agentes IA |

**Criterios cumplidos:** no crash, no datos demo visibles, no métricas seed, no CTAs a rutas ocultas como acción principal.

---

## 4. Empty states corregidos (código)

| Archivo | Cambio |
|---|---|
| `src/app/app/hoy/page.tsx` | Pasa `activeLeadCount` a dashboards |
| `src/app/app/hoy/advisor-dashboard.tsx` | `isEmpty` incluye leads |
| `src/app/app/hoy/direction-dashboard.tsx` | `isEmpty` incluye leads + campañas + asesores |
| `src/app/app/direccion/direccion-view.tsx` | `GettingStartedCard` si base comercial vacía; chart pipeline solo con datos |
| `src/app/app/propuestas/page.tsx` | Oculta “Crear desde” lead/campaña/radar sin fuentes |
| `src/app/app/admin/admin-view.tsx` | Empty state Agentes IA |
| `src/app/app/ia/ia-view.tsx` | Copy admin neutral |
| `src/app/app/leads/new/page.tsx` | Copy producto (sin “Supabase dev”) |
| `src/components/leads/lead-create-form.tsx` | Banner y éxito user-facing |
| `src/components/leads/lead-today-panel.tsx` | Sin referencia a Supabase dev |
| `tests/unit/ui-anti-demo.test.ts` | Assert anti “supabase dev” en flujo crear lead |

---

## 5. Carga manual — lead

| Campo | Valor |
|---|---|
| **Creado** | Sí |
| **Método** | Cliente Supabase autenticado (`signInWithPassword` + `insert` en `leads`) — mismo path RLS que la UI/server action; **no SQL directo** |
| **Motivo fallback** | E2E Playwright falló en login (timeout `/app/hoy`; conflicto puerto 3001 vs dev en 3002) |
| **ID** | `e77676c9-a4b4-44e7-a4df-c9500cb4b389` |
| **Título** | Lead inicial de validación |
| **Origen** | manual |
| **Interés** | protección familiar |
| **Prioridad** | high |
| **Temperatura** | warm |
| **Etapa pipeline** | nuevo |
| **Próximo paso** | Contactar para validar necesidad |
| **Fecha próximo paso** | mañana (2026-07-09) |

---

## 6. Carga manual — propuesta

| Campo | Valor |
|---|---|
| **Creada** | Sí |
| **Método** | Cliente Supabase autenticado (`insert` en `proposals` vinculada al lead) |
| **ID** | `d22f5fad-5bcf-468f-9f7c-fb774543f1b7` |
| **Título** | Propuesta inicial de validación |
| **Origen** | lead → `lead_id` = lead de validación |
| **Estado** | draft |

**Nota:** snapshots de score/calificación no se congelaron en este insert mínimo; el flujo UI completo (`createProposalAction`) sí los genera al guardar desde formulario.

---

## 7. Flujo lead → propuesta validado

| Paso | Estado | Evidencia |
|---|---|---|
| Lead activo en DB | ✓ | 1 lead `deleted_at IS NULL` |
| Aparece en Leads / Pipeline / Hoy | ✓ lógico | Misma query server que listados; etapa `nuevo`, prioridad alta |
| Detalle abre | ✓ | Ruta `/app/leads/{id}` existente |
| Score/calificación | ✓ lógico | Dominio 15I calcula en detalle desde campos del lead |
| Crear propuesta desde lead | ✓ parcial | Propuesta creada con `source=lead` y `lead_id`; UI E2E pendiente |
| Listado propuestas | ✓ | 1 propuesta activa |
| Detalle propuesta | ✓ | Ruta `/app/propuestas/{id}` |

**Flujo UI end-to-end:** pendiente de estabilizar E2E (`tests/e2e/manual-load-15r.spec.ts` añadido; login timeout).

---

## 8. Problemas encontrados

1. **Dirección:** typo JSX `/>` en lugar de `)}` — corregido (rompía type-check).
2. **Copy dev residual:** comentarios “Supabase dev” en formulario/página lead — neutralizados.
3. **E2E:** `manual-load-15r.spec.ts` no completó login; alinear `E2E_BASE_URL` con puerto dev activo.
4. **Build intermitente:** primer `next build` falló en `/_not-found` (ENOENT); segundo intento OK.

---

## 9. Pendientes

| Item | Fase sugerida |
|---|---|
| E2E login estable + flujo UI completo lead→propuesta | 15R follow-up o CI |
| Dirección aún muestra KPIs legacy (oportunidades/contactos/empresas) en cero — migrar a lead-first | 15S |
| Snapshots score/calificación al crear propuesta vía script | usar UI o `createProposalAction` |
| Copy “Supabase dev” en edit form de lead (`lead-operational-edit-form.tsx`) | 15S UI polish |

---

## 10. QA

| Comando | Resultado |
|---|---|
| `npm run type-check` | OK |
| `npm run test:unit` | 170 tests OK (12 archivos) |
| `npm run build` | OK (24 rutas; reintento tras fallo transitorio) |

Smoke rutas: validadas por build + auditoría de componentes; smoke browser manual/E2E pendiente de puerto auth.

---

## 11. Confirmaciones

| Check | Estado |
|---|---|
| Base dev vacía confirmada (pre-carga) | ✓ |
| No producción / main / PR #4 / operational-readiness-13 | ✓ |
| No Vercel / no `.env` / no push / no SQL aplicado | ✓ |
| OpenAI / Compliance no reintroducidos | ✓ |
| 1 lead + 1 propuesta controlados | ✓ |
