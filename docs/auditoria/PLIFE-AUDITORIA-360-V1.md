---
Proyecto: Plife Uruguay
Tipo de artefacto: Auditoría 360°
Versión: 1.0
Fecha: 2026-07-24
Responsable: Daniel Odella / Summer87
Ejecutor: Claude Code
Modelo IA utilizado: Claude Sonnet 5 (model id: claude-sonnet-5)
Fuente original: https://claude.ai/code/artifact/dbf57eab-cf0b-427f-bbd4-670fc3a553ed
Identificador del artefacto original: dbf57eab-cf0b-427f-bbd4-670fc3a553ed
Repositorio: https://github.com/Summer87Intelligence/Plife-Uruguay.git
Rama auditada: feat/lead-first-crm
Commit HEAD auditado: ef7be27a576142ee13f60783b924e0bb18066ca5
Estado Git al momento de la auditoría: working tree con 2 archivos modificados sin commitear (.claude/settings.local.json, package-lock.json); sin archivos untracked; rama al día con origin/feat/lead-first-crm
Estado del documento: Pendiente de validación humana
Hash SHA-256 del archivo final: No verificado (se calcula después de guardar este archivo; ver confirmación posterior fuera de este bloque, no editada dentro del documento para no invalidar el propio hash)
---

# Auditoría 360° — PLIFE Growth OS

**Repositorio:** Plife-Uruguay · **Rama auditada:** `feat/lead-first-crm` · **Fecha:** 2026-07-24
**Alcance:** solo lectura y análisis. No se modificó código, no se hicieron commits, no se avanzó en funcionalidades.

---

## Resumen ejecutivo

PLIFE Growth OS es un CRM B2B para una correduría de seguros (Uruguay), con módulos de Empresas, Contactos, Oportunidades, Campañas, Radar B2B, Conocimiento, Copiloto/motores de IA determinística y — en desarrollo activo en esta rama — un flujo "Lead-first" (Lead → calificación → propuesta → conversión).

El proyecto está en un estado **técnicamente sólido pero documentalmente desalineado**. El código compila, tipa y testea limpio (170 tests unitarios en verde, build de producción exitoso, sin errores de TypeScript). La arquitectura por dominios está bien intencionada y en general respetada. El problema central no es el código: es que **los documentos que deberían decir "qué falta y en qué orden" (`next-sprints.md`, `product-backlog.md`, `known-issues.md`, `release-notes.md`, `screen-map.md`) describen un producto de hace ~3 semanas** (FASE 12, con una sección "Compliance" que ya no existe y un OpenAI "pendiente de decisión" que ya fue removido del todo). Cualquier planificación que parta de esos documentos hoy sería errónea.

El segundo hallazgo relevante es que el propio foco de esta rama — el flujo Lead-first — está **funcionalmente por detrás de los módulos clásicos** (Empresas/Contactos/Oportunidades): el detalle de un Lead no tiene timeline de actividad ni asistente de IA real, mientras quedan dos componentes huérfanos (`lead-timeline-mock.tsx`, `lead-ai-assistant-mock.tsx`) de una fase anterior sin uso ni eliminación.

No hay secretos hardcodeados ni uso de `service_role` en el cliente, pero sí un hallazgo de seguridad que requiere verificación inmediata: el flag `NEXT_PUBLIC_INTERNAL_OPEN_ACCESS` (`src/lib/internal-open-access.ts`) **desactiva por completo el control de rol** en Admin, Admin/System, Dirección e IA si queda en `true` en algún entorno — es de uso interno para pruebas (FASE 13J) y su valor por defecto es seguro, pero al ser una variable `NEXT_PUBLIC_*` su seguridad depende 100% de que nadie la active en el entorno de producción. Además hay deuda de higiene: **no hay linter configurado**, el esquema de datos del núcleo del CRM (companies, contacts, opportunities, campaigns, profiles, knowledge_*) **no tiene ninguna definición SQL versionada en el repo** (solo existe para leads/proposals/ai-engine), y hay una credencial expuesta pendiente de rotar según el propio known-issues.md (sin confirmación de que se haya resuelto).

---

## 1. Estado general

