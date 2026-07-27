# FASE 14M — Estrategia de release para el PR Lead-first

**Fecha:** 2026-07-07
**Rama:** `feat/operational-readiness`
**PR:** #2 (OPEN) — https://github.com/Summer87Intelligence/Plife-Uruguay/pull/2
**Roles:** Release Manager + Tech Lead
**Restricciones:** no código · no commits (salvo este doc) · no push · no merge · no Supabase · no Vercel.

---

## 1. Estado actual del PR #2

| Métrica | Valor |
|---|---|
| Estado | OPEN, auto-merge disabled |
| Base | `origin/main` |
| Head | `feat/operational-readiness` (último commit `770c792`) |
| Commits totales (`origin/main..head`) | **32** |
| — de los cuales FASE 13 (operational readiness) | **13** (`b02ddbb` → `e707989`) |
| — de los cuales FASE 14 (Lead-first) | **19** (`5005186` → `770c792`) |
| Archivos cambiados | **127** (+11898 / −132) |
| Archivos de leads/pipeline (FASE 14) | ~49 |
| SQL de leads (dev only) | 3 (`leads-schema-draft.sql`, `leads-rls-soft-delete-fix-14gb.sql`, `leads-dev-seed-14hb.sql`) |
| Checks CI | `quality` pass · `Vercel` pass · `Vercel Preview Comments` pass |

**Composición:** el PR mezcla **dos bloques de madurez muy distinta**:

- **FASE 13 — Operational readiness:** funcional sobre el flujo vigente, ya auditado en su momento (`local-predeploy-audit-2026-07-03.md`), open access ahora detrás de feature flag. **Candidato razonable a producción.**
- **FASE 14 — Lead-first CRM:** funciona **solo en Supabase dev**, schema no aplicado en producción, `database.ts` editado a mano, y con varios items **NO-GO** (conversión real, soft-delete UI, drag/drop). **No apto para main/producción.**

---

## 2. Opciones

### Opción A — Mantener PR #2 como rama grande de integración
Un único PR con FASE 13 + FASE 14 hasta que todo esté listo.

### Opción B — Separar Lead-first en un PR nuevo
Extraer los 19 commits de FASE 14 a una rama dedicada (`feat/lead-first`) con su propio PR, dejando PR #2 acotado a FASE 13.

### Opción C — Mergear solo FASE 13 y dejar FASE 14 para otra rama
Decisión de release: FASE 13 avanza a main; FASE 14 espera en su propia rama hasta cerrar los NO-GO.

> **Nota:** B y C son complementarias. B es el **mecanismo** (dividir ramas/PRs); C es la **decisión de merge** (13 puede ir, 14 espera). La recomendación combina ambas.

---

## 3. Pros y contras

### Opción A (rama grande)
**Pros**
- Cero trabajo de git ahora; todo el contexto vive en un PR.
- Historial lineal ya pusheado y con checks verdes.

**Contras**
- **Bloquea el valor de FASE 13** (listo) detrás de FASE 14 (no listo).
- Review difícil: 127 archivos y 32 commits de madurez mixta.
- Riesgo de merge accidental que arrastre schema dev/`database.ts` manual a main.
- El PR queda "estacionado" indefinidamente hasta que Lead-first madure.

### Opción B (split en PR nuevo)
**Pros**
- Aísla Lead-first como unidad de review independiente y explícitamente NO-GO.
- Permite iterar FASE 14 (conversión, soft-delete, drag/drop) sin tocar el PR de FASE 13.
- Reduce el blast radius de un merge.

**Contras**
- Requiere trabajo de git (ramas nuevas / repunte de PR).
- FASE 14 deberá rebasarse sobre main una vez mergeada FASE 13.

### Opción C (merge solo FASE 13)
**Pros**
- Entrega ya el valor operativo estable a main/producción.
- Deja FASE 14 fuera de producción, respetando su estado NO-GO.
- Alineada con el veredicto de la auditoría 14L.

**Contras**
- Necesita confirmar que FASE 13 es realmente production-ready (open access flag, deuda E2E).
- Introduce un punto de divergencia que obliga a rebasar FASE 14.

---

## 4. Riesgos

