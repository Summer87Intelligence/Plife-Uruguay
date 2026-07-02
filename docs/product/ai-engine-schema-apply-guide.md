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

### Paso 2 — Aplicar los triggers de inmutabilidad

1. Abrir el archivo `supabase/ai-engine-immutability.sql`
2. Copiar el contenido completo
3. Ejecutar en el SQL Editor
4. Verificar que no haya errores en la salida

Este archivo crea dos funciones trigger y dos triggers `BEFORE UPDATE`. Usa `CREATE OR REPLACE` — es idempotente.

### Paso 3 — Aplicar el seed

1. Abrir el archivo `supabase/ai-engine-seed.sql`
2. Copiar el contenido completo
3. Ejecutar en el SQL Editor
4. Verificar que no haya errores en la salida

El seed usa `ON CONFLICT DO UPDATE` — es seguro ejecutarlo múltiples veces.

### Paso 4 — Verificar tablas creadas y triggers

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

Verificar también los triggers de inmutabilidad:
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name IN (
  'ai_execution_runs_immutable_context',
  'ai_execution_outputs_immutable_output'
);
```
Debe devolver 2 filas — una por tabla.

### Paso 5 — Verificar seed cargado

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

### Paso 6 — QA local post-migración

```bash
npm run type-check
npm run build
```

Ambos deben pasar sin errores.

---

## Remediación FASE 12O-B4

Esta sección documenta los hallazgos F-02, F-03 y F-04 de la auditoría de penetración RLS (FASE 12O-B3) y sus correcciones aplicadas antes de la UI.

### F-02 — `ai_execution_runs.created_by` NOT NULL (cerrado)

**Problema:** El campo `created_by` estaba definido como `UUID` sin restricción `NOT NULL`. RLS bloqueaba `NULL` para usuarios autenticados, pero el rol `service_role` (que bypasea RLS) podría insertar runs con `created_by = NULL`. Esos runs quedarían en un estado inaccesible: ningún usuario autenticado podría verlos ni modificarlos.

**Corrección en `ai-engine-schema.sql`:**
```sql
-- Antes (vulnerable):
created_by    UUID,

-- Después (F-02 cerrado):
created_by    UUID        NOT NULL,
```

**Garantía:** `NOT NULL` aplica a todos los roles incluyendo `service_role`. El server action del motor (FASE 12O-E) debe siempre pasar `created_by = user.id` — si no lo hace, el INSERT falla a nivel de DB antes de evaluar RLS.

---

### F-03 — Inmutabilidad de campos de contexto del run (cerrado)

**Problema:** Las policies RLS verifican quién puede actualizar un run, pero no qué campos puede cambiar. Un asesor podía reasignar retroactivamente `entity_id`, `entity_type` o `profile_id` de sus propios runs, alterando el contexto histórico de un análisis ya generado.

**Corrección en `ai-engine-immutability.sql`:** Trigger `BEFORE UPDATE` que aborta cualquier intento de modificar los campos de contexto, sin importar el rol.

**Campos INMUTABLES post-INSERT (protegidos por trigger):**
| Campo | Razón |
|---|---|
| `entity_id` | Empresa/contacto/oportunidad analizada — no puede cambiar |
| `entity_type` | Tipo de entidad — inmutable por integridad referencial semántica |
| `profile_id` | Perfil de análisis usado — define el conjunto de prompts ejecutados |
| `created_by` | Usuario que disparó la ejecución — inmutable por trazabilidad |

**Campos ACTUALIZABLES por el motor:**
| Campo | Cuándo |
|---|---|
| `status` | Motor actualiza: `queued → running → completed/failed` |
| `started_at` | Motor registra inicio de ejecución |
| `finished_at` | Motor registra fin de ejecución |
| `error_message` | Motor registra errores de ejecución |

**El trigger aplica también con `service_role`** — es la capa de protección que RLS no puede ofrecer.

---

### F-04 — Inmutabilidad del output completado (cerrado)

**Problema:** Las policies RLS permitían que el dueño de un run actualizara el campo `output` (texto del análisis generado por IA) incluso después de que el análisis estaba completado. Esto permitía reescribir retroactivamente el resultado de un análisis comercial.

**Corrección en `ai-engine-immutability.sql`:** Trigger `BEFORE UPDATE` que bloquea la modificación del campo `output` cuando `OLD.status = 'completed'`.

**Regla:** El campo `output` es inmutable una vez que `status = 'completed'`. El motor puede actualizar metadata operativa aun después de completado.

**Tabla de restricciones post-completado:**
| Campo | ¿Modificable con status=completed? | Razón |
|---|---|---|
| `output` | ❌ No (trigger bloquea) | Integridad del análisis generado |
| `status` | ✅ Sí (puede pasar a 'failed') | Error puede detectarse post-análisis |
| `tokens_input` | ✅ Sí | Puede registrarse después del output |
| `tokens_output` | ✅ Sí | Ídem |
| `cost_estimate` | ✅ Sí | Ídem |
| `duration_ms` | ✅ Sí | Ídem |
| `error_message` | ✅ Sí | Puede registrarse post-completado |

**El trigger aplica también con `service_role`** — ningún proceso backend puede reescribir un output completado.

---

### Checklist de validación post-schema (inmutabilidad)

Ejecutar después de aplicar `ai-engine-immutability.sql`:

```sql
-- Verificar que los triggers existen
SELECT trigger_name, event_object_table, action_timing
FROM information_schema.triggers
WHERE trigger_name IN (
  'ai_execution_runs_immutable_context',
  'ai_execution_outputs_immutable_output'
);
-- Resultado esperado: 2 filas

