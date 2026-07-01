# Guion interno de demo — PLIFE Growth OS

**Versión:** FASE 12H  
**Última actualización:** 2026-07-01

**Importante:** Este NO es el guion comercial final para PLIFE. Es un guion interno para probar y mostrar el sistema de forma ordenada antes de presentaciones externas.

**Duración sugerida:** 10–15 minutos  
**Audiencia:** Equipo interno, dirección, stakeholders técnicos  
**Pre-requisitos:** Ver [qa-before-demo.md](./qa-before-demo.md); datos demo o entorno con sufijo `QA`

---

## Antes de empezar

- [ ] Login probado
- [ ] Navegador en ventana amplia (o probar mobile al final con RESP-001)
- [ ] Saber si demo mode está activo (`Recorrido demo` en menú)
- [ ] Saber si IA del copiloto está activa o desactivada (ambos son válidos)
- [ ] Tener a mano mensaje riesgoso y seguro para Compliance

---

## 1. Login (~1 min)

**Ruta:** `/login` → `/app/hoy`

**Qué decir:**
> “Este es un sistema interno para ordenar oportunidades comerciales y priorizar acciones. No reemplaza al asesor: le da estructura para vender mejor en B2B.”

**Qué mostrar:**
- Pantalla de login limpia
- Ingreso con usuario de prueba
- Llegada al tablero Hoy

**Observar:**
- ¿Carga rápido?
- ¿Aparece el nombre del usuario?
- ¿Sidebar completo según rol?

---

## 2. PLIFE Hoy (~2 min)

**Ruta:** `/app/hoy`

**Qué mostrar:**
- Saludo y resumen del día
- Seguimientos vencidos o próximas acciones (si hay datos)
- Bloque **¿Por dónde empiezo?** (si entorno vacío o nuevo)
- Links a pipeline y campañas

**Qué decir:**
> “Acá el asesor ve qué atender hoy. Si el sistema está vacío, le dice por dónde empezar en lugar de dejarlo perdido.”

**Observar:**
- ¿Los números tienen sentido?
- ¿Los links llevan al lugar correcto?

---

## 3. Empresas (~2 min)

**Ruta:** `/app/empresas` → crear o abrir detalle

**Qué mostrar:**
- Listado con búsqueda
- **Nueva empresa** (o empresa existente `Estudio Contable Pérez QA`)
- Detalle con resumen, acciones rápidas, contactos y oportunidades vinculadas

**Qué decir:**
> “Toda conversación B2B arranca con una empresa. Acá cargamos el contexto: rubro, ciudad, potencial y próximo paso.”

**Observar:**
- Empty state si no hay datos
- Panel de éxito post-creación con próximos pasos
- Breadcrumb y “Volver a empresas”

---

## 4. Contactos (~1,5 min)

**Ruta:** `/app/contactos` → detalle o crear

**Qué mostrar:**
- Contacto asociado a empresa (ej. `Martín Pérez QA`)
- Campos de seguimiento e interés
- Acción rápida **Crear oportunidad**

**Qué decir:**
> “El contacto es la persona. Siempre conviene vincularlo a una empresa para no perder el contexto B2B.”

**Observar:**
- Filtros por estado e interés
- Link a empresa desde detalle

---

## 5. Oportunidades (~2 min)

**Ruta:** `/app/oportunidades` → pipeline → detalle

**Qué mostrar:**
- Vista Pipeline por etapas
- Cambio a Lista (opcional)
- Oportunidad con título, empresa, etapa, próximo paso
- Barra de progreso en detalle

**Qué decir:**
> “Acá vive el pipeline comercial. Cada oportunidad tiene etapa y próximo paso para que nada quede en el aire.”

**Observar:**
- Búsqueda `?q=` si hay muchas opps
- Mover etapa / marcar ganada-perdida (si aplica en demo)

---

## 6. Campañas (~1 min)

**Ruta:** `/app/campanas` → detalle si existe

**Qué mostrar:**
- Campañas por segmento y objetivo
- Métricas: objetivo, contactados, reuniones, cierres
- Mensaje inicial y guion en detalle

**Qué decir:**
> “Las campañas agrupan acciones por segmento. El asesor ve en qué campaña está cada empresa u oportunidad.”

**Observar:**
- Si el rol demo no puede crear campaña, explicar que es por permisos (esperado)
- Empty state si no hay campañas

---

## 7. Radar B2B (~1,5 min)

**Ruta:** `/app/radar-b2b`

**Qué mostrar:**
- Ranking por potencial comercial
- Análisis expandible (fortalezas, riesgos, próximo paso sugerido)
- Acción crear oportunidad desde fila

**Qué decir:**
> “Antes de contactar en frío, el radar ayuda a priorizar por potencial. No es magia: necesita empresas cargadas con buen dato.”

**Observar:**
- Sin jerga ICP/score en pantalla
- Empty state con CTA si no hay empresas

---

## 8. Compliance (~1,5 min)

**Ruta:** `/app/compliance`

