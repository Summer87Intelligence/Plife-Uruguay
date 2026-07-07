# FASE 15H — Auditoría de valor de secciones visibles

**Fecha:** 2026-07-07
**Rama:** `feat/lead-first-crm`
**Alcance:** solo auditoría, diseño y documentación. Sin código, sin SQL, sin Supabase remoto, sin Vercel, sin push.
**Base:** menú simplificado en FASE 15G (`src/components/layout/app-sidebar.tsx`).

---

## 1. Resumen ejecutivo

El menú quedó reducido a 8 secciones tras 15G. La auditoría del código, rutas y copy
confirma que **las 8 secciones se justifican y ninguna debe eliminarse del menú**,
pero **ninguna está terminada**: 5 necesitan simplificación o realineación al modelo
Lead-first y 3 arrastran contenido del modelo anterior (oportunidades/contactos/
empresas) que hoy compite con el flujo nuevo.

Diagnóstico central: el producto tiene **dos sistemas nerviosos en paralelo** —
el viejo (contactos → oportunidades → seguimiento de oportunidades) y el nuevo
(lead → pipeline → propuesta). PLIFE Hoy y Dirección muestran ambos a la vez.
Es aceptable como transición (decisión explícita de 14K), pero la salida es que
las próximas fases muevan datos y métricas al eje Lead-first y el contenido del
modelo viejo se retire de las superficies visibles, no que convivan indefinidamente.

Decisiones de esta auditoría:

| Sección | Recomendación |
|---|---|
| PLIFE Hoy | Mantener + simplificar (retirar widgets de oportunidades cuando leads los cubran) |
| Leads | Mantener (núcleo del sistema) |
| Pipeline | Mantener + completar (mover etapa, señales de bloqueo) |
| Propuestas | Mantener (apuesta central) + persistencia antes de crecer en UI |
| Campañas | Mantener + realinear a leads (hoy mide empresas/oportunidades) |
| Motores | Simplificar (separar capa comercial de configuración técnica) |
| Dirección | Mantener + rediseñar Lead-first (hoy es 100 % modelo viejo) |
| Admin | Mantener + absorber configuración técnica de Motores |

Ninguna sección se oculta ni se elimina en esta fase. Las 8 ocultas de 15G
permanecen ocultas (ver §8).

---

## 2. Menú actual aprobado

Orden y visibilidad según `app-sidebar.tsx` (FASE 15G):

| # | Sección | Ruta | Visible para |
|---|---|---|---|
| 1 | PLIFE Hoy | `/app/hoy` | todos |
| 2 | Leads | `/app/leads` | todos |
| 3 | Pipeline | `/app/pipeline` | todos |
| 4 | Propuestas | `/app/propuestas` | todos |
| 5 | Campañas | `/app/campanas` | todos |
| 6 | Motores | `/app/ia` | admin + dirección |
| 7 | Dirección | `/app/direccion` | admin + dirección |
| 8 | Admin | `/app/admin` | admin |

Ocultas del sidebar pero con ruta viva (`HIDDEN_FROM_NAV`): Contactos, Empresas,
Oportunidades, Radar B2B, Copiloto, Conocimiento, Academia, Estado del sistema.

Nota de diseño detectada: Motores está gateado a admin/dirección
(`DIRECTION_ALLOWED`), pero el flujo comercial (crear propuesta con motores)
está disponible para todos vía Propuestas. La capa comercial de los motores ya
llega al asesor por el camino correcto; lo que queda restringido es la
configuración técnica. Esto refuerza la recomendación de §5.6.

---

## 3. Criterio de permanencia de secciones

Una sección se mantiene visible si cumple **al menos 2** de estas condiciones:

- **C1** — ayuda a captar leads
- **C2** — ayuda a priorizar leads
- **C3** — ayuda a avanzar un lead
- **C4** — ayuda a crear una propuesta
- **C5** — ayuda a organizar una acción comercial
- **C6** — ayuda a decidir foco ejecutivo
- **C7** — configura algo indispensable del sistema

Si cumple 0–1, se recomienda ocultar.

---

## 4. Matriz de valor por sección

Evaluación sobre lo que la sección hace **hoy** (código actual), con nota de lo
que sumaría en su estado ideal (§5). ✔ = cumple hoy · ◐ = parcial/conceptual · — = no cumple.

