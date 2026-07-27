---
Proyecto: Plife Uruguay
Tipo de artefacto: Auditoría puntual — Recorrido sugerido (/app/demo)
Versión: 1.0
Fecha: 2026-07-24
Responsable: Daniel Odella
Ejecutor: Claude Code
Modelo IA utilizado: Claude Sonnet 5 (model id: claude-sonnet-5)
Rama auditada: feat/lead-first-crm
Alcance: solo lectura y análisis de código y documentación. No se modificó código.
Documento relacionado: docs/auditoria/PLIFE-AUDITORIA-360-V1.md
---

# Auditoría — ¿El "recorrido sugerido" está al día?

**Objeto auditado:** `src/app/app/demo/page.tsx` — la pantalla `/app/demo`, título en UI "**Recorrido sugerido para la demo**", 7 pasos con links a otras pantallas del sistema. Documentación y tests asociados: `docs/product/screen-map.md` (§ `/app/demo`), `docs/product/internal-demo-script.md`, `docs/product/qa-before-demo.md`, `tests/e2e/demo-guided-flow.spec.ts`, `tests/e2e/first-impression.spec.ts`.

**Veredicto corto:** el recorrido **no está actualizado ni es adecuado al estado actual del proyecto**. Ningún paso está roto en el sentido de "código que no compila", pero la pantalla quedó huérfana de navegación, no cubre el foco estratégico actual del producto (Leads/Propuestas/Pólizas), y su documentación y tests de soporte arrastran referencias a una sección (Compliance) que ya no existe.

---

## 1. Hallazgo alto — el recorrido es inalcanzable desde la UI

`/app/demo` no tiene ningún link de entrada en toda la aplicación (`grep -rn "app/demo" src` no devuelve nada fuera del propio archivo). El commit `1af96a4 chore: remove visible demo affordances` (2026-07-08) quitó el ítem de navegación correspondiente del sidebar, pero **no tocó ni eliminó `src/app/app/demo/page.tsx`**: la pantalla quedó viva en el código pero sin puerta de entrada — solo es alcanzable escribiendo la URL a mano.

`docs/product/screen-map.md:33` sigue documentando lo contrario: *"Nombre visible: Recorrido demo (solo visible si `NEXT_PUBLIC_DEMO_MODE` está activo)"*. Eso ya no es así — no aparece en el sidebar exista o no ese flag. `screen-map.md` está desactualizado en este punto (consistente con el hallazgo de drift documental de la auditoría 360, `PLIFE-AUDITORIA-360-V1.md` §3).

## 2. Hallazgo alto — no refleja el foco actual del producto

De las ~16 pantallas principales bajo `/app` (excluyendo el propio `/app/demo`), el recorrido cubre 7: Hoy, Radar B2B, Empresa (detalle), Oportunidades, Campañas, Copiloto, Dirección.

**Omite, entre otras, exactamente las que hoy son más relevantes:**
- **Leads y Propuestas** (`/app/leads`, `/app/propuestas`) — el flujo "Lead-first" es el foco explícito de la rama `feat/lead-first-crm` (ver `PLIFE-AUDITORIA-360-V1.md` §4), con persistencia real en Supabase, y no aparece en absoluto en el recorrido comercial.
- **Pipeline** (`/app/pipeline`), la vista de etapas de ese mismo flujo.
- **Pólizas** (`/app/polizas` y subrutas) — módulo agregado en el último commit de la rama (`f1023eb feat(polizas): add policy artifact and initial management UI`, mismo día de esta auditoría), con prototipo visual completo (Listado, Ficha, Renovaciones, Documentación, Configuración). Es, junto con Leads/Propuestas, lo más nuevo del repo y no está mencionado.
- Contactos, Conocimiento e IA/Motores comerciales (`/app/ia`) tampoco aparecen; son omisiones más discutibles pero también ausentes.

Un recorrido pensado para "mostrar el valor comercial de punta a punta" que omite el módulo que la propia rama declara como su foco (Lead-first) y el módulo recién agregado (Pólizas) ya no representa punta a punta el producto actual.

## 3. Hallazgo medio — el guion interno complementario referencia una pantalla eliminada

`docs/product/internal-demo-script.md` (fechado **2026-07-01, FASE 12H**) es el guion paso a paso que un facilitador seguiría junto al recorrido en pantalla. Su paso 8 es:

```
## 8. Compliance (~1,5 min)
**Ruta:** `/app/compliance`
```

Esa ruta **no existe en el código actual** — fue removida por `7b63754 refactor: remove compliance section and flow`. Seguir este guion en vivo termina en un enlace roto. `docs/product/qa-before-demo.md` (checklist previo a hacer una demo) también tiene una sección `### 9. Compliance (/app/compliance)` y un ítem *"Link a Compliance desde acciones rápidas"* — mismo problema.

