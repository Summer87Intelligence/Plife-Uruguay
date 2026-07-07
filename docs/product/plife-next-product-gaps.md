# PLIFE Growth OS — Gaps de producto detectados

> Versión: FASE 13C · 2026-07-03  
> Audiencia: equipo de producto  
> Estado: backlog de observaciones para futuras fases  
> Nota: este documento registra gaps observados. No propone implementación inmediata.

---

## Metodología

Los gaps fueron identificados a partir de la revisión del flujo operativo real en FASE 13C. Cada gap se evalúa por impacto en el uso diario, prioridad relativa, y si requiere código o Supabase para resolverse.

**Escala de impacto:** Alto = bloquea o degrada el flujo operativo real / Medio = genera fricción o confusión / Bajo = mejora de calidad de vida

**Prioridad:** Alta / Media / Baja

---

## Navegación

---

### GAP-NAV-01: No hay retorno inteligente después de crear una entidad

**Descripción:** Al crear una empresa, contacto u oportunidad desde un formulario en modal, el sistema cierra el modal y muestra la lista. No lleva al detalle de la entidad recién creada.

**Impacto:** Medio — el usuario tiene que buscar la entidad que acaba de crear para continuar el flujo (agregar contacto, definir próximo paso).

**Prioridad:** Media

**Fase sugerida:** 14A

**Requiere código:** Sí

**Requiere Supabase:** No

---

### GAP-NAV-02: No hay breadcrumb global consistente en mobile

**Descripción:** En pantallas de detalle (empresa/contacto/oportunidad) el breadcrumb existe, pero en mobile puede quedar truncado o invisible según el viewport.

**Impacto:** Bajo — afecta principalmente usuarios que operen desde teléfono.

**Prioridad:** Baja

**Fase sugerida:** 14B

**Requiere código:** Sí

**Requiere Supabase:** No

---

### GAP-NAV-03: Copiloto IA (/app/copiloto) no está integrado al flujo principal

**Descripción:** El ítem de navegación "Copiloto IA" existe pero no hay orientación clara sobre la diferencia entre usar IA desde una entidad (empresa/oportunidad) versus desde /app/copiloto directamente.

**Impacto:** Medio — usuarios nuevos no saben cuándo usar cada entrada.

**Prioridad:** Media

**Fase sugerida:** 13D o 14A (documentación + guía contextual)

**Requiere código:** Sí (guía contextual)

**Requiere Supabase:** No

---

## Carga de datos

---

### GAP-DAT-01: No hay validación de duplicados al crear empresa o contacto

**Descripción:** El sistema permite crear dos empresas con el mismo nombre o dos contactos con el mismo email sin alertar al usuario.

**Impacto:** Alto — genera base de datos contaminada con duplicados que afectan el Radar, el Motor IA y las métricas de dirección.

**Prioridad:** Alta

**Fase sugerida:** 14A

**Requiere código:** Sí

**Requiere Supabase:** Sí (búsqueda de duplicados en actions)

---

### GAP-DAT-02: No hay campo de "origen del lead" estructurado en empresas

**Descripción:** Las empresas tienen un campo `source` (texto libre) pero no hay lista estandarizada de orígenes (referido, campaña, radar, redes, evento). Esto dificulta análisis de fuentes de generación.

**Impacto:** Medio — dirección no puede saber qué canales generan más empresas de valor.

**Prioridad:** Media

**Fase sugerida:** 14B

**Requiere código:** Sí

**Requiere Supabase:** Sí (enum o FK a tabla de orígenes)

---

### GAP-DAT-03: No hay importación masiva de empresas o contactos

**Descripción:** No existe funcionalidad de importación desde CSV o Excel. La carga es individual.

**Impacto:** Alto para la adopción inicial — equipos con bases de datos existentes deben cargar uno por uno.

**Prioridad:** Alta

**Fase sugerida:** 14C

**Requiere código:** Sí (parser CSV + validación + bulk insert)

**Requiere Supabase:** Sí

---

### GAP-DAT-04: El campo `estimated_employees` es de texto libre, no un rango estandarizado

**Descripción:** El campo de empleados acepta número libre, pero en algunos formularios también aparece `estimated_size` (texto como "mediana"). Genera inconsistencia en el scoring B2B.

**Impacto:** Medio — scores B2B menos precisos si los asesores usan estimaciones informales.

**Prioridad:** Media

**Fase sugerida:** 14A

**Requiere código:** Sí

