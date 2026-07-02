# Auditoría Motor IA PLIFE — FASE 12O-A

## Estado actual de la infraestructura IA

El proyecto ya tiene infraestructura IA funcional. No es un punto de partida en cero:
hay tablas, agentes, trazabilidad y compliance operando en producción (modo demo).

---

## Archivos relevantes detectados

### src/lib/ai/ — Capa de infraestructura

| Archivo | Responsabilidad |
|---|---|
| `provider.ts` | Abstracción del proveedor (OpenAI). Detecta si hay key, fallback limpio con `AINotConfiguredError`. |
| `prompts.ts` | Resolución de prompts. Consulta `ai_prompt_versions` en Supabase y cae al hardcode si no hay seed. |
| `compliance.ts` | Motor híbrido de compliance. Capa 1: determinística (regex + tabla). Capa 2: IA solo para riesgo "medio". IA nunca puede bajar riesgo determinístico. |
| `agents.ts` | Orquestador de agentes. Flujo: resolver prompt → chatComplete → compliance determinístico → logAIInteraction. |
| `trace.ts` | Trazabilidad. Persiste cada interacción IA en `ai_interactions`. |
| `embeddings.ts` | Embeddings + búsqueda semántica. Genera con OpenAI, busca con pgvector. Fallback a ilike si no hay key. |

### src/domains/ai/ — Dominio de aplicación

| Archivo | Responsabilidad |
|---|---|
| `types.ts` | Tipos compartidos: `AIResult`, `HelpType`, `CampaignAITask`. Separados de actions para evitar "use server" restriction. |
| `actions.ts` | Server actions: `runCopilot`, `analyzeCompanyB2B`, `runCampaignAI`, `checkCompliance`, `saveAIAsActivity`, `getAIStatus`. |

### Agentes existentes (hardcoded en prompts.ts)

| AgentName | Uso |
|---|---|
| `advisor_copilot` | Copiloto de asesor en `/app/copiloto` |
| `b2b_research` | Análisis B2B inline en `/app/empresas/[id]` |
| `compliance_agent` | Capa IA del motor compliance (solo para riesgo "medio") |
| `campaign_agent` | Material de campaña en `/app/campanas/[id]` |

### Componentes UI relacionados a IA

| Componente | Uso |
|---|---|
| `src/components/commercial/ai-assistant-dialog.tsx` | Dialog del asistente IA en detalle de contacto/empresa |
| `src/components/commercial/ai-result.tsx` | Render del resultado IA con compliance |
| `src/app/app/copiloto/copiloto-view.tsx` | Vista principal del copiloto |
| `src/app/app/empresas/[id]/company-ai.tsx` | Panel IA inline empresa |
| `src/app/app/campanas/[id]/campaign-ai.tsx` | Panel IA inline campaña |
| `src/app/app/compliance/compliance-view.tsx` | UI del revisor de mensajes |
| `src/app/app/conocimiento/knowledge-view.tsx` | Gestión de base de conocimiento |

---

## Tablas Supabase existentes relacionadas a IA

Confirmadas en `src/types/database.ts`:

### ai_interactions
Traza completa de cada llamada IA. Incluye:
- `agent_name`, `prompt_version_id`, `user_id`
- `input_context` (JSON), `full_prompt`, `response`
- `model_used`, `tokens_used`
- `risk_level`, `risk_flags`
- `documents_used`
- `contact_id`, `company_id`, `opportunity_id`, `campaign_id`
- `was_approved`, `was_modified`, `final_content`

### ai_prompt_versions
Versiones de prompts por agente. Estructura **plana** (no estructurada por campos):
- `agent_name`, `version`, `is_active`
- `system_prompt` (texto libre completo)
- `user_prompt_template` (con placeholders `{{key}}`)
- `model`, `temperature`, `max_tokens`
- `notes`

**Nota crítica:** Esta tabla tiene un diseño simple (prompt como texto libre).
El Motor IA PLIFE necesita una tabla nueva `ai_prompts` con campos estructurados.
No debe romper esta tabla existente — ambas coexisten.

### compliance_rules
Reglas determinísticas de compliance. Incluye:
- `name`, `description`, `pattern`
- `is_regex`, `risk_level`
- `suggested_alternative`, `is_active`

### compliance_reviews
Resultado de cada revisión de compliance. Incluye:
- `ai_interaction_id`, `content_reviewed`
- `risk_level`, `risk_reasons`, `action`
- `suggested_version`, `rules_triggered`
- `reviewed_by`, `reviewed_at`

### knowledge_documents + knowledge_chunks
Base de conocimiento con embeddings pgvector.

---

## Tablas NO existentes (nuevas para Motor IA)

Las siguientes tablas deben ser creadas en una fase posterior (12O-B):

- `ai_stages` — pipeline de etapas de análisis comercial
- `ai_categories` — taxonomía de categorías de prompts
- `ai_prompts` — prompts estructurados por campos (no texto libre)
- `ai_analysis_profiles` — perfiles que agrupan prompts
- `ai_profile_prompts` — relación N:M perfil ↔ prompt con orden
- `ai_prompt_suggestions` — sugerencias de mejora de prompts
- `ai_execution_runs` — ejecuciones completas de un perfil sobre una entidad
- `ai_execution_outputs` — salida individual por etapa/prompt dentro de un run

---

## Rutas existentes relacionadas

| Ruta | Estado |
|---|---|
| `/app/copiloto` | Activa. Copiloto conversacional del asesor. |
| `/app/conocimiento` | Activa. Gestión de documentos y base de conocimiento. |
| `/app/compliance` | Activa. Revisor de mensajes (determinístico + IA opcional). |
| `/app/empresas/[id]` | Activa. Panel B2B con IA inline. |
| `/app/campanas/[id]` | Activa. Panel de material IA por campaña. |
| `/app/ia` | **No existe.** Nueva ruta para el Motor IA. |
| `/app/ia/prompts` | **No existe.** |
| `/app/ia/perfiles` | **No existe.** |
| `/app/ia/ejecuciones` | **No existe.** |

