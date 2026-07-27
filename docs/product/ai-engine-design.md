# Diseño Motor IA PLIFE — FASE 12O-A

> **Histórico (FASE 15B):** OpenAI fue removido del proyecto. Las menciones a OpenAI / GPT / `OPENAI_API_KEY` son registro histórico; los motores operan en modo determinístico interno.

## Identidad del módulo

**Nombre:** Motor IA PLIFE  
**Slug de navegación:** `/app/ia`  
**Descripción:** Motor de asistencia comercial y control de prompts  
**Audiencia:** Administradores y Dirección  
**Rol mínimo:** `admin` o `direccion`

Este módulo NO es "IA que decide por el asesor". Es el panel de configuración, ejecución y trazabilidad del sistema de asistencia comercial basado en prompts controlados.

---

## Propósito

El Motor IA PLIFE permite:

- Configurar prompts estructurados por etapa comercial
- Organizar prompts en categorías y perfiles de análisis
- Ejecutar análisis sobre empresas, contactos y oportunidades
- Preparar mensajes comerciales con revisión de compliance
- Generar diagnósticos comerciales y sugerencias de próximos pasos
- Ayudar a dirección a leer el estado del pipeline
- Controlar calidad: prompts validados vs. borradores vs. archivados
- Mantener trazabilidad completa de ejecuciones y outputs

### Lo que el Motor IA PLIFE NO puede hacer

- Calcular primas o montos de cobertura
- Inventar condiciones de pólizas MAPFRE
- Definir elegibilidad médica
- Prometer aprobación o cobertura
- Crear recomendaciones legales o médicas
- Enviar mensajes automáticamente sin revisión humana
- Reemplazar al asesor en la toma de decisiones comerciales
- Acceder a datos externos (scraping, APIs de terceros)
- Generar coberturas, rescates o exclusiones

---

## Arquitectura de rutas

### Opción A — Vista tabulada única (recomendada)

```
/app/ia
  → tab: Dashboard IA
  → tab: Configuración
  → tab: Prompts activos
  → tab: Categorías
  → tab: Perfiles de análisis
  → tab: Ejecuciones
```

Ventaja: toda la gestión del motor en una pantalla. Patrón visual equivalente a la referencia. Más fácil de mantener y testear.

### Opción B — Rutas separadas

```
/app/ia              → Dashboard IA
/app/ia/prompts      → Gestión de prompts
/app/ia/perfiles     → Perfiles de análisis
/app/ia/ejecuciones  → Historial de ejecuciones
```

Ventaja: rutas directas, más navegable en el futuro.

**Decisión: Opción A para la primera versión.** Se puede migrar a Opción B sin cambios de schema.

---

## Referencia visual objetivo

La UI del módulo Motor IA PLIFE debe replicar la composición visual de las capturas de referencia, adaptada a la marca PLIFE.

