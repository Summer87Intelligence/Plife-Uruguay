# Criterios de aceptación — PLIFE Growth OS

**Versión:** FASE 12H  
**Última actualización:** 2026-07-01

Define cuándo el sistema está listo para ser mostrado internamente o en demo controlada.

---

## 1. Criterios generales

| # | Criterio | Cómo validar |
|---|----------|--------------|
| G-01 | **Login funciona** | Usuario activo ingresa con email/contraseña y llega a `/app/hoy` |
| G-02 | **No hay 404/500** en rutas principales del menú | Recorrer sidebar completo; ninguna ruta da error de servidor |
| G-03 | **Menú navega correctamente** | Cada ítem del sidebar abre la pantalla esperada; item activo resaltado |
| G-04 | **Usuario entiende por dónde empezar** | En entorno vacío o nuevo, aparece **¿Por dónde empiezo?** o empty states con CTA claro |
| G-05 | **Datos demo cargan** si demo mode está activo | `NEXT_PUBLIC_DEMO_MODE=true` muestra “Recorrido demo” y datos de ejemplo visibles |
| G-06 | **No aparecen mensajes técnicos** fuera de Admin | Sin referencias a API keys, SQL, RLS, embeddings, stack traces en pantallas comerciales |
| G-07 | **Sesión protegida** | Sin login, `/app/*` redirige a `/login` |
| G-08 | **Roles respetados** | Asesor no accede a Dirección ni Admin; dirección no accede a Admin de usuarios |

---

## 2. Criterios por módulo

### PLIFE Hoy

| # | Criterio | Listo cuando… |
|---|----------|---------------|
| H-01 | Muestra resumen comercial | Cards de seguimientos, oportunidades, empresas o campañas según datos |
| H-02 | Muestra **¿Por dónde empiezo?** si corresponde | Visible cuando no hay empresas ni oportunidades (o según lógica actual) |
| H-03 | Permite navegar a primeras acciones | Links a crear empresa, oportunidad, pipeline funcionan |

### Empresas

| # | Criterio | Listo cuando… |
|---|----------|---------------|
| E-01 | Lista empresas | Tabla/cards con nombre, rubro, potencial, estado |
| E-02 | Permite crear empresa | Formulario guarda con nombre obligatorio |
| E-03 | Empty state útil | Mensaje + botón **Nueva empresa** si no hay registros |
| E-04 | Permite ir a detalle | Click en fila/card abre `/app/empresas/[id]` con resumen y acciones rápidas |

### Contactos

| # | Criterio | Listo cuando… |
|---|----------|---------------|
| C-01 | Lista contactos | Nombre, empresa, estado, interés visibles |
| C-02 | Permite crear contacto | Formulario guarda con validación de email |
| C-03 | Puede asociarse a empresa | Selector de empresa disponible si existen empresas |
| C-04 | Post-creación orienta | Panel de éxito sugiere crear oportunidad o volver al listado |

### Oportunidades

| # | Criterio | Listo cuando… |
|---|----------|---------------|
| O-01 | Muestra pipeline o lista | Vista Pipeline y Lista intercambiables |
| O-02 | Permite crear oportunidad | Formulario con título y empresa; guarda correctamente |
| O-03 | Tiene etapa y próximo paso | Etapa visible en card/detalle; campo próximo paso editable |
| O-04 | Búsqueda y filtros | `?q=` y filtros no rompen la vista |

### Campañas

| # | Criterio | Listo cuando… |
|---|----------|---------------|
| CA-01 | Muestra campañas | Listado con segmento, objetivo, métricas |
| CA-02 | Crear según permisos | Botón **Nueva campaña** solo para admin/dirección/líder_comercial |
| CA-03 | Explica segmento/objetivo | Detalle muestra mensaje inicial, guion, objeciones |
| CA-04 | Asesor puede ver | Asesor ve campañas sin botón crear (comportamiento esperado) |

### Radar B2B

| # | Criterio | Listo cuando… |
|---|----------|---------------|
| R-01 | Muestra empresas o empty state | Ranking con potencial o mensaje de carga inicial |
| R-02 | Explica potencial comercial | Labels en español claro; sin jerga ICP/score cruda |
| R-03 | No usa jerga técnica | Sin términos de ML, embeddings ni API en UI |
| R-04 | Acciones desde fila | Crear oportunidad / nueva empresa desde radar funciona |

