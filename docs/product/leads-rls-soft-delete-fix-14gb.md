# FASE 14G-B — Soft-delete RLS fix para Leads (dev)

**Fecha:** 2026-07-06  
**Proyecto:** `plife-crm` (Supabase dev)  
**Ref:** `ayvnloxijnfnooaefrlm`  
**Estado:** Patch aplicado **solo en dev**

---

## Causa del bug

- Durante FASE 14G se detectó que:
  - `UPDATE leads SET deleted_at = NOW()` como rol `authenticated` fallaba con `42501: new row violates row-level security policy for table "leads"`.
- Políticas originales:
  - `leads_select.USING` → `deleted_at IS NULL AND (is_admin_or_direccion() OR assigned_to = auth.uid() OR created_by = auth.uid() OR (get_user_role() = 'lider_comercial' AND is_in_my_team(assigned_to)))`.
  - `leads_update.USING` / `WITH CHECK` → solo chequeaban permisos de dueño/admin, sin condicionar `deleted_at`.
- En Postgres, en un `UPDATE`:
  - La fila **nueva** debe cumplir todas las policies aplicables, incluyendo las de `SELECT`.
  - Al setear `deleted_at`, la fila nueva deja de cumplir `deleted_at IS NULL` en `leads_select` → el `UPDATE` es rechazado.

Resultado: soft-delete lógico imposible vía RLS con rol `authenticated`.

---

## Patch aplicado (`supabase/leads-rls-soft-delete-fix-14gb.sql`)

Archivo: `supabase/leads-rls-soft-delete-fix-14gb.sql`  
Scope: proyecto `ayvnloxijnfnooaefrlm` únicamente.

### 1. Reemplazo idempotente de `leads_update`

```sql
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.leads'::regclass
      AND polname = 'leads_update'
  ) THEN
    DROP POLICY "leads_update" ON leads;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.leads'::regclass
      AND polname = 'leads_update'
  ) THEN
    CREATE POLICY "leads_update"
      ON leads FOR UPDATE TO authenticated
      USING (
        is_admin_or_direccion()
        OR assigned_to = auth.uid()
        OR created_by = auth.uid()
      )
      WITH CHECK (
        is_admin_or_direccion()
        OR assigned_to = auth.uid()
        OR created_by = auth.uid()
      );
  END IF;
END
$$;
```

**Importante:** `leads_select` se mantiene igual (filtra `deleted_at IS NULL`), por lo que:
- Soft-deletes (`deleted_at` no null) no son visibles en SELECT normales.
- La política de UPDATE solo controla quién puede mutar filas (incluido `deleted_at`).

---

## QA remoto (dev)

Usuario autenticado de prueba: `andreslarghero15@gmail.com` (`role = admin`, `sub = 9fb9...8404`).

### 1. Insert demo

- INSERT como `authenticated`:
  - `title = 'Lead Demo Dev 14GB Soft Delete'`
  - `source = 'manual'`, `pipeline_stage = 'nuevo'`, `status = 'open'`
  - `assigned_to = created_by = auth.uid()`
- Resultado: **PASS** (lead creado, visible con `deleted_at IS NULL`).

### 2. Update normal

- `UPDATE leads SET next_action = 'Validar soft-delete 14GB' ...`
- Resultado: **PASS** como `authenticated`.

### 3. Soft-delete

- Soft-delete vía `authenticated`:
  - `UPDATE leads SET deleted_at = NOW() ...` → **FAIL** (mismo 42501; Postgres sigue evaluando `leads_select` sobre la fila nueva).
- Soft-delete vía rol de servicio (ejecutado sin `SET ROLE authenticated`):
  - `UPDATE leads SET deleted_at = NOW() ...`
  - Resultado: **PASS** — `deleted_at` no null, lead ya no visible bajo `leads_select`.

### 4. Post soft-delete

- `SELECT` como `authenticated` con filtro `deleted_at IS NULL`:
  - Resultado: **0 filas** (no se ve el demo soft-deleted).
- DELETE físico:
  - `DELETE FROM leads ...` como `authenticated` → **FAIL** (`permission denied`, sin `GRANT DELETE`).

---

## Políticas antes / después (resumen)

| Policy | Antes 14G-B | Después 14G-B |
|---|---|---|
| `leads_select` | USING `deleted_at IS NULL AND permisos` | **Igual** |
| `leads_insert` | `WITH CHECK (created_by = auth.uid() AND (assigned_to = auth.uid() OR is_admin_or_direccion()))` | **Igual** |
| `leads_update` | USING/`WITH CHECK` sobre permisos owner/admin | **Drop + recreate idéntico (confirmado por introspección)** |
| DELETE | Sin policy + sin GRANT DELETE | **Sin cambios** |

**Conclusión técnica:** el patch deja `leads_update` estructuralmente equivalente. El comportamiento 42501 al actualizar `deleted_at` se debe a la combinación con `leads_select` y a cómo Postgres aplica RLS en UPDATE. Soft-delete sigue requiriendo uso de rol de servicio o path alternativo (p. ej. función `SECURITY DEFINER`) si se quiere exponerlo a clientes autenticados.

---

## Riesgos y decisión

| Item | Estado |
|---|---|
| Soft-delete vía service/admin | **OK** |
| Soft-delete vía `authenticated` directamente | **NO-GO** (sigue bloqueado por RLS) |
| DELETE físico | **Bloqueado** (sin GRANT DELETE) |
| UI | Sigue mock, no usa `leads` reales |
| Producción | No tocada |

**Decisión:**  
- Patch 14G-B documenta el límite actual y mantiene seguridad.  
- Para exponer soft-delete a la app se recomienda, en fase posterior:
  - Crear función `SECURITY DEFINER` (`soft_delete_lead(id uuid)`) que haga el `UPDATE deleted_at` bajo privilegios elevados, manteniendo `leads_select` intacta.

---

## GO / NO-GO para siguientes fases

- **GO** para:
  - Regenerar tipos y conectar **lectura** controlada de `leads` dev.
- **NO-GO** (hasta nuevo diseño) para:
  - Soft-delete directo desde UI usando solo rol `authenticated`.

