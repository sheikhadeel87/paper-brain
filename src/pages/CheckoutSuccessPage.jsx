import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { APP_PATHS } from '../lib/appRoutes.js'
import { btnPrimary } from '../lib/uiClasses.js'

const MIN_DISPLAY_MS = 3000
const POLL_INTERVAL_MS = 800
const MAX_POLL_ATTEMPTS = 20

function CheckIcon() {
  return (
    <div
      className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
      aria-hidden
    >
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { refreshUserUntilPro } = useAuth()
  const sessionId = searchParams.get('session_id') || ''

  const [status, setStatus] = useState('syncing')
  const [detail, setDetail] = useState('Confirming your Pro subscription…')
  const redirectedRef = useRef(false)
  const mountedAtRef = useRef(0)

  useEffect(() => {
    if (redirectedRef.current) return
    mountedAtRef.current = Date.now()
    let cancelled = false

    ;(async () => {
      const minDone = new Promise((resolve) => {
        setTimeout(resolve, MIN_DISPLAY_MS)
      })

      const syncDone = refreshUserUntilPro({
        maxAttempts: MAX_POLL_ATTEMPTS,
        intervalMs: POLL_INTERVAL_MS,
      })

      const [, user] = await Promise.all([minDone, syncDone])
      if (cancelled || redirectedRef.current) return

      const isPro = user?.plan === 'pro'
      setStatus(isPro ? 'ready' : 'pending')
      setDetail(
        isPro
          ? 'Your account is upgraded. Opening your dashboard…'
          : 'Payment received. Your plan may take a moment to activate — opening dashboard…',
      )

      redirectedRef.current = true
      const elapsed = Date.now() - mountedAtRef.current
      const remaining = Math.max(0, 600 - elapsed)
      await new Promise((r) => setTimeout(r, remaining))

      if (!cancelled) {
        navigate(APP_PATHS.dashboard, { replace: true })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [navigate, refreshUserUntilPro])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <CheckIcon />
        <h1 className="mt-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Payment successful
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{detail}</p>
        {sessionId ? (
          <p className="mt-3 truncate text-xs text-zinc-400 dark:text-zinc-500" title={sessionId}>
            Session: {sessionId.slice(0, 20)}…
          </p>
        ) : null}
        {status === 'syncing' ? (
          <div
            className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600 dark:border-violet-900 dark:border-t-violet-400"
            role="status"
            aria-label="Loading"
          />
        ) : null}
        <button
          type="button"
          className={`${btnPrimary} mt-8 w-full`}
          disabled={status === 'syncing'}
          onClick={() => navigate(APP_PATHS.dashboard, { replace: true })}
        >
          Go to dashboard
        </button>
      </div>
    </div>
  )
}
