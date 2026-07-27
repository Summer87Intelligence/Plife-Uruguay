# FASE 14G-0 — Preflight SQL Leads

**Fecha:** 2026-07-06  
**Archivo revisado:** `supabase/leads-schema-draft.sql`  
**Estado SQL:** NO APLICADO (preflight únicamente)  
**Commit base UI mock:** `0a17842` (FASE 14F cerrada con smoke PASS)

---

## Resultado general

**APLICABLE CON AJUSTES MENORES** — tras correcciones en este preflight, decisión final: **GO** para aplicación en Supabase **dev**, siempre que se cumplan los prerequisitos manuales de abajo.

---

## Resumen de validación (TAREA 1)

| # | Criterio | Resultado |
|---|---|---|
| 1 | Idempotencia | **OK** tras ajuste de políticas RLS (ver §Ajustes) |
| 2 | Sin DROP destructivo | **OK** — no hay `DROP TABLE`, `DROP COLUMN`, `TRUNCATE` ni `DELETE` de datos |
| 3 | No borra datos | **OK** — solo `CREATE`/`ALTER ADD` aditivos |
| 4 | Modificación tablas existentes | **OK** — única alteración: `opportunities.lead_id UUID NULL` |
| 5 | FK a tablas existentes | **OK** — `profiles`, `companies`, `contacts`, `campaigns`, `opportunities` |
| 6 | `set_updated_at()` | **OK** — definida en `ai-engine-schema.sql`; draft usa `CREATE OR REPLACE` (seguro) |
| 7 | `is_admin_or_direccion()` | **OK** — precondición + uso en RLS; tipada en `database.ts` |
| 8 | `is_in_my_team()` | **Precondición añadida** — no está en `database.ts` pero documentada en `fix-profiles-rls.sql` como existente en remoto |
| 9 | RLS no bloquea inserts básicos | **OK** — `leads_insert` permite `created_by = auth.uid()` + `assigned_to = auth.uid()` |
| 10 | DELETE bloqueado / soft-delete | **OK** — sin política DELETE, sin `GRANT DELETE`, `deleted_at` + filtro SELECT |
| 11 | Comments correctos | **OK** — referencias a fases corregidas (`14F` → `post-persistencia`) |
| 12 | `radar_source_id` → `companies` | **OK** — comentario inline + `COMMENT ON COLUMN` explícito |

---

## Funciones SQL encontradas en el repo

| Función | Definición local | Uso en leads draft | En `database.ts` |
|---|---|---|---|
| `set_updated_at()` | `supabase/ai-engine-schema.sql` (CREATE OR REPLACE) | Trigger `leads_updated_at` | No (trigger implícito) |
| `is_admin_or_direccion()` | No — creada en Supabase remoto | Precondición + RLS SELECT/INSERT/UPDATE | Sí (`Functions`) |
| `get_user_role()` | No — creada en Supabase remoto | RLS SELECT (`lider_comercial`) | Sí (`Functions`) |
| `is_in_my_team(uuid)` | No — creada en Supabase remoto | RLS SELECT (equipo del líder) | **No** — riesgo de tipos TS pendiente en 14G+ |

**Hallazgo:** las tres funciones de roles son `STABLE SECURITY DEFINER` según `fix-profiles-rls.sql` — no producen recursión RLS en `profiles` ni deberían en `leads`.

---

## Tablas referenciadas

| Tabla | FK desde `leads` | En `database.ts` | Grants existentes (`fix-app-grants.sql` / `fix-profiles-rls.sql`) |
|---|---|---|---|
| `profiles` | `assigned_to`, `created_by` | Sí | `SELECT, UPDATE` |
| `companies` | `company_id`, `radar_source_id` | Sí | `SELECT` |
| `contacts` | `contact_id` | Sí | `SELECT` |
| `campaigns` | `campaign_id` | Sí | `SELECT` |
| `opportunities` | `opportunity_id` (+ inversa `lead_id`) | Sí | `SELECT` |

**Orden de creación FK circular:** correcto. `leads` se crea primero; `opportunities.lead_id` se agrega después. Ambas FKs son nullable con `ON DELETE SET NULL`.

---

## Riesgos RLS

| Riesgo | Severidad | Mitigación |
|---|---|---|
| Helpers de roles ausentes en dev | **Alta** | Precondición aborta si falta cualquiera de las 3 funciones |
| `leads_insert` exige `assigned_to = auth.uid()` para asesores | **Media** | Server actions futuras deben asignar al creador; admin/direccion pueden asignar a otros |
| `lider_comercial` no ve leads sin `assigned_to` | **Baja** | Comportamiento consistente con `profiles` policy |
| Sin `GRANT DELETE` pero con `UPDATE` | **OK** | Soft-delete vía `UPDATE deleted_at` permitido por `leads_update` |
| Open access UI (`NEXT_PUBLIC_INTERNAL_OPEN_ACCESS`) | **Ninguno** | RLS aplica en servidor independientemente de la navegación |