| Ítem | Estado |
|---|---|
| Framework | Next.js 15.5.19 (App Router) + React 19.2.7 + TypeScript ~6.0.3 |
| Estilo | Tailwind CSS v4.3.2 + `@tailwindcss/postcss` |
| Datos | Supabase (`@supabase/ssr` 0.12, `@supabase/supabase-js` 2.110) |
| Validación | Zod v4 |
| UI kit | Radix UI primitives + `lucide-react`, componentes propios en `src/components/ui` |
| Testing | Vitest 4.1.9 (unit) + Playwright 1.61 (E2E) |
| Rama actual | `feat/lead-first-crm`, al día con `origin` |
| Cambios sin commitear | `.claude/settings.local.json`, `package-lock.json` (no son cambios de producto) |
| **Typecheck** (`tsc --noEmit`) | ✅ Limpio, 0 errores |
| **Build** (`next build`) | ✅ Exitoso. Única advertencia: `process.version` (Node API) referenciado por `@supabase/supabase-js` vía `@supabase/ssr` en el trace de Middleware — advertencia informativa de Next, no bloqueante |
| **Lint** | ⚠️ **No configurado**. `next lint` pide setup interactivo; no existe `eslint.config.mjs` ni `.eslintrc*` en el repo, pese a tener `eslint` y `eslint-config-next` como dependencias declaradas. Hoy no hay enforcement de lint en absoluto, ni local ni en CI. |
| **Tests unitarios** | ✅ 170/170 passing (12 archivos, vitest) |
| **Tests E2E** | Existen (`tests/e2e/`, incluye `manual-system-walkthrough.spec.ts`). **No ejecutados en esta auditoría** (requieren Supabase vivo + credenciales `E2E_USER_EMAIL/PASSWORD`; además el propio CI los excluye explícitamente "por ahora"). Último commit de la rama es justamente `test: stabilize authenticated e2e login`, señal de trabajo activo e inconcluso ahí. |
| **CI** (`.github/workflows/ci.yml`) | Corre type-check + build (con placeholders Supabase) + unit tests. No corre lint (porque no existe config) ni E2E. |
| **Dependencias con vulnerabilidades** | `npm audit`: 3 altas, todas transitivas (postcss vía Next.js interno, sharp) — riesgo bajo en la práctica (build-time), pero pendiente de `npm audit fix`. |

---

## 2. Arquitectura

**Patrón general:** `src/app/app/<seccion>/page.tsx` (Server Component, auth + fetch) → `*-view.tsx` / `*-list.tsx` / `*-detail.tsx` (composición UI) → `src/domains/<dominio>/{actions,queries,types,...}.ts` (lógica de negocio + acceso a Supabase) → `src/lib/supabase/{client,server}.ts`. Es un patrón consistente y correctamente aplicado en la mayoría de los módulos (empresas, contactos, oportunidades, campañas, propuestas).

**Dominios:** `ai`, `campaigns`, `companies`, `contacts`, `duplicates`, `ia-engine`, `intelligence-engines`, `knowledge`, `leads`, `opportunities`, `proposals` (43 archivos).

### Hallazgo — tres capas de "IA" con límites poco claros
- `src/domains/ai/actions.ts` (219 líneas): **activo**, usado por Copiloto, `company-ai.tsx`, `campaign-ai.tsx`, `contact-detail.tsx`, `opportunity-detail.tsx`. Es el motor real de sugerencias por entidad.
- `src/domains/ia-engine/*` (mock-runner, prompt-builder, prompt-safety, prompt-validation): **activo**, usado solo por `/app/ia/actions.ts` y `components/ia/helpers.ts` (la pantalla "motores comerciales").
- `src/domains/intelligence-engines/*` (constants, engine-definitions, mock-output): **activo**, usado por `domains/proposals/mock-generator.ts`, `proposal-flow.ts`, `types.ts` y `components/ia/commercial-engines-overview.tsx`.

Ninguno es código muerto, pero **no hay un documento ni un naming que explique por qué existen tres capas de IA separadas** (Copiloto vs. Motores IA vs. Motores de Propuestas). Es deuda de claridad arquitectónica: un desarrollador nuevo no puede saber a cuál extender sin leer los tres.

### Hallazgo — código muerto confirmado
- `src/components/leads/lead-timeline-mock.tsx` y `lead-ai-assistant-mock.tsx`: **cero imports en todo el repo** fuera de sus propios archivos. Son remanentes de FASE 14D (antes de que la tabla `leads` existiera en Supabase). El `lead-detail-view.tsx` actual no los usa — de hecho **no tiene ningún panel de timeline ni de IA**, a diferencia de Empresas/Contactos/Oportunidades que sí los tienen vía `domains/ai`.

### Hallazgo — naming residual que puede inducir a error
- `src/domains/leads/mock-data.ts` define el tipo `MockLead`, y **ese mismo tipo se usa hoy para representar filas reales de Supabase** (`src/domains/leads/queries.ts::toMockLead`, usado por 15 componentes de Leads). Es decir: el dato es real, pero su tipo se llama "Mock". Riesgo concreto: un futuro desarrollador (o agente) puede asumir que `MockLead` es descartable o falso y romper el flujo de Leads real por accidente.

