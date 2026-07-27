# FASE 14H — Estado del schema Leads en dev

**Fecha:** 2026-07-06  
**Proyecto Supabase dev:** `plife-crm`  
**Ref:** `ayvnloxijnfnooaefrlm`  
**Producción:** no tocada

---

## Archivos SQL en repo (reproducibles)

| Archivo | Estado |
|---|---|
| `supabase/leads-schema-draft.sql` | Draft + base aplicada en dev (migración `leads_schema_fase_14g`) |
| `supabase/leads-rls-soft-delete-fix-14gb.sql` | Patch RLS aplicado en dev |
| `docs/product/leads-schema-apply-guide.md` | Guía de aplicación |
| `docs/product/leads-schema-apply-dev-14g.md` | Registro aplicación 14G |
| `docs/product/leads-schema-preflight-14g0.md` | Preflight pre-aplicación |
| `docs/product/leads-rls-soft-delete-fix-14gb.md` | Registro patch 14G-B |

---

## Estado remoto dev (14H)

| Item | Estado |
|---|---|
| Tabla `public.leads` | Aplicada (31 columnas) |
| `opportunities.lead_id` nullable | Aplicada |
| RLS `leads_select` / `leads_insert` / `leads_update` | Activas |
| DELETE físico | Bloqueado (sin policy, sin GRANT DELETE) |
| Soft-delete vía `authenticated` | **NO-GO** (42501 por interacción con `leads_select`) |
| Soft-delete vía service role | OK (solo operaciones admin/SQL) |
| Lectura `SELECT` authenticated | **Permitida** bajo RLS |
| INSERT/UPDATE desde UI | **No habilitados** en FASE 14H |

---

## UI conectada (FASE 14H)

| Ruta | Fuente de datos | Mutaciones |
|---|---|---|
| `/app/leads` | `getLeads()` → Supabase dev | No |
| `/app/pipeline` | `getLeads()` → Supabase dev | No |
| `/app/leads/[leadId]` | `getLeadById()` → Supabase dev | No (acciones mock) |
| `/app/leads/new` | Formulario mock local | No insert real |

`MOCK_LEADS` se conserva en `src/domains/leads/mock-data.ts` para documentación y demos futuros, pero **no** se mezcla en las rutas principales.

---

## Tipos TypeScript

- `npx supabase gen types` no disponible sin `SUPABASE_ACCESS_TOKEN` en este entorno.
- Se añadió manualmente en `src/types/database.ts`:
  - interfaz `Lead`
  - tabla `leads` en `Database.public.Tables`
  - columna `opportunities.lead_id`

---

## Límites explícitos

- No producción, no Vercel, no `.env` modificado.
- No service role en lecturas.
- No server actions de leads.
- No soft-delete desde UI.
- No create/update/delete reales.

---

## Siguiente paso sugerido

Regenerar tipos con CLI autenticado cuando haya token, y luego conectar mutaciones controladas (post-fix soft-delete RLS o función `SECURITY DEFINER`).
