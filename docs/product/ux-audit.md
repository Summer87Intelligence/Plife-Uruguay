# FASE 12D — Auditoría UX operativa

> **Histórico (FASE 15B):** OpenAI fue removido del proyecto. Las menciones a OpenAI / GPT / `OPENAI_API_KEY` son registro histórico; los motores operan en modo determinístico interno.

**Fecha:** 2026-07-01  
**Alcance:** 10 secciones principales de PLIFE Growth OS  
**Criterios:** título, subtítulo, CTA, primer paso, empty states, botones, jerga, acción recomendada

---

## /app/hoy

| Problema detectado | Cambio recomendado | Prioridad | Riesgo técnico |
|---|---|---|---|
| El título es un saludo personalizado (“Buenos días, Juan”) y no menciona “Hoy”, lo que puede desorientar respecto al ítem de navegación. | Agregar contexto: mantener saludo + línea “Tu tablero de hoy” o badge “Hoy”. | Media | Bajo |
| El CTA principal “Preparar contacto con IA” compite con el onboarding y no es obvio para usuarios nuevos sin datos. | Para cuentas vacías, priorizar visualmente “¿Por dónde empiezo?”; dejar Copiloto como acción secundaria. | Media | Bajo |
| Empty states internos (“Sin acciones programadas”, “No hay campañas activas”) no sugieren qué hacer. | Agregar enlace contextual (“Crear oportunidad”, “Ver campañas”) en estados vacíos clave. | Media | Bajo |
| Abreviatura “conv.” en campañas activas es poco clara. | Cambiar a “convertidos” o “conversiones”. | Baja | Bajo |
| Vista Dirección reutiliza el mismo subtítulo que asesor; no diferencia el rol ejecutivo. | Subtítulo específico: “Resumen del equipo y alertas comerciales”. | Baja | Bajo |
| “Oportunidades calientes” usa jerga interna sin definición. | Tooltip o subtítulo: “En etapas avanzadas del pipeline”. | Baja | Bajo |

---

## /app/empresas

| Problema detectado | Cambio recomendado | Prioridad | Riesgo técnico |
|---|---|---|---|
| Subtítulo duplicado (dos líneas grises con mensajes similares). | Unificar en una línea clara + hint de flujo (“Primero empresa → contacto → oportunidad”). | Baja | Bajo |
| Tras crear empresa, el diálogo se cierra sin indicar el siguiente paso. | Panel de éxito con “Agregar contacto” y “Ver empresa”. | Alta | Bajo |
| Formulario largo con campos técnicos visibles al crear (Score B2B, Estado B2B, redes). | Renombrar labels al lenguaje del usuario; agrupar campos avanzados al final. | Media | Bajo |
| “Estado B2B” y “Score B2B” son jerga. | “Estado comercial” y “Potencial comercial (0–100)”. | Media | Bajo |
| Falta botón Cancelar en el formulario del diálogo. | Agregar “Cancelar” consistente. | Media | Bajo |

---

## /app/contactos

| Problema detectado | Cambio recomendado | Prioridad | Riesgo técnico |
|---|---|---|---|
| No indica que conviene asociar el contacto a una empresa. | Subtítulo: “Vinculá cada persona a una empresa para seguir el pipeline B2B”. | Media | Bajo |
| El formulario de lista no carga empresas → no aparece selector “Empresa asociada”. | Pasar listado de empresas desde la página al formulario. | Alta | Bajo |
| Tras crear contacto, no hay guía al siguiente paso. | Panel de éxito: “Crear oportunidad” + “Ver contacto”. | Alta | Bajo |
| “Próx:” en la lista es abreviatura críptica. | “Seguimiento:” o fecha con label completo. | Baja | Bajo |
| Icono de búsqueda en empty state sin resultados (debería ser Users). | Usar icono de contacto cuando no hay filtros. | Baja | Bajo |
| Labels del formulario: “Nombre”/“Apellido” sin contexto de obligatoriedad visual unificada. | “Nombre *” / “Apellido *” + reorden lógico de campos. | Media | Bajo |

---

## /app/oportunidades

| Problema detectado | Cambio recomendado | Prioridad | Riesgo técnico |
|---|---|---|---|
| Diálogo “Nueva oportunidad” sin descripción. | Agregar: “Registrá una conversación comercial concreta”. | Baja | Bajo |
| Columnas vacías del pipeline muestran solo “Vacío”. | “Arrastrá oportunidades aquí” o “Sin oportunidades en esta etapa”. | Baja | Bajo |
| Tras crear, no hay feedback de siguiente paso. | Panel de éxito: “Ver oportunidad” + “Ir al pipeline”. | Alta | Bajo |
| Formulario: “Título” en lugar de lenguaje de negocio. | “Nombre de la oportunidad”. | Media | Bajo |
| “Riesgo comercial” y tipos B2C/B2B pueden confundir a usuarios nuevos. | Placeholders con ejemplos; mantener campos. | Baja | Bajo |
| Filtro “Riesgo bajo/medio…” es jerga de compliance aplicada al pipeline. | Prefijo “Nivel de riesgo:”. | Baja | Bajo |

---

## /app/campanas

