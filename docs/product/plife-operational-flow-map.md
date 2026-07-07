# PLIFE Growth OS — Mapa de flujo operativo

> Versión: FASE 13C · 2026-07-03  
> Audiencia: asesores, líderes comerciales, dirección  
> Estado: referencia interna operativa

---

## 1. Principio general del sistema

PLIFE Growth OS no es una base de datos. Es un flujo comercial: cada entidad tiene un rol en la cadena de trabajo, y el valor del sistema aumenta a medida que las entidades están conectadas y actualizadas.

El flujo central es:

```
Empresa → Contacto → Oportunidad → Seguimiento → Campaña / Radar → Motor IA → Compliance → Dirección
```

**Empresa** es el punto de entrada para el segmento B2B. Sin empresa, no hay contexto organizacional.

**Contacto** es la persona clave dentro de esa empresa o en el segmento B2C. Sin contacto, no hay seguimiento personal.

**Oportunidad** formaliza una conversación comercial concreta. Sin oportunidad, no hay pipeline.

**Seguimiento** (próximo paso + fecha) mantiene la oportunidad activa. Sin seguimiento, la oportunidad se congela.

**Campaña** ordena el trabajo comercial por segmento. No envía mensajes automáticamente.

**Radar B2B** detecta empresas con potencial y las convierte en entradas al pipeline.

**Motor IA** asiste la preparación del asesor. No decide. No define primas ni coberturas.

**Compliance** revisa mensajes antes de usarlos. No reemplaza revisión legal ni condiciones oficiales MAPFRE.

**Dirección** observa el foco del equipo y toma decisiones sobre el pipeline. No opera directamente.

---

## 2. Flujo diario recomendado — Asesor

Pantalla de inicio: `/app/hoy`

### Paso a paso

**1. Revisar el foco del día**
- Entrar a `/app/hoy`
- Ver seguimientos vencidos (rojo)
- Ver oportunidades sin actividad reciente (naranja)
- Ver próximas acciones (azul)
- Ver campañas activas

**2. Resolver seguimientos vencidos**
- Abrir cada contacto o oportunidad con seguimiento vencido
- Registrar la actividad realizada (llamada, mensaje, reunión)
- Actualizar el próximo paso y la fecha

**3. Revisar oportunidades activas**
- Ir a `/app/oportunidades`
- Verificar que cada oportunidad activa tenga próximo paso y fecha
- Avanzar de etapa si corresponde

**4. Actualizar empresas y contactos si hay nueva información**
- Registrar actividad comercial reciente
- Actualizar estado comercial si cambió
- Agregar notas relevantes

**5. Crear oportunidad si hay conversación comercial concreta**
- Abrir la empresa o el contacto desde donde nació la conversación
- Crear oportunidad con tipo (B2C, B2B, Reclutamiento)
- Asignar etapa inicial: `nueva` o `calificada`
- Definir próximo paso y fecha

**6. Usar Motor IA solo como apoyo**
- Desde la empresa u oportunidad, usar "Asistir con IA"
- O desde `/app/ia` para análisis por perfil
- Revisar el output antes de usarlo
- El Motor IA no envía mensajes ni decide

**7. Revisar compliance si hay mensajes a enviar**
- Ir a `/app/compliance`
- Pegar el mensaje antes de enviarlo
- Ajustar con la versión sugerida si hay riesgos

---

## 3. Flujo semanal recomendado — Dirección

Pantalla de inicio: `/app/direccion`

### Paso a paso

**1. Revisar métricas generales del equipo**
- Total oportunidades activas
- Total contactos
- Total empresas B2B
- Campañas activas

**2. Identificar alertas de foco**
- Oportunidades con seguimiento vencido
- Oportunidades sin próximo paso definido

**3. Revisar pipeline por etapa**
- Ver distribución del pipeline en `/app/oportunidades`
- Identificar cuellos de botella por etapa
- Detectar oportunidades estancadas

**4. Revisar campañas activas**
- Ver progreso: contactados / reuniones / cierres
- Detectar campañas sin actividad reciente
- Decidir si pausar, ajustar o finalizar

**5. Revisar Radar B2B**
- Ver empresas con potencial muy alto o alto
- Detectar empresas sin acción posterior
- Definir prioridades de contacto para la semana

