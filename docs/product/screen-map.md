# Mapa de pantallas — PLIFE Growth OS

**Versión:** FASE 12H  
**Última actualización:** 2026-07-01

Documento de referencia para QA, Playwright y mejoras UX. Solo pantallas que existen hoy en la aplicación.

**Nota:** `/app/admin` (gestión de usuarios) existe pero no se detalla aquí; ver [role-matrix.md](./role-matrix.md). `/app/academia` existe en el menú; documentación futura.

---

## /app/hoy

| Campo | Detalle |
|-------|---------|
| **Ruta** | `/app/hoy` |
| **Nombre visible** | PLIFE Hoy (saludo personalizado + “Tu tablero de hoy”) |
| **Para qué sirve** | Tablero diario: qué atender hoy en ventas y seguimientos |
| **Usuario principal** | Asesor; Dirección/Admin ven vista ampliada del equipo |
| **Qué datos muestra** | Seguimientos vencidos, próximas acciones, oportunidades en etapa avanzada, empresas asignadas, campañas activas, agenda del día |
| **Acción principal** | Revisar seguimientos vencidos y entrar al detalle de cada ítem |
| **Acciones secundarias** | Links “Ver pipeline”, “Ver campañas”, “Nueva empresa”; bloque **¿Por dónde empiezo?**; CTA Copiloto (asesor) |
| **Sin datos** | Card **¿Por dónde empiezo?** con pasos 1–5; empty states con links a crear empresa/oportunidad |
| **Errores comunes a evitar** | Interpretar pantalla vacía como “sistema roto”; ignorar el onboarding |

---

## /app/demo

| Campo | Detalle |
|-------|---------|
| **Ruta** | `/app/demo` |
| **Nombre visible** | Recorrido demo (solo visible si `NEXT_PUBLIC_DEMO_MODE` está activo) |
| **Para qué sirve** | Guía paso a paso para mostrar el valor del sistema en presentaciones |
| **Usuario principal** | Facilitador de demo, dirección, admin |
| **Qué datos muestra** | Pasos ordenados del flujo comercial completo |
| **Acción principal** | Seguir el recorrido sugerido en orden |
| **Acciones secundarias** | Navegar a cada módulo desde los pasos |
| **Sin datos** | El recorrido igualmente orienta; conviene tener datos demo cargados |
| **Errores comunes a evitar** | Mostrar solo demo sin explicar uso real con datos propios |

---

## /app/empresas

| Campo | Detalle |
|-------|---------|
| **Ruta** | `/app/empresas` |
| **Nombre visible** | Empresas B2B |
| **Para qué sirve** | Listar y crear empresas prospecto o cliente |
| **Usuario principal** | Asesor, líder comercial |
| **Qué datos muestra** | Nombre, rubro, ciudad, potencial comercial, estado comercial; búsqueda y contador |
| **Acción principal** | **Nueva empresa** |
| **Acciones secundarias** | Buscar por empresa, rubro o ciudad; entrar al detalle |
| **Sin datos** | Empty state con ejemplo y botón **Nueva empresa** |
| **Errores comunes a evitar** | Crear oportunidades sin empresa base en flujos B2B |

---

## /app/empresas/[id]

| Campo | Detalle |
|-------|---------|
| **Ruta** | `/app/empresas/[id]` |
| **Nombre visible** | Nombre de la empresa + breadcrumb Empresas / … |
| **Para qué sirve** | Ver y gestionar una empresa: estado, contactos, oportunidades, inteligencia B2B |
| **Usuario principal** | Asesor asignado; líder/dirección para supervisión |
| **Qué datos muestra** | Resumen superior (rubro, ciudad, potencial, próximo paso, cantidad contactos/oportunidades), estado comercial, campaña, contactos, oportunidades, actividades, inteligencia B2B |
| **Acción principal** | **Acciones rápidas**: Agregar contacto, Crear oportunidad |
| **Acciones secundarias** | Editar, Registrar actividad, Ver oportunidades (pipeline filtrado), Revisar mensaje (Compliance), Ver campaña |
| **Sin datos parciales** | Cards de inteligencia con placeholders orientadores; contactos/oportunidades vacíos hasta que se carguen |
| **Errores comunes a evitar** | No definir próximo paso sugerido; no vincular contactos |

---

## /app/contactos

| Campo | Detalle |
|-------|---------|
| **Ruta** | `/app/contactos` |
| **Nombre visible** | Contactos |
| **Para qué sirve** | Listar personas con las que habla el asesor |
| **Usuario principal** | Asesor |
| **Qué datos muestra** | Nombre, cargo, empresa, estado, interés, teléfono, fecha de seguimiento; filtros por estado e interés |
| **Acción principal** | **Nuevo contacto** |
| **Acciones secundarias** | Buscar; filtrar; limpiar búsqueda/filtros; abrir detalle |
| **Sin datos** | Empty state con ejemplo y **Nuevo contacto** |
| **Errores comunes a evitar** | Contactos sin empresa en contexto B2B; no registrar próxima acción |

