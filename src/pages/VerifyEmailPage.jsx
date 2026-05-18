import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { verifyEmailRequest } from '../services/authService.js'
import { btnPrimary, cardCls } from '../lib/uiClasses.js'

export default function VerifyEmailPage() {
  const { token } = useParams()
  const rawToken = useMemo(() => String(token || '').trim(), [token])
  const [status, setStatus] = useState(() => (rawToken ? 'loading' : 'error'))
  const [message, setMessage] = useState(() =>
    rawToken ? 'Verifying your email…' : 'Invalid verification link.',
  )

  useEffect(() => {
    if (!rawToken) return

    let cancelled = false
    ;(async () => {
      const res = await verifyEmailRequest(rawToken)
      if (cancelled) return
      if (res.ok && res.success) {
        setStatus('success')
        setMessage(res.message || 'Email verified successfully.')
        return
      }
      setStatus('error')
      setMessage(res.error || 'This verification link is invalid or has expired.')
    })()

    return () => {
      cancelled = true
    }
  }, [rawToken])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-100 px-4 py-10 dark:bg-zinc-950">
      <div className={`${cardCls} w-full max-w-md text-center`}>
        {status === 'loading' ? (
          <div
            className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600"
            aria-hidden
          />
        ) : null}
        {status === 'success' ? (
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
            aria-hidden
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : null}
        {status === 'error' ? (
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
            aria-hidden
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        ) : null}

        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {status === 'loading'
            ? 'Verifying email'
            : status === 'success'
              ? 'Email verified'
              : 'Verification failed'}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>

        {status !== 'loading' ? (
          <Link to="/login" className={`${btnPrimary} mt-6 inline-flex w-full justify-center no-underline`}>
            Go to sign in
          </Link>
        ) : null}
      </div>
    </div>
  )
}
