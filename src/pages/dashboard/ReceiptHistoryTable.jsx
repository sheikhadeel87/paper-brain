import { cardCls } from '../../lib/uiClasses'
import { currencyDisplayLabel } from '../../lib/dashboardBits'
import {
  RECEIPT_CATEGORIES,
  normalizeReceiptCategory,
} from '../../lib/receiptCategories'
import { Select } from '../../components/Select.jsx'

export function ReceiptHistoryTable({
  recent,
  title,
  emptyHint,
  categories = RECEIPT_CATEGORIES,
  onCategoryChange,
  showOrgColumns = false,
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
                {showOrgColumns ? (
                  <>
                    <th className="whitespace-nowrap px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                      Branch
                    </th>
                    <th className="whitespace-nowrap px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                      Uploaded By
                    </th>
                  </>
                ) : null}
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
                const branch = ex.branch && typeof ex.branch === 'object' ? ex.branch : null
                const uploader =
                  ex.uploadedByUser && typeof ex.uploadedByUser === 'object'
                    ? ex.uploadedByUser
                    : null
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
                    <td className="max-w-[14rem] px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">
                      <div className="truncate">{fd.vendor || '—'}</div>
                      {duplicate ? (
                        <div className="mt-1">
                          <span className="inline-flex max-w-full rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                            Possible duplicate
                            {duplicateConfidence ? ` ${Math.round(Number(duplicateConfidence))}%` : ''}
                          </span>
                        </div>
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
                        <Select
                          value={category}
                          onChange={(nextValue) => onCategoryChange(receiptId, nextValue)}
                          options={categories}
                          buttonClassName="min-h-0 rounded-full px-2 py-1 text-xs font-medium"
                          menuClassName="text-xs"
                        />
                      ) : (
                        <span className="rounded-full bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700 dark:bg-violet-950/40 dark:text-violet-200">
                          {category}
                        </span>
                      )}
                    </td>
                    {showOrgColumns ? (
                      <>
                        <td className="whitespace-nowrap px-3 py-2 text-zinc-700 dark:text-zinc-300">
                          {branch?.name || '—'}
                        </td>
                        <td className="max-w-[13rem] px-3 py-2 text-zinc-600 dark:text-zinc-400">
                          <div className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                            {uploader?.name || uploader?.email || '—'}
                          </div>
                          {uploader?.email && uploader.email !== uploader.name ? (
                            <div className="truncate text-xs text-zinc-500 dark:text-zinc-500">
                              {uploader.email}
                            </div>
                          ) : null}
                        </td>
                      </>
                    ) : null}
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