### Compliance

| # | Criterio | Listo cuando… |
|---|----------|---------------|
| CO-01 | Permite revisar mensaje | Textarea + botón revisar responde con resultado |
| CO-02 | Detecta mensaje riesgoso | Frases con promesas absolutas o cobertura total marcan riesgo |
| CO-03 | No promete aprobación automática | Copy indica revisión, no garantía de venta |
| CO-04 | Mensaje seguro pasa | Texto neutro recibe resultado favorable o sin alertas críticas |

### Copiloto

| # | Criterio | Listo cuando… |
|---|----------|---------------|
| CP-01 | Carga sin error | Pantalla renderiza; no 500 |
| CP-02 | IA desactivada se entiende | Aviso claro; botón deshabilitado; no parece bug |
| CP-03 | Ejemplos de prompt visibles | Chips de ejemplo cargan en textarea |
| CP-04 | Vinculación a entidad | Selector contacto/empresa/oportunidad/campaña funciona |

### Conocimiento

| # | Criterio | Listo cuando… |
|---|----------|---------------|
| K-01 | Carga sin error | Listado o empty state renderiza |
| K-02 | Búsqueda no rompe | Buscar con y sin resultados no da error |
| K-03 | Empty state claro | Sin documentos: mensaje orientador |
| K-04 | Permisos de gestión | Solo roles autorizados ven “Agregar documento” |

### Dirección

| # | Criterio | Listo cuando… |
|---|----------|---------------|
| D-01 | Vista ejecutiva carga | KPIs y distribución pipeline visibles para rol dirección |
| D-02 | Empty state útil | Con datos en cero, métricas muestran 0 sin error |
| D-03 | Acceso restringido | Asesor redirige a Hoy al intentar entrar |

### Admin / System

| # | Criterio | Listo cuando… |
|---|----------|---------------|
| A-01 | Carga para admin/dirección | `/app/admin/system` accesible con rol correcto |
| A-02 | Puede mostrar lenguaje técnico | Términos técnicos permitidos solo aquí (y `/app/admin`) |
| A-03 | No expone secrets | Variables sensibles no visibles en pantalla |
| A-04 | Admin usuarios separado | `/app/admin` solo para rol `admin` |

---

## 3. Criterios de NO GO

**No mostrar ni hacer push a producción si ocurre cualquiera de estos:**

| # | Bloqueante | Severidad |
|---|------------|-----------|
| NG-01 | Login falla para usuario activo conocido | Crítica |
| NG-02 | Dashboard `/app/hoy` no carga (pantalla en blanco o 500) | Crítica |
| NG-03 | Rutas principales del menú dan 404 o 500 | Crítica |
| NG-04 | Formularios principales no guardan (empresa, contacto, oportunidad) | Crítica |
| NG-05 | Compliance no detecta mensaje claramente riesgoso de prueba | Alta |
| NG-06 | Aparecen credenciales o variables `.env` en pantalla | Crítica |
| NG-07 | Playwright falla por bug real de regresión (no flaky test) | Alta |
| NG-08 | Mensajes técnicos visibles en pantallas comerciales | Alta |
| NG-09 | Asesor accede a pantallas de admin sin restricción | Crítica |
| NG-10 | Pérdida de datos al crear entidad (guarda pero no aparece en listado) | Crítica |

---

## 4. Checklist rápido pre-demo

- [ ] Login OK
- [ ] Recorrido menú completo sin 404/500
- [ ] Crear empresa → contacto → oportunidad (flujo mínimo)
- [ ] Compliance detecta mensaje riesgoso
- [ ] Copiloto explica IA desactivada (si aplica)
- [ ] Dirección carga para rol dirección
- [ ] Admin/system carga para admin
- [ ] Playwright manual walkthrough pasa (pendiente validación Sprint A)

---

## Referencias

- [qa-test-cases.md](./qa-test-cases.md)  
- [qa-before-demo.md](./qa-before-demo.md)  
- [screen-map.md](./screen-map.md)
