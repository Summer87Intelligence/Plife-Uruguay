# Plan de Implementación Motor IA PLIFE — FASE 12O-B a 12O-H

## Contexto

- Rama: `feat/plife-ai-engine`
- Base: commit con FASE 12O-A (diseño y auditoría)
- Todas las fases anteriores (12D a 12N) están en `main`
- Esta rama crece desde `main` con commits incrementales
- Push solo cuando sea explícitamente solicitado

---

## Principio general

Cada fase entrega algo visible y funcional en modo fallback (sin OpenAI real).
La primera versión ejecutable del Motor IA PLIFE no requiere API key.
OpenAI se integra en FASE 12O-F, no antes.

---

## FASE 12O-B — Schema y seed mínimo

**Objetivo:** Crear las tablas nuevas en Supabase y cargar datos iniciales.
El sistema debe poder leer prompts y perfiles desde la base de datos.

**Archivos probables:**
- `supabase/ai-engine-schema.sql` — CREATE TABLE para las 8 tablas nuevas
- `supabase/ai-engine-seed.sql` — seed: etapas, categorías, perfil "Comercial PLIFE", prompts iniciales
- `src/types/database.ts` — extender con los nuevos tipos: `AIStage`, `AICategory`, `AIPrompt`, `AIAnalysisProfile`, `AIProfilePrompt`, `AIPromptSuggestion`, `AIExecutionRun`, `AIExecutionOutput`

**Riesgo:** Bajo. Las tablas son nuevas, no tocan nada existente.

**QA necesario:**
- Verificar que las 8 tablas existen en Supabase Dashboard
- Verificar que el seed cargó: 8 stages, 7 categories, 1 perfil activo
- Verificar que `src/types/database.ts` compila sin errores (`npm run type-check`)

**Requiere migración Supabase:** SÍ — aplicar `ai-engine-schema.sql`  
**Requiere variables de entorno:** NO  
**Toca UI:** NO  
**Toca API:** NO  
**Toca tests:** NO  
**Puede hacerse sin OpenAI:** SÍ

---

## FASE 12O-C — UI admin de prompts, categorías y perfiles

**Objetivo:** Primera UI visible del Motor IA. Read-only + gestión básica desde el panel admin.
Tab "Dashboard IA" con métricas estáticas. Tab "Categorías" y tab "Perfiles de análisis" con datos reales.

**Archivos probables:**
- `src/app/app/ia/page.tsx` — página principal del Motor IA
- `src/app/app/ia/ia-view.tsx` — componente raíz con tabs
- `src/app/app/ia/tabs/dashboard-tab.tsx` — tab Dashboard IA (lectura de BD)
- `src/app/app/ia/tabs/categories-tab.tsx` — tab Categorías (CRUD básico)
- `src/app/app/ia/tabs/profiles-tab.tsx` — tab Perfiles de análisis (CRUD básico)
- `src/domains/ia-engine/actions.ts` — server actions: listar etapas, categorías, perfiles, prompts
- `src/components/layout/app-sidebar.tsx` — agregar entrada `/app/ia` con ícono `Cpu`

**Composición visual obligatoria:**
- Card principal grande con "Motor IA PLIFE" y selector de perfil activo
- Tabs tipo pills horizontales
- StatCards en Dashboard: prompts validados, ejecuciones del mes, estado del sistema, perfil activo
- Filas de categorías coloreadas con badge de cantidad de prompts
- Panel de configuración de perfil con instrucciones base

**Riesgo:** Medio. Agrega ruta nueva y modifica sidebar. No toca lógica existente.

**QA necesario:**
- `npm run type-check` PASS
- `npm run build` PASS
- `/app/ia` carga sin error
- Dashboard muestra métricas reales de BD
- Sidebar muestra "Motor IA" solo para admin/dirección

**Requiere migración Supabase:** NO (usa tablas de 12O-B)  
**Requiere variables de entorno:** NO  
**Toca UI:** SÍ  
**Toca API:** NO (solo server actions de lectura)  
**Toca tests:** Agregar smoke test para `/app/ia`  
**Puede hacerse sin OpenAI:** SÍ

---

## FASE 12O-D — Prompt builder estructurado y validación local

