# PLIFE Growth OS — Reglas operativas

> Versión: FASE 13C · 2026-07-03  
> Audiencia: asesores, líderes comerciales, dirección  
> Estado: referencia interna operativa

---

## Introducción

Las reglas operativas definen cómo debe usarse PLIFE Growth OS para que el sistema genere valor real. Son principios prácticos, no restricciones técnicas. El sistema no los bloquea automáticamente, pero ignorarlos reduce la calidad de los datos, las métricas y la experiencia del asesor.

---

## Reglas de oportunidades

---

### REGLA-OPP-01: Toda oportunidad debe tener próximo paso

**Regla:** Al crear o actualizar una oportunidad, siempre definir el campo "Próximo paso".

**Motivo:** Sin próximo paso, la oportunidad no aparece en el tablero de `/app/hoy` como acción pendiente. El asesor pierde de vista la oportunidad y el pipeline se congela silenciosamente.

**Pantalla relacionada:** `/app/oportunidades/[id]` → sección Seguimiento

**Riesgo si no se cumple:** Oportunidades activas que no generan alertas ni seguimiento. Pipeline inflado con oportunidades invisibles. Pérdida de conversiones por falta de atención.

---

### REGLA-OPP-02: Toda oportunidad activa debe tener fecha de seguimiento

**Regla:** El campo "Fecha" de la acción debe estar completado en todas las oportunidades en etapas activas.

**Motivo:** La fecha dispara las alertas de vencimiento en `/app/hoy`. Sin fecha, el sistema no puede avisar al asesor cuándo actuar.

**Pantalla relacionada:** `/app/oportunidades/[id]` → sección Seguimiento → campo Fecha

**Riesgo si no se cumple:** El asesor no recibe alertas. Las oportunidades sin fecha no aparecen en el tablero de seguimientos vencidos. La dirección no puede detectar oportunidades sin actividad real.

---

### REGLA-OPP-03: Toda oportunidad debe estar asociada a empresa o contacto

**Regla:** Al crear una oportunidad, siempre asociarla a un contacto existente o a una empresa cuando sea posible.

**Motivo:** Sin asociación, la oportunidad no aparece en el historial de la empresa ni del contacto. Se pierde el contexto comercial y el asesor no puede navegar entre entidades relacionadas.

**Pantalla relacionada:** Formulario de nueva oportunidad → campos Contacto / Empresa

**Riesgo si no se cumple:** Oportunidades huérfanas que no se pueden rastrear. Historial del cliente incompleto. El Motor IA no puede recuperar contexto relevante de la entidad.

---

### REGLA-OPP-04: Registrar motivo de pérdida al cerrar como perdida

**Regla:** Al marcar una oportunidad como `cerrada_perdida`, completar el campo "Motivo de pérdida".

**Motivo:** El motivo de pérdida es el principal insumo de aprendizaje comercial del equipo. Sin este dato, los patrones de pérdida son invisibles para dirección.

**Pantalla relacionada:** `/app/oportunidades/[id]` → botón Perdida → campo Motivo

**Riesgo si no se cumple:** No se puede identificar qué objeciones o situaciones generan más pérdidas. El equipo repite los mismos errores sin saberlo.

---

### REGLA-OPP-05: No usar la etapa `dormida` como alternativa a cerrar

**Regla:** Marcar como `dormida` solo cuando existe intención real de retomar el contacto en el futuro. No usar `dormida` para evadir el cierre.

**Motivo:** Las oportunidades dormidas inflan el pipeline y generan ruido en las métricas de dirección. Una oportunidad perdida sin perspectiva de retomar debe cerrarse como `cerrada_perdida`.

**Pantalla relacionada:** `/app/oportunidades/[id]` → selector de etapa

**Riesgo si no se cumple:** Pipeline sobrecargado con oportunidades que en realidad están perdidas. Métricas de dirección infladas. Asesor con sensación falsa de volumen activo.

---

## Reglas de contactos y empresas

