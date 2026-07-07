# FASE 14K — PLIFE Hoy basado en Leads reales

**Fecha:** 2026-07-07  
**Supabase dev ref:** `ayvnloxijnfnooaefrlm`  
**Proyecto:** `plife-crm`  
**Producción:** no tocada  
**Vercel:** no tocado

---

## Objetivo

Que `/app/hoy` empiece a reflejar el modelo Lead-first: un panel de foco
operativo diario ("Foco de leads") construido sobre los leads reales de
Supabase dev, en paralelo al flujo vigente de oportunidades. Solo lectura.

---

## Buckets

Implementados en `src/domains/leads/dashboard.ts` sobre los helpers de
follow-up existentes (`isLeadFollowUpOverdue`, `isLeadFollowUpToday`,
`isLeadMissingNextStep`) y `isTerminalLeadStage`:

| Bucket | Criterio |
|---|---|
| `newLeads` | `status=open` + `pipeline_stage=nuevo` |
| `overdueLeads` | `next_action_date` < hoy, activo |
| `todayLeads` | `next_action_date` = hoy, activo |
| `missingNextStepLeads` | sin `next_action` o sin `next_action_date`, activo |
| `hotLeads` | `temperature=hot`, activo |
| `followUpLeads` | `pipeline_stage=seguimiento`, activo |

"Activo" = `status=open` y etapa no terminal (`isLeadDashboardActive`).
Los leads `converted`/`discarded`/`archived` y las etapas terminales quedan
fuera de todos los buckets y de `totalActive`.

`getLeadDashboardSummary` devuelve los counts: `totalActive`, `newCount`,
`overdueCount`, `todayCount`, `missingNextStepCount`, `hotCount`,
`followUpCount`.

---

## Datos usados

- Lectura server-side con `getLeads()` (`src/domains/leads/queries.ts`):
  RLS `leads_select` con rol `authenticated`, `deleted_at IS NULL`, límite 200.
- El browser no hace requests a `/rest/v1/leads`; todo se resuelve en el server.
- `LeadTodayPanel` (`src/components/leads/lead-today-panel.tsx`) es un server
  component sin estado: counts, listas compactas (Vencidos, Para hoy,
  Sin próximo paso, Calientes, máx. 5 por lista) y links a
  `/app/leads/[id]`.
- Integración vía prop `leadPanel` en `AdvisorDashboard` y
  `DirectionDashboard`, renderizado después del encabezado con la nota:
  "El nuevo foco Lead-first se muestra en paralelo al flujo vigente."

---

## Límites

- Fechas comparadas por clave `YYYY-MM-DD` local (mismo criterio que el
  follow-up center de oportunidades).
- Listas truncadas a 5 ítems con enlace a `/app/leads` para ver el resto.
- Los buckets no son excluyentes: un lead vencido y caliente aparece en ambos.
- `getLeads()` trae hasta 200 leads; con volúmenes mayores los counts serían
  parciales (aceptable en dev, revisar antes de producción).
- El panel se muestra a todos los roles; la visibilidad por lead la decide RLS.

---

## No mutaciones

- El panel no tiene botones ni acciones: solo links de navegación.
- No hay cambio de etapa desde Hoy, ni soft-delete, ni conversión real.
- No se crearon server actions nuevas; el commit no toca `actions.ts`.
- Sin service role.

---

## QA

| Check | Resultado |
|---|---|
| `npm run type-check` | OK |
| `npm run build` | OK — 23 páginas |
| `npm run test:unit` | OK — 97 tests (9 nuevos de dashboard) |
| Smoke Playwright autenticado (dev) | PASS |
| Panel "Foco de leads" visible en `/app/hoy` | OK, con aviso de Supabase dev |
| Counts vs. DB dev (4 leads activos al 2026-07-07) | OK — Nuevos=1, Vencidos=2, Para hoy=0, Sin próximo paso=0, Calientes=2 |
| Leads 14H-B/14I/14J visibles | OK |
| Link a detalle | OK — abre `/app/leads/[id]` con form operativo |
| `/app/leads`, `/app/pipeline`, detalle | Siguen funcionando |
| Requests browser a `/rest/v1/leads` | 0 (lectura server-side) |
| DELETE / mutaciones desde Hoy | 0 |
| Errores de consola | 0 |

El spec de smoke fue temporal (no se commitea). Nota operativa: `.env.test`
apunta el E2E a `localhost:3001`; el smoke se corrió con dev server en 3001.

---

## Archivos tocados

- `src/domains/leads/dashboard.ts` (nuevo)
- `src/components/leads/lead-today-panel.tsx` (nuevo)
- `src/app/app/hoy/page.tsx`
- `src/app/app/hoy/advisor-dashboard.tsx` (prop `leadPanel`)
- `src/app/app/hoy/direction-dashboard.tsx` (prop `leadPanel`)
- `tests/unit/leads.test.ts`
- `docs/product/lead-pipeline-technical-design.md`
