# QA antes de mostrar el sistema

**Versión:** FASE 12F  
**Objetivo:** validar manualmente que PLIFE Growth OS está listo para una demo o sesión con usuario real.

---

## Comandos automáticos (desarrollo)

Ejecutar en el proyecto antes de promover o mostrar una versión nueva:

```bash
npm run type-check
npm run build
npm run test:unit
npm run test:e2e
npm run test:e2e:manual:system
```

| Comando | Qué valida |
|---------|------------|
| `npm run type-check` | Tipos TypeScript sin errores |
| `npm run build` | Build de producción Next.js |
| `npm run test:unit` | Tests unitarios (Vitest) |
| `npm run test:e2e` | Suite E2E Playwright |
| `npm run test:e2e:manual:system` | Recorrido visual manual del sistema (abre navegador) |

**Nota:** el test visual manual (`manual-system-walkthrough`) puede **crear datos con sufijo QA** (empresa, contacto, oportunidad, campaña). Revisar y limpiar si ensucian la demo.

**Estado conocido (FASE 12D + 12E):** type-check, build y unit tests OK en desarrollo; validación Playwright completa pendiente con Claude antes de push.

---

## Checklist manual por pantalla

Marcar cada ítem antes de la demo. Para cada pantalla: qué validar, qué error buscar, resultado esperado.

### 1. Login (`/login`)

| | |
|---|---|
| **Qué validar** | Ingreso con usuario y contraseña válidos |
| **Qué error buscar** | “Invalid login”, pantalla en blanco, redirect infinito |
| **Resultado esperado** | Redirige a `/app/hoy` |

---

### 2. PLIFE Hoy (`/app/hoy`)

| | |
|---|---|
| **Qué validar** | Saludo, métricas del día, bloques de seguimientos y oportunidades |
| **Qué error buscar** | Pantalla vacía sin explicación, errores 500 |
| **Resultado esperado** | Tablero útil; si no hay datos, aparece “¿Por dónde empiezo?” |

---

### 3. ¿Por dónde empiezo?

| | |
|---|---|
| **Qué validar** | Card visible en Hoy con pasos 1–5 y links |
| **Qué error buscar** | Links rotos, textos ilegibles |
| **Resultado esperado** | Cada paso navega a la sección correcta |

---

### 4. Empresas (`/app/empresas`)

| | |
|---|---|
| **Qué validar** | Lista, búsqueda, botón **Nueva empresa**, formulario y detalle |
| **Qué error buscar** | Formulario sin guardar, sin mensaje de error visible |
| **Resultado esperado** | Crear empresa → panel “Siguiente paso: agregar contacto” |

---

### 5. Contactos (`/app/contactos`)

| | |
|---|---|
| **Qué validar** | Lista, búsqueda por nombre/empresa/cargo, **Nuevo contacto**, selector de empresa |
| **Qué error buscar** | Contacto sin poder asociar empresa |
| **Resultado esperado** | Crear contacto → sugerencia de crear oportunidad |

---

### 6. Oportunidades (`/app/oportunidades`)

| | |
|---|---|
| **Qué validar** | Vista pipeline y lista, filtros, **Nueva oportunidad**, búsqueda |
| **Qué error buscar** | Columnas pipeline rotas en móvil, cards sin link al detalle |
| **Resultado esperado** | Oportunidad visible en etapa correcta; detalle con acciones rápidas |

---

### 7. Campañas (`/app/campanas`)

| | |
|---|---|
| **Qué validar** | Lista, métricas, detalle de campaña (si hay datos) |
| **Qué error buscar** | Usuario sin permiso sin mensaje explicativo |
| **Resultado esperado** | Campañas activas visibles; creación solo si el rol lo permite |

---

### 8. Radar B2B (`/app/radar-b2b`)

| | |
|---|---|
| **Qué validar** | Ranking por potencial, filtros, expandir análisis, **Nueva empresa** |
| **Qué error buscar** | Lista vacía sin CTA |
| **Resultado esperado** | Empresas ordenadas; próximo paso visible al expandir |

---

### 9. Compliance (`/app/compliance`)

| | |
|---|---|
| **Qué validar** | Pegar mensaje, **Revisar mensaje**, resultado con nivel de riesgo |
| **Qué error buscar** | Revisor que no responde, error sin texto claro |
| **Resultado esperado** | Resultado aprobado o con problemas detectados y sugerencia |

---

### 10. Copiloto IA (`/app/copiloto`)

| | |
|---|---|
| **Qué validar** | Formulario, aviso si IA no configurada, ejemplos de prompt |
| **Qué error buscar** | Pantalla que parece “rota” sin explicación |
| **Resultado esperado** | Mensaje claro: IA opcional; resto del sistema funciona |

---

### 11. Conocimiento (`/app/conocimiento`)

| | |
|---|---|
| **Qué validar** | Lista de documentos, búsqueda, estados activo/inactivo |
| **Qué error buscar** | Jerga técnica sin contexto para usuario final |
| **Resultado esperado** | Documentos visibles; búsqueda devuelve resultados o mensaje claro |

---

### 12. Dirección (`/app/direccion`)

| | |
|---|---|
| **Qué validar** | KPIs, pipeline del equipo, actividad reciente (rol dirección/admin) |
| **Qué error buscar** | Acceso denegado sin redirect claro para asesor |
| **Resultado esperado** | Vista ejecutiva coherente con datos cargados |

---

### 13. Admin / System (`/app/admin`, `/app/admin/system`)

| | |
|---|---|
| **Qué validar** | Acceso solo admin, listado de usuarios o configuración |
| **Qué error buscar** | Secrets visibles en pantalla |
| **Resultado esperado** | Panel administrativo sin exponer credenciales |

---

## Navegación entre entidades (FASE 12E)

Validar en detalle de empresa, contacto y oportunidad:

- [ ] Breadcrumb visible (ej.: Empresas / Nombre)
- [ ] **Volver a …** con texto claro
- [ ] Bloque **Acciones rápidas** con links útiles
- [ ] Resumen superior con datos clave (etapa, próximo paso, potencial)
- [ ] Link a Compliance desde acciones rápidas

---

## Criterio GO / NO-GO para demo

**GO** si:

- Login y rutas principales OK
- Al menos un flujo empresa → contacto → oportunidad demostrable
- Compliance responde
- No hay 500 en pantallas clave
- `type-check` y `build` OK en la rama a mostrar

**NO-GO** si:

- Login falla
- Error 500 en Hoy, Empresas u Oportunidades
- Credenciales o `.env` expuestos en la sesión de prueba
- Datos QA mezclados con demo sin limpiar (y confunden la presentación)

---

## Referencias

- [admin-checklist.md](./admin-checklist.md)  
- [validation-guide.md](./validation-guide.md)  
- [known-issues.md](./known-issues.md)
