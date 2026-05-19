import { useCallback, useMemo, useState } from 'react'
import {
  btnBase,
  btnPrimary,
  cardCls,
  inputCls,
  labelCls,
} from '../../lib/uiClasses'
import { needsReviewAcknowledge } from '../../lib/receiptDraft'
import { receiptImageFileWithinLimits } from '../../lib/receiptImageAccept.js'
import { InlineSpinner } from '../../components/ExpenseUi'
import { ReceiptHistoryTable } from './ReceiptHistoryTable'

function assignFilesToReceiptInput(input, fileList) {
  if (!input || !fileList?.length) return false
  const picked = Array.from(fileList).filter(receiptImageFileWithinLimits)
  if (!picked.length) return false
  try {
    const dt = new DataTransfer()
    picked.forEach((f) => dt.items.add(f))
    input.files = dt.files
    input.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  } catch {
    return false
  }
}

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
  receiptQueuePreviewUrls = [],
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
  multiReceiptInfo = null,
  receiptReviewHint = '',
  receiptBatchProgress = null,
  receiptCategories = [],
  onReceiptCategoryChange,
}) {
  const [queueGalleryOpen, setQueueGalleryOpen] = useState(false)

  const queueUrls = useMemo(
    () =>
      Array.isArray(receiptQueuePreviewUrls) ? receiptQueuePreviewUrls : [],
    [receiptQueuePreviewUrls],
  )

  const receiptPreviewSlots = useMemo(() => {
    const n = queueUrls.length
    const slots = []
    for (let i = 0; i < 4; i++) {
      if (n > 4) {
        if (i < 3) slots.push({ kind: 'img', url: queueUrls[i], i })
        else slots.push({ kind: 'more', url: queueUrls[3], extra: n - 4, i })
      } else if (i < n) {
        slots.push({ kind: 'img', url: queueUrls[i], i })
      } else {
        slots.push({ kind: 'empty', i })
      }
    }
    return slots
  }, [queueUrls])

  const onReceiptDragOver = useCallback((ev) => {
    ev.preventDefault()
    ev.stopPropagation()
  }, [])

  const onReceiptDrop = useCallback(
    (ev) => {
      ev.preventDefault()
      ev.stopPropagation()
      if (uploading || Boolean(receiptBatchProgress?.batchPostBusy)) return
      const input = receiptUploadInputRef?.current
      if (!input) return
      const files = ev.dataTransfer?.files
      if (files?.length) assignFilesToReceiptInput(input, files)
    },
    [receiptUploadInputRef, uploading, receiptBatchProgress?.batchPostBusy],
  )

  const s = receiptBatchProgress?.summary
  const queueSending =
    Boolean(receiptBatchProgress?.queuePlaceholder) ||
    Boolean(receiptBatchProgress?.batchPostBusy)
  const showUploadQueueCard =
    receiptBatchProgress &&
    (s || Boolean(receiptBatchProgress.queuePlaceholder))
  const batchPct =
    s && s.total > 0
      ? Math.round(((s.completed + s.failed) / s.total) * 100)
      : 0

  const jobs = receiptBatchProgress?.mergedJobs ?? []
  const waiting = jobs.filter((j) =>
    ['waiting', 'delayed', 'waiting-children', 'paused', 'unknown'].includes(
      j.state,
    ),
  )
  const processing = jobs.filter(
    (j) => j.state === 'active' || j.state === 'prioritized',
  )
  const completed = jobs.filter((j) => j.state === 'completed' || j.state === 'missing')
  const failed = jobs.filter((j) => j.state === 'failed')
  const scanBusy = uploading || Boolean(receiptBatchProgress?.batchPostBusy)

  function queueJobRow(j) {
    const label = j.fileName || j.id
    const isFailed = j.state === 'failed'
    const stateLabel =
      j.state === 'waiting-children' ? 'queued' : j.state
    return (
      <li
        key={j.id}
        className="border-b border-amber-200/50 py-1 text-[10px] last:border-0 dark:border-amber-900/35"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="min-w-0 flex-1 truncate font-medium text-amber-950 dark:text-amber-50">
            {label}
          </span>
          <span
            className={
              isFailed
                ? 'shrink-0 font-semibold uppercase tracking-wide text-[9px] text-red-800 dark:text-red-300'
                : 'shrink-0 font-medium uppercase tracking-wide text-[9px] text-amber-900/80 dark:text-amber-200/80'
            }
          >
            {stateLabel}
          </span>
        </div>
        {j.failedReason ? (
          <p className="mt-0.5 mb-0 line-clamp-3 text-[9px] leading-snug text-red-700 dark:text-red-300">
            {j.failedReason}
          </p>
        ) : null}
      </li>
    )
  }

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

      {multiReceiptInfo ? (
        <div
          className="rounded-xl border border-violet-200 bg-violet-50/90 px-4 py-3 text-sm text-violet-950 dark:border-violet-800/60 dark:bg-violet-950/30 dark:text-violet-100"
          role="status"
        >
          <p className="m-0 font-medium">
            Multiple receipts in this image — {multiReceiptInfo.current} of{' '}
            {multiReceiptInfo.total}
          </p>
          <p className="mt-1 mb-0 text-xs text-violet-900/90 dark:text-violet-200/90">
            Review and save each slip. After a save, the next receipt loads automatically until all
            are saved.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] lg:items-start xl:mx-auto xl:max-w-[1236px] xl:grid-cols-[775px_440px] xl:justify-center">
        <div className="min-w-0 space-y-5 xl:w-[775px]">
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
              aria-busy={scanBusy}
            >
              <h2 className="mb-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Receipt scan
              </h2>
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                Upload one or more receipt images (JPG, JPEG, PNG, or WebP). In the file dialog,
                use Ctrl+click (Windows) or ⌘+click (Mac) to select several at once, or drag multiple
                files onto the area below.
              </p>
              <div
                className={`rounded-xl border-2 border-dashed border-zinc-300 bg-gradient-to-b from-violet-50/60 to-zinc-50/80 transition dark:border-zinc-600 dark:from-violet-950/20 dark:to-zinc-900/40 ${
                  scanBusy
                    ? 'border-violet-300/80 dark:border-violet-700/50'
                    : 'hover:border-violet-400 dark:hover:border-violet-600'
                }`}
                onDragEnter={onReceiptDragOver}
                onDragOver={onReceiptDragOver}
                onDrop={onReceiptDrop}
              >
                <input
                  ref={receiptUploadInputRef}
                  id="receipt-upload-input"
                  key={inputKey}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/*"
                  multiple
                  disabled={uploading}
                  onChange={onUpload}
                  className="sr-only"
                />
                <label
                  htmlFor="receipt-upload-input"
                  className={`flex flex-col items-center gap-3 px-4 py-8 text-center sm:px-6 sm:py-10 ${
                    scanBusy ? 'cursor-wait' : 'cursor-pointer'
                  }`}
                >
                  <span className="rounded-full bg-violet-100 p-3 text-violet-700 shadow-sm dark:bg-violet-950/60 dark:text-violet-300">
                    {scanBusy ? (
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
                      ? 'Scanning receipt…'
                      : receiptBatchProgress?.batchPostBusy
                        ? 'Adding to server queue…'
                        : 'Drop image(s) here, or use the purple button. Each selection is queued for background processing — you can add more anytime.'}
                  </span>
                </label>
                <div className="flex justify-center px-6 pb-8">
                  <button
                    type="button"
                    className={`${btnPrimary} gap-2`}
                    disabled={uploading}
                    onClick={() => receiptUploadInputRef.current?.click()}
                  >
                    {scanBusy ? (
                      <>
                        <InlineSpinner className="h-4 w-4 shrink-0 text-white" />
                        {uploading ? 'Scanning…' : 'Queueing…'}
                      </>
                    ) : (
                      'Choose images'
                    )}
                  </button>
                </div>
              </div>
            </section>
          )}

          {phase === 'review' && draft && (
            <section className={`${cardCls} mb-5 text-left`}>
              {receiptReviewHint ? (
                <div
                  className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100"
                  role="alert"
                >
                  {receiptReviewHint}
                </div>
              ) : null}
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
                <label className={`${labelCls} sm:col-span-2`}>
                  Category
                  <select
                    className={inputCls}
                    value={draft.category || 'Other'}
                    onChange={(e) => updateField('category', e.target.value)}
                  >
                    {receiptCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
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
                    review, confidence is below 80, or printed totals do not match
                    line items.
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
              categories={receiptCategories}
              onCategoryChange={onReceiptCategoryChange}
            />
          ) : null}
        </div>

        <aside className="flex min-w-0 flex-col gap-3 lg:w-[440px] lg:shrink-0 lg:sticky lg:top-6 lg:self-start">
          <div className={`${cardCls} p-4 text-left`}>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
              Receipt
            </h2>
            <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
              Preview while you edit. Reject / new upload clears the grid.
            </p>
            {queueUrls.length > 0 ? (
              <>
                <div className="grid grid-cols-2 grid-rows-2 gap-2">
                  {receiptPreviewSlots.map((slot) => {
                    if (slot.kind === 'empty') {
                      return (
                        <div
                          key={`empty-${slot.i}`}
                          className="aspect-square w-full rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-100/40 dark:border-zinc-600 dark:bg-zinc-800/30"
                          aria-hidden
                        />
                      )
                    }
                    if (slot.kind === 'more') {
                      return (
                        <button
                          key={`more-${slot.url}-${slot.i}`}
                          type="button"
                          className="relative aspect-square w-full overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 p-0 dark:border-zinc-700 dark:bg-zinc-950"
                          onClick={() => setQueueGalleryOpen(true)}
                          aria-label={`Show all ${queueUrls.length} queued images`}
                        >
                          <img
                            src={slot.url}
                            alt={`Queued receipt ${slot.i + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-bold text-white">
                            +{slot.extra}
                          </span>
                        </button>
                      )
                    }
                    return (
                      <img
                        key={`${slot.url}-${slot.i}`}
                        src={slot.url}
                        alt={`Queued receipt ${slot.i + 1}`}
                        className="aspect-square w-full rounded-lg border border-zinc-200 bg-zinc-50 object-cover dark:border-zinc-700 dark:bg-zinc-950"
                      />
                    )
                  })}
                </div>
                {queueGalleryOpen ? (
                  <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
                    role="presentation"
                    onClick={() => setQueueGalleryOpen(false)}
                  >
                    <div
                      role="dialog"
                      aria-modal="true"
                      aria-label="All queued receipt images"
                      className="flex max-h-[min(90vh,720px)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
                      onClick={(ev) => ev.stopPropagation()}
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
                        <h3 className="m-0 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          All images ({queueUrls.length})
                        </h3>
                        <button
                          type="button"
                          className={btnBase}
                          onClick={() => setQueueGalleryOpen(false)}
                        >
                          Close
                        </button>
                      </div>
                      <div className="overflow-y-auto p-4">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {queueUrls.map((url, i) => (
                            <img
                              key={url}
                              src={url}
                              alt={`Queued receipt ${i + 1}`}
                              className="aspect-square w-full rounded-lg border border-zinc-200 bg-zinc-50 object-cover dark:border-zinc-700 dark:bg-zinc-950"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            ) : receiptPreviewUrl ? (
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
                  uploaded images appear here.
                </span>
              </div>
            )}
          </div>

          {showUploadQueueCard ? (
            <div
              className={`${cardCls} border-amber-200 bg-amber-50/90 p-2.5 text-left text-amber-950 sm:p-2.5 dark:border-amber-800/50 dark:bg-amber-950/35 dark:text-amber-100`}
              role="status"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="m-0 text-xs font-semibold">Upload queue</p>
                  <p className="mt-0.5 mb-0 text-[10px] leading-snug text-amber-900/80 dark:text-amber-200/75">
                    One image at a time on the server — totals update live.
                  </p>
                </div>
                {typeof receiptBatchProgress.onDismissQueue === 'function' ? (
                  <button
                    type="button"
                    className="shrink-0 rounded-md border border-amber-300/80 bg-white px-2 py-0.5 text-[10px] font-medium text-amber-950 hover:bg-amber-100/80 dark:border-amber-700 dark:bg-zinc-900 dark:text-amber-100 dark:hover:bg-zinc-800"
                    onClick={() => receiptBatchProgress.onDismissQueue()}
                  >
                    Dismiss
                  </button>
                ) : null}
              </div>
              {queueSending ? (
                <p className="mt-2 mb-0 flex items-center gap-2 text-[11px] font-medium text-amber-900 dark:text-amber-100">
                  <InlineSpinner className="h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-300" />
                  Sending to the server queue… counts appear as soon as jobs are registered.
                </p>
              ) : (
                <>
                  <dl className="mt-2 grid grid-cols-5 gap-1 text-center text-[10px]">
                    <div>
                      <dt className="text-amber-800/75 dark:text-amber-300/75">Tot</dt>
                      <dd className="m-0 text-xs font-semibold tabular-nums">{s.total}</dd>
                    </div>
                    <div>
                      <dt className="text-amber-800/75 dark:text-amber-300/75">Done</dt>
                      <dd className="m-0 text-xs font-semibold tabular-nums text-emerald-800 dark:text-emerald-300">
                        {s.completed}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-amber-800/75 dark:text-amber-300/75">Run</dt>
                      <dd className="m-0 text-xs font-semibold tabular-nums">{s.processing}</dd>
                    </div>
                    <div>
                      <dt className="text-amber-800/75 dark:text-amber-300/75">Wait</dt>
                      <dd className="m-0 text-xs font-semibold tabular-nums">{s.waiting}</dd>
                    </div>
                    <div>
                      <dt className="text-amber-800/75 dark:text-amber-300/75">Fail</dt>
                      <dd className="m-0 text-xs font-semibold tabular-nums text-red-800 dark:text-red-300">
                        {s.failed}
                      </dd>
                    </div>
                  </dl>
                  <div
                    className="mt-2 h-1 overflow-hidden rounded-full bg-amber-200/80 dark:bg-amber-900/50"
                    aria-hidden
                  >
                    <div
                      className="h-1 rounded-full bg-amber-600 transition-[width] duration-300 dark:bg-amber-400"
                      style={{ width: `${batchPct}%` }}
                    />
                  </div>
                </>
              )}
              {!queueSending && receiptBatchProgress.idle ? (
                <p className="mt-1.5 mb-0 text-[10px] font-medium text-emerald-800 dark:text-emerald-300">
                  Session queue idle — add more anytime.
                </p>
              ) : null}
              {!queueSending ? (
                <div
                  className={`mt-2 space-y-2 overflow-y-auto text-left ${
                    failed.length > 0 ? 'max-h-48' : 'max-h-28'
                  }`}
                >
                  {[
                    ['failed', 'Failed', true, failed],
                    ['processing', 'Processing', false, processing],
                    ['waiting', 'Waiting', false, waiting],
                    ['completed', 'Completed', false, completed],
                  ].map(([id, title, isFailed, items]) =>
                    items.length === 0 ? null : (
                      <div key={id}>
                        <p
                          className={
                            isFailed
                              ? 'mb-0.5 text-[9px] font-semibold uppercase tracking-wide text-red-800/90 dark:text-red-300/90'
                              : 'mb-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-900/90 dark:text-amber-200/90'
                          }
                        >
                          {title}
                        </p>
                        <ul className="m-0 list-none p-0">{items.map(queueJobRow)}</ul>
                      </div>
                    ),
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
