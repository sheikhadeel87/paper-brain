import { btnBase } from '../../lib/uiClasses'
import { Select } from '../../components/Select.jsx'

/** Prev/next for server-paged lists (receipts library, expenses). */
export function PagedNav({
  pageIndex,
  pageSize,
  totalCount,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
}) {
  const n = totalCount || 0
  if (n <= 0 || typeof onPageChange !== 'function') return null
  const totalPages = Math.max(1, Math.ceil(n / pageSize))
  const canPrev = pageIndex > 0
  const canNext = (pageIndex + 1) * pageSize < n
  const showPageSize =
    Array.isArray(pageSizeOptions) &&
    pageSizeOptions.length > 1 &&
    typeof onPageSizeChange === 'function'
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Page{' '}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {pageIndex + 1}
          </span>{' '}
          of {totalPages}
          <span className="text-zinc-500 dark:text-zinc-400">
            {' '}
            · {pageSize} per page · {n} total
          </span>
        </p>
        {showPageSize ? (
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="whitespace-nowrap">Rows per page</span>
            <Select
              value={pageSize}
              onChange={(nextValue) => {
                const v = Number(nextValue)
                if (!Number.isNaN(v)) onPageSizeChange(v)
              }}
              options={pageSizeOptions.map((s) => ({
                value: String(s),
                label: String(s),
              }))}
              buttonClassName="max-w-[11rem] py-1.5"
            />
          </label>
        ) : null}
      </div>
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