### Middleware y control de acceso
- `src/middleware.ts` resuelve sesión + perfil vía `resolveSessionAndProfile()` (en `src/lib/auth.ts`) y solo controla: (a) sin sesión → redirect a `/login`; (b) perfil inválido/inactivo → redirect con error; (c) sesión válida en `/login` → redirect a `/app/hoy`. **No hace control de rol por ruta.**
- El control de rol granular (admin/dirección/líder_comercial) vive **a nivel de página**, vía `requireRole()` / `canAccessAll()` en `src/lib/auth.ts`. Es un patrón válido pero descentralizado: no hay un mapa único ruta→rol, por lo que cada página nueva debe acordarse de invocar `requireRole()`. No se auditó línea por línea cada página para confirmar que todas lo hacen.

### Punto positivo — chequeo de duplicados sí reutilizado
- `src/domains/duplicates/{company,contact}-duplicate-check.ts` está bien factorizado y es consumido tanto por `companies/actions.ts` como por `contacts/actions.ts` — ejemplo correcto de lógica compartida entre dominios, a diferencia de `proposals` (9 archivos, ~1550 líneas) que reimplementa un flujo validación→persistencia→prefill conceptualmente parecido al de `leads` sin helpers comunes (normalización de fechas, mapeo fila Supabase→tipo de dominio).

### Violación de capas (aislada)
- `src/components/layout/app-header.tsx` importa `@/lib/supabase/client` directamente para hacer `signOut()`, en vez de pasar por una Server Action — único caso detectado de un componente de presentación hablando directo con Supabase; bajo riesgo por ser un caso aislado, no un patrón extendido.

### Duplicación menor
- Los 4 formularios de creación (`company-form.tsx` 199L, `contact-form.tsx` 188L, `opportunity-form.tsx` 146L, `campaign-form.tsx` 151L) comparten una estructura casi idéntica (labels, marca de campo obligatorio, botón Cancelar, patrón de post-creación) sin un componente de formulario compartido. Igual patrón en los 3 listados principales (`companies-list.tsx`, `contacts-list.tsx`, `campaigns-list.tsx`, 150–241 líneas c/u). Oportunidad de abstracción, no urgente.

### Convenciones
- 53 de 117 archivos `.tsx` bajo `app/` y `components/` usan `'use client'` (~45%) — razonable para un CRM con formularios e interacción, no es una señal de alarma por sí sola.
- Cero ocurrencias de `TODO`/`FIXME`/`HACK`/`XXX` en `src/**/*.ts(x)` — la deuda técnica se documenta en Markdown (84 archivos), no en comentarios de código. Es un patrón de equipo consistente, pero exige que esos documentos estén al día (ver sección 3, que muestra que no lo están).

---

## 3. Base documental

**Volumen:** ~84 archivos en `docs/product/`, 6 en `docs/technical/`, 6 + 20 capturas en `docs/user-guide/`, 14 `.sql` sueltos + 2 migraciones en `supabase/`. No existe `PROJECT.md` ni `CLAUDE.md` en la raíz.

### Hallazgo central: drift severo en los documentos "vivos"
`next-sprints.md`, `product-backlog.md`, `known-issues.md`, `release-notes.md` y `screen-map.md` están fechados **2026-07-01 (FASE 12F–12H)**, pero el código y las auditorías numeradas más recientes (15A–15R, hasta 2026-07-08, más commits posteriores sin número de fase visible) ya superaron ese estado:

- Los 5 documentos siguen describiendo **`/app/compliance`** como pantalla activa (P0: "Probar Compliance") — el commit `refactor: remove compliance section and flow` la eliminó del código. **No existe `src/app/app/compliance`.**
- Listan OpenAI como decisión pendiente (Sprint E, P3 "Activar OpenAI") — pero `openai-removal-15b.md`, `env-vars.md` y el código (`src/lib/ai/provider.ts`, `embeddings.ts`) confirman remoción efectiva y definitiva ya ejecutada.
- No mencionan **Leads** ni **Propuestas** como módulos — pese a ser el foco documentado de la rama `feat/lead-first-crm` (persistencia real vía `supabase/migrations/20260708_apply_proposals_persistence_dev.sql`).
- `screen-map.md` no documenta `/app/ia`, `/app/leads`, `/app/propuestas`, `/app/pipeline`, y solo menciona `/app/academia` de pasada.

**Consecuencia práctica:** estos 5 documentos son, hoy, los de mayor riesgo si alguien los usa para decidir qué hacer a continuación — describen un producto que en parte ya no existe y omiten el que sí es el foco actual.

