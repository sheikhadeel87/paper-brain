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

export default function RegisterPage() {
  const { register, token } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      await register(name, email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-zinc-100 px-4 py-10 dark:bg-zinc-950">
      <div className={`${cardCls} w-full max-w-md`}>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Create account
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Register to save and view your expenses.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className={labelCls}>
            Name
            <input
              className={inputCls}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              minLength={6}
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
            {busy ? 'Creating…' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400"
          >
            Sign in
          </Link>
        </p>
        <Link to="/login" className={`${btnBase} mt-3 w-full no-underline`}>
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
