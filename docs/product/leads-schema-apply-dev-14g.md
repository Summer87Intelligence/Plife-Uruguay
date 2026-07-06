# FASE 14G — Schema Leads aplicado en Supabase dev

**Fecha:** 2026-07-06  
**Proyecto:** `plife-crm`  
**Ref Supabase:** `ayvnloxijnfnooaefrlm`  
**Región:** `sa-east-1`  
**Estado:** APLICADO en **dev únicamente** — no producción, no Vercel, no migración de datos legacy

---

## Confirmación de entorno

| Verificación | Resultado |
|---|---|
| Ref esperado `ayvnloxijnfnooaefrlm` | **Coincide** |
| Nombre proyecto | `plife-crm` |
| ¿Producción? | **No** |
| ¿Summer87/Copilot (`erzdifkvvailxnwdukzf`)? | **No** |
| ¿Summer87 web CRM (`xzxkrzovhcutlgtdqhtn`)? | **No** |

---

## Preflight remoto (pre-aplicación)

| Check | Resultado |
|---|---|
| Tablas `profiles`, `companies`, `contacts`, `campaigns`, `opportunities` | **PASS** (5/5) |
| Tabla `leads` preexistente | **No existe** — OK |
| `set_updated_at()` | **PASS** |
| `is_admin_or_direccion()` | **PASS** |
| `get_user_role()` | **PASS** |
| `is_in_my_team(uuid)` | **PASS** |

**Preflight remoto: PASS**

---

## Aplicación SQL

| Campo | Valor |
|---|---|
| Archivo fuente | `supabase/leads-schema-draft.sql` |
| Migración Supabase | `leads_schema_fase_14g` |
| Resultado | **PASS** |
| Errores durante apply | Ninguno |
| Datos legacy migrados | **No** |

Nota: la migración aplicó el contenido funcional del draft (tabla, índices, FK inversa, RLS, grants). Los `COMMENT ON COLUMN` detallados del draft no se replicaron uno a uno en la migración remota; el comentario de tabla sí. Sin impacto estructural.

---

## Verificación post-aplicación

| Check | Esperado | Obtenido |
|---|---|---|
| Tabla `leads` existe | Sí | **Sí** |
| Columnas | ~30 | **31** (incluye `metadata`) |
| CHECK constraints | 8 + PK + 7 FK | **PASS** (16 constraints listados) |
| Índices en `leads` | 11 | **PASS** (`leads_pkey` + 10 `idx_leads_*`) |
| RLS habilitado | `true` | **true** |
| Política `leads_select` | Sí | **Sí** (`r`) |
| Política `leads_insert` | Sí | **Sí** (`a`) |
| Política `leads_update` | Sí | **Sí** (`w`) |
| Política DELETE | No | **No** (correcto) |
| `opportunities.lead_id` nullable | Sí | **Sí** (`is_nullable = YES`) |
| Índice `idx_opportunities_lead_id` | Sí | **Sí** |
| Oportunidades con `lead_id` | 0 | **0** de 16 |
| Re-run idempotente (índice + grant) | Sin error | **PASS** (`leads_schema_idempotency_check_14g`) |

---

## Insert demo controlado

| Campo | Valor |
|---|---|
| Usuario dev | `andreslarghero15@gmail.com` (`9fb93ddc-7c77-40e1-ab89-1f68ceee8404`, rol `admin`) |
| Simulación RLS | `SET LOCAL ROLE authenticated` + JWT `sub` |
| Resultado INSERT | **PASS** |
| Lead ID | `b5242c53-5df8-435d-a58a-6826e17047ad` |
| `title` | `Lead Demo Dev 14G` |
| Lectura posterior (mismo usuario, RLS) | **PASS** — visible con `deleted_at IS NULL` |
| `companies` / `contacts` / `opportunities` modificados | **No** (solo columna nullable ya existente) |

---

## Soft-delete demo

| Intento | Resultado |
|---|---|
| `UPDATE deleted_at = NOW()` como `authenticated` (RLS) | **FAIL** — `42501: new row violates row-level security policy` |
| `UPDATE` de campo normal (`next_action`) como `authenticated` | **PASS** |
| `UPDATE deleted_at = NOW()` como rol service/postgres | **PASS** (limpieza ejecutada) |

### Causa del FAIL RLS en soft-delete

La política `leads_select` exige `deleted_at IS NULL`. En PostgreSQL, al hacer `UPDATE`, la **versión nueva** de la fila también debe cumplir las políticas aplicables — incluida la de `SELECT`. Al setear `deleted_at`, la fila nueva deja de cumplir `deleted_at IS NULL` y el `UPDATE` es rechazado.

**Mismo patrón** que `contacts_select` en dev (también filtra `deleted_at IS NULL`). No es un fallo de aplicación del schema; es una limitación de diseño RLS a resolver antes de conectar soft-delete desde la app.

### Estado final del demo

| Check | Resultado |
|---|---|
| `deleted_at` no null (lectura service role) | **Sí** |
| Visible para `authenticated` con filtro activo | **No** (0 filas) |
| DELETE físico usado | **No** |

**Soft-delete demo: PASS** (vía service role) / **RLS authenticated soft-delete: FAIL** (documentado)

---

## Errores

| Error | Impacto | Acción |
|---|---|---|
| RLS bloquea soft-delete vía `authenticated` | Medio — bloquea borrado lógico desde cliente | Resolver en fase de server actions (función `SECURITY DEFINER` o ajuste de políticas) |

---

## Riesgos pendientes

1. **Soft-delete vía API autenticada** — requiere diseño antes de server actions de descarte.
2. **`is_in_my_team` ausente en `database.ts`** — pendiente regeneración de tipos.
3. **UI sigue mock** — no lee `leads` reales todavía.
4. **Comentarios de columna** — opcional completar en dev si se quiere paridad 100% con draft.
5. **Producción** — no aplicar hasta validación completa en dev + tipos TS.

---

## Decisión

### GO — para próxima fase (regenerar tipos / lectura controlada)

**Condiciones:**

- UI permanece mock hasta conexión explícita.
- Resolver soft-delete RLS antes de mutaciones de descarte desde app.
- No aplicar en producción ni en otros proyectos Supabase.

---

## Qué NO se hizo

- No push / no merge / no main
- No `.env` modificado
- No Vercel
- No `database.ts` regenerado
- No server actions
- No UI modificada
- No producción
- No migración de datos existentes

---

*Registro FASE 14G — aplicación dev documentada. Ver también §12 en `lead-pipeline-technical-design.md`.*
