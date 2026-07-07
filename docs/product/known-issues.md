# Pendientes y decisiones conocidas

> **Histórico (FASE 15B):** OpenAI fue removido del proyecto. Las menciones a OpenAI / GPT / `OPENAI_API_KEY` son registro histórico; los motores operan en modo determinístico interno.

**Versión:** FASE 12F  
**Última actualización:** 2026-07-01

Documento vivo de lo que el equipo sabe que falta, lo que se decidió no hacer aún y los riesgos a tener en cuenta.

---

## 1. Pendientes UX conocidos

| Pendiente | Contexto | Prioridad |
|-----------|----------|-----------|
| GettingStartedCard en Dirección cuando métricas = 0 | Vista ejecutiva vacía no guía al primer paso | Media |
| Acordeón de campos avanzados también en **edición** | Hoy solo en creación (empresa, contacto, oportunidad, campaña) | Baja |
| Unificar textos “Crear empresa” vs “Nueva empresa” | Onboarding usa “Crear”; listas usan “Nueva” | Baja |
| Copiloto cuando OpenAI no está activo | Botón deshabilitado; falta flujo alternativo más rico | Media |
| Links desde Compliance (trazabilidad IA) al detalle de entidad | Hoy muestra tipo de entidad sin link directo | Media |
| Filtro dedicado por empresa/campaña en pipeline | Hoy se usa búsqueda por texto (`?q=`) | Baja |

Detalle de auditorías: [ux-audit.md](./ux-audit.md), [navigation-audit.md](./navigation-audit.md).

---

## 2. Pendientes técnicos

| Pendiente | Notas |
|-----------|--------|
| Validación Playwright completa antes de push | En curso con Claude; incluye suite E2E y walkthrough visual |
| Revisar sesión perdida en test visual si aparece | Puede ocurrir en `manual-system-walkthrough` en entornos lentos |
| Limpiar datos QA si se acumulan | El test manual crea registros con sufijo QA |
| Confirmar build en CI tras FASE 12E | type-check y unit OK en desarrollo; build interrumpido en una corrida local |

---

## 3. Decisiones tomadas

Decisiones explícitas del producto (no son bugs):

| Decisión | Motivo |
|----------|--------|
| **No activar OpenAI todavía** | Validar flujo comercial, compliance y UX antes de IA generativa en producción |
| **No agregar WhatsApp todavía** | Foco en orden interno del equipo, no en canales externos |
| **No agregar scraping todavía** | Datos cargados manualmente o por integraciones futuras controladas |
| **Prioridad actual: facilidad de uso y claridad operativa** | Fases 12D, 12E y 12F sobre nuevas features grandes |

Principio rector: **el sistema no reemplaza al asesor; ordena, prioriza y ayuda a decidir mejor.**

---

## 4. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Muchas mejoras UX acumuladas antes de Playwright completo | Completar validación E2E con Claude antes de push a remoto |
| Datos QA pueden ensuciar la demo | Revisar listas antes de demo; limpiar registros con sufijo QA |
| Credenciales de test visibles en logs o capturas | Rotar contraseñas; ver [admin-checklist.md](./admin-checklist.md) |
| Usuario interpreta “IA no configurada” como sistema roto | Manual y copy en Copiloto lo aclaran; reforzar en demo |
| Mezcla modo demo y datos reales | Explicar diferencia (ver [user-manual.md](./user-manual.md) §7) |

---

## Cómo actualizar este documento

1. Al cerrar una fase, mover ítems resueltos a [release-notes.md](./release-notes.md).
2. Agregar nuevos pendientes con contexto y prioridad.
3. No usar este archivo para secrets ni credenciales.
