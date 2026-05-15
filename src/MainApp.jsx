import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './context/useAuth.js'
import { toast } from 'react-hot-toast';
import {
  aiDataToDraft,
  cloneJsonSafe,
  draftToFinalData,
  emptyRow,
  needsReviewAcknowledge,
} from './lib/receiptDraft'
import {
  APP_PATHS,
  parseAppSection,
  primaryPathSegment,
} from './lib/appRoutes.js'
import { receiptImageFileWithinLimits } from './lib/receiptImageAccept.js'
import {
  FREE_TIER_LIMIT_FALLBACK_MESSAGE,
  isFreeTierDailyLimitResponse,
} from './lib/receiptUploadLimit.js'
import { AppChrome } from './components/ExpenseUi'
import { FreeTierLimitToast } from './components/FreeTierLimitToast.jsx'
import { AppShellRoutes, ExpenseDetailModal } from './AppViews'
import {
  createBillingPortalSession,
  createCheckoutSession,
} from './services/billingService.js'

const RECENT_SCAN_LIMIT = 10
/** Dashboard “All expenses” + Receipts “All receipts”: `limit` / `skip` choices. */
const LIST_PAGE_SIZE_OPTIONS = [15, 25, 50]
/** Dashboard overview: recent table only. */
const DASH_OVERVIEW_LIMIT = 10
/**
 * The upload request is `fetch` + `res.json()`. If the connection stalls *after* headers, `fetch` may
 * already have resolved; `res.json()` can then hang for ever with no `finally` — the UI spins forever.
 * A single `Promise.race` caps the *entire* operation, including the body, and we abort the signal.
 */
const RECEIPT_UPLOAD_TIMEOUT_MS = 120_000
const RECEIPT_QUEUE_STORAGE_KEY = 'paper-brain:receipt-batch-poll'

function bullMqFifoRunnerState(st) {
  return st === 'active' || st === 'prioritized'
}

/**
 * BullMQ may report multiple `active` jobs (several workers) or mix `active` with `prioritized`.
 * FIFO: only the first runner keeps its state; the rest are shown as `waiting`.
 */
function normalizeReceiptBullJobsFifo(jobs) {
  if (!Array.isArray(jobs)) return []
  let seenRunner = false
  return jobs.map((row) => {
    if (row && bullMqFifoRunnerState(row.state)) {
      if (!seenRunner) {
        seenRunner = true
        return row
      }
      return { ...row, state: 'waiting' }
    }
    return row
  })
}

function summarizeReceiptBullJobs(jobs) {
  const list = Array.isArray(jobs) ? jobs : []
  let completed = 0
  let failed = 0
  let processing = 0
  let waiting = 0
  for (const row of list) {
    const st = row?.state
    if (bullMqFifoRunnerState(st)) processing += 1
    else if (st === 'failed') failed += 1
    else if (st === 'completed' || st === 'missing') completed += 1
    else if (
      st === 'waiting' ||
      st === 'delayed' ||
      st === 'waiting-children' ||
      st === 'paused'
    ) {
      waiting += 1
    } else {
      waiting += 1
    }
  }
  if (processing > 1) {
    waiting += processing - 1
    processing = 1
  }
  return {
    total: list.length,
    completed,
    processing,
    waiting,
    failed,
  }
}

/** After `202` from `/api/receipt/upload`, poll job until completed (BullMQ job id or legacy upload job id). */
async function pollReceiptUploadStatus(authFetch, receiptId, signal) {
  const deadline = Date.now() + RECEIPT_UPLOAD_TIMEOUT_MS - 4000
  while (Date.now() < deadline) {
    if (signal.aborted) return null
    await new Promise((r) => {
      setTimeout(r, 1600)
    })
    const r = await authFetch(
      `/api/receipt/upload-status/${encodeURIComponent(receiptId)}`,
      { signal },
    )
    const j = await r.json().catch(() => ({}))
    if (!r.ok) {
      return {
        success: false,
        processingStatus: 'failed',
        error: typeof j.error === 'string' ? j.error : 'Could not load receipt status.',
      }
    }
    const st = j.processingStatus
    if (st === 'completed' || st === 'failed') return j
  }
  return null
}

/** Stable copy of `FileList` (some browsers mutate / clear it when the input is reset). */
function fileListToArray(fileList) {
  if (!fileList || typeof fileList.length !== 'number') return []
  const n = fileList.length
  const out = []
  for (let i = 0; i < n; i++) {
    const f = typeof fileList.item === 'function' ? fileList.item(i) : fileList[i]
    if (f) out.push(f)
  }
  return out
}

function readPersistedReceiptBatchPoll() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(RECEIPT_QUEUE_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const sessionKey =
      typeof parsed.sessionKey === 'string' ? parsed.sessionKey.trim() : ''
    const jobIds = Array.isArray(parsed.jobIds)
      ? parsed.jobIds.map((id) => String(id)).filter(Boolean)
      : []
    if (!sessionKey) return null
    const fileNamesById =
      parsed.fileNamesById && typeof parsed.fileNamesById === 'object'
        ? parsed.fileNamesById
        : {}
    return {
      sessionKey,
      jobIds,
      fileNamesById,
      summary: parsed.summary && typeof parsed.summary === 'object' ? parsed.summary : null,
      jobs: Array.isArray(parsed.jobs) ? parsed.jobs : [],
      idle: Boolean(parsed.idle),
    }
  } catch {
    return null
  }
}

