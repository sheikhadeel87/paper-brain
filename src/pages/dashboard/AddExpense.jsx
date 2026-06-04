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
import { Select } from '../../components/Select.jsx'
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
  onViewDuplicateReceipt,
}) {
  const [queueGalleryOpen, setQueueGalleryOpen] = useState(false)

  const queueUrls = useMemo(
    () =>
      Array.isArray(receiptQueuePreviewUrls) ? receiptQueuePreviewUrls : [],
    [receiptQueuePreviewUrls],
  )

  const receiptPreviewSlots = useMemo(() => {
    const n = queueUrls.length
    if (n > 4) {
      return [
        ...queueUrls.slice(0, 3).map((url, i) => ({ kind: 'img', url, i })),
        { kind: 'more', url: queueUrls[3], extra: n - 4, i: 3 },
      ]
    }
    return queueUrls.map((url, i) => ({ kind: 'img', url, i }))
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
  const receiptPreviewGridClass =
    queueUrls.length === 1 ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-2 gap-2'
  const batchPct =
    s && s.total > 0
      ? Math.round(((s.completed + s.failed) / s.total) * 100)
      : 0
  const queueProgressLabel = s
    ? `${s.completed + s.failed} of ${s.total} receipt${s.total === 1 ? '' : 's'} finished`
    : ''

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
  const duplicateWarning =
    draft?.duplicateWarning && typeof draft.duplicateWarning === 'object'
      ? draft.duplicateWarning
      : null
  const duplicateMatch = duplicateWarning?.matchedReceipt || null
  const duplicateUploadedAt = duplicateMatch?.createdAt
    ? new Date(duplicateMatch.createdAt).toLocaleString()
    : ''

  function queueJobRow(j) {
    const label = j.fileName || j.id
    const isFailed = j.state === 'failed'
    const stateLabel =
      j.state === 'waiting-children'
        ? 'Waiting'
        : j.state === 'active' || j.state === 'prioritized'
          ? 'Processing'
          : j.state === 'completed' || j.state === 'missing'
            ? 'Completed'
            : j.state === 'failed'
              ? 'Failed'
              : j.state
    const statusClass = isFailed
      ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300'
      : j.state === 'completed' || j.state === 'missing'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
        : j.state === 'active' || j.state === 'prioritized'
          ? 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-300'
          : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300'
    return (
      <li
        key={j.id}
        className="rounded-xl border border-zinc-200 bg-white p-3 text-xs shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-zinc-900 dark:text-zinc-50">
              {label}
            </span>
            <span className="mt-0.5 block text-[11px] text-zinc-500 dark:text-zinc-400">
              Receipt upload job
            </span>
          </div>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusClass}`}
          >
            {stateLabel}
          </span>
        </div>
        {j.failedReason ? (
          <p className="mt-2 mb-0 line-clamp-3 rounded-lg bg-red-50 px-2 py-1 text-[11px] leading-snug text-red-700 dark:bg-red-950/30 dark:text-red-300">
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
              {duplicateWarning ? (
                <div
                  className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100"
                  role="status"
                >
                  <p className="font-semibold">Possible duplicate receipt detected</p>
                  <p className="mt-1">
                    {Math.round(Number(duplicateWarning.confidenceScore) || 0)}%
                    match
                    {duplicateMatch?.vendor ? ` with ${duplicateMatch.vendor}` : ''}
                    {duplicateMatch?.total != null ? ` · ${duplicateMatch.total}` : ''}
                    {duplicateMatch?.currency ? ` ${duplicateMatch.currency}` : ''}
                    {duplicateUploadedAt ? ` · uploaded ${duplicateUploadedAt}` : ''}.
                  </p>
                  {duplicateWarning.duplicateReason ? (
                    <p className="mt-1 text-xs opacity-85">
                      {duplicateWarning.duplicateReason}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={btnPrimary}
                      onClick={() => setConfirmReviewAck(true)}
                    >
                      Continue Anyway
                    </button>
                    <button
                      type="button"
                      className={btnBase}
                      onClick={() =>
                        typeof onViewDuplicateReceipt === 'function'
                          ? onViewDuplicateReceipt(duplicateMatch)
                          : undefined
                      }
                    >
                      View Existing Receipt
                    </button>
                  </div>
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
                  <Select
                    value={draft.category || 'Other'}
                    onChange={(nextValue) => updateField('category', nextValue)}
                    options={receiptCategories}
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
              Preview while you edit. Reject / new upload clears the preview.
            </p>
            {queueUrls.length > 0 ? (
              <>
                <div className={receiptPreviewGridClass}>
                  {receiptPreviewSlots.map((slot) => {
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
              className={`${cardCls} overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50 via-white to-violet-50 p-0 text-left text-zinc-950 dark:border-amber-800/50 dark:from-amber-950/25 dark:via-zinc-900 dark:to-violet-950/20 dark:text-zinc-50`}
              role="status"
            >
              <div className="border-b border-amber-200/60 bg-white/70 p-4 dark:border-amber-900/40 dark:bg-zinc-950/35">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                      Receipt upload queue
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-zinc-950 dark:text-zinc-50">
                      Processing one receipt at a time
                    </h3>
                    <p className="mt-1 mb-0 text-sm leading-5 text-zinc-600 dark:text-zinc-300">
                      Keep this card visible to follow every file from queued to completed.
                    </p>
                  </div>
                  {typeof receiptBatchProgress.onDismissQueue === 'function' ? (
                    <button
                      type="button"
                      className="shrink-0 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900 shadow-sm transition hover:bg-amber-50 dark:border-amber-700 dark:bg-zinc-900 dark:text-amber-100 dark:hover:bg-zinc-800"
                      onClick={() => receiptBatchProgress.onDismissQueue()}
                    >
                      Dismiss
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="p-4">
                {queueSending ? (
                  <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm dark:border-amber-900/50 dark:bg-zinc-900">
                    <p className="m-0 flex items-center gap-3 text-sm font-semibold text-amber-900 dark:text-amber-100">
                      <InlineSpinner className="h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
                      Sending files to the server queue...
                    </p>
                    <p className="mt-2 mb-0 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                      Progress numbers appear as soon as the server registers the jobs.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="m-0 text-4xl font-black tabular-nums text-zinc-950 dark:text-zinc-50">
                          {batchPct}%
                        </p>
                        <p className="mt-1 mb-0 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                          {queueProgressLabel}
                        </p>
                      </div>
                      {receiptBatchProgress.idle ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          Queue idle
                        </span>
                      ) : (
                        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                          Live
                        </span>
                      )}
                    </div>

                    <div
                      className="mt-4 h-4 overflow-hidden rounded-full bg-zinc-200 shadow-inner dark:bg-zinc-800"
                      aria-label={`Upload queue ${batchPct}% complete`}
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={batchPct}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 shadow-sm transition-[width] duration-500"
                        style={{ width: `${batchPct}%` }}
                      />
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {[
                        ['Total', s.total, 'text-zinc-900 dark:text-zinc-50'],
                        ['Done', s.completed, 'text-emerald-700 dark:text-emerald-300'],
                        ['Running', s.processing, 'text-violet-700 dark:text-violet-300'],
                        ['Waiting', s.waiting, 'text-amber-700 dark:text-amber-300'],
                        ['Failed', s.failed, 'text-red-700 dark:text-red-300'],
                      ].map(([label, value, valueClass]) => (
                        <div
                          key={label}
                          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                        >
                          <dt className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                            {label}
                          </dt>
                          <dd className={`m-0 mt-1 text-xl font-black tabular-nums ${valueClass}`}>
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </>
                )}

                {!queueSending ? (
                  <div className="mt-4 space-y-4">
                    {[
                      ['failed', 'Needs attention', failed],
                      ['processing', 'Processing now', processing],
                      ['waiting', 'Waiting in line', waiting],
                      ['completed', 'Completed receipts', completed],
                    ].map(([id, title, items]) =>
                      items.length === 0 ? null : (
                        <div key={id}>
                          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                            {title}
                          </p>
                          <ul className="m-0 list-none space-y-2 p-0">{items.map(queueJobRow)}</ul>
                        </div>
                      ),
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