### Clasificación
- **Vigentes:** `env-vars.md`, `ci.md` (reflejan el estado real), `copy-style-guide.md`, `role-matrix.md`, y las ~25 auditorías numeradas 14x/15x (cada una autocontenida y fechada, describe con precisión su propio momento).
- **Obsoletos / requieren reescritura urgente:** `next-sprints.md`, `product-backlog.md`, `known-issues.md`, `release-notes.md`, `screen-map.md`.
- **Redundantes / archivables:** las auditorías de proceso numeradas ya cerradas (`compliance-removal-15c`, `openai-removal-15b`, `demo-mock-db-cleanup-audit-15o`, `ui-anti-demo-cleanup-15p`, `dev-data-cleanup-15q`, `empty-state-and-manual-load-15r`, todas las `leads-*-14x`, etc.) — son bitácoras valiosas como historial, pero conviven en la misma carpeta que la documentación de referencia activa, sin distinción visual ni de carpeta.

### Documentación faltante
- Ningún documento de **arquitectura técnica consolidada** (sin ADRs, sin diagrama de dominios/capas).
- Ningún **esquema de datos único**: el modelo vive repartido en 14 `.sql` sueltos sin numeración de aplicación clara.
- Sin **runbook de producción/incidentes**.
- Sin `PROJECT.md`/`CLAUDE.md` en la raíz.

### Riesgo de seguridad ya documentado, no confirmado como resuelto
`known-issues.md` (2026-07-01) registra como pendiente P0: *"Credenciales de test visibles en logs o capturas — rotar contraseñas"*. No hay ninguna auditoría posterior que confirme la rotación. **Recomendación: verificar y rotar si no se hizo.**

---

## 4. Modelo funcional

**Problema que resuelve:** ordenar y priorizar la gestión comercial de una correduría de seguros B2B — qué empresa/contacto/oportunidad atender hoy, con qué mensaje, y trazabilidad del ciclo de venta. Principio rector explícito en los docs: *"el sistema no reemplaza al asesor; ordena, prioriza y ayuda a decidir mejor."*

**Usuarios (roles):** `asesor` (uso diario), `líder_comercial` (gestiona campañas), `dirección` (vista ejecutiva/KPIs), `admin` (sistema y usuarios). `role-matrix.md` también menciona roles de `compliance`/`capacitación` cuya vigencia debería re-confirmarse dado que la sección Compliance fue removida de la UI.

**Flujo principal (foco actual, rama `feat/lead-first-crm`):**
Lead ingresa (manual, web, WhatsApp*, referido, campaña, radar) → calificación y scoring automáticos (`src/domains/leads/qualification.ts`, `scoring.ts`) → avanza por etapas de pipeline (nuevo → contactado → calificando → interesado → propuesta_reunion → seguimiento → convertido/descartado) → se genera una Propuesta (real, persistida en Supabase) → conversión a Empresa/Contacto/Oportunidad. (*WhatsApp no está integrado; es solo un valor de "origen" del lead, no un canal real.)

**Flujo secundario (módulo clásico B2B, ya maduro):** Empresas → Contactos → Oportunidades, con Radar B2B para priorizar por potencial, Campañas para prospección coordinada, Copiloto y "motores comerciales" (IA determinística, sin proveedor externo) como apoyo, y Base de Conocimiento para consulta de material validado.

**Clasificación de pantallas (evidencia en código, no solo en docs):**

| Pantalla | Estado |
|---|---|
| Empresas (lista + detalle) | **Operativa** — CRUD real, RLS, sin mocks |
| Contactos (lista + detalle) | **Operativa** |
| Oportunidades (lista + detalle + pipeline) | **Operativa** |
| Campañas (lista + detalle) | **Operativa** |
| Leads (lista + `/pipeline` + detalle) | **Operativa pero incompleta** — CRUD real vía Supabase, pero el detalle carece de timeline de actividad y de asistente IA que sí tienen las demás entidades (componentes de una fase previa quedaron huérfanos sin reemplazo, ver §2) |
| Propuestas (lista + creación) | **Operativa** — persistencia real, RLS, sin service role |
| Propuestas (detalle) | **Incompleta a propósito** — read-only, documentado como pendiente (FASE 15N) |
| Radar B2B | **Operativa** |
| Copiloto / Motores IA / Conocimiento (búsqueda "inteligente") | **Determinística/mock por decisión de producto** — `generateEmbedding()` siempre devuelve `null` (sin proveedor de IA), la búsqueda "inteligente" de Conocimiento cae siempre a texto plano (`ilike`). No es un bug: es el estado esperado hasta decidir proveedor. |
| `/app/demo` | **Recorrido guiado intencional**, no es un stub — funciona como landing de presentación |
| `/app/academia` | No auditado en profundidad; docs la marcan como "documentación futura" |
| `/app/admin/system` | **Operativa** — diagnóstico técnico para admin/dirección |
| ~~`/app/compliance`~~ | **No existe** — removida del código, pero sigue en 5 documentos vivos (ver §3) |

---

## 5. UX