## 4. Hallazgo bajo — el propio test E2E del recorrido quedó a medio depurar

`tests/e2e/demo-guided-flow.spec.ts` valida el recorrido, pero conserva remanentes de cuando existía el paso de Compliance:

- El test `3.` se titula *"/app/demo tiene los **8 pasos** del recorrido"* pero el array `pasos` que verifica solo tiene 7 elementos — igual al código actual (`steps.length === 7`). El título quedó desactualizado, no el chequeo en sí.
- El array `valores` del test `4.` incluye `/regulatoria/i`, un texto que ya no corresponde a ningún paso (era el value-copy del paso Compliance). No rompe el test porque ese chequeo solo anota si el texto no aparece, en vez de fallar — pero es una aserción huérfana.
- La numeración de tests salta de `8.` a `11.` (faltan `9.` y `10.`): quedaron huecos de tests eliminados sin renumerar el resto del archivo.

Ninguno de estos tres puntos hace fallar el CI hoy, pero son señal de que el archivo no se revisó por completo al remover Compliance del producto.

## 5. Hallazgo bajo / a confirmar — posible inconsistencia con el nuevo "universo demo" en curso

Hay trabajo en curso sin commitear (`src/lib/demo/universe.ts`, `pools.ts`, `prng.ts`, todos `??` en `git status`) que reemplaza los datos de varias pantallas por un dataset sintético cuando `NEXT_PUBLIC_DEMO_MODE=true` — flag que **hoy está en `true` en `.env.local`**. Esa integración ya toca `/app/empresas`, `/app/contactos`, `/app/oportunidades`, `/app/campanas`, `/app/direccion`, `/app/hoy`, `/app/leads`, `/app/propuestas`, `/app/admin` y `/app/polizas/*`, pero **no** toca `/app/radar-b2b` ni `/app/empresas/[id]` (ambas rutas usadas por los pasos 2 y 3 del recorrido), que siguen consultando Supabase directo.

Consecuencia observable: bajo la configuración actual del repo, `/app/empresas` (lista) ya muestra compañías sintéticas con id `emp-1`, `emp-2`, ... mientras que el paso 3 del recorrido sigue apuntando a un id fijo de `seed-demo.sql` (`b0000000-0000-0000-0000-000000000002`) y Radar B2B sigue mostrando datos reales de Supabase. El resultado es que, con el rollout parcial actual, la "empresa priorizada" que ve un usuario en `/app/empresas` y la que abre el recorrido no tienen por qué coincidir — no es (todavía) un link roto en sentido estricto, pero si el rollout del universo demo se completa sin actualizar el `DEMO_COMPANY` hardcodeado del recorrido, sí lo será. Vale la pena confirmarlo cuando esa migración a `src/lib/demo/*` se termine y se commitee.

## 6. Lo que sí está al día

Los pasos 1, 2, 4, 5, 6 y 7 apuntan a rutas que existen y están operativas (`/app/hoy`, `/app/radar-b2b`, `/app/oportunidades`, `/app/campanas`, `/app/copiloto`, `/app/direccion`), y el copy de cada paso describe correctamente lo que esas pantallas hacen hoy (sin mocks visibles, terminología consistente con el resto del producto). El problema no es que lo que muestra esté mal — es que dejó de estar completo y dejó de ser accesible.

---

## Recomendación priorizada

1. **Decidir el destino de `/app/demo` antes que su contenido**: si sigue siendo una pantalla de presentación viva, restaurar un punto de entrada (o documentar explícitamente que es solo por URL directa); si quedó obsoleta con la remoción de "demo affordances" (1af96a4), eliminarla junto con su test y sus docs asociadas en vez de dejarla huérfana.
2. Si se mantiene: **agregar pasos para Leads → Propuestas (flujo Lead-first) y para Pólizas**, que hoy son el trabajo más reciente y estratégico del repo y no aparecen.
3. Reescribir o retirar la sección Compliance de `internal-demo-script.md` y `qa-before-demo.md` (mismo drift ya señalado a nivel general en `PLIFE-AUDITORIA-360-V1.md` §3, pero aquí con impacto directo: un facilitador siguiendo el guion literal pisa un 404).
4. Limpiar `tests/e2e/demo-guided-flow.spec.ts`: corregir el título del test 3 ("7 pasos"), quitar `/regulatoria/i` de `valores`, y renumerar o documentar por qué faltan los tests `9.`/`10.`.
5. Cuando se cierre la integración de `src/lib/demo/universe.ts`, confirmar que el `DEMO_COMPANY` hardcodeado del recorrido siga resolviendo a una empresa real dentro de ese universo (o generarlo dinámicamente en vez de hardcodearlo).
