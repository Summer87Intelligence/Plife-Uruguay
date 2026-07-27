# PLIFE Growth OS — QA Checklist Técnico

> **Nota (FASE 15B):** OpenAI fue removido. Los ítems que mencionan `OPENAI_API_KEY`
> / OpenAI son **históricos**; los motores operan en modo determinístico interno.

> Checklist manual para validar el sistema antes de un deploy o demo controlada.
> Marcar cada ítem como ✅ OK / ❌ Falla / ⚠ Advertencia / ➖ No aplica.

---

## AUTH

### Flujo sin sesión
- [ ] Acceder a `/app/hoy` sin estar logueado → redirige a `/login`
- [ ] Acceder a `/app/admin` sin estar logueado → redirige a `/login`
- [ ] El formulario de login muestra errores claros si las credenciales son incorrectas

### Flujo con sesión válida
- [ ] Login correcto → redirige a `/app/hoy`
- [ ] El header muestra el nombre y rol del usuario
- [ ] El sidebar muestra los ítems correspondientes al rol
- [ ] No hay loop infinito de redirección (revisar Network tab)

### Usuario sin profile
- [ ] Si un usuario de auth no tiene fila en `profiles` → redirige a `/login?error=missing_profile`
- [ ] El mensaje de error es claro (no pantalla en blanco)

### Profile inactivo
- [ ] Si `profiles.is_active = false` → redirige a `/login?error=missing_profile`
- [ ] El usuario no puede acceder a ningún módulo

### Logout
- [ ] Botón de logout cierra la sesión correctamente
- [ ] Después del logout, acceder a `/app/hoy` redirige a `/login`
- [ ] No quedan datos del usuario anterior en pantalla si se vuelve a loguear con otra cuenta

---

## MÓDULOS — NAVEGACIÓN Y CARGA

### /app/hoy (Dashboard)
- [ ] Carga sin errores
- [ ] El usuario tipo `asesor` ve su dashboard personal (actividades pendientes, oportunidades propias)
- [ ] El usuario tipo `direccion` ve el dashboard ejecutivo (métricas globales)
- [ ] Los contadores muestran datos reales (no 0 si hay datos)

### /app/demo
- [ ] Carga sin errores
- [ ] Visible para todos los roles autenticados

### /app/contactos
- [ ] Listado carga correctamente
- [ ] Se puede crear un contacto nuevo (formulario funciona)
- [ ] Se puede ver el detalle de un contacto
- [ ] El asesor no ve contactos ajenos (si RLS está correctamente configurado)

### /app/empresas
- [ ] Listado carga correctamente
- [ ] Se puede crear una empresa nueva
- [ ] Detalle de empresa carga con su análisis B2B si corresponde

### /app/oportunidades
- [ ] Pipeline/listado carga correctamente
- [ ] Se puede crear una oportunidad nueva
- [ ] El detalle de una oportunidad muestra actividades y datos relacionados

### /app/campanas
- [ ] Listado de campañas carga
- [ ] Detalle de campaña carga con sus métricas

### /app/copiloto
- [ ] La vista carga sin error
- [ ] Si no hay `OPENAI_API_KEY`, muestra mensaje de error claro (no pantalla en blanco)
- [ ] Con `OPENAI_API_KEY` válida, el copiloto responde y muestra la respuesta

### /app/compliance
- [ ] La vista carga correctamente
- [ ] El motor de compliance determinístico (regex) funciona sin necesidad de OpenAI
- [ ] Una frase con término prohibido devuelve alerta de riesgo
- [ ] Una frase limpia pasa sin alertas

### /app/conocimiento
- [ ] Listado de documentos carga
- [ ] Si hay documentos activos, se pueden visualizar

### /app/direccion
- [ ] Solo accesible para roles `direccion` y `admin`
- [ ] Usuario `asesor` que intenta acceder → redirige a `/app/hoy`

### /app/admin
- [ ] Solo accesible para rol `admin`
- [ ] Usuarios, equipos y agentes IA se cargan correctamente

### /app/admin/system
- [ ] Solo accesible para roles `admin` y `direccion`
- [ ] Muestra usuario actual, rol, email, is_active
- [ ] Muestra correctamente si el modo demo está activo/inactivo
- [ ] Muestra correctamente si la IA está configurada
- [ ] Los contadores de contactos, empresas, oportunidades, campañas, actividades y documentos muestran valores
- [ ] Las últimas interacciones IA y revisiones compliance cargan (o muestran "sin registros")
- [ ] No se muestra ningún token, API key ni valor sensible

---

## SUPABASE — SEGURIDAD