---

### REGLA-ENT-01: Cargar empresa antes de contacto en contexto B2B

**Regla:** En el segmento B2B, siempre crear la empresa antes de crear el contacto. El contacto debe quedar asociado a la empresa.

**Motivo:** El Radar B2B opera sobre empresas, no sobre contactos. Sin empresa, no hay score B2B, no hay inteligencia comercial y el contacto queda flotando sin contexto organizacional.

**Pantalla relacionada:** `/app/empresas` → Nueva empresa; `/app/contactos` → Nuevo contacto → campo Empresa

**Riesgo si no se cumple:** Contacto sin empresa = sin score B2B = invisible en el Radar. No se puede hacer inteligencia de segmento. El asesor pierde contexto de la organización.

---

### REGLA-ENT-02: Completar rubro e industria en cada empresa

**Regla:** El campo Rubro / Industria es obligatorio para que el score B2B sea significativo.

**Motivo:** El ICP (Ideal Customer Profile) del motor de scoring se basa principalmente en el rubro. Sin rubro, el score cae a su mínimo y la empresa no aparece priorizada en el Radar.

**Pantalla relacionada:** `/app/empresas/[id]` → Editar empresa → campo Rubro

**Riesgo si no se cumple:** Score B2B muy bajo o incorrecto. Empresa sub-priorizada en el Radar aunque tenga potencial real. Motor IA sin contexto de industria para generar sugerencias relevantes.

---

### REGLA-ENT-03: Actualizar el estado comercial de la empresa cuando cambia la relación

**Regla:** El estado `b2b_status` de la empresa debe reflejar la etapa real de la relación comercial.

**Motivo:** El estado comercial afecta el score B2B dinámico de la empresa. Una empresa en `en_negociacion` tiene score más alto que una en `detectada`. El estado incorrecto distorsiona la priorización del Radar.

**Pantalla relacionada:** `/app/empresas/[id]` → card Estado comercial

**Riesgo si no se cumple:** Radar B2B con prioridades incorrectas. Métricas de dirección que no reflejan el estado real del pipeline B2B.

---

### REGLA-ENT-04: Todo contacto debe tener próxima acción definida

**Regla:** El campo "Próximo paso" del contacto debe estar siempre actualizado mientras el contacto esté activo comercialmente.

**Motivo:** Los seguimientos vencidos de contactos aparecen como alerta en `/app/hoy`. Sin próxima acción, el contacto es invisible para el tablero del asesor.

**Pantalla relacionada:** `/app/contactos/[id]` → sección Acción del asesor

**Riesgo si no se cumple:** Contactos activos que no generan seguimiento. El asesor pierde el contacto de vista aunque esté en proceso comercial.

---

## Reglas de campañas

---

### REGLA-CAM-01: Una campaña no termina al crearla

**Regla:** Crear la campaña es solo el primer paso. Sin actividad registrada, una campaña activa no genera valor.

**Motivo:** Las métricas de campaña (contactados, reuniones, cierres) son manuales. Si el asesor no registra actividad, la campaña muestra ceros aunque haya trabajo real.

**Pantalla relacionada:** `/app/campanas/[id]` → métricas; empresas y contactos asociados → registrar actividad

**Riesgo si no se cumple:** Campaña con métricas vacías aunque el equipo esté trabajando. Dirección no puede medir el avance ni ajustar el foco.

---

### REGLA-CAM-02: Las campañas deben generar oportunidades

**Regla:** El resultado esperado de una campaña activa es la creación de oportunidades concretas. Si una campaña no genera oportunidades, debe revisarse el segmento o el enfoque.

**Motivo:** La campaña es el puente entre el segmento y el pipeline. Una campaña sin oportunidades vinculadas es una campaña sin retorno visible.

**Pantalla relacionada:** `/app/oportunidades` → filtro por campaña; `/app/campanas/[id]` → métrica total_converted

