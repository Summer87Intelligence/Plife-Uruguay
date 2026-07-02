# In-App Operational Guidance Audit — FASE 13A

Auditoría de textos orientativos, empty states y guías contextuales por pantalla.

---

## /app/hoy (advisor-dashboard.tsx)

**Qué hace:** Tablero principal del asesor con seguimientos vencidos, próximas acciones, oportunidades activas y campañas.
**Usuario nuevo debería entender:** Por dónde empezar: empresa → contacto → oportunidad → seguimiento.
**Acción principal:** Revisar qué seguimientos están vencidos.
**Acción secundaria:** Crear oportunidad o registrar actividad.
**Qué hacer después:** Abrir el Motor IA para preparar el contacto.
**Texto que falta hoy:** Guía de flujo de 6 pasos cuando isEmpty. GettingStartedCard existe pero no enumera el flujo completo hasta Motor IA.
**Mejora recomendada:** Agregar sección "Cómo avanzar hoy" visible solo en isEmpty con 6 pasos y CTAs.
**Riesgo técnico:** Bajo. Solo JSX agregado en bloque isEmpty.

---

## /app/empresas (companies-list.tsx)

**Qué hace:** Lista todas las empresas B2B con filtros de estado y búsqueda.
**Usuario nuevo debería entender:** Que la empresa es el primer paso del flujo comercial.
**Acción principal:** Crear empresa.
**Acción secundaria:** Buscar o filtrar.
**Qué hacer después:** Agregar contactos y crear oportunidades desde la empresa.
**Texto que falta hoy:** El header ya tiene subtítulo útil. Empty state tiene texto pero podría ser más orientativo.
**Mejora recomendada:** Mejorar descripción del header y refinar textos del empty state con orientación clara de próximo paso.
**Riesgo técnico:** Bajo. Textos inline, sin lógica nueva.

---

## /app/empresas/[id] (company-detail.tsx)

**Qué hace:** Detalle de empresa con contactos, oportunidades, inteligencia B2B y análisis IA.
**Usuario nuevo debería entender:** Que si no hay contactos ni oportunidades, el siguiente paso es agregarlos.
**Acción principal:** Agregar contacto o crear oportunidad.
**Acción secundaria:** Ejecutar análisis IA.
**Qué hacer después:** Ir al contacto o a la oportunidad creada.
**Texto que falta hoy:** Sin aviso contextual cuando no hay contactos o no hay oportunidades. Falta disclaimer de seguridad junto al card IA.
**Mejora recomendada:** Mostrar cards de guía contextual condicionales (sin contactos / sin oportunidades). Agregar texto de seguridad IA.
**Riesgo técnico:** Bajo. Condiciones sobre arrays ya disponibles en props.

---

## /app/contactos (contacts-list.tsx)

**Qué hace:** Lista de contactos con filtros de estado e interés.
**Usuario nuevo debería entender:** Que los contactos son las personas que viven dentro de empresas.
**Acción principal:** Crear contacto.
**Acción secundaria:** Buscar o filtrar por estado/interés.
**Qué hacer después:** Abrir el contacto y crear una oportunidad.
**Texto que falta hoy:** Header ya tiene subtítulos orientativos. Empty state podría ser más específico.
**Mejora recomendada:** Refinar textos del empty state con referencia a la asociación a empresa.
**Riesgo técnico:** Bajo.

---

## /app/contactos/[id] (contact-detail.tsx)

**Qué hace:** Detalle del contacto con estado comercial, próxima acción, actividades y oportunidades.
**Usuario nuevo debería entender:** Que la próxima acción es lo más importante para no perder el seguimiento.
**Acción principal:** Definir próxima acción.
**Acción secundaria:** Crear oportunidad.
**Qué hacer después:** Si hay interés comercial, crear oportunidad desde este contacto.
**Texto que falta hoy:** Sin aviso cuando no hay próxima acción ni oportunidades. El card "Acción del asesor" ya tiene texto italic pero es muy pequeño.
**Mejora recomendada:** Aviso contextual visible cuando next_action está vacío. Aviso cuando no hay oportunidades vinculadas.
**Riesgo técnico:** Bajo.

---

## /app/oportunidades (pipeline-view.tsx)

**Qué hace:** Vista pipeline o lista de todas las oportunidades comerciales.
**Usuario nuevo debería entender:** Qué es una oportunidad y cuándo crearla.
**Acción principal:** Crear oportunidad.
**Acción secundaria:** Cambiar vista (pipeline/lista) o filtrar.
**Qué hacer después:** Abrir la oportunidad y definir el próximo paso.
**Texto que falta hoy:** Header tiene subtítulos. Empty state existe pero podría reforzar el concepto de "conversación comercial concreta".
**Mejora recomendada:** Agregar texto guía breve bajo el header. Refinar empty state.
**Riesgo técnico:** Bajo.

