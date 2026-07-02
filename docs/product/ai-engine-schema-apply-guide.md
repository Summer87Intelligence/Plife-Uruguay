# Guía de Aplicación — Schema Motor IA PLIFE

## Contexto

Esta guía describe cómo aplicar en Supabase los archivos SQL creados en FASE 12O-B.
**No aplicar en producción sin autorización explícita.**

---

## Archivos SQL creados

| Archivo | Propósito |
|---|---|
| `supabase/ai-engine-schema.sql` | Crea las 8 tablas nuevas del Motor IA, índices, triggers, RLS y grants |
| `supabase/ai-engine-seed.sql` | Inserta datos iniciales: 8 etapas, 7 categorías, 1 perfil, 8 prompts, vínculos |

---

## Tablas NUEVAS que crea el schema

| Tabla | Descripción |
|---|---|
| `ai_stages` | Etapas del pipeline de análisis comercial |
| `ai_categories` | Taxonomía de categorías de prompts |
| `ai_prompts` | Prompts estructurados por campos (NO texto libre) |
| `ai_analysis_profiles` | Perfiles que agrupan prompts para un objetivo |
| `ai_profile_prompts` | Relación N:M perfil ↔ prompt con orden de ejecución |
| `ai_prompt_suggestions` | Sugerencias de mejora por prompt |
| `ai_execution_runs` | Ejecuciones completas de un perfil sobre una entidad |
| `ai_execution_outputs` | Output individual por stage/prompt dentro de un run |

---

## Tablas existentes que NO se tocan

Las siguientes tablas permanecen **completamente intactas**. Este schema no ejecuta ningún `ALTER TABLE` sobre ellas:

- `profiles`
- `teams`, `team_members`
- `contacts`, `companies`, `opportunities`, `activities`, `notes`
- `campaigns`
- `knowledge_documents`, `knowledge_chunks`
- `ai_interactions`
- `ai_prompt_versions` ← tabla del copiloto actual, NO se modifica
- `compliance_rules`, `compliance_reviews`
- `audit_events`
- `training_modules`, `roleplay_sessions`, `objections_library`

---

## Revisión RLS previa a remoto (FASE 12O-B2)

Esta sección documenta el hardening de seguridad realizado antes de aplicar el schema en Supabase. El schema original fue auditado y corregido — leer esta sección completa antes de ejecutar.

### Estado de `is_admin_or_direccion()`

Esta función es la base de **todas las policies de escritura** del Motor IA. No existe en archivos locales — fue creada directamente en Supabase como `STABLE SECURITY DEFINER`.

El schema incluye un bloque `DO` que **aborta la ejecución completa** si la función no existe en el schema `public`. Si la función falta, el SQL Editor mostrará:
```
ERROR: PRECONDICIÓN FALLIDA: la función public.is_admin_or_direccion() no existe.
```

Verificar antes de aplicar:
```sql
SELECT p.proname, n.nspname, p.prosecdef AS security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname = 'is_admin_or_direccion'
  AND n.nspname = 'public';
```

Resultado esperado: **1 fila** con `security_definer = true`.  
Si devuelve 0 filas: no aplicar el schema hasta que la función exista.

### Policies activas por tabla

El schema crea **29 policies** en total (verificar con query de conteo al final de esta sección).

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `ai_stages` | Todos autenticados | Admin/dirección | Admin/dirección | Admin/dirección |
| `ai_categories` | Todos autenticados | Admin/dirección | Admin/dirección | Admin/dirección |
| `ai_prompts` | Todos autenticados | Admin/dirección | Admin/dirección | Admin/dirección |
| `ai_analysis_profiles` | Todos autenticados | Admin/dirección | Admin/dirección | Admin/dirección |
| `ai_profile_prompts` | Todos autenticados | Admin/dirección | Admin/dirección | Admin/dirección |
| `ai_prompt_suggestions` | Solo admin/dirección | Solo admin/dirección | Solo admin/dirección | ❌ No permitido |
| `ai_execution_runs` | Admin/dir. o dueño | Solo si `created_by = auth.uid()` | Admin/dir. o dueño | ❌ No permitido |
| `ai_execution_outputs` | Admin/dir. o dueño del run | Solo si `run.created_by = auth.uid()` | Admin/dir. o dueño del run | ❌ No permitido |

