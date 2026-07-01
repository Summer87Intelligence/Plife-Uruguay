# Validation Audit — PLIFE Growth OS (FASE 12K)

Auditoría de validaciones en formularios de Empresa, Contacto, Oportunidad y Campaña.

## Empresa (`company-form.tsx`)

| Campo | Obligatorio | Validación actual | Problema | Mejora (12K) | Prioridad | Riesgo técnico |
|---|---|---|---|---|---|---|
| Nombre | Sí | `required` HTML5 | Acepta solo espacios | Trim + mensaje claro | Alta | Bajo |
| Rubro | No | Ninguna | Sin feedback si vacío | Advisory inline (pendiente) | Media | Bajo |
| Ciudad | No | Ninguna | Acepta espacios | Trim en payload | Baja | Bajo |
| Potencial comercial | No | `min={0} max={100}` HTML5 | Acepta valores fuera de rango si escribe directo | Validar rango + mensaje | Media | Bajo |
| Cant. empleados | No | `min={1}` HTML5 | Acepta 0 si escribe directo | Validar positivo + mensaje | Baja | Bajo |

**Validaciones pendientes (requiere backend/schema):**
- Unicidad del nombre de empresa (evitar duplicados)
- Validación de URLs (website, linkedin)

---

## Contacto (`contact-form.tsx`)

| Campo | Obligatorio | Validación actual | Problema | Mejora (12K) | Prioridad | Riesgo técnico |
|---|---|---|---|---|---|---|
| Nombre | Sí | `required` HTML5 | Acepta solo espacios | Trim + mensaje claro | Alta | Bajo |
| Apellido | Sí | `required` HTML5 | Acepta solo espacios | Trim + mensaje claro | Alta | Bajo |
| Email | No | `type="email"` HTML5 | Variable por browser; acepta `test@` en algunos casos | Regex `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/` | Alta | Bajo |
| Teléfono | No | Ninguna | Acepta cualquier string | No bloqueante; aceptar espacios/guiones | Baja | Ninguno |
| Empresa asociada | No | Ninguna | Sin validación | Opcional; OK así | Baja | Ninguno |

**Validaciones pendientes (requiere backend/schema):**
- Unicidad del email (evitar duplicados de contacto)

---

## Oportunidad (`opportunity-form.tsx`)

| Campo | Obligatorio | Validación actual | Problema | Mejora (12K) | Prioridad | Riesgo técnico |
|---|---|---|---|---|---|---|
| Título | Sí | `required` HTML5 | Acepta solo espacios | Trim + mensaje claro | Alta | Bajo |
| Tipo | Sí | Preseleccionado | Siempre tiene valor | OK | — | — |
| Etapa | Sí | Preseleccionada | Siempre tiene valor | OK | — | — |
| Valor estimado | No | `type="number" min={0}` | Acepta negativos si escribe directamente | Validar numérico ≥ 0 | Media | Bajo |
| Próximo paso | No | Ninguna | Fecha sin paso es inconsistente | Error si hay fecha y no hay paso | Media | Bajo |
| Fecha de seguimiento | No | `type="date"` HTML5 | Sin validación de consistencia con paso | Pendiente servidor | Baja | — |

**Validaciones pendientes (requiere lógica adicional):**
- Advertencia soft cuando etapa avanzada pero sin próximo paso (no bloqueante)
- Validación de fecha pasada como advertencia (no bloqueante)

---

## Campaña (`campaign-form.tsx`)

| Campo | Obligatorio | Validación actual | Problema | Mejora (12K) | Prioridad | Riesgo técnico |
|---|---|---|---|---|---|---|
| Nombre | Sí | `required` HTML5 | Acepta solo espacios | Trim + mensaje claro | Alta | Bajo |
| Objetivo comercial | Recomendado | Ninguna | Se puede crear una campaña sin objetivo | Requerir + mensaje | Alta | Bajo |
| Segmento | Recomendado | Ninguna | Se puede omitir sin aviso | Advisory (pendiente) | Media | Bajo |
| Fecha fin < inicio | No bloqueante | Ninguna | Rango de fechas inválido posible | Validar rango | Media | Bajo |

**Validaciones pendientes:**
- Segmento recomendado pero no obligatorio (advisory sin bloquear)
- Consistencia de fechas inicio/fin a nivel servidor

---

## Feedback de guardado (estado actual)

| Formulario | Éxito (create) | Éxito (edit) | Error servidor |
|---|---|---|---|
| Empresa | `CreateSuccessPanel` ✓ | Cierra dialog | `result.error` mostrado |
| Contacto | `CreateSuccessPanel` ✓ | Cierra dialog | `result.error` mostrado |
| Oportunidad | `CreateSuccessPanel` ✓ | Cierra dialog | `result.error` mostrado |
| Campaña | `CreateSuccessPanel` ✓ | Cierra dialog | `result.error` mostrado |

**Problema:** El error de servidor es genérico y no orienta al usuario a qué campo corregir. Las validaciones inline de 12K resuelven el caso más común (datos incompletos).

**Mejora implementada en 12K:** Validación inline por campo antes de enviar al servidor, con mensajes en español y bloqueo de submit hasta que los datos son válidos.
