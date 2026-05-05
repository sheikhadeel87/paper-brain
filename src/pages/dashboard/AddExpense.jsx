import {
  btnBase,
  btnPrimary,
  cardCls,
  inputCls,
  labelCls,
} from '../../lib/uiClasses'
import { needsReviewAcknowledge } from '../../lib/receiptDraft'
import { InlineSpinner } from '../../components/ExpenseUi'
import { ReceiptHistoryTable } from './ReceiptHistoryTable'

export function AddExpense({
  phase,
  draft,
  rawText,
  parseOk,
  parseError,
  needsReview,
  uploading,
  saving,
  saveError,
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
  return (
    <div className="space-y-6 text-left">
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
                Upload a receipt image (JPG, JPEG, PNG, or WebP). The server uses Gemini
                (vision) on the image; you review before anything is saved as an
                expense.
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
                    uploading ? 'cursor-wait' : 'cursor-pointer'
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
                    {draft.items.map((row, i) => (
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
                              updateItem(i, 'name', e.target.value)
                            }
                          />
                        </td>
                        <td className="py-2 pr-2 align-middle">
                          <input
                            className={`${inputCls} w-full`}
                            placeholder="Qty"
                            inputMode="decimal"
                            value={row.qty ?? ''}
                            onChange={(e) =>
                              updateItem(i, 'qty', e.target.value)
                            }
                          />
                        </td>
                        <td className="py-2 pr-2 align-middle">
                          <input
                            className={`${inputCls} w-full`}
                            placeholder="Unit"
                            inputMode="decimal"
                            value={row.unitPrice ?? ''}
                            onChange={(e) =>
                              updateItem(i, 'unitPrice', e.target.value)
                            }
                          />
                        </td>
                        <td className="py-2 pr-2 align-middle">
                          <input
                            className={`${inputCls} w-full`}
                            placeholder="Line total"
                            inputMode="decimal"
                            value={row.price}
                            onChange={(e) =>
                              updateItem(i, 'price', e.target.value)
                            }
                          />
                        </td>
                        <td className="py-2 align-middle">
                          <button
                            type="button"
                            className="text-sm font-medium text-violet-600 underline decoration-violet-400/60 underline-offset-2 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-violet-400 dark:hover:text-violet-300"
                            onClick={() => removeItemRow(i)}
                            disabled={draft.items.length <= 1}
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
                className="mt-3 self-start text-sm font-medium text-violet-600 underline decoration-violet-400/60 underline-offset-2 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                onClick={addItemRow}
              >
                Add line
              </button>

              <details className="mt-5 text-left text-sm text-zinc-700 dark:text-zinc-300">
                <summary className="cursor-pointer font-medium text-zinc-800 dark:text-zinc-200">
                  Raw text
                </summary>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                  Optional Tesseract line (if enabled on the server) or a
                  full-image transcript from Gemini.
                </p>
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
                    Runs the same scan again on the file (no need to re-select).
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
              <p className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-50">
                Expense saved.
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
    </div>
  )
}