**Requiere Supabase:** No (solo estandarizar el campo usado)

---

## Seguimiento

---

### GAP-SEG-01: No hay recordatorios automáticos de seguimiento vencido

**Descripción:** El sistema muestra seguimientos vencidos en `/app/hoy` cuando el asesor entra a la app, pero no genera notificaciones push, email ni SMS cuando vence un seguimiento.

**Impacto:** Alto — si el asesor no entra a la app ese día, no se entera del vencimiento.

**Prioridad:** Alta

**Fase sugerida:** 14B

**Requiere código:** Sí (cron job + canal de notificación)

**Requiere Supabase:** Sí (funciones programadas o webhooks)

---

### GAP-SEG-02: No hay vista de calendario de seguimientos

**Descripción:** Los seguimientos se ven como lista en `/app/hoy`. No hay vista de calendario que muestre la distribución temporal de las acciones programadas.

**Impacto:** Medio — asesores con muchas oportunidades no pueden ver fácilmente qué semanas están cargadas.

**Prioridad:** Media

**Fase sugerida:** 14C

**Requiere código:** Sí

**Requiere Supabase:** No

---

### GAP-SEG-03: No hay seguimiento de oportunidades sin actividad por N días de forma configurable

**Descripción:** El sistema detecta oportunidades "stale" con una lógica fija. No hay posibilidad de configurar el umbral (por ejemplo, alertar después de 7 días sin actividad en etapas avanzadas vs 30 días en etapas iniciales).

**Impacto:** Medio — el umbral fijo puede generar alertas excesivas o insuficientes según el ritmo del equipo.

**Prioridad:** Media

**Fase sugerida:** 14B

**Requiere código:** Sí

**Requiere Supabase:** No

---

## Campañas

---

### GAP-CAM-01: Las métricas de campaña son 100% manuales

**Descripción:** Los campos `total_contacted`, `total_meetings`, `total_converted` son contadores que el asesor actualiza manualmente. No se calculan automáticamente desde las actividades registradas.

**Impacto:** Alto — si el asesor no actualiza estos campos, las métricas de la campaña son cero aunque haya trabajo real.

**Prioridad:** Alta

**Fase sugerida:** 14B

**Requiere código:** Sí (calcular desde actividades y oportunidades relacionadas)

**Requiere Supabase:** Sí (funciones o vistas agregadas)

---

### GAP-CAM-02: No hay vista de detalle de campaña con empresas y contactos asociados

**Descripción:** Existe la pantalla de lista de campañas y el card de campaña, pero no hay una vista detallada de campaña que muestre las empresas y contactos asociados, sus estados y la actividad reciente.

**Impacto:** Alto — el asesor no puede ver desde la campaña quiénes están en proceso y cuál es su estado.

**Prioridad:** Alta

**Fase sugerida:** 14A

**Requiere código:** Sí

**Requiere Supabase:** No (los datos ya existen)

---

### GAP-CAM-03: No hay plantillas de campaña reutilizables

**Descripción:** Cada campaña se crea desde cero. No hay forma de duplicar o partir de una plantilla de campaña anterior del mismo tipo.

**Impacto:** Medio — directores o líderes que repiten campañas similares deben re-escribir toda la configuración.

**Prioridad:** Media

**Fase sugerida:** 14C

**Requiere código:** Sí

**Requiere Supabase:** No

---

## Motor IA

---

### GAP-IA-01: El Motor IA no usa el historial de actividades como contexto

**Descripción:** Actualmente el Motor IA ejecuta análisis con los datos de la entidad (empresa/oportunidad) pero no incluye el historial de actividades registradas como parte del contexto del prompt.

**Impacto:** Alto — el output es menos relevante porque no sabe qué ya se hizo con ese cliente.

**Prioridad:** Alta

**Fase sugerida:** 14A

**Requiere código:** Sí (enriquecer el contexto con actividades recientes)

**Requiere Supabase:** No

---

### GAP-IA-02: No hay forma de comparar outputs de distintas ejecuciones

**Descripción:** En `/app/ia` → Ejecuciones se pueden ver los outputs, pero no hay comparación entre dos ejecuciones de la misma entidad en distintos momentos.

**Impacto:** Bajo — dificulta el análisis de evolución del output del motor.

**Prioridad:** Baja

**Fase sugerida:** 15A

**Requiere código:** Sí

**Requiere Supabase:** No

---

### GAP-IA-03: No hay indicador de confianza o calidad del output

