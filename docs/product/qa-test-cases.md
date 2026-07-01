# Casos de prueba funcional — PLIFE Growth OS

**Versión:** FASE 12H  
**Última actualización:** 2026-07-01

Casos manuales y automatizables para QA y Playwright. Datos de prueba sugeridos: sufijo `QA` (ver [data-cleanup-guide.md](./data-cleanup-guide.md)).

---

## Login y navegación

### LOGIN-001 — Login válido

| Campo | Valor |
|-------|-------|
| **ID** | LOGIN-001 |
| **Pantalla** | `/login` |
| **Objetivo** | Verificar acceso con credenciales válidas |
| **Precondición** | Usuario activo en Supabase con perfil y rol asignado |
| **Pasos** | 1. Ir a `/login` 2. Ingresar email y contraseña válidos 3. Enviar formulario |
| **Resultado esperado** | Redirección a `/app/hoy`; sidebar visible; nombre de usuario en header |
| **Severidad si falla** | Crítica |
| **Playwright** | Sí |

---

### NAV-001 — Recorrer menú principal

| Campo | Valor |
|-------|-------|
| **ID** | NAV-001 |
| **Pantalla** | Sidebar `/app/*` |
| **Objetivo** | Confirmar que todas las rutas del menú cargan sin error |
| **Precondición** | Sesión iniciada como asesor o admin |
| **Pasos** | 1. Desde Hoy, hacer click en cada ítem del sidebar 2. Verificar URL y título de página 3. Repetir para todos los ítems visibles según rol |
| **Resultado esperado** | Cada ruta carga sin 404/500; contenido principal visible |
| **Severidad si falla** | Alta |
| **Playwright** | Sí |

---

### ONBOARD-001 — Ver “¿Por dónde empiezo?”

| Campo | Valor |
|-------|-------|
| **ID** | ONBOARD-001 |
| **Pantalla** | `/app/hoy` |
| **Objetivo** | Verificar orientación para usuario sin datos |
| **Precondición** | Usuario sin empresas ni oportunidades (o entorno limpio de prueba) |
| **Pasos** | 1. Login 2. Ir a `/app/hoy` 3. Buscar bloque **¿Por dónde empiezo?** |
| **Resultado esperado** | Card visible con pasos numerados y links a crear empresa/oportunidad |
| **Severidad si falla** | Media |
| **Playwright** | Sí |

---

## Empresas

### EMP-001 — Crear empresa válida

| Campo | Valor |
|-------|-------|
| **ID** | EMP-001 |
| **Pantalla** | `/app/empresas` |
| **Objetivo** | Crear empresa con datos mínimos |
| **Precondición** | Sesión activa |
| **Pasos** | 1. Ir a Empresas 2. Click **Nueva empresa** 3. Completar nombre (ej. `Estudio Contable Pérez QA`) 4. Opcional: rubro, ciudad 5. Guardar |
| **Resultado esperado** | Empresa aparece en listado; panel de éxito con próximos pasos; detalle accesible |
| **Severidad si falla** | Alta |
| **Playwright** | Sí |

---

### EMP-002 — Crear empresa sin nombre

| Campo | Valor |
|-------|-------|
| **ID** | EMP-002 |
| **Pantalla** | `/app/empresas` (formulario) |
| **Objetivo** | Validar campo obligatorio |
| **Precondición** | Formulario de nueva empresa abierto |
| **Pasos** | 1. Dejar nombre vacío 2. Intentar guardar |
| **Resultado esperado** | No guarda; mensaje de validación en nombre; formulario permanece |
| **Severidad si falla** | Media |
| **Playwright** | Sí |

---

### EMP-003 — Buscar empresa existente

| Campo | Valor |
|-------|-------|
| **ID** | EMP-003 |
| **Pantalla** | `/app/empresas` |
| **Objetivo** | Verificar búsqueda en listado |
| **Precondición** | Al menos una empresa existente (ej. creada en EMP-001) |
| **Pasos** | 1. Ir a Empresas 2. Escribir parte del nombre en buscador 3. Esperar filtrado |
| **Resultado esperado** | Solo empresas coincidentes visibles; contador actualizado; mensaje si no hay resultados |
| **Severidad si falla** | Baja |
| **Playwright** | Sí |

---

## Contactos

### CONTACT-001 — Crear contacto válido

| Campo | Valor |
|-------|-------|
| **ID** | CONTACT-001 |
| **Pantalla** | `/app/contactos` |
| **Objetivo** | Crear contacto asociado a empresa |
| **Precondición** | Empresa existente (EMP-001) |
| **Pasos** | 1. Ir a Contactos 2. **Nuevo contacto** 3. Nombre (ej. `Martín Pérez QA`), email válido 4. Seleccionar empresa 5. Guardar |
| **Resultado esperado** | Contacto en listado; panel éxito; visible en detalle de empresa |
| **Severidad si falla** | Alta |
| **Playwright** | Sí |

