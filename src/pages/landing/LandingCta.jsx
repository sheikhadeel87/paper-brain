// import { Link } from 'react-router-dom'
// import { btnBase, btnPrimary } from '../../lib/uiClasses.js'

// export function LandingCta() {
//   return (
//     <section className="bg-zinc-100 px-4 py-16 dark:bg-zinc-900 sm:px-6 sm:py-20">
//       <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-2xl border border-zinc-200 bg-white px-6 py-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-[1fr_auto] md:gap-12 md:px-10 md:py-12">
//         <div className="text-left">
//           <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
//             Start your journey
//           </p>
//           <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
//             Ready to take control of your receipts?
//           </h2>
//           <p className="mt-3 max-w-xl text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
//             Create an account to scan receipts, review AI suggestions, and keep expenses in one dashboard.
//           </p>
//         </div>
//         <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[12rem]">
//           <Link
//             to="/register"
//             className={`${btnPrimary} justify-center py-3 text-center no-underline`}
//           >
//             Create account
//           </Link>
//           <Link
//             to="/login"
//             className={`${btnBase} justify-center py-3 text-center no-underline`}
//           >
//             Log in
//           </Link>
//           <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
//             No credit card required
//           </p>
//         </div>
//       </div>
//     </section>
//   )
// }

import { Link } from 'react-router-dom'
import { btnBase, btnPrimary } from '../../lib/uiClasses.js'

export function LandingCta() {
  return (
    <section className="bg-zinc-100 px-4 py-16 dark:bg-zinc-900 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-[2rem] border border-zinc-200 bg-white px-6 py-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-[1fr_auto] md:gap-20 md:px-14 md:py-16">
        
        {/* Left: Content Area */}
        <div className="text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Start your journey
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl ">
            Ready to take control of your receipts?
          </h2>
          <p className="mt-4 max-w-xl text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
            Create an account to scan receipts, review AI suggestions, and keep expenses in one dashboard.
          </p>
        </div>

        {/* Right: Action Area */}
        <div className="flex w-full flex-col gap-4 md:w-auto md:min-w-[200px]">
          <Link
            to="/register"
            className={`${btnPrimary} flex h-12 items-center justify-center rounded-xl px-8 text-sm font-bold no-underline transition-transform active:scale-95`}
          >
            Create account
          </Link>
          <Link
            to="/login"
            className={`${btnBase} flex h-12 items-center justify-center rounded-xl px-8 text-sm font-bold no-underline transition-transform active:scale-95`}
          >
            Log in
          </Link>
          
          {/* Enhanced Micro-copy */}
          <div className="mt-1 flex items-center justify-center gap-1.5 opacity-80">
            <div className="h-1 w-1 rounded-full bg-emerald-500" />
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              No credit card required
            </p>
          </div>
        </div>
        
      </div>
    </section>
  )
}