import { howItWorks } from './content.js'

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-b border-zinc-100 bg-white px-4 py-16 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          How it works
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-zinc-600 dark:text-zinc-400">
          Three steps from receipt to saved expense.
        </p>
        <ol className="mt-12 grid gap-8 sm:grid-cols-3">
          {howItWorks.map((item) => (
            <li
              key={item.step}
              className="relative rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 text-left dark:border-zinc-800 dark:bg-zinc-900/40"
            >
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                {item.step}
              </span>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {item.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
