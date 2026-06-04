import { cardCls } from '../../lib/uiClasses'

const scoreParts = [
  { label: 'Vendor', points: '+30', width: '30%', color: 'bg-violet-500' },
  { label: 'Date', points: '+30', width: '30%', color: 'bg-sky-500' },
  { label: 'Total', points: '+40', width: '40%', color: 'bg-emerald-500' },
]

export function DashboardConfidenceHelp() {
  return (
    <section
      className={`${cardCls} overflow-hidden text-left`}
      aria-labelledby="confidence-help-title"
    >
      <div className="relative -m-6 mb-6 overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-600 px-6 py-7 text-white sm:-m-8 sm:mb-7 sm:px-8">
        <div
          className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/15 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-sky-300/20 blur-3xl"
          aria-hidden="true"
        />
        <p className="relative text-xs font-bold uppercase tracking-[0.22em] text-violet-100">
          AI quality check
        </p>
        <h2
          id="confidence-help-title"
          className="relative mt-2 text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Know when to trust the scan
        </h2>
        <p className="relative mt-3 max-w-2xl text-sm leading-6 text-violet-50/90">
          Paper Brain gives every receipt a confidence score from 0 to 100.
          Higher scores mean the key receipt details were found cleanly.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                How the score is built
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                The AI earns points as it finds the most important receipt fields.
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-600 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800">
              80+ = Auto
            </span>
          </div>

          <div className="relative mt-6">
            <div className="flex h-5 overflow-hidden rounded-full bg-zinc-200 shadow-inner dark:bg-zinc-800">
              {scoreParts.map((part) => (
                <div
                  key={part.label}
                  className={`${part.color} h-full`}
                  style={{ width: part.width }}
                  aria-hidden="true"
                />
              ))}
            </div>
            <div
              className="absolute -top-2 bottom-0 left-[80%] w-px bg-zinc-950/50 dark:bg-white/70"
              aria-hidden="true"
            />
            <div className="absolute left-[80%] top-7 -translate-x-1/2 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg dark:bg-white dark:text-zinc-900">
              80
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {scoreParts.map((part) => (
              <div
                key={part.label}
                className="rounded-xl border border-white bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${part.color}`} />
                  <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-300">
                    {part.points}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {part.label} found
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-100">
            Bonus check: line items should match the total. If totals look wrong,
            the receipt is sent to Review.
          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/25">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                Auto
              </span>
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-200">
                80-100
              </span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-emerald-950 dark:text-emerald-100">
              Looks reliable
            </h3>
            <p className="mt-1 text-sm leading-6 text-emerald-900/85 dark:text-emerald-100/85">
              Vendor, date, and total were found confidently. You can still edit
              before saving.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/25">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                Review
              </span>
              <span className="text-2xl font-bold text-amber-700 dark:text-amber-200">
                0-79
              </span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-amber-950 dark:text-amber-100">
              Needs a quick check
            </h3>
            <p className="mt-1 text-sm leading-6 text-amber-950/85 dark:text-amber-100/85">
              Something is missing or uncertain. Check the total, date, and line
              items before saving.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
