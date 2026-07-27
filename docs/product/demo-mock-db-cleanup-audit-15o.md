# FASE 15O — Auditoría global demo / mock / fake data (UI + Supabase dev)

**Fecha:** 2026-07-08  
**Rama:** `feat/lead-first-crm`  
**Commit base:** `17a7043` (feat: add proposal detail view)  
**Alcance:** solo auditoría y documentación. Sin código runtime, sin SQL aplicado, sin Supabase write, sin Vercel, sin push.

---

## 1. Resumen ejecutivo

PLIFE Growth OS **todavía parece demo** por tres capas superpuestas:

1. **UI** — badges “Dev”, banners azules de “conectado a Supabase dev”, timeline mock en detalle de lead, copy con “demo/simulado/mock”, CTAs a rutas ocultas del menú (oportunidades, contactos, empresas, radar, copiloto), y affordances de `NEXT_PUBLIC_DEMO_MODE` (badge Demo, recorrido `/app/demo`).
2. **Generación determinística** — propuestas y motores usan `generateMockProposal` / `runEngineMock` / `runMockAnalysis`: funcional pero el lenguaje y la UX dicen “mock”.
3. **Base dev contaminada** — `seed-demo.sql` cargó ~8 empresas, ~8 contactos, ~10 oportunidades y 5 campañas oficiales; fases 14G–15M agregaron leads/propuestas smoke; QA manual duplicó empresas/contactos/campañas “Pérez QA”.

**Hallazgo central:** el producto tiene **datos reales parciales** (leads dev, propuestas 15M) mezclados con **seed comercial demo** y **artefactos de smoke/QA**. Las 8 secciones visibles leen mayormente Supabase real, pero **PLIFE Hoy** y **Dirección** siguen ancladas al modelo viejo (oportunidades/contactos/empresas), lo que infla métricas con datos demo.

**Prioridad de limpieza:**

| Prioridad | Qué | Impacto |
|---|---|---|
| Crítica | Banners “Dev”, timeline mock, copy “lead demo”, CTAs demo mode visibles | Rompe credibilidad inmediata |
| Alta | Seed demo PLIFE en companies/contacts/opportunities/campaigns | Contamina Hoy/Dirección/Campañas |
| Alta | Leads smoke 14G–14I + propuestas DEV 15L/15M | Visibles en secciones Lead-first |
| Media | Duplicados QA (Estudio Contable Pérez QA ×11, Martín Pérez QA ×9) | Ruido en listados ocultos y radar |
| Baja | `MOCK_LEADS` muerto en código, AI seed/config, knowledge demo docs | No visible o infraestructura |

---

## 2. Regla de producto

> **Sin mock visible y sin datos demo contaminando dev.**

- La UI visible no debe mostrar “demo”, “mock”, “Dev”, “simulado” salvo en Admin/diagnóstico explícito.
- Supabase dev debe poder quedar **vacío o con datos controlados manualmente** para observar comportamiento real.
- Nada se borra sin lista exacta de IDs/filtros y aprobación humana (plan 15Q).
- No tocar producción, main, PR #4, `feat/operational-readiness-13`, RLS, `.env`, ni rutas (solo ocultar referencias en fases UI).

---

## 3. Proyecto Supabase dev auditado

| Campo | Valor |
|---|---|
| **Nombre** | plife-crm |
| **Ref** | ayvnloxijnfnooaefrlm |
| **Región** | sa-east-1 |
| **Estado** | ACTIVE_HEALTHY |
| **Modo de esta fase** | **READ-ONLY** — no DELETE, UPDATE, INSERT, TRUNCATE ni migraciones |

**Perfil real único:**

| id | email | full_name | role |
|---|---|---|---|
| `9fb93ddc-7c77-40e1-ab89-1f68ceee8404` | andreslarghero15@gmail.com | Andrés Larghero | admin |

---

## 4. Mapa demo / mock / fake en código

Clasificación según criterios de la tarea:

### A. Mock crítico visible en UI

