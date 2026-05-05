import { cardCls } from '../../lib/uiClasses'
import { currencyDisplayLabel } from '../../lib/dashboardBits'

export function ReceiptHistoryTable({ recent, title, emptyHint }) {
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
                        {fd.currency ? currencyDisplayLabel(fd.currency) : ''}
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