| Sección | C1 captar | C2 priorizar | C3 avanzar | C4 propuesta | C5 organizar | C6 foco ejec. | C7 config | Cumple | Veredicto |
|---|---|---|---|---|---|---|---|---|---|
| PLIFE Hoy | — | ✔ | ✔ | ◐ | ✔ | ◐ | — | 3–5 | **Queda** |
| Leads | ✔ | ✔ | ✔ | ◐ | — | — | — | 3–4 | **Queda** |
| Pipeline | — | ✔ | ◐ | — | — | ◐ | — | 1–3 | **Queda** (condicionado a mover etapa) |
| Propuestas | ◐ | — | ◐ | ✔ | ✔ | — | — | 2–4 | **Queda** |
| Campañas | ◐ | — | — | ◐ | ✔ | ◐ | — | 1–4 | **Queda** (condicionado a conectar leads) |
| Motores | — | — | ◐ | ✔ | ◐ | — | ◐ | 1–4 | **Queda** (simplificado) |
| Dirección | — | — | — | — | — | ✔ | — | 1 | **Queda condicionado**: hoy cumple solo C6 y sobre el modelo viejo; 15M lo lleva a C2+C6 |
| Admin | — | — | — | — | — | — | ✔ | 1+ | **Queda**: C7 es condición suficiente para la única sección de configuración, restringida a admin |

Lectura honesta de la matriz: Pipeline, Dirección y Campañas están hoy en el
borde del criterio. No se ocultan porque (a) son estructurales al modelo
Lead-first aprobado, y (b) las fases 15I–15N ya las llevan a cumplir ≥2
condiciones con datos reales. Si esas fases no se ejecutan, esta matriz obliga
a rediscutir su visibilidad.

---

## 5. Auditoría de cada sección

### 5.1 PLIFE Hoy — `/app/hoy`

- **Código:** `hoy/page.tsx`, `advisor-dashboard.tsx`, `direction-dashboard.tsx`, `lead-today-panel.tsx`, `follow-up-center`.
- **Propósito actual:** tablero diario con doble fuente: panel "Foco de leads" (leads reales dev, 14K) + stats/"Qué atender hoy"/FollowUpCenter sobre oportunidades, contactos y campañas (modelo viejo).
- **Propósito recomendado:** única pantalla de arranque del día: qué lead atiendo ahora, qué venció, qué está caliente, qué propuesta quedó pendiente.
- **Usuario principal:** asesor (variante dirección para admin/dirección).
- **Acciones principales:** navegar a lead/detalle, crear lead (CTA "Nuevo lead"), navegar a campañas/propuestas. No muta datos (correcto).
- **Datos que muestra:** buckets de leads (nuevos/vencidos/hoy/sin próximo paso/calientes/seguimiento) + tareas, seguimientos de contactos, oportunidades activas, empresas B2B, campañas activas.
- **Decisión que ayuda a tomar:** "¿a quién contacto primero hoy?"
- **Qué aporta valor:** el panel Lead-first con counts reales y listas accionables; el CTA de creación de lead.
- **Qué sobra:** duplicación de centros de seguimiento (leads vs. oportunidades); StatCards de "Oportunidades activas"/"Empresas B2B" que apuntan a secciones ocultas del menú; chips "Qué atender hoy" que linkean a `/app/contactos` y `/app/oportunidades` (rutas ocultas — navegación huérfana).
- **Qué falta:** propuestas pendientes (bloqueado por persistencia, 15J); próximas acciones consolidadas de leads.
- **Riesgo de relleno:** **alto mientras convivan los dos modelos** — dos bloques que dicen "esto venció" con fuentes distintas confunden.
- **Recomendación:** **Mantener + simplificar.** Cuando 15I–15J den datos reales de calificación y propuestas, retirar FollowUpCenter de oportunidades y los links a rutas ocultas.

### 5.2 Leads — `/app/leads`