### Layout general

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar oscuro (existente PLIFE)                           │
│  + entrada "Motor IA" con ícono Cpu                         │
├─────────────────────────────────────────────────────────────┤
│  Header superior simple (existente app-header)              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Card principal grande                              │    │
│  │  Título: "Motor IA PLIFE"                           │    │
│  │  Descripción: "Motor de asistencia comercial..."    │    │
│  │  Selector de perfil activo                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  [Dashboard IA] [Configuración] [Prompts] [Categorías]      │
│  [Perfiles] [Ejecuciones]   ← tabs tipo pills               │
│                                                             │
│  Contenido del tab activo                                   │
└─────────────────────────────────────────────────────────────┘
```

### Composición por tab

**Tab: Dashboard IA**
- Fila de StatCards: Perfil activo | Prompts validados | Última ejecución | Estado del sistema
- Sección "Control de perfil": perfil activo seleccionable, orden de ejecución, prompts habilitados
- Sección "Prompts por categoría": distribución visual
- Sección "Ejecuciones recientes": tabla compacta (entidad, tipo, fecha, estado)
- Sección "Insights del motor": alertas (seguimientos vencidos, oportunidades sin próximo paso, mensajes revisados)
- Sección "Calidad": prompts validados vs. borrador vs. con mejoras pendientes

**Tab: Configuración**
- Perfil activo seleccionado en cabecera
- Lista ordenable de prompts del perfil, cada uno como fila coloreada por categoría
- Columnas: orden drag, nombre, categoría, estado, botón Editar
- Botón "Nuevo prompt"
- Texto guía: "Arrastrá con el ícono para cambiar el orden de ejecución"
- Sección separada "Resto del catálogo" (prompts no incluidos en el perfil)

**Tab: Prompts activos**
- Selector de perfil activo
- Toggle: agrupar por categoría / lista plana
- Filtro por estado (validado / borrador / archivado)
- Cards agrupadas por categoría, cada una con:
  - Nombre del prompt
  - Categoría (badge coloreado)
  - Etapa
  - Última actualización
  - Badge de estado: ok / error / draft
  - Botones: Editar | Duplicar | Ver sugerencias | Desactivar
- Editor inline al tocar "Editar" (panel que se expande debajo de la card)

**Tab: Categorías**
- Lista de categorías como filas o cards coloreadas
- Cada fila: nombre, descripción, cantidad de prompts, botón Editar
- Botón "Nueva categoría"

**Tab: Perfiles de análisis**
- Lista de perfiles (badge "Activo" en el perfil seleccionado)
- Botón "Nuevo perfil"
- Panel de configuración del perfil seleccionado:
  - Nombre, Tipo de cliente objetivo, Industrias, Descripción, Instrucciones base
  - Toggle: Perfil activo
  - Lista de prompts asociados con: checkbox enabled_by_default, orden de ejecución, color por categoría
  - Botón "Guardar configuración del perfil"

**Tab: Ejecuciones**
- Tabla de `ai_execution_runs`: entidad, tipo, perfil, estado, fecha, duración
- Expandible para ver outputs por etapa (`ai_execution_outputs`)
- Filtros: por entidad_tipo, estado, fecha

### Editor de prompt (inline)

Al presionar "Editar" en cualquier prompt, se expande un panel estructurado:

```
┌─ Editor: [Nombre del prompt] ────────────────────────┐
│  Nombre                                               │
│  Categoría         Etapa                             │
│  Descripción                                          │
│  ─────────────────────────────────────────────       │
│  Rol / Persona                                        │
│  Contexto / Entorno                                   │
│  Objetivo                                             │
│  Tarea específica                                     │
│  Restricciones / Limitaciones                         │
│  Formato de salida                                    │
│  Público objetivo                                     │
│  ─────────────────────────────────────────────       │
│  Proveedor   Modelo   Temperatura   Tokens máx        │
│  ─────────────────────────────────────────────       │
│  Vista previa del prompt final (readonly)             │
│  ─────────────────────────────────────────────       │
│  Sugerencias de mejora (si las hay)                   │
│  ─────────────────────────────────────────────       │
│  [Cancelar]              [Guardar prompt]             │
└────────────────────────────────────────────────────── ┘
```

**Regla:** El prompt se construye desde campos estructurados. No hay un textarea principal de texto libre.

### Estilo visual PLIFE

Mantener el design system actual de PLIFE:
- Fondo blanco / gris muy claro (`bg-gray-50`)
- Cards blancas con `rounded-xl border border-gray-100 shadow-sm` (igual a `StatCard`)
- Tabs como pills con fondo activo `bg-[#1B3A6B] text-white`
- Filas de prompts coloreadas por categoría (colores pastel, no saturados)
- Badges de estado: `Badge` con variantes `success` / `warning` / `secondary`
- Botones pequeños con variant `outline` para acciones secundarias
- Tipografía: igual al resto del sistema (Inter / sistema)
- Mucho espacio respirable (`gap-6`, `p-6`)
- Sin iconografía decorativa excesiva

Colores de categoría sugeridos:
- Investigación: azul claro (`blue-50 / blue-700`)
- Diagnóstico: indigo (`indigo-50 / indigo-700`)
- Oportunidades: verde (`green-50 / green-700`)
- Mensajes: amarillo (`yellow-50 / yellow-700`)
- Compliance: rojo (`red-50 / red-700`)
- Dirección: púrpura (`purple-50 / purple-700`)
- Seguimiento: naranja (`orange-50 / orange-700`)

---

## Modelo de datos recomendado

### Tablas nuevas (requieren migración en FASE 12O-B)

#### ai_stages — Pipeline de etapas

```sql
CREATE TABLE ai_stages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text UNIQUE NOT NULL,
  label       text NOT NULL,
  description text,
  sort_order  integer NOT NULL DEFAULT 0,
  tone        text,                    -- orientación tonal: consultivo / analítico / preventivo
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
```

Etapas PLIFE iniciales (seed):

| key | label | descripción |
|---|---|---|
| investigacion | Investigación comercial | Recopila contexto previo al contacto |
| diagnostico_empresa | Diagnóstico de empresa | Analiza potencial B2B |
| perfil_contacto | Perfil del contacto | Caracteriza al decisor o influenciador |
| oportunidad | Oportunidad comercial | Evalúa la oportunidad actual |
| mensaje | Mensaje sugerido | Genera o mejora un mensaje comercial |
| compliance | Compliance | Revisa riesgos en el mensaje |
| proximo_paso | Próximo paso | Sugiere la acción más relevante |
| resumen_direccion | Resumen para dirección | Síntesis ejecutiva del estado comercial |

#### ai_categories — Taxonomía de prompts

```sql
CREATE TABLE ai_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text UNIQUE NOT NULL,
  label       text NOT NULL,
  description text,
  tone        text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
```

Categorías PLIFE iniciales (seed):

| key | label |
|---|---|
| investigacion | Investigación |
| diagnostico | Diagnóstico |
| oportunidades | Oportunidades |
| mensajes | Mensajes |
| compliance | Compliance |
| direccion | Dirección |
| seguimiento | Seguimiento |

#### ai_prompts — Prompts estructurados

```sql
CREATE TABLE ai_prompts (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 text NOT NULL,
  description          text,
  stage_id             uuid REFERENCES ai_stages(id),
  category_id          uuid REFERENCES ai_categories(id),
  -- Campos estructurados del prompt
  role_persona         text,          -- Quién es el asistente en este prompt
  context_environment  text,          -- Contexto en el que opera
  objective            text,          -- Qué debe lograr
  specific_task        text,          -- Tarea concreta a ejecutar
  constraints          text,          -- Restricciones y límites explícitos
  output_format        text,          -- Formato de salida esperado
  target_audience      text,          -- A quién va dirigido el output
  -- Configuración del proveedor
  provider             text NOT NULL DEFAULT 'openai',
  model                text NOT NULL DEFAULT 'gpt-4o-mini',
  temperature          numeric(3,2) NOT NULL DEFAULT 0.5,
  max_tokens           integer NOT NULL DEFAULT 1200,
  -- Estado
  status               text NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft', 'validated', 'archived')),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid REFERENCES profiles(id)
);
```

**Nota:** `ai_prompts` coexiste con `ai_prompt_versions`. Son distintas:
- `ai_prompt_versions`: texto libre, usada por el copiloto actual. No tocar.
- `ai_prompts`: campos estructurados, usada por el Motor IA nuevo.

#### ai_analysis_profiles — Perfiles de análisis

```sql
CREATE TABLE ai_analysis_profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  description         text,
  target_client_type  text,          -- B2B / B2C / mixto / reclutamiento
  target_industries   text[],        -- Industrias objetivo
  base_instructions   text,          -- Instrucciones globales del perfil
  is_active           boolean NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  created_by          uuid REFERENCES profiles(id)
);
```

Solo un perfil puede tener `is_active = true` a la vez (enforced en aplicación, no en DB).

Perfil inicial (seed): **Comercial PLIFE**

#### ai_profile_prompts — Prompts dentro de un perfil (N:M)

```sql
CREATE TABLE ai_profile_prompts (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id         uuid NOT NULL REFERENCES ai_analysis_profiles(id) ON DELETE CASCADE,
  prompt_id          uuid NOT NULL REFERENCES ai_prompts(id) ON DELETE CASCADE,
  execution_order    integer NOT NULL DEFAULT 0,
  enabled_by_default boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, prompt_id)
);
```

#### ai_prompt_suggestions — Sugerencias de mejora

```sql
CREATE TABLE ai_prompt_suggestions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id         uuid NOT NULL REFERENCES ai_prompts(id) ON DELETE CASCADE,
  suggestion_type   text NOT NULL,   -- estructura / contenido / restriccion / formato
  reason            text,
  suggested_content text,
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'applied', 'dismissed')),
  created_at        timestamptz NOT NULL DEFAULT now()
);
```

#### ai_execution_runs — Ejecuciones completas

```sql
CREATE TABLE ai_execution_runs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type   text NOT NULL CHECK (entity_type IN ('company', 'contact', 'opportunity', 'campaign')),
  entity_id     uuid NOT NULL,
  profile_id    uuid REFERENCES ai_analysis_profiles(id),
  status        text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'running', 'completed', 'failed', 'partial')),
  started_at    timestamptz,
  finished_at   timestamptz,
  error_message text,
  created_by    uuid REFERENCES profiles(id),
  created_at    timestamptz NOT NULL DEFAULT now()
);
```

#### ai_execution_outputs — Output por etapa/prompt

```sql
CREATE TABLE ai_execution_outputs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id          uuid NOT NULL REFERENCES ai_execution_runs(id) ON DELETE CASCADE,
  stage_id        uuid REFERENCES ai_stages(id),
  prompt_id       uuid REFERENCES ai_prompts(id),
  execution_order integer NOT NULL DEFAULT 0,
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  output          text,
  error_message   text,
  tokens_input    integer,
  tokens_output   integer,
  cost_estimate   numeric(10,6),     -- USD estimado según modelo
  duration_ms     integer,
  created_at      timestamptz NOT NULL DEFAULT now()
);
```

---

## Separación de responsabilidades

### Configuración (admin only)
- Gestionar `ai_categories`, `ai_stages`
- Crear / editar `ai_prompts` con campos estructurados
- Validar prompts (draft → validated)
- Crear / editar `ai_analysis_profiles`
- Asignar prompts a perfiles (`ai_profile_prompts`)
- Revisar `ai_prompt_suggestions`

### Ejecución (admin / dirección)
- Seleccionar perfil activo
- Ejecutar análisis sobre una entidad (empresa / contacto / oportunidad)
- Ver outputs por etapa
- Tolerar fallos parciales (un stage fallido no cancela el resto)
- Aprobar / modificar output antes de usarlo

### Reportes (admin / dirección)
- Ver historial de `ai_execution_runs`
- Ver outputs detallados por run
- Ver métricas de tokens / costo / duración
- Ver distribución de prompts por categoría

### Compliance (integrado, no reemplazado)
- El stage "Compliance" del Motor IA invoca `runDeterministicCompliance` del motor existente
- Los resultados se persisten en `compliance_reviews` como siempre
- El Motor IA no crea un segundo motor de compliance

---

## Entidades soportadas

| entity_type | Fuente de datos | Agente relacionado |
|---|---|---|
| `company` | tabla `companies` | `b2b_research` (actual) → Motor IA (futuro) |
| `contact` | tabla `contacts` | `advisor_copilot` (actual) → Motor IA (futuro) |
| `opportunity` | tabla `opportunities` | `advisor_copilot` (actual) → Motor IA (futuro) |
| `campaign` | tabla `campaigns` | `campaign_agent` (actual) → Motor IA (futuro) |

---

## Flujo de ejecución (diseño)

```
Usuario selecciona entidad + perfil
         ↓
Se crea ai_execution_runs (status: pending)
         ↓
Para cada ai_profile_prompts (ordenado, enabled_by_default):
  1. Se crea ai_execution_outputs (status: pending)
  2. Se construye el prompt desde campos estructurados
  3. Se agrega contexto de la entidad
  4. Se agrega base de conocimiento si disponible
  5. chatComplete() → output
  6. runDeterministicCompliance() → si es stage compliance
  7. logAIInteraction() → ai_interactions (trazabilidad existente)
  8. Se actualiza ai_execution_outputs (completed / failed)
  9. Si falla: continuar con el siguiente prompt (tolerancia a fallos parciales)
         ↓
Se actualiza ai_execution_runs (completed / partial si hubo fallos)
         ↓
Usuario ve outputs organizados por etapa
Usuario puede aprobar / modificar / descartar cada output
```

---

## Protección de compliance y límites

### Lo que el Motor IA PLIFE puede hacer

- Asistir al asesor con información estructurada
- Sugerir mensajes para revisión humana
- Analizar potencial comercial basado en datos ingresados
- Detectar riesgos en mensajes antes de enviarlos
- Ordenar próximos pasos
- Generar resúmenes para dirección

### Lo que debe quedar explícito en los prompts

Todos los prompts del Motor IA heredan las guardrails globales de `GLOBAL_GUARDRAILS` (ya definidas en `src/lib/ai/prompts.ts`):

- No cotizar primas ni montos
- No prometer aprobación o cobertura
- No inventar condiciones de pólizas
- No reemplazar al asesor
- No usar frases garantistas
- Aclarar cuando falta información validada
- Tono: profesional, consultivo, español rioplatense (Uruguay)

### Control de quality gate

Solo prompts con `status = 'validated'` pueden ejecutarse en producción.
Los prompts en `draft` pueden ejecutarse en modo preview desde el editor.
Los prompts `archived` no se ejecutan ni aparecen en perfiles activos.

---

## Tablas que pueden esperar para fases posteriores

| Tabla | Puede esperar hasta |
|---|---|
| `ai_prompt_suggestions` | FASE 12O-D (prompt builder y validación) |
| `ai_execution_runs` | FASE 12O-E (ejecución mock/fallback) |
| `ai_execution_outputs` | FASE 12O-E (ejecución mock/fallback) |
| `ai_stages` | FASE 12O-B (seed mínimo) |
| `ai_categories` | FASE 12O-B (seed mínimo) |
| `ai_prompts` | FASE 12O-B (schema y seed) |
| `ai_analysis_profiles` | FASE 12O-B (schema y seed) |
| `ai_profile_prompts` | FASE 12O-B (schema y seed) |

---

## Integración con infraestructura existente

| Módulo existente | Integración |
|---|---|
| `src/lib/ai/provider.ts` | Motor IA usa `chatComplete` directamente. Sin duplicar. |
| `src/lib/ai/trace.ts` | Motor IA llama a `logAIInteraction` por cada output. |
| `src/lib/ai/compliance.ts` | Motor IA invoca `runDeterministicCompliance` en el stage compliance. |
| `src/lib/ai/embeddings.ts` | Motor IA puede usar `searchKnowledgeSemantic` para grounding. |
| `ai_interactions` | Motor IA sigue usando esta tabla para trazabilidad individual. |
| `ai_prompt_versions` | Sin tocar. El copiloto actual sigue usándola. |
| `compliance_rules` | Sin tocar. Motor IA lee la misma tabla. |
