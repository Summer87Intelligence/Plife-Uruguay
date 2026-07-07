# Próximos sprints — PLIFE Growth OS

> **Histórico (FASE 15B):** OpenAI fue removido del proyecto. Las menciones a OpenAI / GPT / `OPENAI_API_KEY` son registro histórico; los motores operan en modo determinístico interno.

**Versión:** FASE 12G  
**Última actualización:** 2026-07-01

Plan de trabajo ordenado después de FASE 12D–12F. Cada sprint tiene un objetivo claro; no avanzar al siguiente sin cerrar el criterio de salida del anterior.

---

## Sprint A — Validación técnica acumulada

**Objetivo:** Validar todo el trabajo UX acumulado antes de push a remoto.

| # | Tarea | Responsable sugerido | Criterio de hecho |
|---|-------|----------------------|-------------------|
| A1 | Correr `npm run test:e2e` completo | Claude | Suite verde o issues documentados |
| A2 | Correr `npm run test:e2e:manual:system` (visual) | Claude | Walkthrough OK o fallos registrados |
| A3 | Revisar y corregir fallos de Playwright | Dev + Claude | Sin bloqueantes P0 |
| A4 | Confirmar `type-check`, `build`, `test:unit` en rama local | Dev | Los tres OK |
| A5 | Push a remoto (cuando A1–A4 estén OK) | Dev | Rama actualizada |
| A6 | Verificar deploy Vercel post-push | Admin | URL carga, login OK |

**No hacer push** hasta cerrar A1–A4.

**Salida:** [release-notes.md](./release-notes.md) actualizado con estado Playwright real.

---

## Sprint B — Validación de usabilidad

**Objetivo:** Que una persona **no técnica** pruebe el sistema sin guión largo.

| # | Tarea | Responsable sugerido | Criterio de hecho |
|---|-------|----------------------|-------------------|
| B1 | Elegir evaluador (ideal: perfil asesor o líder comercial) | Producto | Persona y fecha agendada |
| B2 | Usar [feedback-log-template.md](./feedback-log-template.md) | Facilitador | Plantilla completa |
| B3 | Sesión: exploración libre 5–10 min + flujo guiado mínimo | Facilitador | Grabación o notas |
| B4 | Observar sin explicar demasiado | Facilitador | Citas textuales registradas |
| B5 | Registrar confusiones por pantalla | Producto | Tabla de observaciones llena |
| B6 | Priorizar top 3 en [product-backlog.md](./product-backlog.md) | Producto | Ítems P1 actualizados |

**Salida:** decisión claro / confuso / mixto + ítems P1 con evidencia.

---

## Sprint C — Ajustes por feedback

**Objetivo:** Corregir **solo** lo que generó confusión real en Sprint B (no nuevas features).

| # | Tarea | Responsable sugerido | Criterio de hecho |
|---|-------|----------------------|-------------------|
| C1 | Ajustar textos (títulos, botones, empty states) | Dev | Cambios acotados a copy/UX |
| C2 | Simplificar pantallas señaladas | Dev | Sin tocar schema ni integraciones |
| C3 | Corregir flujos rotos o links muertos | Dev | Flujo empresa→contacto→opp OK |
| C4 | Re-ejecutar tests automáticos | Dev | type-check + build + unit OK |
| C5 | Re-validar con evaluador (opcional, 15 min) | Producto | Mejora confirmada o cerrada |

**Regla:** si no salió en feedback, no se implementa en este sprint.

---

## Sprint D — Preparación para PLIFE

**Objetivo:** Armar demo y propuesta de valor para presentación a PLIFE.

| # | Tarea | Responsable sugerido | Criterio de hecho |
|---|-------|----------------------|-------------------|
| D1 | Guion de demo (15–20 min) basado en [user-manual.md](./user-manual.md) | Producto | Guion escrito |
| D2 | Ejemplo único: Estudio Pérez → Martín → Protección socios → Compliance | Producto | Datos cargados en entorno demo |
| D3 | Documento de propuesta / valor (1–2 páginas) | Producto | PDF o MD listo |
| D4 | Roadmap piloto (90 días) | Producto | Alcance, roles, métricas |
| D5 | Objeciones y respuestas (IA, WhatsApp, “¿reemplaza al asesor?”) | Producto | FAQ interno |
| D6 | [admin-checklist.md](./admin-checklist.md) + [qa-before-demo.md](./qa-before-demo.md) ejecutados | Admin | Checklist firmado |

**Mensaje clave:** el sistema **ordena, prioriza y ayuda a decidir** — no reemplaza al asesor.

---

## Sprint E — IA real e integraciones

**Objetivo:** Evaluar activación de OpenAI, WhatsApp y fuentes externas.

**Condición de entrada:** Sprints A, B y D cerrados; flujo principal validado con PLIFE o stakeholders.

| # | Tarea | Responsable sugerido | Criterio de hecho |
|---|-------|----------------------|-------------------|
| E1 | Decisión go/no-go OpenAI | Dirección + Producto | Acta o nota de decisión |
| E2 | Si go: configurar IA en entorno controlado | Admin | Copiloto genera sugerencia de prueba |
| E3 | Evaluar WhatsApp (solo diseño / spike) | Producto | Documento “futuro” en backlog P3 |
| E4 | Evaluar scraping / radar externo (solo diseño) | Producto | No implementar sin política de datos |
| E5 | Actualizar [known-issues.md](./known-issues.md) y release notes | Producto | Estado documentado |

**No iniciar Sprint E** por entusiasmo técnico antes de validar el flujo sin IA.

---

## Vista cronológica

```
Sprint A (técnico)  →  Sprint B (usabilidad)  →  Sprint C (ajustes)
                                                        ↓
                                              Sprint D (demo PLIFE)
                                                        ↓
                                              Sprint E (IA / integraciones)
```

---

## Estado actual (snapshot)

| Sprint | Estado |
|--------|--------|
| A | **En curso** — Playwright pendiente con Claude; commits locales sin push |
| B | Pendiente — espera cierre A |
| C | Pendiente — espera feedback B |
| D | Pendiente — puede prepararse en paralelo con B (guion solo) |
| E | Futuro — condicionado |

---

## Referencias

- [product-backlog.md](./product-backlog.md)  
- [role-matrix.md](./role-matrix.md)  
- [feedback-log-template.md](./feedback-log-template.md)  
- [data-cleanup-guide.md](./data-cleanup-guide.md)
