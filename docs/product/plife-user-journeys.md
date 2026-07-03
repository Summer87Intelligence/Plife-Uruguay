# PLIFE Growth OS — User Journeys

> Versión: FASE 13C · 2026-07-03  
> Audiencia: equipo de producto, asesores, dirección  
> Estado: referencia interna operativa

---

## Journey 1 — Asesor nuevo que carga su primera empresa

### Objetivo
El asesor tiene en mente una organización con potencial comercial y quiere registrarla en el sistema para poder trabajarla.

### Ruta inicial
`/app/empresas` → Nueva empresa

### Pasos

1. El asesor entra a `/app/empresas`
2. Ve el mensaje de empty state: "Todavía no hay empresas cargadas"
3. Hace clic en "Nueva empresa"
4. Completa los datos obligatorios:
   - Nombre de la empresa
   - Rubro / industria (clave para el score B2B)
   - Ciudad / ubicación
5. Completa los datos comerciales si los tiene:
   - Cantidad de empleados (afecta el score B2B)
   - Oportunidad detectada (por qué puede necesitar seguros)
   - Ángulo comercial (cómo abordar la conversación)
   - Contacto ideal (quién es la persona a contactar)
6. Guarda la empresa
7. El sistema lo lleva al detalle de la empresa
8. Ve el aviso: "Siguiente paso: agregar un contacto"
9. Hace clic en "Agregar contacto" desde la empresa
10. Completa los datos del contacto (nombre, cargo, teléfono, email)
11. El contacto queda asociado a la empresa automáticamente
12. El asesor define una próxima acción en el contacto

### Datos que necesita
- Nombre de la empresa
- Rubro aproximado
- Nombre del contacto principal y cargo
- Teléfono o email del contacto

### Resultado esperado
- Empresa cargada con estado `detectada`
- Contacto asociado con estado `nuevo`
- Próxima acción definida
- Empresa visible en el Radar B2B con score inicial calculado

### Errores comunes
- Cargar el contacto directamente sin crear la empresa primero (pierde contexto B2B)
- No completar el rubro (el score B2B baja significativamente)
- No definir próxima acción tras crear el contacto (el seguimiento no arranca)
- Dejar el estado comercial de la empresa en `detectada` sin avanzar

### Pantallas involucradas
- `/app/empresas` → lista y formulario de nueva empresa
- `/app/empresas/[id]` → detalle de empresa, aviso de próximo paso
- `/app/contactos/[id]` → definir próxima acción

---

## Journey 2 — Asesor que convierte una conversación en oportunidad

### Objetivo
El asesor tuvo una conversación con un contacto y detectó interés comercial real. Quiere registrar esa oportunidad y mantener el seguimiento.

### Ruta inicial
`/app/contactos/[id]` o `/app/empresas/[id]` → Nueva oportunidad

### Pasos

1. El asesor abre el contacto o la empresa desde donde nació la conversación
2. Hace clic en "Nueva oportunidad"
3. Completa los datos de la oportunidad:
   - Título descriptivo de la conversación (ej: "Seguro colectivo para empleados — Estudio García")
   - Tipo: B2B (si viene de empresa), B2C (si es persona), Reclutamiento
   - Etapa inicial: `nueva` o `calificada` si ya hay conversación
   - Necesidad detectada (lo que dijo el cliente)
   - Producto sugerido (si ya hay idea)
   - Valor estimado (si se habló de cifras)
4. Define el próximo paso de inmediato:
   - Qué hay que hacer (ej: "Enviar propuesta conceptual")
   - Fecha para esa acción
5. Guarda la oportunidad
6. El sistema lo lleva al detalle de la oportunidad
7. Registra la actividad de la conversación que disparó esto (tipo: llamada, reunión o mensaje)
8. El asesor vuelve a `/app/hoy` y ve la oportunidad en las próximas acciones

### Datos que necesita
- Nombre del contacto o empresa de origen (ya debe existir en el sistema)
- Descripción breve de la conversación
- Próximo paso concreto
- Fecha de seguimiento