| Ubicación | Qué | Prioridad |
|---|---|---|
| `src/components/leads/lead-timeline-mock.tsx` | Título “Timeline (demo)”, eventos “Registro demo”, “Nota demo… Sin persistencia” | **Crítica** |
| `src/components/leads/lead-next-action-panel.tsx` | Copy “…para este lead demo” | **Crítica** |
| `src/app/app/leads/page.tsx` | Badge “Dev” en CTA + banner azul “Leads conectados a Supabase dev” | **Crítica** |
| `src/app/app/pipeline/page.tsx` | Banner azul “Pipeline conectado a Supabase dev en modo lectura” | **Alta** |
| `src/app/app/hoy/advisor-dashboard.tsx` + `direction-dashboard.tsx` | `GettingStartedCard mode='demo'` si hay datos + demo mode; link `/app/demo` | **Alta** |
| `src/components/layout/app-header.tsx` | Badge “Demo PLIFE” si `NEXT_PUBLIC_DEMO_MODE=true` | **Alta** |
| `src/app/app/admin/admin-view.tsx` | Banner “Modo demo activo” | **Media** (Admin OK temporalmente) |
| `src/app/app/demo/page.tsx` | Recorrido completo a rutas ocultas (Radar, Empresas demo UUID, Copiloto) | **Alta** (solo si demo mode ON) |
| `src/components/leads/lead-actions-panel.tsx` | Botón “Convertir a oportunidad” **disabled** (falso positivo de acción) | **Alta** |
| `src/domains/intelligence-engines/constants.ts` | Label “Disponible (simulado)” en motores | **Media** |
| `src/components/ia/mock-execution-form.tsx` | “Ejecución mock completada” | **Media** (tab técnico Motores) |
| `src/components/proposals/proposal-create-form.tsx` | Usa `generateMockProposal` — borrador determinístico (real guardar, generación mock) | **Media** |

### B. Mock aceptable temporal pero documentado

| Ubicación | Notas |
|---|---|
| `src/domains/proposals/mock-generator.ts` | Generador determinístico; persistencia real ya existe — renombrar en 15P |
| `src/domains/intelligence-engines/mock-output.ts` | Motores comerciales simulados; documentado en 15D |
| `src/domains/ia-engine/mock-runner.ts` | Ejecución por etapas sin proveedor externo |
| `src/app/app/ia/actions.ts` → `runMockAnalysis` | Persiste runs reales con output simulado |
| Banners informativos en Leads/Pipeline | Útiles en dev interno; deben retirarse antes de “producto real” |

### C. Test / mock solo para tests

| Ubicación |
|---|
| `tests/unit/proposals.test.ts`, `proposals-detail.test.ts`, `commercial-engines.test.ts` |
| `tests/e2e/demo-guided-flow.spec.ts`, `dashboard.spec.ts`, `first-impression.spec.ts` |
| `tests/e2e/helpers/routes.ts` → `ROUTES.demo` |

### D. Docs históricos

| Ejemplos |
|---|
| `docs/product/validation-guide.md`, `operational-flow.md`, `staging-deploy.md` |
| Fases 14G–15N en `docs/product/*` |
| `docs/user-guide/notebooklm-source-index.md` (capturas demo) |

### E. Seed / dev explícito

| Archivo | Propósito |
|---|---|
| `supabase/seed-demo.sql` | Seed comercial oficial (marcadores `b0000000`, `a0000000`, `Demo PLIFE`) |
| `supabase/clear-demo.sql` | Limpieza documentada del seed |
| `supabase/leads-dev-seed-14hb.sql` | 3 leads demo 14HB |
| `supabase/ai-engine-seed.sql` | Config motores (8 stages, 8 prompts) — **conservar** |

### F. Config demo real

| Variable | Comportamiento |
|---|---|
| `NEXT_PUBLIC_DEMO_MODE` | Badge header, “Recorrido demo” en sidebar, banners Admin, GettingStartedCard demo |
| `NEXT_PUBLIC_INTERNAL_OPEN_ACCESS` | Bypass navegación RBAC (admin/dirección/IA visibles para autenticados) |
| `.env.example`, `.env.test.example` | Documentan flags |

### G. Botón falso o CTA sin acción

| Ubicación | Botón |
|---|---|
| `lead-actions-panel.tsx` | “Convertir a oportunidad” disabled |
| `src/components/ia/tab-prompts.tsx` | “Duplicar”, “Desactivar” disabled “Próximamente” |
| `src/app/app/copiloto/copiloto-view.tsx` | Submit disabled si IA no configurada (ruta oculta) |
| Pipeline board | Sin drag & drop (read-only by design, no botón falso) |

### H. Ruta oculta todavía referenciada (desde secciones **visibles**)

| Desde | Destino oculto |
|---|---|
| PLIFE Hoy (advisor + direction) | `/app/oportunidades`, `/app/contactos`, `/app/empresas`, `/app/radar-b2b` |
| Dirección | `/app/oportunidades` (métricas y top B2B) |
| Campañas (list + detalle) | `/app/oportunidades`, `/app/empresas`, `/app/radar-b2b` |
| Propuestas “Crear desde” | `/app/propuestas/nueva?source=radar` (radar oculto) |
| Admin | `/app/admin/system` (oculto del nav) |
| Demo mode ON | `/app/demo` → empresas demo UUID, radar, copiloto |

---

## 5. Auditoría por sección visible

### 5.1 PLIFE Hoy (`/app/hoy`)