**Descripción:** El Motor IA genera output sin indicar al asesor si el análisis fue hecho con contexto rico (empresa completa, actividades, oportunidades) o con contexto mínimo (solo nombre y rubro).

**Impacto:** Medio — el asesor no sabe cuánto confiar en el output según la calidad de los datos.

**Prioridad:** Media

**Fase sugerida:** 14B

**Requiere código:** Sí

**Requiere Supabase:** No

---

### GAP-IA-04: El Copiloto en /app/copiloto está desacoplado del contexto de entidades

**Descripción:** La pantalla `/app/copiloto` permite interacción general con IA, pero no tiene acceso directo al contexto de empresa u oportunidad activa a menos que el asesor copie y pegue manualmente.

**Impacto:** Medio — reduce la utilidad del copiloto para trabajo contextualizado.

**Prioridad:** Media

**Fase sugerida:** 14B

**Requiere código:** Sí

**Requiere Supabase:** No

---

## Compliance

---

### GAP-COM-01: Las reglas de compliance no son editables desde la UI

**Descripción:** Las reglas de compliance (patrones, frases críticas, alternativas sugeridas) se gestionan solo desde la base de datos. No hay interfaz para que un usuario con rol `compliance` las edite.

**Impacto:** Alto — actualizar reglas requiere acceso técnico directo a Supabase.

**Prioridad:** Alta

**Fase sugerida:** 14A

**Requiere código:** Sí (CRUD de reglas en UI)

**Requiere Supabase:** No (las tablas ya existen)

---

### GAP-COM-02: No hay historial de mensajes aprobados o modificados por asesor

**Descripción:** El historial de IA en Compliance muestra interacciones generales, pero no hay un repositorio de mensajes aprobados/modificados que el asesor pueda reutilizar.

**Impacto:** Medio — el asesor repite la revisión para mensajes similares sin poder acceder a versiones ya aprobadas.

**Prioridad:** Media

**Fase sugerida:** 14B

**Requiere código:** Sí

**Requiere Supabase:** Sí

---

### GAP-COM-03: No hay integración entre el output del Motor IA y el revisor de Compliance

**Descripción:** El asesor debe copiar manualmente el texto del Motor IA y pegarlo en el revisor de Compliance. No hay botón "Revisar en Compliance" desde el diálogo de IA.

**Impacto:** Medio — genera fricción en el flujo IA → Compliance que puede llevar a que se omita el paso.

**Prioridad:** Media

**Fase sugerida:** 14A

**Requiere código:** Sí

**Requiere Supabase:** No

---

## Dirección

---

### GAP-DIR-01: No hay vista de performance por asesor

**Descripción:** La vista de Dirección muestra métricas agregadas del equipo, pero no permite comparar el rendimiento individual entre asesores (oportunidades creadas, tasa de conversión, actividad registrada).

**Impacto:** Alto — dirección no puede identificar asesores que necesitan soporte o los que están rindiendo mejor.

**Prioridad:** Alta

**Fase sugerida:** 14B

**Requiere código:** Sí

**Requiere Supabase:** Sí (vistas agregadas por asesor)

---

### GAP-DIR-02: No hay exportación de métricas a Excel o CSV

**Descripción:** Las métricas de Dirección no se pueden exportar. Para reportar a stakeholders externos hay que hacer captura de pantalla o transcribir manualmente.

**Impacto:** Medio — dificulta la preparación de reportes semanales o mensuales.

**Prioridad:** Media

**Fase sugerida:** 14C

**Requiere código:** Sí

**Requiere Supabase:** No

---

### GAP-DIR-03: No hay comparación de períodos en métricas

**Descripción:** La vista de Dirección muestra el estado actual. No hay comparación con semana anterior, mes anterior o mismo período del año pasado.

**Impacto:** Medio — dirección no puede ver si el equipo está mejorando o empeorando respecto a períodos anteriores.

**Prioridad:** Media

**Fase sugerida:** 15A

**Requiere código:** Sí

**Requiere Supabase:** Sí (historial de métricas)

---

## Permisos y roles

---

### GAP-PER-01: El rol `viewer` no tiene pantalla diferenciada

**Descripción:** El rol `viewer` tiene acceso de solo lectura, pero ve las mismas pantallas que un asesor, con botones de edición que no funcionan o que generan errores al hacer clic.

**Impacto:** Medio — experiencia confusa para observadores o supervisores externos.

**Prioridad:** Media

**Fase sugerida:** 14B

**Requiere código:** Sí (adaptar UI según rol)