**Motivo de SELECT abierto en tablas de catálogo:** el motor de ejecución (FASE 12O-E) corre como server action con las credenciales del usuario autenticado — que puede ser un asesor. Si el asesor no puede leer el perfil activo, los stages y los prompts, la ejecución falla. La escritura sigue restringida a admin/dirección.

**Motivo de no DELETE en runs y outputs:** los runs y outputs son trazabilidad histórica. Eliminarlos rompería la auditoría de análisis comerciales.

**Motivo de no DELETE en sugerencias:** las sugerencias son un log de calidad de prompts. No deben poder borrarse.

### Correcciones críticas aplicadas (FASE 12O-B2)

| # | Tabla | Problema original | Corrección aplicada |
|---|---|---|---|
| 1 | `ai_execution_runs` | `INSERT WITH CHECK (TRUE)` — cualquier usuario podía crear runs con `created_by` arbitrario | `WITH CHECK (created_by = auth.uid())` |
| 2 | `ai_execution_outputs` | `INSERT WITH CHECK (TRUE)` — cualquier usuario podía inyectar outputs en runs ajenos | Subquery verificando `run.created_by = auth.uid()` |
| 3 | `ai_execution_runs` | `UPDATE` sin `WITH CHECK` — se podía reasignar `created_by` a otro usuario | `WITH CHECK (is_admin_or_direccion() OR created_by = auth.uid())` |
| 4 | `ai_execution_outputs` | `UPDATE` sin `WITH CHECK` | Subquery `WITH CHECK` igual a USING |
| 5 | `ai_analysis_profiles` | `SELECT` restringido a admin — asesor no podía disparar análisis | `USING (TRUE)` |
| 6 | `ai_profile_prompts` | `SELECT` restringido a admin — motor no podía leer qué prompts ejecutar | `USING (TRUE)` |
| 7 | Todas las tablas | `FOR ALL` (semántica OR, confusa para INSERT) | Separadas en SELECT/INSERT/UPDATE/DELETE explícitas |

### Verificar conteo de policies después de aplicar

```sql
SELECT tablename, count(*) AS policies
FROM pg_policies
WHERE tablename IN (
  'ai_stages', 'ai_categories', 'ai_prompts',
  'ai_analysis_profiles', 'ai_profile_prompts',
  'ai_prompt_suggestions', 'ai_execution_runs', 'ai_execution_outputs'
)
GROUP BY tablename
ORDER BY tablename;
```

Resultado esperado:

| tablename | policies |
|---|---|
| ai_analysis_profiles | 4 |
| ai_categories | 4 |
| ai_execution_outputs | 3 |
| ai_execution_runs | 3 |
| ai_profile_prompts | 4 |
| ai_prompt_suggestions | 3 |
| ai_prompts | 4 |
| ai_stages | 4 |

**Total: 29 policies.**

### Cómo probar acceso con diferentes roles

Ejecutar estas queries en el SQL Editor autenticado con cada rol para verificar el comportamiento esperado.

**Con usuario rol `admin` o `direccion` (debe tener acceso completo):**
```sql
-- Debe devolver todas las sugerencias
SELECT count(*) FROM ai_prompt_suggestions;

-- Debe devolver todos los runs de todos los usuarios
SELECT id, entity_type, created_by, status FROM ai_execution_runs LIMIT 5;

-- Debe poder insertar un stage
INSERT INTO ai_stages (id, name, description, icon, color, sort_order)
VALUES (gen_random_uuid(), 'TEST_STAGE', 'Test', 'TestIcon', '#000000', 99);
ROLLBACK; -- deshacer el test
```