**6. Definir acciones del equipo**
- Asignar empresas o contactos si hay desbalance
- Definir foco de campaña
- Comunicar prioridades

---

## 4. Flujo de carga de datos

El orden importa. Cargar datos fuera de secuencia reduce el valor del sistema.

### Secuencia correcta

```
1. Empresa (si es B2B)
2. Contacto asociado a la empresa
3. Oportunidad desde el contacto o la empresa
4. Próximo paso definido en la oportunidad
5. Fecha de seguimiento
6. Notas comerciales
7. Campaña asociada si aplica
8. Actividades registradas después de cada interacción
```

### Cuándo saltear pasos

- Si es B2C: se puede crear el contacto sin empresa.
- Si es reclutamiento: se puede crear la oportunidad con solo perfil y próximo paso.
- El Radar B2B puede crear la empresa directamente si se detecta potencial.

---

## 5. Flujo de oportunidades

### Etapas activas (en orden)

| Etapa | Descripción |
|---|---|
| `nueva` | Conversación recién identificada, sin calificación |
| `calificada` | Se verificó que hay potencial y contexto suficiente |
| `contactada` | Ya hubo contacto inicial con la persona |
| `reunion_agendada` | Reunión o diagnóstico programado |
| `diagnostico_realizado` | Se hizo diagnóstico de necesidades |
| `propuesta_conceptual` | Se presentó o está en preparación una propuesta |
| `validacion_plife` | En proceso de validación interna PLIFE |
| `seguimiento` | Activa en seguimiento regular |

### Etapas cerradas

| Etapa | Descripción |
|---|---|
| `cerrada_ganada` | Conversión exitosa |
| `cerrada_perdida` | Se perdió; registrar motivo |
| `dormida` | Sin actividad, no cerrada formalmente |

### Reglas de avance

- No hay restricción técnica para saltar etapas, pero el sistema registra la progresión.
- Cada avance de etapa debe reflejarse en un próximo paso actualizado.
- Las oportunidades en `seguimiento` sin fecha de próxima acción aparecen como alerta en `/app/hoy`.

---

## 6. Flujo de campañas

### Qué es una campaña

Una campaña en PLIFE Growth OS es un contenedor de acciones comerciales por segmento u objetivo. **No envía mensajes automáticamente.**

### Estados de campaña

| Estado | Significado |
|---|---|
| `borrador` | En preparación, aún no activa |
| `activa` | En ejecución, equipos operando sobre ella |
| `pausada` | Temporalmente detenida |
| `finalizada` | Completada, con métricas finales |
| `archivada` | Histórico, fuera de uso |

### Tipos de campaña disponibles

duenos_pymes · empresas_familiares · estudios_contables · estudios_juridicos · clinicas · empresas_tech · constructoras · clubes_asociaciones · profesionales_independientes · ejecutivos · reclutamiento_asesores · general

### Flujo operativo de una campaña

```
1. Crear campaña con objetivo, segmento y mensaje inicial (líderes / dirección)
2. Asociar empresas o contactos al segmento definido
3. Registrar actividades: llamadas, mensajes, reuniones
4. Actualizar métricas: contactados → reuniones → cierres
5. Convertir respuestas positivas en oportunidades
6. Finalizar o archivar cuando termine el ciclo
```

### Lo que la campaña no hace

- No envía mensajes ni emails automáticamente
- No crea oportunidades automáticamente
- No contacta personas por su cuenta
- No mide conversión sin que el asesor registre actividad

---

## 7. Flujo de Radar B2B

El Radar B2B detecta empresas con potencial comercial y ayuda a priorizarlas.

### Cómo funciona el score

El sistema calcula un score automático (0–100) por empresa basado en:
- **ICP (Ideal Customer Profile):** coincidencia con los segmentos prioritarios de PLIFE
- **Tamaño:** cantidad estimada de empleados
- **Completitud del perfil:** rubro, contacto ideal, ángulo comercial, oportunidad detectada
- **Estado comercial:** qué tan avanzado está el vínculo con la empresa

### Niveles de potencial

| Nivel | Score | Acción sugerida |
|---|---|---|
| Muy alto | 80–100 | Prioridad inmediata, crear oportunidad |
| Alto | 60–79 | Revisar esta semana |
| Medio | 40–59 | Mantener en seguimiento |
| Bajo | < 40 | Monitorear o descartar |

