# Guía de tono y textos — PLIFE Growth OS

**Versión:** FASE 12H  
**Última actualización:** 2026-07-01

Cómo escribir dentro del sistema para que asesores, líderes y dirección entiendan sin jerga innecesaria.

---

## 1. Principios

1. **Claro antes que técnico** — El usuario comercial no necesita saber cómo funciona por detrás; necesita saber qué hacer.
2. **Orientar al próximo paso** — Cada pantalla, empty state y mensaje de éxito debe sugerir la acción siguiente.
3. **No prometer resultados comerciales** — Evitar “vas a cerrar”, “garantizado”, “100% de conversión”.
4. **No decir que la IA reemplaza asesores** — La IA asiste; el asesor decide y cierra.
5. **Evitar jerga innecesaria** — Si un término no lo usaría un líder comercial en una reunión, no va en la UI.
6. **Hablar de potencial, seguimiento y decisión** — El sistema ordena y prioriza; no vende solo.

---

## 2. Palabras recomendadas

Usar de forma consistente en toda la aplicación (fuera de Admin):

| Término | Uso |
|---------|-----|
| **empresa** | Organización B2B prospecto o cliente |
| **contacto** | Persona con la que se habla |
| **oportunidad** | Conversación comercial concreta |
| **campaña** | Acción comercial por segmento |
| **seguimiento** | Próxima acción con fecha |
| **próximo paso** | Qué hacer después |
| **potencial comercial** | Prioridad o interés estimado |
| **mensaje seguro** | Texto revisado sin riesgos graves |
| **revisión** | Compliance u otra validación humana |
| **dirección** | Vista ejecutiva del negocio |
| **asesor** | Usuario que opera el día a día |
| **etapa** | Fase del pipeline |
| **responsable** | Quien lleva la oportunidad |
| **segmento** | Grupo objetivo de una campaña |
| **objetivo** | Meta de la campaña (reuniones, cierres, etc.) |

---

## 3. Palabras a evitar fuera de Admin

No mostrar en pantallas comerciales (`/app/hoy`, empresas, contactos, oportunidades, campañas, radar, compliance, copiloto, conocimiento, dirección):

| Evitar | Motivo |
|--------|--------|
| embedding | Técnico de IA |
| fallback | Técnico de ingeniería |
| provider | Técnico de APIs |
| prompt | Técnico de IA |
| SQL | Base de datos |
| RLS | Seguridad Supabase |
| GRANT | Permisos DB |
| debug | Desarrollo |
| raw | Datos sin procesar |
| OPENAI_API_KEY | Secreto / config |
| service_role | Secreto / config |
| token | Auth técnico |
| schema | Base de datos |
| migration | Despliegue técnico |
| webhook | Integración técnica |

**Excepción:** `/app/admin` y `/app/admin/system` pueden usar lenguaje técnico con audiencia admin.

---

## 4. Reemplazos

| No usar | Usar en su lugar |
|---------|------------------|
| ICP | Perfil de cliente |
| Score | Potencial comercial |
| Scoring | Priorización |
| Stage | Etapa |
| Owner | Responsable |
| Submit | Guardar |
| Error | No pudimos completar la acción |
| Failed | No se pudo guardar |
| Loading… | Cargando… |
| No data | Todavía no hay registros |
| 404 | No encontramos esta página |
| 500 | Algo salió mal. Probá de nuevo o contactá a soporte. |
| AI not configured | IA avanzada no está activa en este entorno |
| Unauthorized | No tenés permiso para ver esto |

---

## 5. Ejemplos de buen copy

### Empty states
- “Todavía no hay empresas. Creá la primera para empezar a armar tu pipeline.”
- “Sin oportunidades activas. Cuando tengas una conversación comercial concreta, registrá una oportunidad.”

### Orientación
- “Creá una oportunidad cuando exista una conversación comercial concreta.”
- “Siguiente paso recomendado: agregar un contacto.”
- “¿Por dónde empiezo? Seguí estos pasos para ordenar tu trabajo.”

### Compliance
- “Revisá el mensaje antes de enviarlo para evitar promesas riesgosas.”
- “Esta revisión no aprueba la venta automáticamente. Te ayuda a detectar riesgos en el texto.”

### Copiloto
- “La IA avanzada puede estar desactivada en este entorno. Es una decisión de control, no un error del sistema.”
- “Usá el copiloto para preparar la conversación. Vos decidís qué enviar al cliente.”

### Post-creación
- “Empresa creada. ¿Querés agregar un contacto o crear una oportunidad?”
- “Oportunidad registrada. Definí el próximo paso para no perder el seguimiento.”

### Radar
- “Empresas ordenadas por potencial comercial. Revisá el análisis antes de contactar.”

---

## 6. Ejemplos a evitar

| Mal copy | Por qué | Mejor alternativa |
|----------|---------|-------------------|
| “IA no configurada por falta de OPENAI_API_KEY” | Expone config técnica | “IA avanzada no está activa en este entorno.” |
| “SQL pendiente” | Jerga de desarrollo | “Esta función estará disponible próximamente.” *(solo si es futuro real)* |
| “Error inesperado” | No orienta | “No pudimos completar la acción. Probá de nuevo.” |
| “Submit” | Inglés en botón | “Guardar” |
| “Score: 87” | Jerga | “Potencial comercial: Alto” |
| “Stage: qualified” | Inglés | “Etapa: Calificada” |
| “Owner: user_abc123” | Técnico | “Responsable: María González” |
| “Embedding failed” | Técnico | “No pudimos indexar el documento. Revisá el archivo e intentá de nuevo.” |
| “RLS policy denied” | Técnico | “No tenés permiso para ver este registro.” |
| “Garantizamos el mejor resultado” | Promesa comercial | “Te ayudamos a priorizar oportunidades con mejor seguimiento.” |

---

## 7. Tono por audiencia

| Rol | Tono |
|-----|------|
| **Asesor** | Directo, accionable, “vos”, próximo paso claro |
| **Líder comercial** | Supervisión, métricas de equipo, campañas |
| **Dirección** | Ejecutivo, pipeline, foco estratégico |
| **Admin** | Puede ser técnico; preciso y diagnóstico |

---

## 8. Formularios

- Labels en español: “Nombre de la empresa”, no “Company name”.
- Placeholders como ejemplo, no como label: “Ej. Estudio contable en Montevideo”.
- Botones: **Guardar**, **Cancelar**, **Nueva empresa** — no Save/Cancel/Create.
- Validación: “El nombre es obligatorio”, no “Required field”.
- Campos avanzados: dentro de `<details>` con título “Campos opcionales” o “Más opciones”.

---

## 9. Futuro (marcar explícitamente)

Si una función no existe aún, usar:
- “Próximamente”
- “En desarrollo”
- “Disponible en una próxima versión”

No inventar capacidades ni prometer integraciones (WhatsApp, scraping, cotización automática) como si ya estuvieran activas.

---

## Referencias

- [screen-map.md](./screen-map.md)  
- [ux-audit.md](./ux-audit.md)  
- [user-manual.md](./user-manual.md)
