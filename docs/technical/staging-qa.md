# Checklist QA — Staging

> **Nota (FASE 15B):** OpenAI fue removido. Los ítems que mencionan `OPENAI_API_KEY`
> / OpenAI son **históricos**; hoy los motores operan en modo determinístico interno.

Validación manual post-deploy en Vercel. Ejecutar en orden con un usuario con rol `admin` o `asesor` según se indica.

**URL base:** `https://tu-proyecto.vercel.app`  
**Fecha:** ___________  
**Entorno:** staging / producción  
**Usuario de prueba:** ___________

---

## A. Auth

| # | Paso | Resultado esperado | OK |
|---|---|---|---|
| A1 | Ir a `/login` sin sesión | Muestra formulario de login | ☐ |
| A2 | Intentar entrar con credenciales incorrectas | Muestra "Email o contraseña incorrectos" | ☐ |
| A3 | Login con usuario activo y perfil válido | Redirige a `/app/hoy` | ☐ |
| A4 | Con sesión activa, ir a `/login` directamente | Redirige a `/app/hoy` (no muestra login de nuevo) | ☐ |
| A5 | Logout desde el botón en el header | Redirige a `/login`, sesión eliminada | ☐ |
| A6 | Intentar acceder a `/app/hoy` sin sesión (pestaña nueva) | Redirige a `/login` | ☐ |

---

## B. Módulos principales

### B1. PLIFE Hoy (`/app/hoy`)
| # | Paso | Resultado esperado | OK |
|---|---|---|---|
| B1.1 | Abrir `/app/hoy` | Carga sin error 500 | ☐ |
| B1.2 | Ver tablero | Muestra secciones (seguimientos, pipeline, alertas) | ☐ |

### B2. Demo (`/app/demo`)
| # | Paso | Resultado esperado | OK |
|---|---|---|---|
| B2.1 | Abrir `/app/demo` | Muestra 8 pasos con títulos y valor comercial | ☐ |
| B2.2 | Hacer click en "Ver PLIFE Hoy" | Navega a `/app/hoy` | ☐ |
| B2.3 | Hacer click en "Abrir Radar B2B" | Navega a `/app/radar-b2b` | ☐ |

### B3. Radar B2B (`/app/radar-b2b`)
| # | Paso | Resultado esperado | OK |
|---|---|---|---|
| B3.1 | Abrir `/app/radar-b2b` | Lista empresas ordenadas por score desc | ☐ |
| B3.2 | Stats: verde/amarillo/gris | Contadores correctos según score | ☐ |
| B3.3 | Buscar empresa | Filtra en tiempo real | ☐ |
| B3.4 | Botón "Oportunidad" en una empresa | Abre dialog para crear oportunidad | ☐ |
| B3.5 | Botón "Analizar IA" (si hay OPENAI_API_KEY) | Devuelve análisis | ☐ |
| B3.6 | Botón "Analizar IA" (sin OPENAI_API_KEY) | Muestra mensaje "IA no configurada" | ☐ |

### B4. Empresas (`/app/empresas`)
| # | Paso | Resultado esperado | OK |
|---|---|---|---|
| B4.1 | Abrir lista | Carga empresas, muestra contador | ☐ |
| B4.2 | Buscar por nombre | Filtra correctamente | ☐ |
| B4.3 | Filtrar por estado B2B | Muestra solo las del estado | ☐ |
| B4.4 | Filtrar por score | Alto/medio/bajo funciona | ☐ |
| B4.5 | Limpiar filtros | Vuelve a la lista completa | ☐ |
| B4.6 | Abrir una empresa | Muestra detalle con tira "Por qué importa" (si hay datos) | ☐ |
| B4.7 | Cambiar estado B2B en el detalle | Se actualiza sin recargar página | ☐ |
| B4.8 | Botón "Crear oportunidad" en detalle | Abre form de nueva oportunidad | ☐ |
| B4.9 | Botón "Editar" | Abre form pre-cargado | ☐ |
| B4.10 | Botón "Nueva empresa" | Abre form, al guardar aparece en lista | ☐ |

### B5. Contactos (`/app/contactos`)
| # | Paso | Resultado esperado | OK |
|---|---|---|---|
| B5.1 | Abrir lista | Carga contactos con contador | ☐ |
| B5.2 | Buscar por nombre/email/empresa | Filtra correctamente | ☐ |
| B5.3 | Filtrar por estado | Funciona | ☐ |
| B5.4 | Filtrar por nivel de interés | Funciona | ☐ |
| B5.5 | Abrir un contacto | Muestra detalle completo | ☐ |
| B5.6 | Registrar actividad | Se agrega al timeline | ☐ |

### B6. Oportunidades / Pipeline (`/app/oportunidades`)
| # | Paso | Resultado esperado | OK |
|---|---|---|---|
| B6.1 | Abrir pipeline | Muestra vista kanban | ☐ |
| B6.2 | Buscar oportunidad | Filtra en kanban y lista | ☐ |
| B6.3 | Filtrar por tipo (B2C/B2B/Reclutamiento) | Funciona | ☐ |
| B6.4 | Filtrar por riesgo | Funciona | ☐ |
| B6.5 | Cambiar a vista Lista | Muestra columnas con valor y riesgo | ☐ |
| B6.6 | Total pipeline en header | Muestra valor sumado cuando hay valor estimado | ☐ |
| B6.7 | Abrir una oportunidad | Muestra barra de progreso de etapa | ☐ |
| B6.8 | Valor estimado en header del detalle | Visible si está cargado | ☐ |
| B6.9 | Mover etapa desde detalle | Se actualiza | ☐ |
| B6.10 | Marcar como Ganada | Cambia estado correctamente | ☐ |

