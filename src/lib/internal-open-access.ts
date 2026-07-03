/**
 * Feature flag: navegación abierta para testeo interno (FASE 13J).
 * Default seguro: false si la variable no está definida o no es "true".
 */
export function isInternalOpenAccessEnabled(): boolean {
  return process.env.NEXT_PUBLIC_INTERNAL_OPEN_ACCESS === 'true'
}