---

## Componentes UI reutilizables detectados

| Componente | Uso potencial en Motor IA |
|---|---|
| `StatCard` | Dashboard IA: prompts validados, ejecuciones, calidad |
| `Badge` | Estado de prompt: validated / draft / archived |
| `Card` | Cards de prompts, categorías, perfiles |
| `Input`, `Select`, `Button` | Formulario del prompt builder estructurado |
| `empty-state.tsx` | Estado vacío en listas de prompts/ejecuciones |
| `create-success-panel.tsx` | Confirmación post-guardado de prompt |
| `activity-summary-card.tsx` | Referencia visual para cards de ejecuciones |
| `priority-badge.tsx` | Coloreado por categoría o estado |
| `simple-breadcrumb.tsx` | Navegación dentro de `/app/ia` |
| `app-sidebar.tsx` | Agregar entrada `/app/ia` al sidebar |

El sidebar usa un array de items con `href`, `label`, `icon` — agregar Motor IA es trivial.

---

## Cómo se maneja compliance actualmente

El motor compliance es híbrido y robusto:

1. **Capa determinística (siempre activa):** Evalúa el mensaje contra `compliance_rules` de Supabase + 17 reglas built-in. Sin IA. Sin internet. Funciona siempre.
2. **Capa IA (opcional):** Solo si `OPENAI_API_KEY` está configurada Y el riesgo determinístico es `medio`. La IA puede subir el nivel de riesgo, nunca bajarlo.
3. **Persistencia:** Cada revisión queda en `compliance_reviews`.
4. **Fallo IA silencioso:** Si la llamada IA falla, el resultado determinístico prevalece sin errores visibles.

El Motor IA PLIFE debe respetar esta arquitectura y no interferir con ella.

---

## Fallback determinístico sin OpenAI

Sí existe y está bien implementado:
- `isAIConfigured()` en `provider.ts` detecta key ausente, vacía o placeholder
- Todos los agentes lanzan `AINotConfiguredError` si no hay key
- La UI renderiza estado "IA no configurada" sin crash
- Embeddings se almacenan sin vector si no hay key (chunking funciona igual)
- Compliance funciona 100% sin IA

---

## Dónde viviría el nuevo módulo en la navegación

**Opción recomendada:** Entrada nueva en sidebar entre "Copiloto IA" y "Conocimiento":
```
/app/ia  →  "Motor IA"  →  ícono: Cpu o Wrench
```

Vista única tabulada (igual al patrón visual de referencia):
- Dashboard IA
- Configuración
- Prompts activos
- Categorías
- Perfiles de análisis
- Ejecuciones

Rol requerido: `admin` o `direccion` (igual que `/app/admin`). Los asesores no acceden al configurador. Solo ven el output del motor en sus pantallas habituales.

---

## Riesgos detectados

### Riesgo 1 — Confusión entre ai_prompt_versions y ai_prompts (ALTO)
La tabla `ai_prompt_versions` existe y la usa el copiloto activo. La nueva `ai_prompts` tiene estructura distinta (campos estructurados). Si se mezclan nombres o se toca `ai_prompt_versions`, el copiloto actual se rompe.

**Mitigación:** Mantener `ai_prompt_versions` intacta. El Motor IA usa tablas completamente nuevas. La migración del copiloto al nuevo motor es una fase posterior opcional.

### Riesgo 2 — Scope creep de la UI (MEDIO)
El Motor IA es un módulo admin complejo. Si se intenta hacer todo en una fase, la UI queda incompleta y confusa.

**Mitigación:** El plan de fases (12O-B a 12O-H) escala progresivamente. La primera UI visible es un read-only dashboard.

### Riesgo 3 — Mezcla de responsabilidades (MEDIO)
El copiloto en `/app/copiloto` ya hace "ejecuciones IA". El Motor IA también propone ejecuciones. Si no se delimita bien, quedan dos sistemas paralelos sin coordinación.

**Mitigación:** El Motor IA es el configurador y el orquestador. El copiloto es el punto de acceso del asesor. En el largo plazo, el copiloto consume el Motor IA. En el corto plazo, coexisten.

### Riesgo 4 — Migración Supabase sin staging (BAJO-MEDIO)
Las nuevas tablas requieren migración. Si no hay staging, se aplica directo a producción.

**Mitigación:** La FASE 12O-B incluye migración. No se aplica hasta que el schema esté validado en esta documentación.

### Riesgo 5 — Compliance scope (BAJO)
El Motor IA podría confundirse como reemplazo del revisor de mensajes existente.

**Mitigación:** El módulo Compliance en `/app/compliance` sigue independiente. El Motor IA tiene un stage "Compliance" que usa el mismo motor debajo, pero son UI separadas.

---

## Recomendación de integración

1. El Motor IA vive en `/app/ia` como módulo separado, accesible solo a admin/dirección.
2. Las tablas nuevas (ai_stages, ai_categories, ai_prompts, ai_analysis_profiles, ai_profile_prompts, ai_prompt_suggestions, ai_execution_runs, ai_execution_outputs) se crean sin tocar las existentes.
3. La lógica de ejecución del Motor IA llamará a `chatComplete` y `logAIInteraction` de la infraestructura existente. No duplica la capa de provider.
4. El copiloto (`/app/copiloto`) sigue igual hasta que se decida migrarlo al nuevo motor.
5. El compliance engine (`src/lib/ai/compliance.ts`) no se toca. El Motor IA puede invocar `runDeterministicCompliance` desde el stage de compliance.
