# FASE 15G — Simplificación de la navegación del CRM

**Fecha:** 2026-07-07
**Rama:** `feat/lead-first-crm` (PR #3, draft, NO-GO para main)
**Roles:** Product Architect + UX Lead + Release Manager
**Naturaleza:** cambio de navegación/copy/docs. **No borra rutas ni código de datos.**
**Restricciones respetadas:** no main · no PR #4 · no merge · no push · no Supabase remoto · no Vercel · no `.env` · no SQL · sin OpenAI · sin reintroducir Compliance · sin borrar rutas · sin eliminar código de datos.

---

## 1. Decisión

El producto acumuló demasiadas secciones. Antes de seguir agregando features, se reduce el **menú principal** al foco actual: **Lead-first + Propuestas + Motores comerciales**. Las secciones que hoy no aportan valor operativo central se **ocultan del sidebar**, pero **sus rutas se conservan** (accesibles por URL directa y desde widgets/quick actions).

---

## 2. Menú anterior (sidebar)

PLIFE Hoy · Leads · Pipeline · Contactos · Empresas · Oportunidades · Radar B2B · Campañas · Copiloto · Conocimiento · Academia · Dirección · Admin · Motores · Propuestas · Estado del sistema.

---

## 3. Menú nuevo (visible)

1. PLIFE Hoy
2. Leads
3. Pipeline
4. Propuestas
5. Campañas
6. Motores
7. Dirección
8. Admin

(Los ítems Motores/Dirección/Admin siguen respetando los permisos de rol existentes; en modo `INTERNAL_OPEN_ACCESS` se ven todos los visibles.)

---

## 4. Secciones ocultadas del menú principal

| Sección | Ruta (conservada) | Motivo |
|---|---|---|
| Contactos | `/app/contactos` | Entidad de soporte; no es el foco operativo central |
| Empresas | `/app/empresas` | Entidad de soporte; queda interna |
| Oportunidades | `/app/oportunidades` | Downstream del pipeline Lead-first; accesible desde widgets |
| Radar B2B | `/app/radar-b2b` | Exploración; se integrará vía Propuestas/Motores |
| Copiloto | `/app/copiloto` | Asistencia puntual; el foco pasa a Motores/Propuestas |
| Conocimiento | `/app/conocimiento` | Biblioteca interna; vive detrás de Motor Aprendizaje |
| Academia | `/app/academia` | Formación; futura/interna |
| Estado del sistema | `/app/admin/system` | Diagnóstico técnico; fuera del menú, gateado a admin/dirección |

> Nota: la lista explícita del pedido incluía Empresas, Contactos, Radar B2B, Copiloto y Academia/Biblioteca. Para dejar exactamente el **menú visible recomendado (8 ítems)** también se ocultaron **Oportunidades**, **Conocimiento** y **Estado del sistema**. Todas mantienen su ruta; si se prefiere volver a mostrar alguna, basta quitarla de `HIDDEN_FROM_NAV` en `app-sidebar.tsx`.

---

## 5. Por qué se ocultan

- Reducir carga cognitiva y reforzar el recorrido central: **Lead → Pipeline → Propuesta → Campaña**, con **Motores** como apoyo y **Dirección** para foco.
- Evitar duplicar puntos de entrada mientras se consolida el modelo Lead-first.
- No perder capacidades: las rutas siguen vivas para acceso directo y desde tarjetas del dashboard.

---

## 6. Rutas NO borradas

Ninguna ruta fue eliminada. Solo se filtran del render del sidebar mediante `HIDDEN_FROM_NAV`. Los datos, páginas y server actions permanecen intactos.

Además se ajustaron **accesos primarios** en `/app/hoy`:
- CTA de cabecera: "Preparar contacto con IA" (→ Copiloto) → **"Nuevo lead"** (→ `/app/leads/new`).
- Guía "Cómo avanzar hoy": pasos y CTA reorientados a Lead → Pipeline → Propuesta.
- Guía "Flujo recomendado": primary "Ver pipeline"; secundario "Abrir Motores".
- Onboarding (`getting-started-card`): pasos Lead → Pipeline → Propuesta → Campañas.

Los **widgets de datos** del dashboard (seguimientos, oportunidades, empresas B2B, etc.) se conservan con sus enlaces, ya que muestran datos y sus rutas siguen existiendo.

---

## 7. Roles / permisos

Sin cambios en permisos. `ADMIN_ONLY` y `DIRECTION_ALLOWED` se mantienen; el filtro de simplificación se aplica antes del filtro por rol (y también en modo open-access).

---

## 8. Riesgos

- Usuarios acostumbrados a Empresas/Contactos/Oportunidades deberán acceder por URL o desde widgets hasta que se integren en el flujo Lead-first.
- Algún test/enlace externo podría asumir esas entradas de menú; se actualizó el test de sidebar y se conservaron rutas.
- El recorrido demo (`/app/demo`) sigue mostrando las secciones históricas; se revisará en una fase posterior si corresponde.

---

## 9. Próximos pasos

- Integrar Radar B2B y Empresas/Contactos como orígenes/soporte dentro de Leads y Propuestas.
- Revisar el recorrido demo para alinearlo al menú simplificado.
- Evaluar mover Conocimiento/Academia dentro de Motores (Aprendizaje/Biblioteca).
