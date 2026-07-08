# FASE 15Q — Limpieza segura de datos demo en Supabase dev

**Fecha:** 2026-07-08
**Modelo:** Claude Opus 4.8 (obligatorio por riesgo alto de datos)
**Rama:** `feat/lead-first-crm`
**Rol:** Database Auditor + Supabase RLS Specialist + QA Lead
**Documentos base:** `demo-mock-db-cleanup-audit-15o.md`, `ui-anti-demo-cleanup-15p.md`

---

## 1. Objetivo

Limpiar los datos demo/smoke/seed/QA de Supabase **dev** para dejar la base preparada para carga manual real/controlada, con backup previo y aprobación explícita antes de cualquier escritura.

## 2. Proyecto / ref

- **Nombre:** `plife-crm`
- **Ref:** `ayvnloxijnfnooaefrlm`
- **Región:** sa-east-1 · **Postgres:** 17 · **Estado:** ACTIVE_HEALTHY
- Producción, `main`, PR #4, `feat/operational-readiness-13` y Vercel: **no tocados**.

## 3. Backup / export previo

Carpeta local **no commiteada** (añadida a `.gitignore` → `/backups/`):

```
backups/dev-cleanup-15q/
├── profiles_before_15q.json
├── teams_before_15q.json
├── leads_before_15q.json
├── proposals_before_15q.json
├── companies_before_15q.json
├── contacts_before_15q.json
├── opportunities_before_15q.json
├── campaigns_before_15q.json
├── activities_before_15q.json
├── knowledge_documents_before_15q.json
└── ai_execution_runs_outputs_before_15q.raw.json
```

Incluye filas activas y soft-deleted, IDs, timestamps y campos principales. Sin secretos ni `.env`. No se commitean por contener datos (aunque son ficticios).

## 4. Aprobación

Antes de cualquier `DELETE/UPDATE/TRUNCATE` se presentó el bloque **"PLAN DE LIMPIEZA 15Q — REQUIERE APROBACIÓN"** y se detuvo la ejecución.

- **Aprobación recibida:** SÍ.
- **Alcance elegido:** limpieza **TOTAL** (incluye dataset alternativo `2/3/4/5*`) con **soft-delete** en `leads` y `proposals` y **delete físico** en el resto.

## 5. Estado previo (verificado antes de limpiar)

Toda la data de negocio en dev era demo/seed/QA/smoke/tutorial o dataset alternativo. **No existía dato real/manual** salvo el perfil admin.

| Tabla | Filas previas | Naturaleza |
|---|---|---|
| leads | 6 (4 activos, 2 soft) | Lead Demo Dev 14G–14I |
| proposals | 3 (2 activos, 1 soft) | DEV 15M Manual/Lead, DEV SMOKE 15L |
| companies | 27 | seed `b0*` (8), alt `33*` (6), QA `Pérez QA` (11), tutorial/smoke (2) |
| contacts | 23 | seed `a0*` (8), alt `22*` (5), QA `Martín Pérez QA` (9), Laura Demo (1) |
| opportunities | 16 | seed `d0*` (10), alt `55*` (5), tutorial (1) |
| campaigns | 13 | seed `c0*` (5), alt `44*` (3), QA (3), demo (1), test (1) |
| activities | 10 | ligadas a seed demo |
| ai_execution_runs / outputs | 8 / 64 | runs sobre entidades demo |
| knowledge_documents / chunks | 5 / 5 | tag `demo` |

## 6. Ejecución (orden por FKs, atómico)

Transacción única (`BEGIN … COMMIT`) en este orden:

1. `DELETE FROM ai_execution_outputs`
2. `DELETE FROM ai_execution_runs`
3. `DELETE FROM knowledge_chunks`
4. `DELETE FROM knowledge_documents`
5. `DELETE FROM activities`
6. `DELETE FROM opportunities`
7. `DELETE FROM contacts`
8. `DELETE FROM companies`
9. `DELETE FROM campaigns`
10. `UPDATE proposals SET deleted_at = now(), updated_at = now() WHERE deleted_at IS NULL`
11. `UPDATE leads SET deleted_at = now(), updated_at = now() WHERE deleted_at IS NULL`