### Resultado esperado
- Oportunidad creada en etapa `nueva` o `calificada`
- Próxima acción y fecha definidas
- Actividad registrada como registro de la conversación
- Oportunidad visible en `/app/hoy` como próxima acción

### Errores comunes
- Crear la oportunidad sin próximo paso (queda invisible en el tablero)
- No registrar la actividad de la conversación que la originó (se pierde el historial)
- Usar un título genérico como "Oportunidad 1" (dificulta la búsqueda y el contexto)
- No asociar la oportunidad a empresa o contacto existente

### Pantallas involucradas
- `/app/contactos/[id]` o `/app/empresas/[id]` → botón "Nueva oportunidad"
- `/app/oportunidades/[id]` → definir seguimiento y registrar actividad
- `/app/hoy` → verificar que aparece en próximas acciones

---

## Journey 3 — Asesor que usa Motor IA para preparar seguimiento

### Objetivo
El asesor tiene una reunión próxima con un cliente y quiere usar el Motor IA para prepararse mejor y no improvisar.

### Ruta inicial
`/app/oportunidades/[id]` → botón "Asistir con IA"  
o `/app/contactos/[id]` → botón "Preparar con IA"

### Pasos

1. El asesor abre la oportunidad o el contacto que va a trabajar
2. Hace clic en "Asistir con IA" (oportunidad) o "Preparar con IA" (contacto)
3. El sistema abre el diálogo de Copiloto IA
4. El asesor elige la acción:
   - "Preparar reunión" → genera guía de preparación
   - "Sugerir próximo paso" → sugiere acción concreta
   - "Generar seguimiento" → borrador de mensaje de seguimiento
   - "Responder objeción" → respuesta a objeción frecuente
5. El motor ejecuta el análisis con el contexto de la entidad
6. El asesor lee el output generado
7. **Revisa y ajusta** antes de usar cualquier parte del output
8. Si quiere guardar la respuesta IA como actividad, hace clic en "Guardar como actividad"
9. Si va a usar el texto en un mensaje, primero va a `/app/compliance` y lo revisa
10. El asesor usa el output como apoyo para prepararse, no como guion definitivo

### Datos que necesita
- Oportunidad o contacto con datos cargados (historial de actividades, notas, próximo paso)
- Motor IA configurado (perfil activo, prompts validados)

### Resultado esperado
- Output de IA generado y guardado como actividad si corresponde
- Asesor preparado para la reunión o el contacto
- Si se va a usar texto en mensaje: revisado en Compliance antes de enviar

### Errores comunes
- Usar el output del Motor IA directamente sin leerlo ni ajustarlo
- Asumir que el Motor IA conoce condiciones reales de MAPFRE (no las conoce)
- No revisar el mensaje en Compliance si contiene referencias a coberturas o primas
- Esperar que el Motor IA "tome la decisión" por el asesor

### Pantallas involucradas
- `/app/oportunidades/[id]` → botón "Asistir con IA"
- `/app/contactos/[id]` → botón "Preparar con IA"
- `/app/ia` → gestión del motor (solo si se necesita configurar)
- `/app/compliance` → revisión del texto antes de usarlo

---

## Journey 4 — Dirección revisando foco comercial semanal

### Objetivo
El líder comercial o director quiere entender en qué está el equipo, detectar problemas y definir prioridades para la semana.

### Ruta inicial
`/app/direccion`

### Pasos

1. Entrar a `/app/direccion`
2. Revisar métricas generales: oportunidades totales, contactos, empresas, campañas activas
3. Ver alertas de foco: oportunidades con seguimiento vencido / sin próximo paso
4. Revisar distribución del pipeline por etapa → detectar cuellos de botella
5. Revisar actividad reciente del equipo → quién está operando activamente
6. Ver top oportunidades B2B activas → detectar las más importantes sin avance
7. Ir a `/app/oportunidades` para profundizar en las oportunidades problemáticas
8. Ir a `/app/campanas` para revisar el progreso de campañas activas
9. Ir a `/app/radar-b2b` para ver empresas con alto potencial sin acción
10. Definir acciones: asignar oportunidades, comunicar prioridades, ajustar campañas