### RLS
- [ ] Todas las tablas de `public` tienen RLS habilitado (verificar con `security-audit.sql` sección 1)
- [ ] Ninguna tabla tiene `rowsecurity = false` (sección 5 del audit)
- [ ] Las policies existentes cubren SELECT / INSERT / UPDATE para los roles esperados

### GRANTs
- [ ] El rol `authenticated` tiene SELECT en las tablas usadas por la app (sección 6 del audit)
- [ ] Después de correr `fix-app-grants.sql`, no aparecen errores 42501 en ningún módulo
- [ ] El rol `anon` no tiene acceso a tablas sensibles (sección 4 del audit)

### Seed demo
- [ ] `seed-demo.sql` corre sin error en una base vacía con al menos 1 profile
- [ ] Corriendo el seed por segunda vez no duplica datos
- [ ] Los datos de demo aparecen en el dashboard

### Clear demo
- [ ] `clear-demo.sql` corre sin error
- [ ] Después de correrlo, los datos demo desaparecen del dashboard
- [ ] Los profiles y auth.users no se ven afectados
- [ ] Corriendo el seed después del clear restaura los datos correctamente

### Permission denied
- [ ] Si se detecta un error 42501, correr `fix-app-grants.sql` lo resuelve
- [ ] Si persiste, verificar que la policy de RLS correspondiente existe

---

## IA

### Sin OPENAI_API_KEY
- [ ] El Copiloto muestra mensaje de error claro (no pantalla en blanco ni error 500)
- [ ] Compliance determinístico sigue funcionando (no depende de OpenAI)
- [ ] El resto de la app funciona normalmente

### Con OPENAI_API_KEY válida
- [ ] El Copiloto genera respuestas coherentes
- [ ] Las respuestas pasan por el motor de compliance antes de mostrarse
- [ ] Las interacciones quedan registradas en `ai_interactions`

### Compliance determinístico
- [ ] Frases con términos prohibidos (`te cubre todo`, `garantizado`, `sin riesgo`, etc.) son bloqueadas
- [ ] La revisión queda registrada en `compliance_reviews`
- [ ] Las reglas de compliance se leen de `compliance_rules` (o del set por defecto)

### Trazabilidad
- [ ] Cada interacción de IA registra: usuario, agente, risk_level, was_approved
- [ ] El sistema de status `/app/admin/system` muestra las últimas 5 interacciones
- [ ] Si la IA genera contenido de riesgo alto, queda marcado correctamente

---

## BUILD / TYPE-CHECK

- [ ] `npm run type-check` pasa sin errores
- [ ] `npm run build` completa sin errores
- [ ] No hay warnings críticos de TypeScript en los módulos nuevos

---

## PLAYWRIGHT — TESTS AUTOMATIZADOS (FASE 9)

### Prerrequisitos
- [ ] `.env.test` creado con `E2E_USER_EMAIL` y `E2E_USER_PASSWORD`
- [ ] Seed demo cargado (`supabase/seed-demo.sql`)
- [ ] `fix-app-grants.sql` aplicado
- [ ] `npm run dev` corriendo en paralelo (o `E2E_BASE_URL` apunta a staging)

### Ejecución
- [ ] `npm run type-check` → sin errores
- [ ] `npm run build` → sin errores
- [ ] `npm run test:e2e` → todos los tests pasan

### Specs y cobertura
- [ ] `auth.spec.ts` — sin sesión redirige a /login, login OK, logout OK, F5 sin loop
- [ ] `smoke-routes.spec.ts` — 13 rutas cargan sin 500 ni Internal Server Error
- [ ] `dashboard.spec.ts` — métricas demo visibles y > 0
- [ ] `radar-b2b.spec.ts` — ranking B2B, filtros, análisis expandido
- [ ] `commercial-flow.spec.ts` — empresas, oportunidades, campañas navegan OK
- [ ] `compliance.spec.ts` — término prohibido → riesgo crítico (sin OpenAI)
- [ ] `copilot.spec.ts` — estado sin API key correcto; con key formulario disponible
- [ ] `knowledge.spec.ts` — docs cargan, estado embeddings visible, búsqueda no rompe
- [ ] `admin-system.spec.ts` — sesión, contadores, sin secrets expuestos

### Criterios de aceptación FASE 9
- [ ] type-check OK
- [ ] build OK (21 páginas)
- [ ] `npm run test:e2e` sin fallos bloqueantes
- [ ] `dev` script sin `--turbopack` (problema F5 resuelto)
- [ ] `dev:turbo` disponible como opción opcional
- [ ] `.env.test` en `.gitignore`
- [ ] Documentación `docs/technical/playwright-e2e.md` creada

---

## NOTAS DE SEGUIMIENTO

| Fecha | Ítem | Resultado | Responsable |
|-------|------|-----------|-------------|
|       |      |           |             |
