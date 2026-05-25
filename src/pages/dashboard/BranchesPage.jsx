import { useCallback, useEffect, useMemo, useState } from 'react'
import { Building2, MapPin, Plus, X } from 'lucide-react'
import { useAuth } from '../../context/useAuth.js'
import { btnBase, btnPrimary, cardCls, inputCls, labelCls } from '../../lib/uiClasses.js'

function branchId(branch) {
  return branch?.id || branch?._id || ''
}

function branchLocation(branch) {
  const value = typeof branch?.location === 'string' ? branch.location.trim() : ''
  return value || 'No location added'
}

function formatCreatedAt(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function BranchesPage() {
  const { authFetch, user } = useAuth()
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN'

  const sortedBranches = useMemo(
    () =>
      [...branches].sort((a, b) =>
        String(a?.name || '').localeCompare(String(b?.name || '')),
      ),
    [branches],
  )

  const loadBranches = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false)
      return
    }
    setLoading(true)
    setLoadError('')
    try {
      const response = await authFetch('/api/branches')
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Could not load branches.')
      }
      setBranches(Array.isArray(data.branches) ? data.branches : [])
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load branches.')
    } finally {
      setLoading(false)
    }
  }, [authFetch, isAdmin])

  useEffect(() => {
    loadBranches()
  }, [loadBranches])

  useEffect(() => {
    if (!modalOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [modalOpen])

  function openModal() {
    setName('')
    setLocation('')
    setSaveError('')
    setModalOpen(true)
  }

  function closeModal() {
    if (saving) return
    setModalOpen(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const cleanName = name.trim()
    const cleanLocation = location.trim()
    if (!cleanName) {
      setSaveError('Branch name is required.')
      return
    }

    setSaving(true)
    setSaveError('')
    try {
      const response = await authFetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          location: cleanLocation,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Could not create branch.')
      }
      setModalOpen(false)
      await loadBranches()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not create branch.')
    } finally {
      setSaving(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6 text-left">
        <div className={cardCls}>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Branches
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Admin access is required to manage organization branches.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
            Organization
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Branches
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Manage the locations that managers and receipt uploads belong to.
          </p>
        </div>
        <button
          type="button"
          className={`${btnPrimary} w-full gap-2 sm:w-auto`}
          onClick={openModal}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Branch
        </button>
      </div>

      {loadError ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      <section className={cardCls}>
        <div className="flex flex-col gap-1 border-b border-zinc-200 pb-4 dark:border-zinc-800 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Branch directory
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {loading
                ? 'Loading branches...'
                : `${sortedBranches.length} branch${sortedBranches.length === 1 ? '' : 'es'} configured`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Loading branches...
          </div>
        ) : sortedBranches.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 px-4 py-12 text-center dark:border-zinc-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-200">
              <Building2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              No branches yet
            </h3>
            <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
              Add your first branch to start assigning uploads and managers to a location.
            </p>
            <button
              type="button"
              className={`${btnPrimary} mt-5 gap-2`}
              onClick={openModal}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Branch
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-3 sm:hidden">
              {sortedBranches.map((branch) => (
                <article
                  key={branchId(branch)}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/60"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-200">
                      <Building2 className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {branch.name}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                        <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{branchLocation(branch)}</span>
                      </p>
                      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
                        Created {formatCreatedAt(branch.createdAt)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-4 hidden overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 sm:block">
              <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-950/70">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Branch
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                  {sortedBranches.map((branch) => (
                    <tr key={branchId(branch)}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-200">
                            <Building2 className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="font-medium text-zinc-900 dark:text-zinc-50">
                            {branch.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-zinc-600 dark:text-zinc-300">
                        {branchLocation(branch)}
                      </td>
                      <td className="px-4 py-4 text-zinc-500 dark:text-zinc-400">
                        {formatCreatedAt(branch.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-zinc-950/60 px-3 py-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-branch-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal()
          }}
        >
          <form
            className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
            onSubmit={handleSubmit}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="add-branch-title"
                  className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
                >
                  Add Branch
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Create a location for your organization.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label="Close add branch modal"
                onClick={closeModal}
                disabled={saving}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className={labelCls}>
                Branch Name
                <input
                  className={inputCls}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Clifton Branch"
                  required
                  disabled={saving}
                />
              </label>
              <label className={labelCls}>
                Location/City
                <input
                  className={inputCls}
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="e.g. Karachi"
                  disabled={saving}
                />
              </label>
            </div>

            {saveError ? (
              <p
                className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
                role="alert"
              >
                {saveError}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className={`${btnBase} w-full sm:w-auto`}
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${btnPrimary} w-full sm:w-auto`}
                disabled={saving}
              >
                {saving ? 'Creating...' : 'Create Branch'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