### Datos que necesita
- El equipo debe tener datos cargados: oportunidades con seguimiento, actividades registradas, campañas con métricas
- Sin datos del equipo, la vista de Dirección tiene poco valor

### Resultado esperado
- Lista de acciones prioritarias para la semana
- Identificación de asesores o segmentos que necesitan atención
- Decisiones sobre campañas activas
- Comunicación de prioridades al equipo

### Errores comunes
- Revisar Dirección sin que el equipo haya cargado datos (la vista estará vacía)
- No bajar al detalle de las oportunidades problemáticas
- No comunicar las prioridades al equipo después de la revisión
- Usar Dirección como única fuente de operación (requiere complementarse con pipeline y campañas)

### Pantallas involucradas
- `/app/direccion` → vista principal
- `/app/oportunidades` → detalle del pipeline
- `/app/campanas` → progreso de campañas
- `/app/radar-b2b` → empresas sin acción

---

## Journey 5 — Campaña que genera oportunidades

### Objetivo
El líder comercial creó una campaña para el segmento "Dueños de pymes" y quiere convertir respuestas positivas en oportunidades concretas.

### Ruta inicial
`/app/campanas` → Campaña activa → empresas/contactos del segmento

### Pasos

1. El líder comercial crea la campaña en `/app/campanas`:
   - Nombre: "Protección Dueños Pymes Q3"
   - Tipo: `duenos_pymes`
   - Objetivo: "Reuniones diagnóstico con 10 dueños de pymes locales"
   - Segmento: "Pymes de servicios con 5-30 empleados, Montevideo"
   - Mensaje inicial: redactado y revisado en Compliance
   - Script de llamada: preparado
2. Se asocian empresas del segmento a la campaña (desde el detalle de cada empresa → campo Campaña)
3. Los asesores operan la campaña:
   - Hacen llamadas o envían mensajes
   - Registran actividad (tipo: llamada / mensaje / email)
   - Actualizan el estado de cada empresa (contactada, reunion_agendada)
4. Cuando un cliente muestra interés:
   - Se crea una oportunidad desde la empresa o el contacto
   - La oportunidad se asocia a la campaña
   - Se define próximo paso: diagnóstico o reunión
5. Las métricas de la campaña se actualizan manualmente:
   - total_contacted: cuántos se contactaron
   - total_meetings: cuántas reuniones se lograron
   - total_converted: cuántas oportunidades se cerraron
6. Al finalizar el período, se marca la campaña como `finalizada`

### Datos que necesita
- Empresas del segmento ya cargadas en el sistema
- Mensaje inicial revisado en Compliance
- Asesores asignados a la campaña
- Objetivos claros (total_targets)

### Resultado esperado
- Empresas contactadas con actividad registrada
- Oportunidades creadas a partir de respuestas positivas
- Métricas de campaña actualizadas
- Aprendizaje sobre el segmento para futuras campañas

### Errores comunes
- No registrar actividad por cada acción (las métricas quedan en cero)
- No asociar las oportunidades generadas a la campaña (se pierde la trazabilidad)
- No revisar el mensaje inicial en Compliance antes de usarlo
- Dejar la campaña activa después de que terminó su ciclo

### Pantallas involucradas
- `/app/campanas` → creación y seguimiento de la campaña
- `/app/empresas/[id]` → asociar empresa a campaña, registrar actividad
- `/app/contactos/[id]` → registrar actividad y próxima acción
- `/app/oportunidades` → crear oportunidad y asociarla a la campaña
- `/app/compliance` → revisar mensaje antes de usarlo

---

*Documento generado en FASE 13C — PLIFE Growth OS*
