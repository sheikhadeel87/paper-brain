import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { resendVerificationRequest } from '../services/authService.js'
import {
  btnBase,
  btnPrimary,
  cardCls,
  inputCls,
  labelCls,
} from '../lib/uiClasses'

export default function RegisterPage() {
  const { register, token } = useAuth()
  const location = useLocation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')
  const [resendBusy, setResendBusy] = useState(false)
  const [resendMsg, setResendMsg] = useState('')

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    setResendMsg('')
    try {
      const result = await register(name, email, password)
      if (result.needsEmailVerification) {
        setPendingEmail(result.email || email)
        return
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setBusy(false)
    }
  }

  async function onResend() {
    const target = pendingEmail || email
    if (!target) return
    setResendBusy(true)
    setResendMsg('')
    try {
      const res = await resendVerificationRequest(target)
      setResendMsg(res.message || (res.success ? 'Email sent.' : 'Could not resend.'))
    } catch {
      setResendMsg('Could not resend verification email.')
    } finally {
      setResendBusy(false)
    }
  }

  if (pendingEmail) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-100 px-4 py-10 dark:bg-zinc-950">
        <Link
          to="/"
          className="mb-6 text-sm font-medium text-violet-600 hover:text-violet-800 dark:text-violet-400"
        >
          ← Back to home
        </Link>
        <div className={`${cardCls} w-full max-w-md text-center`}>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Check your email</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            We sent a verification link to <strong>{pendingEmail}</strong>. Open it to activate your
            account, then sign in.
          </p>
          {resendMsg ? (
            <p className="mt-3 text-sm text-violet-700 dark:text-violet-300">{resendMsg}</p>
          ) : null}
          <button
            type="button"
            className={`${btnPrimary} mt-6 w-full`}
            disabled={resendBusy}
            onClick={onResend}
          >
            {resendBusy ? 'Sending…' : 'Resend verification email'}
          </button>
          <Link to="/login" className={`${btnBase} mt-3 inline-flex w-full justify-center no-underline`}>
            Go to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-100 px-4 py-10 dark:bg-zinc-950">
      <Link
        to="/"
        className="mb-6 text-sm font-medium text-violet-600 hover:text-violet-800 dark:text-violet-400"
      >
        ← Back to home
      </Link>
      <div className={`${cardCls} w-full max-w-md`}>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Create account</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Paper Brain — expenses
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className={labelCls}>
            Name
            <input
              className={inputCls}
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              pattern="[A-Za-z]+ [A-Za-z]+"
              title="Enter first and last name using alphabets only, e.g. Muhammad Adeel."
              required
            />
          </label>
          <label className={labelCls}>
            Email
            <input
              className={inputCls}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className={labelCls}>
            Password
            <input
              className={inputCls}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>
          {error ? (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          ) : null}
          <button type="submit" className={`${btnPrimary} w-full`} disabled={busy}>
            {busy ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{' '}
          <Link
            to="/login"
            state={location.state}
            className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}