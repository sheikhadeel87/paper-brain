import { Link } from 'react-router-dom'
import { BrandMark } from '../../components/BrandMark.jsx'
import { btnBase, btnPrimary } from '../../lib/uiClasses.js'

// const navLinkCls =
//   'text-sm font-medium text-zinc-600 transition hover:text-violet-700 dark:text-zinc-400 dark:hover:text-violet-300'

// export function LandingNav() {
//   return (
//     <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
//       <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
//         <Link
//           to="/"
//           className="flex min-w-0 items-center gap-2 text-zinc-900 no-underline dark:text-zinc-50"
//         >
//           <BrandMark className="h-9 w-9 shrink-0" />
//           <span className="truncate text-sm font-semibold sm:text-base">
//             Paper Brain
//           </span>
//         </Link>
//         <nav
//           className="order-3 flex w-full basis-full justify-center gap-4 overflow-x-auto py-1 text-center sm:order-none sm:w-auto sm:basis-auto sm:py-0 md:gap-8"
//           aria-label="Page sections"
//         >
//           <a className={navLinkCls} href="#features">
//             Features
//           </a>
//           <a className={navLinkCls} href="#how-it-works">
//             How it works
//           </a>
//           <a className={navLinkCls} href="#pricing">
//             Pricing
//           </a>
//           <a className={navLinkCls} href="#about">
//             About
//           </a>
//         </nav>
//         <div className="flex shrink-0 items-center gap-2">
//           <Link to="/login" className={`${btnBase} px-3 py-2 text-sm no-underline`}>
//             Log in
//           </Link>
//           <Link
//             to="/register"
//             className={`${btnPrimary} px-3 py-2 text-sm no-underline`}
//           >
//             Get started
//           </Link>
//         </div>
//       </div>
//     </header>
//   )
// }

const navLinkCls =
  'group relative py-1 text-sm font-medium text-zinc-600 transition-all hover:text-violet-700 hover:animate-glow-pulse dark:text-zinc-400 dark:hover:text-violet-300'

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2 text-zinc-900 no-underline dark:text-zinc-50"
        >
          <BrandMark className="h-9 w-9 shrink-0" />
          <span className="truncate text-sm font-semibold sm:text-base">
            Paper Brain
          </span>
        </Link>
        
        <nav
          className="order-3 flex w-full basis-full justify-center gap-4 py-1 text-center sm:order-none sm:w-auto sm:basis-auto sm:py-0 md:gap-8"
          aria-label="Page sections"
        >
          <a className={navLinkCls} href="#features">
            <span>Features</span>
            <span className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-violet-600 transition-all duration-300 group-hover:w-full dark:bg-violet-400"></span>
          </a>
          <a className={navLinkCls} href="#how-it-works">
            <span>How it works</span>
            <span className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-violet-600 transition-all duration-300 group-hover:w-full dark:bg-violet-400"></span>
          </a>
          <a className={navLinkCls} href="#pricing">
            <span>Pricing</span>
            <span className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-violet-600 transition-all duration-300 group-hover:w-full dark:bg-violet-400"></span>
          </a>
          <a className={navLinkCls} href="#about">
            <span>About</span>
            <span className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-violet-600 transition-all duration-300 group-hover:w-full dark:bg-violet-400"></span>
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link to="/login" className={`${btnBase} px-3 py-2 text-sm no-underline`}>
            Log in
          </Link>
          <Link
            to="/register"
            className={`${btnPrimary} px-3 py-2 text-sm no-underline`}
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}
