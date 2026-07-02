# Checklist de administración — PLIFE Growth OS

**Versión:** FASE 12F  
**Uso:** administración de usuarios, demos y seguridad básica

---

## 1. Antes de dar acceso a un usuario

Completar todos los ítems antes de compartir credenciales:

- [ ] Usuario creado en Supabase (Auth + perfil en `profiles`)
- [ ] Contraseña segura (no reutilizar contraseñas de demo)
- [ ] Perfil marcado como activo (`is_active = true`)
- [ ] Rol correcto asignado:
  - `asesor` — operación diaria
  - `lider_comercial` — campañas y equipo
  - `direccion` — vista ejecutiva
  - `admin` — administración completa
  - Otros según necesidad (`compliance`, `capacitacion`, etc.)
- [ ] Login probado con ese usuario en el entorno correspondiente (staging o producción)
- [ ] Confirmar que ve solo lo que corresponde a su rol (ej.: asesor no administra usuarios)

---

## 2. Antes de una demo

### Infraestructura

- [ ] Deploy en Vercel OK (último build exitoso)
- [ ] Supabase conectado (login y lectura de datos funcionan)
- [ ] Variables de entorno configuradas en Vercel (sin mostrarlas en pantalla)
- [ ] URL de demo confirmada y accesible para la audiencia

### Datos y contenido

- [ ] Datos demo cargados o modo demo activo si aplica
- [ ] Al menos un flujo completo visible: empresa → contacto → oportunidad
- [ ] Campaña de ejemplo si se va a mostrar ese módulo
- [ ] Documentos en Conocimiento activos (si se muestra IA / búsqueda)

### Prueba funcional rápida

- [ ] Login con usuario de demo
- [ ] `/app/hoy` carga sin error
- [ ] `/app/empresas`, `/app/contactos`, `/app/oportunidades` abren
- [ ] `/app/campanas`, `/app/radar-b2b` abren
- [ ] `/app/compliance` — pegar mensaje de prueba y revisar
- [ ] `/app/copiloto` — verificar mensaje claro si IA no está configurada
- [ ] `/app/direccion` (si el usuario demo tiene rol dirección/admin)
- [ ] No hay errores 404 ni 500 en rutas principales
- [ ] No hay pantallas en blanco ni errores visibles en consola críticos

### Presentación

- [ ] No mostrar `.env`, `.env.local`, `.env.test` ni credenciales
- [ ] No compartir `service_role` ni claves de API
- [ ] Tener plan B si falla internet o Supabase (mensaje preparado para la audiencia)

---

## 3. Después de una demo

- [ ] Anotar dudas que hizo la audiencia
- [ ] Anotar pantallas que generaron confusión
- [ ] Anotar módulos que generaron más interés
- [ ] Revisar si quedaron datos de prueba con sufijo **QA** (ver test visual manual)
- [ ] Borrar o archivar datos QA si corresponde
- [ ] Cambiar contraseñas si se compartieron en vivo o por chat
- [ ] Registrar feedback en el canal acordado del equipo (issue, doc, reunión)

---

## 4. Seguridad

### Nunca

- No compartir la clave `service_role` de Supabase
- No mostrar archivos `.env` en pantalla compartida
- No usar contraseñas débiles (`demo123`, `password`, etc.)
- No subir `.env.test` ni credenciales al repositorio
- No pegar secrets en chats, tickets o capturas públicas

### Si hubo exposición

- [ ] Rotar contraseñas de usuarios afectados
- [ ] Rotar claves de API si aparecieron en logs o capturas
- [ ] Revisar accesos recientes en Supabase / Vercel
- [ ] Documentar el incidente de forma interna

### Buenas prácticas

- Usar usuarios de demo dedicados, no cuentas personales
- Limitar rol `admin` al mínimo necesario
- Revisar periódicamente usuarios activos y desactivar los que no usan el sistema

---

## Referencias

- [qa-before-demo.md](./qa-before-demo.md) — checklist detallado por pantalla  
- [known-issues.md](./known-issues.md) — pendientes y riesgos conocidos  
- [user-manual.md](./user-manual.md) — manual para usuarios finales
