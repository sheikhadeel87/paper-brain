import { btnPrimary } from '../../lib/uiClasses'
import { useDashboardKpis } from './useDashboardKpis'
import { DashboardOverviewUpper } from './DashboardOverviewUpper'
import { DashboardExpensesSection } from './DashboardExpensesSection'
import { DashboardConfidenceHelp } from './DashboardConfidenceHelp'

export function DashboardHome({
  onNavigateAddExpense,
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
  dashSummary,
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
  const dashKpis = useDashboardKpis(dashSummary, dashRows)

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Overview of your expenses and AI insights.
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <button
            type="button"
            className={`${btnPrimary} w-full sm:w-auto`}
            onClick={() =>
              typeof onNavigateAddExpense === 'function' &&
              onNavigateAddExpense()
            }
          >
            + Add expense
          </button>
        </div>
      </div>

      <DashboardOverviewUpper
        dashKpis={dashKpis}
        dashRows={dashRows}
        dashTotalCount={dashTotalCount}
      />

      <DashboardExpensesSection
        mode="overview"
        dashOverviewLimit={dashOverviewLimit}
        expensesPage={expensesPage}
        expensesPageSize={expensesPageSize}
        expensesPageSizeOptions={expensesPageSizeOptions}
        onExpensesPageChange={onExpensesPageChange}
        onExpensesPageSizeChange={onExpensesPageSizeChange}
        onViewAllExpenses={onViewAllExpenses}
        dashFrom={dashFrom}
        dashTo={dashTo}
        dashVendor={dashVendor}
        dashConfidenceFlag={dashConfidenceFlag}
        setDashFrom={setDashFrom}
        setDashTo={setDashTo}
        setDashVendor={setDashVendor}
        setDashConfidenceFlag={setDashConfidenceFlag}
        dashRows={dashRows}
        dashTotalCount={dashTotalCount}
        dashLoading={dashLoading}
        dashError={dashError}
        dashEditSaveError={dashEditSaveError}
        dashDetailExpense={dashDetailExpense}
        dashEditSaving={dashEditSaving}
        dashDeleteBusy={dashDeleteBusy}
        onApplyFilters={onApplyFilters}
        onClearFilters={onClearFilters}
        onExportCsv={onExportCsv}
        exportCsvBusy={exportCsvBusy}
        onViewExpense={onViewExpense}
        onEditExpense={onEditExpense}
        onDeleteExpense={onDeleteExpense}
      />

      <DashboardConfidenceHelp />
    </div>
  )
}
