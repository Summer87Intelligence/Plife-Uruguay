# Matriz de roles — PLIFE Growth OS

> **Histórico (FASE 15B):** OpenAI fue removido del proyecto. Las menciones a OpenAI / GPT / `OPENAI_API_KEY` son registro histórico; los motores operan en modo determinístico interno.
>
> **Histórico (FASE 15C):** Compliance fue removido del producto (sección/menú/ruta). El rol `compliance` de la base ya no habilita accesos en la app. Ver `docs/product/compliance-removal-15c.md`.

**Versión:** FASE 12G  
**Última actualización:** 2026-07-01

Este documento describe cómo debería usarse el sistema según el rol. Los permisos reales están implementados en la aplicación; esta matriz es la guía operativa para capacitación y demos.

**Roles complementarios en el sistema (no detallados aquí):** `compliance`, `capacitacion`, `viewer`. Se usan para gestión de conocimiento, revisión normativa o acceso de solo lectura.

---

## 1. Dirección

### Qué debería ver

- Resumen ejecutivo del equipo comercial.
- Distribución del pipeline y oportunidades B2B destacadas.
- Campañas activas y foco por segmento.
- Alertas de seguimientos vencidos a nivel global (en PLIFE Hoy, vista dirección).
- Radar B2B para priorizar dónde enfocar al equipo.

### Qué debería poder hacer

- Revisar métricas y tomar decisiones de foco comercial.
- Entrar al detalle de oportunidades, empresas y campañas para entender contexto.
- Usar Compliance para revisar mensajes sensibles si participa en comunicación estratégica.
- Acceder a **Dirección** (`/app/direccion`) y **Estado del sistema** (`/app/admin/system`) si tiene rol `direccion` o `admin`.
- Crear y gestionar campañas (si también tiene permisos de líder comercial o admin).

### Qué no debería tocar

- No cargar empresas, contactos y oportunidades como rutina diaria (eso es trabajo del asesor).
- No administrar usuarios ni credenciales (salvo que también sea admin).
- No modificar configuración técnica del sistema.
- No usar el sistema como único vendedor operativo del pipeline.

### Pantallas principales

| Pantalla | Uso |
|----------|-----|
| PLIFE Hoy | Vista dirección — panorama del equipo |
| Dirección | Analytics y foco ejecutivo |
| Oportunidades | Revisar pipeline y etapas |
| Campañas | Ver y definir foco por segmento |
| Radar B2B | Priorizar empresas con potencial |
| Compliance | Revisar mensajes de alto impacto |

### Ejemplo de uso diario

Lunes 9:00 — Entra a **PLIFE Hoy**, revisa seguimientos vencidos del equipo y oportunidades en etapa avanzada. Pasa a **Dirección** para ver distribución del pipeline. Abre **Radar B2B** para definir qué segmento priorizar esta semana. En reunión de equipo, pide a los asesores actualizar próximos pasos en oportunidades concretas.

---

## 2. Líder comercial

### Qué debería ver

- Pipeline del equipo (según alcance de datos en el sistema).
- Campañas activas y su desempeño.
- Empresas y oportunidades del segmento que coordina.
- Radar B2B para orientar prospección del equipo.

### Qué debería poder hacer

- **Crear y editar campañas** (roles `lider_comercial`, `direccion`, `admin`).
- Revisar y ajustar oportunidades (asignación de asesores, etapas).
- Cargar empresas y contactos cuando hace prospección directa.
- Definir mensajes iniciales y revisarlos en Compliance antes de difundir al equipo.
- Guiar a asesores sobre el flujo empresa → contacto → oportunidad.

### Qué no debería tocar

- Administración de usuarios (`/app/admin`) — solo admin.
- Estado del sistema y diagnóstico técnico — solo dirección/admin.
- Configuración de Supabase, Vercel o variables de entorno.

### Pantallas principales

| Pantalla | Uso |
|----------|-----|
| Campañas | Diseño y seguimiento de campañas |
| Oportunidades | Supervisión del pipeline |
| Empresas / Contactos | Prospección y calidad de datos |
| Radar B2B | Priorización de cuentas |
| Compliance | Validar mensajes del equipo |
| PLIFE Hoy | Prioridades del día |

### Ejemplo de uso diario

Define la campaña **Estudios contables**, carga el mensaje inicial, lo revisa en **Compliance** y pide a los asesores crear oportunidades vinculadas. Revisa el pipeline el viernes para ver cuántas reuniones se agendaron.

---

## 3. Asesor

### Qué debería ver

