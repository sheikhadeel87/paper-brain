import { cardCls } from '../../lib/uiClasses'

export function DashboardConfidenceHelp() {
  return (
    <section className={`${cardCls} text-left`}>
      <h2 className="mb-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {'Confidence & the Flag column'}
      </h2>
      <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-400">
        Each expense stores an AI{' '}
        <strong className="font-medium text-zinc-800 dark:text-zinc-200">
          confidence score
        </strong>{' '}
        (0–100) and a{' '}
        <strong className="font-medium text-zinc-800 dark:text-zinc-200">
          flag
        </strong>{' '}
        shown in the table. .
      </p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            How the score is built
          </h3>

          <ul className="m-0 list-none space-y-2 p-0 text-sm text-zinc-800 dark:text-zinc-200">
            <li className="flex gap-2">
              <span className="font-mono text-violet-600 dark:text-violet-400">
                +30
              </span>
              <span>Vendor found on the receipt</span>
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-violet-600 dark:text-violet-400">
                +30
              </span>
              <span>Date found</span>
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-violet-600 dark:text-violet-400">
                +40
              </span>
              <span>Total found</span>
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-violet-600 dark:text-violet-400">
                +5
              </span>
              <span>
                Line item prices reconcile with total (and at least one priced
                line)
              </span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            If totals validation fails, the score is capped at 0 and the flag
            is review. Open an expense to see the stored score in details.
          </p>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            What the flag means
          </h3>
          <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
            The{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">Flag</strong>{' '}
            column is the confidence flag saved with the expense:
          </p>
          <dl className="m-0 space-y-3 text-sm">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
              <dt className="mb-1 flex items-center gap-2 font-semibold text-emerald-900 dark:text-emerald-100">
                <span className="rounded-md bg-emerald-600/15 px-2 py-0.5 font-mono text-xs uppercase tracking-wide">
                  auto
                </span>
                Score 80+
              </dt>
              <dd className="m-0 text-emerald-900/90 dark:text-emerald-100/90">
                Looks reliable. You can still edit. Save may not ask for the
                extra “I reviewed” checkbox when the app allows it.
              </dd>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
              <dt className="mb-1 flex items-center gap-2 font-semibold text-amber-950 dark:text-amber-100">
                <span className="rounded-md bg-amber-600/15 px-2 py-0.5 font-mono text-xs uppercase tracking-wide">
                  review
                </span>
                Below 80
              </dt>
              <dd className="m-0 text-amber-950/90 dark:text-amber-100/90">
                Treat as uncertain—check totals and line items. Saving may
                require confirming you reviewed.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
