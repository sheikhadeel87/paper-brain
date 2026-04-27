import { pricingTeaser } from './content.js'
import { cardCls } from '../../lib/uiClasses.js'

export function LandingPricing() {
  return (
    <section
      id="pricing"
      className="scroll-mt-20 bg-zinc-50 px-4 py-14 dark:bg-zinc-900/50 sm:px-6 sm:py-16"
    >
      <div className="mx-auto max-w-2xl text-center">
        <div className={`${cardCls} border-violet-100 dark:border-violet-900/40`}>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {pricingTeaser.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {pricingTeaser.body}
          </p>
        </div>
      </div>
    </section>
  )
}
