import { cardCls } from '../../lib/uiClasses'
import { currencyDisplayLabel } from '../../lib/dashboardBits'
import {
  RECEIPT_CATEGORIES,
  normalizeReceiptCategory,
} from '../../lib/receiptCategories'

export function ReceiptHistoryTable({
  recent,
  title,
  emptyHint,
  categories = RECEIPT_CATEGORIES,
  onCategoryChange,
}) {
  /** Horizontal scroll on narrow viewports only; no max-height so paged rows fit without a vertical scrollbar. */
  const wrapCls =
    'overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700'
  return (
    <section className={`${cardCls} text-left`}>
      {title ? (
        <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h2>
      ) : null}
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
                  Category
                </th>
                <th className="whitespace-nowrap px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.map((ex, i) => {
                const fd =
                  ex.finalData && typeof ex.finalData === 'object'
                    ? ex.finalData
                    : ex && typeof ex === 'object'
                      ? ex
                      : {}
                const created = ex.createdAt
                  ? new Date(ex.createdAt).toLocaleString()
                  : '—'
                const category = normalizeReceiptCategory(fd.category || ex.category)
                const receiptId = ex._id || ex.id
                const duplicate =
                  Boolean(ex.possibleDuplicate || fd.possibleDuplicate) ||
                  Boolean(ex.duplicateWarning || fd.duplicateWarning)
                const duplicateConfidence =
                  ex.duplicateConfidence ??
                  fd.duplicateConfidence ??
                  ex.duplicateWarning?.confidenceScore ??
                  fd.duplicateWarning?.confidenceScore
                return (
                  <tr
                    key={ex._id || ex.id || `recent-${i}`}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                  >
                    <td className="max-w-[14rem] truncate px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">
                      {fd.vendor || '—'}
                      {duplicate ? (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                          Possible duplicate
                          {duplicateConfidence ? ` ${Math.round(Number(duplicateConfidence))}%` : ''}
                        </span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums text-zinc-900 dark:text-zinc-100">
                      {fd.total ?? '—'}{' '}
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {fd.currency ? currencyDisplayLabel(fd.currency) : ''}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {typeof onCategoryChange === 'function' && receiptId ? (
                        <select
                          className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                          value={category}
                          onChange={(e) => onCategoryChange(receiptId, e.target.value)}
                        >
                          {categories.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="rounded-full bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700 dark:bg-violet-950/40 dark:text-violet-200">
                          {category}
                        </span>
                      )}
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
