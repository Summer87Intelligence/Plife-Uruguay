# Backlog de producto — PLIFE Growth OS

> **Histórico (FASE 15B):** OpenAI fue removido del proyecto. Las menciones a OpenAI / GPT / `OPENAI_API_KEY` son registro histórico; los motores operan en modo determinístico interno.

**Versión:** FASE 12G  
**Última actualización:** 2026-07-01  
**Foco actual:** facilidad de uso, gestión comercial B2B, seguimiento y compliance.

Leyenda de **estado:** `pendiente` | `en curso` | `hecho` | `futuro` | `bloqueado`

---

## P0 — Antes de mostrar a PLIFE

| Item | Descripción | Prioridad | Impacto | Esfuerzo | Dependencia | Estado |
|------|-------------|-----------|---------|----------|-------------|--------|
| Validar Playwright completo | Correr suite E2E + test visual manual; corregir fallos antes de push | P0 | Alto | Medio | Claude / entorno local | en curso |
| Cambiar contraseña expuesta | Rotar credenciales si aparecieron en logs, capturas o chat | P0 | Alto | Bajo | Ninguna | pendiente |
| Revisar datos QA | Limpiar registros con sufijo QA del walkthrough visual | P0 | Medio | Bajo | [data-cleanup-guide.md](./data-cleanup-guide.md) | pendiente |
| Verificar deploy Vercel | Último build OK, URL accesible, env vars en plataforma | P0 | Alto | Bajo | CI / admin | pendiente |
| Probar flujo empresa → contacto → oportunidad | Flujo completo manual o E2E sin errores | P0 | Alto | Bajo | Datos demo o QA | pendiente |
| Probar Compliance | Revisor responde con mensaje de prueba riesgoso y uno seguro | P0 | Alto | Bajo | Ninguna | pendiente |

---

## P1 — Mejoras de usabilidad

| Item | Descripción | Prioridad | Impacto | Esfuerzo | Dependencia | Estado |
|------|-------------|-----------|---------|----------|-------------|--------|
| Unificar “Crear empresa” vs “Nueva empresa” | Mismo verbo en onboarding, listas y formularios | P1 | Medio | Bajo | Tests E2E de onboarding | pendiente |
| Mejorar Copiloto sin OpenAI | Flujo útil cuando IA no está configurada (guías, links, ejemplos) | P1 | Medio | Medio | Decisión producto | pendiente |
| GettingStartedCard en Dirección si métricas = 0 | Guía de primeros pasos en vista ejecutiva vacía | P1 | Medio | Bajo | P0 cerrado | pendiente |
| Acordeón avanzado en edición | Mismos formularios simplificados al editar empresa/contacto/opp/campaña | P1 | Medio | Medio | Formularios 12D | pendiente |
| Mejorar limpieza de filtros | Botón único “Limpiar todo” consistente en todas las listas | P1 | Bajo | Bajo | Ninguna | pendiente |
| Links Compliance → entidad comercial | Desde trazabilidad IA ir al contacto/empresa/oportunidad | P1 | Medio | Medio | Rutas existentes | pendiente |
| Filtro pipeline por empresa/campaña | Además de búsqueda por texto (`?q=`) | P1 | Medio | Medio | Ninguna | pendiente |

---

## P2 — Funcionalidad comercial

| Item | Descripción | Prioridad | Impacto | Esfuerzo | Dependencia | Estado |
|------|-------------|-----------|---------|----------|-------------|--------|
| Registro de actividades más visible | Timeline y CTA “Registrar actividad” más prominentes en detalle | P2 | Alto | Medio | Ninguna | pendiente |
| Próximas acciones por asesor | Vista o filtro en Hoy/Dirección por responsable | P2 | Alto | Medio | Datos de `assigned_to` | pendiente |
| Vista de oportunidades vencidas | Listado de opps con `next_action_date` pasada | P2 | Alto | Medio | Queries existentes | pendiente |
| Mejor vínculo campañas ↔ oportunidades | Desde campaña filtrar opps; desde opp ver campaña en acciones rápidas (parcial en 12E) | P2 | Medio | Medio | `campaign_id` | pendiente |
| Exportación simple para Dirección | CSV o resumen descargable de pipeline (sin BI complejo) | P2 | Medio | Medio | P0 validado | futuro |
| Alertas de oportunidades sin actividad | Reforzar bloque “sin actividad reciente” en Hoy con acciones | P2 | Medio | Bajo | Hoy dashboard | pendiente |
| Seguimiento unificado contacto + oportunidad | Una sola vista de “qué vence esta semana” | P2 | Alto | Alto | Diseño UX | futuro |

---

## P3 — IA e integraciones futuras

| Item | Descripción | Prioridad | Impacto | Esfuerzo | Dependencia | Estado |
|------|-------------|-----------|---------|----------|-------------|--------|
| Activar OpenAI | Copiloto y embeddings de Conocimiento con IA real | P3 | Alto | Alto | Flujo principal validado con PLIFE | futuro |
| WhatsApp | Integración de mensajería (no existe hoy) | P3 | Alto | Muy alto | Proveedor, compliance, legal | futuro |
| Scraping / Radar externo | Fuentes externas para enriquecer empresas (no existe hoy) | P3 | Medio | Muy alto | Política de datos | futuro |
| Automatizaciones de seguimiento | Recordatorios automáticos, secuencias (no existe hoy) | P3 | Medio | Alto | WhatsApp o email | futuro |
| Búsqueda semántica Conocimiento en producción | Requiere embeddings + OpenAI configurado | P3 | Medio | Medio | OpenAI + SQL embeddings | futuro |

---

## Hecho recientemente (no re-abrir)

| Fase | Resumen | Estado |
|------|---------|--------|
| 12D | UX formularios, empty states, post-creación, copy | hecho |
| 12E | Acciones rápidas, breadcrumbs, búsquedas, resumen en detalle | hecho |
| 12F | Documentación operativa (manual, admin, QA, known issues, release notes) | hecho |
| 12G | Este backlog, roles, feedback template, limpieza QA, sprints | hecho |

---

## Cómo priorizar

1. Cerrar **P0** antes de cualquier demo externa a PLIFE.  
2. Tomar **P1** solo con evidencia de feedback ([feedback-log-template.md](./feedback-log-template.md)).  
3. **P2** cuando el flujo base esté validado y estable en producción.  
4. **P3** solo con decisión explícita de dirección de producto — no por impulso técnico.

---

## Referencias

- [known-issues.md](./known-issues.md)  
- [next-sprints.md](./next-sprints.md)  
- [release-notes.md](./release-notes.md)
