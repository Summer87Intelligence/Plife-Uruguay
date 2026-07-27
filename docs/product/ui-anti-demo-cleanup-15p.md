# FASE 15P — Limpieza UI anti-demo

**Fecha:** 2026-07-08  
**Rama:** `feat/lead-first-crm`  
**Base:** auditoría `demo-mock-db-cleanup-audit-15o.md`  
**Alcance:** solo UI/frontend. Sin Supabase, sin SQL, sin `.env`, sin push.

---

## 1. Objetivo

Dejar de parecer demo/mock en las **8 secciones visibles**, eliminando affordances que no aportan acción real:

- timeline mock en detalle de lead
- badges/banners “Dev”
- copy “demo/simulado/mock” user-facing
- botones disabled o “Próximamente”
- CTAs a rutas ocultas del menú desde PLIFE Hoy
- links al recorrido demo desde flujo principal

---

## 2. Elementos removidos

| Área | Qué se quitó |
|---|---|
| **Leads** | `LeadTimelineMock` del detalle; badge “Dev”; banner azul Supabase dev; copy “lead demo”; botón “Convertir a oportunidad” |
| **Pipeline** | Banner azul “modo lectura dev” |
| **Detalle lead** | Banner amber demo/dev; prop `dataSource` |
| **PLIFE Hoy** | Widgets de oportunidades/contactos/empresas; `FollowUpCenter`; métricas seed demo; CTAs a rutas ocultas; link `/app/demo`; `GettingStartedCard mode='demo'` |
| **Vista Dirección (Hoy)** | Recorrido demo; pipeline/oportunidades/contactos widgets; radar en accesos rápidos |
| **Motores** | Label “Disponible (simulado)” → “Disponible”; “Conceptual” → “Pendiente de salida operativa”; botones Duplicar/Desactivar prompt |
| **Header/Sidebar** | Badge “Demo PLIFE”; ítem “Recorrido demo” en nav |
| **Campañas (listado)** | CTAs “Ver empresas”, “Ver oportunidades”, “Crear oportunidad” |
| **Dirección (parcial)** | Links a oportunidades en foco comercial y top B2B; CTA guía → `/app/leads` |

---

## 3. Elementos conservados

- Ruta `/app/demo` (sin acceso desde menú principal ni Hoy)
- `lead-timeline-mock.tsx` (archivo sin uso; no renderizado)
- `generateMockProposal` / `runMockAnalysis` (lógica interna; copy user-facing neutralizado donde tocaba UI)
- Calificación/scoring 15I en detalle de lead
- CTA “Crear propuesta desde este lead”
- Campañas activas + agenda de hoy en PLIFE Hoy (secciones visibles)
- Admin banner demo mode (diagnóstico; pendiente 15R)

---

## 4. Rutas no borradas

Todas las rutas ocultas siguen existiendo (`/app/oportunidades`, `/app/contactos`, `/app/empresas`, `/app/radar-b2b`, `/app/copiloto`, `/app/demo`, `/app/admin/system`, etc.). Solo se **retiraron links visibles** desde secciones principales.

---

## 5. Pendientes (fases siguientes)

| Fase | Qué queda |
|---|---|
| **15Q** | Limpieza datos demo/smoke en Supabase dev |
| **15R** | Retirar flags demo mode / open access del producto (Admin, env) |
| **15S** | Rediseño navegación lead-first completo (Dirección, FollowUpCenter lead-based) |
| **15T** | Renombrar `generateMockProposal` y copy propuestas |
| **15U** | Smoke con base vacía |

**Dirección (`/app/direccion`):** métricas legacy (oportunidades/contactos/empresas) siguen visibles — rediseño lead-first pendiente 15M/15S.

**Detalle campaña (`/app/campanas/[id]`):** pueden quedar links a rutas ocultas — no rediseñado en 15P.

---

## 6. Confirmación

- Supabase: **no tocado**
- SQL: **no aplicado**
- RLS: **sin cambios**
- `.env`: **sin cambios**
- Vercel: **sin cambios**
- OpenAI / Compliance: **no reintroducidos**

---

## 7. Tests

- Nuevo: `tests/unit/ui-anti-demo.test.ts`
- QA: `npm run build`, `npm run type-check`, `npm run test:unit`
