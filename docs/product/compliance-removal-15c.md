# FASE 15C — Remoción de Compliance del producto

> Estado: **COMPLETADO** en la rama `feat/lead-first-crm`.
> Decisión de producto: **Compliance deja de existir como sección, menú, ruta,
> motor/agente y flujo del producto.**

---

## 1. Decisión

Compliance se elimina como **sección y concepto del producto**. Ya no aparece en
el menú/sidebar, no tiene ruta navegable, no es un agente/etapa de los motores, y
la copy del producto no lo presenta como un flujo disponible.

No se implementa todavía la futura "Validación comercial" (fase posterior). No se
reintroduce OpenAI ni ningún proveedor externo. Los motores siguen operando en
**modo determinístico interno** (según FASE 15B).

---

## 2. Alcance

- Menú/sidebar y navegación: sin ítem Compliance.
- Rutas: `/app/compliance` eliminada.
- UI: sin panel/bloque Compliance en el detalle de Lead, guías, dashboard, demo y
  quick actions.
- Motores: sin agente `compliance_agent`, sin etapa `Compliance`, sin
  `runDeterministicCompliance`, sin capa de riesgo/compliance en `runAgent` ni en
  el resultado del copiloto (`AIResult.compliance`).
- Tests: sin specs ni asserts apuntando a Compliance.
- Documentación activa: no presenta Compliance como sección/motor/flujo.

Fuera de alcance (no se hizo):

- Aplicar SQL / tocar Supabase remoto. Las tablas `compliance_rules` y
  `compliance_reviews` **siguen existiendo en la base** (no se borraron). Sus tipos
  en `src/types/database.ts` se conservan como **espejo del schema remoto**,
  marcados como legado y sin uso en la aplicación.
- Rediseño funcional de los motores (FASE 15D+).
- Implementar "Validación comercial" u otro reemplazo.

---

## 3. Archivos removidos

- `src/app/app/compliance/page.tsx`
- `src/app/app/compliance/compliance-view.tsx`
- `src/lib/ai/compliance.ts` (motor determinístico + `reviewCommercialMessage`)
- `src/components/leads/lead-compliance-mock.tsx`
- `tests/e2e/compliance.spec.ts`
- `tests/unit/compliance.test.ts`

## 4. Archivos modificados (qué se eliminó)

**Motores / AI**
- `src/lib/ai/agents.ts` — se quitó `runDeterministicCompliance`; la traza registra
  riesgo neutro (`bajo`, sin flags).
- `src/lib/ai/prompts.ts` — se quitó el agente `compliance_agent` de `AgentName` y
  de los prompts por defecto.
- `src/domains/ai/types.ts` — `AIResult` ya no tiene el campo `compliance`.
- `src/domains/ai/actions.ts` — se quitaron las llamadas a `reviewCommercialMessage`
  en copiloto/B2B/campaña y la acción pública `checkCompliance`.
- `src/domains/ia-engine/mock-runner.ts` — se quitó la etapa mock `Compliance`.
- `src/domains/ia-engine/prompt-validation.ts` — se quitó la regla de sugerencia
  `compliance_limits` y la mención de compliance en textos.
- `src/domains/ia-engine/prompt-safety.ts` — comentario neutralizado.
- `src/components/ia/prompt-suggestions-panel.tsx` — se quitó el label
  `compliance_limits`.
- `src/components/ia/helpers.ts` — se quitó el color de categoría `compliance`.

**Menú / navegación**
- `src/components/layout/app-sidebar.tsx` — sin ítem Compliance.
- `src/lib/constants.ts` — sin ítem en `NAV_ITEMS`; se quitaron
  `COMPLIANCE_ACTION_LABELS/COLORS` y el import del tipo.

**UI / copy**
- `src/components/commercial/ai-result.tsx` — sin badges de Compliance/riesgo, sin
  motivos ni "versión sugerida (compliance)", sin bloqueo por compliance.
- `src/app/app/campanas/[id]/campaign-ai.tsx` — sin lógica `blocked` por compliance.
- `src/app/app/admin/system/{page,system-view}.tsx` — sin sección "Últimas
  revisiones compliance" ni su query.
- `src/app/app/copiloto/copiloto-view.tsx` — copy sin mención a compliance.
- `src/app/app/hoy/advisor-dashboard.tsx` — sin link "Revisar Compliance".
- `src/components/onboarding/getting-started-card.tsx` — sin paso Compliance.
- `src/app/app/demo/page.tsx` — sin paso Compliance (7 pasos).
- `src/components/ia/tab-dashboard.tsx` — copy neutralizada.
- `src/app/app/{contactos,empresas,oportunidades}/[id]/*` y
  `src/app/app/campanas/[id]/page.tsx` — sin quick action "Revisar mensaje".
- `src/components/leads/lead-detail-view.tsx` — sin `LeadComplianceMock`.
- `src/components/leads/lead-actions-panel.tsx` — sin acción "Revisar compliance".
- `src/app/app/empresas/company-form.tsx` — placeholder sin "compliance".
- `src/app/app/conocimiento/knowledge-view.tsx` — sin categoría "Compliance / reglas"
  y sin el rol `compliance` en permisos de gestión.
- `src/app/app/leads/[leadId]/page.tsx` — comentario actualizado.

**Tipos (legado, espejo de DB)**
- `src/types/database.ts` — `ComplianceAction`, `ComplianceRule`, `ComplianceReview`,
  `compliance_rules`, `compliance_reviews`, `compliance_action` y el rol
  `compliance` se conservan **sólo como espejo del schema remoto** y marcados como
  legado (sin uso en la app).

**Tests actualizados**
- `tests/unit/ai-fallback.test.ts`, `tests/e2e/{admin-system,sidebar-nav,
  non-technical-copy,contextual-help,first-impression,onboarding-flow,
  demo-guided-flow,smoke-routes,manual-system-walkthrough}.spec.ts`,
  `tests/e2e/helpers/{routes,selectors}.ts`.

---

## 5. Qué NO se reemplazó todavía

- No hay "Validación comercial" ni revisor de mensajes. El copiloto sigue con su
  disclaimer general ("revisá cada sugerencia antes de usarla; no reemplaza tu
  juicio profesional").
- La red de seguridad determinística anti-promesas (que antes vivía en Compliance)
  **ya no se ejecuta**. Los guardrails textuales de los prompts (`GLOBAL_GUARDRAILS`)
  se mantienen. Riesgo regulatorio marcado abajo.

---

## 6. Riesgos

- **Regulatorio:** sin la capa determinística anti-promesas, ningún mecanismo
  automático intercepta afirmaciones riesgosas en mensajes. Mitigación temporal:
  guardrails en prompts + disclaimers de revisión humana. Debe definirse la futura
  "Validación comercial".
- **DB desincronizada:** las tablas de compliance siguen en Supabase pero sin uso.
  Limpieza opcional en una fase de SQL posterior (no se hizo por restricción).
- **Rol `compliance`:** sigue existiendo como enum de DB; ya no habilita accesos en
  la app (se quitó de `knowledge-view`).

---

## 7. QA

- `npm run type-check` — PASS (tras limpiar cache `.next`).
- `npm run test:unit` — PASS (90/90).
- `npm run build` — PASS.
- Verificación `rg` en `src/tests/.env.example/package.json` — sin referencias
  activas a Compliance (sólo el espejo de tipos legado en `database.ts`, justificado).