- Solo sus empresas, contactos y oportunidades asignadas (rol `asesor`).
- Su tablero en **PLIFE Hoy**: seguimientos vencidos, próximas acciones, oportunidades en etapa avanzada.
- Campañas activas (lectura; creación según permisos del equipo).
- Radar B2B para priorizar a quién contactar.
- Copiloto IA (si está configurado) y base de Conocimiento.

### Qué debería poder hacer

- **Crear y editar** empresas, contactos y oportunidades propias.
- Registrar actividades y próximos pasos con fecha.
- Mover oportunidades de etapa en el pipeline.
- Revisar mensajes en **Compliance** antes de enviarlos.
- Usar **Acciones rápidas** en detalle de empresa/contacto/oportunidad para navegar sin perderse.
- Consultar Conocimiento para guiones y material aprobado.

### Qué no debería tocar

- Admin, Estado del sistema, gestión de usuarios.
- Dirección (vista ejecutiva) — redirige a Hoy si no tiene rol.
- Crear campañas si el rol no lo permite (ver mensaje en empty state de campañas).
- Borrar datos demo oficiales o datos de otros asesores.

### Pantallas principales

| Pantalla | Uso |
|----------|-----|
| PLIFE Hoy | Empezar el día |
| Empresas | Cargar y mantener cuentas |
| Contactos | Personas con las que habla |
| Oportunidades | Pipeline personal |
| Compliance | Revisar antes de enviar |
| Radar B2B | Decidir a quién llamar primero |

### Ejemplo de uso diario

Entra a **Hoy**, atiende dos seguimientos vencidos, crea contacto **Martín Pérez** en **Estudio Contable Pérez**, abre oportunidad **Protección para socios**, define próximo paso para el jueves y pega el mensaje de seguimiento en **Compliance** antes de enviarlo.

---

## 4. Administrador del sistema

### Qué debería ver

- Panel **Admin** (`/app/admin`) — usuarios y configuración operativa.
- **Estado del sistema** (`/app/admin/system`) — salud técnica, revisiones compliance recientes.
- Todas las pantallas comerciales (según necesidad de soporte).
- Documentación en `docs/product/` y checklists de deploy.

### Qué debería poder hacer

- Crear y desactivar usuarios, asignar roles correctos.
- Verificar deploy en Vercel, conexión Supabase, variables de entorno (sin exponerlas).
- Cargar o resetear **datos demo** para sesiones de prueba.
- Coordinar limpieza de datos QA (ver [data-cleanup-guide.md](./data-cleanup-guide.md)).
- Ejecutar validaciones técnicas (`type-check`, `build`, tests) antes de push.
- Gestionar documentos en Conocimiento (junto con roles `compliance` y `capacitacion`).

### Qué no debería tocar

- No usar el sistema como vendedor principal del negocio.
- No compartir `service_role`, `.env` ni contraseñas en demos.
- No borrar datos reales o demo oficial sin confirmación.
- No activar OpenAI, WhatsApp o scraping sin decisión de producto (ver [product-backlog.md](./product-backlog.md)).

### Pantallas principales

| Pantalla | Uso |
|----------|-----|
| Admin | Usuarios y accesos |
| Estado del sistema | Diagnóstico |
| Conocimiento | Documentos base (si aplica) |
| Resto del sistema | Soporte y verificación pre-demo |

### Ejemplo de uso diario

Antes de una demo: crea usuario asesor de prueba, verifica login, confirma que Hoy y Empresas cargan, revisa que no queden datos QA mezclados, y no comparte pantalla con credenciales visibles.

---

## Tabla resumen

| Rol | Pantallas principales | Acciones permitidas | Riesgos si se usa mal |
|-----|------------------------|---------------------|------------------------|
| **Dirección** | Hoy (vista dirección), Dirección, Oportunidades, Campañas, Radar B2B | Leer métricas, definir foco, revisar pipeline, campañas | Microgestionar carga operativa; ignorar que los asesores deben registrar seguimientos |
| **Líder comercial** | Campañas, Oportunidades, Radar B2B, Empresas, Compliance | Crear campañas, orientar equipo, revisar mensajes | Campañas sin oportunidades vinculadas; mensajes sin pasar por Compliance |
| **Asesor** | Hoy, Empresas, Contactos, Oportunidades, Compliance, Radar B2B | CRUD comercial propio, seguimiento, revisar mensajes | Oportunidades sin próximo paso; contactos sin empresa en B2B; enviar mensajes sin Compliance |
| **Administrador** | Admin, Estado del sistema, Conocimiento | Usuarios, demo, soporte técnico, limpieza QA | Exponer secrets; borrar datos incorrectos; operar ventas en lugar del equipo |

---

## Referencias

- [user-manual.md](./user-manual.md)  
- [admin-checklist.md](./admin-checklist.md)  
- [product-backlog.md](./product-backlog.md)