### ICP por score de relevancia para PLIFE

| Perfil | Score ICP |
|---|---|
| Clínicas / Salud | 25 |
| Estudios contables | 25 |
| Estudios jurídicos | 22 |
| Empresas tech | 20 |
| Socios / Directores | 18 |
| Dueños de pymes | 16 |
| Constructoras | 14 |
| Ejecutivos | 14 |
| Clubes y asociaciones | 12 |
| Reclutamiento de asesores | 10 |

### Flujo de uso del Radar

```
1. Entrar a /app/radar-b2b
2. Revisar empresas con potencial alto o muy alto
3. Expandir empresa para ver fortalezas, riesgos y próximo paso sugerido
4. Guardar el potencial sugerido si es correcto
5. Crear oportunidad desde el panel expandido
6. Ir a la empresa para asociar contacto si falta
7. Definir próximo paso en la oportunidad creada
```

### Estados comerciales de empresa

| Estado | Descripción |
|---|---|
| `detectada` | Recién cargada, sin análisis |
| `analizada` | Score evaluado, perfil completado |
| `priorizada` | Marcada como alta prioridad comercial |
| `asignada` | Asignada a un asesor específico |
| `contactada` | Ya se tomó contacto |
| `reunion_agendada` | Reunión programada con la empresa |
| `en_negociacion` | En proceso activo de negociación |
| `convertida` | Se generó negocio con esta empresa |
| `descartada` | Descartada del pipeline |

---

## 8. Flujo de Motor IA

El Motor IA de PLIFE genera apoyo comercial: resúmenes, sugerencias de seguimiento, preparación de reuniones y respuesta a objeciones.

### Desde dónde se usa

- Desde **empresa** → botón "Análisis IA" → genera lectura comercial de la empresa
- Desde **oportunidad** → botón "Asistir con IA" → prepara reunión, seguimiento u objeción
- Desde **contacto** → botón "Preparar con IA" → prepara contacto o mensaje de seguimiento
- Desde **/app/ia** → gestión de perfiles, prompts, ejecuciones y configuración

### Qué genera

- Preparación de contacto o reunión
- Sugerencias de próximo paso
- Mensajes de seguimiento (borradores para revisar)
- Resumen de notas e historial comercial
- Respuesta a objeciones comunes
- Lectura B2B de la empresa

### Lo que el Motor IA no hace

- No calcula primas
- No inventa coberturas ni condiciones de póliza
- No reemplaza condiciones oficiales MAPFRE
- No envía mensajes automáticamente
- No toma decisiones comerciales por el asesor
- No reemplaza al asesor

### Regla fundamental

> Todo output del Motor IA requiere revisión humana antes de usarse. El asesor es responsable de lo que envía o comunica.

---

## 9. Flujo de Compliance

El revisor de compliance detecta frases riesgosas en mensajes comerciales antes de que se envíen.

### Cuándo usarlo

- Antes de enviar cualquier mensaje que contenga referencias a coberturas, primas, rendimientos o promesas de protección
- Antes de usar texto generado por el Motor IA en una comunicación con el cliente
- Ante cualquier duda sobre si una frase puede ser interpretada como promesa o garantía

### Resultados posibles

| Resultado | Significado |
|---|---|
| `aprobado` | Sin frases riesgosas detectadas |
| `modificado` | Se sugiere versión alternativa más segura |
| `revision_requerida` | Hay riesgo, se recomienda revisar con supervisor |
| `bloqueado` | Frase crítica detectada, no usar sin ajuste |

### Lo que Compliance no hace

- No es una aprobación legal formal
- No reemplaza revisión de Compliance oficial de MAPFRE
- No garantiza que el mensaje sea correcto bajo cualquier normativa
- No exime al asesor de su responsabilidad

---

## 10. Datos mínimos para que el sistema funcione bien