- **Inconsistencia de copy confirmada en código** (no solo en docs): los botones de submit dicen *"Crear empresa"* (`company-form.tsx:195`), *"Crear contacto"* (`contact-form.tsx:184`), *"Crear oportunidad"* (`opportunity-form.tsx:142`), mientras los diálogos de creación desde listas dicen *"Nueva empresa"* (`companies-list.tsx:52`, `radar-b2b-view.tsx:128`). Es el mismo hallazgo que `known-issues.md` reporta como pendiente desde FASE 12 — **sigue sin resolverse**.
- **Empty states**: parecen consistentes y bien resueltos donde existen (Empresas, Contactos, Oportunidades, Leads, Propuestas todos con card de empty state + CTA de creación) — trabajo de las fases 12D/15R visible y efectivo.
- **CTAs**: no se detectaron múltiples CTA primarios compitiendo en una misma vista dentro de las pantallas revisadas.
- **Gap real de paridad**: el detalle de Lead —la pantalla más nueva y estratégicamente más importante ahora mismo— es la única entidad principal sin timeline de actividad ni panel de IA, mientras Empresa/Contacto/Oportunidad sí los tienen. Un usuario que use Leads primero y luego entre a una Empresa notará la diferencia.
- **Copiloto con IA desactivada**: correctamente comunicado como "IA no configurada" (no como error), según lo documentado — buen manejo de expectativas.
- **Búsqueda "inteligente" de Conocimiento**: siempre cae a búsqueda de texto simple sin aviso claro de que la funcionalidad "inteligente" no está activa (el código lo sabe — `embeddings.ts` — pero no se confirmó si la UI lo comunica al usuario).

---

## 6. Datos

- **Clientes Supabase**: `src/lib/supabase/client.ts` (browser) y `server.ts` (server, con cookies) usan exclusivamente `NEXT_PUBLIC_SUPABASE_ANON_KEY`. **No se encontró uso de `service_role` en `src/`** — correcto y seguro.
- **Esquema fragmentado, y en su núcleo no versionado en absoluto**: el código (`src/domains/**`) consulta 24 tablas de Supabase (`activities, ai_*, campaigns, companies, contacts, knowledge_chunks, knowledge_documents, leads, notes, objections_library, opportunities, profiles, proposals, teams, training_modules`), pero en `supabase/*.sql` solo hay `CREATE TABLE` para la familia `ai_*` (`ai-engine-schema.sql`), `leads` (`leads-schema-draft.sql`) y `proposals` (única migración formal, `supabase/migrations/20260708_apply_proposals_persistence_dev.sql`). **`companies`, `contacts`, `opportunities`, `campaigns`, `profiles`, `teams`, `activities`, `notes`, `knowledge_documents`, `knowledge_chunks`, `objections_library` y `training_modules` — el núcleo del CRM — no tienen ninguna definición SQL en el repo.** Fueron creadas fuera de control de versiones (probablemente a mano en Supabase Studio). Esto es más grave que "falta de migraciones formales": significa que el esquema no es reproducible desde el repo y que su RLS/estructura no se puede auditar leyendo código fuente — es un punto ciego total, no solo de proceso.
- RLS sí está presente donde el `CREATE TABLE` vive en el repo (`ai_*` con 29 policies, `leads` con 3, `proposals` con 3), y las queries de dominio confían en RLS en vez de filtrar manualmente por usuario — patrón correcto donde es verificable. Pero para las 12 tablas core sin SQL versionado, **no hay forma de confirmar desde el código si tienen RLS activo o policies correctas**; `fix-profiles-rls.sql` y `leads-rls-soft-delete-fix-14gb.sql` confirman que ya hubo al menos un incidente/fix reactivo de RLS mal configurada en `profiles` y `leads`, señal de que el diseño no fue robusto desde el inicio.
- **Storage**: no hay ningún uso de `.storage.` en `src/` — Supabase Storage no está integrado (no hay carga de archivos/adjuntos en ninguna entidad).
- **Infraestructura RAG sin usar**: `knowledge-embeddings.sql` habilita `pgvector`, agrega `embedding vector(1536)` a `knowledge_chunks` y una función de similitud coseno con índice `ivfflat` — dimensionado para `text-embedding-3-small` de OpenAI. El propio archivo aclara que la app ya no genera embeddings (removido en FASE 15B): es infraestructura viva en la base que no se alimenta, coherente con el hallazgo de `OPENAI_API_KEY` huérfana.
- **Variable huérfana**: `OPENAI_API_KEY` sigue en `.env.local` pese a estar confirmado (grep de `src/`) que ningún código la lee. No es un riesgo de seguridad en sí (no está commiteada), pero es ruido de configuración y confirma que la migración a motores deterministas dejó infraestructura sin limpiar.
- **Datos demo vs. reales**: `seed-demo.sql` / `clear-demo.sql` operan sobre las mismas tablas `public.*` de producción, sin schema ni prefijo separado para demo — la única barrera es el propio script; riesgo si se corre en el ambiente equivocado.

