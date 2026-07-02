# Release — PLIFE AI Engine
**Fecha:** 2026-07-02  
**Versión:** Motor IA PLIFE v1.0 (modo simulado)  
**PR:** [#1 feat: add PLIFE AI engine](https://github.com/Summer87Intelligence/Plife-Uruguay/pull/1)  
**Commit producción:** `bdf3d9585f4f1220db1e8d9cf6ac85577c27128e` (`bdf3d95`)  
**Deploy Vercel:** `dpl_6eYBa7aKirs6AfbPS7deP3xMpPcK`  
**URL producción:** https://plife-uruguay.vercel.app  
**Estado:** PRODUCCIÓN OK

---

## Resumen ejecutivo

Se integró el Motor IA PLIFE a la plataforma PLIFE Growth OS. El motor permite ejecutar análisis comerciales estructurados sobre empresas y oportunidades usando prompts por etapas, perfiles de análisis y categorías comerciales. La versión inicial opera en modo simulado (sin OpenAI): genera outputs determinísticos para validar la arquitectura de ejecución, la interfaz de administración y la integración con entidades comerciales.

El release incluye el schema completo de base de datos con RLS, el panel de administración `/app/ia`, la integración con páginas de empresa y oportunidad, y un refactor de navegación UX aplicado a toda la plataforma.

---

## Commit y deploy

| Campo | Valor |
|-------|-------|
| Commit producción | `bdf3d9585f4f1220db1e8d9cf6ac85577c27128e` |
| Rama mergeada | `feat/plife-ai-engine` → `main` |
| Método merge | Squash merge |
| PR GitHub | #1 — feat: add PLIFE AI engine |
| Deploy ID Vercel | `dpl_6eYBa7aKirs6AfbPS7deP3xMpPcK` |
| Estado deploy | READY |
| Target | production |
| URL | https://plife-uruguay.vercel.app |
| Fecha deploy | 2026-07-02T18:18:51Z |

---

## Funcionalidades incluidas

### Schema de base de datos (Supabase)

Tablas nuevas, todas con RLS habilitado:

| Tabla | Propósito |
|-------|-----------|
| `ai_stages` | Etapas del ciclo comercial (8 etapas seed) |
| `ai_categories` | Categorías de análisis (7 categorías seed) |
| `ai_prompts` | Prompts estructurados por campo (8 prompts seed validados) |
| `ai_analysis_profiles` | Perfiles de análisis (1 perfil seed: Comercial PLIFE) |
| `ai_profile_prompts` | Vínculo perfil ↔ prompt con orden de ejecución |
| `ai_prompt_suggestions` | Sugerencias de mejora generadas localmente |
| `ai_execution_runs` | Registro de cada ejecución del motor |
| `ai_execution_outputs` | Outputs por prompt dentro de una ejecución |

Políticas RLS:
- SELECT: `authenticated`
- INSERT / UPDATE / DELETE: `is_admin_or_direccion()` únicamente

Triggers de inmutabilidad (`ai-engine-immutability.sql`):
- `ai_execution_runs`: campos `entity_id`, `entity_type`, `profile_id`, `created_by` inmutables post-INSERT
- `ai_execution_outputs`: campo `output` inmutable cuando `status = 'completed'`

### Panel de administración `/app/ia`

Ruta protegida por RBAC (`canAccessAll()`), visible en sidebar solo para admin y dirección. Seis tabs:

- **Dashboard** — estadísticas del motor, selector de perfil activo, estado del sistema
- **Configuración** — edición del perfil activo, prompts vinculados, órdenes de ejecución
- **Prompts activos** — lista de prompts validados del perfil, editor inline, panel de sugerencias
- **Categorías** — 7 categorías comerciales con descripción y tone
- **Perfiles de análisis** — CRUD de perfiles, vinculación de prompts
- **Ejecuciones** — historial de runs, outputs por prompt, formulario de ejecución mock

### Validación local de prompts

Validador determinístico sin OpenAI que analiza:
- Campos vacíos o insuficientes
- Restricciones débiles o ausentes
- Formato de salida incompleto
- Términos de riesgo de compliance (primas, coberturas, garantías)
- Ausencia de mención de revisión humana

Genera sugerencias almacenadas en `ai_prompt_suggestions` y visibles por prompt en el panel admin.

### Ejecución mock sin OpenAI

`runMockAIEngine()` genera outputs estructurados por etapa usando el prompt construido localmente. No realiza llamadas a APIs externas. La UI muestra explícitamente que el análisis es simulado.

Server action `runMockAnalysis`:
- Valida inputs con Zod (regex hex leniente, compatible con UUIDs de seed demo)
- Crea `ai_execution_runs` con status `running`
- Genera outputs por cada prompt habilitado y validado del perfil
- Actualiza el run a `completed` o `failed`
- Revalida `/app/ia`

### Integración con empresas y oportunidades

Card **"Análisis IA comercial"** agregada en:
- `/app/empresas/[id]` — botón "Ejecutar análisis IA", advertencia de compliance, resultado en `/app/ia > Ejecuciones`
- `/app/oportunidades/[id]` — misma integración

### Refactor de navegación UX (incluido en el mismo PR)

Nuevos componentes compartidos aplicados en todas las páginas de detalle:
- `SimpleBreadcrumb` — navegación contextual
- `DetailBackLink` — enlace de regreso tipado
- `QuickActions` — acciones contextuales por entidad
- `EntitySummary` — resumen de campos clave
- `SearchNoResults` — estado vacío post-búsqueda

Sidebar: Motor IA agregado en `DIRECTION_ALLOWED`, visible para admin y dirección. `hidden md:flex` para sidebar responsive. Estado del sistema como ítem secundario con estilo diferenciado.

---

## QA realizado

### QA automatizado (pre-merge, rama `feat/plife-ai-engine`)

| Check | Resultado |
|-------|-----------|
| TypeScript `tsc --noEmit` | PASS |
| Build Next.js | PASS — 22 rutas, `/app/ia` incluida |
| Unit tests (Vitest) | 24/24 PASS |
| E2E Playwright | 104 passed, 2 skipped, 0 failed |

Los 2 tests skipped son esperados:
- `auth.spec.ts` — usuario sin profile, requiere fixture manual
- `copilot.spec.ts` — requiere `OPENAI_API_KEY`

### QA manual de smoke (pre-merge, entorno local)

44/44 checks PASS en 3 smokes:
- Smoke `/app/ia` — 29 checks: tabs, categorías, perfiles, prompts, ejecuciones, formulario mock
- Smoke empresa (Clínica Vida Integral) — 8 checks: card IA, botón ejecutar, resultado
- Smoke oportunidad (Beneficios Nubek) — 7 checks: card IA, botón ejecutar, resultado

### Bug encontrado y corregido (pre-merge)

**Zod v4 UUID strict validation** — commit `3728137`

Zod v4.4.3 usa regex estricto para `z.string().uuid()` que exige version bit `[1-8]` y variant bit `[89abAB]`. Los UUIDs del seed demo (`b0000000-...`, `a1000001-...`) usan `version=0/variant=0` → rechazados.

Fix: `z.string().regex(UUID_HEX_RE)` con patrón hex leniente, consistente con la validación client-side preexistente. Afectaba `runMockAnalysis`, `EntityAIAnalysisCard` y `MockExecutionForm`.

---

## Smoke producción — 21/21 PASS

Ejecutado el 2026-07-02 contra `https://plife-uruguay.vercel.app` con usuario admin post-deploy.

| Check | Resultado |
|-------|-----------|
| Login `/login` redirige a `/app/` | ✓ |
| `/app/hoy` carga sin error 500 | ✓ |
| `/app/hoy` sidebar Motor IA visible | ✓ |
| `/app/hoy` sidebar Copiloto IA visible | ✓ |
| `/app/ia` carga sin error 500 | ✓ |
| `/app/ia` sin PGRST205 | ✓ |
| `/app/ia` título "Motor IA PLIFE" | ✓ |
| `/app/ia` Categorías muestra 7 | ✓ |
| `/app/ia` Perfiles muestra "Comercial PLIFE" | ✓ |
| `/app/ia` tab Ejecuciones carga | ✓ |
| `/app/empresas` carga sin error | ✓ |
| `/app/empresas` tiene contenido | ✓ |
| Empresa detail carga sin error | ✓ |
| Empresa detail card "Análisis IA comercial" | ✓ |
| `/app/oportunidades` carga sin error | ✓ |
| Oportunidad detail (`d0000000-...`) carga sin error | ✓ |
| Oportunidad detail card "Análisis IA comercial" | ✓ |
| `/app/compliance` carga sin error | ✓ |
| `/app/compliance` tiene contenido | ✓ |
| `/app/direccion` carga sin error | ✓ |
| `/app/direccion` tiene contenido | ✓ |

---

## Riesgos pendientes

### R-01 — Tests cross-user asesor no ejecutados
La suite E2E no incluye tests con usuario de rol `asesor`. Las policies RLS que restringen acceso a asesores (INSERT/UPDATE/DELETE sobre tablas IA) no fueron validadas con un usuario real de ese rol en el entorno remoto.

**Mitigación:** Pendiente crear usuario `pentest_asesor@plife.uy` en Supabase Auth y ejecutar `ai-engine-pentest.sql` como describe la documentación.

### R-02 — Motor en modo simulado solamente
El runner real con OpenAI está fuera de scope de este release. Los outputs actuales son determinísticos y no representan análisis reales.

**Mitigación:** Esto es intencional en v1.0. La integración con OpenAI queda como siguiente fase.

### R-03 — Rama `feat/plife-ai-engine` conservada remotamente
La rama no fue borrada después del merge para conservar el historial del PR. No tiene efecto en producción.

**Mitigación:** Borrar cuando se confirme que no se necesita referencia al historial de commits no-squasheados.

### R-04 — Backup `backup/main-before-pr1-reset` en local
Existe una rama local `backup/main-before-pr1-reset` que contiene los 13 commits pre-reset que no llegaron a origin.

**Mitigación:** Evaluar si alguno de esos commits tiene trabajo no incluido en el squash. Si no, borrar la rama local cuando se confirme.

---

## Próximos pasos sugeridos

### Inmediato (post-release)
1. Ejecutar pentest RLS con usuario asesor (`ai-engine-pentest.sql`) para cerrar R-01
2. Validar formulario de ejecución mock desde `/app/ia > Ejecuciones` con un run real en producción
3. Evaluar si borrar `feat/plife-ai-engine` remota

### Fase siguiente — Motor IA real
1. Integrar runner real con OpenAI / Anthropic en `domains/ia-engine/`
2. Agregar `OPENAI_API_KEY` a Vercel env vars
3. Activar `copilot.spec.ts` con credenciales de test
4. Auditar costos de tokens por ejecución antes de abrir a asesores

### Mejoras UX pendientes
1. Ejecutar análisis IA desde `/app/ia > Ejecuciones` con entidad real usando el selector
2. Mostrar nombre de la entidad en el historial de ejecuciones (ya parcialmente implementado con `entityNames`)
3. Agregar filtro por entidad y perfil en el tab Ejecuciones

---

## Checklist de seguridad del release

- Sin OpenAI en producción
- Sin `ai_interactions` tocadas
- Sin `.env` ni secrets expuestos en el diff
- RLS habilitado en las 8 tablas nuevas
- Triggers de inmutabilidad aplicados
- RBAC verificado: Motor IA solo visible para admin y dirección
- Working tree limpio post-merge
- No se hizo push manual (deploy automático desde GitHub)