**Qué mostrar:**
1. Mensaje **riesgoso**: “Garantizamos cobertura total sin exclusiones…”
2. Mensaje **seguro**: invitación a reunión neutra
3. Reglas críticas visibles

**Qué decir:**
> “Antes de enviar un mensaje al cliente, lo revisamos acá. Detecta promesas riesgosas. No aprueba la venta automáticamente: es una ayuda para el asesor.”

**Observar:**
- Diferencia clara entre riesgoso y seguro
- Historial de revisiones (vacío o con datos)

---

## 9. Copiloto (~1 min)

**Ruta:** `/app/copiloto`

**Qué decir:**
> “IA avanzada puede estar desactivada en demo; eso es una decisión de control, no un fallo del sistema. Cuando está activa, ayuda a preparar conversaciones. El asesor siempre decide qué enviar.”

**Qué mostrar:**
- Selector de tipo de ayuda
- Chips de ejemplo
- Aviso si IA no configurada (botón deshabilitado)

**Observar:**
- No decir “está roto” si IA está off
- No prometer cotizaciones automáticas

---

## 10. Dirección (~1 min)

**Ruta:** `/app/direccion` *(requiere rol dirección o admin)*

**Qué mostrar:**
- KPIs del pipeline
- Distribución por etapa
- Top oportunidades B2B

**Qué decir:**
> “Para dirección: vista ejecutiva del negocio. No es para cargar datos; es para ver foco y distribución del pipeline.”

**Observar:**
- Métricas en cero sin error si no hay datos
- Asesor no debería ver esta pantalla (redirige a Hoy)

---

## 11. Cierre (~1 min)

**Frase de cierre:**
> “El sistema no reemplaza al asesor. Ordena, prioriza y ayuda a tomar mejores decisiones comerciales.”

**Opcional mostrar:**
- `/app/demo` si demo mode activo (recorrido guiado)
- `/app/admin/system` solo si audiencia es técnica/admin

---

## Qué NO decir

| Evitar | Por qué |
|--------|---------|
| “La IA cierra ventas por vos” | Falso; rompe confianza |
| “Garantiza más cierres” | Promesa comercial no respaldada |
| “Ya está integrado con WhatsApp” | Futuro / no existe |
| “El sistema está roto” (copiloto sin IA) | Es configuración intencional |
| Mostrar API keys, .env o pantalla admin a cliente final | Riesgo de seguridad y confusión |
| “Esto es solo un prototipo” | Si estamos en demo interna seria, mina credibilidad |
| Jerga: embeddings, RLS, prompts, SQL | Audiencia comercial no la necesita |

---

## Qué observar durante la demo

1. **Fluidez** — ¿Hay pantallas que tardan o parpadean?
2. **Copy** — ¿Se entiende sin explicación técnica?
3. **Empty states** — ¿Orientan o confunden?
4. **Navegación** — ¿Breadcrumbs y “Volver a…” funcionan?
5. **Post-creación** — ¿El panel de éxito lleva al siguiente paso lógico?
6. **Permisos** — ¿Cada rol ve lo que debe ver?
7. **Mobile** — Si hay tiempo, probar menú en viewport chico
8. **Errores** — ¿Aparece algún 404, 500 o mensaje técnico?

---

## Preguntas para quien mira

Al final de la demo, pedir feedback con estas preguntas:

1. **¿Entendiste por dónde empezarías si fueras asesor nuevo?**
2. **¿El flujo empresa → contacto → oportunidad te parece natural?**
3. **¿Compliance te da confianza o te parece burocracia?**
4. **¿Qué pantalla te costó más entender y por qué?**
5. **¿Falta algún dato o acción que hoy harías en Excel/WhatsApp?**
6. **¿El copiloto lo usarías? ¿Con IA off te molesta o te parece bien?**
7. **¿La vista de Dirección te sirve para decidir o le falta algo?**
8. **¿Algo te hizo pensar que el sistema está roto cuando no lo está?**

Registrar respuestas en [feedback-log-template.md](./feedback-log-template.md).

---

## Variantes de demo

| Duración | Incluir | Omitir |
|----------|---------|--------|
| **5 min (express)** | Login, Hoy, Empresas, Oportunidades, Compliance | Radar, Campañas, Copiloto, Dirección |
| **10 min (estándar)** | Flujo completo sin Admin | Admin/system |
| **15 min (completa)** | Todo + mobile + preguntas | — |

---

## Después de la demo

- [ ] Anotar bugs reales en [known-issues.md](./known-issues.md)
- [ ] Actualizar feedback log
- [ ] Si hay regresión: no hacer push hasta Playwright OK (Sprint A)
- [ ] Limpiar datos `QA` si se crearon en vivo (ver [data-cleanup-guide.md](./data-cleanup-guide.md))

---

## Referencias

- [screen-map.md](./screen-map.md)  
- [acceptance-criteria.md](./acceptance-criteria.md)  
- [qa-test-cases.md](./qa-test-cases.md)  
- [copy-style-guide.md](./copy-style-guide.md)
