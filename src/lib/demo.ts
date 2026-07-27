// Demo mode flag. Controlled by the public env var NEXT_PUBLIC_DEMO_MODE.
// Safe to read on both server and client (NEXT_PUBLIC_* is inlined at build time).
// Además del badge/tour de presentación, cuando está activo varias pantallas
// sirven el universo mock de src/lib/demo/universe.ts en vez de consultar
// Supabase — nunca escribe en la base real (ver src/lib/demo/README o el
// propio universe.ts). Pensado para quedar en `false` fuera de una demo comercial puntual.
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
}