- **Código:** `leads/page.tsx`, `leads/new`, `leads/[leadId]`, dominio `domains/leads` (validation, actions, queries, dashboard).
- **Propósito actual:** captura real (INSERT dev), lectura real, update operativo real (14J), resumen de follow-up, detalle con edición.
- **Propósito recomendado:** capturar → calificar → definir próximo paso → disparar propuesta.
- **Usuario principal:** asesor.
- **Acciones principales:** crear lead, editar campos operativos (etapa activa, prioridad, temperatura, próximo paso, fecha, notas), crear propuesta desde lead (link con contexto ya implementado en `lead-actions-panel`).
- **Datos que muestra:** lista con etapa/prioridad/temperatura/próximo paso; detalle completo.
- **Decisión que ayuda a tomar:** "¿este lead vale mi tiempo y cuál es el siguiente movimiento?"
- **Qué aporta valor:** es la única sección con ciclo capturar-editar completo y real; el link contextual a Propuestas es el puente correcto entre secciones.
- **Qué sobra:** en el detalle, `LeadTimelineMock` y `LeadAIAssistantMock` son decorativos; los botones mock del panel de acciones ("Marcar contactado", "Cambiar etapa", "Preparar mensaje", "Descartar") prometen sin entregar.
- **Qué falta:** calificación simple y score (15I); conversión/descarte reales (fases posteriores).
- **Riesgo de relleno:** medio — concentrado en los mocks del detalle.
- **Recomendación:** **Mantener.** Es el núcleo. En 15I, reemplazar mocks por calificación/score o quitarlos.

### 5.3 Pipeline — `/app/pipeline`

- **Código:** `pipeline/page.tsx`, `lead-pipeline-board.tsx`, `lead-card.tsx`.
- **Propósito actual:** tablero read-only de leads reales por etapa (8 columnas del orden canónico).
- **Propósito recomendado:** ver dónde se traba el flujo y mover leads de etapa (fase futura; hoy la etapa se cambia desde el detalle, 14J).
- **Usuario principal:** asesor y líder comercial.
- **Acciones principales:** solo navegación a detalle. Sin drag & drop (decisión vigente).
- **Datos que muestra:** leads agrupados por etapa con contador por columna.
- **Decisión que ayuda a tomar:** "¿dónde está estancado mi embudo?" — parcialmente, porque no hay señal de tiempo en etapa.
- **Qué aporta valor:** visual inmediato del embudo real.
- **Qué sobra:** nada estructural; es la sección más magra (bien).
- **Qué falta:** mover etapa desde el board (fase futura), señales de bloqueo (días en etapa, sin próximo paso resaltado en la card).
- **Riesgo de relleno:** bajo, pero **riesgo de redundancia** con Leads si nunca gana interacción propia: hoy es "la misma lista en columnas".
- **Recomendación:** **Mantener.** Prioridad: señales de bloqueo primero (lectura, barato), mover etapa después.

### 5.4 Propuestas — `/app/propuestas`

- **Código:** `propuestas/page.tsx`, `propuestas/nueva`, dominio `domains/proposals` (constants, proposal-flow, mock-generator, prefill).
- **Propósito actual:** flujo conceptual determinístico (sin OpenAI, sin persistencia): idea → motores → borrador con hipótesis/ángulo/preguntas/propuesta inicial. Cuatro orígenes: Lead (con prefill de contexto real), Campaña, Radar, manual.
- **Propósito recomendado:** fábrica de borradores comerciales conectada a leads y campañas, con persistencia y estado (borrador → revisado → presentado).
- **Usuario principal:** asesor.
- **Acciones principales:** crear borrador desde 4 orígenes; el borrador no se guarda.
- **Datos que muestra:** tarjetas "Crear desde", empty state honesto ("Todavía no hay propuestas guardadas").
- **Decisión que ayuda a tomar:** "¿cómo estructuro esta oportunidad comercial antes de contactar?"
- **Qué aporta valor:** copy prudente (HEDGE: "Hipótesis a validar", "No sustituye análisis comercial humano"); prefill contextual desde lead ya funciona; es el destino natural del embudo.
- **Qué sobra:** nada aún — la sección es nueva y contenida.
- **Qué falta:** **persistencia** (sin ella la sección es una calculadora que olvida); lista de propuestas; vínculo propuesta→lead almacenado; preguntas inteligentes por segmento.
- **Riesgo de relleno:** **alto si se agrega UI antes que persistencia** — más pasos y pantallas sobre un flujo que no guarda serían puro teatro.
- **Recomendación:** **Mantener.** Regla para 15J: primero persistencia mínima, después crecer el flujo por pasos.

