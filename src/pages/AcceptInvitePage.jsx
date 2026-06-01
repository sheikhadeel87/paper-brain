import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Mail, MapPin, ShieldCheck } from 'lucide-react'
import { BrandMark } from '../components/BrandMark.jsx'
import { useAuth } from '../context/useAuth.js'
import { verifyTeamInvitationRequest } from '../services/authService.js'
import { btnBase, btnPrimary, cardCls, inputCls, labelCls } from '../lib/uiClasses.js'

function branchLabel(invitation) {
  const branch = invitation?.branch
  if (!branch?.name) return 'your assigned branch'
  const location = typeof branch.location === 'string' ? branch.location.trim() : ''
  return location ? `${branch.name} · ${location}` : branch.name
}

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams()
  const { acceptInvite } = useAuth()
  const token = useMemo(() => searchParams.get('token')?.trim() || '', [searchParams])
  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [verifyError, setVerifyError] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function verifyInvite() {
      setLoading(true)
      setVerifyError('')
      if (!token) {
        setVerifyError('Invitation token is missing.')
        setLoading(false)
        return
      }
      try {
        const res = await verifyTeamInvitationRequest(token)
        if (cancelled) return
        if (!res.ok || !res.success || !res.invitation) {
          throw new Error(res.error || 'This invitation is invalid or has expired.')
        }
        setInvitation(res.invitation)
      } catch (err) {
        if (!cancelled) {
          setVerifyError(
            err instanceof Error
              ? err.message
              : 'This invitation is invalid or has expired.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    verifyInvite()
    return () => {
      cancelled = true
    }
  }, [token])

  async function onSubmit(event) {
    event.preventDefault()
    setSubmitError('')
    if (password.length < 6) {
      setSubmitError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match.')
      return
    }

    setBusy(true)
    try {
      await acceptInvite(token, password)
      window.location.replace('/dashboard')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not accept invitation.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-svh bg-zinc-100 px-4 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:min-h-[calc(100svh-5rem)] lg:flex-row lg:items-center">
        <section className="relative overflow-hidden rounded-3xl border border-violet-200 bg-zinc-950 p-6 text-white shadow-2xl dark:border-violet-900/60 lg:flex-1 lg:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.35),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.24),transparent_30%)]" />
          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-violet-100">
              <BrandMark className="h-9 w-9" />
              Paper Brain
            </Link>
            <div className="mt-14 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200">
                Team Invitation
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {invitation?.organization?.name
                  ? `Join ${invitation.organization.name} on Paper Brain`
                  : 'Join your team on Paper Brain'}
              </h1>
              <p className="mt-4 text-sm leading-6 text-zinc-300 sm:text-base">
                Create your manager password to access your isolated branch dashboard
                and start managing receipt uploads for your location.
              </p>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-zinc-200 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <Mail className="h-5 w-5 text-violet-200" aria-hidden="true" />
                <p className="mt-3 text-xs uppercase tracking-wide text-zinc-400">Invited Email</p>
                <p className="mt-1 truncate font-medium text-white">
                  {invitation?.email || 'Verifying...'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <MapPin className="h-5 w-5 text-violet-200" aria-hidden="true" />
                <p className="mt-3 text-xs uppercase tracking-wide text-zinc-400">Branch</p>
                <p className="mt-1 truncate font-medium text-white">{branchLabel(invitation)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${cardCls} w-full lg:max-w-md`}>
          {loading ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-200">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Verifying invitation
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Checking that your invite is active.
              </p>
            </div>
          ) : verifyError ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-200">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Invitation unavailable
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{verifyError}</p>
              <Link to="/login" className={`${btnBase} mt-6 w-full no-underline`}>
                Go to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-200">
                  <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                    Set your password
                  </h2>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Your manager account is ready for {invitation?.email}.
                  </p>
                </div>
              </div>

              <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                <label className={labelCls}>
                  Password
                  <input
                    className={inputCls}
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={6}
                    required
                    disabled={busy}
                  />
                </label>
                <label className={labelCls}>
                  Confirm Password
                  <input
                    className={inputCls}
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    minLength={6}
                    required
                    disabled={busy}
                  />
                </label>
                {submitError ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
                    {submitError}
                  </p>
                ) : null}
                <button type="submit" className={`${btnPrimary} w-full`} disabled={busy}>
                  {busy ? 'Activating...' : 'Activate account'}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