**Requiere Supabase:** No

---

### GAP-PER-02: No hay control de acceso por equipo

**Descripción:** Los asesores pueden ver todas las empresas y contactos del sistema, no solo los asignados a su equipo. Para empresas pequeñas es aceptable, pero dificulta el escalamiento a múltiples equipos.

**Impacto:** Medio (bajo en contexto actual) — impacta cuando haya múltiples equipos o regiones.

**Prioridad:** Baja

**Fase sugerida:** 15A

**Requiere código:** Sí

**Requiere Supabase:** Sí (RLS por equipo)

---

## Datos demo

---

### GAP-DEMO-01: No hay indicador visual claro de modo demo activo

**Descripción:** El modo demo se detecta por la URL o el entorno, pero en la UI solo aparece el `GettingStartedCard` en algunos contextos. No hay un banner permanente que indique que el sistema está en modo demo.

**Impacto:** Medio — usuario puede confundirse sobre si está viendo datos reales o demo.

**Prioridad:** Media

**Fase sugerida:** 13D

**Requiere código:** Sí

**Requiere Supabase:** No

---

### GAP-DEMO-02: Los datos demo no cubren el flujo completo

**Descripción:** El modo demo tiene datos de ejemplo, pero no siempre cubre todos los estados posibles (empresa con potencial muy alto, oportunidad en validacion_plife, campaña con métricas completas). El asesor en demo no puede ver todas las capacidades del sistema.

**Impacto:** Medio — limita la profundidad de la demo comercial.

**Prioridad:** Media

**Fase sugerida:** 13D o 14A

**Requiere código:** Sí (seed de demo más completo)

**Requiere Supabase:** Sí

---

## Reporting

---

### GAP-REP-01: No hay reporte de actividad del equipo por período

**Descripción:** No existe una vista de reporte que muestre cuántas actividades (llamadas, reuniones, mensajes) registró cada asesor en el último mes o trimestre.

**Impacto:** Alto — dirección no puede medir el nivel de actividad real del equipo.

**Prioridad:** Alta

**Fase sugerida:** 14B

**Requiere código:** Sí

**Requiere Supabase:** Sí (vistas o funciones de agregación)

---

### GAP-REP-02: No hay tasa de conversión visible por etapa

**Descripción:** El pipeline muestra la distribución de oportunidades por etapa, pero no la tasa de conversión entre etapas (cuántas pasan de `calificada` a `contactada`, etc.).

**Impacto:** Medio — impide identificar en qué etapa se pierden más oportunidades.

**Prioridad:** Media

**Fase sugerida:** 14C

**Requiere código:** Sí

**Requiere Supabase:** Sí

---

### GAP-REP-03: No hay dashboard de ROI de campañas

**Descripción:** Se pueden ver las métricas de cada campaña por separado, pero no hay vista comparativa de todas las campañas con conversión, costo/beneficio y rendimiento relativo.

**Impacto:** Medio — dirección no puede comparar qué segmentos generan más valor.

**Prioridad:** Media

**Fase sugerida:** 15A

**Requiere código:** Sí

**Requiere Supabase:** No (datos ya existen)

---

## Resumen de prioridades

| Gap | Categoría | Prioridad | Fase |
|---|---|---|---|
| GAP-DAT-01: Validación de duplicados | Carga de datos | Alta | 14A |
| GAP-DAT-03: Importación masiva | Carga de datos | Alta | 14C |
| GAP-SEG-01: Recordatorios automáticos | Seguimiento | Alta | 14B |
| GAP-CAM-01: Métricas automáticas | Campañas | Alta | 14B |
| GAP-CAM-02: Vista detalle de campaña | Campañas | Alta | 14A |
| GAP-IA-01: Contexto con historial de actividades | Motor IA | Alta | 14A |
| GAP-COM-01: Editor de reglas de compliance | Compliance | Alta | 14A |
| GAP-DIR-01: Performance por asesor | Dirección | Alta | 14B |
| GAP-REP-01: Reporte de actividad | Reporting | Alta | 14B |
| GAP-NAV-01: Retorno tras crear entidad | Navegación | Media | 14A |
| GAP-NAV-03: Diferencia copiloto vs IA en entidad | Navegación | Media | 13D |
| GAP-COM-03: Botón "Revisar en Compliance" | Compliance | Media | 14A |
| GAP-DEMO-01: Banner modo demo | Demo | Media | 13D |

---

*Documento generado en FASE 13C — PLIFE Growth OS*