| Riesgo | Opción A | Opción B | Opción C |
|---|---|---|---|
| Merge arrastra schema dev a prod | **Alto** | Bajo | Bajo |
| `database.ts` manual desincronizado en prod | **Alto** | Medio | Bajo (queda fuera) |
| UI Lead-first no funcional en prod (tabla `leads` inexistente) | **Alto** (degradada: `getLeads` devuelve `[]` por manejo de error, sin crash, pero expone UI incompleta) | Bajo | Bajo |
| Review poco claro / fatiga de revisor | **Alto** | Bajo | Bajo |
| Retraso del valor de FASE 13 | **Alto** | Bajo | **Nulo** |
| Complejidad de git / posible force-push | Nula | Media | Media |
| Pérdida de historial | Nula | Baja (ramas preservadas) | Baja |

**Nota de reversibilidad:** los commits de FASE 14 son **lineales y aditivos** sobre FASE 13 (`5005186..770c792`), y sus archivos están concentrados en `src/domains/leads`, `src/components/leads`, `src/app/app/leads`, `src/app/app/pipeline`, `supabase/leads-*` más adiciones acotadas (`database.ts`, `button.tsx`, sidebar, `hoy`). Esto hace el **split técnicamente sencillo y de bajo riesgo**.

---

## 5. Recomendación final

**Opción B, ejecutando el resultado de la Opción C.**

Separar Lead-first en un PR dedicado y permitir que FASE 13 avance a main por su cuenta.

**Justificación:**
- Desbloquea de inmediato el valor **estable y auditado** de FASE 13.
- Mantiene Lead-first como una unidad de review clara y **explícitamente NO-GO**, sin riesgo de arrastrarla a producción.
- El split es barato y seguro por la naturaleza lineal/aditiva de los commits de FASE 14.
- Alinea la estructura de PRs con la madurez real de cada bloque y con el veredicto de la auditoría 14L.

**Opción A queda descartada** por bloquear FASE 13 y concentrar riesgo de merge. **Opción C sola** (sin B) es válida pero deja FASE 14 sin un contenedor de review propio; por eso se combina con B.

---

## 6. Pasos concretos (para ejecutar cuando se autorice — NO en esta fase)

> Ninguno de estos pasos se ejecuta ahora. Requieren autorización explícita. Variante preferida: **sin force-push**, creando ramas nuevas para no reescribir la rama ya pusheada.

### Paso 0 — Confirmar production-readiness de FASE 13
- Revisar el feature flag de open access (debe quedar cerrado para producción externa).
- Revisar deuda `E2E_BASE_URL` documentada en el PR original.

### Paso 1 — Preservar Lead-first en su rama dedicada
```
git branch feat/lead-first 770c792
git push origin feat/lead-first
```
- Abrir PR "feat: Lead-first CRM (dev only)" → base `main`, marcado **draft / NO-GO**, reutilizando el body de FASE 14 del PR #2 y el doc de auditoría 14L.

### Paso 2 — Acotar la entrega de FASE 13 a main
Variante A (sin reescribir la rama pusheada — **preferida**):
```
git branch feat/operational-readiness-13 e707989
git push origin feat/operational-readiness-13
```
- Abrir/repuntar un PR de FASE 13 (`feat/operational-readiness-13` → `main`) con el body original 13A–13I.
- Cerrar PR #2 dejando comentario que enlaza a los dos PRs sucesores.

Variante B (reescribe la rama pusheada — solo si se acepta force-push a feature branch):
```
git checkout feat/operational-readiness
git reset --hard e707989
git push --force-with-lease origin feat/operational-readiness
```
- PR #2 queda automáticamente acotado a FASE 13.
- **No recomendada** salvo autorización explícita (reescribe historia ya publicada).

### Paso 3 — Mergear FASE 13 a main (cuando pase review)
- Merge del PR de FASE 13.

### Paso 4 — Rebasar Lead-first sobre main actualizado
```
git checkout feat/lead-first
git rebase origin/main
```
- Resolver conflictos (esperados mínimos: `database.ts`, `button.tsx`, sidebar, `hoy`).
- Continuar el desarrollo de FASE 14 (conversión real, soft-delete UI, drag/drop, regenerar tipos con CLI autenticado, aplicar schema a prod con guía) hasta levantar el NO-GO.

---

## 7. Recordatorio de estado NO-GO (Lead-first)

- Soft-delete authenticated: **NO-GO**.
- Conversión real lead → oportunidad: pendiente.
- Drag/drop de pipeline: pendiente.
- Tipos Supabase editados manualmente (falta `SUPABASE_ACCESS_TOKEN`).
- Schema aplicado solo en dev, no en producción.

> Esta fase (14M) solo documenta la estrategia. No mergea, no pushea, no toca Supabase ni Vercel.
