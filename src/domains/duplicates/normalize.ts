/** Normalización compartida para detección de duplicados (sin dependencias externas). */

export function normalizeText(value: string | null | undefined): string {
  if (!value) return ''
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b(s\.?a\.?|s\.?r\.?l\.?|ltda\.?|inc\.?|corp\.?)\b/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[.\s]+$/g, '')
    .trim()
}

export function normalizeEmail(value: string | null | undefined): string {
  if (!value) return ''
  return value.trim().toLowerCase()
}

export function normalizePhone(value: string | null | undefined): string {
  if (!value) return ''
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('598') && digits.length > 9) return digits.slice(3)
  if (digits.startsWith('0') && digits.length > 8) return digits.slice(1)
  return digits
}

export function normalizeWebsite(value: string | null | undefined): string {
  if (!value) return ''
  try {
    const url = value.includes('://') ? new URL(value) : new URL(`https://${value}`)
    return url.hostname.replace(/^www\./i, '').toLowerCase()
  } catch {
    return normalizeText(value).replace(/^www\./, '')
  }
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  return dp[m][n]
}

/** Similitud 0–1 entre dos nombres normalizados. */
export function nameSimilarity(a: string, b: string): number {
  const na = normalizeText(a)
  const nb = normalizeText(b)
  if (!na || !nb) return 0
  if (na === nb) return 1
  if (na.length >= 4 && nb.length >= 4 && (na.includes(nb) || nb.includes(na))) return 0.92
  const dist = levenshtein(na, nb)
  return 1 - dist / Math.max(na.length, nb.length)
}