### 5.5 Campañas — `/app/campanas`

- **Código:** `campanas/page.tsx`, `campaigns-list.tsx`, `campanas/[id]`, `lib/campaign-operational.ts`.
- **Propósito actual:** CRUD real de campañas con estados, búsqueda/filtros, guía operativa, y conteos de vínculos a **empresas y oportunidades** (modelo viejo).
- **Propósito recomendado:** agrupar acciones comerciales que **generan leads**, medir avance por leads/propuestas derivadas.
- **Usuario principal:** líder comercial y dirección (gestión); asesor (consulta).
- **Acciones principales:** crear/editar campaña, filtrar, seguir sugerencia de próximo paso operativo.
- **Datos que muestra:** campañas activas vs. resto, segmento, objetivo, conteos de empresas/oportunidades vinculadas.
- **Decisión que ayuda a tomar:** "¿qué acción comercial organizada empujamos esta semana?"
- **Qué aporta valor:** es real (Supabase), tiene estados y copy operativo honesto ("una campaña no envía mensajes automáticamente").
- **Qué sobra:** los conteos de empresas/oportunidades como métrica principal — miden el modelo que ya no está en el menú.
- **Qué falta:** vínculo campaña→leads (el schema `leads` ya tiene `campaign_id`); "crear lead desde campaña"; conexión visible con Propuestas (el origen `?source=campaign` existe pero no hay link desde la campaña).
- **Riesgo de relleno:** medio — sin conexión a leads queda como agenda paralela.
- **Recomendación:** **Mantener + realinear** (15L): contar leads por campaña, botón "nuevo lead en esta campaña", link a nueva propuesta con prefill.

### 5.6 Motores — `/app/ia`

- **Código:** `ia/page.tsx`, `ia-view.tsx`, `commercial-engines-overview.tsx`, dominio `domains/intelligence-engines`, más 6 tabs técnicos (`tab-configuracion`, `tab-prompts`, `tab-categorias`, `tab-perfiles`, `tab-ejecuciones`, `tab-dashboard`).
- **Propósito actual:** doble personalidad. Arriba: presentación comercial de 6 motores (Diagnóstico, Mercado, Producto, Comercial, Dirección, Aprendizaje/Biblioteca — 3 `available_mock`, 3 `conceptual`) con qué hace / preguntas / salidas ejemplo y CTA a Propuestas. Abajo, tras un divisor "Configuración técnica": la administración completa del motor de prompts (stages, categorías, perfiles, ejecuciones) sobre tablas reales `ai_*`.
- **Propósito recomendado:** cada motor con **salida concreta ejecutable** (un diagnóstico, una lista de nichos, un mensaje), no fichas descriptivas. La configuración técnica no pertenece a una sección comercial.
- **Usuario principal:** hoy admin/dirección (gate); la capa comercial debería servir al asesor **a través de Propuestas** (ya ocurre: el mock-generator usa la secuencia de motores).
- **Acciones principales:** leer fichas; crear propuesta (CTA); administrar prompts/perfiles/ejecuciones (capa técnica).
- **Datos que muestra:** definiciones estáticas de motores + datos reales de las tablas `ai_*`.
- **Decisión que ayuda a tomar:** hoy, casi ninguna directa — informa y deriva a Propuestas.
- **Qué aporta valor:** el modelo mental de 6 motores es bueno y ya alimenta Propuestas; la infraestructura de prompts es real y auditada (FASE 12).
- **Qué sobra:** los 6 tabs técnicos dentro de una sección llamada "Motores" en el menú comercial; fichas de motores `conceptual` sin salida (texto decorativo — exactamente lo que el criterio del producto prohíbe).
- **Qué falta:** ejecutar un motor y obtener output concreto (15K); decidir destino de la capa técnica (mover a Admin).
- **Riesgo de relleno:** **alto** — es la sección con más superficie descriptiva por unidad de acción.
- **Recomendación:** **Simplificar.** (a) Capa comercial: solo motores con salida ejecutable o en camino inmediato; los `conceptual` se colapsan a una línea "próximos". (b) Capa técnica: mover a Admin (tab "Agentes IA" ya existe allí — consolidar en un solo lugar).

### 5.7 Dirección — `/app/direccion`

