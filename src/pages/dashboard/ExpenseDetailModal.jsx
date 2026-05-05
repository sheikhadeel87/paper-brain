import { btnBase, btnPrimary, inputCls, labelCls } from '../../lib/uiClasses'
import { formatDashAmount, needsReviewAcknowledge } from '../../lib/receiptDraft'
import { ConfidenceMeter, FlagBadge } from '../../components/ExpenseUi'

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
              <div className="-mx-1 max-w-full overflow-x-auto px-1 [-webkit-overflow-scrolling:touch]">
                <table className="min-w-[26rem] w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/80">
                      <th className="px-2 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">
                        Description
                      </th>
                      <th className="w-[4.5rem] whitespace-nowrap px-2 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">
                        Qty
                      </th>
                      <th className="w-[6rem] whitespace-nowrap px-2 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">
                        Unit
                      </th>
                      <th className="w-[6rem] whitespace-nowrap px-2 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">
                        Total
                      </th>
                      <th className="w-px whitespace-nowrap px-2 py-2.5">
                        <span className="sr-only">Remove row</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashEditSession.draft.items.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                      >
                        <td className="py-2 pr-2 align-middle">
                          <input
                            className={`${inputCls} min-w-[8rem] w-full`}
                            placeholder="Description"
                            value={row.name}
                            onChange={(e) =>
                              dashEditUpdateItem(i, 'name', e.target.value)
                            }
                            disabled={dashEditSaving}
                          />
                        </td>
                        <td className="py-2 pr-2 align-middle">
                          <input
                            className={`${inputCls} w-full`}
                            placeholder="Qty"
                            inputMode="decimal"
                            value={row.qty ?? ''}
                            onChange={(e) =>
                              dashEditUpdateItem(i, 'qty', e.target.value)
                            }
                            disabled={dashEditSaving}
                          />
                        </td>
                        <td className="py-2 pr-2 align-middle">
                          <input
                            className={`${inputCls} w-full`}
                            placeholder="Unit"
                            inputMode="decimal"
                            value={row.unitPrice ?? ''}
                            onChange={(e) =>
                              dashEditUpdateItem(i, 'unitPrice', e.target.value)
                            }
                            disabled={dashEditSaving}
                          />
                        </td>
                        <td className="py-2 pr-2 align-middle">
                          <input
                            className={`${inputCls} w-full`}
                            placeholder="Line total"
                            inputMode="decimal"
                            value={row.price}
                            onChange={(e) =>
                              dashEditUpdateItem(i, 'price', e.target.value)
                            }
                            disabled={dashEditSaving}
                          />
                        </td>
                        <td className="py-2 align-middle">
                          <button
                            type="button"
                            className="text-sm font-medium text-violet-600 underline decoration-violet-400/60 underline-offset-2 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-violet-400 dark:hover:text-violet-300"
                            onClick={() => dashEditRemoveItemRow(i)}
                            disabled={
                              dashEditSaving ||
                              dashEditSession.draft.items.length <= 1
                            }
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                className="mt-3 self-start text-sm font-medium text-violet-600 underline decoration-violet-400/60 underline-offset-2 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-violet-400 dark:hover:text-violet-300"
                onClick={dashEditAddItemRow}
                disabled={dashEditSaving}
              >
                Add line
              </button>
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
                          <strong>record of the first upload</strong> (e.g. the
                          image was unreadable, or AI returned no structured data).
                          You still entered or corrected vendor, lines, and totals
                          — those are stored as the <strong>saved expense</strong>.
                          The <strong>confidence</strong> number is our +30 / +30 /
                          +40 guideline score applied to that <em>saved</em> data,
                          so it can be high even when the snapshot says{' '}
                          <code className="rounded bg-amber-100/80 px-1 font-mono text-xs dark:bg-amber-900/50">
                            aiParseFailed
                          </code>
                          . Raw text is empty when nothing was captured in that
                          failed step.
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
                          : 'Extracted rows: Qty and Unit only when the receipt (or scan) had separate columns; the Total column is always the line amount.'}
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
                          </tr>
                        </thead>
                        <tbody>
                          {items.length === 0 ? (
                            <tr>
                              <td
                                colSpan={4}
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
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    <details className="group mt-5 rounded-xl border border-violet-100 bg-white open:border-violet-200 dark:border-violet-900/40 dark:bg-zinc-900/50 dark:open:border-violet-800/60">
                      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-violet-900 marker:content-none hover:bg-violet-50/60 dark:text-violet-100 dark:hover:bg-violet-950/30 [&::-webkit-details-marker]:hidden">
                        Raw text
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