---

## 7. Seguridad

- **Hallazgo más relevante (Alto) — flag de bypass de rol**: `src/lib/internal-open-access.ts` expone `NEXT_PUBLIC_INTERNAL_OPEN_ACCESS`; si vale `'true'`, **desactiva el chequeo de rol** en `admin/page.tsx:8`, `admin/system`, `direccion/page.tsx:8` e IA — cualquier usuario autenticado con perfil activo entra a esas vistas sin ser `admin`/`dirección`. Es un flag de testing interno (FASE 13J) con default seguro (`false`/ausente), pero al ser `NEXT_PUBLIC_*` queda embebido en el bundle del cliente y su seguridad depende enteramente de que nadie la setee en el entorno de producción de Vercel. **Acción recomendada: verificar explícitamente que esta variable no esté seteada en producción antes de cualquier release.**
- Auth: sesión + perfil resueltos server-side en cada request (`resolveSessionAndProfile`), sin exponer rol/sesión vía Context de cliente — correcto.
- Middleware protege `/app/*` por sesión válida; control de rol es responsabilidad de cada página vía `requireRole()` — funciona, pero es un patrón descentralizado sin mapa único ruta→rol. Se confirmó además que **9 de 9 `actions.ts` en `src/domains/*`** (leads, companies, campaigns, contacts, knowledge, opportunities, propuestas) no llaman a `requireAuth`/`requireRole` — la autorización de esas mutaciones depende enteramente de RLS en Supabase, no de una verificación en el código de aplicación. Como 12 de las tablas core no tienen SQL versionado (ver §6), ese RLS no es auditable desde el repo; existe `supabase/security-audit.sql` (127 líneas) pensado exactamente para verificarlo, pero no hay evidencia de que se haya corrido recientemente. **Recomendación: ejecutarlo contra la base real antes de day-2.**
- No se hallaron credenciales, API keys ni contraseñas hardcodeadas en `src/` ni en los `.sql`.
- `.gitignore` excluye `.env*` y `/backups/` correctamente (confirmado por convención documentada en `dev-data-cleanup-15q.md`).
- **Pendiente sin confirmar cierre**: `known-issues.md` (P0) reporta credenciales de test expuestas en logs/capturas, con acción "rotar contraseñas" — no hay evidencia posterior de que se haya ejecutado.
- **3 vulnerabilidades altas transitivas** (`npm audit`): `postcss` (vía bundle interno de Next.js) y `sharp` — riesgo bajo en producción (dependencias de build/optimización de imágenes, no expuestas directamente a input de usuario), pero corregibles con `npm audit fix`.
- Sin linter configurado (ver §1) significa que patrones inseguros comunes (uso de `dangerouslySetInnerHTML`, `eval`, etc.) no tienen ninguna verificación automática hoy — no se detectó ninguno en esta auditoría, pero tampoco hay red de seguridad si aparece.
- `next.config.ts` no define ningún security header (CSP, `X-Frame-Options`, `Strict-Transport-Security`, `Referrer-Policy`) — superficie de clickjacking/XSS mitigable con headers, hoy sin aprovechar.

---

## 8. Performance

- Bundle de producción: 102 kB compartido + rutas entre 103–181 kB de First Load JS. Las más pesadas: `/app/propuestas/nueva` (172 kB), `/app/empresas/[id]` (178 kB), `/app/contactos/[id]` (166 kB), `/app/radar-b2b` (166 kB), `/app/oportunidades/[id]` (165 kB). Son tamaños razonables para un CRM con formularios ricos vía Radix; no hay señales de un bundle descontrolado.
- Rutas como `/app/propuestas`, `/app/demo` y `/app/pipeline` muestran bundles mínimos (826 B) porque son mayormente Server Components con fetch server-side — **no son stubs**, es el comportamiento esperado y deseable de RSC (falsa alarma inicial descartada tras revisar el código).
- **`/login` es la ruta más pesada del sitio (181 kB First Load) pese a tener el bundle propio más liviano (3.13 kB)**: `login-form.tsx` es `'use client'` e importa `createClient` de `@/lib/supabase/client` para llamar `signInWithPassword()` directo en el navegador. Como `/login` vive fuera del layout de `/app`, no comparte ese chunk con el resto de la app y carga el SDK completo de Supabase solo para esta pantalla — únicos dos puntos de todo `src/` que usan el cliente Supabase de navegador son `login-form.tsx` y `app-header.tsx` (ver §2).
- **El middleware pesa 92.9 kB** porque `createServerClient` de `@supabase/ssr` arrastra el SDK completo de `@supabase/supabase-js` (confirmado por el warning del build sobre `process.version` no soportado en Edge Runtime) — es el patrón oficial recomendado por Supabase, no un error de implementación, pero implica ~93 kB de JS ejecutados en cada request a una ruta no estática solo para validar sesión.
- **Cero uso de `next/dynamic` en todo el repo** (`grep -rn "next/dynamic" src` → 0 resultados). Las vistas de detalle más pesadas (`company-detail.tsx` 509 líneas, `contact-detail.tsx` 361 líneas, `opportunity-detail.tsx` 419 líneas) son `'use client'` desde la línea 1 y mezclan markup mayormente estático con islas interactivas (formularios de edición, paneles de IA como `company-ai.tsx`) sin partir el bundle — todo el JS se envía en el load inicial aunque el usuario solo mire datos sin editar. Candidato natural a `dynamic import()` para el diálogo de IA y el formulario de edición.
- Lo que está bien: `domains/*/queries.ts` seleccionan columnas específicas (no `select *`), aplican `.limit()`, y `Promise.all` aparece ~20 veces en `domains`/`app` para paralelizar queries independientes — no se detectaron waterfalls ni patrones N+1 en loops.
- `next.config.ts` casi vacío (solo `typedRoutes: true`); falta `experimental.optimizePackageImports` para los ~10 paquetes `@radix-ui/*` — impacto menor, ya que `lucide-react` se importa con imports nombrados (tree-shakeable) en todos los casos revisados.

