import type { Profile } from '@/types/database'

/**
 * Modo Demo — acceso controlado y temporal sin autenticación real.
 *
 * Existe para habilitar, en entornos que no son Production:
 * - demostraciones comerciales;
 * - auditorías funcionales;
 * - generación de documentación;
 * - validaciones automatizadas;
 * - recorridos guiados de producto.
 *
 * No reemplaza ni debilita la autenticación normal: fuera de las
 * condiciones de abajo, el comportamiento es exactamente el mismo de
 * siempre (login obligatorio).
 *
 * Gate de seguridad (las dos condiciones son obligatorias):
 * 1. `PLIFE_DEMO_BYPASS_AUTH` es una variable de SERVIDOR (nunca
 *    `NEXT_PUBLIC_*`), por lo que nunca queda embebida en el bundle
 *    enviado al navegador.
 * 2. Queda explícitamente desactivado cuando `VERCEL_ENV === 'production'`,
 *    aunque alguien configure la variable ahí por error. Fuera de Vercel
 *    (dev local, otros hosts) `VERCEL_ENV` no existe, por lo que Modo Demo
 *    sigue disponible ahí — es intencional, ya es un entorno no productivo.
 *
 * Modo Demo NUNCA crea una sesión real de Supabase: solo hace que las
 * funciones de lectura de sesión de la app (`resolveSessionAndProfile`)
 * devuelvan un perfil sintético de solo lectura, sin id real ni cookies.
 * Las acciones de servidor que escriben en la base (crear/editar leads,
 * propuestas, campañas, catálogo de Admin, configuración de Motores) siguen
 * exigiendo una sesión real de Supabase (`supabase.auth.getUser()`) y por lo
 * tanto quedan bloqueadas automáticamente en Modo Demo — salvo las que se
 * autorizan a través de este mismo perfil sintético (catálogo de Admin y
 * configuración técnica de Motores), donde se agregó un bloqueo explícito
 * (ver `requireAdminProfile`/`requireAdmin` en esos archivos).
 */
export function isDemoModeAuthEnabled(): boolean {
  return process.env.PLIFE_DEMO_BYPASS_AUTH === 'true' && process.env.VERCEL_ENV !== 'production'
}

/** UUID de marcador, nunca corresponde a una cuenta real. */
export const DEMO_MODE_USER_ID = '00000000-0000-0000-0000-000000000000'

/** Perfil sintético de solo lectura usado únicamente cuando Modo Demo está activo. */
export const DEMO_MODE_PROFILE: Profile = {
  id: DEMO_MODE_USER_ID,
  email: 'modo-demo@plife.local',
  full_name: 'Modo Demo',
  avatar_url: null,
  role: 'admin',
  phone: null,
  is_active: true,
  onboarding_completed: true,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}
