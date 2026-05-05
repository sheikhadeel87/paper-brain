import {
  btnBase,
  btnPrimary,
  dashRowIconBtn,
  dashRowIconBtnDanger,
  inputCls,
  labelCls,
} from '../../lib/uiClasses'
import { currencyDisplayLabel } from '../../lib/dashboardBits'
import {
  ConfidenceMeter,
  EyeViewIcon,
  FlagBadge,
  PencilIcon,
  TrashIcon,
  VendorAvatar,
} from '../../components/ExpenseUi'
import { PagedNav } from './PagedNav'

/**
 * @param {'overview' | 'expenses'} props.mode
 */
export function DashboardExpensesSection({
  mode,
  dashOverviewLimit = 10,
  expensesPage = 0,
  expensesPageSize = 15,
  expensesPageSizeOptions,
  onExpensesPageChange,
  onExpensesPageSizeChange,
  onViewAllExpenses,
  dashFrom,
  dashTo,
  dashVendor,
  dashConfidenceFlag = '',
  setDashFrom,
  setDashTo,
  setDashVendor,
  setDashConfidenceFlag,
  dashRows,
  dashTotalCount,
  dashLoading,
  dashError,
  dashEditSaveError,
  dashDetailExpense,
  dashEditSaving,
  dashDeleteBusy,
  onApplyFilters,
  onClearFilters,
  onExportCsv,
  exportCsvBusy = false,
  onViewExpense,
  onEditExpense,
  onDeleteExpense,
}) {
  const isExpensesList = mode === 'expenses'
  const overviewHasMore =
    mode === 'overview' &&
    dashTotalCount > dashOverviewLimit &&
    dashTotalCount > 0
  const expensesRangeFrom =
    dashTotalCount === 0 ? 0 : expensesPage * expensesPageSize + 1
  const expensesRangeTo =
    dashTotalCount === 0
      ? 0
      : expensesPage * expensesPageSize + dashRows.length

  const noDashFilters =
    !String(dashFrom || '').trim() &&
    !String(dashTo || '').trim() &&
    !String(dashVendor || '').trim()

  return (
    <section
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      id="dash-expenses-table"
    >
      <div className="border-b border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
        <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Filters
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
          <label className={`${labelCls} sm:col-span-2 lg:col-span-2`}>
            Vendor contains
            <input
              className={inputCls}
              value={dashVendor}
              onChange={(e) => setDashVendor(e.target.value)}
              placeholder="e.g. Mart"
            />
          </label>
          <label className={labelCls}>
            Flag
            <select
              className={inputCls}
              value={dashConfidenceFlag}
              onChange={(e) => setDashConfidenceFlag(e.target.value)}
            >
              <option value="">All</option>
              <option value="auto">Auto</option>
              <option value="review">Review</option>
            </select>
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
          <button
            type="button"
            className={btnBase}
            disabled={dashLoading || exportCsvBusy}
            onClick={() =>
              typeof onExportCsv === 'function' ? void onExportCsv() : undefined
            }
          >
            {exportCsvBusy ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
        {dashError && (
          <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
            {dashError}
          </p>
        )}
      </div>

      <div className="p-4 sm:p-6">
        {dashEditSaveError && !dashDetailExpense && (
          <p className="mb-3 text-sm font-medium text-red-600 dark:text-red-400">
            {dashEditSaveError}
          </p>
        )}
        <div
          className={`mb-3 flex flex-wrap items-center gap-2 ${isExpensesList ? 'justify-end' : 'justify-between'}`}
        >
          {!isExpensesList ? (
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Recent expenses
            </h2>
          ) : null}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">
              {isExpensesList && dashTotalCount > 0
                ? `Rows ${expensesRangeFrom}–${expensesRangeTo} of ${dashTotalCount}.`
                : `Showing ${dashRows.length} of ${dashTotalCount}`}
            </span>
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
                      <p className="m-0 font-medium text-zinc-700 dark:text-zinc-300">
                        No expenses for this account yet.
                      </p>
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
                      {fd.currency ? currencyDisplayLabel(fd.currency) : '—'}
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
            pageSizeOptions={expensesPageSizeOptions}
            onPageSizeChange={onExpensesPageSizeChange}
          />
        ) : null}
      </div>
    </section>
  )
}
