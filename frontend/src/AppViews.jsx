import { useMemo } from 'react'
import {
  btnBase,
  btnPrimary,
  cardCls,
  dashRowIconBtn,
  dashRowIconBtnDanger,
  inputCls,
  labelCls,
} from './lib/uiClasses'
import { DONUT_COLORS, formatKpiMoney } from './lib/dashboardBits'
import { formatDashAmount, needsReviewAcknowledge } from './lib/receiptDraft'
import {
  ConfidenceMeter,
  CurrencyDonut,
  EyeViewIcon,
  FlagBadge,
  InlineSpinner,
  PencilIcon,
  TrashIcon,
  VendorAvatar,
} from './components/ExpenseUi'

/** Prev/next for server-paged lists (receipts library, expenses). */
export function PagedNav({ pageIndex, pageSize, totalCount, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize))
  if (totalPages <= 1 || typeof onPageChange !== 'function') return null
  const canPrev = pageIndex > 0
  const canNext = (pageIndex + 1) * pageSize < totalCount
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Page{' '}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {pageIndex + 1}
        </span>{' '}
        of {totalPages}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={btnBase}
          disabled={!canPrev}
          onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
        >
          Previous
        </button>
        <button
          type="button"
          className={btnBase}
          disabled={!canNext}
          onClick={() => onPageChange(pageIndex + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export function DashboardView({
  setMainTab,
  dashboardPanel = 'overview',
  dashOverviewLimit = 10,
  expensesPage = 0,
  expensesPageSize = 15,
  onExpensesPageChange,
  onViewAllExpenses,
  onBackToDashboard,
  dashFrom,
  dashTo,
  dashVendor,
  setDashFrom,
  setDashTo,
  setDashVendor,
  dashRows,
  dashTotalCount,
  dashSummary,
  dashLoading,
  dashError,
  dashEditSaveError,
  dashDetailExpense,
  dashEditSaving,
  dashDeleteBusy,
  onApplyFilters,
  onClearFilters,
  dashboardExportHref,
  onViewExpense,
  onEditExpense,
  onDeleteExpense,
}) {
  const isOverview = dashboardPanel === 'overview'
  const isExpensesList = dashboardPanel === 'expenses'
  const overviewHasMore =
    isOverview && dashTotalCount > dashOverviewLimit && dashTotalCount > 0
  const expensesRangeFrom =
    dashTotalCount === 0 ? 0 : expensesPage * expensesPageSize + 1
  const expensesRangeTo =
    dashTotalCount === 0
      ? 0
      : expensesPage * expensesPageSize + dashRows.length

  const dashKpis = useMemo(() => {
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
    const totalsByCurrency = [...entries]
      .filter((e) => e.total > 0)
      .sort((a, b) => b.total - a.total)
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
      /** Sorted positive totals — use for KPI, not `dominant` alone. */
      totalsByCurrency,
    }
  }, [dashSummary, dashRows])

  const noDashFilters =
    !String(dashFrom || '').trim() &&
    !String(dashTo || '').trim() &&
    !String(dashVendor || '').trim()

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            {isExpensesList ? 'Expenses' : 'Dashboard'}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {isExpensesList
              ? 'All expenses matching your filters (table only).'
              : 'Overview of your expenses and AI insights.'}
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {isExpensesList && typeof onBackToDashboard === 'function' ? (
            <button
              type="button"
              className={`${btnBase} w-full sm:w-auto`}
              onClick={onBackToDashboard}
            >
              Dashboard
            </button>
          ) : null}
          <button
            type="button"
            className={`${btnPrimary} w-full sm:w-auto`}
            onClick={() => setMainTab('receipt')}
          >
            + Add expense
          </button>
        </div>
      </div>

      {!isExpensesList ? (
        <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={`${cardCls} flex flex-col gap-2`}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {dashKpis.totalsByCurrency.length > 1
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
              dashKpis.totalsByCurrency.length > 1
                ? 'min-h-0 text-zinc-900 dark:text-zinc-50'
                : 'text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50'
            }
          >
            {dashKpis.totalsByCurrency.length === 0 ? (
              <span className="text-2xl font-semibold">—</span>
            ) : dashKpis.totalsByCurrency.length === 1 ? (
              <span className="text-2xl font-semibold tabular-nums">
                {formatKpiMoney(
                  dashKpis.totalsByCurrency[0].total,
                  dashKpis.totalsByCurrency[0].cur,
                )}
              </span>
            ) : (
              <div
                className={`-mr-0.5 max-h-[6.75rem] space-y-1 overflow-y-auto overscroll-y-contain pr-0.5 [-webkit-overflow-scrolling:touch] sm:max-h-[8.25rem] ${
                  dashKpis.totalsByCurrency.length > 5
                    ? 'text-sm font-semibold tabular-nums leading-snug sm:text-base'
                    : 'text-lg font-semibold tabular-nums leading-snug sm:text-xl'
                }`}
                role="region"
                aria-label="Expense totals by currency"
                tabIndex={0}
              >
                {dashKpis.totalsByCurrency.map((e) => (
                  <div key={e.cur}>{formatKpiMoney(e.total, e.cur)}</div>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-400/90">
            {dashKpis.totalsByCurrency.length > 1 ? (
              <>
                {dashKpis.totalsByCurrency.length} currencies — each in its own
                currency (no FX conversion).
                {dashKpis.totalsByCurrency.length > 5 ? (
                  <>
                    {' '}
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Scroll the amounts in the card if needed, or use the{' '}
                      <a
                        href="#dash-spending-overview"
                        className="font-medium text-violet-700 underline decoration-violet-400/50 underline-offset-2 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300"
                      >
                        spending chart
                      </a>{' '}
                      below.
                    </span>
                  </>
                ) : null}
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
            {dashKpis.dominant?.cur ?? '—'}
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
                    dashKpis.sumTotals > 0
                      ? Math.round((s.value / dashKpis.sumTotals) * 100)
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
                        {s.label}
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
      ) : null}

      <section className={cardCls}>
        <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Filters
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className={labelCls}>
            From (created)
            <input
              className={inputCls}
              type="date"
              value={dashFrom}
              onChange={(e) => setDashFrom(e.target.value)}
            />
          </label>
          <label className={labelCls}>
            To (created)
            <input
              className={inputCls}
              type="date"
              value={dashTo}
              onChange={(e) => setDashTo(e.target.value)}
            />
          </label>
          <label className={`${labelCls} sm:col-span-2`}>
            Vendor contains
            <input
              className={inputCls}
              value={dashVendor}
              onChange={(e) => setDashVendor(e.target.value)}
              placeholder="e.g. Mart"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className={btnPrimary}
            disabled={dashLoading}
            onClick={onApplyFilters}
          >
            Apply filters
          </button>
          <button
            type="button"
            className={btnBase}
            disabled={dashLoading}
            onClick={onClearFilters}
          >
            Clear filters
          </button>
          <a className={btnBase} href={dashboardExportHref()} download>
            Export CSV
          </a>
        </div>
        {dashError && (
          <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
            {dashError}
          </p>
        )}
      </section>

      <section className={cardCls} id="dash-expenses-table">
        {dashEditSaveError && !dashDetailExpense && (
          <p className="mb-3 text-sm font-medium text-red-600 dark:text-red-400">
            {dashEditSaveError}
          </p>
        )}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {isExpensesList ? 'All expenses' : 'Recent expenses'}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">
              {isExpensesList && dashTotalCount > 0
                ? `Rows ${expensesRangeFrom}–${expensesRangeTo} of ${dashTotalCount}.`
                : `Showing ${dashRows.length} of ${dashTotalCount}`}
            </span>
            {isOverview ? (
              <a
                href="#dash-expenses-table"
                className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400"
              >
                View table
              </a>
            ) : null}
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/80">
                <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                  Vendor
                </th>
                <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                  Total
                </th>
                <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                  Currency
                </th>
                <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                  Date
                </th>
                <th className="min-w-[6.5rem] px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                  Confidence
                </th>
                <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                  Flag
                </th>
                <th className="min-w-[7.5rem] px-2 py-2 text-center font-medium text-zinc-700 dark:text-zinc-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {dashRows.length === 0 && !dashLoading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-6 text-center text-zinc-500 dark:text-zinc-400"
                  >
                    {noDashFilters ? (
                      <div className="mx-auto max-w-lg space-y-2">
                        <p className="m-0 font-medium text-zinc-700 dark:text-zinc-300">
                          No expenses for this account yet.
                        </p>
                        <p className="m-0 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                          Orphan rows (saved before per-user data) are linked to the
                          demo account{' '}
                          <code className="rounded bg-zinc-100 px-1 font-mono text-[0.7rem] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                            adeel@test.com
                          </code>{' '}
                          when the API starts in development. You can also run from{' '}
                          <code className="rounded bg-zinc-100 px-1 font-mono text-[0.7rem] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                            backend/
                          </code>
                          :{' '}
                          <code className="whitespace-pre-wrap break-all rounded bg-zinc-100 px-1 font-mono text-[0.7rem] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                            npm run assign-legacy -- your@email.com
                          </code>
                        </p>
                      </div>
                    ) : (
                      'No expenses match these filters.'
                    )}
                  </td>
                </tr>
              )}
              {dashRows.map((ex) => {
                const fd = ex.finalData || {}
                const created = ex.createdAt
                  ? new Date(ex.createdAt).toLocaleString()
                  : ''
                const rowSavingThis =
                  dashEditSaving &&
                  dashDetailExpense &&
                  String(dashDetailExpense._id) === String(ex._id)
                const conf =
                  typeof ex.confidence === 'number' &&
                  !Number.isNaN(ex.confidence)
                    ? ex.confidence
                    : typeof fd.confidence === 'number' &&
                        !Number.isNaN(fd.confidence)
                      ? fd.confidence
                      : null
                const flagRaw = ex.confidenceFlag ?? fd.confidence_flag
                return (
                  <tr
                    key={ex._id}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                  >
                    <td className="px-3 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <VendorAvatar name={fd.vendor} />
                        <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                          {fd.vendor || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums text-zinc-900 dark:text-zinc-100">
                      {fd.total != null && fd.total !== ''
                        ? typeof fd.total === 'number'
                          ? fd.total.toFixed(2)
                          : fd.total
                        : '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-zinc-600 dark:text-zinc-400">
                      {fd.currency || '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-zinc-600 dark:text-zinc-400">
                      {created || '—'}
                    </td>
                    <td className="px-3 py-2">
                      <ConfidenceMeter value={conf} />
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <FlagBadge flag={flagRaw} />
                    </td>
                    <td className="px-1 py-2 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-0.5">
                        <button
                          type="button"
                          className={dashRowIconBtn}
                          aria-label={`View ${fd.vendor || 'expense'}`}
                          disabled={dashDeleteBusy || dashLoading}
                          onClick={() => onViewExpense(ex)}
                        >
                          <EyeViewIcon />
                        </button>
                        <button
                          type="button"
                          className={dashRowIconBtn}
                          aria-label={`Edit ${fd.vendor || 'expense'}`}
                          disabled={
                            dashDeleteBusy || rowSavingThis || dashLoading
                          }
                          onClick={() => onEditExpense(ex)}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          className={dashRowIconBtnDanger}
                          aria-label={`Delete ${fd.vendor || 'expense'}`}
                          disabled={dashDeleteBusy || dashLoading}
                          onClick={() => void onDeleteExpense(ex)}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {overviewHasMore && typeof onViewAllExpenses === 'function' ? (
          <button
            type="button"
            className={`${btnBase} mt-4`}
            onClick={onViewAllExpenses}
          >
            View all expenses
          </button>
        ) : null}
        {isExpensesList ? (
          <PagedNav
            pageIndex={expensesPage}
            pageSize={expensesPageSize}
            totalCount={dashTotalCount}
            onPageChange={onExpensesPageChange}
          />
        ) : null}
      </section>

      {!isExpensesList ? (
      <section className={`${cardCls} text-left`}>
        <h2 className="mb-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {'Confidence & the Flag column'}
        </h2>
        <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-400">
          Each expense stores an AI{' '}
          <strong className="font-medium text-zinc-800 dark:text-zinc-200">
            confidence score
          </strong>{' '}
          (0–100) and a{' '}
          <strong className="font-medium text-zinc-800 dark:text-zinc-200">
            flag
          </strong>{' '}
          shown in the table. The score follows a fixed rubric applied on the
          server after extraction (Gemini may suggest fields; the numbers you
          see use the rules below).
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              How the score is built
            </h3>
            <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
              Points add up toward 100, then the score is capped if totals or
              line items do not line up:
            </p>
            <ul className="m-0 list-none space-y-2 p-0 text-sm text-zinc-800 dark:text-zinc-200">
              <li className="flex gap-2">
                <span className="font-mono text-violet-600 dark:text-violet-400">
                  +30
                </span>
                <span>Vendor found on the receipt</span>
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-violet-600 dark:text-violet-400">
                  +30
                </span>
                <span>Date found</span>
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-violet-600 dark:text-violet-400">
                  +40
                </span>
                <span>Total found</span>
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-violet-600 dark:text-violet-400">
                  +5
                </span>
                <span>
                  Line item prices reconcile with total (and at least one priced
                  line)
                </span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              If totals validation fails, the score is capped at 70 and the flag
              is review. With no line items after cleanup, it is capped at 60.
              Open an expense to see the stored score in details.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              What the flag means
            </h3>
            <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
              The{' '}
              <strong className="text-zinc-800 dark:text-zinc-200">Flag</strong>{' '}
              column is the confidence flag saved with the expense:
            </p>
            <dl className="m-0 space-y-3 text-sm">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <dt className="mb-1 flex items-center gap-2 font-semibold text-emerald-900 dark:text-emerald-100">
                  <span className="rounded-md bg-emerald-600/15 px-2 py-0.5 font-mono text-xs uppercase tracking-wide">
                    auto
                  </span>
                  Confidence ≥ 80
                </dt>
                <dd className="m-0 text-emerald-900/90 dark:text-emerald-100/90">
                  The model was reasonably sure about vendor, date, and total.
                  You can still edit before save; approved saves are allowed
                  without an extra review tick when rules allow.
                </dd>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
                <dt className="mb-1 flex items-center gap-2 font-semibold text-amber-950 dark:text-amber-100">
                  <span className="rounded-md bg-amber-600/15 px-2 py-0.5 font-mono text-xs uppercase tracking-wide">
                    review
                  </span>
                  Confidence &lt; 80
                </dt>
                <dd className="m-0 text-amber-950/90 dark:text-amber-100/90">
                  Treat the extraction as uncertain: double-check amounts and line
                  items. Saving as approved may require confirming you reviewed
                  the expense.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
      ) : null}
    </div>
  )
}

function ReceiptHistoryTable({ recent, title, emptyHint, scrollable }) {
  const wrapCls = scrollable
    ? 'max-h-[min(70vh,36rem)] overflow-x-auto overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-700'
    : 'overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700'
  return (
    <section className={`${cardCls} text-left`}>
      <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      {recent.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{emptyHint}</p>
      ) : (
        <div className={wrapCls}>
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/80">
                <th className="min-w-[8rem] px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                  Vendor
                </th>
                <th className="whitespace-nowrap px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                  Total
                </th>
                <th className="whitespace-nowrap px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.map((ex) => {
                const fd = ex.finalData || {}
                const created = ex.createdAt
                  ? new Date(ex.createdAt).toLocaleString()
                  : '—'
                return (
                  <tr
                    key={ex._id}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                  >
                    <td className="max-w-[14rem] truncate px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">
                      {fd.vendor || '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums text-zinc-900 dark:text-zinc-100">
                      {fd.total ?? '—'}{' '}
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {fd.currency || ''}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-zinc-600 dark:text-zinc-400">
                      {created}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export function ReceiptView({
  receiptPanel = 'scan',
  recentTotalCount = 0,
  receiptLibraryPage = 0,
  receiptLibraryPageSize = 15,
  onReceiptLibraryPageChange,
  onGoReceiptScan,
  phase,
  draft,
  rawText,
  parseOk,
  parseError,
  needsReview,
  uploading,
  saving,
  saveError,
  lastSavedId,
  recent,
  recentFetchError,
  inputKey,
  confirmReviewAck,
  setConfirmReviewAck,
  setSaveError,
  receiptPreviewUrl,
  receiptUploadInputRef,
  scanRetryable,
  forceReviewAck,
  onUpload,
  updateField,
  updateItem,
  addItemRow,
  removeItemRow,
  retryReceiptScan,
  onConfirmSave,
  onReject,
}) {
  const isLibrary = receiptPanel === 'library'
  const libraryTotalPages = Math.max(
    1,
    Math.ceil(
      recentTotalCount > 0 ? recentTotalCount / receiptLibraryPageSize : 1,
    ),
  )
  const libraryRangeFrom =
    recentTotalCount === 0 ? 0 : receiptLibraryPage * receiptLibraryPageSize + 1
  const libraryRangeTo =
    recentTotalCount === 0
      ? 0
      : receiptLibraryPage * receiptLibraryPageSize + recent.length

  return (
    <div className="space-y-6 text-left">
      {isLibrary ? (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                Receipts
              </h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {recentTotalCount > 0
                  ? `Rows ${libraryRangeFrom}–${libraryRangeTo} of ${recentTotalCount} (${libraryTotalPages} page${libraryTotalPages === 1 ? '' : 's'}).`
                  : recent.length > 0
                    ? `Showing ${recent.length} saved expense${recent.length === 1 ? '' : 's'}.`
                    : 'No saved expenses yet.'}
              </p>
            </div>
            <button
              type="button"
              className={`${btnPrimary} w-full shrink-0 sm:w-auto`}
              onClick={() =>
                typeof onGoReceiptScan === 'function' ? onGoReceiptScan() : undefined
              }
            >
              Scan new receipt
            </button>
          </div>
          {recentFetchError ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
              role="alert"
            >
              {recentFetchError}
            </p>
          ) : null}
          <ReceiptHistoryTable
            recent={recent}
            title="All receipts"
            emptyHint="No expenses yet. Use Scan new receipt to add one."
            scrollable
          />
          <PagedNav
            pageIndex={receiptLibraryPage}
            pageSize={receiptLibraryPageSize}
            totalCount={recentTotalCount}
            onPageChange={onReceiptLibraryPageChange}
          />
        </div>
      ) : null}

      {!isLibrary ? (
        <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Add expense
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Scan a receipt with AI, review the fields, then save.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] md:items-start">
        <div className="min-w-0 space-y-5">
          {recentFetchError ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
              role="alert"
            >
              {recentFetchError}
            </p>
          ) : null}
          {phase === 'upload' && (
            <section
              className={`${cardCls} mb-5 text-left`}
              aria-busy={uploading}
            >
              <h2 className="mb-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Receipt scan
              </h2>
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                Upload a receipt image (PNG or JPG). OCR + Gemini run on the
                server; you review before anything is saved as an expense.
              </p>
              <div
                className={`rounded-xl border-2 border-dashed border-zinc-300 bg-gradient-to-b from-violet-50/60 to-zinc-50/80 transition dark:border-zinc-600 dark:from-violet-950/20 dark:to-zinc-900/40 ${
                  uploading
                    ? 'border-violet-300/80 dark:border-violet-700/50'
                    : 'hover:border-violet-400 dark:hover:border-violet-600'
                }`}
              >
                <input
                  ref={receiptUploadInputRef}
                  id="receipt-upload-input"
                  key={inputKey}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/*"
                  disabled={uploading}
                  onChange={onUpload}
                  className="sr-only"
                />
                <label
                  htmlFor="receipt-upload-input"
                  className={`flex flex-col items-center gap-3 px-4 py-8 text-center sm:px-6 sm:py-10 ${
                    uploading
                      ? 'cursor-wait'
                      : 'cursor-pointer'
                  }`}
                >
                  <span className="rounded-full bg-violet-100 p-3 text-violet-700 shadow-sm dark:bg-violet-950/60 dark:text-violet-300">
                    {uploading ? (
                      <InlineSpinner className="h-7 w-7 text-violet-600 dark:text-violet-300" />
                    ) : (
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                      </svg>
                    )}
                  </span>
                  <span
                    className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                    aria-live="polite"
                  >
                    {uploading
                      ? 'Processing…'
                      : 'Drop a file here, or use the purple button below.'}
                  </span>
                </label>
                <div className="flex justify-center px-6 pb-8">
                  <button
                    type="button"
                    className={`${btnPrimary} gap-2`}
                    disabled={uploading}
                    onClick={() => receiptUploadInputRef.current?.click()}
                  >
                    {uploading ? (
                      <>
                        <InlineSpinner className="h-4 w-4 shrink-0 text-white" />
                        Processing…
                      </>
                    ) : (
                      'Choose image'
                    )}
                  </button>
                </div>
              </div>
            </section>
          )}

          {phase === 'review' && draft && (
            <section className={`${cardCls} mb-5 text-left`}>
              {(needsReview || !parseOk) && (
                <div
                  className="mb-4 rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm text-violet-950 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-100"
                  role="status"
                >
                  {!parseOk
                    ? 'AI parsing failed — fill the form from the raw text below, then save.'
                    : 'Low confidence or review flag — double-check every field before saving.'}
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className={labelCls}>
                  Vendor
                  <input
                    className={inputCls}
                    value={draft.vendor}
                    onChange={(e) => updateField('vendor', e.target.value)}
                  />
                </label>
                <label className={labelCls}>
                  Date
                  <input
                    className={inputCls}
                    type="date"
                    value={draft.date}
                    onChange={(e) => updateField('date', e.target.value)}
                  />
                </label>
                <label className={labelCls}>
                  Total
                  <input
                    className={inputCls}
                    inputMode="decimal"
                    value={draft.total}
                    onChange={(e) => updateField('total', e.target.value)}
                  />
                </label>
                <label className={labelCls}>
                  Currency
                  <input
                    className={inputCls}
                    value={draft.currency}
                    onChange={(e) => updateField('currency', e.target.value)}
                  />
                </label>
                <label className={`${labelCls} sm:col-span-2`}>
                  Tax
                  <input
                    className={inputCls}
                    inputMode="decimal"
                    value={draft.tax}
                    onChange={(e) => updateField('tax', e.target.value)}
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span>
                  AI confidence:{' '}
                  <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                    {draft.aiConfidence != null &&
                    !Number.isNaN(draft.aiConfidence)
                      ? draft.aiConfidence
                      : '—'}
                  </strong>
                </span>
                <span>
                  User verified:{' '}
                  <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                    {confirmReviewAck ? 'Yes' : 'No'}
                  </strong>
                </span>
                <span>
                  Flag:{' '}
                  <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                    {draft.confidence_flag}
                  </strong>
                </span>
              </div>

              <h3 className="mb-2 mt-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Line items
              </h3>
              <div className="flex flex-col gap-3">
                {draft.items.map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_7rem_auto]"
                  >
                    <input
                      className={inputCls}
                      placeholder="Name"
                      value={row.name}
                      onChange={(e) => updateItem(i, 'name', e.target.value)}
                    />
                    <input
                      className={inputCls}
                      placeholder="Price"
                      inputMode="decimal"
                      value={row.price}
                      onChange={(e) => updateItem(i, 'price', e.target.value)}
                    />
                    <button
                      type="button"
                      className="justify-self-start text-sm font-medium text-violet-600 underline decoration-violet-400/60 underline-offset-2 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-violet-400 dark:hover:text-violet-300"
                      onClick={() => removeItemRow(i)}
                      disabled={draft.items.length <= 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="self-start text-sm font-medium text-violet-600 underline decoration-violet-400/60 underline-offset-2 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                  onClick={addItemRow}
                >
                  Add line
                </button>
              </div>

              <details className="mt-5 text-left text-sm text-zinc-700 dark:text-zinc-300">
                <summary className="cursor-pointer font-medium text-zinc-800 dark:text-zinc-200">
                  Raw OCR text
                </summary>
                <pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
                  {rawText || '—'}
                </pre>
              </details>

              {parseError && (
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                  Parse message: {parseError}
                </p>
              )}

              {scanRetryable && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className={`${btnBase} gap-2`}
                    onClick={retryReceiptScan}
                    disabled={uploading || saving}
                  >
                    {uploading ? (
                      <>
                        <InlineSpinner className="h-4 w-4 shrink-0 text-zinc-600 dark:text-zinc-300" />
                        Retrying…
                      </>
                    ) : (
                      'Retry scan'
                    )}
                  </button>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Runs OCR and AI again on the same file (no need to re-select).
                  </span>
                </div>
              )}

              {saveError && (
                <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
                  {saveError}
                </p>
              )}

              {(needsReviewAcknowledge(draft, parseOk, needsReview) ||
                forceReviewAck) && (
                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-left text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                    checked={confirmReviewAck}
                    disabled={saving}
                    onChange={(e) => {
                      setConfirmReviewAck(e.target.checked)
                      setSaveError('')
                    }}
                  />
                  <span>
                    I have reviewed this expense and the values are correct.
                    Required when parsing failed, the receipt is flagged for
                    review, or confidence is below 80.
                  </span>
                </label>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  className={btnPrimary}
                  disabled={saving}
                  onClick={onConfirmSave}
                >
                  {saving ? 'Saving…' : 'Confirm & save expense'}
                </button>
                <button
                  type="button"
                  className={btnBase}
                  onClick={onReject}
                  disabled={saving}
                >
                  Reject / new upload
                </button>
              </div>
            </section>
          )}

          {phase === 'saved' && (
            <section className={`${cardCls} mb-5 text-left`}>
              <p className="mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-50">
                Expense saved.
              </p>
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                MongoDB id:{' '}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                  {lastSavedId}
                </code>
              </p>
              <button type="button" className={btnPrimary} onClick={onReject}>
                Upload another receipt
              </button>
            </section>
          )}

          {recent.length > 0 ? (
            <ReceiptHistoryTable
              recent={recent}
              title="Recent receipts"
              emptyHint="No recent receipts."
              scrollable={false}
            />
          ) : null}
        </div>

        <aside className="min-w-0 md:sticky md:top-6 md:self-start">
          <div className={`${cardCls} p-4 text-left`}>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
              Receipt
            </h2>
            <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
              Preview stays here while you edit.
            </p>
            {receiptPreviewUrl ? (
              <img
                src={receiptPreviewUrl}
                alt="Uploaded receipt"
                className="max-h-[min(70vh,520px)] w-full rounded-lg border border-zinc-200 bg-zinc-50 object-contain dark:border-zinc-700 dark:bg-zinc-950"
              />
            ) : (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-violet-200 bg-violet-50/40 px-4 py-8 text-center text-sm text-zinc-600 dark:border-violet-800/60 dark:bg-violet-950/20 dark:text-zinc-400">
                <span className="rounded-full bg-white p-2 text-violet-600 shadow-sm dark:bg-zinc-900 dark:text-violet-400">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </span>
                <span className="max-w-[14rem]">
                  Use{' '}
                  <strong className="font-medium text-violet-700 dark:text-violet-300">
                    Choose image
                  </strong>{' '}
                  in the main column — your receipt will appear here.
                </span>
              </div>
            )}
          </div>
        </aside>
      </div>
        </>
      ) : null}
    </div>
  )
}

export function ExpenseDetailModal({
  dashDetailExpense,
  dashEditSession,
  setDashEditSession,
  dashEditSaving,
  dashDeleteBusy,
  dashEditSaveError,
  closeDashDetail,
  startDashEdit,
  deleteDashExpense,
  saveDashEdit,
  onCancelEdit,
  dashEditUpdateField,
  dashEditUpdateItem,
  dashEditRemoveItemRow,
  dashEditAddItemRow,
}) {
  if (!dashDetailExpense) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[1px]"
        aria-label="Close expense details"
        onClick={closeDashDetail}
      />
      <div
        className="relative z-10 flex max-h-[min(calc(100dvh-0.5rem),900px)] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-violet-200/70 bg-white pb-[env(safe-area-inset-bottom,0px)] shadow-xl shadow-violet-900/10 ring-1 ring-violet-200/50 dark:border-violet-900/45 dark:bg-zinc-900 dark:shadow-black/40 dark:ring-violet-900/35 sm:rounded-2xl sm:pb-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dash-detail-title"
      >
        <div className="flex shrink-0 flex-col gap-3 border-b border-violet-100 bg-gradient-to-r from-violet-50/90 via-white to-zinc-50/40 px-3 py-3 dark:border-violet-900/40 dark:from-violet-950/35 dark:via-zinc-900 dark:to-zinc-900/90 sm:flex-row sm:items-start sm:justify-between sm:px-5 sm:py-4">
          <div className="min-w-0 flex-1">
            <h2
              id="dash-detail-title"
              className="text-base font-semibold text-zinc-900 dark:text-zinc-50 sm:text-lg"
            >
              {dashEditSession ? 'Edit expense' : 'Receipt details'}
            </h2>
            <p className="mt-0.5 break-all text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {(dashDetailExpense.finalData || {}).vendor || 'Expense'}
              </span>{' '}
              <span className="text-zinc-300 dark:text-zinc-600">·</span>{' '}
              <span className="font-mono text-[11px] text-violet-600 dark:text-violet-400 sm:text-xs">
                {dashDetailExpense._id}
              </span>
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
            {!dashEditSession ? (
              <>
                <button
                  type="button"
                  className={btnPrimary}
                  onClick={() => startDashEdit()}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="inline-flex rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950/40"
                  disabled={dashDeleteBusy || dashEditSaving}
                  onClick={() => void deleteDashExpense()}
                >
                  {dashDeleteBusy ? 'Deleting…' : 'Delete'}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={btnPrimary}
                  disabled={dashEditSaving || dashDeleteBusy}
                  onClick={() => void saveDashEdit()}
                >
                  {dashEditSaving ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  className={btnBase}
                  disabled={dashEditSaving}
                  onClick={onCancelEdit}
                >
                  Cancel edit
                </button>
              </>
            )}
            <button type="button" className={btnBase} onClick={closeDashDetail}>
              Close
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 text-left text-sm sm:px-5 sm:py-4">
          {dashEditSaveError && (
            <p className="mb-3 text-sm font-medium text-red-600 dark:text-red-400">
              {dashEditSaveError}
            </p>
          )}
          {dashEditSession ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className={labelCls}>
                  Vendor
                  <input
                    className={inputCls}
                    value={dashEditSession.draft.vendor}
                    onChange={(e) =>
                      dashEditUpdateField('vendor', e.target.value)
                    }
                    disabled={dashEditSaving}
                  />
                </label>
                <label className={labelCls}>
                  Date
                  <input
                    className={inputCls}
                    type="date"
                    value={dashEditSession.draft.date}
                    onChange={(e) =>
                      dashEditUpdateField('date', e.target.value)
                    }
                    disabled={dashEditSaving}
                  />
                </label>
                <label className={labelCls}>
                  Total
                  <input
                    className={inputCls}
                    inputMode="decimal"
                    value={dashEditSession.draft.total}
                    onChange={(e) =>
                      dashEditUpdateField('total', e.target.value)
                    }
                    disabled={dashEditSaving}
                  />
                </label>
                <label className={labelCls}>
                  Currency
                  <input
                    className={inputCls}
                    value={dashEditSession.draft.currency}
                    onChange={(e) =>
                      dashEditUpdateField('currency', e.target.value)
                    }
                    disabled={dashEditSaving}
                  />
                </label>
                <label className={`${labelCls} sm:col-span-2`}>
                  Tax
                  <input
                    className={inputCls}
                    inputMode="decimal"
                    value={dashEditSession.draft.tax}
                    onChange={(e) =>
                      dashEditUpdateField('tax', e.target.value)
                    }
                    disabled={dashEditSaving}
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span>
                  AI confidence:{' '}
                  <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                    {dashEditSession.draft.aiConfidence != null &&
                    !Number.isNaN(dashEditSession.draft.aiConfidence)
                      ? dashEditSession.draft.aiConfidence
                      : '—'}
                  </strong>
                </span>
                <span>
                  User verified:{' '}
                  <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                    {dashEditSession.confirmReviewAck ? 'Yes' : 'No'}
                  </strong>
                </span>
                <span>
                  Flag:{' '}
                  <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                    {dashEditSession.draft.confidence_flag}
                  </strong>
                </span>
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                Line items
              </h3>
              <div className="flex flex-col gap-3">
                {dashEditSession.draft.items.map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_7rem_auto]"
                  >
                    <input
                      className={inputCls}
                      placeholder="Name"
                      value={row.name}
                      onChange={(e) =>
                        dashEditUpdateItem(i, 'name', e.target.value)
                      }
                      disabled={dashEditSaving}
                    />
                    <input
                      className={inputCls}
                      placeholder="Price"
                      inputMode="decimal"
                      value={row.price}
                      onChange={(e) =>
                        dashEditUpdateItem(i, 'price', e.target.value)
                      }
                      disabled={dashEditSaving}
                    />
                    <button
                      type="button"
                      className="justify-self-start text-sm font-medium text-violet-600 underline decoration-violet-400/60 underline-offset-2 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-violet-400 dark:hover:text-violet-300"
                      onClick={() => dashEditRemoveItemRow(i)}
                      disabled={
                        dashEditSaving ||
                        dashEditSession.draft.items.length <= 1
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="self-start text-sm font-medium text-violet-600 underline decoration-violet-400/60 underline-offset-2 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                  onClick={dashEditAddItemRow}
                  disabled={dashEditSaving}
                >
                  Add line
                </button>
              </div>
              {(needsReviewAcknowledge(
                dashEditSession.draft,
                true,
                false,
              ) ||
                dashEditSession.forceReviewAck) && (
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-left text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                    checked={dashEditSession.confirmReviewAck}
                    disabled={dashEditSaving}
                    onChange={(e) =>
                      setDashEditSession((s) =>
                        s
                          ? { ...s, confirmReviewAck: e.target.checked }
                          : s,
                      )
                    }
                  />
                  <span>
                    I have reviewed this expense and the values are correct.
                  </span>
                </label>
              )}
            </div>
          ) : null}
          {!dashEditSession
            ? (() => {
                const ex = dashDetailExpense
                const fd = ex.finalData || {}
                const cur = fd.currency || ''
                const items = Array.isArray(fd.items) ? fd.items : []
                const docConf =
                  typeof ex.confidence === 'number' &&
                  !Number.isNaN(ex.confidence)
                    ? ex.confidence
                    : typeof fd.confidence === 'number' &&
                        !Number.isNaN(fd.confidence)
                      ? fd.confidence
                      : null
                const confLabel =
                  docConf !== null ? `${Math.round(docConf)}%` : '—'
                const initialScanFailed =
                  ex.originalAiData &&
                  typeof ex.originalAiData === 'object' &&
                  ex.originalAiData.aiParseFailed === true

                return (
                  <>
                    {initialScanFailed && (
                      <div
                        className="mb-4 rounded-lg border border-amber-200 bg-amber-50/90 p-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
                        role="status"
                      >
                        <p className="font-semibold">
                          Why does “Original AI snapshot” show a failure but the
                          receipt looks complete?
                        </p>
                        <p className="mt-2 leading-relaxed text-amber-950/95 dark:text-amber-100/90">
                          That JSON is only a{' '}
                          <strong>record of the first upload</strong> (e.g. OCR
                          could not read the image, or AI returned no structured
                          data). You still entered or corrected vendor, lines, and
                          totals — those are stored as the{' '}
                          <strong>saved expense</strong>. The{' '}
                          <strong>confidence</strong> number is our +30 / +30 /
                          +40 guideline score applied to that <em>saved</em> data,
                          so it can be high even when the snapshot says{' '}
                          <code className="rounded bg-amber-100/80 px-1 font-mono text-xs dark:bg-amber-900/50">
                            aiParseFailed
                          </code>
                          . Raw OCR text is empty when nothing was extracted in
                          that failed step.
                        </p>
                      </div>
                    )}
                    <dl className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-violet-100 bg-gradient-to-b from-violet-50/40 to-zinc-50/30 p-4 sm:grid-cols-2 dark:border-violet-900/35 dark:from-violet-950/20 dark:to-zinc-900/40">
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                          Saved (created)
                        </dt>
                        <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
                          {ex.createdAt
                            ? new Date(ex.createdAt).toLocaleString()
                            : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                          Receipt date
                        </dt>
                        <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
                          {fd.date || '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                          Total
                        </dt>
                        <dd className="mt-0.5 text-lg font-semibold tabular-nums text-violet-900 dark:text-violet-100">
                          {formatDashAmount(fd.total, cur)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                          Tax
                        </dt>
                        <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
                          {formatDashAmount(fd.tax, cur)}
                        </dd>
                      </div>
                      {fd.subtotal != null && fd.subtotal !== '' && (
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                            Subtotal
                          </dt>
                          <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
                            {formatDashAmount(fd.subtotal, cur)}
                          </dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                          Flag / status
                        </dt>
                        <dd className="mt-0.5 flex flex-wrap items-center gap-2">
                          <FlagBadge
                            flag={ex.confidenceFlag ?? fd.confidence_flag}
                          />
                          {ex.status ? (
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                              · {ex.status}
                            </span>
                          ) : null}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">
                          {initialScanFailed
                            ? 'Saved confidence (guideline)'
                            : 'Overall confidence'}
                        </dt>
                        <dd className="mt-2 text-zinc-900 dark:text-zinc-100">
                          {docConf !== null ? (
                            <ConfidenceMeter value={docConf} />
                          ) : (
                            <span>{confLabel}</span>
                          )}
                          <span className="mt-2 block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                            {initialScanFailed
                              ? 'From vendor / date / total / line rules on the saved expense — not from the failed first parse.'
                              : 'Receipt-level score; line-level scores are not stored yet.'}
                          </span>
                        </dd>
                      </div>
                    </dl>

                    <div className="mb-3 border-l-4 border-violet-500 pl-3">
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                        Line items
                      </h3>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {initialScanFailed
                          ? 'Values shown are what was saved on this expense (including any manual edits after a failed scan).'
                          : 'Extracted rows from this expense. Quantity and unit price are shown when present; otherwise use line total only.'}
                      </p>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <table className="min-w-full border-collapse text-left text-sm">
                        <thead>
                          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/80">
                            <th className="px-3 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">
                              Description
                            </th>
                            <th className="px-3 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">
                              Qty
                            </th>
                            <th className="px-3 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">
                              Unit
                            </th>
                            <th className="px-3 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">
                              Total
                            </th>
                            <th className="px-3 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">
                              {initialScanFailed ? 'Line AI score' : 'Confidence'}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="px-3 py-6 text-center text-zinc-500 dark:text-zinc-400"
                              >
                                No line items on this expense.
                              </td>
                            </tr>
                          ) : (
                            items.map((row, i) => {
                              const name =
                                row && typeof row.name === 'string'
                                  ? row.name
                                  : '—'
                              const qty =
                                row &&
                                row.qty != null &&
                                row.qty !== '' &&
                                !Number.isNaN(Number(row.qty))
                                  ? String(row.qty)
                                  : '—'
                              const price =
                                row &&
                                row.price !== null &&
                                row.price !== undefined &&
                                row.price !== ''
                                  ? row.price
                                  : null
                              const unitRaw =
                                row &&
                                row.unitPrice != null &&
                                row.unitPrice !== '' &&
                                !Number.isNaN(Number(row.unitPrice))
                                  ? row.unitPrice
                                  : null
                              const unitDisplay =
                                unitRaw !== null
                                  ? formatDashAmount(unitRaw, cur)
                                  : price !== null &&
                                      !Number.isNaN(Number(price))
                                    ? formatDashAmount(price, cur)
                                    : '—'
                              const totalDisplay =
                                price !== null && !Number.isNaN(Number(price))
                                  ? formatDashAmount(price, cur)
                                  : '—'

                              return (
                                <tr
                                  key={i}
                                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                                >
                                  <td className="px-3 py-2.5 text-zinc-900 dark:text-zinc-100">
                                    {name}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-2.5 text-zinc-600 dark:text-zinc-400">
                                    {qty}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-2.5 text-zinc-700 dark:text-zinc-300">
                                    {unitDisplay}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">
                                    {totalDisplay}
                                  </td>
                                  <td
                                    className="min-w-[5.5rem] px-3 py-2"
                                    title={
                                      initialScanFailed
                                        ? 'No per-line AI score when the first parse failed; see saved confidence above.'
                                        : 'Same receipt-level score on each row until line-level scores exist.'
                                    }
                                  >
                                    {initialScanFailed ? (
                                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                        —
                                      </span>
                                    ) : docConf !== null ? (
                                      <ConfidenceMeter value={docConf} />
                                    ) : (
                                      <span className="text-zinc-500 dark:text-zinc-400">
                                        {confLabel}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    <details className="group mt-5 rounded-xl border border-violet-100 bg-white open:border-violet-200 dark:border-violet-900/40 dark:bg-zinc-900/50 dark:open:border-violet-800/60">
                      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-violet-900 marker:content-none hover:bg-violet-50/60 dark:text-violet-100 dark:hover:bg-violet-950/30 [&::-webkit-details-marker]:hidden">
                        Raw OCR text
                      </summary>
                      <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words border-t border-violet-100 bg-zinc-50/90 p-3 font-mono text-xs text-zinc-800 dark:border-violet-900/30 dark:bg-zinc-950 dark:text-zinc-200">
                        {typeof ex.rawText === 'string' && ex.rawText.trim()
                          ? ex.rawText
                          : '—'}
                      </pre>
                    </details>

                    <details className="group mt-2 rounded-xl border border-violet-100 bg-white open:border-violet-200 dark:border-violet-900/40 dark:bg-zinc-900/50 dark:open:border-violet-800/60">
                      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-violet-900 marker:content-none hover:bg-violet-50/60 dark:text-violet-100 dark:hover:bg-violet-950/30 [&::-webkit-details-marker]:hidden">
                        Original AI snapshot
                      </summary>
                      <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words border-t border-violet-100 bg-zinc-50/90 p-3 font-mono text-xs text-zinc-800 dark:border-violet-900/30 dark:bg-zinc-950 dark:text-zinc-200">
                        {JSON.stringify(ex.originalAiData ?? {}, null, 2)}
                      </pre>
                    </details>
                  </>
                )
              })()
            : null}
        </div>
      </div>
    </div>
  )
}
