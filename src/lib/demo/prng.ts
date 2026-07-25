/**
 * Generador determinístico para el universo mock de la demo comercial.
 * NUNCA usar Math.random() acá: la demo debe verse idéntica en cada carga de
 * página y entre pantallas distintas (Hoy, Dirección, Pólizas... todas leen
 * del mismo universo generado con la misma semilla).
 */

export function mulberry32(seed: number) {
  let a = seed
  return function random(): number {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function makeRng(seed: number) {
  const random = mulberry32(seed)

  function int(min: number, max: number): number {
    return Math.floor(random() * (max - min + 1)) + min
  }

  function pick<T>(arr: readonly T[]): T {
    return arr[int(0, arr.length - 1)]
  }

  function pickMany<T>(arr: readonly T[], count: number): T[] {
    const pool = [...arr]
    const out: T[] = []
    for (let i = 0; i < count && pool.length > 0; i++) {
      const idx = int(0, pool.length - 1)
      out.push(pool[idx])
      pool.splice(idx, 1)
    }
    return out
  }

  function bool(probabilityTrue = 0.5): boolean {
    return random() < probabilityTrue
  }

  /** Elección ponderada (ej. participación de mercado de aseguradoras). */
  function pickWeighted<T extends string>(weights: Record<T, number>): T {
    const entries = Object.entries(weights) as [T, number][]
    const total = entries.reduce((sum, [, w]) => sum + w, 0)
    let r = random() * total
    for (const [key, w] of entries) {
      r -= w
      if (r <= 0) return key
    }
    return entries[entries.length - 1][0]
  }

  /** Shuffle determinístico (Fisher-Yates) — usado para repartir tiers/madurez/cartera sin sesgo de orden. */
  function shuffle<T>(arr: readonly T[]): T[] {
    const out = [...arr]
    for (let i = out.length - 1; i > 0; i--) {
      const j = int(0, i)
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  }

  /** Fecha ISO (YYYY-MM-DD) a N días de una fecha base. */
  function dateOffset(base: Date, days: number): string {
    const d = new Date(base)
    d.setDate(d.getDate() + days)
    return d.toISOString().slice(0, 10)
  }

  function isoOffset(base: Date, days: number): string {
    const d = new Date(base)
    d.setDate(d.getDate() + days)
    return d.toISOString()
  }

  return { random, int, pick, pickMany, bool, dateOffset, isoOffset, pickWeighted, shuffle }
}