---

## 9. Deuda técnica priorizada

**Alta**
1. **Flag `NEXT_PUBLIC_INTERNAL_OPEN_ACCESS` bypasea el control de rol** en Admin/Dirección/IA si se activa por error en producción — verificar su ausencia en el entorno de Vercel es la acción de seguridad más urgente de todo el informe.
2. **El núcleo del esquema de datos (12 tablas: companies, contacts, opportunities, campaigns, profiles, teams, activities, notes, knowledge_*, objections_library, training_modules) no tiene definición SQL versionada en el repo** — no reproducible, y su RLS no es auditable desde el código (solo `leads`, `proposals` y la familia `ai_*` están versionadas). Correr `supabase/security-audit.sql` contra la base real para confirmar el estado de RLS es la verificación pendiente más importante.
3. **Drift documental en los 5 documentos "vivos"** (§3) — riesgo de tomar decisiones de producto sobre un estado que no existe.
4. **Falta de linter configurado** — cero red de seguridad automática para calidad/patrones inseguros, pese a tener las dependencias instaladas.
5. **Credencial expuesta pendiente de rotar** (documentada, sin confirmación de cierre).

**Media**
6. Paridad funcional incompleta de Leads (sin timeline/IA real) frente a Empresas/Contactos/Oportunidades.
7. Tres capas de "IA" (`ai`, `ia-engine`, `intelligence-engines`) sin documentación que explique sus límites.
8. Componentes huérfanos (`lead-timeline-mock.tsx`, `lead-ai-assistant-mock.tsx`) y tipo `MockLead` usado para datos reales — riesgo de confusión futura.
9. Inconsistencia de copy "Crear X" vs "Nueva X" — reportada hace 3 semanas, sigue sin resolverse.
10. E2E no validado en esta auditoría ni (aparentemente) en el último cierre de fase — bloqueante documentado para el propio equipo (Sprint A).
11. `/login` y el middleware cargan el SDK completo de Supabase (181 kB y 92.9 kB respectivamente) sin ningún uso de `next/dynamic` en el repo para aliviar las vistas de detalle más pesadas.
12. `next.config.ts` sin security headers (CSP, X-Frame-Options, HSTS).

**Baja**
13. Duplicación estructural entre los 4 formularios y los 3 listados principales — candidato a abstracción, no urgente.
14. 3 vulnerabilidades npm transitivas de severidad alta pero bajo riesgo práctico — `npm audit fix` resuelve.
15. `OPENAI_API_KEY` huérfana en `.env.local` e infraestructura pgvector/embeddings sin uso (`knowledge-embeddings.sql`) — deuda de limpieza tras la remoción de OpenAI.
16. `seed-demo.sql`/`clear-demo.sql` operan sobre tablas de producción sin aislamiento estructural de esquema.

---

## 10. Oportunidades