| Aspecto | Estado |
|---|---|
| **Datos reales** | Leads vía `getLeads()`; oportunidades, contactos, empresas, campañas, actividades desde Supabase |
| **Datos mock** | `GettingStartedCard` en modo demo; recorrido `/app/demo` si demo mode |
| **Botones reales** | Nuevo lead → `/app/leads/new` |
| **Botones falsos** | Ninguno directo; chips de seguimiento llevan a rutas ocultas |
| **CTAs rutas ocultas** | Ver oportunidades, contactos, empresas, radar-b2b (múltiples widgets) |
| **Textos demo** | “El nuevo foco Lead-first se muestra en paralelo al flujo vigente”; modo demo en GettingStarted |
| **Widgets sin decisión** | StatCards de oportunidades/empresas cuando el menú ya no las promueve |
| **Vacío ideal** | Solo LeadTodayPanel + CTAs lead/pipeline/propuestas; métricas en 0 |
| **Eliminar** | Links a oportunidades/contactos/empresas; bloque recorrido demo |
| **Prioridad** | **Crítica** (doble modelo + seed demo infla números) |

### 5.2 Leads (`/app/leads`)

| Aspecto | Estado |
|---|---|
| **Datos reales** | `getLeads()` Supabase; creación real `/app/leads/new`; calificación/scoring 15I |
| **Datos mock** | Tipo `MockLead` (nombre legacy); timeline mock en detalle; copy “lead demo” |
| **Botones reales** | Nuevo lead, editar operativo, crear propuesta |
| **Botones falsos** | Convertir a oportunidad (disabled) |
| **CTAs ocultas** | Propuesta OK (visible); conversión apunta a oportunidades (futuro) |
| **Textos demo** | Badge “Dev”, banner azul dev, “Lead Demo Dev …” en DB |
| **Vacío ideal** | Lista vacía + CTA “Nuevo lead”; sin banners dev |
| **Eliminar** | Badge Dev, banner azul, timeline mock, copy demo en panels |
| **Prioridad** | **Alta** |

### 5.3 Pipeline (`/app/pipeline`)

| Aspecto | Estado |
|---|---|
| **Datos reales** | Mismos leads que Leads, agrupados por etapa |
| **Datos mock** | Ningún fallback a `MOCK_LEADS` (array muerto en código) |
| **Botones reales** | Ninguno (read-only) |
| **Botones falsos** | N/A — falta mover etapa (no es falso, es incompleto) |
| **CTAs ocultas** | Ninguna directa |
| **Textos demo** | Banner “modo lectura” dev |
| **Vacío ideal** | Columnas vacías por etapa |
| **Prioridad** | **Media** |

### 5.4 Propuestas (`/app/propuestas`)

| Aspecto | Estado |
|---|---|
| **Datos reales** | Listado + detalle persistido (`getProposals`); crear/guardar 15M |
| **Datos mock** | `generateMockProposal` para borrador; copy “determinístico/mock” |
| **Botones reales** | Nueva propuesta, guardar, abrir detalle |
| **Botones falsos** | Ninguno |
| **CTAs ocultas** | Cards “Desde Radar B2B” (radar oculto); source=campaign sin picker real |
| **Textos demo** | “Crear borrador conceptual”; banner azul explicativo |
| **Vacío ideal** | Empty state + CTA Nueva propuesta |
| **Eliminar** | Referencias “mock/conceptual” en copy user-facing |
| **Prioridad** | **Media** (persistencia ya real; limpiar lenguaje) |

### 5.5 Campañas (`/app/campanas`)

| Aspecto | Estado |
|---|---|
| **Datos reales** | CRUD campañas Supabase; linkCounts empresas/oportunidades |
| **Datos mock** | Seed demo `c0000000-*` + campañas QA/test |
| **Botones reales** | Nueva campaña (roles admin/dirección/líder) |
| **Botones falsos** | Ninguno |
| **CTAs ocultas** | Ver pipeline/oportunidades, Radar B2B en detalle |
| **Textos demo** | Nombres “Campaña Demo…”, “test” |
| **Vacío ideal** | Sin campañas + CTA crear |
| **Prioridad** | **Alta** (13 campañas, 7 activas — muchas demo/QA) |

### 5.6 Motores (`/app/ia`)

| Aspecto | Estado |
|---|---|
| **Datos reales** | AI engine schema + seed en dev (stages, prompts, runs) |
| **Datos mock** | 3 motores `available_mock`; `MockExecutionForm`; outputs simulados |
| **Botones reales** | Crear propuesta, ejecutar análisis simulado (persiste run) |
| **Botones falsos** | Duplicar/Desactivar prompt (Próximamente) |
| **CTAs ocultas** | Ninguna crítica en capa comercial |
| **Textos demo** | “Disponible (simulado)”, “Ejemplo de uso”, tabs técnicos extensos |
| **Vacío ideal** | Motores con acciones concretas; sin métricas inventadas |
| **Prioridad** | **Media** |

### 5.7 Dirección (`/app/direccion`)

