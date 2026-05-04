// import { pricingTeaser } from './content.js'
// import { cardCls } from '../../lib/uiClasses.js'

// export function LandingPricing() {
//   return (
//     <section
//       id="pricing"
//       className="scroll-mt-20 bg-zinc-50 px-4 py-14 dark:bg-zinc-900/50 sm:px-6 sm:py-16"
//     >
//       <div className="mx-auto max-w-2xl text-center">
//         <div className={`${cardCls} border-violet-100 dark:border-violet-900/40`}>
//           <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
//             {pricingTeaser.title}
//           </h2>
//           <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
//             {pricingTeaser.body}
//           </p>
//         </div>
//       </div>
//     </section>
//   )
// }
import { Check } from 'lucide-react';
import { pricingTeaser } from './content.js';
import { cardCls } from '../../lib/uiClasses.js';

export function LandingPricing() {
  return (
    <section id="pricing" className="scroll-mt-20 bg-zinc-50 px-4 py-16 dark:bg-zinc-900/50 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-4xl text-center">
        {/* Header Section matching your new branding */}
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
          Pricing
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Plans for every scale
        </h2>
        
        {/* The Pricing Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {pricingTeaser.map((plan) => (
            <div 
              key={plan.name} 
              className={`${cardCls} relative flex flex-col p-8 text-left transition-all hover:shadow-lg ${
                plan.popular ? 'border-violet-500 shadow-violet-100 dark:border-violet-700' : 'border-zinc-200'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  Most Popular
                </span>
              )}
              
              <div className="mb-8">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{plan.name}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{plan.description}</p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{plan.price}</span>
                  <span className="ml-1 text-sm font-semibold text-zinc-500">/month</span>
                </div>
              </div>

              <ul className="mb-8 space-y-4 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                    <Check className="h-5 w-5 shrink-0 text-violet-600 dark:text-violet-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button className={`w-full rounded-xl py-3 px-4 text-sm font-bold transition-all ${
                plan.popular 
                ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-200 dark:shadow-none' 
                : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100'
              }`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}