- **Código:** `direccion/page.tsx`, `direccion-view.tsx`.
- **Propósito actual:** dashboard ejecutivo 100 % modelo viejo: totales de oportunidades/contactos/empresas/campañas, etapas de oportunidades, razones de pérdida, actividades recientes, top B2B por valor, focos (oportunidades vencidas / sin próxima acción).
- **Propósito recomendado:** foco ejecutivo Lead-first: leads por etapa, vencidos por asesor, propuestas generadas/pendientes, campañas activas con leads derivados, focos críticos.
- **Usuario principal:** dirección/admin.
- **Acciones principales:** solo lectura (correcto para el rol).
- **Datos que muestra:** todo sobre entidades que ya no están en el menú.
- **Decisión que ayuda a tomar:** hoy, foco ejecutivo sobre un embudo que el equipo ya no opera desde el menú — **desalineado**.
- **Qué aporta valor:** la estructura (métricas + focos + actividad) es la correcta; solo apunta a las tablas equivocadas.
- **Qué sobra:** métricas de contactos/empresas como cabecera; razones de pérdida de oportunidades (el modelo Lead-first aún no registra descartes reales).
- **Qué falta:** todo el eje leads/propuestas (15M).
- **Riesgo de relleno:** **alto en su estado actual** — es la sección más desalineada del menú.
- **Recomendación:** **Mantener + rediseñar** (15M). No ocultar: dirección necesita un lugar propio y el criterio C6 lo exige; pero es la fase más urgente después de Leads/Propuestas.

### 5.8 Admin — `/app/admin`

- **Código:** `admin/page.tsx`, `admin-view.tsx` (tabs Usuarios/Equipos/Agentes IA), `admin/system` (oculta, linkeada desde acá).
- **Propósito actual:** gestión de usuarios activos, equipos y versiones de prompts de agentes; acceso a estado del sistema.
- **Propósito recomendado:** igual + absorber la configuración técnica de Motores; ser el único lugar de configuración.
- **Usuario principal:** admin (gate correcto: `ADMIN_ONLY`; asesores no lo ven ni acceden).
- **Acciones principales:** ver usuarios/equipos/prompts; ir a estado del sistema.
- **Datos que muestra:** perfiles, equipos con líder, prompts activos.
- **Decisión que ayuda a tomar:** "¿quién tiene acceso y está bien configurado el sistema?"
- **Qué aporta valor:** C7 puro; único punto de administración.
- **Qué sobra:** solapamiento del tab "Agentes IA" con los tabs técnicos de Motores (dos lugares para lo mismo).
- **Qué falta:** gestión de roles más explícita; consolidación de la config técnica (15N).
- **Riesgo de relleno:** bajo.
- **Recomendación:** **Mantener + simplificar** (15N): un solo hogar para toda la configuración técnica.

---

## 6. Qué se mantiene

Las 8 secciones del menú. Núcleo intocable: **Leads, Pipeline, Propuestas,
PLIFE Hoy** — son el flujo de venta. Campañas, Motores, Dirección y Admin se
mantienen con condiciones (§7).

---

## 7. Qué se simplifica

| Sección | Simplificación concreta |
|---|---|
| PLIFE Hoy | Retirar FollowUpCenter de oportunidades y links a rutas ocultas cuando el eje leads los cubra (post 15I/15J) |
| Leads (detalle) | Reemplazar o quitar `LeadTimelineMock`, `LeadAIAssistantMock` y botones mock del panel de acciones (15I) |
| Motores | Colapsar motores `conceptual`; mover tabs técnicos a Admin (15K/15N) |
| Campañas | Degradar conteos de empresas/oportunidades; promover conteo de leads (15L) |
| Dirección | Rediseño Lead-first completo (15M) |
| Admin | Consolidar "Agentes IA" + config técnica de Motores en un solo lugar (15N) |

---

## 8. Qué se oculta / elimina

**Nada nuevo se oculta en esta fase.** Se ratifica lo decidido en 15G: por ahora
NO vuelven al menú principal, y dónde vive cada concepto:

