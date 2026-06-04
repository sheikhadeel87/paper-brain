import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowDown, ArrowUp, MailPlus, MapPin, Pencil, Plus, Trash2, UserRound, Users, X } from 'lucide-react'
import { useAuth } from '../../context/useAuth.js'
import { btnBase, btnPrimary, cardCls, inputCls, labelCls } from '../../lib/uiClasses.js'
import { Select } from '../../components/Select.jsx'

function rowId(member) {
  return member?.id || member?._id || member?.email || ''
}

function branchId(branch) {
  return branch?.id || branch?._id || ''
}

function memberBranchName(member) {
  const value = typeof member?.branchName === 'string' ? member.branchName.trim() : ''
  return value || 'Unassigned'
}

function statusBadgeClass(status) {
  const s = String(status || '').toUpperCase()
  if (s === 'ACTIVE') {
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
  }
  return 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100'
}

function roleBadgeClass(role) {
  const r = String(role || '').toUpperCase()
  if (r === 'ADMIN') {
    return 'bg-violet-100 text-violet-800 dark:bg-violet-950/70 dark:text-violet-200'
  }
  return 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
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

export function TeamsPage() {
  const { authFetch, user } = useAuth()
  const [members, setMembers] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [branchesLoading, setBranchesLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [branchesError, setBranchesError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [selectedBranchId, setSelectedBranchId] = useState('')
  const [editMember, setEditMember] = useState(null)
  const [editBranchId, setEditBranchId] = useState('')
  const [editError, setEditError] = useState('')
  const [deleteBusyId, setDeleteBusyId] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [emailSortDirection, setEmailSortDirection] = useState('asc')
  const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN'

  const sortedMembers = useMemo(
    () =>
      [...members].sort((a, b) => {
        const result = String(a?.email || '').localeCompare(
          String(b?.email || ''),
          undefined,
          { sensitivity: 'base' },
        )
        return emailSortDirection === 'asc' ? result : -result
      }),
    [emailSortDirection, members],
  )

  const EmailSortIcon = emailSortDirection === 'asc' ? ArrowUp : ArrowDown

  const sortedBranches = useMemo(
    () =>
      [...branches].sort((a, b) =>
        String(a?.name || '').localeCompare(String(b?.name || '')),
      ),
    [branches],
  )

  const assignedBranchIds = useMemo(() => {
    return new Set(
      members
        .filter((member) =>
          ['ACTIVE', 'PENDING'].includes(String(member?.status || '').toUpperCase()),
        )
        .map((member) => String(member?.branchId || '').trim())
        .filter(Boolean),
    )
  }, [members])

  const availableBranches = useMemo(
    () =>
      sortedBranches.filter((branch) => !assignedBranchIds.has(branchId(branch))),
    [assignedBranchIds, sortedBranches],
  )

  const editBranchOptions = useMemo(() => {
    if (!editMember) return []
    const currentBranchId = String(editMember.branchId || '').trim()
    return sortedBranches.filter((branch) => {
      const id = branchId(branch)
      return id === currentBranchId || !assignedBranchIds.has(id)
    })
  }, [assignedBranchIds, editMember, sortedBranches])

  const loadMembers = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false)
      return
    }
    setLoading(true)
    setLoadError('')
    try {
      const response = await authFetch('/api/teams')
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Could not load team members.')
      }
      setMembers(Array.isArray(data.members) ? data.members : [])
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load team members.')
    } finally {
      setLoading(false)
    }
  }, [authFetch, isAdmin])

  const loadBranches = useCallback(async () => {
    if (!isAdmin) {
      setBranchesLoading(false)
      return
    }
    setBranchesLoading(true)
    setBranchesError('')
    try {
      const response = await authFetch('/api/branches')
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Could not load branches.')
      }
      const nextBranches = Array.isArray(data.branches) ? data.branches : []
      setBranches(nextBranches)
    } catch (err) {
      setBranchesError(err instanceof Error ? err.message : 'Could not load branches.')
    } finally {
      setBranchesLoading(false)
    }
  }, [authFetch, isAdmin])

  useEffect(() => {
    if (!modalOpen) return
    const stillAvailable = availableBranches.some(
      (branch) => branchId(branch) === selectedBranchId,
    )
    if (!stillAvailable) {
      setSelectedBranchId(branchId(availableBranches[0]) || '')
    }
  }, [availableBranches, modalOpen, selectedBranchId])

  useEffect(() => {
    loadMembers()
    loadBranches()
  }, [loadMembers, loadBranches])

  useEffect(() => {
    if (!modalOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [modalOpen])

  useEffect(() => {
    if (!editMember) return
    const stillAvailable = editBranchOptions.some(
      (branch) => branchId(branch) === editBranchId,
    )
    if (!stillAvailable) {
      setEditBranchId(branchId(editBranchOptions[0]) || '')
    }
  }, [editBranchId, editBranchOptions, editMember])

  function openModal() {
    setEmail('')
    setSelectedBranchId(branchId(availableBranches[0]) || '')
    setSaveError('')
    setModalOpen(true)
  }

  function closeModal() {
    if (saving) return
    setModalOpen(false)
  }

  function openEditMember(member) {
    setEditMember(member)
    setEditBranchId(String(member?.branchId || '').trim())
    setEditError('')
  }

  function closeEditMember() {
    if (saving) return
    setEditMember(null)
    setEditBranchId('')
    setEditError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const cleanEmail = email.trim().toLowerCase()
    const cleanBranchId = selectedBranchId.trim()
    if (!cleanEmail || !cleanBranchId) {
      setSaveError('Email and branch are required.')
      return
    }

    setSaving(true)
    setSaveError('')
    try {
      const response = await authFetch('/api/teams/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          branchId: cleanBranchId,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Could not send invitation.')
      }
      setModalOpen(false)
      toast.success('Invitation sent.')
      await loadMembers()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not send invitation.')
    } finally {
      setSaving(false)
    }
  }

  async function handleEditSubmit(event) {
    event.preventDefault()
    const memberId = rowId(editMember)
    const cleanBranchId = editBranchId.trim()
    if (!memberId || !cleanBranchId) {
      setEditError('Branch is required.')
      return
    }

    setSaving(true)
    setEditError('')
    try {
      const response = await authFetch(`/api/teams/${encodeURIComponent(memberId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId: cleanBranchId }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Could not update manager.')
      }
      setEditMember(null)
      toast.success('Manager updated.')
      await loadMembers()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Could not update manager.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteMember(member) {
    const memberId = rowId(member)
    if (!memberId || deleteBusyId) return
    const ok = window.confirm(`Delete ${member.email} from this team?`)
    if (!ok) return

    setDeleteBusyId(memberId)
    try {
      const response = await authFetch(`/api/teams/${encodeURIComponent(memberId)}`, {
        method: 'DELETE',
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Could not delete manager.')
      }
      toast.success('Manager deleted.')
      await loadMembers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete manager.')
    } finally {
      setDeleteBusyId('')
    }
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6 text-left">
        <div className={cardCls}>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Teams
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Admin access is required to manage team invitations.
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
            Teams
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Invite branch managers and track their invitation status.
          </p>
        </div>
        <button
          type="button"
          className={`${btnPrimary} w-full gap-2 sm:w-auto`}
          onClick={openModal}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Invite Member
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
              Team members
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {loading
                ? 'Loading team members...'
                : `${sortedMembers.length} member${sortedMembers.length === 1 ? '' : 's'} invited`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Loading team members...
          </div>
        ) : sortedMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 px-4 py-12 text-center dark:border-zinc-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-200">
              <Users className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              No team members yet
            </h3>
            <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
              Invite a manager and assign them to a branch to start collaborating.
            </p>
            <button
              type="button"
              className={`${btnPrimary} mt-5 gap-2`}
              onClick={openModal}
            >
              <MailPlus className="h-4 w-4" aria-hidden="true" />
              Invite Member
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-3 sm:hidden">
              {sortedMembers.map((member) => (
                <article
                  key={rowId(member)}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/60"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-200">
                      <UserRound className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {member.email}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                        <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{memberBranchName(member)}</span>
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadgeClass(member.role)}`}>
                          {String(member.role || 'MANAGER').toUpperCase()}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(member.status)}`}>
                          {String(member.status || 'PENDING').toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className={`${btnBase} min-h-0 px-3 py-1.5 text-xs`}
                          onClick={() => openEditMember(member)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="inline-flex min-h-0 items-center justify-center rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950/40"
                          disabled={deleteBusyId === rowId(member)}
                          onClick={() => void deleteMember(member)}
                        >
                          {deleteBusyId === rowId(member) ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
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
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-md text-xs font-semibold uppercase tracking-wide text-zinc-500 transition hover:text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500/40 dark:text-zinc-400 dark:hover:text-violet-300"
                        onClick={() =>
                          setEmailSortDirection((direction) =>
                            direction === 'asc' ? 'desc' : 'asc',
                          )
                        }
                        aria-label={`Sort email addresses ${emailSortDirection === 'asc' ? 'descending' : 'ascending'}`}
                        title={`Sort ${emailSortDirection === 'asc' ? 'Z-A' : 'A-Z'}`}
                      >
                        <EmailSortIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Email
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Branch
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Invited
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                  {sortedMembers.map((member) => (
                    <tr key={rowId(member)}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-200">
                            <UserRound className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="font-medium text-zinc-900 dark:text-zinc-50">
                            {member.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadgeClass(member.role)}`}>
                          {String(member.role || 'MANAGER').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-zinc-600 dark:text-zinc-300">
                        {memberBranchName(member)}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(member.status)}`}>
                          {String(member.status || 'PENDING').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-zinc-500 dark:text-zinc-400">
                        {formatCreatedAt(member.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                            onClick={() => openEditMember(member)}
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/40"
                            disabled={deleteBusyId === rowId(member)}
                            onClick={() => void deleteMember(member)}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            {deleteBusyId === rowId(member) ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
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
          aria-labelledby="invite-member-title"
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
                  id="invite-member-title"
                  className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
                >
                  Invite Member
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Invite a manager and assign them to a branch.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label="Close invite member modal"
                onClick={closeModal}
                disabled={saving}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className={labelCls}>
                Email Address
                <input
                  className={inputCls}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="manager@example.com"
                  required
                  disabled={saving}
                />
              </label>
              <label className={labelCls}>
                Assign Branch
                <Select
                  value={selectedBranchId}
                  onChange={setSelectedBranchId}
                  disabled={saving || branchesLoading || availableBranches.length === 0}
                  options={[
                    {
                      value: '',
                      label: branchesLoading
                        ? 'Loading branches...'
                        : availableBranches.length === 0
                          ? 'No unassigned branches'
                          : 'Select a branch',
                    },
                    ...availableBranches.map((branch) => ({
                      value: branchId(branch),
                      label: branch.name,
                    })),
                  ]}
                />
              </label>
            </div>

            {branchesError ? (
              <p
                className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100"
                role="alert"
              >
                {branchesError}
              </p>
            ) : null}
            {!branchesLoading && sortedBranches.length === 0 ? (
              <p className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-300">
                Create a branch before inviting a manager.
              </p>
            ) : null}
            {!branchesLoading && sortedBranches.length > 0 && availableBranches.length === 0 ? (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
                Every branch already has a manager. Create another branch or remove/reassign a manager first.
              </p>
            ) : null}
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
                disabled={saving || branchesLoading || availableBranches.length === 0}
              >
                {saving ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {editMember ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-zinc-950/60 px-3 py-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-member-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditMember()
          }}
        >
          <form
            className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
            onSubmit={handleEditSubmit}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="edit-member-title"
                  className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
                >
                  Edit Manager
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Update this manager&apos;s branch assignment.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label="Close edit manager modal"
                onClick={closeEditMember}
                disabled={saving}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className={labelCls}>
                Email Address
                <input
                  className={inputCls}
                  value={editMember.email || ''}
                  disabled
                />
              </label>
              <label className={labelCls}>
                Assign Branch
                <Select
                  value={editBranchId}
                  onChange={setEditBranchId}
                  disabled={saving || branchesLoading || editBranchOptions.length === 0}
                  options={[
                    {
                      value: '',
                      label: branchesLoading
                        ? 'Loading branches...'
                        : editBranchOptions.length === 0
                          ? 'No available branches'
                          : 'Select a branch',
                    },
                    ...editBranchOptions.map((branch) => ({
                      value: branchId(branch),
                      label: branch.name,
                    })),
                  ]}
                />
              </label>
            </div>

            {editError ? (
              <p
                className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
                role="alert"
              >
                {editError}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className={`${btnBase} w-full sm:w-auto`}
                onClick={closeEditMember}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${btnPrimary} w-full sm:w-auto`}
                disabled={saving || branchesLoading || editBranchOptions.length === 0}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