**Con usuario rol `asesor` (acceso restringido):**
```sql
-- Debe devolver 0 filas (asesor no puede ver sugerencias)
SELECT count(*) FROM ai_prompt_suggestions;

-- Debe devolver solo sus propios runs
SELECT id, entity_type, created_by, status FROM ai_execution_runs;

-- Debe poder leer stages y prompts (necesario para ejecutar análisis)
SELECT count(*) FROM ai_stages;       -- debe > 0
SELECT count(*) FROM ai_prompts;      -- debe > 0
SELECT count(*) FROM ai_analysis_profiles; -- debe > 0

-- Debe poder insertar run con su propio user_id
-- (reemplazar el UUID por el auth.uid() del usuario de prueba)
-- INSERT INTO ai_execution_runs (entity_type, entity_id, profile_id, created_by, status)
-- VALUES ('company', gen_random_uuid(), '<profile_id>', auth.uid(), 'queued');

-- NO debe poder insertar run con created_by de otro usuario → debe fallar con RLS violation
-- INSERT INTO ai_execution_runs (entity_type, entity_id, profile_id, created_by, status)
-- VALUES ('company', gen_random_uuid(), '<profile_id>', '<otro_user_id>', 'queued');
```

---

## Revisar antes de aplicar

### 1. Confirmar que estás en el proyecto correcto

En el Supabase Dashboard, verificar que el proyecto sea el de PLIFE (no otro).

### 2. Revisar las policies de RLS

El schema usa `is_admin_or_direccion()` como helper de RLS. Esta función debe existir en el proyecto antes de ejecutar el schema. Ver sección "Revisión RLS previa a remoto" para el procedimiento completo.

Verificación rápida:
```sql
SELECT p.proname, n.nspname, p.prosecdef AS security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname = 'is_admin_or_direccion'
  AND n.nspname = 'public';
```

Si devuelve 1 fila: OK, continuar.  
Si devuelve 0 filas: el schema abortará. No continuar.

### 3. Verificar que no hay conflictos de nombre

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'ai_stages', 'ai_categories', 'ai_prompts',
    'ai_analysis_profiles', 'ai_profile_prompts',
    'ai_prompt_suggestions', 'ai_execution_runs', 'ai_execution_outputs'
  );
```

Si devuelve filas, las tablas ya existen. El schema usa `IF NOT EXISTS` — no fallará, pero verificar estado.

### 4. Revisar las constraints

Las constraints de `CHECK` son estrictas. Especialmente:
- `ai_prompts.status` solo acepta: `draft`, `validated`, `archived`
- `ai_execution_runs.entity_type` solo acepta: `company`, `contact`, `opportunity`, `campaign`
- `ai_profile_prompts` tiene `UNIQUE(profile_id, execution_order)` — no pueden haber dos prompts con el mismo orden en el mismo perfil

---

## Procedimiento de aplicación

### Paso 1 — Aplicar el schema

1. Abrir Supabase Dashboard → SQL Editor
2. Abrir el archivo `supabase/ai-engine-schema.sql`
3. Copiar el contenido completo
4. Ejecutar en el SQL Editor
5. Verificar que no haya errores en la salida

### Paso 2 — Aplicar el seed

1. Abrir el archivo `supabase/ai-engine-seed.sql`
2. Copiar el contenido completo
3. Ejecutar en el SQL Editor
4. Verificar que no haya errores en la salida

El seed usa `ON CONFLICT DO UPDATE` — es seguro ejecutarlo múltiples veces.

### Paso 3 — Verificar tablas creadas

```sql
SELECT table_name, (SELECT count(*) FROM pg_policies WHERE tablename = t.table_name) AS policies
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    'ai_stages', 'ai_categories', 'ai_prompts',
    'ai_analysis_profiles', 'ai_profile_prompts',
    'ai_prompt_suggestions', 'ai_execution_runs', 'ai_execution_outputs'
  )