Tablas hijas `ai_interactions`, `notes`, `campaign_targets`, `campaign_messages` estaban vacías (0 filas) → sin acción. Sin errores.

## 7. Método por tabla

| Tabla | Método | Motivo |
|---|---|---|
| ai_execution_outputs / runs | delete físico | seed demo puro, sin valor de auditoría real |
| knowledge_documents / chunks | delete físico | documentos demo (`f0*`, tag demo) |
| activities | delete físico | seed demo |
| opportunities / contacts / companies / campaigns | delete físico | 100% demo/seed/QA/alt |
| proposals / leads | soft-delete (`deleted_at`) | conservar rastro; la app filtra `deleted_at IS NULL` |

## 8. Datos conservados

- `profiles`: `9fb93ddc-…` Andrés Larghero (admin, activo).
- `teams`: `11111111-…001/002`.
- Config de motores IA: `ai_stages` (8), `ai_prompts` (8), `ai_analysis_profiles` (1), `ai_categories`, `ai_profile_prompts`.

## 9. Validación post-limpieza (read-only)

| Tabla | Total | Activas | Soft-deleted |
|---|---|---|---|
| companies | 0 | 0 | — |
| contacts | 0 | 0 | — |
| opportunities | 0 | 0 | — |
| campaigns | 0 | 0 | — |
| activities | 0 | 0 | — |
| ai_execution_runs | 0 | 0 | — |
| ai_execution_outputs | 0 | 0 | — |
| knowledge_documents | 0 | 0 | — |
| knowledge_chunks | 0 | 0 | — |
| leads | 6 | 0 | 6 |
| proposals | 3 | 0 | 3 |
| profiles | 1 | 1 | — |
| teams | 2 | 2 | — |
| ai_stages / ai_prompts / ai_analysis_profiles | 8 / 8 / 1 | conservadas | — |

- No quedan registros DEV/Demo/Smoke/Test/Mock/Seed visibles en las listas de la app.
- `profiles` conserva a Andrés. RLS sin modificar.
- Producción intacta.

## 10. QA de la app

- `npm run type-check` — OK
- `npm run test:unit` — 169 tests OK (12 archivos)
- `npm run build` — OK (24 rutas)

## 11. Estado final por tabla

Base comercial vacía / oculta, lista para carga manual real:
- Entidades de negocio (companies, contacts, opportunities, campaigns, activities, knowledge, ai runs) → físicamente vacías.
- leads / proposals → soft-deleted (invisibles en UI, recuperables).
- Núcleo conservado: perfil admin, equipos, configuración de motores IA.

## 12. Riesgos pendientes

1. `leads`/`proposals` mantienen filas soft-deleted; si se desea base 100% física-vacía, purga posterior aprobada.
2. E2E (`dashboard.spec.ts`) que dependían del seed demo requerirán seed dedicado o `.env.test`.
3. "Doble modelo" en Hoy/Dirección se resuelve en 15S (lead-first), no en 15Q.

## 13. Confirmaciones

| Check | Estado |
|---|---|
| Modelo Opus | ✓ |
| Proyecto/ref dev confirmado | ✓ `plife-crm` / `ayvnloxijnfnooaefrlm` |
| Backup previo | ✓ local, no commiteado |
| Aprobación explícita | ✓ |
| Producción intacta | ✓ |
| No main / PR #4 / operational-readiness-13 | ✓ |
| No Vercel | ✓ |
| No `.env` modificado | ✓ |
| No push | ✓ |
| OpenAI / Compliance no reintroducidos | ✓ |

---

## FASE 15R — Validación con base limpia

**Fecha:** 2026-07-08  
**Documento detallado:** `docs/product/empty-state-and-manual-load-15r.md`

Tras la limpieza 15Q, se validaron empty states con base comercial vacía y se cargó data controlada mínima:

- **Lead activo:** `e77676c9-a4b4-44e7-a4df-c9500cb4b389` — “Lead inicial de validación”.
- **Propuesta activa:** `d22f5fad-5bcf-468f-9f7c-fb774543f1b7` — “Propuesta inicial de validación” (`source=lead`).
- UI: empty states en Hoy, Dirección, Propuestas, Admin; copy anti-demo en crear lead.
- QA 15R: type-check OK, 170 unit tests OK, build OK.
