# FASE 14I — Real lead creation in dev

**Fecha:** 2026-07-06  
**Supabase dev ref:** `ayvnloxijnfnooaefrlm`  
**Proyecto:** `plife-crm`  
**Producción:** no tocada  
**Vercel:** no tocado

---

## Alcance

Habilitar creación real de leads desde `/app/leads/new` mediante `createLeadAction` (server action) contra Supabase dev con rol `authenticated` y RLS.

**Incluye:**

- Validación Zod en servidor
- INSERT en tabla `leads`
- Revalidación de listado y pipeline
- Tests unitarios del schema (sin Supabase remoto)

**No incluye:**

- UPDATE / DELETE de leads
- Soft-delete desde UI
- Conversión a oportunidad real
- Cambio de etapa en pipeline (drag/drop)
- Acciones del detalle (convertir, descartar, etc.)
- Service role
- Cambios en producción o Vercel

---

## Campos permitidos (cliente → action)

| Campo | Reglas |
|---|---|
| `title` | Requerido, trim, mínimo 2 caracteres |
| `lead_type` | Opcional; default `unknown` |
| `source` | Opcional; default `manual` |
| `priority` | Opcional; default `medium` |
| `temperature` | Opcional; default `warm` |
| `interest_area` | Opcional, trim |
| `phone` | Opcional, trim |
| `email` | Opcional; formato básico si viene |
| `next_action` | Opcional, trim |
| `next_action_date` | Opcional (ISO date string) |
| `notes` | Opcional, trim |

`metadata` no se acepta desde cliente en esta fase.

---

## Campos bloqueados (solo server)

El schema usa `.strict()` — el cliente no puede enviar:

- `created_by` → `auth.uid()`
- `assigned_to` → `auth.uid()`
- `status` → `open`
- `pipeline_stage` → `nuevo`
- `converted_at`, `discarded_at`, `deleted_at`
- `opportunity_id`, `company_id`, `contact_id`
- Cualquier otro campo no listado en “permitidos”

---

## RLS usada

Política `leads_insert` en dev:

- Usuario autenticado puede insertar si `created_by = auth.uid()`
- `assigned_to` debe ser el usuario actual (o admin según política existente)
- Sin `service_role`; el server action usa `createClient()` de `@/lib/supabase/server`

Tras INSERT, las rutas de lectura (`getLeads`, `getLeadById`) muestran el nuevo lead si cumple `deleted_at IS NULL`.

---

## QA realizada

| Check | Resultado |
|---|---|
| `npm run type-check` | OK |
| `npm run build` | OK |
| `npm run test:unit` | OK — 79 tests |
| Smoke UI `/app/leads/new` | OK — lead `28d0fc3b-a814-42b7-9d21-e0180fed2be4` |
| INSERT solo vía server action | OK — 0 POST `/rest/v1/leads` desde browser |
| UPDATE/DELETE leads desde UI | 0 (sin conexión) |
| Verificación DB dev | OK — `created_by`/`assigned_to` no null, `status=open`, `pipeline_stage=nuevo`, `deleted_at` null |

---

## Riesgos pendientes

1. **Soft-delete RLS**: sigue NO-GO para `authenticated`; no conectado en UI.
2. **Detalle mock residual**: timeline, IA, compliance y panel de acciones siguen demo/deshabilitados.
3. **Asignación**: `assigned_to` siempre es el usuario creador; reasignación admin pendiente.
4. **Auditoría**: `createLeadAction` no llama `log_audit_event` (patrón de contactos/oportunidades pendiente de alinear).
5. **Producción**: schema `leads` no aplicado en prod; esta fase es solo dev.

---

## Archivos tocados

- `src/domains/leads/validation.ts`
- `src/domains/leads/actions.ts`
- `src/components/leads/lead-create-form.tsx`
- `src/app/app/leads/new/page.tsx`
- `tests/unit/leads.test.ts`
- `docs/product/lead-pipeline-technical-design.md`