**Riesgo si no se cumple:** Actividad sin conversión. El equipo trabaja sobre segmentos que no generan pipeline. La dirección no puede medir el ROI de las campañas.

---

### REGLA-CAM-03: Revisar el mensaje inicial en Compliance antes de usarlo

**Regla:** Todo mensaje o script definido en una campaña debe revisarse en `/app/compliance` antes de enviarse a clientes.

**Motivo:** Los mensajes comerciales pueden contener frases que prometen coberturas, primas o condiciones que generan riesgo regulatorio.

**Pantalla relacionada:** `/app/compliance` → revisor de mensajes

**Riesgo si no se cumple:** Mensajes con frases riesgosas que no fueron detectadas. Riesgo regulatorio para PLIFE y MAPFRE.

---

## Reglas de Radar B2B

---

### REGLA-RAD-01: El Radar B2B no es una lista; es una entrada al pipeline

**Regla:** Toda empresa con potencial alto o muy alto detectada en el Radar debe derivar en una acción concreta: crear oportunidad, asignar a asesor o actualizar estado.

**Motivo:** El Radar muestra potencial calculado automáticamente. Sin acción posterior, es solo información sin consecuencias comerciales.

**Pantalla relacionada:** `/app/radar-b2b` → expandir empresa → botón Nueva oportunidad

**Riesgo si no se cumple:** Empresas con alto potencial que nunca son trabajadas. El Radar se convierte en un dashboard de consulta sin impacto en el pipeline.

---

### REGLA-RAD-02: Guardar el score sugerido si es correcto

**Regla:** Cuando el score calculado por el Radar es significativamente distinto del score guardado, el asesor debe evaluar y aplicar el sugerido si corresponde.

**Motivo:** El score guardado es el que se usa en los reportes y la priorización. Si el score guardado está desactualizado, las prioridades del Radar son incorrectas.

**Pantalla relacionada:** `/app/radar-b2b` → panel expandido → botón "Guardar potencial sugerido"

**Riesgo si no se cumple:** Score desactualizado que distorsiona la priorización. Empresas con alto potencial real que no aparecen priorizadas.

---

## Reglas de Motor IA

---

### REGLA-IA-01: Motor IA es apoyo, no decisión

**Regla:** El output del Motor IA siempre debe ser revisado y validado por el asesor antes de usarse. Nunca usar el output directamente sin leerlo.

**Motivo:** El Motor IA genera contenido basado en los datos del sistema y los prompts configurados. Puede contener errores, imprecisiones o sugerencias que no aplican al caso específico.

**Pantalla relacionada:** `/app/oportunidades/[id]` → botón "Asistir con IA"; `/app/contactos/[id]` → "Preparar con IA"

**Riesgo si no se cumple:** Mensajes enviados sin revisión que contienen errores. Propuestas basadas en información incorrecta. Riesgo de comprometer la relación con el cliente.

---

### REGLA-IA-02: El Motor IA no define primas ni coberturas

**Regla:** Nunca interpretar el output del Motor IA como una definición de prima, cobertura o condición de póliza.

**Motivo:** El Motor IA no tiene acceso a los sistemas de cotización de MAPFRE. Sus sugerencias son orientativas y nunca vinculantes en términos de producto.

**Pantalla relacionada:** `/app/ia`, `/app/copiloto`

**Riesgo si no se cumple:** El cliente recibe información de coberturas o primas que no corresponde a la realidad del producto. Riesgo regulatorio y de reputación.

---

### REGLA-IA-03: Revisar en Compliance antes de usar texto generado por IA en mensajes

**Regla:** Si el asesor va a usar texto generado por el Motor IA en una comunicación real con el cliente, primero debe revisarlo en `/app/compliance`.

**Motivo:** El Motor IA puede generar frases que parezcan compromisos o promesas aunque no estén destinadas a serlo. Compliance detecta esas frases antes de que lleguen al cliente.

**Pantalla relacionada:** `/app/compliance` → revisor de mensajes

