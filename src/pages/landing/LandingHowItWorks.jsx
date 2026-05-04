import { howItWorks } from './content.js'
import { Upload, ScanSearch, CheckCircle2 } from 'lucide-react';

export function LandingHowItWorks() {
  const steps = [
    {
      id: 1,
      name: 'Upload',
      description: 'Drop your receipt image. We handle the rest.',
      icon: Upload,
    },
    {
      id: 2,
      name: 'Review',
      description: 'Gemini AI extracts dates, totals, and even locations.',
      icon: ScanSearch,
    },
    {
      id: 3,
      name: 'Save',
      description: 'Confirm and link it to your official expense records.',
      icon: CheckCircle2,
    },
  ];
  return (
    // <section
    //   id="how-it-works"
    //   className="scroll-mt-20 border-b border-zinc-100 bg-white px-4 py-16 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6 sm:py-20"
    // >
    //   <div className="mx-auto max-w-6xl">
    //     <h2 className="text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
    //       How it works
    //     </h2>
    //     <p className="mx-auto mt-2 max-w-xl text-center text-sm text-zinc-600 dark:text-zinc-400">
    //       Three steps from receipt to saved expense.
    //     </p>
    //     <ol className="mt-12 grid gap-8 sm:grid-cols-3">
    //       {howItWorks.map((item) => (
    //         <li
    //           key={item.step}
    //           className="relative rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 text-left dark:border-zinc-800 dark:bg-zinc-900/40"
    //         >
    //           <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
    //             {item.step}
    //           </span>
    //           <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
    //             {item.title}
    //           </h3>
    //           <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
    //             {item.text}
    //           </p>
    //         </li>
    //       ))}
    //     </ol>
    //   </div>
    // </section>

<section 
id="how-it-works"
className="py-24 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
          Simple Process
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          How it works
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-8 text-zinc-600 dark:text-zinc-400 sm:text-base">
          Three steps from a messy paper receipt to a clean digital record.
        </p>

        <div className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 relative">
          {/* Subtle connecting line for Desktop */}
          <div className="hidden lg:block absolute top-12 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 -z-0" />

          {steps.map((step) => (
            <div key={step.id} className="relative group">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-800 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="h-10 w-10 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                </div>
                
                <div className="mt-8">
                  <h3 className="text-xl font-bold leading-7 text-zinc-900 dark:text-zinc-50">
                    <span className="text-violet-600/50 dark:text-violet-400/50 font-mono mr-2">0{step.id}.</span>
                    {step.name}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