- **Reutilización:** extraer un `EntityForm` genérico (campos + validación Zod + botones + patrón de post-creación) a partir de los 4 formularios actuales — reduciría ~4×150 líneas a una base compartida.
- **Modularización:** documentar y, si corresponde, fusionar las tres capas de IA en una sola API interna con adaptadores por caso de uso (copiloto / motores / propuestas), en vez de tres módulos paralelos.
- **Simplificación documental:** mover las ~25 auditorías de fase cerradas a `docs/archive/`, dejando en `docs/product/` solo los documentos vivos — reduce la carga cognitiva de "cuál leer".
- **Mejora UX:** dar a Leads paridad real con Empresas/Contactos (timeline de actividad real + panel de IA vía `domains/ai`, reemplazando los componentes mock huérfanos en vez de dejarlos sin uso).
- **Mejora de arquitectura:** consolidar el esquema de datos en migraciones formales versionadas (Supabase CLI / `supabase migration`) en vez de scripts sueltos, con un índice de aplicación.
- **Motores inteligentes / Summer87 OS:** la base ya está pensada para eso — `src/lib/ai/provider.ts` es una abstracción limpia de "proveedor de IA" con modo determinístico interno; el día que se decida activar un proveedor real (u orquestarlo vía una capa tipo Summer87 OS), el punto de integración ya existe y está aislado, lo cual es una buena base para no tener que reescribir Copiloto/Motores/Propuestas.

---

## 11. Estado del proyecto (estimación cualitativa)

| Dimensión | % | Justificación breve |
|---|---|---|
| Arquitectura | 75% | Patrón consistente por dominios; deuda de claridad en capas de IA y naming residual |
| Backend | 70% | Server Actions + Zod + RLS conceptual; esquema fragmentado sin migraciones formales |
| Frontend | 80% | Rutas completas, UI consistente vía Radix, formularios operativos |
| UX | 65% | Buen trabajo de simplificación (12D/12E) pero inconsistencias de copy sin cerrar y gap de paridad en Leads |
| Persistencia | 55% | Datos reales y RLS presente donde es verificable, pero 12 tablas core sin SQL versionado — reproducibilidad y auditabilidad del esquema son un riesgo real, no solo de proceso |
| Seguridad | 65% | Sin secretos hardcodeados ni uso indebido de `service_role`; pendiente verificar el flag de bypass de rol en producción, correr el audit SQL de RLS, confirmar rotación de credencial y activar lint |
| Documentación | 50% | Volumen alto pero los documentos de mayor impacto (backlog/known-issues/roadmap) están desactualizados |
| Producción/CI | 55% | CI mínimo funcional (type-check+build+unit) pero sin lint ni E2E; deploy no verificado en esta auditoría |

*(Estimación cualitativa basada en evidencia de código y docs revisados; no sustituye una medición de cobertura de tests real ni un audit de producción en vivo.)*

---

## 12. Roadmap recomendado

**Bloque 1 — Verdad documental (bajo esfuerzo, alto apalancamiento)**
Reescribir `next-sprints.md`, `product-backlog.md`, `known-issues.md`, `release-notes.md`, `screen-map.md` reflejando el estado real post-15R (sin Compliance, con Leads/Propuestas, con OpenAI removido de forma definitiva). Archivar las auditorías numeradas cerradas. Justificación: toda decisión posterior depende de partir de un mapa correcto; es barato de hacer y evita retrabajo.

**Bloque 2 — Higiene técnica y seguridad**
Verificar que `NEXT_PUBLIC_INTERNAL_OPEN_ACCESS` no esté seteada en producción, correr `supabase/security-audit.sql` contra la base real para confirmar RLS de las tablas core, exportar el esquema completo de esas 12 tablas a migraciones versionadas (con índice de aplicación), configurar ESLint, correr `npm audit fix` y confirmar/rotar la credencial expuesta pendiente. Justificación: protege lo que ya existe antes de seguir construyendo encima — son los únicos ítems de este informe con riesgo de seguridad/reproducibilidad real.

**Bloque 3 — Cerrar el flujo Lead-first (el foco actual de la rama)**
Dar a Leads paridad con Empresas/Contactos (timeline real + IA real vía `domains/ai`), eliminar o reemplazar los componentes mock huérfanos, habilitar edición de Propuestas, documentar el límite entre las tres capas de IA. Justificación: es el trabajo que la rama ya empezó; cerrarlo evita quedar con dos calidades de UX conviviendo.

**Bloque 4 — Validación E2E y de usabilidad real**
Ejecutar la suite Playwright completa (bloqueante ya documentado por el propio equipo), resolver inconsistencias de copy ("Crear" vs "Nueva"), y correr una sesión de feedback con un usuario no técnico (Sprint B ya diseñado en `feedback-log-template.md`). Justificación: valida con evidencia real antes de invertir en nuevas features.

**Bloque 5 — Expansión (IA real, integraciones)**
Recién después de validar el flujo sin IA: decisión go/no-go sobre activar un proveedor real de IA/embeddings, evaluar WhatsApp y fuentes externas (radar/scraping). Justificación: ya está definido así por el propio equipo (Sprint E, condicionado) y la base técnica (`src/lib/ai/provider.ts`) ya está lista para no requerir reescritura.