| Problema detectado | Cambio recomendado | Prioridad | Riesgo técnico |
|---|---|---|---|
| Subtítulo repetido dos veces con ideas similares. | Una sola línea descriptiva. | Baja | Bajo |
| Métricas en inglés: “Targets”, “Convertidos” mezclados. | “Objetivo”, “Contactados”, “Reuniones”, “Cierres”. | Media | Bajo |
| Asesores sin permiso ven empty state sin explicación de por qué no pueden crear. | Mensaje: “Solo líderes comerciales pueden crear campañas”. | Media | Bajo |
| Estado de campaña no visible al crear (solo en edición). | Mostrar campo Estado con default “Borrador”. | Media | Bajo |
| Sin feedback post-creación. | Pendiente: flujo simple (ver detalle de campaña). | Baja | Bajo |

---

## /app/radar-b2b

| Problema detectado | Cambio recomendado | Prioridad | Riesgo técnico |
|---|---|---|---|
| CTA “Cargar empresa” inconsistente con “Nueva empresa” en Empresas. | Unificar a “Nueva empresa”. | Media | Bajo |
| Botón “Oportunidad” sin verbo ni “Nueva”. | “Nueva oportunidad”. | Media | Bajo |
| Abreviaturas: “empl.”, término ICP en filtros. | “empleados”; filtro ya dice “perfiles de cliente” — OK. | Baja | Bajo |
| Mucha densidad de información; usuario nuevo no sabe expandir “Análisis”. | Banner ya existe para alto potencial; reforzar “Expandí para ver el próximo paso”. | Baja | Bajo |
| Jerga: “Aplicar potencial sugerido”, “ICP” en filas. | “Guardar potencial sugerido”; ICP con nombre legible (ya usa ICP_NOMBRES). | Baja | Bajo |

---

## /app/compliance

| Problema detectado | Cambio recomendado | Prioridad | Riesgo técnico |
|---|---|---|---|
| Título y subtítulo claros; buen CTA “Revisar mensaje”. | Mantener; ya cumple objetivo. | — | — |
| Tab “Trazabilidad IA” es técnico para usuarios no técnicos. | Renombrar a “Historial de revisiones IA”. | Baja | Bajo |
| Empty state de trazabilidad sin acción. | Enlace a “Revisor de mensajes”. | Baja | Bajo |
| Columna “Docs” en tabla poco clara. | “Documentos usados”. | Baja | Bajo |

---

## /app/copiloto

| Problema detectado | Cambio recomendado | Prioridad | Riesgo técnico |
|---|---|---|---|
| Subtítulo habla de “activar IA avanzada” — no explica qué hace hoy el usuario. | “Prepará mensajes, objeciones y próximos pasos con asistencia comercial”. | Alta | Bajo |
| Dos banners de advertencia azules duplican mensaje. | Fusionar en un solo aviso contextual. | Media | Bajo |
| Botón “Generar con IA” deshabilitado sin IA configurada, sin alternativa. | Texto del botón + hint: “Requiere configuración de IA” o flujo demo. | Media | Medio |
| No hay CTA claro de primer uso. | Sugerir seleccionar contacto + ejemplo de prompt (ya existen chips). | Baja | Bajo |
| Select “¿Con qué te ayudo?” — buena UX. | Mantener. | — | — |

---

## /app/conocimiento

| Problema detectado | Cambio recomendado | Prioridad | Riesgo técnico |
|---|---|---|---|
| Subtítulo técnico (“fuente de verdad” para IA). | “Documentos validados que el equipo y la IA usan para responder con precisión”. | Media | Bajo |
| Jerga fuerte: chunks, embeddings, semántico, indexar. | Labels amigables: “Fragmentos”, “Listo para búsqueda inteligente”. | Media | Bajo |
| CTA “Agregar documento” vs patrón “Nuevo …”. | “Nuevo documento” o mantener si es gestión de archivos. | Baja | Bajo |
| Sin guía de primer paso para roles sin permisos de gestión. | Empty state explicando que admin/capacitación cargan documentos. | Media | Bajo |
| Mensajes de error mencionan OPENAI_API_KEY al usuario final. | Mensaje genérico: “Búsqueda inteligente no disponible; contactá al administrador”. | Media | Bajo |

---

## /app/direccion

| Problema detectado | Cambio recomendado | Prioridad | Riesgo técnico |
|---|---|---|---|
| Título y subtítulo adecuados para rol ejecutivo. | Mantener; opcional enlace a Radar B2B. | Baja | Bajo |
| Sin CTA cuando no hay datos (métricas en cero). | Enlace a Empresas / Campañas o reutilizar GettingStartedCard. | Media | Medio |
| “Distribución del Pipeline” sin enlace al pipeline completo. | Agregar “Ver pipeline completo”. | Baja | Bajo |
| Superposición conceptual con /app/hoy para rol dirección. | Documentar: Hoy = operativo diario; Dirección = analítica. | Baja | N/A |

---

## Resumen de prioridades

| Prioridad | Cantidad | Enfoque FASE 12D |
|---|---|---|
| Alta | 5 | Post-creación, empresa en formulario contacto, copy Copiloto |
| Media | 18 | Labels formularios, consistencia botones, empty states |
| Baja | 20 | Abreviaturas, jerga secundaria, refinamientos |

## Cambios pendientes (fuera de alcance inmediato)

- Colapsar campos avanzados en formularios con acordeón.
- CTA Copiloto deshabilitado con flujo alternativo sin OpenAI.
- GettingStartedCard en /app/direccion cuando métricas = 0.
- Post-creación de campaña con panel dedicado (requiere navegación a detalle).
- Unificar /app/hoy Dirección vs /app/direccion en documentación de producto.