export default function MainApp() {
  const { authFetch, user, logout, refreshUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const appSegment = useMemo(
    () => primaryPathSegment(location.pathname),
    [location.pathname],
  )
  const parsed = useMemo(
    () => parseAppSection(appSegment === '' ? null : appSegment),
    [appSegment],
  )

  const [mainTab, setMainTab] = useState(() => parsed?.mainTab ?? 'dashboard')
  /** `scan` = upload flow (short recent list). `library` = full receipt list from sidebar. */
  const [receiptPanel, setReceiptPanel] = useState(() => parsed?.receiptPanel ?? 'scan')
  const [receiptLibraryPage, setReceiptLibraryPage] = useState(0)
  const [receiptLibraryPageSize, setReceiptLibraryPageSize] = useState(
    LIST_PAGE_SIZE_OPTIONS[0],
  )
  const prevReceiptPanelRef = useRef(receiptPanel)
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
  const [userEdited, setUserEdited] = useState(false)
  const [recent, setRecent] = useState([])
  const [recentTotalCount, setRecentTotalCount] = useState(0)
  const [recentFetchError, setRecentFetchError] = useState('')
  const [inputKey, setInputKey] = useState(0)
  /** Server `Receipt` draft id from last upload; sent with confirm save to link rows. */
  const [receiptDraftId, setReceiptDraftId] = useState('')
  /**
   * When one image produces several Receipt drafts (multi-slip photo), we review/save in order.
   * `items` matches `/api/receipt/upload` `receipts` array; `index` is the slip currently on screen.
   */
  const [multiReceiptQueue, setMultiReceiptQueue] = useState(null)
  const [confirmReviewAck, setConfirmReviewAck] = useState(false)
  const [forceReviewAck, setForceReviewAck] = useState(false)
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState(null)
  /** Blob URLs for the latest queued file selection (Add expense sidebar + gallery). */
  const [receiptQueuePreviewUrls, setReceiptQueuePreviewUrls] = useState([])
  const receiptQueuePreviewUrlsRef = useRef([])
  /** Files accumulated for receipt previews across multiple file-picker runs on Add expense. */
  const receiptSessionPickedFilesRef = useRef([])
  /** Holds the active blob: URL so we revoke exactly once (avoids Strict Mode breaking preview). */
  const receiptBlobRef = useRef(null)
  /** Last file sent to `/api/receipt/upload` — used for “Retry scan”. */
  const lastReceiptFileRef = useRef(null)
  const receiptUploadInputRef = useRef(null)
  const [scanRetryable, setScanRetryable] = useState(false)
  /** Server message for totals mismatch etc. (per slip in multi-receipt queue). */
  const [receiptReviewHint, setReceiptReviewHint] = useState('')
  /**
   * BullMQ session: merged job ids, live summary from `/jobs-status`, stable `sessionKey` for polling.
   */
  const [receiptBatchPoll, setReceiptBatchPoll] = useState(
    () => readPersistedReceiptBatchPoll(),
  )
  const [receiptBatchPostBusy, setReceiptBatchPostBusy] = useState(false)
  const receiptBatchPollRef = useRef(null)
  receiptBatchPollRef.current = receiptBatchPoll

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (!receiptBatchPoll?.sessionKey) {
        window.localStorage.removeItem(RECEIPT_QUEUE_STORAGE_KEY)
        return
      }
      window.localStorage.setItem(
        RECEIPT_QUEUE_STORAGE_KEY,
        JSON.stringify(receiptBatchPoll),
      )
    } catch {
      /* ignore quota / privacy mode errors */
    }
  }, [receiptBatchPoll])

  const dismissReceiptQueue = useCallback(() => {
    setReceiptBatchPoll(null)
  }, [])

  const receiptBatchProgress = useMemo(() => {
    if (!receiptBatchPoll?.sessionKey) {
      if (!receiptBatchPostBusy) return null
      return {
        mergedJobs: [],
        summary: null,
        idle: false,
        batchPostBusy: true,
        queuePlaceholder: true,
        onDismissQueue: null,
      }
    }
    const { jobIds, jobs, fileNamesById, summary, idle } = receiptBatchPoll
    const jobMap = new Map((jobs || []).map((j) => [String(j.id), j]))
    const mergedJobs = jobIds.map((id) => {
      const sid = String(id)
      const row = jobMap.get(sid)
      const fallbackName = fileNamesById?.[sid] || ''
      if (row) {
        return {
          ...row,
          fileName:
            (typeof row.fileName === 'string' && row.fileName.trim() !== ''
              ? row.fileName
              : fallbackName) || sid,
        }
      }
      return { id: sid, state: 'unknown', fileName: fallbackName || sid }
    })
    const totals =
      summary ||
      (jobIds.length
        ? {
            total: jobIds.length,
            completed: 0,
            processing: 0,
            waiting: jobIds.length,
            failed: 0,
          }
        : {
            total: 0,
            completed: 0,
            processing: 0,
            waiting: 0,
            failed: 0,
          })
    return {
      mergedJobs,
      summary: totals,
      idle: Boolean(idle) && !receiptBatchPostBusy,
      batchPostBusy: receiptBatchPostBusy,
      queuePlaceholder: false,
      onDismissQueue: dismissReceiptQueue,
    }
  }, [receiptBatchPoll, receiptBatchPostBusy, dismissReceiptQueue])

  const [dashFrom, setDashFrom] = useState('')
  const [dashTo, setDashTo] = useState('')
  const [dashVendor, setDashVendor] = useState('')
  /** '' = all, `auto` | `review` match Expense.confidenceFlag */
  const [dashConfidenceFlag, setDashConfidenceFlag] = useState('')
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
  const [dashExportBusy, setDashExportBusy] = useState(false)
  /** Dashboard home vs full expenses list (sidebar). */
  const [dashboardPanel, setDashboardPanel] = useState(
    () => parsed?.dashboardPanel ?? 'overview',
  )
  const [expensesPage, setExpensesPage] = useState(0)
  const [expensesPageSize, setExpensesPageSize] = useState(
    LIST_PAGE_SIZE_OPTIONS[0],
  )
  const prevDashPanelRef = useRef(dashboardPanel)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('billing') !== '1') return
    let cancelled = false
    ;(async () => {
      await refreshUser()
      if (cancelled) return
      params.delete('billing')
      const qs = params.toString()
      navigate(
        { pathname: location.pathname, search: qs ? `?${qs}` : '' },
        { replace: true },
      )
    })()
    return () => {
      cancelled = true
    }
  }, [location.pathname, location.search, navigate, refreshUser])

  useEffect(() => {
    const prev = prevReceiptPanelRef.current
    prevReceiptPanelRef.current = receiptPanel
    if (receiptPanel === 'library' && prev !== 'library') {
      setReceiptLibraryPage(0)
    }
  }, [receiptPanel])

  useEffect(() => {
    const prev = prevDashPanelRef.current
    prevDashPanelRef.current = dashboardPanel
    if (dashboardPanel === 'expenses' && prev !== 'expenses') {
      setExpensesPage(0)
    }
  }, [dashboardPanel])

  const loadRecent = useCallback(async () => {
    const isReceiptTab = mainTab === 'receipt'
    const isLibrary = mainTab === 'receipt' && receiptPanel === 'library'
    const limit = isLibrary ? receiptLibraryPageSize : RECENT_SCAN_LIMIT
    const skip = isLibrary ? receiptLibraryPage * receiptLibraryPageSize : 0
    const endpoint = isReceiptTab
      ? `/api/receipt/drafts?limit=${limit}&skip=${skip}`
      : `/api/expenses?limit=${limit}&skip=${skip}`
    setRecentFetchError('')
    try {
      const r = await authFetch(endpoint)
      const data = await r.json().catch(() => ({}))
      if (!r.ok) {
        setRecentFetchError(
          typeof data.error === 'string'
            ? data.error
            : isReceiptTab
              ? `Could not load receipt drafts (${r.status}). Is the API running?`
              : `Could not load expenses (${r.status}). Is the API running?`,
        )
        setRecent([])
        setRecentTotalCount(0)
        return
      }
      const rows =
        data.success && isReceiptTab
          ? Array.isArray(data.receipts)
            ? data.receipts
            : null
          : data.success && Array.isArray(data.expenses)
            ? data.expenses
            : null
      if (rows) {
        setRecent(rows)
        setRecentTotalCount(
          typeof data.totalCount === 'number' ? data.totalCount : rows.length,
        )
      } else {
        setRecent([])
        setRecentTotalCount(0)
        setRecentFetchError(
          typeof data.error === 'string'
            ? data.error
            : isReceiptTab
              ? 'Could not load receipt drafts.'
              : 'Could not load expenses.',
        )
      }
    } catch (e) {
      setRecent([])
      setRecentTotalCount(0)
      setRecentFetchError(
        e instanceof Error
          ? e.message
          : isReceiptTab
            ? 'Network error loading receipt drafts.'
            : 'Network error loading expenses.',
      )
    }
  }, [authFetch, mainTab, receiptPanel, receiptLibraryPage, receiptLibraryPageSize])

  useEffect(() => {
    void loadRecent()
  }, [loadRecent])

  useEffect(() => {
    const sessionKey = receiptBatchPoll?.sessionKey
    if (!sessionKey || receiptBatchPoll?.idle) return undefined

    let cancelled = false
    let intervalId
    let completionToastShown = false

    async function tick() {
      if (cancelled) return
      const snap = receiptBatchPollRef.current
      if (!snap || snap.sessionKey !== sessionKey || snap.idle) return
      const ids = snap.jobIds
      if (!ids.length) return
      try {
        const r = await authFetch(`/api/receipt/jobs-status?ids=${ids.join(',')}`)
        const data = await r.json().catch(() => ({}))
        if (cancelled || !r.ok || !data.success) return
        const rawJobs = Array.isArray(data.jobs) ? data.jobs : []
        const jobsNorm = normalizeReceiptBullJobsFifo(rawJobs)
        const s0 = summarizeReceiptBullJobs(jobsNorm)
        const total = ids.length
        const s = { ...s0, total }
        const queueIdle =
          s.total > 0 &&
          s.processing === 0 &&
          s.waiting === 0 &&
          s.completed + s.failed === s.total

        setReceiptBatchPoll((prev) => {
          if (!prev || prev.sessionKey !== sessionKey) return prev
          return {
            ...prev,
            summary: s,
            jobs: Array.isArray(data.jobs) ? jobsNorm : prev.jobs,
            idle: queueIdle,
          }
        })

        if (queueIdle && !completionToastShown) {
          completionToastShown = true
          if (intervalId) clearInterval(intervalId)
          if (!cancelled) {
            if (s.failed > 0) {
              toast.error(
                `Queue caught up: ${s.completed} completed, ${s.failed} failed. Receipt drafts are in your account.`,
              )
            } else {
              toast.success(
                `Queue caught up: ${s.completed} receipt image(s) processed. Drafts are ready for review.`,
              )
            }
            void loadRecent()
          }
        }
      } catch {
        /* ignore transient poll errors */
      }
    }

    void tick()
    intervalId = setInterval(() => void tick(), 2000)
    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
    }
  }, [authFetch, loadRecent, receiptBatchPoll?.sessionKey, receiptBatchPoll?.idle])

  useEffect(() => {
    if (!parsed) return
    setMainTab(parsed.mainTab)
    setDashboardPanel(parsed.dashboardPanel)
    setReceiptPanel(parsed.receiptPanel)
  }, [parsed])

  const clearReceiptPreview = useCallback(() => {
    if (receiptBlobRef.current) {
      URL.revokeObjectURL(receiptBlobRef.current)
      receiptBlobRef.current = null
    }
    receiptQueuePreviewUrlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    receiptQueuePreviewUrlsRef.current = []
    receiptSessionPickedFilesRef.current = []
    setReceiptPreviewUrl(null)
    setReceiptQueuePreviewUrls([])
  }, [])

  const setReceiptPreviewFromFile = useCallback((file) => {
    receiptQueuePreviewUrlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    receiptQueuePreviewUrlsRef.current = []
    receiptSessionPickedFilesRef.current = []
    setReceiptQueuePreviewUrls([])
    if (receiptBlobRef.current) {
      URL.revokeObjectURL(receiptBlobRef.current)
      receiptBlobRef.current = null
    }
    const url = URL.createObjectURL(file)
    receiptBlobRef.current = url
    setReceiptPreviewUrl(url)
  }, [])

  useLayoutEffect(() => {
    receiptQueuePreviewUrlsRef.current = receiptQueuePreviewUrls
  }, [receiptQueuePreviewUrls])

  useEffect(() => {
    return () => {
      if (receiptBlobRef.current) {
        URL.revokeObjectURL(receiptBlobRef.current)
        receiptBlobRef.current = null
      }
      // Queue blob URLs: revoked in clearReceiptPreview / onUpload only (not here — Strict Mode).
    }
  }, [])

  useEffect(() => {
    if (mainTab !== 'receipt') {
      clearReceiptPreview()
    }
  }, [mainTab, clearReceiptPreview])

  /** Optional `override` uses those strings instead of state (fixes stale fetch after clear). */
  const expenseFilterParams = useCallback((override) => {
    const from =
      override && typeof override.from === 'string' ? override.from : dashFrom
    const to = override && typeof override.to === 'string' ? override.to : dashTo
    const vendor =
      override && typeof override.vendor === 'string'
        ? override.vendor
        : dashVendor
    const confidenceFlag =
      override && typeof override.confidenceFlag === 'string'
        ? override.confidenceFlag
        : dashConfidenceFlag
    const p = new URLSearchParams()
    if (from.trim()) p.set('from', from.trim())
    if (to.trim()) p.set('to', to.trim())
    if (vendor.trim()) p.set('vendor', vendor.trim())
    if (confidenceFlag === 'auto' || confidenceFlag === 'review') {
      p.set('confidenceFlag', confidenceFlag)
    }
    return p
  }, [dashFrom, dashTo, dashVendor, dashConfidenceFlag])

  function expenseQueryString(skip, limit, filterOverride) {
    const p = expenseFilterParams(filterOverride)
    p.set('limit', String(limit))
    p.set('skip', String(skip))
    return p.toString()
  }

  const exportDashboardCsv = useCallback(async () => {
    const q = expenseFilterParams(undefined).toString()
    const path = q ? `/api/expenses/export?${q}` : '/api/expenses/export'
    setDashExportBusy(true)
    try {
      const r = await authFetch(path)
      if (!r.ok) {
        const ct = (r.headers.get('content-type') || '').toLowerCase()
        let msg = `Export failed (${r.status})`
        if (ct.includes('application/json')) {
          const data = await r.json().catch(() => ({}))
          if (typeof data.error === 'string') msg = data.error
        }
        window.alert(msg)
        return
      }
      const blob = await r.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'expenses.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setDashExportBusy(false)
    }
  }, [authFetch, expenseFilterParams])

  const runDashboardFetch = useCallback(
    async ({ filterOverride } = {}) => {
      const isList = dashboardPanel === 'expenses'
      const limit = isList ? expensesPageSize : DASH_OVERVIEW_LIMIT
      const skip = isList ? expensesPage * expensesPageSize : 0
      setDashLoading(true)
      setDashError('')
      try {
        const r = await authFetch(
          `/api/expenses?${expenseQueryString(skip, limit, filterOverride)}`,
        )
        const data = await r.json().catch(() => ({}))
        if (!r.ok) {
          setDashError(
            typeof data.error === 'string'
              ? data.error
              : `Request failed (${r.status}). Is the API running on port 8000?`,
          )
          return
        }
        if (!data.success) {
          setDashError(data.error || 'Failed to load')
          return
        }
        setDashTotalCount(typeof data.totalCount === 'number' ? data.totalCount : 0)
        setDashSummary(data.summary ?? null)
        const list = Array.isArray(data.expenses) ? data.expenses : []
        setDashRows(list)
      } catch (e) {
        setDashError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        setDashLoading(false)
      }
    },
    // expenseQueryString / expenseFilterParams read dashFrom, dashTo, dashVendor (below).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable URL helpers above
    [
      authFetch,
      dashboardPanel,
      expensesPage,
      expensesPageSize,
      dashFrom,
      dashTo,
      dashVendor,
      dashConfidenceFlag,
    ],
  )

  useEffect(() => {
    if (mainTab !== 'dashboard') return
    void runDashboardFetch()
  }, [mainTab, dashboardPanel, expensesPage, runDashboardFetch])

  const handleExpensesPageSizeChange = useCallback((size) => {
    if (!LIST_PAGE_SIZE_OPTIONS.includes(size)) return
    setExpensesPage(0)
    setExpensesPageSize(size)
  }, [])

  const handleReceiptLibraryPageSizeChange = useCallback((size) => {
    if (!LIST_PAGE_SIZE_OPTIONS.includes(size)) return
    setReceiptLibraryPage(0)
    setReceiptLibraryPageSize(size)
  }, [])

  function handleApplyDashboard() {
    setExpensesPage(0)
    void runDashboardFetch()
  }

  function handleClearDashboardFilters() {
    setDashFrom('')
    setDashTo('')
    setDashVendor('')
    setDashConfidenceFlag('')
    setExpensesPage(0)
    void runDashboardFetch({
      filterOverride: { from: '', to: '', vendor: '', confidenceFlag: '' },
    })
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
      const res = await authFetch(`/api/expenses/${String(ex._id)}`, {
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
      const res = await authFetch(`/api/expenses/${id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        setDashEditSaveError(data.error || 'Delete failed')
        return
      }
      if (modalOpenForThis) closeDashDetail()
      await loadRecent()
      await runDashboardFetch()
    } catch (err) {
      setDashEditSaveError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDashDeleteBusy(false)
    }
  }

  function showFreeTierDailyLimitToast(data) {
    const msg =
      typeof data?.error === 'string' ? data.error : FREE_TIER_LIMIT_FALLBACK_MESSAGE
    toast.custom(
      (t) => (
        <FreeTierLimitToast
          t={t}
          message={msg}
          used={typeof data?.used === 'number' ? data.used : 5}
          limit={typeof data?.limit === 'number' ? data.limit : 5}
          onUpgrade={() => void openCheckout()}
        />
      ),
      {
        duration: 14_000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
          maxWidth: 'none',
        },
      },
    )
  }

  async function runReceiptUpload(file, { keepPreview = false } = {}) {
    if (!file) return;
  
    // 1. Initialize states
    if (!keepPreview) {
      setReceiptPreviewFromFile(file);
    }
    lastReceiptFileRef.current = file;
    setUploading(true);
    setSaveError('');
    setParseError('');
    setScanRetryable(false);

    const controller = new AbortController();
    let timeoutId;
    const fd = new FormData();
    fd.append('receipt', file);
  
    const uploadWithBody = (async () => {
      const res = await authFetch('/api/receipt/upload', {
        method: 'POST',
        body: fd,
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      return { res, data };
    })();
  
    void uploadWithBody.catch(() => {});
  
    try {
      const { res, data: rawData } = await Promise.race([
        uploadWithBody,
        new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            controller.abort();
            const e = new Error('timeout');
            e.name = 'TimeoutError';
            reject(e);
          }, RECEIPT_UPLOAD_TIMEOUT_MS);
        }),
      ]);
      
      let data = rawData

      if (res.ok && res.status === 202 && data.accepted && data.receiptId) {
        const rid = String(data.receiptId).trim()
        const t = toast.loading('Scanning receipt…')
        const polled = await pollReceiptUploadStatus(authFetch, rid, controller.signal)
        toast.dismiss(t)
        if (!polled) {
          toast.error('Taking too long. Check your connection or try again.')
          setMultiReceiptQueue(null)
          setReceiptDraftId('')
          setReceiptReviewHint('')
          setRawText('')
          setParseOk(false)
          setParseError('Timed out while waiting for scan to finish.')
          setScanRetryable(true)
          setNeedsReview(true)
          setOriginalAiSnapshot({
            aiParseFailed: true,
            error: 'timeout',
            rawText: '',
          })
          setDraft(aiDataToDraft(null, { parseFailed: true }))
          setPhase('review')
          return
        }
        if (polled.processingStatus === 'failed') {
          toast.error(
            typeof polled.error === 'string' ? polled.error : 'Receipt could not be processed.',
          )
          setMultiReceiptQueue(null)
          setReceiptDraftId('')
          setReceiptReviewHint('')
          setRawText(typeof polled.rawText === 'string' ? polled.rawText : '')
          setParseOk(false)
          setParseError(
            typeof polled.error === 'string' ? polled.error : 'Processing failed.',
          )
          setScanRetryable(false)
          setNeedsReview(true)
          setOriginalAiSnapshot({
            aiParseFailed: true,
            error: typeof polled.error === 'string' ? polled.error : 'failed',
            rawText: typeof polled.rawText === 'string' ? polled.rawText : '',
          })
          setDraft(aiDataToDraft(null, { parseFailed: true }))
          setPhase('review')
          return
        }
        data = polled
      }

      // --- CASE: Server responded, but with an ERROR (e.g. 500, 400) ---
      if (!res.ok) {
        if (isFreeTierDailyLimitResponse(res, data)) {
          showFreeTierDailyLimitToast(data)
          setPhase('upload')
          return
        }
        toast.error(data.error || 'Upload failed');
        setMultiReceiptQueue(null)
        setReceiptDraftId('')
        setReceiptReviewHint('')

        // ... your existing state updates for !res.ok ...
        setRawText(typeof data.rawText === 'string' ? data.rawText : '');
        setParseOk(false);
        setParseError(typeof data.error === 'string' ? data.error : res.statusText || 'Upload failed');
        setScanRetryable(Boolean(data.retryable));
        setNeedsReview(true);
        setOriginalAiSnapshot({
          aiParseFailed: true,
          error: typeof data.error === 'string' ? data.error : 'request',
          rawText: typeof data.rawText === 'string' ? data.rawText : '',
        });
        setDraft(aiDataToDraft(null, { parseFailed: true }));
        setPhase('review');
        return;
      }
  
      // --- CASE: SUCCESS (The server responded with 200) ---
      const success = Boolean(data.success);
      
      if (!success) {
        toast.error('AI could not read receipt details clearly.');
        setMultiReceiptQueue(null)
        setReceiptReviewHint('')
      }
  
      // ... your existing success logic (setting snapshots, drafts, etc.) ...
      setRawText(typeof data.rawText === 'string' ? data.rawText : '');
      setParseOk(success);
      setParseError(typeof data.error === 'string' ? data.error : '');
      setScanRetryable(!success && data.retryable !== false);
      const receiptsList = Array.isArray(data.receipts) ? data.receipts : []
      const hint0 =
        success && receiptsList.length > 0 && typeof receiptsList[0].reviewHint === 'string'
          ? receiptsList[0].reviewHint.trim()
          : ''
      setReceiptReviewHint(hint0)
      setNeedsReview(Boolean(data.needsReview) || !success || Boolean(hint0));
      const ai = success ? data.aiData : null;
      const snap = ai ? JSON.parse(JSON.stringify(ai)) : { aiParseFailed: true, error: 'AI unavailable' };
      setOriginalAiSnapshot(snap);
      setDraft(success ? aiDataToDraft(ai) : aiDataToDraft(null, { parseFailed: true }));
      setPhase('review');

      /** Multi-receipt: server returns `receipts` with one entry per slip; link save to the active draft id. */
      if (success && receiptsList.length > 1) {
        setMultiReceiptQueue({
          items: receiptsList.map((r) => ({
            receiptId: String(r.receiptId ?? '').trim(),
            aiData: r.aiData && typeof r.aiData === 'object' ? r.aiData : {},
            rawText: typeof r.rawText === 'string' ? r.rawText : '',
            reviewHint: typeof r.reviewHint === 'string' ? r.reviewHint.trim() : '',
          })),
          index: 0,
        })
        setReceiptDraftId(String(receiptsList[0]?.receiptId ?? '').trim())
      } else {
        setMultiReceiptQueue(null)
        const rid = receiptsList[0]?.receiptId ?? data.receiptId
        setReceiptDraftId(
          rid != null && String(rid).trim() !== '' ? String(rid).trim() : '',
        )
      }
  
    } catch (err) {
      // --- CASE: CATCH (Timeout, Network error, or Crash) ---
      const isTimeout = err?.name === 'TimeoutError' || err?.message === 'timeout';
      setMultiReceiptQueue(null)
      setReceiptDraftId('')
      setReceiptReviewHint('')

      if (isTimeout) {
        toast.error('Taking too long. Check your connection.');
      } else {
        toast.error('Network error. Please try again.');
      }
  
      // ... your existing error state updates ...
      setPhase('review');
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      setUploading(false);
    }
  }

  async function runReceiptBatchUpload(files) {
    if (!files.length) return
    setSaveError('')
    try {
      const prevIds = receiptBatchPollRef.current?.jobIds ?? []
      const fd = new FormData()
      for (const f of files) {
        fd.append('receipts', f)
      }
      const res = await authFetch('/api/receipt/upload-multiple', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json().catch(() => ({}))
      if (isFreeTierDailyLimitResponse(res, data)) {
        showFreeTierDailyLimitToast(data)
        return
      }
      if (
        !res.ok ||
        !data.success ||
        (!data.processedInline && !Array.isArray(data.jobIds))
      ) {
        toast.error(
          typeof data.error === 'string' ? data.error : 'Could not queue uploads.',
        )
        return
      }

      if (data.processedInline && data.summary) {
        const s = data.summary
        setReceiptBatchPoll(() => ({
          sessionKey:
            typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : `q_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
          jobIds: [],
          fileNamesById: {},
          summary: s,
          jobs: Array.isArray(data.jobs) ? data.jobs : [],
          idle: true,
        }))
        if (s.failed > 0) {
          toast.error(
            `${s.completed} processed, ${s.failed} failed. Check drafts or try again.`,
          )
        } else {
          toast.success(
            `${s.completed} receipt image(s) processed. Drafts are ready for review.`,
          )
        }
        void loadRecent()
        setPhase('upload')
        lastReceiptFileRef.current = null
        setInputKey((k) => k + 1)
        return
      }

      const jobIds = data.jobIds.map((id) => String(id))
      const fileNames = Array.isArray(data.fileNames) ? data.fileNames : []
      const nameMap = {}
      jobIds.forEach((id, i) => {
        const n = fileNames[i]
        nameMap[id] = typeof n === 'string' && n.trim() !== '' ? n : `Receipt ${i + 1}`
      })
      const mergedCount = new Set([...prevIds, ...jobIds]).size
      setReceiptBatchPoll((prev) => {
        if (!prev?.sessionKey) {
          return {
            sessionKey:
              typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : `q_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
            jobIds,
            fileNamesById: nameMap,
            summary: null,
            jobs: [],
            idle: false,
          }
        }
        const mergedIds = [...prev.jobIds]
        for (const id of jobIds) {
          if (!mergedIds.includes(id)) mergedIds.push(id)
        }
        return {
          ...prev,
          jobIds: mergedIds,
          fileNamesById: { ...prev.fileNamesById, ...nameMap },
          summary: null,
          jobs: [],
          idle: false,
        }
      })
      toast.success(
        `${jobIds.length} image(s) added to the queue (${mergedCount} jobs total). You can add more while others process.`,
      )
      setPhase('upload')
      lastReceiptFileRef.current = null
      setInputKey((k) => k + 1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Queue request failed.')
    }
  }

  async function onUpload(e) {
    const input = e.target
    const raw = fileListToArray(input?.files)
    input.value = ''
    if (raw.length === 0) return

    const list = raw.filter(receiptImageFileWithinLimits)
    const skipped = raw.length - list.length
    if (list.length === 0) {
      if (skipped > 0) {
        toast.error(
          skipped === raw.length
            ? 'No supported images (JPEG / PNG / WebP, max 10MB each).'
            : 'No supported images left after filtering (JPEG / PNG / WebP, max 10MB each).',
        )
      }
      return
    }
    if (skipped > 0) {
      toast.success(
        `${skipped} file(s) skipped (unsupported type, unknown extension, or over 10MB).`,
      )
    }

    setReceiptBatchPostBusy(true)
    try {
      const MAX_QUEUE_PREVIEW = 60
      const mergedFiles = [...receiptSessionPickedFilesRef.current, ...list].slice(
        -MAX_QUEUE_PREVIEW,
      )
      receiptSessionPickedFilesRef.current = mergedFiles

      const oldQueue = receiptQueuePreviewUrlsRef.current.slice()
      oldQueue.forEach((u) => URL.revokeObjectURL(u))
      if (receiptBlobRef.current) {
        URL.revokeObjectURL(receiptBlobRef.current)
        receiptBlobRef.current = null
      }
      setReceiptPreviewUrl(null)
      const next = mergedFiles.map((f) => URL.createObjectURL(f))
      receiptQueuePreviewUrlsRef.current = next
      setReceiptQueuePreviewUrls(next)
      if (list.length > MAX_QUEUE_PREVIEW) {
        toast.success(
          `Preview gallery shows the first ${MAX_QUEUE_PREVIEW} images; all ${list.length} files were queued.`,
        )
      }

      await runReceiptBatchUpload(list)
    } finally {
      setReceiptBatchPostBusy(false)
    }
  }

  function retryReceiptScan() {
    const file = lastReceiptFileRef.current
    if (file) {
      void runReceiptUpload(file, { keepPreview: true })
    } else {
      toast.error("No image found to retry.")
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
        ...(receiptDraftId ? { receiptId: receiptDraftId } : {}),
      }
      const res = await authFetch('/api/expenses', {
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

      const q = multiReceiptQueue
      if (q && q.items.length > 1 && q.index < q.items.length - 1) {
        const nextIdx = q.index + 1
        const next = q.items[nextIdx]
        setMultiReceiptQueue({ ...q, index: nextIdx })
        setReceiptDraftId(next.receiptId)
        setRawText(next.rawText)
        setParseOk(true)
        setParseError('')
        const nextHint =
          typeof next.reviewHint === 'string' ? next.reviewHint.trim() : ''
        setReceiptReviewHint(nextHint)
        setNeedsReview(
          next.aiData?.confidence_flag === 'review' || Boolean(nextHint),
        )
        setOriginalAiSnapshot(cloneJsonSafe(next.aiData))
        setDraft(aiDataToDraft(next.aiData))
        setUserEdited(false)
        setConfirmReviewAck(false)
        setForceReviewAck(false)
        setSaveError('')
        toast.success(
          `Saved ${nextIdx} of ${q.items.length} — review receipt ${nextIdx + 1}`,
        )
        return
      }

      setConfirmReviewAck(false)
      setForceReviewAck(false)
      setReceiptDraftId('')
      setMultiReceiptQueue(null)
      setReceiptReviewHint('')
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
    setReceiptReviewHint('')
    setReceiptBatchPoll(null)
    lastReceiptFileRef.current = null
    setScanRetryable(false)
    clearReceiptPreview()
    setRawText('')
    setParseOk(true)
    setParseError('')
    setOriginalAiSnapshot(null)
    setSaveError('')
    setUserEdited(false)
    setConfirmReviewAck(false)
    setForceReviewAck(false)
    setReceiptDraftId('')
    setMultiReceiptQueue(null)
    setInputKey((k) => k + 1)
  }

  async function openCheckout() {
    try {
      const url = await createCheckoutSession(authFetch)
      window.location.assign(url)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to start checkout.')
    }
  }

  async function openBillingPortal() {
    try {
      const url = await createBillingPortalSession(authFetch)
      window.location.assign(url)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to open billing portal.')
    }
  }

  if (!parsed) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <AppChrome
      mainTab={mainTab}
      dashboardPanel={dashboardPanel}
      receiptPanel={receiptPanel}
      user={user}
      onManageBilling={openBillingPortal}
      onUpgradePlan={openCheckout}
      onLogout={logout}
      modal={
        <ExpenseDetailModal
          dashDetailExpense={dashDetailExpense}
          dashEditSession={dashEditSession}
          setDashEditSession={setDashEditSession}
          dashEditSaving={dashEditSaving}
          dashDeleteBusy={dashDeleteBusy}
          dashEditSaveError={dashEditSaveError}
          closeDashDetail={closeDashDetail}
          startDashEdit={startDashEdit}
          deleteDashExpense={deleteDashExpense}
          saveDashEdit={saveDashEdit}
          onCancelEdit={() => {
            setDashEditSession(null)
            setDashEditSaveError('')
          }}
          dashEditUpdateField={dashEditUpdateField}
          dashEditUpdateItem={dashEditUpdateItem}
          dashEditRemoveItemRow={dashEditRemoveItemRow}
          dashEditAddItemRow={dashEditAddItemRow}
        />
      }
    >
      {(mainTab === 'dashboard' || mainTab === 'receipt') && (
        <AppShellRoutes
          dashboardProps={{
            onNavigateAddExpense: () => navigate(APP_PATHS.addExpense),
            dashOverviewLimit: DASH_OVERVIEW_LIMIT,
            expensesPage,
            expensesPageSize,
            expensesPageSizeOptions: LIST_PAGE_SIZE_OPTIONS,
            onExpensesPageChange: setExpensesPage,
            onExpensesPageSizeChange: handleExpensesPageSizeChange,
            onViewAllExpenses: () => {
              navigate(APP_PATHS.expenses)
              setExpensesPage(0)
            },
            onBackToDashboard: () => navigate(APP_PATHS.dashboard),
            dashFrom,
            dashTo,
            dashVendor,
            dashConfidenceFlag,
            setDashFrom,
            setDashTo,
            setDashVendor,
            setDashConfidenceFlag,
            dashRows,
            dashTotalCount,
            dashSummary,
            dashLoading,
            dashError,
            dashEditSaveError,
            dashDetailExpense,
            dashEditSaving,
            dashDeleteBusy,
            onApplyFilters: handleApplyDashboard,
            onClearFilters: handleClearDashboardFilters,
            onExportCsv: exportDashboardCsv,
            exportCsvBusy: dashExportBusy,
            onViewExpense: (ex) => {
              setDashEditSaveError('')
              setDashDetailExpense(ex)
              setDashEditSession(null)
            },
            onEditExpense: (ex) => {
              setDashEditSaveError('')
              setDashDetailExpense(ex)
              startDashEdit(ex)
            },
            onDeleteExpense: deleteDashExpense,
          }}
          receiptScanProps={{
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
            receiptQueuePreviewUrls,
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
            multiReceiptInfo:
              multiReceiptQueue && multiReceiptQueue.items.length > 1
                ? {
                    current: multiReceiptQueue.index + 1,
                    total: multiReceiptQueue.items.length,
                  }
                : null,
            receiptReviewHint,
            receiptBatchProgress,
          }}
          receiptLibraryProps={{
            recentTotalCount,
            receiptLibraryPage,
            receiptLibraryPageSize,
            receiptLibraryPageSizeOptions: LIST_PAGE_SIZE_OPTIONS,
            onReceiptLibraryPageChange: setReceiptLibraryPage,
            onReceiptLibraryPageSizeChange: handleReceiptLibraryPageSizeChange,
            onGoReceiptScan: () => navigate(APP_PATHS.addExpense),
            recent,
            recentFetchError,
          }}
        />
      )}
    </AppChrome>
  )
}