---

### CONTACT-002 — Email inválido

| Campo | Valor |
|-------|-------|
| **ID** | CONTACT-002 |
| **Pantalla** | `/app/contactos` (formulario) |
| **Objetivo** | Validar formato de email |
| **Precondición** | Formulario abierto |
| **Pasos** | 1. Completar nombre 2. Email inválido (ej. `no-es-email`) 3. Guardar |
| **Resultado esperado** | No guarda; mensaje de error en campo email |
| **Severidad si falla** | Media |
| **Playwright** | Sí |

---

## Oportunidades

### OPP-001 — Crear oportunidad válida

| Campo | Valor |
|-------|-------|
| **ID** | OPP-001 |
| **Pantalla** | `/app/oportunidades` |
| **Objetivo** | Crear oportunidad vinculada a empresa |
| **Precondición** | Empresa existente; opcional contacto |
| **Pasos** | 1. Ir a Oportunidades 2. **Nueva oportunidad** 3. Título (ej. `Protección para socios QA`) 4. Seleccionar empresa 5. Guardar |
| **Resultado esperado** | Oportunidad en pipeline etapa inicial; detalle accesible; próximo paso editable |
| **Severidad si falla** | Alta |
| **Playwright** | Sí |

---

### OPP-002 — Oportunidad sin título o empresa

| Campo | Valor |
|-------|-------|
| **ID** | OPP-002 |
| **Pantalla** | `/app/oportunidades` (formulario) |
| **Objetivo** | Validar campos obligatorios |
| **Precondición** | Formulario abierto |
| **Pasos** | 1. Dejar título vacío y/o empresa sin seleccionar 2. Guardar |
| **Resultado esperado** | No guarda; validación visible en campos requeridos |
| **Severidad si falla** | Media |
| **Playwright** | Sí |

---

## Campañas

### CAMP-001 — Ver campañas

| Campo | Valor |
|-------|-------|
| **ID** | CAMP-001 |
| **Pantalla** | `/app/campanas` |
| **Objetivo** | Listado de campañas carga correctamente |
| **Precondición** | Sesión activa (asesor o líder) |
| **Pasos** | 1. Ir a Campañas 2. Revisar listado o empty state 3. Si hay campaña, abrir detalle |
| **Resultado esperado** | Pantalla carga; métricas o empty state visibles; detalle abre sin error |
| **Severidad si falla** | Media |
| **Playwright** | Sí |

---

## Radar B2B

### RADAR-001 — Cargar radar sin romper

| Campo | Valor |
|-------|-------|
| **ID** | RADAR-001 |
| **Pantalla** | `/app/radar-b2b` |
| **Objetivo** | Pantalla estable con o sin datos |
| **Precondición** | Sesión activa |
| **Pasos** | 1. Ir a Radar B2B 2. Esperar carga 3. Con datos: expandir análisis de una fila 4. Sin datos: verificar empty state |
| **Resultado esperado** | Sin 500; ranking o empty state con CTA **Nueva empresa**; textos en español claro |
| **Severidad si falla** | Alta |
| **Playwright** | Sí |

---

## Compliance

### COMP-001 — Mensaje riesgoso

| Campo | Valor |
|-------|-------|
| **ID** | COMP-001 |
| **Pantalla** | `/app/compliance` |
| **Objetivo** | Detectar mensaje con promesas riesgosas |
| **Precondición** | Sesión activa |
| **Pasos** | 1. Ir a Compliance 2. Pegar mensaje riesgoso (ej. “Garantizamos cobertura total sin exclusiones para todos los socios”) 3. **Revisar mensaje** |
| **Resultado esperado** | Resultado indica riesgo o alertas; no aprueba automáticamente para envío |
| **Severidad si falla** | Alta |
| **Playwright** | Sí |

---

### COMP-002 — Mensaje seguro

| Campo | Valor |
|-------|-------|
| **ID** | COMP-002 |
| **Pantalla** | `/app/compliance` |
| **Objetivo** | Mensaje neutro no dispara alertas críticas |
| **Precondición** | Sesión activa |
| **Pasos** | 1. Pegar mensaje seguro (ej. “¿Podemos coordinar una reunión de 20 minutos para revisar sus necesidades?”) 2. Revisar |
| **Resultado esperado** | Sin alertas críticas; resultado favorable o sin bloqueo |
| **Severidad si falla** | Media |
| **Playwright** | Sí |

---

### COMP-003 — Mensaje vacío

| Campo | Valor |
|-------|-------|
| **ID** | COMP-003 |
| **Pantalla** | `/app/compliance` |
| **Objetivo** | Validar campo vacío |
| **Precondición** | Revisor abierto |
| **Pasos** | 1. Dejar textarea vacío 2. Click revisar |
| **Resultado esperado** | No procesa o muestra aviso de mensaje vacío; no error 500 |
| **Severidad si falla** | Baja |
| **Playwright** | Sí |