-- Verificar que las funciones trigger existen
SELECT proname FROM pg_proc
WHERE proname IN ('prevent_run_context_change', 'prevent_output_rewrite')
  AND pronamespace = 'public'::regnamespace;
-- Resultado esperado: 2 filas

-- Test rápido F-03 (necesita un run existente)
-- Intentar cambiar entity_id → debe fallar
-- UPDATE ai_execution_runs SET entity_id = gen_random_uuid() WHERE id = '<run_id>';

-- Test rápido F-04 (necesita un output con status = 'completed')
-- Intentar cambiar output → debe fallar
-- UPDATE ai_execution_outputs SET output = 'test' WHERE id = '<output_id_completed>';
```

Para el conjunto completo de pruebas, ejecutar `supabase/ai-engine-pentest.sql`.

---

## Riesgos RLS (post-hardening FASE 12O-B2)

| Riesgo | Estado | Mitigación |
|---|---|---|
| `is_admin_or_direccion()` no existe → schema aborta | Mitigado | Bloque DO de precondición lanza EXCEPTION si falta |
| Motor no puede leer perfil/prompts como asesor | Mitigado | SELECT abierto en tablas de catálogo (`USING (TRUE)`) |
| Asesor puede modificar prompts | Mitigado | INSERT/UPDATE/DELETE restringido a `is_admin_or_direccion()` |
| Usuario puede crear run con `created_by` ajeno | Mitigado | `WITH CHECK (created_by = auth.uid())` en INSERT |
| Usuario puede inyectar outputs en run ajeno | Mitigado | Subquery `run.created_by = auth.uid()` en INSERT de outputs |
| Usuario puede reasignar `created_by` en UPDATE | Mitigado | `WITH CHECK` + trigger `prevent_run_context_change` |
| **F-02**: `created_by = NULL` via service_role | **Mitigado (B4)** | `NOT NULL` en DDL — aplica a todos los roles |
| **F-03**: Asesor reasigna `entity_id`/`profile_id` del run | **Mitigado (B4)** | Trigger `ai_execution_runs_immutable_context` |
| **F-04**: Asesor reescribe `output` completado | **Mitigado (B4)** | Trigger `ai_execution_outputs_immutable_output` |
| Asesor puede ver sugerencias de prompts | Mitigado | `ai_prompt_suggestions` restringido a admin/dirección |
| Runs o outputs borrados → pérdida de trazabilidad | Mitigado | No hay policies DELETE para runs ni outputs |

---

## Checklist antes de ejecutar en Supabase

**Pre-aplicación:**
- [ ] Confirmar proyecto correcto en Dashboard (no otro proyecto)
- [ ] Confirmar rama git correcta: `feat/plife-ai-engine`
- [ ] Verificar que `is_admin_or_direccion()` existe en `public` con `security_definer = true`
- [ ] Revisar que no hay tablas con los mismos nombres (query en "Verificar conflictos")
- [ ] Hacer backup o snapshot del proyecto si es producción

**Aplicación (en orden):**
- [ ] Aplicar `ai-engine-schema.sql` — verificar que no hay errores y el bloque DO pasa
- [ ] Aplicar `ai-engine-immutability.sql` — verificar 0 errores
- [ ] Aplicar `ai-engine-seed.sql` — verificar 0 errores

**Verificaciones post-aplicación:**
- [ ] Conteo de policies: 29 total (query en sección "Revisión RLS")
- [ ] Conteo de triggers: 2 (ai_execution_runs_immutable_context, ai_execution_outputs_immutable_output)
- [ ] Conteo de filas seed: 8 stages, 7 categories, 1 profile, 8 prompts, 8 links
- [ ] `ai_execution_runs.created_by` es NOT NULL — verificar con `\d ai_execution_runs` o inspección en Dashboard

**Tests de seguridad:**
- [ ] SELECT desde rol `asesor` → stages/prompts visibles, sugerencias NO visibles
- [ ] INSERT run con `created_by` propio → OK
- [ ] INSERT run con `created_by` ajeno → debe fallar (RLS)
- [ ] INSERT run sin `created_by` → debe fallar (NOT NULL constraint)
- [ ] UPDATE `entity_id` de run propio → debe fallar (trigger F-03)
- [ ] UPDATE `output` de output completado → debe fallar (trigger F-04)
- [ ] UPDATE `status` de run propio → debe funcionar (campo permitido)
- [ ] UPDATE metadata (`tokens_input`, `cost_estimate`) de output completado → debe funcionar

**QA local:**
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
1. ai-engine-schema.sql        (tablas, índices, RLS, grants, NOT NULL en created_by)
2. ai-engine-immutability.sql  (triggers de inmutabilidad post-INSERT)
3. ai-engine-seed.sql          (stages, categories, profiles, prompts, vínculos)
```

