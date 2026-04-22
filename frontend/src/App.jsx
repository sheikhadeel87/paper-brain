import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const labelCls =
  'flex flex-col gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200'
const inputCls =
  'rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 disabled:opacity-60'
const cardCls =
  'rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'
const btnBase =
  'inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'
const btnPrimary =
  'inline-flex items-center justify-center rounded-lg border border-transparent bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60'

const dashRowIconBtn =
  'inline-flex rounded-lg p-2 text-zinc-500 transition hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-violet-950/50 dark:hover:text-violet-300'
const dashRowIconBtnDanger =
  'inline-flex rounded-lg p-2 text-zinc-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-red-950/40 dark:hover:text-red-400'

const DASH_PAGE = 50

const emptyRow = () => ({ name: '', price: '' })

function formatDashAmount(value, currency) {
  if (value === null || value === undefined || value === '') return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  const cur = (currency && String(currency).trim()) || ''
  const num = n.toFixed(2)
  return cur ? `${num} ${cur}` : num
}

function cloneJsonSafe(value) {
  try {
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value))
  }
}

function EyeViewIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}

const DONUT_COLORS = [
  '#7c3aed',
  '#10b981',
  '#0ea5e9',
  '#f59e0b',
  '#ec4899',
  '#64748b',
]

function formatKpiMoney(amount, currency) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '—'
  const cur = String(currency || 'USD').trim().toUpperCase()
  if (cur.length === 3) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: cur,
      }).format(amount)
    } catch {
      /* fall through */
    }
  }
  return `${amount.toFixed(2)} ${cur}`
}

function FlagBadge({ flag }) {
  const f = String(flag || '').toLowerCase()
  const isAuto = f === 'auto'
  return (
    <span
      className={
        isAuto
          ? 'inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
          : 'inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-900 dark:bg-amber-900/40 dark:text-amber-100'
      }
    >
      {isAuto ? 'Auto' : 'Review'}
    </span>
  )
}

function VendorAvatar({ name }) {
  const letter = String(name || '?').trim().charAt(0).toUpperCase() || '?'
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-800 dark:bg-violet-950/80 dark:text-violet-200"
      aria-hidden
    >
      {letter}
    </span>
  )
}

