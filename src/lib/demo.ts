// Demo mode flag. Controlled by the public env var NEXT_PUBLIC_DEMO_MODE.
// Safe to read on both server and client (NEXT_PUBLIC_* is inlined at build time).
// It only toggles presentation affordances (badge, guided tour); it never changes data.
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
}