No invertir el orden. El seed referencia tablas que crea el schema. Los triggers deben existir antes de que cualquier dato de producción pase por UPDATE.

---

## Registro FASE 12O-D (2026-07-02) — aplicación remota COMPLETADA

**Estado:** APLICADO — schema, immutability y seed ejecutados en proyecto `ayvnloxijnfnooaefrlm`.

### Aplicación ejecutada (orden)

1. `ai-engine-schema.sql` — vía MCP `apply_migration` (4 partes: tablas, índices+RLS, policies catálogo, policies ejecución+grants)
2. `ai-engine-immutability.sql` — triggers `prevent_run_context_change`, `prevent_output_rewrite`
3. `ai-engine-seed.sql` — stages, categories, profile, prompts 1–8, profile_prompts links

### Conteos post-seed (validados)

| Tabla | Conteo |
|---|---|
| ai_stages | 8 |
| ai_categories | 7 |
| ai_prompts | 8 |
| ai_analysis_profiles | 1 |
| ai_profile_prompts | 8 |

Perfil **Comercial PLIFE**: `is_active = true`

### RLS / policies

29 policies activas (8 tablas). Helper `is_admin_or_direccion()` verificado antes de aplicar.

### Pentest parcial (2026-07-02)

| Test | Resultado |
|---|---|
| Admin lee catálogo (stages/prompts) | PASS |
| INSERT run con `created_by = auth.uid()` | PASS |
| INSERT run con `created_by` ajeno | BLOCKED (RLS) |
| UPDATE `entity_id` post-INSERT (F-03) | BLOCKED (trigger) |
| UPDATE `output` con status=completed (F-04) | BLOCKED (trigger) |
| 29 policies contadas | PASS |
| Tests cross-user asesor | PENDIENTE — no hay usuario `asesor` en remoto |