**Objetivo:** Tab "Prompts activos" completo con editor inline estructurado.
El editor construye el prompt desde campos, no desde texto libre.
Validación local: no puede guardar sin nombre, categoría, etapa y tarea específica.
Vista previa del prompt final generada dinámicamente desde los campos.
Tab "Configuración": lista ordenable de prompts del perfil.

**Archivos probables:**
- `src/app/app/ia/tabs/prompts-tab.tsx` — tab Prompts activos
- `src/app/app/ia/tabs/config-tab.tsx` — tab Configuración (orden de prompts)
- `src/app/app/ia/components/prompt-editor.tsx` — editor inline con campos estructurados
- `src/app/app/ia/components/prompt-card.tsx` — card de prompt con badges y acciones
- `src/app/app/ia/components/prompt-preview.tsx` — vista previa del prompt final (readonly)
- `src/domains/ia-engine/actions.ts` — extender con: crear prompt, editar prompt, cambiar estado

**Campos del editor:**
1. Nombre
2. Categoría (select desde ai_categories)
3. Etapa (select desde ai_stages)
4. Descripción
5. Rol / Persona
6. Contexto / Entorno
7. Objetivo
8. Tarea específica
9. Restricciones / Limitaciones
10. Formato de salida
11. Público objetivo
12. Proveedor / Modelo / Temperatura / Tokens máx
13. Vista previa del prompt final (generada, readonly)
14. Sugerencias (si hay registros en ai_prompt_suggestions)

**Vista previa:** Se construye concatenando los campos en orden estructurado, sin edición directa del texto resultado.

**Riesgo:** Medio. El editor es el componente más complejo de la fase. Priorizar validación de campos requeridos antes de permitir `status = validated`.

**QA necesario:**
- Crear prompt con campos mínimos → debe guardar en estado `draft`
- Intentar validar prompt vacío → debe mostrar errores
- Vista previa se actualiza al editar campos
- Cambiar orden de prompts en tab Configuración → debe persistir

**Requiere migración Supabase:** NO  
**Requiere variables de entorno:** NO  
**Toca UI:** SÍ (componentes nuevos)  
**Toca API:** NO (server actions nuevas, sin llamada IA)  
**Toca tests:** Agregar test de validación de formulario  
**Puede hacerse sin OpenAI:** SÍ

---

## FASE 12O-E — Ejecución mock/fallback sin OpenAI

**Objetivo:** Tab "Ejecuciones" funcional. El Motor IA puede ejecutar un perfil sobre una entidad
en modo fallback: recorre los stages, construye los prompts, pero devuelve outputs simulados
(sin llamar a OpenAI). Esto permite testear el flujo completo y la UI de resultados sin API key.

**Archivos probables:**
- `src/app/app/ia/tabs/executions-tab.tsx` — tab Ejecuciones con historial
- `src/app/app/ia/components/run-detail.tsx` — expansión de un run con outputs por etapa
- `src/domains/ia-engine/engine.ts` — orquestador de ejecución:
  - `createExecutionRun()` — crea ai_execution_runs
  - `executeRun()` — itera ai_profile_prompts, crea ai_execution_outputs
  - `buildPromptFromFields()` — construye el prompt completo desde campos estructurados
  - En fallback: `output = "[Mock] Prompt ejecutado en modo fallback. Configurá OPENAI_API_KEY para resultado real."`
- `src/domains/ia-engine/actions.ts` — server action: `triggerExecution(entityType, entityId, profileId)`
- Botón "Ejecutar análisis IA" en `/app/empresas/[id]`, `/app/contactos/[id]`, `/app/oportunidades/[id]`

**Flujo mock:**
1. Usuario presiona "Ejecutar análisis IA" en una empresa
2. Se crea `ai_execution_runs` (status: running)
3. Por cada prompt habilitado del perfil activo:
   - Se crea `ai_execution_outputs` (status: pending)
   - Se construye el prompt desde campos
   - Si OPENAI_API_KEY: llama a `chatComplete()` (esto es FASE 12O-F)
   - Si no: devuelve output mock con aviso
   - Se actualiza `ai_execution_outputs` (status: completed/failed)
4. Se actualiza `ai_execution_runs` (status: completed/partial)
5. UI muestra resultado por etapa

**Riesgo:** Medio-Alto. El orquestador es el núcleo del sistema. Si está mal diseñado, rompe las fases siguientes.

