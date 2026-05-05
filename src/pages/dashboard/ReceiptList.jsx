import { btnPrimary } from '../../lib/uiClasses'
import { ReceiptHistoryTable } from './ReceiptHistoryTable'
import { PagedNav } from './PagedNav'

export function ReceiptList({
  recentTotalCount = 0,
  receiptLibraryPage = 0,
  receiptLibraryPageSize = 15,
  receiptLibraryPageSizeOptions,
  onReceiptLibraryPageChange,
  onReceiptLibraryPageSizeChange,
  onGoReceiptScan,
  recent,
  recentFetchError,
}) {
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
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              All Receipts
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
          emptyHint="No expenses yet. Use Scan new receipt to add one."
        />
        <PagedNav
          pageIndex={receiptLibraryPage}
          pageSize={receiptLibraryPageSize}
          totalCount={recentTotalCount}
          onPageChange={onReceiptLibraryPageChange}
          pageSizeOptions={receiptLibraryPageSizeOptions}
          onPageSizeChange={onReceiptLibraryPageSizeChange}
        />
      </div>
    </div>
  )
}