function ConfidenceMeter({ value }) {
  const n =
    typeof value === 'number' && !Number.isNaN(value)
      ? value
      : Number(value)
  const pct = !Number.isNaN(n) ? Math.min(100, Math.max(0, n)) : 0
  const label = !Number.isNaN(n) ? Math.round(n) : '—'
  return (
    <div className="min-w-[5.5rem]">
      <div className="mb-1 flex items-center justify-between gap-2 text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
        <span>{label}</span>
        <span className="text-zinc-400">/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width] duration-300 dark:bg-emerald-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function CurrencyDonut({ slices }) {
  const total = slices.reduce((a, s) => a + s.value, 0)
  if (total <= 0) {
    return (
      <div className="flex min-h-[11rem] items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        No totals for this filter.
      </div>
    )
  }
  const stops = slices
    .reduce(
      (acc, s) => {
        const pct = (s.value / total) * 100
        const start = acc.run
        const next = acc.run + pct
        return {
          run: next,
          segments: acc.segments.concat(`${s.color} ${start}% ${next}%`),
        }
      },
      { run: 0, segments: [] },
    )
    .segments.join(', ')
  return (
    <div
      className="relative mx-auto h-40 w-40 shrink-0 rounded-full shadow-sm ring-1 ring-zinc-200/80 dark:ring-zinc-700"
      style={{
        background: `conic-gradient(from -90deg, ${stops})`,
      }}
    >
      <div className="absolute inset-[24%] rounded-full bg-white shadow-inner dark:bg-zinc-900" />
    </div>
  )
}

function PaperBrainMark({ className = '' }) {
  return (
    <svg
      className={className}
      width="36"
      height="36"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M20 2L35 11v18L20 38 5 29V11L20 2z"
        className="fill-violet-600"
      />
      <path
        d="M20 9l9 5.5v11L20 31l-9-5.5v-11L20 9z"
        className="fill-white opacity-95"
      />
      <path
        d="M20 14c-2.5 0-4 1.6-4 3.5 0 1.5 1 2.7 2.5 3.1V24h3v-3.4c1.5-.4 2.5-1.6 2.5-3.1C24 15.6 22.5 14 20 14z"
        className="fill-violet-500"
      />
    </svg>
  )
}

function aiDataToDraft(aiData, options = {}) {
  const parseFailed = options.parseFailed === true
  if (parseFailed || !aiData || typeof aiData !== 'object') {
    return {
      vendor: '',
      date: '',
      total: '',
      currency: 'USD',
      tax: '',
      items: [emptyRow()],
      confidence: '',
      aiConfidence: null,
      confidence_flag: 'review',
    }
  }
  const date =
    aiData.date === '1970-01-01' || !aiData.date
      ? ''
      : String(aiData.date).trim()
  const items =
    Array.isArray(aiData.items) && aiData.items.length > 0
      ? aiData.items.map((i) => ({
          name: typeof i?.name === 'string' ? i.name : '',
          price:
            i?.price === null || i?.price === undefined || i?.price === ''
              ? ''
              : String(i.price),
        }))
      : [emptyRow()]
  const aiC =
    typeof aiData.confidence === 'number' && !Number.isNaN(aiData.confidence)
      ? aiData.confidence
      : null
  return {
    vendor: typeof aiData.vendor === 'string' ? aiData.vendor : '',
    date,
    total:
      aiData.total === null ||
      aiData.total === undefined ||
      Number.isNaN(Number(aiData.total))
        ? ''
        : String(aiData.total),
    currency: typeof aiData.currency === 'string' ? aiData.currency : 'USD',
    tax:
      aiData.tax === null || aiData.tax === undefined || aiData.tax === ''
        ? ''
        : String(aiData.tax),
    items,
    confidence: aiC !== null ? aiC : '',
    aiConfidence: aiC,
    confidence_flag: aiData.confidence_flag === 'auto' ? 'auto' : 'review',
  }
}

/** Mirrors server gate for when the user must tick review confirmation. */
function needsReviewAcknowledge(draft, parseOk, needsReview) {
  if (!parseOk || needsReview) return true
  if (!draft) return false
  if (draft.confidence_flag === 'review') return true
  const n = Number(draft.confidence)
  if (!Number.isNaN(n) && n < 80) return true
  return false
}

function draftToFinalData(draft, opts = {}) {
  const totalNum = draft.total.trim() === '' ? NaN : Number(draft.total)
  const taxRaw = draft.tax.trim()
  const taxNum = taxRaw === '' ? null : Number(taxRaw)
  let confidence =
    draft.confidence === '' ||
    draft.confidence === undefined ||
    draft.confidence === null
      ? 0
      : Number(draft.confidence)
  if (Number.isNaN(confidence)) confidence = 0
  if (opts.confirmReview === true && opts.originalAiParseFailed === true) {
    confidence = Math.max(confidence, 70)
  }
  return {
    vendor: draft.vendor.trim(),
    date: draft.date.trim(),
    total: Number.isNaN(totalNum) ? 0 : totalNum,
    currency: (draft.currency || 'USD').trim() || 'USD',
    tax:
      taxRaw === '' || (taxNum !== null && Number.isNaN(taxNum)) ? null : taxNum,
    items: draft.items
      .filter((row) => row.name.trim() !== '' || row.price.trim() !== '')
      .map((row) => {
        const p = row.price.trim()
        return {
          name: row.name.trim(),
          price: p === '' ? null : Number(p),
        }
      }),
    confidence,
    confidence_flag: draft.confidence_flag === 'auto' ? 'auto' : 'review',
  }
}

function App() {
  const [mainTab, setMainTab] = useState('dashboard')
  const [phase, setPhase] = useState('upload')
  const [rawText, setRawText] = useState('')
  const [parseOk, setParseOk] = useState(true)
  const [parseError, setParseError] = useState('')
  const [needsReview, setNeedsReview] = useState(false)
  const [originalAiSnapshot, setOriginalAiSnapshot] = useState(null)
  const [draft, setDraft] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [lastSavedId, setLastSavedId] = useState('')
  const [userEdited, setUserEdited] = useState(false)
  const [recent, setRecent] = useState([])
  const [inputKey, setInputKey] = useState(0)
  const [confirmReviewAck, setConfirmReviewAck] = useState(false)
  const [forceReviewAck, setForceReviewAck] = useState(false)
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState(null)
  /** Holds the active blob: URL so we revoke exactly once (avoids Strict Mode breaking preview). */
  const receiptBlobRef = useRef(null)
  /** Last file sent to `/api/receipt/upload` — used for “Retry scan”. */
  const lastReceiptFileRef = useRef(null)
  const receiptUploadInputRef = useRef(null)
  const [scanRetryable, setScanRetryable] = useState(false)

  const [dashFrom, setDashFrom] = useState('')
  const [dashTo, setDashTo] = useState('')
  const [dashVendor, setDashVendor] = useState('')
  const [dashRows, setDashRows] = useState([])
  const [dashTotalCount, setDashTotalCount] = useState(0)
  const [dashSummary, setDashSummary] = useState(null)
  const [dashLoading, setDashLoading] = useState(false)
  const [dashError, setDashError] = useState('')
  /** Full expense doc from dashboard list — opens detail modal. */
  const [dashDetailExpense, setDashDetailExpense] = useState(null)
  /** Non-null while editing the open expense in the modal. */
  const [dashEditSession, setDashEditSession] = useState(null)
  const [dashEditSaving, setDashEditSaving] = useState(false)
  const [dashEditSaveError, setDashEditSaveError] = useState('')
  const [dashDeleteBusy, setDashDeleteBusy] = useState(false)

  const loadRecent = useCallback(async () => {
    try {
      const r = await fetch('/api/expenses?limit=10&skip=0')
      const data = await r.json()
      if (data.success && Array.isArray(data.expenses)) {
        setRecent(data.expenses)
      }
    } catch {
      // optional in dev
    }
  }, [])

  useEffect(() => {
    loadRecent()
  }, [loadRecent])

  const clearReceiptPreview = useCallback(() => {
    if (receiptBlobRef.current) {
      URL.revokeObjectURL(receiptBlobRef.current)
      receiptBlobRef.current = null
    }
    setReceiptPreviewUrl(null)
  }, [])

  const setReceiptPreviewFromFile = useCallback((file) => {
    if (receiptBlobRef.current) {
      URL.revokeObjectURL(receiptBlobRef.current)
      receiptBlobRef.current = null
    }
    const url = URL.createObjectURL(file)
    receiptBlobRef.current = url
    setReceiptPreviewUrl(url)
  }, [])

  useEffect(() => {
    return () => {
      if (receiptBlobRef.current) {
        URL.revokeObjectURL(receiptBlobRef.current)
        receiptBlobRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (mainTab !== 'receipt') {
      clearReceiptPreview()
    }
  }, [mainTab, clearReceiptPreview])

  /** Optional `override` uses those strings instead of state (fixes stale fetch after clear). */
  function expenseFilterParams(override) {
    const from =
      override && typeof override.from === 'string' ? override.from : dashFrom
    const to = override && typeof override.to === 'string' ? override.to : dashTo
    const vendor =
      override && typeof override.vendor === 'string'
        ? override.vendor
        : dashVendor
    const p = new URLSearchParams()
    if (from.trim()) p.set('from', from.trim())
    if (to.trim()) p.set('to', to.trim())
    if (vendor.trim()) p.set('vendor', vendor.trim())
    return p
  }

  function expenseQueryString(skip, limit, filterOverride) {
    const p = expenseFilterParams(filterOverride)
    p.set('limit', String(limit))
    p.set('skip', String(skip))
    return p.toString()
  }

  function dashboardExportHref() {
    const q = expenseFilterParams(undefined).toString()
    return q ? `/api/expenses/export?${q}` : '/api/expenses/export'
  }

  async function runDashboardFetch(skip, { append, filterOverride } = {}) {
    setDashLoading(true)
    setDashError('')
    try {
      const r = await fetch(
        `/api/expenses?${expenseQueryString(skip, DASH_PAGE, filterOverride)}`,
      )
      const data = await r.json()
      if (!data.success) {
        setDashError(data.error || 'Failed to load')
        return
      }
      setDashTotalCount(typeof data.totalCount === 'number' ? data.totalCount : 0)
      setDashSummary(data.summary ?? null)
      const list = Array.isArray(data.expenses) ? data.expenses : []
      setDashRows((prev) => (append ? [...prev, ...list] : list))
    } catch (e) {
      setDashError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setDashLoading(false)
    }
  }

  useEffect(() => {
    if (mainTab !== 'dashboard') return
    void runDashboardFetch(0, { append: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load on tab switch only
  }, [mainTab])

  function handleApplyDashboard() {
    void runDashboardFetch(0, { append: false })
  }

  function handleClearDashboardFilters() {
    setDashFrom('')
    setDashTo('')
    setDashVendor('')
    void runDashboardFetch(0, {
      append: false,
      filterOverride: { from: '', to: '', vendor: '' },
    })
  }

  function handleLoadMoreDashboard() {
    void runDashboardFetch(dashRows.length, { append: true })
  }

  const closeDashDetail = useCallback(() => {
    setDashDetailExpense(null)
    setDashEditSession(null)
    setDashEditSaveError('')
    setDashEditSaving(false)
    setDashDeleteBusy(false)
  }, [])

  useEffect(() => {
    if (!dashDetailExpense) return
    function onKey(e) {
      if (e.key !== 'Escape') return
      if (dashEditSession) {
        setDashEditSession(null)
        setDashEditSaveError('')
      } else {
        closeDashDetail()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dashDetailExpense, dashEditSession, closeDashDetail])

  /** Pass `expense` from a table row; omit to use the open modal expense. */
  function startDashEdit(expense) {
    const ex =
      expense && typeof expense === 'object' && expense._id != null
        ? expense
        : dashDetailExpense
    if (!ex) return
    const fd = ex.finalData || {}
    setDashEditSaveError('')
    setDashEditSession({
      draft: aiDataToDraft(fd),
      rawText: typeof ex.rawText === 'string' ? ex.rawText : '',
      originalAiData:
        ex.originalAiData !== null &&
        ex.originalAiData !== undefined &&
        typeof ex.originalAiData === 'object' &&
        !Array.isArray(ex.originalAiData)
          ? cloneJsonSafe(ex.originalAiData)
          : {},
      confirmReviewAck: false,
      forceReviewAck: false,
    })
  }

  function dashEditUpdateField(field, value) {
    setDashEditSession((s) => (s ? { ...s, draft: { ...s.draft, [field]: value } } : s))
  }

  function dashEditUpdateItem(index, field, value) {
    setDashEditSession((s) => {
      if (!s) return s
      const items = s.draft.items.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      )
      return { ...s, draft: { ...s.draft, items } }
    })
  }

  function dashEditAddItemRow() {
    setDashEditSession((s) =>
      s ? { ...s, draft: { ...s.draft, items: [...s.draft.items, emptyRow()] } } : s,
    )
  }

  function dashEditRemoveItemRow(index) {
    setDashEditSession((s) => {
      if (!s || s.draft.items.length <= 1) return s
      return {
        ...s,
        draft: {
          ...s.draft,
          items: s.draft.items.filter((_, i) => i !== index),
        },
      }
    })
  }

  async function saveDashEdit() {
    const sess = dashEditSession
    const ex = dashDetailExpense
    if (!sess || !ex) return
    const ackRequired =
      needsReviewAcknowledge(sess.draft, true, false) || sess.forceReviewAck
    if (ackRequired && !sess.confirmReviewAck) {
      setDashEditSaveError(
        'Check the box below to confirm you reviewed this expense.',
      )
      return
    }
    setDashEditSaving(true)
    setDashEditSaveError('')
    try {
      const finalData = draftToFinalData(sess.draft, {
        confirmReview: sess.confirmReviewAck,
        originalAiParseFailed: Boolean(sess.originalAiData?.aiParseFailed),
      })
      const body = {
        rawText: sess.rawText,
        originalAiData: sess.originalAiData,
        finalData,
        isCorrected: true,
        status: 'approved',
        confirmReview: Boolean(sess.confirmReviewAck),
      }
      const res = await fetch(`/api/expenses/${String(ex._id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        if (data.code === 'REVIEW_CONFIRMATION_REQUIRED') {
          setDashEditSession((s) => (s ? { ...s, forceReviewAck: true } : null))
        }
        setDashEditSaveError(
          data.error ||
            (typeof data.message === 'string' ? data.message : 'Update failed'),
        )
        return
      }
      const updated = data.expense
      setDashDetailExpense(updated)
      setDashEditSession(null)
      setDashRows((prev) =>
        prev.map((row) =>
          String(row._id) === String(updated._id) ? updated : row,
        ),
      )
      await loadRecent()
    } catch (err) {
      setDashEditSaveError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setDashEditSaving(false)
    }
  }

  /** Pass `expense` from a table row; omit to delete the open modal expense. */
  async function deleteDashExpense(expense) {
    const ex =
      expense && typeof expense === 'object' && expense._id != null
        ? expense
        : dashDetailExpense
    if (!ex) return
    const label = (ex.finalData && ex.finalData.vendor) || 'this expense'
    if (!window.confirm(`Delete “${label}”? This cannot be undone.`)) return
    const id = String(ex._id)
    const modalOpenForThis =
      dashDetailExpense !== null && String(dashDetailExpense._id) === id
    setDashDeleteBusy(true)
    setDashEditSaveError('')
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        setDashEditSaveError(data.error || 'Delete failed')
        return
      }
      if (modalOpenForThis) closeDashDetail()
      await loadRecent()
      await runDashboardFetch(0, { append: false })
    } catch (err) {
      setDashEditSaveError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDashDeleteBusy(false)
    }
  }

  async function runReceiptUpload(file, { keepPreview = false } = {}) {
    if (!file) return
    if (!keepPreview) {
      setReceiptPreviewFromFile(file)
    }
    lastReceiptFileRef.current = file
    setUploading(true)
    setSaveError('')
    setParseError('')
    setScanRetryable(false)
    try {
      const fd = new FormData()
      fd.append('receipt', file)
      const res = await fetch('/api/receipt/upload', {
        method: 'POST',
        body: fd,
      })
      let data = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }

      if (!res.ok) {
        setRawText(typeof data.rawText === 'string' ? data.rawText : '')
        setParseOk(false)
        setParseError(
          typeof data.error === 'string' ? data.error : res.statusText || 'Upload failed',
        )
        setScanRetryable(Boolean(data.retryable))
        setNeedsReview(true)
        setOriginalAiSnapshot({
          aiParseFailed: true,
          error: typeof data.error === 'string' ? data.error : 'request',
          rawText: typeof data.rawText === 'string' ? data.rawText : '',
        })
        setDraft(aiDataToDraft(null, { parseFailed: true }))
        setUserEdited(false)
        setConfirmReviewAck(false)
        setForceReviewAck(false)
        setPhase('review')
        return
      }

      const success = Boolean(data.success)
      setRawText(typeof data.rawText === 'string' ? data.rawText : '')
      setParseOk(success)
      setParseError(typeof data.error === 'string' ? data.error : '')
      setScanRetryable(!success && data.retryable !== false)
      setNeedsReview(Boolean(data.needsReview) || !success)
      const ai = success ? data.aiData : null
      const snap = ai
        ? (() => {
            const o = JSON.parse(JSON.stringify(ai))
            if (data.ocrFailed === true) o.ocrFailed = true
            return o
          })()
        : {
            aiParseFailed: true,
            error: typeof data.error === 'string' ? data.error : 'AI unavailable',
            code: typeof data.code === 'string' ? data.code : undefined,
            rawText: typeof data.rawText === 'string' ? data.rawText : '',
          }
      setOriginalAiSnapshot(snap)
      setDraft(
        success ? aiDataToDraft(ai) : aiDataToDraft(null, { parseFailed: true }),
      )
      setUserEdited(false)
      setConfirmReviewAck(false)
      setForceReviewAck(false)
      setPhase('review')
    } catch (err) {
      setRawText('')
      setParseOk(false)
      setParseError(err instanceof Error ? err.message : 'Upload failed')
      setScanRetryable(true)
      setOriginalAiSnapshot({
        aiParseFailed: true,
        error: 'network',
        rawText: '',
      })
      setDraft(aiDataToDraft(null, { parseFailed: true }))
      setUserEdited(false)
      setConfirmReviewAck(false)
      setForceReviewAck(false)
      setNeedsReview(true)
      setPhase('review')
    } finally {
      setUploading(false)
    }
  }

  async function onUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    await runReceiptUpload(file)
    e.target.value = ''
  }

  function retryReceiptScan() {
    const file = lastReceiptFileRef.current
    if (file) {
      void runReceiptUpload(file, { keepPreview: true })
    }
  }

  function updateField(field, value) {
    setUserEdited(true)
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  function updateItem(index, key, value) {
    setUserEdited(true)
    setDraft((prev) => {
      if (!prev) return prev
      const items = prev.items.map((row, i) =>
        i === index ? { ...row, [key]: value } : row,
      )
      return { ...prev, items }
    })
  }

  function addItemRow() {
    setUserEdited(true)
    setDraft((prev) =>
      prev ? { ...prev, items: [...prev.items, emptyRow()] } : prev,
    )
  }

  function removeItemRow(index) {
    setUserEdited(true)
    setDraft((prev) => {
      if (!prev || prev.items.length <= 1) return prev
      return {
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }
    })
  }

  async function onConfirmSave() {
    if (!draft) return
    const ackRequired =
      needsReviewAcknowledge(draft, parseOk, needsReview) || forceReviewAck
    if (ackRequired && !confirmReviewAck) {
      setSaveError('Check the box below to confirm you reviewed this expense.')
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      const finalData = draftToFinalData(draft, {
        confirmReview: confirmReviewAck,
        originalAiParseFailed: Boolean(originalAiSnapshot?.aiParseFailed),
      })
      const body = {
        rawText,
        originalAiData: originalAiSnapshot || {},
        finalData,
        isCorrected: userEdited || !parseOk,
        status: 'approved',
        confirmReview: Boolean(confirmReviewAck),
      }
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        if (data.code === 'REVIEW_CONFIRMATION_REQUIRED') {
          setForceReviewAck(true)
        }
        const msg =
          data.error ||
          (typeof data.message === 'string' ? data.message : 'Save failed')
        setSaveError(msg)
        return
      }
      setLastSavedId(String(data.id))
      setConfirmReviewAck(false)
      setForceReviewAck(false)
      setPhase('saved')
      await loadRecent()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  function onReject() {
    setPhase('upload')
    setDraft(null)
    lastReceiptFileRef.current = null
    setScanRetryable(false)
    clearReceiptPreview()
    setRawText('')
    setParseOk(true)
    setParseError('')
    setOriginalAiSnapshot(null)
    setSaveError('')
    setLastSavedId('')
    setUserEdited(false)
    setConfirmReviewAck(false)
    setForceReviewAck(false)
    setInputKey((k) => k + 1)
  }

  const dashHasMore = dashRows.length < dashTotalCount

  const dashKpis = useMemo(() => {
    const bc = dashSummary?.byCurrency || {}
    const entries = Object.entries(bc)
      .map(([cur, v]) => {
        const total =
          typeof v.total === 'number' ? v.total : Number(v.total)
        const count =
          typeof v.count === 'number' ? v.count : Number(v.count) || 0
        return {
          cur,
          total: Number.isNaN(total) ? 0 : total,
          count: Number.isNaN(count) ? 0 : count,
        }
      })
      .filter((e) => e.cur)
    const expenseCount =
      typeof dashSummary?.expenseCount === 'number'
        ? dashSummary.expenseCount
        : 0
    const sumTotals = entries.reduce((a, e) => a + e.total, 0)
    const dominant =
      entries.length === 0
        ? null
        : [...entries].sort((a, b) => b.total - a.total)[0]
    const topSharePct =
      dominant && sumTotals > 0 ? (dominant.total / sumTotals) * 100 : 0
    const confVals = dashRows
      .map((ex) => {
        const fd = ex.finalData || {}
        const c = ex.confidence ?? fd.confidence
        return typeof c === 'number' && !Number.isNaN(c) ? c : Number(c)
      })
      .filter((c) => !Number.isNaN(c))
    const avgConf =
      confVals.length > 0
        ? confVals.reduce((a, c) => a + c, 0) / confVals.length
        : null
    let reviewInList = 0
    for (const ex of dashRows) {
      const fd = ex.finalData || {}
      const f = String(
        ex.confidenceFlag ?? fd.confidence_flag ?? 'review',
      ).toLowerCase()
      if (f !== 'auto') reviewInList += 1
    }
    const donutSlices = [...entries]
      .filter((e) => e.total > 0)
      .sort((a, b) => b.total - a.total)
      .map((e, i) => ({
        label: e.cur,
        value: e.total,
        color: DONUT_COLORS[i % DONUT_COLORS.length],
      }))
    return {
      entries,
      expenseCount,
      dominant,
      topSharePct,
      avgConf,
      reviewInList,
      autoInList: dashRows.length - reviewInList,
      donutSlices,
      sumTotals,
    }
  }, [dashSummary, dashRows])

  const sidebarNavBtn = (active) =>
    active
      ? 'w-full rounded-lg bg-violet-100 px-3 py-2 text-left text-sm font-medium text-violet-900 dark:bg-violet-950/60 dark:text-violet-100'
      : 'w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/80'

  return (
    <div className="flex min-h-svh w-full flex-1 bg-zinc-100 dark:bg-zinc-950">
      <aside className="sticky top-0 flex h-svh w-60 shrink-0 flex-col border-r border-zinc-200 bg-white px-3 py-6 dark:border-zinc-800 dark:bg-zinc-900 lg:w-64">
        <div className="mb-8 flex items-center gap-2 px-2">
          <PaperBrainMark className="shrink-0" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Paper Brain
            </div>
            <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              Expenses
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 text-left" aria-label="Main">
          <button
            type="button"
            className={sidebarNavBtn(mainTab === 'receipt')}
            onClick={() => setMainTab('receipt')}
          >
            Add expense
          </button>
          <button
            type="button"
            className={sidebarNavBtn(mainTab === 'dashboard')}
            onClick={() => setMainTab('dashboard')}
          >
            Dashboard
          </button>

          <p className="mb-1 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Manage
          </p>
          <button
            type="button"
            className={sidebarNavBtn(mainTab === 'dashboard')}
            onClick={() => setMainTab('dashboard')}
          >
            Expenses
          </button>
          <button
            type="button"
            className={sidebarNavBtn(mainTab === 'receipt')}
            onClick={() => setMainTab('receipt')}
          >
            Receipts
          </button>
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-400 dark:text-zinc-600"
          >
            Categories
            <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Soon
            </span>
          </button>
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-400 dark:text-zinc-600"
          >
            Vendors
            <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Soon
            </span>
          </button>
          <a
            href={dashboardExportHref()}
            download
            className={`${sidebarNavBtn(false)} no-underline`}
          >
            Export
          </a>

          <p className="mb-1 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Insights
          </p>
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-400 dark:text-zinc-600"
          >
            Reports
            <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Soon
            </span>
          </button>
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-400 dark:text-zinc-600"
          >
            Analytics
            <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Soon
            </span>
          </button>

          <p className="mb-1 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Settings
          </p>
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-400 dark:text-zinc-600"
          >
            Settings
            <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Soon
            </span>
          </button>
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-400 dark:text-zinc-600"
          >
            Billing
            <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Soon
            </span>
          </button>
        </nav>

        <div className="mt-auto space-y-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div className="flex items-center gap-2 px-1 pb-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
              JD
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                John Doe
              </div>
              <div className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                you@example.com
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-svh min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-16 sm:px-6 lg:px-8">
      {mainTab === 'dashboard' && (
        <div className="space-y-6 text-left">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Overview of your expenses and AI insights.
              </p>
            </div>
            <button
              type="button"
              className={btnPrimary}
              onClick={() => setMainTab('receipt')}
            >
              + Add expense
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className={`${cardCls} flex flex-col gap-2 p-5`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Total expenses
                </p>
                <span className="rounded-lg bg-violet-100 p-1.5 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </span>
              </div>
              <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                {dashKpis.dominant
                  ? formatKpiMoney(
                      dashKpis.dominant.total,
                      dashKpis.dominant.cur,
                    )
                  : '—'}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400/90">
                {dashKpis.entries.length > 1
                  ? `${dashKpis.entries.length} currencies · largest share shown`
                  : 'Matching your filters'}
              </p>
            </div>
            <div className={`${cardCls} flex flex-col gap-2 p-5`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Total receipts
                </p>
                <span className="rounded-lg bg-sky-100 p-1.5 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                  </svg>
                </span>
              </div>
              <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                {dashKpis.expenseCount}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Expenses matching filters
              </p>
            </div>
            <div className={`${cardCls} flex flex-col gap-2 p-5`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Top currency
                </p>
                <span className="rounded-lg bg-emerald-100 p-1.5 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v12M8 10h8M8 14h8" />
                  </svg>
                </span>
              </div>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {dashKpis.dominant?.cur ?? '—'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {dashKpis.dominant && dashKpis.sumTotals > 0
                  ? `${Math.round(dashKpis.topSharePct)}% of recorded totals`
                  : '—'}
              </p>
            </div>
            <div className={`${cardCls} flex flex-col gap-2 p-5`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Avg. confidence
                </p>
                <span className="rounded-lg bg-amber-100 p-1.5 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </span>
              </div>
              <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                {dashKpis.avgConf !== null
                  ? `${Math.round(dashKpis.avgConf)}/100`
                  : '—'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {dashRows.length > 0 && dashRows.length < dashTotalCount
                  ? `From ${dashRows.length} loaded rows`
                  : 'AI extraction accuracy'}
              </p>
            </div>
          </div>

          

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className={`${cardCls} p-6`}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Spending overview
                </h2>
                <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  By currency
                </span>
              </div>
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
                <CurrencyDonut slices={dashKpis.donutSlices} />
                <ul className="m-0 w-full max-w-xs list-none space-y-2.5 p-0 text-sm">
                  {dashKpis.donutSlices.length === 0 ? (
                    <li className="text-zinc-500 dark:text-zinc-400">
                      Apply filters with matching expenses to see the chart.
                    </li>
                  ) : (
                    dashKpis.donutSlices.map((s) => {
                      const pct =
                        dashKpis.sumTotals > 0
                          ? Math.round((s.value / dashKpis.sumTotals) * 100)
                          : 0
                      return (
                        <li
                          key={s.label}
                          className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2 last:border-0 dark:border-zinc-800"
                        >
                          <span className="flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-200">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: s.color }}
                              aria-hidden
                            />
                            {s.label}
                          </span>
                          <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
                            {formatKpiMoney(s.value, s.label)} · {pct}%
                          </span>
                        </li>
                      )
                    })
                  )}
                </ul>
              </div>
            </section>
            <section className={`${cardCls} space-y-4 p-6`}>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                AI insights
              </h2>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/25">
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                  High confidence extractions
                </p>
                <p className="mt-1 text-sm text-emerald-900/90 dark:text-emerald-100/90">
                  {dashRows.length > 0
                    ? `${dashKpis.autoInList} of ${dashRows.length} loaded expense${dashRows.length === 1 ? '' : 's'} ${dashKpis.autoInList === 1 ? 'is' : 'are'} auto-flagged in this list.`
                    : 'Load expenses to see approval stats for the current page.'}
                  {dashTotalCount > 0 && (
                    <span className="mt-1 block text-xs text-emerald-800/80 dark:text-emerald-200/80">
                      {dashTotalCount} expense{dashTotalCount === 1 ? '' : 's'}{' '}
                      match your filters in total.
                    </span>
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 dark:border-amber-900/50 dark:bg-amber-950/25">
                <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
                  Needs review
                </p>
                <p className="mt-1 text-sm text-amber-950/90 dark:text-amber-100/90">
                  {dashRows.length > 0
                    ? `${dashKpis.reviewInList} receipt${dashKpis.reviewInList === 1 ? '' : 's'} in this list ${dashKpis.reviewInList === 1 ? 'needs' : 'need'} your review for better accuracy.`
                    : 'No rows loaded — adjust filters or fetch expenses.'}
                </p>
              </div>
            </section>
          </div>

          <section className={cardCls}>
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Filters
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className={labelCls}>
                From (created)
                <input
                  className={inputCls}
                  type="date"
                  value={dashFrom}
                  onChange={(e) => setDashFrom(e.target.value)}
                />
              </label>
              <label className={labelCls}>
                To (created)
                <input
                  className={inputCls}
                  type="date"
                  value={dashTo}
                  onChange={(e) => setDashTo(e.target.value)}
                />
              </label>
              <label className={`${labelCls} sm:col-span-2`}>
                Vendor contains
                <input
                  className={inputCls}
                  value={dashVendor}
                  onChange={(e) => setDashVendor(e.target.value)}
                  placeholder="e.g. Mart"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className={btnPrimary}
                disabled={dashLoading}
                onClick={handleApplyDashboard}
              >
                Apply filters
              </button>
              <button
                type="button"
                className={btnBase}
                disabled={dashLoading}
                onClick={handleClearDashboardFilters}
              >
                Clear filters
              </button>
              <a className={btnBase} href={dashboardExportHref()} download>
                Export CSV
              </a>
            </div>
            {dashError && (
              <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
                {dashError}
              </p>
            )}
          </section>

          <section className={cardCls} id="dash-expenses-table">
            {dashEditSaveError && !dashDetailExpense && (
              <p className="mb-3 text-sm font-medium text-red-600 dark:text-red-400">
                {dashEditSaveError}
              </p>
            )}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Recent expenses
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Showing {dashRows.length} of {dashTotalCount}
                </span>
                <a
                  href="#dash-expenses-table"
                  className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400"
                >
                  View table
                </a>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/80">
                    <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                      Vendor
                    </th>
                    <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                      Total
                    </th>
                    <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                      Currency
                    </th>
                    <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                      Date
                    </th>
                    <th className="min-w-[6.5rem] px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                      Confidence
                    </th>
                    <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                      Flag
                    </th>
                    <th className="min-w-[7.5rem] px-2 py-2 text-center font-medium text-zinc-700 dark:text-zinc-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dashRows.length === 0 && !dashLoading && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-6 text-center text-zinc-500 dark:text-zinc-400"
                      >
                        No expenses match these filters.
                      </td>
                    </tr>
                  )}
                  {dashRows.map((ex) => {
                    const fd = ex.finalData || {}
                    const created = ex.createdAt
                      ? new Date(ex.createdAt).toLocaleString()
                      : ''
                    const rowSavingThis =
                      dashEditSaving &&
                      dashDetailExpense &&
                      String(dashDetailExpense._id) === String(ex._id)
                    const conf =
                      typeof ex.confidence === 'number' &&
                      !Number.isNaN(ex.confidence)
                        ? ex.confidence
                        : typeof fd.confidence === 'number' &&
                            !Number.isNaN(fd.confidence)
                          ? fd.confidence
                          : null
                    const flagRaw = ex.confidenceFlag ?? fd.confidence_flag
                    return (
                      <tr
                        key={ex._id}
                        className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                      >
                        <td className="px-3 py-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <VendorAvatar name={fd.vendor} />
                            <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                              {fd.vendor || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 tabular-nums text-zinc-900 dark:text-zinc-100">
                          {fd.total != null && fd.total !== ''
                            ? typeof fd.total === 'number'
                              ? fd.total.toFixed(2)
                              : fd.total
                            : '—'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-zinc-600 dark:text-zinc-400">
                          {fd.currency || '—'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-zinc-600 dark:text-zinc-400">
                          {created || '—'}
                        </td>
                        <td className="px-3 py-2">
                          <ConfidenceMeter value={conf} />
                        </td>
                        <td className="px-3 py-2 align-middle">
                          <FlagBadge flag={flagRaw} />
                        </td>
                        <td className="px-1 py-2 text-center">
                          <div className="flex flex-wrap items-center justify-center gap-0.5">
                            <button
                              type="button"
                              className={dashRowIconBtn}
                              aria-label={`View ${fd.vendor || 'expense'}`}
                              disabled={dashDeleteBusy || dashLoading}
                              onClick={() => {
                                setDashEditSaveError('')
                                setDashDetailExpense(ex)
                                setDashEditSession(null)
                              }}
                            >
                              <EyeViewIcon />
                            </button>
                            <button
                              type="button"
                              className={dashRowIconBtn}
                              aria-label={`Edit ${fd.vendor || 'expense'}`}
                              disabled={
                                dashDeleteBusy ||
                                rowSavingThis ||
                                dashLoading
                              }
                              onClick={() => {
                                setDashEditSaveError('')
                                setDashDetailExpense(ex)
                                startDashEdit(ex)
                              }}
                            >
                              <PencilIcon />
                            </button>
                            <button
                              type="button"
                              className={dashRowIconBtnDanger}
                              aria-label={`Delete ${fd.vendor || 'expense'}`}
                              disabled={dashDeleteBusy || dashLoading}
                              onClick={() => void deleteDashExpense(ex)}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {dashHasMore && (
              <button
                type="button"
                className={`${btnBase} mt-4`}
                disabled={dashLoading}
                onClick={handleLoadMoreDashboard}
              >
                {dashLoading ? 'Loading…' : 'Load more'}
              </button>
            )}
          </section>

          <section className={`${cardCls} text-left`}>
            <h2 className="mb-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {'Confidence & the Flag column'}
            </h2>
            <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-400">
              Each expense stores an AI{' '}
              <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                confidence score
              </strong>{' '}
              (0–100) and a{' '}
              <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                flag
              </strong>{' '}
              shown in the table. The score follows a fixed rubric applied on
              the server after extraction (Gemini may suggest fields; the
              numbers you see use the rules below).
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  How the score is built
                </h3>
                <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                  Points add up toward 100, then the score is capped if totals
                  or line items do not line up:
                </p>
                <ul className="m-0 list-none space-y-2 p-0 text-sm text-zinc-800 dark:text-zinc-200">
                  <li className="flex gap-2">
                    <span className="font-mono text-violet-600 dark:text-violet-400">
                      +30
                    </span>
                    <span>Vendor found on the receipt</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-mono text-violet-600 dark:text-violet-400">
                      +30
                    </span>
                    <span>Date found</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-mono text-violet-600 dark:text-violet-400">
                      +40
                    </span>
                    <span>Total found</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-mono text-violet-600 dark:text-violet-400">
                      +5
                    </span>
                    <span>
                      Line item prices reconcile with total (and at least one
                      priced line)
                    </span>
                  </li>
                </ul>
                <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                  If totals validation fails, the score is capped at 70 and the
                  flag is review. With no line items after cleanup, it is
                  capped at 60. Open an expense to see the stored score in
                  details.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  What the flag means
                </h3>
                <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                  The <strong className="text-zinc-800 dark:text-zinc-200">Flag</strong>{' '}
                  column is the confidence flag saved with the expense:
                </p>
                <dl className="m-0 space-y-3 text-sm">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                    <dt className="mb-1 flex items-center gap-2 font-semibold text-emerald-900 dark:text-emerald-100">
                      <span className="rounded-md bg-emerald-600/15 px-2 py-0.5 font-mono text-xs uppercase tracking-wide">
                        auto
                      </span>
                      Confidence ≥ 80
                    </dt>
                    <dd className="m-0 text-emerald-900/90 dark:text-emerald-100/90">
                      The model was reasonably sure about vendor, date, and total.
                      You can still edit before save; approved saves are allowed
                      without an extra review tick when rules allow.
                    </dd>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
                    <dt className="mb-1 flex items-center gap-2 font-semibold text-amber-950 dark:text-amber-100">
                      <span className="rounded-md bg-amber-600/15 px-2 py-0.5 font-mono text-xs uppercase tracking-wide">
                        review
                      </span>
                      Confidence &lt; 80
                    </dt>
                    <dd className="m-0 text-amber-950/90 dark:text-amber-100/90">
                      Treat the extraction as uncertain: double-check amounts and
                      line items. Saving as approved may require confirming you
                      reviewed the expense.
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>
        </div>
      )}

      {mainTab === 'receipt' && (
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
          {phase === 'upload' && (
            <section className={`${cardCls} mb-5 text-left`}>
              <h2 className="mb-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Receipt scan
              </h2>
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                Upload a receipt image (PNG or JPG). OCR + Gemini run on the
                server; you review before anything is saved as an expense.
              </p>
              <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-gradient-to-b from-violet-50/60 to-zinc-50/80 transition hover:border-violet-400 dark:border-zinc-600 dark:from-violet-950/20 dark:to-zinc-900/40 dark:hover:border-violet-600">
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
                  className="flex cursor-pointer flex-col items-center gap-3 px-6 py-10 text-center"
                >
                  <span className="rounded-full bg-violet-100 p-3 text-violet-700 shadow-sm dark:bg-violet-950/60 dark:text-violet-300">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {uploading
                      ? 'Processing…'
                      : 'Drop a file here, or use the purple button below.'}
                  </span>
                </label>
                <div className="flex justify-center px-6 pb-8">
                  <button
                    type="button"
                    className={btnPrimary}
                    disabled={uploading}
                    onClick={() => receiptUploadInputRef.current?.click()}
                  >
                    {uploading ? 'Processing…' : 'Choose image'}
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
                    {draft.aiConfidence != null && !Number.isNaN(draft.aiConfidence)
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
              <div className="flex flex-col gap-3">
                {draft.items.map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_7rem_auto]"
                  >
                    <input
                      className={inputCls}
                      placeholder="Name"
                      value={row.name}
                      onChange={(e) => updateItem(i, 'name', e.target.value)}
                    />
                    <input
                      className={inputCls}
                      placeholder="Price"
                      inputMode="decimal"
                      value={row.price}
                      onChange={(e) => updateItem(i, 'price', e.target.value)}
                    />
                    <button
                      type="button"
                      className="justify-self-start text-sm font-medium text-violet-600 underline decoration-violet-400/60 underline-offset-2 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-violet-400 dark:hover:text-violet-300"
                      onClick={() => removeItemRow(i)}
                      disabled={draft.items.length <= 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="self-start text-sm font-medium text-violet-600 underline decoration-violet-400/60 underline-offset-2 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                  onClick={addItemRow}
                >
                  Add line
                </button>
              </div>

              <details className="mt-5 text-left text-sm text-zinc-700 dark:text-zinc-300">
                <summary className="cursor-pointer font-medium text-zinc-800 dark:text-zinc-200">
                  Raw OCR text
                </summary>
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
                    className={btnBase}
                    onClick={retryReceiptScan}
                    disabled={uploading || saving}
                  >
                    {uploading ? 'Retrying…' : 'Retry scan'}
                  </button>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Runs OCR and AI again on the same file (no need to re-select).
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
                    Required when parsing failed, the receipt is flagged for review,
                    or confidence is below 80.
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
              <p className="mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-50">
                Expense saved.
              </p>
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                MongoDB id:{' '}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                  {lastSavedId}
                </code>
              </p>
              <button type="button" className={btnPrimary} onClick={onReject}>
                Upload another receipt
              </button>
            </section>
          )}

          {recent.length > 0 && (
            <section className={`${cardCls} text-left`}>
              <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Recent expenses
              </h2>
              <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
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
                              {fd.currency || ''}
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
            </section>
          )}
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
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                  </span>
                  <span className="max-w-[14rem]">
                    Use <strong className="font-medium text-violet-700 dark:text-violet-300">Choose image</strong> in the main column — your receipt will appear here.
                  </span>
                </div>
              )}
            </div>
          </aside>
        </div>
        </div>
      )}

        </main>
      </div>

      {dashDetailExpense && (
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
            className="relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-violet-200/70 bg-white shadow-xl shadow-violet-900/10 ring-1 ring-violet-200/50 dark:border-violet-900/45 dark:bg-zinc-900 dark:shadow-black/40 dark:ring-violet-900/35 sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dash-detail-title"
          >
            <div className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-violet-100 bg-gradient-to-r from-violet-50/90 via-white to-zinc-50/40 px-5 py-4 dark:border-violet-900/40 dark:from-violet-950/35 dark:via-zinc-900 dark:to-zinc-900/90">
              <div className="min-w-0 flex-1">
                <h2
                  id="dash-detail-title"
                  className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
                >
                  {dashEditSession ? 'Edit expense' : 'Receipt details'}
                </h2>
                <p className="mt-0.5 truncate text-sm text-zinc-600 dark:text-zinc-400">
                  {(dashDetailExpense.finalData || {}).vendor || 'Expense'}{' '}
                  <span className="text-zinc-300 dark:text-zinc-600">·</span>{' '}
                  <span className="font-mono text-xs text-violet-600 dark:text-violet-400">
                    {dashDetailExpense._id}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
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
                      onClick={() => {
                        setDashEditSession(null)
                        setDashEditSaveError('')
                      }}
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

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-left text-sm">
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
                  <div className="flex flex-col gap-3">
                    {dashEditSession.draft.items.map((row, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_7rem_auto]"
                      >
                        <input
                          className={inputCls}
                          placeholder="Name"
                          value={row.name}
                          onChange={(e) =>
                            dashEditUpdateItem(i, 'name', e.target.value)
                          }
                          disabled={dashEditSaving}
                        />
                        <input
                          className={inputCls}
                          placeholder="Price"
                          inputMode="decimal"
                          value={row.price}
                          onChange={(e) =>
                            dashEditUpdateItem(i, 'price', e.target.value)
                          }
                          disabled={dashEditSaving}
                        />
                        <button
                          type="button"
                          className="justify-self-start text-sm font-medium text-violet-600 underline decoration-violet-400/60 underline-offset-2 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-violet-400 dark:hover:text-violet-300"
                          onClick={() => dashEditRemoveItemRow(i)}
                          disabled={
                            dashEditSaving ||
                            dashEditSession.draft.items.length <= 1
                          }
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="self-start text-sm font-medium text-violet-600 underline decoration-violet-400/60 underline-offset-2 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                      onClick={dashEditAddItemRow}
                      disabled={dashEditSaving}
                    >
                      Add line
                    </button>
                  </div>
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
                  typeof ex.confidence === 'number' && !Number.isNaN(ex.confidence)
                    ? ex.confidence
                    : typeof fd.confidence === 'number' && !Number.isNaN(fd.confidence)
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
                          That JSON is only a <strong>record of the first upload</strong>{' '}
                          (e.g. OCR could not read the image, or AI returned no
                          structured data). You still entered or corrected vendor,
                          lines, and totals — those are stored as the{' '}
                          <strong>saved expense</strong>. The{' '}
                          <strong>confidence</strong> number is our +30 / +30 / +40
                          guideline score applied to that <em>saved</em> data, so
                          it can be high even when the snapshot says{' '}
                          <code className="rounded bg-amber-100/80 px-1 font-mono text-xs dark:bg-amber-900/50">
                            aiParseFailed
                          </code>
                          . Raw OCR text is empty when nothing was extracted in that
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
                          : 'Extracted rows from this expense. Quantity and unit price are shown when present; otherwise use line total only.'}
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
                            <th className="px-3 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">
                              {initialScanFailed ? 'Line AI score' : 'Confidence'}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
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
                                  : price !== null &&
                                      !Number.isNaN(Number(price))
                                    ? formatDashAmount(price, cur)
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
                                  <td
                                    className="min-w-[5.5rem] px-3 py-2"
                                    title={
                                      initialScanFailed
                                        ? 'No per-line AI score when the first parse failed; see saved confidence above.'
                                        : 'Same receipt-level score on each row until line-level scores exist.'
                                    }
                                  >
                                    {initialScanFailed ? (
                                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                        —
                                      </span>
                                    ) : docConf !== null ? (
                                      <ConfidenceMeter value={docConf} />
                                    ) : (
                                      <span className="text-zinc-500 dark:text-zinc-400">
                                        {confLabel}
                                      </span>
                                    )}
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
                        Raw OCR text
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
      )}
    </div>
  )
}

export default App
