# Guía de Validación con Usuario No Técnico — PLIFE Growth OS

## Objetivo

Verificar que una persona que no conoce el sistema pueda entrar, recorrerlo y entender qué hace, sin necesidad de explicación previa.

---

## Checklist antes de la sesión

Verificar antes de empezar:

- [ ] Usuario creado en Supabase con rol `asesor` o `admin`
- [ ] Contraseña actualizada y compartida con el evaluador
- [ ] Demo mode activo (`NEXT_PUBLIC_DEMO_MODE=true` en entorno)
- [ ] Datos demo cargados (empresas, oportunidades, contactos, campañas)
- [ ] Rutas principales funcionando: `/app/hoy`, `/app/radar-b2b`, `/app/compliance`, `/app/copiloto`, `/app/direccion`
- [ ] URL de staging o producción confirmada y accesible desde el dispositivo del evaluador

---

## URL del sistema

Usar el entorno de staging o producción. Pedir al responsable técnico la URL actualizada antes de comenzar.

Credenciales de demostración: solicitar al equipo de PLIFE antes de la sesión.

---

## Guion para el presentador

Decirle al evaluador exactamente esto — sin agregar contexto:

> "Entrá y recorré sin que yo te explique demasiado."
> "Decime en voz alta qué creés que hace cada pantalla."
> "Marcame dónde te perdés."

No mencionar:
- Para qué sirve cada módulo
- Qué hace el Radar B2B
- Qué es el Compliance
- Que hay IA involucrada
- Que hay datos de demo

---

## Recorrido sugerido

Dejar que la persona explore libremente primero (5 minutos). Luego, si no lo hizo sola, guiarla por este orden:

| # | Pantalla | URL | Qué observar |
|---|----------|-----|--------------|
| 1 | PLIFE Hoy | `/app/hoy` | ¿Entiende los contadores? ¿Ve el recorrido demo? |
| 2 | Radar B2B | `/app/radar-b2b` | ¿Entiende el ranking? ¿Sabe qué hacer con él? |
| 3 | Empresa priorizada | `/app/empresas/[demo]` | ¿Ve el ángulo comercial? ¿El próximo paso? |
| 4 | Oportunidades | `/app/oportunidades` | ¿Entiende el pipeline? ¿Sabe qué etapas hay? |
| 5 | Campañas | `/app/campanas` | ¿Entiende para qué sirve una campaña? |
| 6 | Compliance | `/app/compliance` | ¿Sabe qué revisar? ¿Prueba el ejemplo? |
| 7 | Copiloto IA | `/app/copiloto` | ¿Entiende que la IA no está activa en demo? |
| 8 | Dirección | `/app/direccion` | ¿Le sirve para tomar decisiones? |

---

## Qué NO explicar antes de que pruebe

- Para qué sirve cada número o contador
- Qué significa el score o potencial B2B
- Qué hace el compliance
- Por qué la IA dice que no está configurada
- Cuántos datos hay o de dónde vienen

---

## Preguntas para hacerle durante y después

Hacerlas en orden, con pausa entre cada una para que la persona piense:

1. ¿Qué creés que hace este sistema?
2. ¿Qué pantalla entendiste más rápido?
3. ¿Qué pantalla te confundió?
4. ¿Dónde ves valor para PLIFE?
5. ¿Qué parte mostrarías primero si tuvieras que convencer a alguien?
6. ¿Qué quitarías porque no lo entendiste o no lo usarías?
7. ¿Qué módulo te parece más importante?
8. ¿El Radar B2B se entiende? ¿Para qué sirve?
9. ¿El Compliance se entiende? ¿Qué harías con él?
10. ¿Te queda claro que la IA no reemplaza al asesor?

---

## Tabla de observación

Completar durante la sesión, pantalla por pantalla:

| Pantalla | Entendió | Dudas observadas | Frase textual del usuario | Acción correctiva |
|----------|----------|------------------|---------------------------|-------------------|
| PLIFE Hoy | sí / no / parcial | | | |
| Radar B2B | sí / no / parcial | | | |
| Empresa demo | sí / no / parcial | | | |
| Oportunidades | sí / no / parcial | | | |
| Campañas | sí / no / parcial | | | |
| Compliance | sí / no / parcial | | | |
| Copiloto IA | sí / no / parcial | | | |
| Dirección | sí / no / parcial | | | |

---

## Cómo anotar el feedback

Usar esta tabla para cada sesión:

```
Fecha:
Perfil del usuario (rol, experiencia comercial):

| Pregunta | Respuesta resumida | Observaciones |
|----------|--------------------|---------------|
| ¿Qué hace el sistema? | | |
| Pantalla más clara | | |
| Pantalla que confundió | | |
| Dónde ve valor | | |
| Qué mostraría primero | | |
| Qué quitaría | | |
| Módulo más importante | | |
| Radar B2B claro? | | |
| Compliance claro? | | |
| IA no reemplaza? | | |

Notas libres:
```

---

## Criterios de decisión tras la sesión

| Observación | Acción |
|-------------|--------|
| Entiende Radar B2B y puede describirlo sin ayuda | Mantener como está |
| No entiende Compliance o lo confunde con IA generativa | Reforzar copy: "revisá el mensaje antes de enviarlo" |
| Copiloto confunde o genera expectativas incorrectas sobre IA | Ocultar o agregar aclaración más prominente hasta activar IA real |
| Dirección comunica valor para tomar decisiones | Demo lista para mostrar a PLIFE |
| No puede describir el sistema en 2 frases | Revisar flujo del demo y onboarding |

---

## Criterios para decidir si la demo está clara

La demo está lista para mostrar si:

- [x] La persona entiende qué hace el sistema sin que se lo expliquen (pregunta 1)
- [x] Identifica al menos una pantalla "clara" espontáneamente (pregunta 2)
- [x] No menciona confusión con el Radar B2B o puede describirlo sin ayuda (pregunta 8)
- [x] Entiende que el Compliance ayuda a revisar mensajes (pregunta 9)
- [x] Queda claro que la IA apoya al asesor y no lo reemplaza (pregunta 10)
- [x] No pregunta "¿qué es esto?" ante los módulos principales

La demo **no está lista** si:

- [ ] La persona no puede describir qué hace el sistema en 2 frases
- [ ] Confunde la pantalla de Compliance con un sistema de IA generativa
- [ ] No entiende para qué sirve el Radar B2B
- [ ] Cree que la IA ya está generando contenido
- [ ] Pide explicación antes de poder usar cualquier pantalla

---

## Pendientes a validar en cada sesión

- ¿Los 8 pasos del recorrido demo se pueden seguir sin ayuda?
- ¿El mensaje "IA avanzada no configurada en esta demo" genera confianza o confusión?
- ¿El potencial B2B se entiende como prioridad comercial?
- ¿El pipeline de oportunidades comunica "estado del negocio"?
- ¿La pantalla de Dirección sirve para tomar decisiones reales?

---

## Próximos pasos tras la sesión

1. Anotar el feedback en el formulario de arriba.
2. Compartir con el equipo de producto (canal interno PLIFE).
3. Clasificar hallazgos en: **texto a mejorar / funcionalidad faltante / flujo confuso**.
4. Priorizar los cambios antes de la siguiente demo con cliente externo.