### UI `/app/ia` post-aplicación

Smoke Playwright (admin, puerto dev 3003):

- Sidebar **Motor IA** visible
- Título **Motor IA** carga
- Sin banner schema/PGRST205/error DB
- Tabs: Dashboard, Categorías, Perfiles
- Dashboard: 8 etapas, 7 categorías, 8 prompts, 1 perfil, 8 vínculos
- **Configuración lista** — 1 perfil activo con prompts vinculados

### QA técnico post-aplicación

| Comando | Resultado |
|---|---|
| `npm run type-check` | PASS |
| `npm run build` | PASS |
| `npm run test:unit` | PASS (24/24) |

---

## Registro FASE 12O-D (2026-07-02) — intento bloqueado (histórico)

**Estado:** BLOQUEADO — schema, immutability y seed **no aplicados** en remoto.

### Pre-checks completados (antes de aplicar)

| Check | Resultado |
|---|---|
| Rama `feat/plife-ai-engine` | OK |
| Working tree limpio | OK (restaurado `.claude/settings.local.json`) |
| Último commit | `1f05ad6` |
| `is_admin_or_direccion()` en remoto | **SÍ** — RPC devuelve `true` para usuario admin autenticado |
| Tablas Motor IA en remoto | **NO** — PostgREST `PGRST205` (`ai_stages` no en schema cache) |
| Revisión SQL local (schema/seed/immutability/pentest) | OK — sin riesgos bloqueantes detectados |

### Bloqueo de aplicación

No fue posible ejecutar DDL en Supabase remoto desde este entorno:

1. **Plugin MCP Supabase** (`plugin-supabase-supabase`) en estado `error` / sin OAuth activo en la sesión Cursor actual.
2. **Sin credenciales de DB en entorno:** no hay `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` ni `SUPABASE_ACCESS_TOKEN`.
3. **Supabase CLI** no autenticado (`supabase login` requiere token interactivo).
4. **`psql`** no instalado en el host Windows.

### UI `/app/ia` (sin schema aplicado)

Smoke test Playwright con usuario admin (`.env.test`):

- Login OK, sidebar muestra **Motor IA**.
- Pantalla carga título **Motor IA**.
- Muestra banner de error DB: `Could not find the table 'public.ai_stages' in the schema cache` (código PostgREST `PGRST205`, no `42P01`).
- **No** muestra aún el banner naranja “Schema del Motor IA no aplicado” (la UI distingue `42P01` de otros errores Supabase).

### QA técnico local (post-intento)

| Comando | Resultado |
|---|---|
| `npm run type-check` | PASS |
| `npm run build` | PASS |
| `npm run test:unit` | PASS (24/24) |

### Próximo paso para desbloquear

1. Re-autenticar plugin MCP Supabase en Cursor **o** proveer `DATABASE_URL` / password de Postgres del proyecto `ayvnloxijnfnooaefrlm`.
2. Ejecutar en orden: `ai-engine-schema.sql` → `ai-engine-immutability.sql` → `ai-engine-seed.sql`.
3. Correr verificaciones de conteo y `ai-engine-pentest.sql` (requiere usuarios `pentest_admin@plife.uy` / `pentest_asesor@plife.uy` si no existen).
4. Re-validar `/app/ia` — debe desaparecer el error y mostrar seed (8 prompts, 7 categorías, perfil Comercial PLIFE).