---

## Copiloto

### COPILOT-001 — Copiloto sin IA avanzada

| Campo | Valor |
|-------|-------|
| **ID** | COPILOT-001 |
| **Pantalla** | `/app/copiloto` |
| **Objetivo** | Comportamiento cuando IA no está configurada |
| **Precondición** | `OPENAI_API_KEY` no configurada o IA desactivada |
| **Pasos** | 1. Ir a Copiloto 2. Leer aviso 3. Intentar generar sugerencia |
| **Resultado esperado** | Pantalla carga; aviso claro; botón deshabilitado o mensaje “IA no configurada”; no parece bug |
| **Severidad si falla** | Media |
| **Playwright** | Sí |

---

## Conocimiento

### KNOW-001 — Conocimiento carga sin error

| Campo | Valor |
|-------|-------|
| **ID** | KNOW-001 |
| **Pantalla** | `/app/conocimiento` |
| **Objetivo** | Estabilidad de la base de conocimiento |
| **Precondición** | Sesión activa |
| **Pasos** | 1. Ir a Conocimiento 2. Buscar texto inexistente 3. Limpiar búsqueda |
| **Resultado esperado** | Listado o empty state; búsqueda sin resultados no rompe; sin mensajes técnicos |
| **Severidad si falla** | Media |
| **Playwright** | Sí |

---

## Dirección

### DIR-001 — Dirección carga sin error

| Campo | Valor |
|-------|-------|
| **ID** | DIR-001 |
| **Pantalla** | `/app/direccion` |
| **Objetivo** | Vista ejecutiva accesible para rol correcto |
| **Precondición** | Usuario con rol `direccion` o `admin` |
| **Pasos** | 1. Login como dirección 2. Ir a Dirección 3. Revisar KPIs y distribución |
| **Resultado esperado** | Pantalla carga; métricas visibles (aunque en cero); link a pipeline funciona |
| **Severidad si falla** | Alta |
| **Playwright** | Sí |

---

## Admin

### ADMIN-001 — Admin system carga para admin

| Campo | Valor |
|-------|-------|
| **ID** | ADMIN-001 |
| **Pantalla** | `/app/admin/system` |
| **Objetivo** | Diagnóstico técnico solo para roles autorizados |
| **Precondición** | Usuario rol `admin` o `direccion` |
| **Pasos** | 1. Login admin 2. Ir a Estado del sistema 3. Revisar paneles |
| **Resultado esperado** | Pantalla carga; info de entorno visible; sin secrets expuestos |
| **Severidad si falla** | Media |
| **Playwright** | Sí |

---

## Responsive

### RESP-001 — Mobile no rompe navegación

| Campo | Valor |
|-------|-------|
| **ID** | RESP-001 |
| **Pantalla** | `/app/*` (viewport móvil) |
| **Objetivo** | Navegación usable en pantalla chica |
| **Precondición** | Sesión activa; viewport 375px o similar |
| **Pasos** | 1. Reducir viewport 2. Abrir menú móvil 3. Navegar a Hoy, Empresas, Oportunidades 4. Abrir formulario crear empresa |
| **Resultado esperado** | Menú accesible; contenido legible; formularios usables; sin overflow que oculte botones críticos |
| **Severidad si falla** | Media |
| **Playwright** | Sí |

---

## Matriz resumen

| ID | Módulo | Playwright | Severidad |
|----|--------|------------|-----------|
| LOGIN-001 | Auth | Sí | Crítica |
| NAV-001 | Navegación | Sí | Alta |
| ONBOARD-001 | Hoy | Sí | Media |
| EMP-001 | Empresas | Sí | Alta |
| EMP-002 | Empresas | Sí | Media |
| EMP-003 | Empresas | Sí | Baja |
| CONTACT-001 | Contactos | Sí | Alta |
| CONTACT-002 | Contactos | Sí | Media |
| OPP-001 | Oportunidades | Sí | Alta |
| OPP-002 | Oportunidades | Sí | Media |
| CAMP-001 | Campañas | Sí | Media |
| RADAR-001 | Radar | Sí | Alta |
| COMP-001 | Compliance | Sí | Alta |
| COMP-002 | Compliance | Sí | Media |
| COMP-003 | Compliance | Sí | Baja |
| COPILOT-001 | Copiloto | Sí | Media |
| KNOW-001 | Conocimiento | Sí | Media |
| DIR-001 | Dirección | Sí | Alta |
| ADMIN-001 | Admin | Sí | Media |
| RESP-001 | Responsive | Sí | Media |

**Total:** 20 casos mínimos definidos.

---

## Referencias

- [acceptance-criteria.md](./acceptance-criteria.md)  
- [internal-demo-script.md](./internal-demo-script.md)  
- `tests/e2e/manual-system-walkthrough.spec.ts` (walkthrough automatizado existente)
