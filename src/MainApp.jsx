import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from './context/useAuth.js'
import { toast } from 'react-hot-toast';
import {
  aiDataToDraft,
  cloneJsonSafe,
  draftToFinalData,
  emptyRow,
  needsReviewAcknowledge,
} from './lib/receiptDraft'
import { AppChrome } from './components/ExpenseUi'
import {
  DashboardView,
  ExpenseDetailModal,
  ReceiptView,
} from './AppViews'

const RECENT_SCAN_LIMIT = 10
/** Receipts library & Expenses list: items per page (server `limit` / `skip`). */
const RECEIPT_PAGE_SIZE = 15
/** Dashboard overview: recent table only. */
const DASH_OVERVIEW_LIMIT = 10
/**
 * The upload request is `fetch` + `res.json()`. If the connection stalls *after* headers, `fetch` may
 * already have resolved; `res.json()` can then hang for ever with no `finally` — the UI spins forever.
 * A single `Promise.race` caps the *entire* operation, including the body, and we abort the signal.
 */
const RECEIPT_UPLOAD_TIMEOUT_MS = 120_000

export default function MainApp() {
  const { authFetch, user, logout } = useAuth()
  const [mainTab, setMainTab] = useState('dashboard')
  /** `scan` = upload flow (short recent list). `library` = full receipt list from sidebar. */
  const [receiptPanel, setReceiptPanel] = useState('scan')
  const [receiptLibraryPage, setReceiptLibraryPage] = useState(0)
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
  const [lastSavedId, setLastSavedId] = useState('')
  const [userEdited, setUserEdited] = useState(false)
  const [recent, setRecent] = useState([])
  const [recentTotalCount, setRecentTotalCount] = useState(0)
  const [recentFetchError, setRecentFetchError] = useState('')
  const [inputKey, setInputKey] = useState(0)
  /** Server `Receipt` draft id from last upload; sent with confirm save to link rows. */
  const [receiptDraftId, setReceiptDraftId] = useState('')
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
  const [dashExportBusy, setDashExportBusy] = useState(false)
  /** Dashboard home vs full expenses list (sidebar). */
  const [dashboardPanel, setDashboardPanel] = useState('overview')
  const [expensesPage, setExpensesPage] = useState(0)
  const prevDashPanelRef = useRef(dashboardPanel)

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
    const isLibrary = mainTab === 'receipt' && receiptPanel === 'library'
    const limit = isLibrary ? RECEIPT_PAGE_SIZE : RECENT_SCAN_LIMIT
    const skip = isLibrary ? receiptLibraryPage * RECEIPT_PAGE_SIZE : 0
    setRecentFetchError('')
    try {
      const r = await authFetch(`/api/expenses?limit=${limit}&skip=${skip}`)
      const data = await r.json().catch(() => ({}))
      if (!r.ok) {
        setRecentFetchError(
          typeof data.error === 'string'
            ? data.error
            : `Could not load expenses (${r.status}). Is the API running?`,
        )
        setRecent([])
        setRecentTotalCount(0)
        return
      }
      if (data.success && Array.isArray(data.expenses)) {
        setRecent(data.expenses)
        setRecentTotalCount(
          typeof data.totalCount === 'number' ? data.totalCount : data.expenses.length,
        )
      } else {
        setRecent([])
        setRecentTotalCount(0)
        setRecentFetchError(
          typeof data.error === 'string' ? data.error : 'Could not load expenses.',
        )
      }
    } catch (e) {
      setRecent([])
      setRecentTotalCount(0)
      setRecentFetchError(
        e instanceof Error ? e.message : 'Network error loading expenses.',
      )
    }
  }, [authFetch, mainTab, receiptPanel, receiptLibraryPage])

  useEffect(() => {
    void loadRecent()
  }, [loadRecent])

  const goMainTab = useCallback((tab) => {
    if (tab === 'receipt') setReceiptPanel('scan')
    setMainTab(tab)
  }, [setMainTab, setReceiptPanel])

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
  }, [authFetch, dashFrom, dashTo, dashVendor])

  const runDashboardFetch = useCallback(
    async ({ filterOverride } = {}) => {
      const isList = dashboardPanel === 'expenses'
      const limit = isList ? RECEIPT_PAGE_SIZE : DASH_OVERVIEW_LIMIT
      const skip = isList ? expensesPage * RECEIPT_PAGE_SIZE : 0
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
      dashFrom,
      dashTo,
      dashVendor,
    ],
  )

  useEffect(() => {
    if (mainTab !== 'dashboard') return
    void runDashboardFetch()
  }, [mainTab, dashboardPanel, expensesPage, runDashboardFetch])

  function handleApplyDashboard() {
    setExpensesPage(0)
    void runDashboardFetch()
  }

  function handleClearDashboardFilters() {
    setDashFrom('')
    setDashTo('')
    setDashVendor('')
    setExpensesPage(0)
    void runDashboardFetch({
      filterOverride: { from: '', to: '', vendor: '' },
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
  
    // 2. Start the Loading Toast
    const toastId = toast.loading('Papper Brain is scanning your receipt...');
  
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
      
      let data = rawData;
  
      // --- CASE: Server responded, but with an ERROR (e.g. 500, 400) ---
      if (!res.ok) {
        toast.error(data.error || 'Upload failed', { id: toastId });
        
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
      
      if (success) {
        toast.success('Scan successful!', { id: toastId });
      } else {
        toast.error('AI could not read receipt details clearly.', { id: toastId });
      }
  
      // ... your existing success logic (setting snapshots, drafts, etc.) ...
      setRawText(typeof data.rawText === 'string' ? data.rawText : '');
      setParseOk(success);
      setParseError(typeof data.error === 'string' ? data.error : '');
      setScanRetryable(!success && data.retryable !== false);
      setNeedsReview(Boolean(data.needsReview) || !success);
      const ai = success ? data.aiData : null;
      const snap = ai ? JSON.parse(JSON.stringify(ai)) : { aiParseFailed: true, error: 'AI unavailable' };
      setOriginalAiSnapshot(snap);
      setDraft(success ? aiDataToDraft(ai) : aiDataToDraft(null, { parseFailed: true }));
      setPhase('review');
  
    } catch (err) {
      // --- CASE: CATCH (Timeout, Network error, or Crash) ---
      const isTimeout = err?.name === 'TimeoutError' || err?.message === 'timeout';
      
      if (isTimeout) {
        toast.error('Taking too long. Check your connection.', { id: toastId });
      } else {
        toast.error('Network error. Please try again.', { id: toastId });
      }
  
      // ... your existing error state updates ...
      setPhase('review');
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      setUploading(false);
    }
  }

  async function onUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // 1. Validate File Format (Prevention)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format not supported. Please use JPG & PNG.")
      e.target.value = '' 
      return
    }

    // 2. Validate File Size (Optional: 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large (Max 10MB).")
      e.target.value = ''
      return
    }

    // 3. Proceed to the main upload logic
    await runReceiptUpload(file)
    e.target.value = ''
  }

  function retryReceiptScan() {
    const file = lastReceiptFileRef.current
    if (file) {
      // 💡 Small UI touch: Let them know we are retrying specifically
      toast.loading("Retrying scan...", { duration: 2000 }) 
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
      setLastSavedId(String(data.id))
      setConfirmReviewAck(false)
      setForceReviewAck(false)
      setReceiptDraftId('')
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
    setReceiptDraftId('')
    setInputKey((k) => k + 1)
  }

  return (
    <AppChrome
      mainTab={mainTab}
      setMainTab={setMainTab}
      dashboardPanel={dashboardPanel}
      setDashboardPanel={setDashboardPanel}
      receiptPanel={receiptPanel}
      setReceiptPanel={setReceiptPanel}
      user={user}
      onLogout={logout}
      onExportCsv={exportDashboardCsv}
      exportCsvBusy={dashExportBusy}
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
      {mainTab === 'dashboard' && (
        <DashboardView
          setMainTab={goMainTab}
          dashboardPanel={dashboardPanel}
          dashOverviewLimit={DASH_OVERVIEW_LIMIT}
          expensesPage={expensesPage}
          expensesPageSize={RECEIPT_PAGE_SIZE}
          onExpensesPageChange={setExpensesPage}
          onViewAllExpenses={() => {
            setDashboardPanel('expenses')
            setExpensesPage(0)
          }}
          onBackToDashboard={() => setDashboardPanel('overview')}
          dashFrom={dashFrom}
          dashTo={dashTo}
          dashVendor={dashVendor}
          setDashFrom={setDashFrom}
          setDashTo={setDashTo}
          setDashVendor={setDashVendor}
          dashRows={dashRows}
          dashTotalCount={dashTotalCount}
          dashSummary={dashSummary}
          dashLoading={dashLoading}
          dashError={dashError}
          dashEditSaveError={dashEditSaveError}
          dashDetailExpense={dashDetailExpense}
          dashEditSaving={dashEditSaving}
          dashDeleteBusy={dashDeleteBusy}
          onApplyFilters={handleApplyDashboard}
          onClearFilters={handleClearDashboardFilters}
          onExportCsv={exportDashboardCsv}
          exportCsvBusy={dashExportBusy}
          onViewExpense={(ex) => {
            setDashEditSaveError('')
            setDashDetailExpense(ex)
            setDashEditSession(null)
          }}
          onEditExpense={(ex) => {
            setDashEditSaveError('')
            setDashDetailExpense(ex)
            startDashEdit(ex)
          }}
          onDeleteExpense={deleteDashExpense}
        />
      )}

      {mainTab === 'receipt' && (
        <ReceiptView
          receiptPanel={receiptPanel}
          recentTotalCount={recentTotalCount}
          receiptLibraryPage={receiptLibraryPage}
          receiptLibraryPageSize={RECEIPT_PAGE_SIZE}
          onReceiptLibraryPageChange={setReceiptLibraryPage}
          onGoReceiptScan={() => setReceiptPanel('scan')}
          phase={phase}
          draft={draft}
          rawText={rawText}
          parseOk={parseOk}
          parseError={parseError}
          needsReview={needsReview}
          uploading={uploading}
          saving={saving}
          saveError={saveError}
          lastSavedId={lastSavedId}
          recent={recent}
          recentFetchError={recentFetchError}
          inputKey={inputKey}
          confirmReviewAck={confirmReviewAck}
          setConfirmReviewAck={setConfirmReviewAck}
          setSaveError={setSaveError}
          receiptPreviewUrl={receiptPreviewUrl}
          receiptUploadInputRef={receiptUploadInputRef}
          scanRetryable={scanRetryable}
          forceReviewAck={forceReviewAck}
          onUpload={onUpload}
          updateField={updateField}
          updateItem={updateItem}
          addItemRow={addItemRow}
          removeItemRow={removeItemRow}
          retryReceiptScan={retryReceiptScan}
          onConfirmSave={onConfirmSave}
          onReject={onReject}
        />
      )}
    </AppChrome>
  )
}