---

## /app/contactos/[id]

| Campo | Detalle |
|-------|---------|
| **Ruta** | `/app/contactos/[id]` |
| **Nombre visible** | Nombre del contacto + breadcrumb |
| **Para qué sirve** | Gestionar relación comercial con una persona |
| **Usuario principal** | Asesor |
| **Qué datos muestra** | Resumen (cargo, empresa, interés, próxima acción, email, teléfono), estado, datos de contacto, consentimiento, oportunidades, timeline de actividades |
| **Acción principal** | **Crear oportunidad** (acciones rápidas o header) |
| **Acciones secundarias** | Ver empresa asociada, Ver oportunidades, Compliance, Editar, Registrar actividad, Preparar con IA |
| **Sin empresa** | Acción “Ver empresa” no aparece; se puede editar y asociar empresa |
| **Errores comunes a evitar** | Olvidar fecha de seguimiento; enviar mensajes sin Compliance |

---

## /app/oportunidades

| Campo | Detalle |
|-------|---------|
| **Ruta** | `/app/oportunidades` |
| **Nombre visible** | Pipeline comercial |
| **Para qué sirve** | Ver y gestionar conversaciones comerciales por etapa |
| **Usuario principal** | Asesor; líder/dirección supervisan |
| **Qué datos muestra** | Columnas por etapa o lista; filtros tipo/riesgo; búsqueda; valor estimado total |
| **Acción principal** | **Nueva oportunidad** |
| **Acciones secundarias** | Cambiar vista Pipeline/Lista; buscar; filtrar; abrir detalle desde card |
| **Sin datos** | Empty state con guía y **Nueva oportunidad** |
| **Errores comunes a evitar** | Oportunidades sin próximo paso ni fecha; no mover etapas |

---

## /app/oportunidades/[id]

| Campo | Detalle |
|-------|---------|
| **Ruta** | `/app/oportunidades/[id]` |
| **Nombre visible** | Título de la oportunidad + breadcrumb |
| **Para qué sirve** | Gestionar una conversación comercial hasta el cierre |
| **Usuario principal** | Asesor asignado |
| **Qué datos muestra** | Resumen (etapa, empresa, contacto, próximo paso, valor, campaña), barra de progreso por etapa, responsable, potencial de cierre, timeline |
| **Acción principal** | Definir o guardar **próximo paso** y fecha |
| **Acciones secundarias** | Ver empresa, Ver contacto, Ver campaña, Compliance, Ir al pipeline, Mover etapa, Ganada/Perdida, Registrar actividad |
| **Sin actividades** | Timeline vacío con mensaje claro |
| **Errores comunes a evitar** | Cerrar sin motivo de pérdida; no actualizar etapa tras reunión |

---

## /app/campanas

| Campo | Detalle |
|-------|---------|
| **Ruta** | `/app/campanas` |
| **Nombre visible** | Campañas B2B |
| **Para qué sirve** | Ver campañas por segmento y su desempeño |
| **Usuario principal** | Líder comercial, dirección, admin (crear); asesor (ver) |
| **Qué datos muestra** | Campañas activas y otras; métricas Objetivo, Contactados, Reuniones, Cierres; búsqueda y filtro por estado |
| **Acción principal** | **Nueva campaña** (si `canManage`: admin, dirección, líder_comercial) |
| **Acciones secundarias** | Buscar; filtrar; abrir detalle |
| **Sin datos** | Empty state; si sin permiso, mensaje de que gestionan líderes comerciales |
| **Errores comunes a evitar** | Campaña sin objetivo ni mensaje inicial; asesor frustrado por no poder crear (esperado) |

---

## /app/campanas/[id]

| Campo | Detalle |
|-------|---------|
| **Ruta** | `/app/campanas/[id]` |
| **Nombre visible** | Nombre de la campaña + breadcrumb |
| **Para qué sirve** | Ver estrategia, mensajes y empresas/oportunidades vinculadas |
| **Usuario principal** | Líder comercial, dirección |
| **Qué datos muestra** | Resumen (segmento, objetivo, estado, empresas/oportunidades asociadas), métricas, mensaje inicial, guion, objeciones, empresas y oportunidades ligadas |
| **Acción principal** | Revisar estrategia y métricas |
| **Acciones secundarias** | Ver oportunidades, Compliance, Volver a campañas, Editar (si admin del rol) |
| **Sin empresas/oportunidades** | Hints explicativos en cards laterales |
| **Errores comunes a evitar** | Campaña desconectada del pipeline (sin opps vinculadas) |

---

## /app/radar-b2b