### B7. Campañas (`/app/campanas`)
| # | Paso | Resultado esperado | OK |
|---|---|---|---|
| B7.1 | Abrir lista | Muestra campañas agrupadas (activas / otras) | ☐ |
| B7.2 | Buscar por nombre | Filtra correctamente | ☐ |
| B7.3 | Filtrar por estado | Funciona | ☐ |
| B7.4 | Abrir campaña | Muestra detalle con stats | ☐ |

### B8. Copiloto IA (`/app/copiloto`)
| # | Paso | Resultado esperado | OK |
|---|---|---|---|
| B8.1 | Sin OPENAI_API_KEY | Muestra banner "IA no configurada", no crashea | ☐ |
| B8.2 | Con OPENAI_API_KEY — seleccionar tipo de ayuda | Responde con análisis | ☐ |
| B8.3 | Resultado guardado como actividad | Aparece en timeline | ☐ |

### B9. Compliance (`/app/compliance`)
| # | Paso | Resultado esperado | OK |
|---|---|---|---|
| B9.1 | Ingresar mensaje con promesa de rentabilidad | Resultado: bloqueado o revisión requerida | ☐ |
| B9.2 | Sin OPENAI_API_KEY | Muestra "IA no configurada" sin crash | ☐ |
| B9.3 | Ver historial de revisiones | Lista correctamente | ☐ |

### B10. Dirección (`/app/direccion`)
| # | Paso | Resultado esperado | OK |
|---|---|---|---|
| B10.1 | Rol asesor intenta acceder | Redirige a `/app/hoy` | ☐ |
| B10.2 | Rol admin o direccion accede | Muestra tablero de dirección | ☐ |

### B11. Admin → Estado del sistema (`/app/admin/system`)
| # | Paso | Resultado esperado | OK |
|---|---|---|---|
| B11.1 | Rol asesor intenta acceder | Redirige a `/app/hoy` | ☐ |
| B11.2 | Rol admin o direccion accede | Muestra info de sesión, flags, contadores | ☐ |
| B11.3 | Flag "IA configurada" | Coincide con presencia de OPENAI_API_KEY | ☐ |
| B11.4 | Flag "Modo demo" | Coincide con NEXT_PUBLIC_DEMO_MODE | ☐ |
| B11.5 | Contadores (contactos, empresas, etc.) | Valores coherentes con datos en Supabase | ☐ |

---

## C. Supabase — RLS y GRANTs

| # | Paso | Resultado esperado | OK |
|---|---|---|---|
| C1 | Ejecutar `security-audit.sql` en SQL Editor | 0 tablas sin RLS activo (en tablas de la app) | ☐ |
| C2 | Sección "Tablas sin GRANT para authenticated" | Lista vacía (fix-app-grants.sql ya aplicado) | ☐ |
| C3 | Login como asesor → cargar contactos | Sin errores 42501 en consola/logs | ☐ |
| C4 | Intentar leer tabla `profiles` como asesor sin perfil | RLS bloquea (no devuelve datos de otros) | ☐ |

---

## D. Seed demo

| # | Paso | Resultado esperado | OK |
|---|---|---|---|
| D1 | NEXT_PUBLIC_DEMO_MODE=true | Badge "Demo" visible en sidebar | ☐ |
| D2 | "Recorrido demo" aparece en sidebar | Primer ítem del nav | ☐ |
| D3 | `/app/demo` muestra 8 pasos | Todos con CTA y valor comercial | ☐ |
| D4 | Empresas demo visibles | Datos con UUIDs `b0000000-*` o `source='Demo PLIFE'` | ☐ |
| D5 | NEXT_PUBLIC_DEMO_MODE=false u omitida | Sin badge demo, sin "Recorrido demo" en nav | ☐ |

---

## E. Comportamiento de variables opcionales

| # | Escenario | Resultado esperado | OK |
|---|---|---|---|
| E1 | OPENAI_API_KEY ausente | App funciona completa, IA en estado "no configurada" | ☐ |
| E2 | OPENAI_API_KEY presente pero inválida (`sk-test`) | App funciona, llamada a IA falla con mensaje controlado | ☐ |
| E3 | NEXT_PUBLIC_DEMO_MODE ausente | App funciona en modo normal | ☐ |
| E4 | NEXT_PUBLIC_APP_URL ausente | App funciona, solo afecta URLs en emails de Supabase | ☐ |

---

## Resultado final

| Bloque | Estado |
|---|---|
| A. Auth | ☐ OK / ☐ Issues |
| B. Módulos | ☐ OK / ☐ Issues |
| C. RLS/GRANTs | ☐ OK / ☐ Issues |
| D. Demo | ☐ OK / ☐ Issues |
| E. Variables | ☐ OK / ☐ Issues |

**Issues encontrados:**
<!-- Listar acá cualquier fallo con ruta, descripción, pasos para reproducir -->