**QA necesario:**
- Ejecutar análisis sobre empresa demo → debe crear run en BD
- Modo fallback → outputs mock visibles por etapa
- Un stage con error (simulado) no cancela los demás
- Tab Ejecuciones muestra historial real

**Requiere migración Supabase:** NO (usa tablas de 12O-B)  
**Requiere variables de entorno:** NO  
**Toca UI:** SÍ  
**Toca API:** SÍ (nuevo endpoint o server action de ejecución)  
**Toca tests:** Test de flujo de ejecución mock  
**Puede hacerse sin OpenAI:** SÍ — diseñado específicamente para esto

---

## FASE 12O-F — Integración real con OpenAI

**Objetivo:** Reemplazar el mock por llamada real a OpenAI en `executeRun()`.
Persistir `tokens_input`, `tokens_output`, `cost_estimate`, `duration_ms` en `ai_execution_outputs`.
Registrar `ai_interactions` por cada output (trazabilidad existente).
Activar stage de compliance: ejecutar `runDeterministicCompliance()` sobre outputs de mensajes.

**Archivos probables:**
- `src/domains/ia-engine/engine.ts` — reemplazar bloque mock por `chatComplete()`
- `src/lib/ai/trace.ts` — ya existe, solo invocar `logAIInteraction()` desde engine
- `src/lib/ai/compliance.ts` — ya existe, invocar `runDeterministicCompliance()` si stage es compliance

**Lógica de costo estimado:**
- `gpt-4o-mini`: $0.00015 / 1K tokens input, $0.00060 / 1K tokens output (aproximado, junio 2026)
- Guardar como estimado, no como facturado real

**Riesgo:** Bajo si FASE 12O-E está bien hecha. Solo reemplaza el bloque mock.

**QA necesario:**
- Ejecutar análisis con OPENAI_API_KEY configurada → output real visible
- Verificar `ai_interactions` registrada por cada output
- Verificar tokens y costo en `ai_execution_outputs`
- Verificar que stage compliance ejecuta `runDeterministicCompliance()`

**Requiere migración Supabase:** NO  
**Requiere variables de entorno:** SÍ — OPENAI_API_KEY real  
**Toca UI:** Mínimo (mostrar tokens/costo en run detail)  
**Toca API:** SÍ (engine.ts)  
**Toca tests:** Actualizar test de ejecución (mock → real con env de test)  
**Puede hacerse sin OpenAI:** NO — esta fase requiere key

---

## FASE 12O-G — Reporte por empresa/oportunidad

**Objetivo:** El output del Motor IA es accesible desde las entidades comerciales.
En `/app/empresas/[id]` aparece el último análisis IA disponible.
En `/app/oportunidades/[id]` aparece el último análisis IA disponible.
Los outputs se pueden aprobar o guardar como actividad.

**Archivos probables:**
- `src/app/app/empresas/[id]/company-ai-engine.tsx` — nuevo panel de output del Motor IA (junto o reemplazando `company-ai.tsx`)
- `src/app/app/oportunidades/[id]/opportunity-ai-engine.tsx` — panel de output en oportunidad
- `src/domains/ia-engine/actions.ts` — `getLastRunForEntity(entityType, entityId)`
- `src/domains/ia-engine/actions.ts` — `approveOutput(outputId)`, `saveOutputAsActivity(outputId)`

**UI del reporte:**
- Tarjeta "Último análisis IA" con fecha y perfil usado
- Outputs colapsables por etapa (etiqueta de stage + badge de estado)
- Botón "Aprobar y guardar como actividad"
- Botón "Ver historial de ejecuciones" → link a `/app/ia` tab Ejecuciones
- Si no hay run: estado vacío con botón "Ejecutar análisis IA"

**Riesgo:** Bajo. Solo lectura de datos ya persistidos.

**QA necesario:**
- Empresa con run completado → panel muestra outputs
- Empresa sin run → estado vacío con CTA
- "Guardar como actividad" → actividad creada en BD
- Historial link navega correctamente a `/app/ia`