| Concepto | Estado | Dónde vive |
|---|---|---|
| Empresas | Oculta (ruta viva) | Datos internos del lead (`lead_type=company`, `company_name_raw`, futura vinculación) |
| Contactos | Oculta (ruta viva) | Datos internos del lead (persona, teléfono, email) |
| Oportunidades | Oculta (ruta viva) | Nace después de propuesta/calificación; el lead es la entrada |
| Radar B2B | Oculta (ruta viva) | Fuente dentro de Propuestas (`?source=radar`) y futuro Motor Mercado |
| Copiloto | Oculta (ruta viva) | Capacidad dentro de Motores/Propuestas (el flujo de borrador la reemplaza) |
| Academia | Oculta (ruta viva) | Motor Aprendizaje/Biblioteca |
| Conocimiento | Oculta (ruta viva) | Motor Aprendizaje/Biblioteca |
| Estado del sistema | Oculta (ruta viva) | Dentro de Admin (link directo existente) |
| Compliance | **Eliminada** (7b63754) | No vuelve |
| OpenAI | **Eliminado** (dd8c405) | No vuelve; los motores son determinísticos/conceptuales |

Deuda señalada (no resolver ahora): varias superficies visibles todavía linkean
a rutas ocultas (`/app/contactos`, `/app/oportunidades` desde PLIFE Hoy;
Campañas cuenta empresas/oportunidades). Funciona, pero es navegación huérfana
del menú: cada fase de simplificación debe ir limpiándolas.

---

## 9. Próximas fases recomendadas

| Fase | Alcance | Por qué en este orden |
|---|---|---|
| **15I** | Leads: calificación simple y scoring | Desbloquea priorización real (C2) y limpia mocks del detalle |
| **15J** | Propuestas: flujo por pasos **con persistencia mínima primero** | Sin guardar, todo lo demás es teatro; habilita "propuestas pendientes" en Hoy |
| **15K** | Motores: outputs concretos por motor | Convierte fichas descriptivas en herramientas; define qué motor se colapsa |
| **15L** | Campañas: conectar con leads/propuestas | `campaign_id` ya existe en el schema de leads; cierra el ciclo captar→agrupar |
| **15M** | Dirección: dashboard ejecutivo Lead-first | Necesita datos de 15I–15L para medir algo real |
| **15N** | Admin: limpiar configuración técnica | Absorbe tabs técnicos de Motores; cierre de la reorganización |

---

## 10. Riesgos

1. **Doble modelo prolongado.** Si 15I–15M se demoran, PLIFE Hoy y Dirección
   siguen mostrando oportunidades/contactos que el menú ya no ofrece: confusión
   creciente para el asesor nuevo.
2. **Propuestas sin persistencia.** Es la sección vitrina del modelo nuevo; si
   el usuario genera borradores y los pierde, el costo de credibilidad es alto.
   Persistencia antes que features (regla dura para 15J).
3. **Motores como folleto.** 3 de 6 motores son `conceptual`; cada semana que
   sigan visibles sin salida erosiona el criterio "cada sección aporta valor
   operativo real".
4. **Pipeline redundante.** Sin interacción propia (mover etapa, señales de
   bloqueo), Pipeline es Leads en columnas; el criterio de la matriz lo dejaría
   fuera en la próxima revisión.
5. **Navegación huérfana.** Links desde secciones visibles a rutas ocultas del
   menú crean caminos sin retorno visible en el sidebar; auditar en cada fase.
6. **Dirección desalineada.** Es la única sección cuyo contenido actual
   contradice el modelo del menú; mientras no llegue 15M, comunicar internamente
   que sus métricas corresponden al flujo anterior.
7. **Doble hogar de configuración IA.** Admin ("Agentes IA") y Motores (tabs
   técnicos) administran piezas del mismo sistema; riesgo de configuración
   divergente hasta 15N.

---

## Archivos auditados (principales)

- `src/components/layout/app-sidebar.tsx` (menú 15G)
- `src/app/app/hoy/{page,advisor-dashboard,direction-dashboard}.tsx`
- `src/app/app/leads/**`, `src/domains/leads/**`, `src/components/leads/**`
- `src/app/app/pipeline/page.tsx`
- `src/app/app/propuestas/**`, `src/domains/proposals/**`
- `src/app/app/campanas/**`, `src/lib/campaign-operational.ts`
- `src/app/app/ia/**`, `src/domains/intelligence-engines/**`, `src/components/ia/**`
- `src/app/app/direccion/**`
- `src/app/app/admin/**`