| Aspecto | Estado |
|---|---|
| **Datos reales** | Conteos oportunidades/contactos/empresas/campañas — **mayoría seed demo** |
| **Datos mock** | Ningún mock UI; datos demo vienen de DB |
| **Botones reales** | Links a pipeline oportunidades |
| **CTAs ocultas** | Todo el dashboard apunta a `/app/oportunidades` |
| **Textos demo** | N/A en copy; métricas reflejan demo seed |
| **Vacío ideal** | Métricas lead-first en cero o empty state |
| **Prioridad** | **Crítica** (100 % modelo viejo) |

### 5.8 Admin (`/app/admin`)

| Aspecto | Estado |
|---|---|
| **Datos reales** | profiles, teams, ai_prompt_versions |
| **Datos mock** | Banner demo mode; tab “Agentes IA” (legacy) |
| **Botones reales** | Tabs usuarios/equipos/agentes; link estado sistema |
| **CTAs ocultas** | `/app/admin/system` |
| **Vacío ideal** | Config real; sin banner demo en uso interno |
| **Prioridad** | **Baja** |

---

## 6. Auditoría modo demo / open access

| Mecanismo | Archivo(s) | ¿Activo? | Alcance | Producción | Recomendación |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_DEMO_MODE` | `src/lib/demo.ts`, sidebar, header, hoy, admin | Solo si env=true | UI affordances demo | Depende del deploy | **Eliminar de UI visible** en 15R; mantener flag solo staging/E2E |
| `/app/demo` | `src/app/app/demo/page.tsx` | Ruta viva; nav solo demo mode | Recorrido 7 pasos → rutas ocultas | No en menú sin flag | Ocultar o retirar de flujo producto |
| `GettingStartedCard mode=demo` | `getting-started-card.tsx` | Si demo mode + datos | Copy “datos de ejemplo” | — | Unificar a `empty` cuando se limpie DB |
| `NEXT_PUBLIC_INTERNAL_OPEN_ACCESS` | `src/lib/internal-open-access.ts`, sidebar, ia, direccion, admin | Solo si env=true | Bypass RBAC navegación | **Debe estar false en prod** | Flag interno OK; documentar cierre pre-launch |
| `MOCK_LEADS` / `getMockLeadById` | `mock-data.ts` | **No usado en runtime** | Dead code | — | Eliminar array en 15P; renombrar tipo `MockLead` → `Lead` |
| Auth bypass | No encontrado | — | — | — | OK |

**Demo mode encontrado:** **Sí** — implementación completa pero **condicionada a env**. No es mock de datos en código; activa navegación y copy demo.

---

## 7. Auditoría base por tabla (read-only)

### Resumen de conteos

| Tabla | Total | Activas | Soft-deleted / notas |
|---|---:|---:|---|
| profiles | 1 | 1 activo | Usuario real |
| leads | 6 | 4 | 2 soft-deleted (14G, 14GB) |
| proposals | 3 | 2 | 1 soft-deleted (15L smoke) |
| campaigns | 13 | 7 activas | 0 soft-deleted |
| companies | 27 | 27 | 0 soft-deleted |
| contacts | 23 | 23 | 0 soft-deleted |
| opportunities | 16 | 16 | 0 soft-deleted |
| activities | 10 | — | Seed demo |
| ai_stages | 8 | — | Seed config — conservar |
| ai_categories | 7 | — | Seed config — conservar |
| ai_prompts | 8 | — | Seed config — conservar |
| ai_analysis_profiles | 1 | — | Seed config — conservar |
| ai_profile_prompts | 8 | — | Seed config — conservar |
| ai_execution_runs | 8 | — | Runs sobre entidades demo |
| ai_execution_outputs | 64 | — | Ligados a runs demo |
| knowledge_documents | 5 | — | Seed demo (`f0000000`, tag demo) |
| knowledge_chunks | 5 | — | Seed demo |
| teams | 2 | — | Config |

### 7.1 leads

| id | title | active | clasificación |
|---|---|---|---|
| `b5242c53-…` | Lead Demo Dev 14G | soft-deleted | C — smoke 14G |
| `5090faf8-…` | Lead Demo Dev 14GB Soft Delete | soft-deleted | C — smoke 14GB |
| `55921b1d-…` | Lead Demo Dev Vida 14HB | activo | D — demo visible |
| `49f76fa1-…` | Lead Demo Dev Empresa 14HB | activo | D — demo visible |
| `5d57fb58-…` | Lead Demo Dev Seguimiento 14HB | activo | D — demo visible |
| `28d0fc3b-…` | Lead Demo Dev UI 14I | activo | D — demo visible |

**Recomendación:** soft-delete o delete físico de los 4 activos demo; los 2 ya soft-deleted pueden purgarse en 15Q.

### 7.2 proposals

| id | title | active | clasificación |
|---|---|---|---|
| `0c7f8fa7-…` | DEV SMOKE Proposal 15L | soft-deleted | C — smoke |
| `abad39e4-…` | DEV Proposal 15M Manual | activo | C/D — smoke fase 15M |
| `2cc6b591-…` | DEV Proposal 15M Lead | activo | C/D — smoke fase 15M |

**Recomendación:** limpiar los 3 en 15Q; dejar tabla vacía para carga manual.

### 7.3 companies

**Seed oficial (`source = 'Demo PLIFE'`, UUID `b0000000-*`):** 8 empresas  
**Tutorial/smoke:** `Empresa Demo Tutorial PLIFE`, `Clinica Vida Integral` (sin tilde, smoke 13E)  
**QA duplicados:** `Estudio Contable Pérez QA` × **11** IDs distintos  
**Otros no-demo:** 6 empresas `33333333-*` (dataset alternativo), varias sin source

**Recomendación:** delete físico seed demo + QA + tutorial; **revisión humana** para `33333333-*` (¿conservar como dataset manual?).

### 7.4 contacts

**Seed demo (`@demo.plife`, `a0000000-*`):** 8 contactos  
**Tutorial:** `Laura Demo` (`laura.demo.tutorial@example.com`)  
**QA duplicados:** `Martín Pérez QA` × **9** (`martin.perezqa@estudio.test`)

**Recomendación:** limpiar demo + QA + tutorial; conservar solo contactos creados manualmente post-limpieza.

### 7.5 opportunities

**Seed demo (`d0000000-*`):** 10 oportunidades  
**Extra demo:** `Seguro colectivo demo` (`e964fefd-…`)  
**5 adicionales** no matching prefix — revisar FKs con empresas QA

**Recomendación:** delete físico oportunidades demo + dependencias (activities, ai runs).

### 7.6 campaigns

| id | name | status | clasificación |
|---|---|---|---|
| `c0000000-*` (×5) | Dueños pymes, Estudios contables, Clínicas, Tech, Reclutamiento | activa | B — seed útil pero demo |
| `44444444-*` (×3) | Clínicas Q3, Estudios Ciclo, Pymes Tech | activa/borrador | E — dataset alternativo |
| `03f6f274-…` | Campaña Demo Beneficios Empresas | borrador | D |
| `4b2e5213-…`, `929324ac-…`, `0d6fab78-…` | Estudios contables QA | borrador | C |
| `d333909b-…` | test | archivada | C |

**Recomendación:** vaciar campañas demo/QA/test; conservar solo si el equipo quiere guion — **aprobación humana** para `44444444-*`.

### 7.7 AI / knowledge

- **Conservar:** `ai_stages`, `ai_categories`, `ai_prompts`, `ai_analysis_profiles`, `ai_profile_prompts` (config producto).
- **Limpiar:** `ai_execution_runs` + `ai_execution_outputs` (8 runs sobre entidades demo).
- **Limpiar:** `knowledge_documents` + `knowledge_chunks` seed demo (`f0000000-*`, tags demo).

### 7.8 activities

- 10 actividades — mayoría ligadas a seed demo. **Limpiar** con oportunidades demo.

---

## 8. Clasificación de datos de base

| Clase | Descripción | Ejemplos en dev |
|---|---|---|
| **A. Conservar** | Real/manual | `profiles` Andrés Larghero |
| **B. Seed útil** | Config infra | AI engine seed, teams |
| **C. Smoke test** | Fases 14G–15M | Leads 14HB/14I, proposals 15L/15M, QA duplicates |
| **D. Demo visible** | seed-demo.sql | companies/contacts/opps/campaigns `*0000000*` |
| **E. Histórico referencia** | Dataset alternativo | `33333333-*` companies, `44444444-*` campaigns |
| **F. Huérfanos/inconsistentes** | Duplicados, sin FK | 11× Estudio Pérez QA, Clinica vs Clínica Vida |
| **G. Soft-deleted OK** | Ya ocultos RLS | leads 14G/14GB, proposal 15L |
| **H. Exportar antes** | Por si acaso | Dump CSV de seed demo completo antes de 15Q |

### Recomendación por tabla

| Tabla | Acción recomendada |
|---|---|
| profiles | **conservar** |
| leads | **limpiar** delete/soft-delete todos los demo; vaciar |
| proposals | **limpiar** delete todos smoke; vaciar |
| companies | **limpiar** delete físico demo+QA; revisión `33333333-*` |
| contacts | **limpiar** delete físico demo+QA+tutorial |
| opportunities | **limpiar** delete físico demo |
| campaigns | **limpiar** demo+QA+test; revisión `44444444-*` |
| activities | **limpiar** con oportunidades |
| ai_execution_* | **limpiar** delete físico |
| knowledge_* | **limpiar** demo docs |
| ai_stages/categories/prompts/profiles | **conservar** |
| teams | **conservar** o revisión humana |

---

## 9. Datos demo / smoke encontrados (IDs)

### Leads activos demo
- `55921b1d-f2d4-4fa1-a5ac-af2ec76b9dcd`
- `49f76fa1-43c9-464f-ba24-b4d4a2f4df1e`
- `5d57fb58-2d75-434f-9529-a84d32fe8667`
- `28d0fc3b-a814-42b7-9d21-e0180fed2be4`

### Proposals smoke
- `abad39e4-9265-4272-b199-2bf58133bd56`
- `2cc6b591-1f51-45f0-b836-8c3d97eb98d9`
- `0c7f8fa7-1c5b-42a7-bd1c-ad7e389e637e` (soft-deleted)

### Companies seed (`b0000000-0000-0000-0000-000000000001` … `010`)
Ver §7.3 — 8 UUIDs fijos.

### Contacts seed (`a0000000-0000-0000-0000-000000000001` … `008`)

### Opportunities seed (`d0000000-0000-0000-0000-000000000001` … `010`) + `e964fefd-4540-4062-8601-af381ca44ec3`

### Campaigns seed (`c0000000-0000-0000-0000-000000000005`) + demo/QA IDs en §7.6

---

## 10. Datos que deben conservarse

1. Perfil admin real (`9fb93ddc-…`).
2. AI engine config seed (stages, categories, prompts, profiles, profile_prompts).
3. Teams (2) — salvo decisión de vaciar config.
4. Opcional **revisión humana:** empresas/campañas `33333333-*` / `44444444-*` si se quieren como dataset de prueba no-demo.

---

## 11. Datos que deben limpiarse (post-aprobación)

1. Todo el seed `seed-demo.sql` (companies, contacts, opportunities, campaigns, activities, knowledge).
2. Leads demo fases 14G–14I (activos + soft-deleted).
3. Proposals DEV 15L/15M.
4. Duplicados QA (Estudio Contable Pérez QA, Martín Pérez QA, campañas QA, `test`).
5. AI execution runs/outputs sobre entidades demo.
6. Empresa smoke `Clinica Vida Integral`, `Empresa Demo Tutorial PLIFE`, `Laura Demo`.

---

## 12. Datos que requieren aprobación humana

| Item | Pregunta |
|---|---|
| Dataset `33333333-*` / `44444444-*` | ¿Dataset manual alternativo o demo a borrar? |
| `teams` (2 filas) | ¿Conservar estructura de equipos? |
| Soft-deleted leads/proposals | ¿Purge físico o dejar archivados? |
| `clear-demo.sql` vs limpieza custom 15Q | ¿Script existente suficiente + extensión QA? |

---

## 13. Estado vacío ideal del producto

### PLIFE Hoy
- Sin leads → empty state “Cargá tu primer lead” (LeadTodayPanel vacío).
- Sin propuestas → no mostrar métricas falsas de oportunidades.
- Sin campañas → sugerir crear campaña (CTA real).
- Sin bloque “Recorrido demo” ni links a oportunidades/contactos.

### Leads
- Lista vacía real; CTA Nuevo lead; sin badge Dev ni banners azules.
- Detalle sin timeline mock ni copy “demo”.

### Pipeline
- Columnas vacías; sin leads inventados.

### Propuestas
- Listado vacío; CTA Nueva propuesta; borrador determinístico OK pero sin palabra “mock”.

### Campañas
- Vacío real; CTA Nueva campaña (acción real para roles permitidos).

### Motores
- Motores con acciones concretas; label “Determinístico interno” en lugar de “simulado”.
- Sin métricas inventadas en dashboard técnico.

### Dirección
- Métricas lead-first en cero o empty state; no contar seed demo.

### Admin
- Usuarios/equipos reales; sin banner demo en uso interno.

---

## 14. Plan 15P–15U (roadmap post-auditoría)

| Fase | Nombre | Alcance |
|---|---|---|
| **15P** | UI anti-demo | Quitar badges Dev, banners azules dev, timeline mock, copy “demo/mock/simulado” user-facing; renombrar `MockLead`; dead code `MOCK_LEADS` |
| **15Q** | Limpieza segura Supabase dev | Ver §15 — backup + DELETE ordenado por FK |
| **15R** | Demo mode y open access | Desactivar affordances demo en UI producto; documentar flags solo staging/E2E |
| **15S** | Navegación lead-first | Reemplazar CTAs a rutas ocultas en Hoy/Dirección/Campañas por leads/pipeline/propuestas |
| **15T** | Propuestas y motores — lenguaje real | Renombrar `generateMockProposal`; copy “borrador asistido” vs “mock” |
| **15U** | Smoke base limpia | Validación manual: 8 secciones con DB vacía; checklist empty states |

*Nota:* Las fases 15I–15N del doc 15H están parcialmente completadas (15I, 15M, 15N parcial). 15P–15U continúan el roadmap hacia “producto sin demo”.

---

## 15. Plan específico 15Q — Limpieza segura Supabase dev

### 15Q.1 Backup / export previo

```bash
# Ejemplo — ejecutar localmente con credenciales dev (NO en esta fase)
pg_dump --data-only --table=leads --table=proposals --table=companies \
  --table=contacts --table=opportunities --table=campaigns \
  --table=activities --table=ai_execution_runs --table=ai_execution_outputs \
  --table=knowledge_documents --table=knowledge_chunks \
  > backup-pre-15q-$(date +%Y%m%d).sql
