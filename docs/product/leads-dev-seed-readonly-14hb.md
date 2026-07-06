# FASE 14H-B — Dev seed and read-only validation

**Fecha:** 2026-07-06  
**Supabase dev ref:** `ayvnloxijnfnooaefrlm`  
**Proyecto:** `plife-crm`  
**Producción:** no tocada

---

## Seed creado

Se agregaron 3 leads demo activos en **Supabase dev** para validar la lectura real de la UI:

1. `Lead Demo Dev Vida 14HB`
2. `Lead Demo Dev Empresa 14HB`
3. `Lead Demo Dev Seguimiento 14HB`

### IDs creados

| Title | ID | Stage | Estado |
|---|---|---|---|
| `Lead Demo Dev Vida 14HB` | `55921b1d-f2d4-4fa1-a5ac-af2ec76b9dcd` | `nuevo` | `open` |
| `Lead Demo Dev Empresa 14HB` | `49f76fa1-43c9-464f-ba24-b4d4a2f4df1e` | `interesado` | `open` |
| `Lead Demo Dev Seguimiento 14HB` | `5d57fb58-2d75-434f-9529-a84d32fe8667` | `seguimiento` | `open` |

### Cómo se aplicó

- El MCP de Supabase estuvo inestable para escrituras (`OOM` / `502` / `504`).
- Para no tocar producción ni depender de service role, el seed se aplicó con **`supabase-js` autenticado como usuario dev**:
  - URL: `https://ayvnloxijnfnooaefrlm.supabase.co`
  - clave: `NEXT_PUBLIC_SUPABASE_ANON_KEY` local del proyecto dev
  - usuario dev: `andreslarghero15@gmail.com`
- Esto valida que el path de **INSERT authenticated** sigue funcionando bajo RLS.

---

## Validación UI read-only

### `/app/leads`

**PASS**

- Banner visible: `Leads conectados a Supabase dev.`
- Ya no aparece el empty state.
- Se muestran los 3 leads reales.
- No se mezclan `MOCK_LEADS`.

### `/app/pipeline`

**PASS**

- Banner visible: `Pipeline conectado a Supabase dev en modo lectura.`
- Columnas con datos reales:
  - `Nuevo` → `Lead Demo Dev Vida 14HB`
  - `Interesado` → `Lead Demo Dev Empresa 14HB`
  - `Seguimiento` → `Lead Demo Dev Seguimiento 14HB`
- El lead en seguimiento aparece como **vencido** (`05/07/2026 — vencido`).

### Detalle real `/app/leads/[id]`

**PASS**

Se validó apertura real desde los links del listado:

- `/app/leads/55921b1d-f2d4-4fa1-a5ac-af2ec76b9dcd`
- `/app/leads/49f76fa1-43c9-464f-ba24-b4d4a2f4df1e`
- `/app/leads/5d57fb58-2d75-434f-9529-a84d32fe8667`

Checks:

- Banner de detalle conectado a dev visible.
- Datos reales visibles en header, resumen y próximo paso.
- Acciones siguen mock/deshabilitadas.
- IA mock visible.
- Compliance mock visible.
- Conversión:
  - `nuevo` → bloqueada
  - `interesado` / `seguimiento` → ready

### `/app/leads/new`

**PASS**

- Sigue siendo formulario mock.
- El submit genera preview local.
- No hace INSERT real en `leads`.

---

## Red / mutaciones desde UI

Durante el smoke browser:

- `INSERT /rest/v1/leads` desde UI: **0**
- `UPDATE /rest/v1/leads` desde UI: **0**
- `DELETE /rest/v1/leads` desde UI: **0**
- `GET /rest/v1/leads` desde browser: **0**

Nota: las lecturas reales de `leads` se hacen **server-side** en RSC con sesión del usuario, por eso no aparecen requests REST de `leads` en la red del browser.

---

## Estado funcional

- Lectura real en dev: **habilitada**
- UI de creación: **sigue mock**
- Acciones de detalle: **siguen mock**
- Pipeline: **read-only**
- Soft-delete UI: **no conectado**
- Producción: **sin cambios**
- Vercel: **sin cambios**

---

## Limpieza futura

Seed SQL documentado en:

- `supabase/leads-dev-seed-14hb.sql`

Limpieza sugerida:

```sql
UPDATE leads
SET deleted_at = NOW()
WHERE title LIKE 'Lead Demo Dev % 14HB';
```

Recordatorio: el soft-delete directo vía `authenticated` sigue NO-GO; esta limpieza debe ejecutarse con contexto admin/service o mecanismo seguro posterior.
