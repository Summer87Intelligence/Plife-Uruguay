# Guía de Aplicación Futura — Schema Leads (FASE 14B)

**Archivo SQL:** `supabase/leads-schema-draft.sql`  
**Diseño base:** `docs/product/lead-pipeline-technical-design.md` (FASE 14A)  
**Fecha:** 2026-07-06

---

## ⚠️ Estado: NO APLICADO

Este schema es un **borrador revisable**. No fue ejecutado contra ninguna base de datos (local ni remota). No aplicar sin:

1. Revisión humana del SQL completo.
2. Autorización explícita de Andrés.
3. Verificación de prerequisitos (abajo).

---

## Prerequisitos

Antes de aplicar, verificar en el SQL Editor de Supabase:

### 1. Helpers de roles existen

```sql
SELECT p.proname
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('is_admin_or_direccion', 'get_user_role', 'is_in_my_team');
```

Debe devolver **3 filas**. Si falta alguna, el draft aborta en la precondición (por diseño). Estas funciones fueron creadas directamente en Supabase — no hay `CREATE FUNCTION` local.

### 2. Tablas referenciadas existen

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'companies', 'contacts', 'campaigns', 'opportunities');
```

Debe devolver **5 filas**.

### 3. No existe ya una tabla leads

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'leads';
```

Debe devolver **0 filas** (si devuelve 1, revisar qué es antes de aplicar — el draft usa `IF NOT EXISTS` pero un `leads` preexistente con otro shape sería un conflicto conceptual).

### 4. Backup / snapshot

Confirmar que existe backup automático reciente del proyecto Supabase (o crear snapshot manual) antes de aplicar.

---

## Orden de aplicación futuro

1. **`supabase/leads-schema-draft.sql`** completo (precondición → función → tabla → comentarios → índices → alter opportunities → RLS → grants).
2. El seed demo (sección 8 del SQL) queda **comentado** — se ejecuta manualmente solo si se quiere un smoke test con datos.
3. Regenerar tipos TypeScript (fase 14C, no antes):
   - Actualizar `src/types/database.ts` con la entidad `Lead`.
   - Agregar constantes de etapas/labels/colores en `src/lib/constants.ts`.

**No hay pasos intermedios**: es un solo archivo idempotente (`IF NOT EXISTS` / `OR REPLACE`).

---

## Checks post-aplicación

### Estructura

```sql
-- Tabla creada con todas las columnas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'leads'
ORDER BY ordinal_position;
-- Esperado: 30 columnas

-- Columna aditiva en opportunities
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'opportunities' AND column_name = 'lead_id';
-- Esperado: 1 fila, is_nullable = YES
```

### Constraints

```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.leads'::regclass
ORDER BY conname;
-- Esperado: PK, 6 checks de valores, 2 checks de ciclo de vida, 6 FKs
```

### RLS

```sql
-- RLS habilitado
SELECT relrowsecurity FROM pg_class WHERE relname = 'leads';
-- Esperado: true

-- Políticas creadas
SELECT polname, polcmd FROM pg_policy
WHERE polrelid = 'public.leads'::regclass;
-- Esperado: leads_select (r), leads_insert (a), leads_update (w)
-- NO debe existir política de DELETE
```

### Índices

```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'leads';
-- Esperado: pkey + 10 índices idx_leads_*
```

### Oportunidades intactas

```sql
-- El conteo de oportunidades NO debe cambiar tras aplicar
SELECT COUNT(*) FROM opportunities;
-- Todas con lead_id NULL:
SELECT COUNT(*) FROM opportunities WHERE lead_id IS NOT NULL;
-- Esperado: 0
```

---

## Smoke test con lead demo (cuando se aplique)

1. Descomentar el INSERT de la sección 8 del SQL, reemplazando `<ADMIN_PROFILE_ID>` por un `profiles.id` real (query: `SELECT id, email FROM profiles WHERE role = 'admin' LIMIT 1;`).
2. Ejecutar el INSERT.
3. Verificar:
   ```sql
   SELECT title, lead_type, source, status, pipeline_stage, priority, temperature
   FROM leads WHERE title = 'Lead Demo Tutorial PLIFE';
   -- Esperado: defaults correctos (open, nuevo, medium, warm)
   ```
4. Probar transición de etapa:
   ```sql
   UPDATE leads SET pipeline_stage = 'contactado'
   WHERE title = 'Lead Demo Tutorial PLIFE';
   -- updated_at debe cambiar automáticamente (trigger)
   ```
5. Probar constraint de ciclo de vida (debe FALLAR):
   ```sql
   UPDATE leads SET status = 'discarded'
   WHERE title = 'Lead Demo Tutorial PLIFE';
   -- Esperado: ERROR por leads_discarded_requires_fields
   ```
6. Limpiar con soft-delete:
   ```sql
   UPDATE leads SET deleted_at = NOW() WHERE title = 'Lead Demo Tutorial PLIFE';
   ```

---

## Rollback conceptual

Si algo sale mal tras aplicar (antes de que exista código que use la tabla):

```sql
-- 1. Quitar columna aditiva de opportunities (segura: nullable, sin datos)
ALTER TABLE opportunities DROP COLUMN IF EXISTS lead_id;

-- 2. Eliminar tabla leads (segura: sin código productivo que la use en 14B)
DROP TABLE IF EXISTS leads;
```

**Ventana de rollback simple:** solo mientras no exista UI/actions usando `leads` (fases 14C+ en adelante el rollback requiere coordinación con código). La función `set_updated_at()` NO se elimina en rollback — es compartida con el Motor IA.

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Helpers RLS no existen en remoto | Precondición aborta la ejecución completa |
| `leads` preexistente con otro shape | Check de prerequisito 3; `IF NOT EXISTS` no pisa pero tampoco corrige |
| FK circular leads ↔ opportunities | No es circular en creación: `opportunities` existe antes que `leads`; ambas FKs son nullable con `ON DELETE SET NULL` |
| GRANT sin RLS efectiva | RLS se habilita en el mismo archivo antes de los GRANTs; políticas restrictivas por defecto |
| Enum values divergen de tipos TS | 14C regenera tipos desde este schema — el SQL es la fuente de verdad |
| Open access UI temporal (PR #2) | No afecta: RLS filtra en servidor sin importar qué navega el usuario |

---

## Decisión pendiente — OpportunityStage

El enum actual de `opportunities.stage` (11 valores) incluye etapas de prospección temprana (`nueva`, `contactada`, `calificada`) que se solapan con el pipeline de leads.

**Decisión diferida a 14F (conversión):**

- **Corto plazo (14B–14E):** no tocar el enum. Las oportunidades siguen funcionando exactamente igual.
- **Al implementar conversión (14F):** definir convención — las oportunidades creadas desde lead calificado nacen en etapa `reunion_agendada` o posterior (las etapas tempranas quedan para oportunidades legacy).
- **Largo plazo (post-validación):** evaluar reducir el enum con datos reales de uso. Nunca por migración automática en esta fase.

---

## No migrar datos hasta 14F/14G

- Las oportunidades existentes **no** generan leads retroactivos.
- Las empresas del radar **no** se convierten en leads automáticamente.
- Los contactos con `next_action` pendiente **no** se duplican como leads.
- Cualquier migración de datos reales requiere validación del modelo en uso (14F/14G) y autorización explícita.

---

*Guía generada en FASE 14B. El SQL asociado es draft: no aplicado, no ejecutado, sin efecto en Supabase remoto.*