**Inserts básicos futuros:** un asesor autenticado puede insertar si envía `created_by = auth.uid()` y `assigned_to = auth.uid()`. No requiere rol admin.

---

## Riesgos FK

| Riesgo | Severidad | Notas |
|---|---|---|
| `radar_source_id` → `companies` | **Documentado** | Radar opera sobre `companies`; no hay tabla de señales separada |
| `opportunity_id` ↔ `lead_id` bidireccional | **Baja** | Ambas nullable; sin datos migrados al aplicar |
| `ON DELETE SET NULL` en todas las FKs | **OK** | No cascada destructiva |
| Tabla `leads` preexistente con otro shape | **Media** | `IF NOT EXISTS` no corrige shape — verificar prerequisito 3 en apply guide |

---

## Riesgos de idempotencia

| Elemento | Antes del ajuste | Después del ajuste |
|---|---|---|
| `CREATE TABLE IF NOT EXISTS` | OK | OK |
| `CREATE OR REPLACE FUNCTION set_updated_at()` | OK | OK |
| `CREATE OR REPLACE TRIGGER` | OK (PG 14+) | OK |
| `CREATE INDEX IF NOT EXISTS` | OK | OK |
| `ADD COLUMN IF NOT EXISTS` | OK | OK |
| `CREATE POLICY` directo | **Falla en re-run** | **OK** — políticas en bloques `DO $$ IF NOT EXISTS` |
| `GRANT` | OK (idempotente) | OK |
| Precondición helpers | Solo `is_admin_or_direccion` | **OK** — valida las 3 funciones |

---

## Ajustes realizados al SQL (FASE 14G-0)

1. **Precondición ampliada** — valida `is_admin_or_direccion`, `get_user_role` e `is_in_my_team` antes de crear tabla/políticas (bug real: RLS las invocaba sin verificar existencia).
2. **Políticas RLS idempotentes** — `leads_select`, `leads_insert`, `leads_update` creadas solo si no existen (patrón `fix-profiles-rls.sql`).
3. **Comments** — referencias obsoletas a “server actions (14F)” corregidas a “post-persistencia”.

No se agregaron features nuevas.

---

## Recomendaciones antes de aplicar en dev

1. Ejecutar query de prerequisitos de `docs/product/leads-schema-apply-guide.md` §1–3 en SQL Editor de Supabase dev.
2. Confirmar snapshot/backup automático del proyecto dev.
3. Aplicar el archivo completo en una sola transacción (SQL Editor → Run).
4. Ejecutar checks post-aplicación del apply guide (estructura, RLS, índices, conteo `opportunities`).
5. **No** descomentar seed demo hasta validar estructura.
6. **No** regenerar `database.ts` hasta fase 14G de código (fuera de este preflight).
7. Verificar manualmente insert como asesor:
   ```sql
   -- Con JWT de asesor en SQL Editor o vía app futura:
   INSERT INTO leads (title, assigned_to, created_by)
   VALUES ('Smoke dev', auth.uid(), auth.uid());
   ```

---

## Checklist para aplicación dev

- [ ] Rama `feat/operational-readiness` con preflight commiteado
- [ ] 3 funciones helper existen en dev (`is_admin_or_direccion`, `get_user_role`, `is_in_my_team`)
- [ ] 5 tablas referenciadas existen
- [ ] Tabla `leads` no existe previamente (o shape revisado)
- [ ] Backup/snapshot confirmado
- [ ] Ejecutar `supabase/leads-schema-draft.sql` completo
- [ ] Verificar 30 columnas en `leads`
- [ ] Verificar `opportunities.lead_id` nullable
- [ ] Verificar 3 políticas RLS (sin DELETE)
- [ ] Verificar 0 filas en `leads` post-aplicación (sin seed)
- [ ] Conteo `opportunities` sin cambios
- [ ] Rollback documentado disponible si hace falta

---

## Decisión final

### GO — aplicar en Supabase dev

**Condiciones:**

- Prerequisitos manuales del apply guide verificados en el proyecto dev concreto.
- Ajustes de preflight (precondición triple + políticas idempotentes) incluidos en el commit de este documento.
- Aplicación manual por Andrés — **no automática, no remoto prod, no en esta fase**.

**NO-GO si:**

- Falta alguna función helper en dev.
- Existe tabla `leads` con shape distinto al draft.
- No hay backup reciente.

---

## Riesgos pendientes (post-aplicación, no bloquean GO dev)

| Riesgo | Fase futura |
|---|---|
| `is_in_my_team` ausente en `database.ts` | Regenerar tipos en 14G |
| Enum `opportunities.stage` solapado con pipeline leads | Decisión en conversión real (apply guide §Decisión pendiente) |
| Reasignación `assigned_to` por asesores | Server actions + posible policy adicional |
| Migración datos legacy | Explícitamente fuera de scope — 14G+ con autorización |

---

*Preflight FASE 14G-0 — SQL no ejecutado, Supabase remoto no tocado, sin efecto en datos.*
