export const DONUT_COLORS = [
  '#7c3aed',
  '#10b981',
  '#0ea5e9',
  '#f59e0b',
  '#ec4899',
  '#64748b',
]

/** Map common symbols / words to ISO 4217 (expense `currency` is not always a 3-letter code). */
const SYMBOL_OR_ALIAS_TO_ISO = {
  '€': 'EUR',
  '\u20ac': 'EUR',
  $: 'USD',
  '\u0024': 'USD',
  '£': 'GBP',
  '\u00a3': 'GBP',
  '¥': 'JPY',
  '\u00a5': 'JPY',
  EURO: 'EUR',
  EUROS: 'EUR',
  DOLLAR: 'USD',
  DOLLARS: 'USD',
}

/**
 * Returns ISO 4217 code (e.g. EUR) or null.
 * Accepts `EUR`, `eur`, `€`, `EURO`, `$` (→ USD), etc.
 */
export function resolveIsoCurrency(raw) {
  const s = String(raw ?? '').trim()
  if (!s) return null
  const upper = s.toUpperCase()
  if (upper.length === 3 && /^[A-Z]{3}$/.test(upper)) {
    try {
      new Intl.NumberFormat('en-US', { style: 'currency', currency: upper }).format(0)
      return upper
    } catch {
      return null
    }
  }
  const fromMap = SYMBOL_OR_ALIAS_TO_ISO[s] || SYMBOL_OR_ALIAS_TO_ISO[upper]
  if (fromMap) return fromMap
  return null
}

/**
 * Money string with **symbol before the amount** (e.g. €600.00, $560.41).
 * Works even when DB stored `€` instead of `EUR` by resolving to ISO first.
 */
export function formatKpiMoney(amount, currency) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '—'
  const cur = resolveIsoCurrency(currency)
  if (!cur) {
    const raw = String(currency ?? '').trim()
    return raw ? `${amount.toFixed(2)} ${raw}` : amount.toFixed(2)
  }
  try {
    const parts = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cur,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(amount)
    const sym = parts.find((p) => p.type === 'currency')?.value ?? ''
    const rest = parts
      .filter((p) => p.type !== 'currency')
      .map((p) => p.value)
      .join('')
    return `${sym}${rest}`
  } catch {
    return `${cur} ${amount.toFixed(2)}`
  }
}

/** Uppercase English currency name (e.g. EURO, US DOLLAR) for labels. */
export function currencyDisplayLabel(raw) {
  const code = resolveIsoCurrency(raw)
  if (!code) return String(raw || '—').trim() || '—'
  try {
    const dn = new Intl.DisplayNames(['en'], { type: 'currency' })
    const n = dn.of(code)
    return (n || code).toLocaleUpperCase('en')
  } catch {
    return code
  }
}