| Dato | Por qué importa | Dónde se carga |
|---|---|---|
| Nombre de la empresa | Identifica el cliente B2B | `/app/empresas` → Nueva empresa |
| Rubro / industria | Permite calcular el score B2B e ICP | `/app/empresas` → Editar empresa |
| Cantidad de empleados | Factor clave del score de potencial | `/app/empresas` → Editar empresa |
| Contacto principal | Sin persona, no hay seguimiento posible | `/app/contactos` → Nuevo contacto |
| Email o teléfono del contacto | Canal de comunicación real | `/app/contactos` → Editar contacto |
| Oportunidad creada | Sin oportunidad, no hay pipeline | `/app/oportunidades` → Nueva oportunidad |
| Etapa de la oportunidad | Refleja el estado real de la conversación | `/app/oportunidades/[id]` → Etapa y cierre |
| Próximo paso | Mantiene la oportunidad activa y visible | `/app/oportunidades/[id]` → Seguimiento |
| Fecha de seguimiento | Sin fecha, el seguimiento no se alerta | `/app/oportunidades/[id]` → Seguimiento |
| Tipo de oportunidad (B2C/B2B) | Determina el flujo y la agrupación | Nueva oportunidad → Tipo |
| Notas comerciales | Contexto para IA y para el asesor | Empresa, contacto u oportunidad |
| Campaña asociada (si aplica) | Organiza el trabajo por segmento | Empresa o oportunidad → Campaña |
| Actividades registradas | Historial real de la relación comercial | Botón "Registrar actividad" en cada entidad |

---

## 11. Errores de uso a evitar

| Error | Por qué es problemático | Cómo evitarlo |
|---|---|---|
| Cargar contactos sin empresa | Pierde el contexto organizacional B2B; el Radar no puede incluirlos | Siempre crear empresa primero si es B2B |
| Crear oportunidades sin próximo paso | La oportunidad queda invisible en el tablero y se congela | Definir próximo paso al crear la oportunidad |
| Crear oportunidades sin fecha | El sistema no puede alertar al asesor | Siempre agregar fecha de seguimiento |
| Usar campañas como lista suelta | La campaña no genera valor sin actividad registrada | Registrar actividad por cada acción de campaña |
| Confiar en IA sin revisión humana | El Motor IA puede generar contenido que requiere ajuste | Siempre revisar el output antes de usarlo |
| Usar Compliance como aprobación legal | No es una autorización jurídica | Compliance es revisión preventiva, no aprobación |
| Dejar oportunidades en etapa `nueva` por semanas | Indica que no hubo avance; infla el pipeline artificialmente | Calificar o cerrar oportunidades sin movimiento |
| Marcar oportunidades como `dormida` sin investigar | Puede haber oportunidades rescatables | Revisar antes de dormir |
| Mezclar datos demo con datos reales | Contamina las métricas y el Radar | Limpiar datos demo antes de operar en producción |
| No registrar motivo de pérdida | Se pierde aprendizaje comercial | Siempre completar el campo "Motivo de pérdida" |
| Actualizar empresa sin actualizar estado comercial | El Radar calcula score dinámico, pero el estado comercial es manual | Actualizar `b2b_status` cuando cambia la relación |

---

## 12. Checklist de uso correcto

### Asesor — checklist diario

- [ ] Revisé seguimientos vencidos en `/app/hoy`
- [ ] Actualicé el próximo paso en oportunidades activas
- [ ] Registré las actividades de interacción del día
- [ ] Creé oportunidad si hubo conversación comercial concreta
- [ ] Definí próximo paso y fecha en cada oportunidad nueva
- [ ] Usé Motor IA solo como apoyo, con revisión del output
- [ ] Revisé en Compliance cualquier mensaje antes de enviarlo

### Asesor — checklist semanal

- [ ] Revisé si hay oportunidades estancadas en la misma etapa
- [ ] Actualicé el estado comercial de las empresas con movimiento
- [ ] Verifiqué que todos mis contactos tengan próxima acción definida
- [ ] Revisé el Radar B2B para detectar oportunidades sin acción
- [ ] Actualicé métricas de campañas activas en las que participo

### Dirección — checklist semanal

- [ ] Revisé métricas generales en `/app/direccion`
- [ ] Identifiqué oportunidades sin seguimiento o sin próximo paso
- [ ] Revisé distribución del pipeline por etapa
- [ ] Verifiqué progreso de campañas activas
- [ ] Revisé Radar B2B para empresas sin acción de equipo
- [ ] Definí prioridades de foco para la semana
- [ ] Comuniqué acciones al equipo

---

*Documento generado en FASE 13C — PLIFE Growth OS*
