export const DONUT_COLORS = [
  '#7c3aed',
  '#10b981',
  '#0ea5e9',
  '#f59e0b',
  '#ec4899',
  '#64748b',
]

export function formatKpiMoney(amount, currency) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '—'
  const cur = String(currency || 'USD')
    .trim()
    .toUpperCase()
  if (cur.length === 3) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: cur,
      }).format(amount)
    } catch {
      /* fall through */
    }
  }
  return `${amount.toFixed(2)} ${cur}`
}
