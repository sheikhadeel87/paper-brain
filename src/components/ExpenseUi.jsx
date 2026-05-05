import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { APP_PATHS } from '../lib/appRoutes.js'
import { BrandMark } from './BrandMark.jsx'

export function EyeViewIcon() {
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

export function PencilIcon() {
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

export function TrashIcon() {
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

export function FlagBadge({ flag }) {
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

export function VendorAvatar({ name }) {
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

/** Compact loading ring; use `className` for size/color (`currentColor`). */
export function InlineSpinner({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export function ConfidenceMeter({ value }) {
  const n =
    typeof value === 'number' && !Number.isNaN(value)
      ? value
      : Number(value)
  const pct = !Number.isNaN(n) ? Math.min(100, Math.max(0, n)) : 0
  const label = !Number.isNaN(n) ? Math.round(n) : '—'

  let barColor = 'bg-zinc-400 dark:bg-zinc-500'
  let bandLabel = 'unknown'
  if (!Number.isNaN(n)) {
    if (n >= 81) {
      barColor = 'bg-emerald-500 dark:bg-emerald-400'
      bandLabel = 'high'
    } else if (n >= 51) {
      /* Same family as `FlagBadge` review (amber-100 pill); bar needs a bit more saturation to read on the grey track. */
      barColor = 'bg-amber-300 dark:bg-amber-500'
      bandLabel = 'medium'
    } else if (n >= 31) {
      barColor = 'bg-sky-500 dark:bg-sky-400'
      bandLabel = 'low'
    } else {
      barColor = 'bg-red-500 dark:bg-red-400'
      bandLabel = 'very low'
    }
  }

  return (
    <div className="min-w-[5.5rem]">
      <div className="mb-1 flex items-center justify-between gap-2 text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
        <span>{label}</span>
        <span className="text-zinc-400">/100</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
        role="img"
        aria-label={
          Number.isNaN(n)
            ? 'Confidence unavailable'
            : `Confidence ${Math.round(n)} of 100, ${bandLabel} band`
        }
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function CurrencyDonut({ slices }) {
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

function navBtn(active) {
  return active
    ? 'w-full rounded-lg bg-violet-100 px-3 py-2 text-left text-sm font-medium text-violet-900 dark:bg-violet-950/60 dark:text-violet-100'
    : 'w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/80'
}

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function CloseMenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

export function AppChrome({
  mainTab,
  dashboardPanel = 'overview',
  receiptPanel = 'scan',
  children,
  modal,
  user = null,
  onLogout,
}) {
  const navigate = useNavigate()
  const [mobileNav, setMobileNav] = useState(false)

  useEffect(() => {
    if (!mobileNav) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNav])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (mq.matches) setMobileNav(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  function pickTab(tab, subMode) {
    if (tab === 'dashboard' && subMode === 'overview') navigate(APP_PATHS.dashboard)
    else if (tab === 'dashboard' && subMode === 'expenses')
      navigate(APP_PATHS.expenses)
    else if (tab === 'receipt' && subMode === 'scan')
      navigate(APP_PATHS.addExpense)
    else if (tab === 'receipt' && subMode === 'library')
      navigate(APP_PATHS.receipts)
    setMobileNav(false)
  }

  return (
    <div className="flex min-h-[100dvh] w-full flex-1 flex-col bg-zinc-100 dark:bg-zinc-950 lg:min-h-svh lg:flex-row">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-zinc-200 bg-white/95 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95 lg:hidden">
        <button
          type="button"
          className="inline-flex rounded-lg p-2 text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-expanded={mobileNav}
          aria-controls="app-sidebar"
          aria-label="Open navigation menu"
          onClick={() => setMobileNav(true)}
        >
          <MenuIcon />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-start gap-1">
          <BrandMark className="h-8 w-8 shrink-0" />
          <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Paper Brain
          </span>
        </div>
      </header>

      {mobileNav ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-[1px] lg:hidden"
          aria-label="Close navigation menu"
          onClick={() => setMobileNav(false)}
        />
      ) : null}

      <aside
        id="app-sidebar"
        className={`fixed left-0 top-0 z-50 flex h-[100dvh] w-[min(18rem,calc(100vw-1.5rem))] flex-col border-r border-zinc-200 bg-white px-3 py-5 shadow-2xl transition-transform duration-200 ease-out dark:border-zinc-800 dark:bg-zinc-900 lg:sticky lg:top-0 lg:z-0 lg:h-svh lg:w-64 lg:max-w-none lg:translate-x-0 lg:shrink-0 lg:py-6 lg:shadow-none ${
          mobileNav ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="mb-6 flex items-center justify-between gap-2 px-1 lg:mb-8 lg:px-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <BrandMark className="shrink-0" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Paper Brain
              </div>
              <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                 Expenses
              </div>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 lg:hidden"
            aria-label="Close navigation menu"
            onClick={() => setMobileNav(false)}
          >
            <CloseMenuIcon />
          </button>
        </div>
        <nav
          className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain text-left"
          aria-label="Main"
        >
         

          <button
            type="button"
            className={navBtn(
              mainTab === 'dashboard' && dashboardPanel === 'overview',
            )}
            onClick={() => pickTab('dashboard', 'overview')}
          >
            Dashboard
          </button>

          <button
            type="button"
            className={navBtn(mainTab === 'receipt' && receiptPanel === 'scan')}
            onClick={() => pickTab('receipt', 'scan')}
          >
            Add expense
          </button>
          <p className="mb-1 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Manage
          </p>
          <button
            type="button"
            className={navBtn(
              mainTab === 'dashboard' && dashboardPanel === 'expenses',
            )}
            onClick={() => pickTab('dashboard', 'expenses')}
          >
            Expenses
          </button>
          <button
            type="button"
            className={navBtn(mainTab === 'receipt' && receiptPanel === 'library')}
            onClick={() => pickTab('receipt', 'library')}
          >
            Receipts
          </button>
        </nav>
        <div className="mt-auto space-y-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div className="flex items-center gap-2 px-1 pb-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
              {user?.name?.trim()?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                {user?.name || 'Account'}
              </div>
              <div className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                {user?.email || '—'}
              </div>
            </div>
          </div>
          {typeof onLogout === 'function' ? (
            <button
              type="button"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              onClick={onLogout}
            >
              Sign out
            </button>
          ) : null}
        </div>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:min-h-svh">
        <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-3 py-5 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
      {modal}
    </div>
  )
}