| Campo | Detalle |
|-------|---------|
| **Ruta** | `/app/radar-b2b` |
| **Nombre visible** | Radar B2B |
| **Para qué sirve** | Priorizar empresas por potencial comercial antes de contactar |
| **Usuario principal** | Asesor, líder comercial, dirección |
| **Qué datos muestra** | Ranking por potencial, perfil de cliente, filtros, análisis expandible (fortalezas, riesgos, próximo paso) |
| **Acción principal** | Revisar empresas de alto potencial y definir próximo paso |
| **Acciones secundarias** | **Nueva empresa**, **Nueva oportunidad** por fila, Guardar potencial sugerido, expandir Análisis |
| **Sin datos** | Empty state + **Nueva empresa**; mensaje de que el radar necesita empresas cargadas |
| **Errores comunes a evitar** | Jerga ICP sin contexto; esperar magia sin datos de rubro/tamaño |

---

## /app/compliance

| Campo | Detalle |
|-------|---------|
| **Ruta** | `/app/compliance` |
| **Nombre visible** | Compliance Comercial |
| **Para qué sirve** | Revisar mensajes comerciales antes de enviarlos al cliente |
| **Usuario principal** | Todos los roles comerciales |
| **Qué datos muestra** | Revisor de mensajes, reglas críticas, revisiones recientes, historial IA |
| **Acción principal** | **Revisar mensaje** |
| **Acciones secundarias** | Probar mensaje riesgoso de ejemplo; ver historial IA; Ir al revisor desde historial vacío |
| **Sin revisiones** | Mensaje “Sin revisiones aún”; revisor sigue funcionando |
| **Errores comunes a evitar** | Enviar promesas de cobertura sin revisar; asumir aprobación automática de venta |

---

## /app/copiloto

| Campo | Detalle |
|-------|---------|
| **Ruta** | `/app/copiloto` |
| **Nombre visible** | Copiloto del Asesor |
| **Para qué sirve** | Asistencia para preparar contactos, objeciones y próximos pasos (con IA si está configurada) |
| **Usuario principal** | Asesor |
| **Qué datos muestra** | Selector de tipo de ayuda, contacto/empresa/oportunidad/campaña, ejemplos de prompt, panel de resultado |
| **Acción principal** | **Generar sugerencia** (si IA configurada) |
| **Acciones secundarias** | Usar chips de ejemplo; guardar como actividad (si hay entidad vinculada) |
| **IA desactivada** | Aviso claro; botón deshabilitado con texto “IA no configurada”; **no es error del sistema** |
| **Errores comunes a evitar** | Decir que “el sistema no funciona”; prometer cotizaciones automáticas |

---

## /app/conocimiento

| Campo | Detalle |
|-------|---------|
| **Ruta** | `/app/conocimiento` |
| **Nombre visible** | Base de Conocimiento |
| **Para qué sirve** | Consultar documentos validados (guiones, FAQ, producto) |
| **Usuario principal** | Asesor (lectura); admin/compliance/capacitacion (gestión) |
| **Qué datos muestra** | Lista de documentos, estados, búsqueda por texto o inteligente (si embeddings activos), stats de fragmentos |
| **Acción principal** | Buscar contenido |
| **Acciones secundarias** | Ver documento; Agregar documento (roles con permiso); Activar/Indexar |
| **Sin documentos** | Empty state; aviso si no hay base validada |
| **Errores comunes a evitar** | Mostrar mensajes técnicos de API keys al usuario final |

---

## /app/direccion

| Campo | Detalle |
|-------|---------|
| **Ruta** | `/app/direccion` |
| **Nombre visible** | Dirección |
| **Para qué sirve** | Vista ejecutiva del pipeline y actividad del equipo |
| **Usuario principal** | Dirección, admin (`direccion`, `admin`); otros roles redirigen a Hoy |
| **Qué datos muestra** | KPIs, distribución del pipeline, actividad reciente, top oportunidades B2B |
| **Acción principal** | Revisar distribución del pipeline y foco comercial |
| **Acciones secundarias** | Link a pipeline completo; entrar a oportunidades destacadas |
| **Sin datos** | Métricas en cero; **pendiente futuro:** GettingStartedCard cuando métricas = 0 |
| **Errores comunes a evitar** | Usar Dirección para carga operativa diaria (eso es del asesor) |

---

## /app/admin/system

| Campo | Detalle |
|-------|---------|
| **Ruta** | `/app/admin/system` |
| **Nombre visible** | Estado del sistema |
| **Para qué sirve** | Diagnóstico técnico y salud del sistema para administración |
| **Usuario principal** | Admin, dirección |
| **Qué datos muestra** | Información de entorno, revisiones compliance recientes, métricas técnicas (lenguaje técnico permitido aquí) |
| **Acción principal** | Verificar estado antes/después de deploy |
| **Acciones secundarias** | Revisar últimas revisiones compliance |
| **Sin acceso** | Usuario sin rol redirige a Hoy |
| **Errores comunes a evitar** | Mostrar esta pantalla en demo comercial a cliente final; exponer secrets en pantalla |

---

## Referencias

- [acceptance-criteria.md](./acceptance-criteria.md)  
- [qa-test-cases.md](./qa-test-cases.md)  
- [user-manual.md](./user-manual.md)