**Riesgo si no se cumple:** Comunicaciones con frases de riesgo que no fueron detectadas. El compliance ex-post es más costoso que la revisión preventiva.

---

## Reglas de Compliance

---

### REGLA-COM-01: Compliance es revisión preventiva, no aprobación legal

**Regla:** El resultado "aprobado" del revisor de mensajes no equivale a una aprobación legal o formal. Es una verificación de riesgos detectables por el sistema.

**Motivo:** El revisor aplica reglas configuradas en el sistema. No tiene acceso a toda la normativa vigente ni puede anticipar todos los escenarios regulatorios.

**Pantalla relacionada:** `/app/compliance` → resultado de revisión

**Riesgo si no se cumple:** El asesor interpreta "aprobado" como autorización completa y omite la revisión humana posterior.

---

### REGLA-COM-02: Usar Compliance antes de enviar, no después

**Regla:** La revisión de mensajes debe hacerse antes de que el mensaje sea enviado al cliente, no como validación posterior.

**Motivo:** La utilidad del revisor es preventiva. Revisar después del envío no tiene impacto en la comunicación real.

**Pantalla relacionada:** `/app/compliance` → revisor de mensajes

**Riesgo si no se cumple:** Mensajes riesgosos enviados sin revisión. La función de Compliance no cumple su propósito.

---

## Reglas de Dirección

---

### REGLA-DIR-01: Dirección mira foco y seguimiento, no carga diaria

**Regla:** La vista de Dirección es para tomar decisiones sobre el equipo y el pipeline, no para hacer seguimiento operativo caso por caso.

**Motivo:** Dirección tiene vista agregada de métricas, pipeline y actividad. Para el seguimiento de casos específicos existen las vistas de oportunidades, contactos y empresas.

**Pantalla relacionada:** `/app/direccion`

**Riesgo si no se cumple:** Dirección pierde tiempo en detalles operativos que deben resolverse en las pantallas de trabajo. El valor de la vista de Dirección se diluye.

---

### REGLA-DIR-02: La vista de Dirección requiere datos del equipo para tener valor

**Regla:** Si los asesores no cargan oportunidades, actividades y campañas, la vista de Dirección no muestra información útil.

**Motivo:** La vista de Dirección es un agregado de los datos operativos. Sin operación registrada, es una pantalla vacía.

**Pantalla relacionada:** `/app/direccion`

**Riesgo si no se cumple:** Dirección toma decisiones con información incompleta o nula. Reuniones de foco sin datos reales para discutir.

---

## Reglas de datos

---

### REGLA-DAT-01: No mezclar datos demo con datos reales

**Regla:** Antes de operar en producción, eliminar todos los datos demo cargados durante pruebas.

**Motivo:** Los datos demo contaminan el Radar B2B, las métricas de dirección y el pipeline. Los asesores pueden confundirse sobre cuáles oportunidades son reales.

**Pantalla relacionada:** `/app/admin/system` → operaciones de limpieza de datos

**Riesgo si no se cumple:** Métricas incorrectas. Pipeline inflado con datos ficticios. Asesor trabaja sobre contactos que no existen.

---

### REGLA-DAT-02: Registrar actividad por cada interacción real

**Regla:** Cada llamada, mensaje, reunión o email con un cliente debe registrarse como actividad en el contacto, empresa u oportunidad correspondiente.

**Motivo:** El historial de actividades es la memoria comercial del equipo. Sin actividad registrada, el Motor IA no tiene contexto, la dirección no puede ver el trabajo real y el asesor pierde el hilo de la relación.

**Pantalla relacionada:** Botón "Registrar actividad" en `/app/contactos/[id]`, `/app/empresas/[id]`, `/app/oportunidades/[id]`

**Riesgo si no se cumple:** Sistema sin historial real. Motor IA con contexto vacío. Dirección que no puede medir la actividad del equipo. El asesor pierde seguimiento de la relación con el cliente.

---

*Documento generado en FASE 13C — PLIFE Growth OS*
