# Flujo operativo básico — PLIFE Growth OS

## Qué hacer al entrar por primera vez

Si es la primera vez que usás el sistema o si aún no hay datos cargados, seguí este orden. El sistema está diseñado para que cada módulo tenga más valor cuando los anteriores ya tienen información.

---

## Orden recomendado

```
Empresa → Contacto → Oportunidad → Campaña → Seguimiento → Compliance → Dirección
```

| Paso | Módulo | Qué cargás | Por qué |
|------|--------|-----------|---------|
| 1 | Empresas | La empresa cliente o prospecto | Es la unidad base de toda la inteligencia comercial |
| 2 | Contactos | La persona de contacto dentro de la empresa | El asesor necesita saber a quién llamar |
| 3 | Oportunidades | La conversación comercial concreta | Permite hacer seguimiento del avance en el pipeline |
| 4 | Campañas | El conjunto de acciones para un segmento | Ordena el esfuerzo del equipo por segmento |
| 5 | Seguimiento | Próximo paso registrado en la oportunidad o contacto | Mantiene el pipeline activo |
| 6 | Compliance | El mensaje que vas a enviar antes de mandarlo | Evita compromisos regulatorios riesgosos |
| 7 | Dirección | Vista ejecutiva del equipo | Toma sentido cuando hay datos de oportunidades y campañas |

---

## Ejemplo práctico

**Situación**: querés trabajar en B2B con estudios contables.

1. **Crear empresa**: "Estudio Contable Pérez"
   - Rubro: Estudio contable
   - Empleados: 8
   - Ubicación: Montevideo
   - Estado B2B: Prospecto

2. **Crear contacto**: "Martín Pérez"
   - Cargo: Socio fundador
   - Empresa: Estudio Contable Pérez
   - Próximo seguimiento: llamada de presentación

3. **Crear oportunidad**: "Protección para socios del estudio"
   - Tipo: B2B
   - Empresa: Estudio Contable Pérez
   - Contacto: Martín Pérez
   - Etapa: Primer contacto

4. **Crear campaña**: "Estudios contables — protección grupal"
   - Segmento: Estudios contables de 5 a 20 personas
   - Mensaje de apertura: "Hola Martín, te contacto porque trabajamos con varios estudios en Montevideo..."
   - Objetivo: 10 reuniones en 60 días

5. **Revisar mensaje con Compliance**
   - Pegá el mensaje de apertura antes de enviarlo
   - El sistema detecta si contiene promesas de rentabilidad o comparaciones prohibidas

---

## Qué hace cada módulo

| Módulo | Función |
|--------|---------|
| **PLIFE Hoy** | Tablero diario con seguimientos vencidos, oportunidades calientes y agenda del asesor |
| **Radar B2B** | Ranking de empresas por potencial comercial calculado automáticamente |
| **Empresas** | Base de datos de empresas con oportunidades, contactos e inteligencia B2B |
| **Contactos** | Personas con las que trabaja el equipo, con historial de seguimiento |
| **Oportunidades** | Pipeline comercial: estado de cada conversación desde apertura hasta cierre |
| **Campañas** | Acciones comerciales organizadas por segmento con mensaje, guion y métricas |
| **Compliance** | Revisor de mensajes comerciales antes de enviarlos |
| **Copiloto IA** | Asistencia comercial con IA (se activa cuando PLIFE valida el flujo) |
| **Dirección** | Vista ejecutiva con KPIs, pipeline por etapa y actividad del equipo |

---

## Qué NO hacer

- **No arrancár por Dirección si no hay datos**: la vista ejecutiva muestra ceros y no sirve para tomar decisiones hasta que haya al menos 5 oportunidades cargadas.
- **No crear campañas sin segmento claro**: una campaña sin segmento definido no orienta al equipo. Definí siempre a quién va dirigida.
- **No usar Compliance como reemplazo del criterio humano**: el revisor detecta riesgos regulatorios, pero el asesor es quien decide si enviar o no el mensaje.
- **No saltar el orden**: cargar oportunidades antes de tener empresas y contactos hace que el pipeline sea difícil de gestionar.

---

## Diferencia entre demo mode y uso real

| | Demo mode | Uso real |
|---|---|---|
| **Datos** | Empresas, contactos y oportunidades de ejemplo | Datos reales del equipo comercial |
| **Recorrido** | `/app/demo` muestra 8 pasos para validar el flujo | No hace falta recorrido; el sistema se usa directamente |
| **Radar B2B** | Empresas demo con scores calculados | Empresas reales con score calculado en base a sus datos |
| **Compliance** | Funciona con datos reales de reglas de cumplimiento | Idem |
| **Copiloto IA** | Muestra que la IA no está configurada en demo | Se activa cuando PLIFE valida el flujo con IA real |
| **Dirección** | Métricas demo visibles | Métricas del equipo comercial real |

En demo mode, la tarjeta "¿Por dónde empiezo?" en `/app/hoy` muestra el flujo operativo como orientación. En uso real, esa tarjeta solo aparece si todavía no hay datos cargados.

---

## Próximos pasos después de cargar los primeros datos

1. Asignar el Radar B2B a los asesores para que prioricen sus llamadas.
2. Activar la primera campaña con segmento y mensaje definidos.
3. Revisar el pipeline semanal en la pantalla de Dirección.
4. Usar Compliance antes de cada campaña masiva de mensajes.