ORDER BY table_name;
```

Debe devolver 8 filas.

### Paso 4 — Verificar seed cargado

```sql
SELECT 'ai_stages'             AS tabla, count(*) FROM ai_stages
UNION ALL
SELECT 'ai_categories',         count(*) FROM ai_categories
UNION ALL
SELECT 'ai_analysis_profiles',  count(*) FROM ai_analysis_profiles
UNION ALL
SELECT 'ai_prompts',            count(*) FROM ai_prompts
UNION ALL
SELECT 'ai_profile_prompts',    count(*) FROM ai_profile_prompts;
```

Resultado esperado:
- ai_stages: 8
- ai_categories: 7
- ai_analysis_profiles: 1
- ai_prompts: 8
- ai_profile_prompts: 8

### Paso 5 — QA local post-migración

```bash
npm run type-check
npm run build
```

Ambos deben pasar sin errores.

---

## Riesgos RLS (post-hardening FASE 12O-B2)

| Riesgo | Estado | Mitigación |
|---|---|---|
| `is_admin_or_direccion()` no existe → schema aborta | Mitigado | Bloque DO de precondición lanza EXCEPTION si falta |
| Motor no puede leer perfil/prompts como asesor | Mitigado | SELECT abierto en tablas de catálogo (`USING (TRUE)`) |
| Asesor puede modificar prompts | Mitigado | INSERT/UPDATE/DELETE restringido a `is_admin_or_direccion()` |
| Usuario puede crear run con `created_by` ajeno | Mitigado | `WITH CHECK (created_by = auth.uid())` en INSERT |
| Usuario puede inyectar outputs en run ajeno | Mitigado | Subquery `run.created_by = auth.uid()` en INSERT de outputs |
| Usuario puede reasignar `created_by` en UPDATE | Mitigado | `WITH CHECK` explícito en UPDATE de runs y outputs |
| Asesor puede ver sugerencias de prompts | Mitigado | `ai_prompt_suggestions` restringido a admin/dirección |
| Runs o outputs borrados → pérdida de trazabilidad | Mitigado | No hay policies DELETE para runs ni outputs |

---

## Checklist antes de ejecutar en Supabase

- [ ] Confirmar proyecto correcto en Dashboard (no otro proyecto)
- [ ] Confirmar rama git correcta: `feat/plife-ai-engine`
- [ ] Verificar que `is_admin_or_direccion()` existe en `public` con `security_definer = true`
- [ ] Revisar que no hay tablas con los mismos nombres (query en "Verificar conflictos")
- [ ] Hacer backup o snapshot del proyecto si es producción
- [ ] Aplicar `ai-engine-schema.sql` — verificar que no hay errores y el bloque DO pasa
- [ ] Verificar conteo de policies: 29 total, distribución correcta por tabla
- [ ] Aplicar `ai-engine-seed.sql`
- [ ] Verificar contadores de filas: 8 stages, 7 categories, 1 profile, 8 prompts, 8 links
- [ ] Probar acceso SELECT desde rol `asesor` → stages/prompts visibles, sugerencias NO visibles
- [ ] Probar INSERT de run desde rol `asesor` con `created_by` propio → OK
- [ ] Probar INSERT de run desde rol `asesor` con `created_by` ajeno → debe fallar
- [ ] Correr `npm run type-check` → PASS
- [ ] Correr `npm run build` → PASS
- [ ] Smoke test manual: login → `/app/hoy` carga sin error

---

## Notas sobre la función `set_updated_at()`

El schema crea o reemplaza la función `set_updated_at()` con `CREATE OR REPLACE FUNCTION`.

Si el proyecto ya tiene una función con ese nombre en Supabase, `OR REPLACE` la sobreescribe con la misma lógica — es equivalente. No hay riesgo.

---

## Orden de ejecución

```
1. ai-engine-schema.sql   (tablas, índices, RLS, grants)
2. ai-engine-seed.sql     (stages, categories, profiles, prompts, vínculos)
```

No invertir el orden. El seed referencia tablas que crea el schema.
