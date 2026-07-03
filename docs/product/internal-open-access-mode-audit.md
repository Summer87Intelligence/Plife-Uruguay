# Internal Open Access Mode — Auditoría de permisos

> FASE 13D-B · 2026-07-03  
> Estado: TEMP — modo exploración interna activo

---

## 1. Rutas bloqueadas por rol antes de esta fase

| Ruta | Restricción original | Código | Bloqueaba a |
|---|---|---|---|
| `/app/ia` | `canAccessAll(profile)` | `ia/page.tsx:40` | Todo rol excepto admin/dirección |
| `/app/admin/system` | `canAccessAll(profile)` | `admin/system/page.tsx:11` | Todo rol excepto admin/dirección |
| `/app/direccion` | `role in [admin, direccion]` | `direccion/page.tsx:9` | Todo rol excepto admin/dirección |
| `/app/admin` | `role === 'admin'` | `admin/page.tsx:9` | Todo rol excepto admin |

`canAccessAll(profile)` definido en `src/lib/auth.ts:109`:
```ts
export function canAccessAll(profile: Profile): boolean {
  return ['admin', 'direccion'].includes(profile.role)
}
```

---

## 2. Items ocultos en sidebar antes de esta fase

Definido en `src/components/layout/app-sidebar.tsx`:

| Item | Constante | Visible para |
|---|---|---|
| `/app/admin` | `ADMIN_ONLY` | Solo `admin` |
| `/app/direccion` | `DIRECTION_ALLOWED` | `admin` + `dirección` |
| `/app/admin/system` | `DIRECTION_ALLOWED` | `admin` + `dirección` |
| `/app/ia` | `DIRECTION_ALLOWED` | `admin` + `dirección` |

Todos los demás items eran visibles para cualquier usuario autenticado.

---

## 3. Acciones protegidas por server actions (se mantienen protegidas)

Archivo: `src/app/app/ia/actions.ts`

Todas las acciones de configuración del Motor IA usan `requireAdmin()` interno (equivalente a `canAccessAll`). Retornan `{ error: 'Sin permisos' }` sin crash si el usuario no tiene permisos:

| Acción | Protección |
|---|---|
| `createCategory` | `requireAdmin()` |
| `updateCategory` | `requireAdmin()` |
| `createProfile` | `requireAdmin()` |
| `updateProfile` | `requireAdmin()` |
| `addPromptToProfile` | `requireAdmin()` |
| `updateProfilePrompt` | `requireAdmin()` |
| `updatePrompt` | `requireAdmin()` |
| `regeneratePromptSuggestions` | `requireAdmin()` |
| `runMockAnalysis` | `requireAdmin()` |

**Decisión:** Se mantienen protegidas. Un asesor puede ver el Motor IA pero no puede modificar prompts ni ejecutar análisis mock. El error se muestra en UI como mensaje, sin crash.

---

## 4. Qué se abrió para navegación en esta fase

| Ruta | Cambio |
|---|---|
| Sidebar | Todos los items visibles para cualquier usuario autenticado |
| `/app/ia` | Visible y navegable por cualquier usuario autenticado |
| `/app/direccion` | Visible y navegable por cualquier usuario autenticado |
| `/app/admin` | Visible y navegable por cualquier usuario autenticado |
| `/app/admin/system` | Visible y navegable por cualquier usuario autenticado |

---

## 5. Qué se mantiene protegido aunque la pantalla sea visible

| Elemento | Protección mantenida | Motivo |
|---|---|---|
| Acciones de configuración IA | Server actions `requireAdmin()` | Modificar prompts y perfiles es sensible |
| Autenticación | Middleware redirige a `/login` | Sin sesión, no se puede entrar a `/app/*` |
| RLS Supabase | Sin cambios | Los datos respetan RLS según el `auth.uid()` del usuario |

---

## 6. Riesgos documentados

| Riesgo | Nivel | Mitigación |
|---|---|---|
| Usuario asesor ve Admin y puede confundirse | Bajo | Solo lectura; acciones destructivas siguen protegidas |
| Usuario asesor ve datos globales en /app/direccion | Bajo | Interno; datos ya visibles en Supabase por RLS |
| Usuario asesor ve Motor IA pero no puede ejecutar ni configurar | Bajo | Server actions retornan error claro |
| Estado temporal puede persistir si no se revierte | Medio | Documentado aquí con instrucciones de reversión |

---

## 7. Plan para revertir cuando se definan roles finales

### En `src/components/layout/app-sidebar.tsx`:

Restaurar el bloque de filtro original:
```tsx
const baseItems = navItems.filter(item => {
  if (ADMIN_ONLY.includes(item.href)) return isAdmin
  if (DIRECTION_ALLOWED.includes(item.href)) return canSeeDirection
  return true
})
```

### En las páginas bloqueadas, restaurar redirects:

**`/app/ia/page.tsx` línea 40:**
```ts
if (!canAccessAll(profile)) redirect('/app/hoy')
```

**`/app/direccion/page.tsx` línea 9:**
```ts
if (!['admin', 'direccion'].includes(profile.role)) redirect('/app/hoy')
```

**`/app/admin/page.tsx` línea 9:**
```ts
if (profile.role !== 'admin') redirect('/app/hoy')
```

**`/app/admin/system/page.tsx` línea 11:**
```ts
if (!canAccessAll(profile)) redirect('/app/hoy')
```

---

## Decisión temporal

Durante la etapa de construcción interna, todas las secciones quedan visibles para usuarios autenticados con el objetivo de probar el flujo completo del producto. Esta decisión no representa el modelo final de permisos. Antes de presentar o implementar con PLIFE, se deberá definir una matriz formal de roles y accesos.

---

## Matriz de permisos sugerida (propuesta inicial — no final)

| Sección | Asesor | Líder comercial | Dirección | Admin | Decisión pendiente |
|---|---|---|---|---|---|
| PLIFE Hoy | ✅ | ✅ | ✅ | ✅ | Vista diferenciada ya existe |
| Contactos | ✅ | ✅ | ✅ | ✅ | Confirmar filtro por asesor |
| Empresas | ✅ | ✅ | ✅ | ✅ | Confirmar filtro por asesor |
| Oportunidades | ✅ | ✅ | ✅ | ✅ | Confirmar filtro por asesor |
| Radar B2B | ✅ | ✅ | ✅ | ✅ | Pendiente |
| Campañas | ✅ | ✅ | ✅ | ✅ | Creación: solo líder/dirección? |
| Copiloto IA | ✅ | ✅ | ✅ | ✅ | Pendiente |
| Conocimiento | ✅ | ✅ | ✅ | ✅ | Pendiente |
| Compliance | ✅ | ✅ | ✅ | ✅ | Pendiente |
| Academia | ✅ | ✅ | ✅ | ✅ | Pendiente |
| Dirección | ❓ | ❓ | ✅ | ✅ | A definir con PLIFE |
| Admin | ❌ | ❌ | ❌ | ✅ | Sensible — mantener restringido |
| Motor IA (configuración) | ❌ | ❌ | ❓ | ✅ | A definir con PLIFE |
| Estado del sistema | ❌ | ❌ | ❓ | ✅ | A definir con PLIFE |

> Esta tabla es orientativa. Las celdas con ❓ son las que requieren decisión explícita con el equipo de PLIFE antes del lanzamiento.

---

*Auditoría generada en FASE 13D-B — PLIFE Growth OS*
