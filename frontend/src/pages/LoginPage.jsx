import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import {
  btnBase,
  btnPrimary,
  cardCls,
  inputCls,
  labelCls,
} from '../lib/uiClasses'

const defaultEmail = import.meta.env.DEV ? 'adeel@test.com' : ''
const defaultPassword = import.meta.env.DEV ? 'adeel123' : ''

export default function LoginPage() {
  const { login, token } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState(defaultEmail)
  const [password, setPassword] = useState(defaultPassword)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-zinc-100 px-4 py-10 dark:bg-zinc-950">
      <div className={`${cardCls} w-full max-w-md`}>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Paper Brain — expenses
        </p>
        {import.meta.env.DEV ? (
          <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
            Dev: demo login is pre-filled (<code className="font-mono">adeel@test.com</code>
            ). Orphan expenses are linked to this account when the API starts (non-production).
          </p>
        ) : null}
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : null}
          <button type="submit" className={`${btnPrimary} w-full`} disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          No account?{' '}
          <Link
            to="/register"
            className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400"
          >
            Register
          </Link>
        </p>
        <Link
          to="/register"
          className={`${btnBase} mt-3 w-full no-underline`}
        >
          Create account
        </Link>
      </div>
    </div>
  )
}