**Requiere migración Supabase:** NO  
**Requiere variables de entorno:** NO (lectura)  
**Toca UI:** SÍ (paneles en empresa/oportunidad)  
**Toca API:** NO (solo server actions de lectura)  
**Toca tests:** E2E: ejecutar análisis y verificar que aparece en la entidad  
**Puede hacerse sin OpenAI:** SÍ (muestra outputs mock de FASE 12O-E)

---

## FASE 12O-H — Tests y QA final

**Objetivo:** Suite de tests completa para el Motor IA. Validación integral de todo el módulo antes de mergear a `main`.

**Archivos probables:**
- `tests/unit/ai-engine/build-prompt.test.ts` — unit test de `buildPromptFromFields()` con casos borde
- `tests/unit/ai-engine/execution-flow.test.ts` — unit test del orquestador (mocked provider)
- `tests/e2e/ai-engine.spec.ts` — E2E: login admin → `/app/ia` carga, crear prompt, ejecutar análisis mock
- Actualizar `tests/e2e/manual-system-walkthrough.spec.ts` si corresponde

**QA checklist:**
- [ ] `npm run type-check` PASS
- [ ] `npm run build` PASS (sin nuevas rutas rotas)
- [ ] `npm run test:unit` PASS (incluye nuevos unit tests)
- [ ] `npm run test:e2e` PASS (incluye smoke `/app/ia`)
- [ ] `/app/ia` no accesible sin login
- [ ] `/app/ia` no accesible para rol `asesor`
- [ ] Crear prompt draft → visible en tab Prompts activos
- [ ] Validar prompt → badge cambia a "Validado"
- [ ] Ejecutar análisis mock → outputs por etapa visibles
- [ ] Output visible en empresa/oportunidad
- [ ] No hay secrets en diff
- [ ] No hay `.env` en commits

**Requiere migración Supabase:** NO  
**Requiere variables de entorno:** NO (tests en fallback)  
**Toca UI:** NO (solo tests)  
**Toca API:** NO  
**Toca tests:** SÍ — es la fase de tests  
**Puede hacerse sin OpenAI:** SÍ

---

## Resumen de fases

| Fase | Entregable visible | OpenAI requerido | Migración Supabase |
|---|---|---|---|
| 12O-A | Documentación de diseño | NO | NO |
| 12O-B | 8 tablas nuevas + seed en BD | NO | SÍ |
| 12O-C | UI `/app/ia` con Dashboard, Categorías, Perfiles | NO | NO |
| 12O-D | Editor de prompts estructurado | NO | NO |
| 12O-E | Ejecución mock completa, tab Ejecuciones | NO | NO |
| 12O-F | Ejecución real con OpenAI + tokens/costo | SÍ | NO |
| 12O-G | Reporte en empresa/oportunidad | NO | NO |
| 12O-H | Tests completos y QA integral | NO | NO |

---

## Orden de commits sugerido por fase

Cada fase debe terminar con:
```
npm run type-check → PASS
npm run build → PASS
git add [archivos de la fase]
git commit -m "feat(ai-engine): <descripción de la fase>"
```

Nunca commitear `.env`, `.claude/settings.local.json` ni archivos temporales.

---

## Decisiones técnicas clave

### ¿Por qué campos estructurados y no texto libre?

El prompt como texto libre tiene tres problemas críticos:
1. El asesor no sabe qué parte editar para cambiar el tono
2. No se puede hacer análisis de calidad automático
3. No se pueden generar sugerencias específicas de mejora

Con campos estructurados, el Motor IA puede:
- Detectar si falta "Restricciones" y sugerirlo
- Mostrar que un prompt sin "Formato de salida" es menos predecible
- Comparar prompts del mismo tipo
- Generar la vista previa correctamente

### ¿Por qué mantener ai_prompt_versions intacta?

El copiloto actual (`/app/copiloto`) funciona en producción.
Cambiar su tabla de prompts mientras el Motor IA está en construcción sería un riesgo innecesario.
En el largo plazo, el copiloto puede migrar a consumir `ai_prompts` del Motor IA.
Pero esa migración es una decisión futura, no un requisito de estas fases.

### ¿Por qué modo fallback antes que OpenAI?

Permite testear todo el flujo UI → BD → ejecución → output sin depender de una API key real.
Los tests de CI no necesitan key.
El demo funciona sin costo de tokens.
La integración real (FASE 12O-F) es un swap de una sola función.
