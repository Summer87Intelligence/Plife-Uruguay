/**
 * Regla de negocio global de Plife Uruguay (Bloque 1, aprobada 2026-07-25).
 *
 * Fuente única de verdad para "qué aseguradora y qué ramo comercializa
 * Plife". Ningún otro archivo debería declarar el string "Mapfre" o "Vida"
 * como aseguradora/ramo permitido — todos derivan de acá.
 *
 * Regla vigente hasta nuevo aviso:
 * - Plife Uruguay comercializa exclusivamente productos de vida de MAPFRE.
 * - No debe existir lógica multiaseguradora ni multirramo en el producto.
 * - Cualquier producto de MAPFRE no confirmado por Plife se marca
 *   "PENDIENTE DE VALIDAR CON PLIFE" y no se incorpora al catálogo operativo
 *   (ver docs/audits/PLIFE-COBERTURA-FUNCIONAL-PRODUCTOS-OPORTUNIDADES-POLIZAS.md).
 */

export type BusinessMode = 'single-insurer-single-branch'

export interface PlifeBusinessConfig {
  organizationName: string
  /** Aseguradora única del negocio. */
  insurer: string
  /** Ramo único del negocio. */
  insuranceBranch: string
  businessMode: BusinessMode
  /** Únicas aseguradoras válidas en catálogo/mocks/filtros. */
  allowedInsurers: readonly string[]
  /** Únicos ramos válidos en catálogo/mocks/filtros. */
  allowedBranches: readonly string[]
}

export const PLIFE_BUSINESS_CONFIG: PlifeBusinessConfig = {
  organizationName: 'Plife Uruguay',
  insurer: 'Mapfre',
  insuranceBranch: 'Vida',
  businessMode: 'single-insurer-single-branch',
  allowedInsurers: ['Mapfre'],
  allowedBranches: ['Vida'],
}

export function isAllowedInsurer(name: string): boolean {
  return PLIFE_BUSINESS_CONFIG.allowedInsurers.includes(name)
}

export function isAllowedBranch(name: string): boolean {
  return PLIFE_BUSINESS_CONFIG.allowedBranches.includes(name)
}
