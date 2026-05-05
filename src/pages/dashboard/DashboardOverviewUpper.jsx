import { cardCls } from '../../lib/uiClasses'
import {
  currencyDisplayLabel,
  formatKpiMoney,
} from '../../lib/dashboardBits'
import { CurrencyDonut } from '../../components/ExpenseUi'
import { DASH_CURRENCY_CARD_LIMIT } from './useDashboardKpis'

export function DashboardOverviewUpper({ dashKpis, dashRows, dashTotalCount }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={`${cardCls} flex flex-col gap-2`}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {dashKpis.totalsByCurrencyAll.length > 1
                ? 'Totals by currency'
                : 'Total expenses'}
            </p>
            <span className="rounded-lg bg-violet-100 p-1.5 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </span>
          </div>
          <div
            className={
              dashKpis.totalsByCurrencyAll.length > 1
                ? 'min-h-0 text-zinc-900 dark:text-zinc-50'
                : 'text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50'
            }
          >
            {dashKpis.totalsByCurrencyAll.length === 0 ? (
              <span className="text-2xl font-semibold">—</span>
            ) : dashKpis.totalsByCurrencyAll.length === 1 ? (
              <span className="text-2xl font-semibold tabular-nums">
                {formatKpiMoney(
                  dashKpis.totalsByCurrencyAll[0].total,
                  dashKpis.totalsByCurrencyAll[0].cur,
                )}
              </span>
            ) : (
              <div
                className="space-y-1 text-lg font-semibold tabular-nums leading-snug sm:text-xl"
                role="region"
                aria-label="Expense totals by currency (up to three shown)"
              >
                {dashKpis.totalsByCurrency.map((e) => (
                  <div key={e.cur}>{formatKpiMoney(e.total, e.cur)}</div>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-400/90">
            {dashKpis.totalsByCurrencyAll.length > 1 ? (
              <>
                {dashKpis.totalsByCurrencyAll.length >
                DASH_CURRENCY_CARD_LIMIT ? (
                  <>
                    Showing {dashKpis.totalsByCurrency.length} of{' '}
                    {dashKpis.totalsByCurrencyAll.length} currencies (latest
                    expenses first, then largest totals). No FX conversion. See
                    the{' '}
                    <a
                      href="#dash-spending-overview"
                      className="font-medium text-violet-700 underline decoration-violet-400/50 underline-offset-2 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300"
                    >
                      spending chart
                    </a>{' '}
                    for the same slice.
                  </>
                ) : (
                  <>
                    {dashKpis.totalsByCurrencyAll.length} currencies — each in
                    its own currency (no FX conversion).
                  </>
                )}
              </>
            ) : (
              'Matching your filters'
            )}
          </p>
        </div>
        <div className={`${cardCls} flex flex-col gap-2`}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Total receipts
            </p>
            <span className="rounded-lg bg-sky-100 p-1.5 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
            </span>
          </div>
          <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {dashKpis.expenseCount}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Expenses matching filters
          </p>
        </div>
        <div className={`${cardCls} flex flex-col gap-2`}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Top currency
            </p>
            <span className="rounded-lg bg-emerald-100 p-1.5 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v12M8 10h8M8 14h8" />
              </svg>
            </span>
          </div>
          <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {dashKpis.dominant?.cur
              ? currencyDisplayLabel(dashKpis.dominant.cur)
              : '—'}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {dashKpis.dominant && dashKpis.sumTotals > 0
              ? `${Math.round(dashKpis.topSharePct)}% of recorded totals`
              : '—'}
          </p>
        </div>
        <div className={`${cardCls} flex flex-col gap-2`}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Avg. confidence
            </p>
            <span className="rounded-lg bg-amber-100 p-1.5 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </span>
          </div>
          <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {dashKpis.avgConf !== null
              ? `${Math.round(dashKpis.avgConf)}/100`
              : '—'}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {dashRows.length > 0 && dashRows.length < dashTotalCount
              ? `From ${dashRows.length} loaded rows`
              : 'AI extraction accuracy'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className={cardCls} id="dash-spending-overview">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Spending overview
            </h2>
            <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              By currency
            </span>
          </div>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
            <CurrencyDonut slices={dashKpis.donutSlices} />
            <ul className="m-0 w-full max-w-xs list-none space-y-2.5 p-0 text-sm">
              {dashKpis.donutSlices.length === 0 ? (
                <li className="text-zinc-500 dark:text-zinc-400">
                  Apply filters with matching expenses to see the chart.
                </li>
              ) : (
                dashKpis.donutSlices.map((s) => {
                  const pct =
                    dashKpis.sumTotalsShown > 0
                      ? Math.round((s.value / dashKpis.sumTotalsShown) * 100)
                      : 0
                  return (
                    <li
                      key={s.label}
                      className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2 last:border-0 dark:border-zinc-800"
                    >
                      <span className="flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-200">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: s.color }}
                          aria-hidden
                        />
                        {currencyDisplayLabel(s.label)}
                      </span>
                      <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
                        {formatKpiMoney(s.value, s.label)} · {pct}%
                      </span>
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        </section>
        <section className={`${cardCls} space-y-4`}>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            AI insights
          </h2>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/25">
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              High confidence extractions
            </p>
            <p className="mt-1 text-sm text-emerald-900/90 dark:text-emerald-100/90">
              {dashRows.length > 0
                ? `${dashKpis.autoInList} of ${dashRows.length} loaded expense${dashRows.length === 1 ? '' : 's'} ${dashKpis.autoInList === 1 ? 'is' : 'are'} auto-flagged in this list.`
                : 'Load expenses to see approval stats for the current page.'}
              {dashTotalCount > 0 && (
                <span className="mt-1 block text-xs text-emerald-800/80 dark:text-emerald-200/80">
                  {dashTotalCount} expense{dashTotalCount === 1 ? '' : 's'}{' '}
                  match your filters in total.
                </span>
              )}
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 dark:border-amber-900/50 dark:bg-amber-950/25">
            <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
              Needs review
            </p>
            <p className="mt-1 text-sm text-amber-950/90 dark:text-amber-100/90">
              {dashRows.length > 0
                ? `${dashKpis.reviewInList} receipt${dashKpis.reviewInList === 1 ? '' : 's'} in this list ${dashKpis.reviewInList === 1 ? 'needs' : 'need'} your review for better accuracy.`
                : 'No rows loaded — adjust filters or fetch expenses.'}
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
