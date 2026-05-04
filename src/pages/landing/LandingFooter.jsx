  // import { Link } from 'react-router-dom'

  // export function LandingFooter() {
  //   return (
  //     <footer className="border-t border-zinc-200 bg-white px-4 py-10 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6">
  //       <div className="mx-auto max-w-6xl text-center">
  //         <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
  //           Trusted by individuals and growing teams
  //         </p>
  //         <p className="mx-auto mt-4 max-w-lg text-sm text-zinc-600 dark:text-zinc-400">
  //           Built for clarity: one workflow from upload to saved expense, with filters and export when you need them.
  //         </p>
  //         <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
  //           <Link
  //             to="/login"
  //             className="font-medium text-violet-600 hover:text-violet-800 dark:text-violet-400"
  //           >
  //             Log in
  //           </Link>
  //           <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>
  //             ·
  //           </span>
  //           <Link
  //             to="/register"
  //             className="font-medium text-violet-600 hover:text-violet-800 dark:text-violet-400"
  //           >
  //             Register
  //           </Link>
  //           <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>
  //             ·
  //           </span>
  //           <a className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400" href="#features">
  //             Features
  //           </a>
  //         </div>
  //         <p className="mt-8 text-xs text-zinc-400 dark:text-zinc-500">
  //           © {new Date().getFullYear()} Paper Brain. All rights reserved.
  //         </p>
  //       </div>
  //     </footer>
  //   )
  // }

  import { Link } from 'react-router-dom'
  import { BrandMark } from '../../components/BrandMark.jsx'

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-100 bg-white px-6  dark:border-zinc-800 dark:bg-zinc-950 pt-16 pb-8 sm:pt-20 sm:pb-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-8">
          
          {/* Column 1: Brand & Mission */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <BrandMark className="h-8 w-8 shrink-0 text-violet-600" />
              <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Papper Brain
              </span>
            </div>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Built for clarity: one workflow from upload to saved expense, with filters and export when you need them.
            </p>
          </div>
          {/* Column 2: Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-50">
              Product
            </h4>
            <ul className="mt-6 space-y-4 text-sm">
              <li>
                <a href="#features" className="text-zinc-500 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-zinc-500 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Account */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-50">
              Account
            </h4>
            <ul className="mt-6 space-y-4 text-sm">
              <li>
                <Link to="/login" className="text-zinc-500 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400">
                  Log in
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-zinc-500 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between border-t border-zinc-100 pt-8 dark:border-zinc-800 sm:flex-row">
          <p className="text-xs text-zinc-600 dark:text-zinc-500">
            © {currentYear} Papper Brain. All rights reserved.
          </p>
          <div className="mt-4 flex space-x-6 sm:mt-0">
             <span className="text-[10px] font-medium uppercase tracking-tighter text-zinc-600 dark:text-zinc-500">
               Trusted by individuals and growing teams
             </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
