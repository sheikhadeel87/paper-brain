import { useMemo } from 'react'
import {
  DONUT_COLORS,
  currencyDisplayLabel,
  formatKpiMoney,
} from '../../lib/dashboardBits'

export const DASH_CURRENCY_CARD_LIMIT = 3

export function useDashboardKpis(dashSummary, dashRows) {
  return useMemo(() => {
    const bc = dashSummary?.byCurrency || {}
    const entries = Object.entries(bc)
      .map(([cur, v]) => {
        const total =
          typeof v.total === 'number' ? v.total : Number(v.total)
        const count =
          typeof v.count === 'number' ? v.count : Number(v.count) || 0
        return {
          cur,
          total: Number.isNaN(total) ? 0 : total,
          count: Number.isNaN(count) ? 0 : count,
        }
      })
      .filter((e) => e.cur)
    const expenseCount =
      typeof dashSummary?.expenseCount === 'number'
        ? dashSummary.expenseCount
        : 0
    const sumTotals = entries.reduce((a, e) => a + e.total, 0)
    const dominant =
      entries.length === 0
        ? null
        : [...entries].sort((a, b) => b.total - a.total)[0]
    const topSharePct =
      dominant && sumTotals > 0 ? (dominant.total / sumTotals) * 100 : 0
    const confVals = dashRows
      .map((ex) => {
        const fd = ex.finalData || {}
        const c = ex.confidence ?? fd.confidence
        return typeof c === 'number' && !Number.isNaN(c) ? c : Number(c)
      })
      .filter((c) => !Number.isNaN(c))
    const avgConf =
      confVals.length > 0
        ? confVals.reduce((a, c) => a + c, 0) / confVals.length
        : null
    let reviewInList = 0
    for (const ex of dashRows) {
      const fd = ex.finalData || {}
      const f = String(
        ex.confidenceFlag ?? fd.confidence_flag ?? 'review',
      ).toLowerCase()
      if (f !== 'auto') reviewInList += 1
    }
    const totalsByCurrencyAll = [...entries]
      .filter((e) => e.total > 0)
      .sort((a, b) => b.total - a.total)

    const rowsByRecency = [...dashRows].sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime()
      const tb = new Date(b.createdAt || 0).getTime()
      return tb - ta
    })
    const recentCurrencyOrder = []
    const seenRecent = new Set()
    for (const ex of rowsByRecency) {
      const c = String((ex.finalData || {}).currency || '').trim()
      if (!c || seenRecent.has(c)) continue
      seenRecent.add(c)
      recentCurrencyOrder.push(c)
      if (recentCurrencyOrder.length >= DASH_CURRENCY_CARD_LIMIT) break
    }

    const byCur = new Map(totalsByCurrencyAll.map((e) => [e.cur, e]))
    const totalsByCurrency = []
    const usedCur = new Set()
    for (const cur of recentCurrencyOrder) {
      const e = byCur.get(cur)
      if (e) {
        totalsByCurrency.push(e)
        usedCur.add(cur)
      }
    }
    for (const e of totalsByCurrencyAll) {
      if (totalsByCurrency.length >= DASH_CURRENCY_CARD_LIMIT) break
      if (!usedCur.has(e.cur)) {
        totalsByCurrency.push(e)
        usedCur.add(e.cur)
      }
    }

    const sumTotalsShown = totalsByCurrency.reduce((a, e) => a + e.total, 0)
    const donutSlices = totalsByCurrency.map((e, i) => ({
      label: e.cur,
      value: e.total,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }))
    return {
      entries,
      expenseCount,
      dominant,
      topSharePct,
      avgConf,
      reviewInList,
      autoInList: dashRows.length - reviewInList,
      donutSlices,
      sumTotals,
      totalsByCurrency,
      totalsByCurrencyAll,
      sumTotalsShown,
    }
  }, [dashSummary, dashRows])
}
