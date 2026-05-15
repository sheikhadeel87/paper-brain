import toast from 'react-hot-toast'
import { Crown, ScanLine, Sparkles, X, Zap } from 'lucide-react'

const PRO_PERKS = [
  { icon: ScanLine, text: 'Unlimited receipt scans' },
  { icon: Zap, text: 'Faster processing queue' },
  { icon: Sparkles, text: 'Full dashboard & exports' },
]

export function FreeTierLimitToast({
  t,
  message,
  used = 5,
  limit = 5,
  onUpgrade,
}) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 100

  return (
    <div
      className={`${
        t.visible ? 'free-tier-toast-enter' : 'free-tier-toast-leave'
      } pointer-events-auto w-[min(calc(100vw-1.5rem),24rem)] overflow-hidden rounded-2xl border border-violet-200/90 bg-white shadow-[0_20px_50px_-12px_rgba(124,58,237,0.35)] ring-1 ring-violet-500/10 dark:border-violet-800/50 dark:bg-zinc-950 dark:shadow-[0_24px_60px_-16px_rgba(0,0,0,0.65)]`}
      role="alertdialog"
      aria-labelledby="free-tier-limit-title"
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-700 px-5 pb-8 pt-5 text-white">
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-10 left-4 h-24 w-24 rounded-full bg-indigo-400/30 blur-2xl"
          aria-hidden
        />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 shadow-inner ring-1 ring-white/25 backdrop-blur-sm">
              <Crown className="h-5 w-5 text-amber-200" strokeWidth={2} aria-hidden />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-100/90">
                Free plan
              </p>
              <h3 id="free-tier-limit-title" className="text-base font-semibold leading-tight">
                Daily scans used up
              </h3>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Dismiss"
            onClick={() => toast.dismiss(t.id)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-violet-100">
            <span>Today&apos;s scans</span>
            <span>
              {used}/{limit}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-200 via-white to-violet-100 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{message}</p>

        <ul className="mt-4 space-y-2">
          {PRO_PERKS.map((perk) => {
            const PerkIcon = perk.icon
            return (
              <li
                key={perk.text}
                className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-200"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300">
                  <PerkIcon className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                </span>
                {perk.text}
              </li>
            )
          })}
        </ul>

        <button
          type="button"
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-violet-600 via-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-500/40 active:scale-[0.98]"
          onClick={() => {
            toast.dismiss(t.id)
            onUpgrade?.()
          }}
        >
          Unlock Pro — unlimited scans
        </button>
        <button
          type="button"
          className="mt-2 w-full rounded-lg py-2 text-xs font-medium text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          onClick={() => toast.dismiss(t.id)}
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
