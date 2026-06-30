# Guía de deploy en staging (Vercel)

Referencia operativa para dejar una instancia de PLIFE Growth OS corriendo en Vercel conectada a Supabase.

---

## Pre-requisitos

- Proyecto Supabase existente con schema, RLS y datos demo aplicados.
- Cuenta Vercel (plan Hobby o superior).
- Repositorio Git accesible desde Vercel (GitHub / GitLab / Bitbucket).
- `fix-app-grants.sql` ya aplicado en el proyecto Supabase (ver sección abajo).

---

## 1. Crear proyecto en Vercel

1. Ir a [vercel.com](https://vercel.com) → **Add New Project**.
2. Importar el repositorio `PlifeUruguay`.
3. Framework: **Next.js** (detectado automáticamente).
4. Root directory: `/` (raíz del repo).
5. Build command: `next build` (por defecto — no cambiar).
6. Output directory: `.next` (por defecto — no cambiar).
7. **No tocar** las variables de entorno todavía — configurarlas en el paso siguiente antes de hacer Deploy.

---

## 2. Variables de entorno en Vercel

En el panel del proyecto → **Settings → Environment Variables**, agregar:

| Variable | Entorno | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | URL del proyecto Supabase (`https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Anon key pública del proyecto |
| `OPENAI_API_KEY` | Production, Preview | Opcional. Si está ausente, copiloto muestra estado "IA no configurada" |
| `NEXT_PUBLIC_APP_URL` | Production, Preview | URL pública del deploy (`https://tu-proyecto.vercel.app`) |
| `NEXT_PUBLIC_DEMO_MODE` | Production, Preview | `true` para staging con datos demo. `false` u omitir para producción |

**Cómo obtener los valores de Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL`: Panel Supabase → Settings → API → Project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Panel Supabase → Settings → API → `anon public`.

**Importante:** `NEXT_PUBLIC_*` son inlined en build time. Cualquier cambio requiere un redeploy.

---

## 3. Configurar Supabase Auth — Redirect URLs

El proyecto usa `signInWithPassword` (email/password), **no OAuth ni magic links**. Aún así, para que los emails de Supabase (invite, password reset) funcionen correctamente:

1. Panel Supabase → **Authentication → URL Configuration**.
2. **Site URL**: poner la URL del deploy: `https://tu-proyecto.vercel.app`
3. **Redirect URLs** (Additional Redirect URLs): agregar:
   ```
   https://tu-proyecto.vercel.app/**
   https://tu-proyecto.vercel.app/login
   ```
4. Para previews de Vercel, agregar también:
   ```
   https://*.vercel.app/**
   ```

---

## 4. Aplicar fix-app-grants.sql (si no está aplicado)

Los GRANTs de la tabla `authenticated` son necesarios para que la app funcione sin errores `42501 (insufficient privilege)`.

1. Panel Supabase → **SQL Editor → New query**.
2. Pegar el contenido de `supabase/fix-app-grants.sql`.
3. Ejecutar. Debe completarse sin errores.
4. Verificar con `supabase/security-audit.sql` (sección "Tablas sin GRANT para authenticated").

---

## 5. Cargar seed demo (staging solamente)

Solo si `NEXT_PUBLIC_DEMO_MODE=true`. Nunca en producción real.

1. Panel Supabase → **SQL Editor → New query**.
2. Pegar el contenido de `supabase/seed-demo.sql`.
3. Ejecutar. Usa `ON CONFLICT DO NOTHING` — idempotente.
4. Verificar que existan registros en `contacts`, `companies`, `opportunities`.

Para limpiar datos demo: usar `supabase/clear-demo.sql`.

---

## 6. Demo mode

| `NEXT_PUBLIC_DEMO_MODE` | Comportamiento |
|---|---|
| `true` | Muestra badge "Demo" en sidebar, agrega "Recorrido demo" al nav, ítem `/app/demo` activo |
| `false` u omitida | Modo normal, sin affordances de demo. No rompe nada |

Para activar/desactivar: cambiar la variable en Vercel → **Redeploy** (sin cache si es `NEXT_PUBLIC_*`).

---

## 7. Validar login post-deploy

1. Ir a `https://tu-proyecto.vercel.app/login`.
2. Ingresar con un usuario que tenga perfil activo en Supabase (`profiles.is_active = true`).
3. Debe redirigir a `/app/hoy`.
4. Verificar que el nombre y rol aparezcan en el sidebar.
5. Navegar a `/app/empresas`, `/app/contactos`, `/app/oportunidades` — deben cargar sin errores.

Si aparece `missing_profile`: el usuario existe en Supabase Auth pero no tiene fila en `profiles`. Crear el perfil manualmente en Supabase o usar el seed demo.

---

## 8. Comportamiento sin OPENAI_API_KEY

- `/app/copiloto`: muestra banner "IA no configurada".
- `/app/empresas/[id]` → Analizar con IA: muestra mismo banner.
- `/app/compliance`: el análisis devuelve "IA no configurada".
- Ninguna ruta crashea ni da 500 por la ausencia de la key.

---

## 9. Checklist post-deploy

Ver `docs/technical/staging-qa.md` para el checklist completo.

Mínimos antes de mostrar a un cliente:

- [ ] `/login` carga y permite ingresar
- [ ] `/app/hoy` carga con datos
- [ ] Sidebar muestra nombre y rol del usuario
- [ ] `/app/empresas` lista empresas sin errores
- [ ] `/app/oportunidades` muestra pipeline
- [ ] `/app/admin/system` accesible solo para admin/dirección
- [ ] Logout funciona y redirige a `/login`

---

## 10. Rollback básico

**Vercel:**
1. Panel proyecto → **Deployments**.
2. Buscar el último deploy exitoso.
3. Click en los 3 puntos → **Promote to Production**.
4. El rollback tarda ~30 segundos.

**Supabase (si se ejecutó un SQL incorrecto):**
- Los GRANTs no tienen rollback automático. Para revocar: ejecutar `REVOKE` manualmente en SQL Editor.
- Si se ejecutó `clear-demo.sql` por error: volver a correr `seed-demo.sql`.
- Para cambios de schema: restaurar desde backups en Panel Supabase → **Database → Backups**.

---

## Referencias

- `supabase/fix-app-grants.sql` — GRANTs mínimos para rol `authenticated`
- `supabase/security-audit.sql` — Auditoría de RLS y permisos
- `supabase/seed-demo.sql` — Datos de demostración
- `supabase/clear-demo.sql` — Limpieza de datos demo
- `docs/technical/env-vars.md` — Documentación detallada de variables
- `docs/technical/staging-qa.md` — Checklist QA staging
