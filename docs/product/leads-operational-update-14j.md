# FASE 14J — Update operativo básico de Lead

**Fecha:** 2026-07-07  
**Supabase dev ref:** `ayvnloxijnfnooaefrlm`  
**Proyecto:** `plife-crm`  
**Producción:** no tocada  
**Vercel:** no tocado

---

## Alcance

Permitir actualizar campos operativos simples de un lead real desde el detalle
(`/app/leads/[leadId]`) mediante `updateLeadOperationalAction` (server action)
contra Supabase dev con rol `authenticated` y RLS.

**Incluye:**

- Schema Zod `updateLeadOperationalSchema` (`.strict()`)
- UPDATE en tabla `leads` filtrado por `id` + `deleted_at IS NULL`
- Verificación post-update con `select('id')` (RLS o lead inexistente → error legible)
- Formulario `LeadOperationalEditForm` en el detalle del lead
- Revalidación de `/app/leads`, `/app/pipeline` y `/app/leads/[leadId]`
- Lectura de `notes` agregada a `getLeads`/`getLeadById` para prefill sin pisar datos
- Tests unitarios del schema y del payload (sin Supabase remoto)

**No incluye:**

- Conversión real a oportunidad (sigue mock)
- Descartar lead (sigue mock)
- Soft-delete desde UI (sigue NO-GO)
- DELETE físico (bloqueado, sin política RLS)
- Drag & drop en pipeline
- Service role
- Cambios en producción o Vercel

---

## Campos permitidos (cliente → action)

| Campo | Reglas |
|---|---|
| `lead_id` | UUID requerido |
| `pipeline_stage` | Requerido; solo etapas activas: `nuevo`, `contactado`, `calificando`, `interesado`, `propuesta_reunion`, `seguimiento` |
| `priority` | Requerido; `low` / `medium` / `high` |
| `temperature` | Requerido; `cold` / `warm` / `hot` |
| `next_action` | Opcional, trim; vacío limpia la columna (null) |
| `next_action_date` | Opcional (ISO date string); vacío limpia la columna |
| `notes` | Opcional, trim; vacío limpia la columna |

Las etapas terminales `convertido` y `descartado` se rechazan a nivel schema:
pertenecen a los flujos de conversión/descarte, todavía no conectados.

---

## Campos bloqueados

El schema usa `.strict()` — el cliente no puede enviar:

- `status` (sigue `open`; solo cambiará por conversión/descarte)
- `deleted_at` (soft-delete sigue NO-GO)
- `created_by`, `assigned_to`
- `converted_at`, `discarded_at`
- `opportunity_id`, `company_id`, `contact_id`
- Cualquier otro campo no listado en “permitidos”

`buildLeadOperationalUpdate` construye el payload solo con las 6 columnas
operativas — ningún campo de sistema llega al UPDATE aunque el schema cambie.

---

## RLS usada

Política `leads_update` en dev (rol `authenticated`):

- `USING` / `WITH CHECK`: `is_admin_or_direccion() OR assigned_to = auth.uid() OR created_by = auth.uid()`
- El server action usa `createClient()` de `@/lib/supabase/server` — sin `service_role`
- El action agrega el filtro `deleted_at IS NULL` y verifica filas afectadas con
  `select('id')`; si RLS bloquea o el lead no existe, devuelve error legible
- No existe política DELETE: el borrado físico sigue bloqueado

---

## Soft-delete y conversión

- **Soft-delete:** sigue **NO-GO** para `authenticated` (fix RLS de 14G-B aplicado,
  pero sin UI ni action conectada). Esta fase no lo toca.
- **Conversión a oportunidad:** sigue **no conectada**; los botones del panel de
  acciones (convertir, descartar, cambiar etapa, etc.) siguen mock/deshabilitados.
- El formulario operativo no se renderiza para leads terminales
  (status ≠ `open` o etapa `convertido`/`descartado`).

---

## QA realizada

| Check | Resultado |
|---|---|
| `npm run type-check` | OK |
| `npm run build` | OK — 23 páginas |
| `npm run test:unit` | OK — 88 tests (9 nuevos de 14J) |
| Smoke Playwright autenticado (dev) | PASS — lead `28d0fc3b-a814-42b7-9d21-e0180fed2be4` |
| Update aplicado | `contactado` / `medium` / `warm` / “Agendar llamada de validación 14J” / hoy+2 / “Actualizado desde FASE 14J” |
| Detalle refleja cambios | OK |
| `/app/leads` refleja cambio | OK |
| `/app/pipeline` mueve el lead a Contactado | OK |
| Verificación DB dev | OK — `status=open`, `deleted_at`/`converted_at`/`discarded_at` null, `updated_at` actualizado |
| UPDATE solo vía server action | OK — 0 requests del browser a `/rest/v1/leads` |
| Terminal convertido/descartado en select | No disponible (assert en smoke) |
| DELETE / soft-delete / service role | 0 |

El spec de smoke fue temporal (no se commitea).

---

## Riesgos pendientes

1. **Soft-delete RLS**: sigue NO-GO para `authenticated`; sin UI.
2. **Conversión/descarte**: mock; `status` puede quedar desalineado si se editara
   la etapa por fuera de la app (mitigado: schema solo acepta etapas activas).
3. **Reasignación**: `assigned_to` no editable; reasignación admin pendiente.
4. **Auditoría**: el action no llama `log_audit_event` (alinear con patrón de
   contactos/oportunidades en fase futura).
5. **Concurrencia**: último write gana; sin optimistic locking sobre `updated_at`.
6. **Producción**: schema `leads` no aplicado en prod; esta fase es solo dev.

---

## Archivos tocados

- `src/domains/leads/validation.ts`
- `src/domains/leads/actions.ts`
- `src/domains/leads/queries.ts` (lectura de `notes` para prefill)
- `src/domains/leads/mock-data.ts` (campo opcional `notes` en `MockLead`)
- `src/components/leads/lead-operational-edit-form.tsx` (nuevo)
- `src/components/leads/lead-detail-view.tsx`
- `tests/unit/leads.test.ts`
- `docs/product/lead-pipeline-technical-design.md`