```

Alternativa: export CSV por tabla desde Supabase Dashboard → SQL editor SELECT.

### 15Q.2 Tablas afectadas

`ai_execution_outputs` → `ai_execution_runs` → `activities` → `opportunities` → `contacts` → `companies` → `campaigns` → `knowledge_chunks` → `knowledge_documents` → `leads` → `proposals`

**No tocar:** `profiles`, `ai_stages`, `ai_categories`, `ai_prompts`, `ai_analysis_profiles`, `ai_profile_prompts`, `teams` (salvo decisión).

### 15Q.3 Filtros exactos

**Paso 1 — Ejecutar `supabase/clear-demo.sql`** (ya documentado para seed oficial).

**Paso 2 — Leads demo:**
```sql
-- REVISAR antes de ejecutar
DELETE FROM leads WHERE title ILIKE 'Lead Demo Dev%' OR title ILIKE '%14HB%' OR title ILIKE '%14I%';
```

**Paso 3 — Proposals smoke:**
```sql
DELETE FROM proposals WHERE title ILIKE 'DEV %' OR title ILIKE '%SMOKE%';
```

**Paso 4 — QA duplicates:**
```sql
DELETE FROM contacts WHERE email = 'martin.perezqa@estudio.test' OR first_name = 'Laura' AND last_name = 'Demo';
DELETE FROM companies WHERE name ILIKE '%Pérez QA%' OR name ILIKE '%Demo Tutorial%' OR name = 'Clinica Vida Integral';
DELETE FROM campaigns WHERE name ILIKE '%QA%' OR name IN ('test', 'Campaña Demo Beneficios Empresas');
```

**Paso 5 — AI runs demo** (después de limpiar entidades):
```sql
DELETE FROM ai_execution_outputs WHERE run_id IN (SELECT id FROM ai_execution_runs);
DELETE FROM ai_execution_runs;
```

**Paso 6 — Purge soft-deleted (opcional):**
```sql
DELETE FROM leads WHERE deleted_at IS NOT NULL;
DELETE FROM proposals WHERE deleted_at IS NOT NULL;
```

### 15Q.4 Método por tipo

| Tipo | Método |
|---|---|
| Seed demo oficial | DELETE físico vía `clear-demo.sql` |
| Leads/proposals smoke | DELETE físico |
| QA duplicates | DELETE físico |
| Soft-deleted | DELETE físico opcional tras export |
| AI config seed | **Conservar** |
| Tablas vacías post-limpieza | leads, proposals, companies, contacts, opportunities, campaigns |

**No usar TRUNCATE** salvo tabla sin FKs y vacía — preferir DELETE con filtros.

### 15Q.5 Orden por FKs

1. `ai_execution_outputs`
2. `ai_execution_runs`
3. `activities`
4. `notes` (si existen refs demo)
5. `opportunities`
6. `contacts`
7. `companies`
8. `campaigns`
9. `knowledge_chunks`
10. `knowledge_documents`
11. `leads`
12. `proposals`

### 15Q.6 Smoke posterior

- [ ] Login admin dev
- [ ] `/app/hoy` — empty states, sin contadores inflados
- [ ] `/app/leads` — vacío; crear 1 lead manual
- [ ] `/app/pipeline` — 1 lead en columna
- [ ] `/app/propuestas` — crear + guardar + listar + detalle
- [ ] `/app/campanas` — vacío o solo manual
- [ ] `/app/ia` — config seed intacta; sin runs viejos
- [ ] `/app/direccion` — ceros o empty
- [ ] `/app/admin` — 1 usuario

### 15Q.7 Base lista para carga manual

1. Ejecutar 15Q con backup.
2. Verificar conteos en cero para entidades comerciales.
3. Cargar **un lead manual** → validar pipeline → propuesta → (futuro) campaña.
4. Mantener `NEXT_PUBLIC_DEMO_MODE=false` y `NEXT_PUBLIC_INTERNAL_OPEN_ACCESS` según entorno.

---

## 16. Riesgos

1. **FK violations** si se borra companies antes que contacts/opportunities.
2. **Pérdida de runs AI** útiles para debug — mitigar con export.
3. **Confusión dataset `33333333-*`** — borrar sin revisar puede eliminar datos que el equipo quería conservar.
4. **UI sigue mostrando demo** aunque DB esté limpia — requiere 15P/15R en paralelo.
5. **E2E tests** dependen de seed demo (`dashboard.spec.ts`) — actualizar tests o usar `.env.test` con seed dedicado post-limpieza.
6. **Doble modelo** en Hoy/Dirección seguirá mostrando vacío incorrecto hasta 15S/15M lead-first.

---

## Anexo — QA documental (TAREA 10)

Ejecutar tras commit del doc:

```bash
npm run type-check
npm run test:unit
```

---

## Anexo — Confirmaciones de entorno

| Check | Estado |
|---|---|
| Rama | `feat/lead-first-crm` ✓ |
| Working tree | limpio pre-doc ✓ |
| No main | ✓ |
| No feat/operational-readiness-13 | ✓ |
| No push | ✓ (pendiente commit local) |
| No Supabase write | ✓ (solo SELECT) |
| No Vercel | ✓ |
| No .env modificado | ✓ |
| No PR #4 tocado | ✓ |

---

## FASE 15P — Limpieza UI anti-demo ejecutada

**Fecha:** 2026-07-08  
**Commit:** (ver `git log` en rama `feat/lead-first-crm`)  
**Documento:** `docs/product/ui-anti-demo-cleanup-15p.md`

### Resumen

- UI visible depurada: timeline mock, badges Dev, copy demo, botones falsos, CTAs a rutas ocultas desde Hoy, recorrido demo en nav/header.
- PLIFE Hoy simplificado a foco lead-first + campañas + agenda.
- Motores: labels honestos; botones Duplicar/Desactivar removidos.
- Supabase: **no tocado** en 15P.

### QA 15P

- `npm run build` — OK
- `npm run type-check` — OK
- `npm run test:unit` — 169 tests OK (incl. `ui-anti-demo.test.ts`)

---

## FASE 15Q — Limpieza dev ejecutada

**Fecha:** 2026-07-08  
**Modelo:** Claude Opus 4.8  
**Proyecto:** `plife-crm` / `ayvnloxijnfnooaefrlm` (dev)  
**Documento detallado:** `docs/product/dev-data-cleanup-15q.md`  
**Aprobación explícita:** SÍ — alcance "TOTAL con soft-delete en leads/proposals, delete físico en el resto".

### Backups previos
`backups/dev-cleanup-15q/` (11 archivos JSON, git-ignored, no commiteados): profiles, teams, leads, proposals, companies, contacts, opportunities, campaigns, activities, knowledge_documents, ai_execution_runs_outputs.

### Datos limpiados (180 filas)

| Tabla | Filas | Método | Estado final |
|---|---|---|---|
| `ai_execution_outputs` | 64 | delete físico | 0 |
| `ai_execution_runs` | 8 | delete físico | 0 |
| `activities` | 10 | delete físico | 0 |
| `opportunities` | 16 | delete físico | 0 |
| `contacts` | 23 | delete físico | 0 |
| `companies` | 27 | delete físico | 0 |
| `campaigns` | 13 | delete físico | 0 |
| `knowledge_chunks` | 5 | delete físico | 0 |
| `knowledge_documents` | 5 | delete físico | 0 |
| `proposals` | 3 | soft-delete | 3 (0 activas) |
| `leads` | 6 | soft-delete | 6 (0 activas) |

Incluyó el dataset alternativo `22222222/33333333/44444444/55555555-*` (aprobado en el alcance TOTAL).

### Datos conservados
- `profiles`: 1 (Andrés Larghero, admin, activo).
- `teams`: 2.
- Config IA: `ai_stages` (8), `ai_prompts` (8), `ai_analysis_profiles` (1), `ai_categories`, `ai_profile_prompts`.

### Validación post-limpieza
- Entidades comerciales visibles → 0 filas activas.
- `leads`/`proposals` → 100% soft-deleted (filtradas por `deleted_at`).
- `profiles` intacto; RLS sin cambios.
- Producción **no tocada**.

### QA 15Q
- `npm run type-check` — OK
- `npm run test:unit` — 169 tests OK
- `npm run build` — OK (24 rutas)

---

## FASE 15R — Validación con base limpia

**Fecha:** 2026-07-08  
**Documento:** `docs/product/empty-state-and-manual-load-15r.md`  
**Commit:** (ver hash en reporte 15R)

Tras 15Q (base comercial 0 activos), se validaron empty states en las 8 secciones visibles, se corrigió copy/layout en Hoy, Dirección, Propuestas y Admin, y se cargó **1 lead + 1 propuesta** controlados para verificar el flujo lead-first sin reintroducir demo.

- Empty states: OK (sin datos inventados, CTAs reales).
- Lead de validación: `e77676c9-a4b4-44e7-a4df-c9500cb4b389`.
- Propuesta vinculada: `d22f5fad-5bcf-468f-9f7c-fb774543f1b7`.
- E2E UI completo: pendiente (login timeout Playwright).
- QA: type-check, 170 unit tests, build OK.