---

## /app/oportunidades/[id] (opportunity-detail.tsx)

**Qué hace:** Detalle de oportunidad con etapa, seguimiento, timeline y análisis IA.
**Usuario nuevo debería entender:** Que siempre debe haber un próximo paso definido.
**Acción principal:** Definir o actualizar el próximo paso.
**Acción secundaria:** Avanzar de etapa o registrar actividad.
**Qué hacer después:** Ejecutar análisis IA para preparar el seguimiento.
**Texto que falta hoy:** Sin advertencia visible cuando no hay próximo paso. El card de seguimiento tiene texto italic pero pequeño. Falta disclaimer IA.
**Mejora recomendada:** Banner de advertencia visible cuando next_action está vacío. Texto de seguridad junto al EntityAIAnalysisCard.
**Riesgo técnico:** Bajo.

---

## /app/campanas (campaigns-list.tsx)

**Qué hace:** Lista de campañas con estado, segmento y métricas básicas.
**Usuario nuevo debería entender:** Que las campañas organizan acciones por segmento y no envían mensajes automáticamente.
**Acción principal:** Crear campaña (solo líderes/dirección).
**Acción secundaria:** Buscar o filtrar por estado.
**Qué hacer después:** Asociar empresas a la campaña y convertir respuestas en oportunidades.
**Texto que falta hoy:** Header tiene subtítulo pero no aclara que NO envía mensajes automáticamente. Empty state es correcto.
**Mejora recomendada:** Agregar texto explícito sobre qué NO hace la campaña. Agregar hint de próximo paso post-creación.
**Riesgo técnico:** Bajo.

---

## /app/radar-b2b (radar-b2b-view.tsx)

**Qué hace:** Prioriza empresas por potencial comercial B2B con score automático e inteligencia de ICP.
**Usuario nuevo debería entender:** Que el Radar detecta potencial y convierte señales en oportunidades.
**Acción principal:** Revisar empresas con potencial alto y crear oportunidad.
**Acción secundaria:** Aplicar score sugerido o asociar campaña.
**Qué hacer después:** Ir a la empresa o crear oportunidad desde el panel expandido.
**Texto que falta hoy:** Header describe bien el radar. Falta sugerencia de acción cuando no hay datos.
**Mejora recomendada:** Agregar guía contextual con CTAs cuando no hay empresas cargadas.
**Riesgo técnico:** Bajo.

---

## /app/ia (ia-view.tsx)

**Qué hace:** Motor IA PLIFE para configurar prompts, perfiles y revisar ejecuciones comerciales.
**Usuario nuevo debería entender:** Para qué sirve, qué NO hace y cómo usarlo correctamente.
**Acción principal:** Revisar el perfil activo y los prompts validados.
**Acción secundaria:** Ejecutar análisis desde empresa u oportunidad.
**Qué hacer después:** Revisar outputs y usar como apoyo, nunca como decisión final.
**Texto que falta hoy:** Falta card de guía con declaración explícita de lo que NO hace el Motor IA (primas, coberturas, MAPFRE, mensajes automáticos).
**Mejora recomendada:** Agregar banner/card de guía en el hero con pasos y disclaimers explícitos.
**Riesgo técnico:** Bajo.

---

## /app/compliance (compliance-view.tsx)

**Qué hace:** Revisor de mensajes comerciales para detectar frases riesgosas antes de enviarlos.
**Usuario nuevo debería entender:** Que hay que revisar mensajes ANTES de enviarlos, no después.
**Acción principal:** Pegar un mensaje y revisarlo.
**Acción secundaria:** Ver historial de revisiones.
**Qué hacer después:** Ajustar el mensaje con la versión sugerida y usarlo solo después de revisión humana.
**Texto que falta hoy:** El header tiene texto orientativo pero falta un flujo numerado y un disclaimer legal explícito.
**Mejora recomendada:** Agregar card de guía con 4 pasos y disclaimer de que no reemplaza revisión legal.
**Riesgo técnico:** Bajo.

---

## /app/direccion (direccion-view.tsx)

**Qué hace:** Vista ejecutiva de métricas, pipeline por etapa y actividad del equipo.
**Usuario nuevo debería entender:** Que esta vista es para mirar foco, no para operar directamente.
**Acción principal:** Revisar métricas y alertas de foco.
**Acción secundaria:** Identificar oportunidades sin seguimiento y definir acciones para el equipo.
**Qué hacer después:** Bajar a oportunidades específicas o campañas activas.
**Texto que falta hoy:** Header tiene subtítulo. Falta guía de 4 pasos para usar la vista eficientemente.
**Mejora recomendada:** Agregar SectionGuideCard con pasos de uso de la vista de dirección.
**Riesgo técnico:** Bajo.
