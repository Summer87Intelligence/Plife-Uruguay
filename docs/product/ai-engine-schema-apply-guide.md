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

## Revisar antes de aplicar

### 1. Confirmar que estás en el proyecto correcto

En el Supabase Dashboard, verificar que el proyecto sea el de PLIFE (no otro).

### 2. Revisar las policies de RLS

El schema usa `is_admin_or_direccion()` como helper de RLS. Esta función debe existir en el proyecto antes de ejecutar el schema.

Para verificar que existe:
```sql
SELECT proname FROM pg_proc WHERE proname = 'is_admin_or_direccion';
```

Si devuelve 1 fila, la función existe y las policies se aplicarán correctamente.
Si devuelve 0 filas, las policies fallarán. En ese caso, revisar con el equipo técnico.

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

## Riesgos RLS

| Riesgo | Mitigación |
|---|---|
| `is_admin_or_direccion()` no existe → policies fallan | Verificar en paso de pre-check |
| Policies demasiado restrictivas → el motor no puede leer prompts | Se aplica `ai_prompts_select_authenticated` para lectura pública |
| Policies demasiado abiertas → asesor puede modificar prompts | `ai_prompts_write_admin` limita escritura a admin/dirección |
| `ai_execution_runs` INSERT por cualquier usuario | Intencional: el motor crea runs cuando el asesor solicita análisis |
| `ai_execution_outputs` visible para el asesor | Visible solo si él creó el run (`created_by = auth.uid()`) |

---

## Checklist antes de ejecutar en Supabase

- [ ] Confirmar proyecto correcto en Dashboard (no otro proyecto)
- [ ] Confirmar rama git correcta: `feat/plife-ai-engine`
- [ ] Verificar que `is_admin_or_direccion()` existe en el proyecto
- [ ] Revisar que no hay tablas con los mismos nombres
- [ ] Hacer backup o snapshot del proyecto si es producción
- [ ] Aplicar `ai-engine-schema.sql`
- [ ] Aplicar `ai-engine-seed.sql`
- [ ] Verificar contadores de filas en cada tabla
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
