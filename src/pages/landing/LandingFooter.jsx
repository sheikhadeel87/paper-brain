import { Link } from 'react-router-dom'

export function LandingFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white px-4 py-10 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Trusted by individuals and growing teams
        </p>
        <p className="mx-auto mt-4 max-w-lg text-sm text-zinc-600 dark:text-zinc-400">
          Built for clarity: one workflow from upload to saved expense, with filters and export when you need them.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link
            to="/login"
            className="font-medium text-violet-600 hover:text-violet-800 dark:text-violet-400"
          >
            Log in
          </Link>
          <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>
            ·
          </span>
          <Link
            to="/register"
            className="font-medium text-violet-600 hover:text-violet-800 dark:text-violet-400"
          >
            Register
          </Link>
          <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>
            ·
          </span>
          <a className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400" href="#features">
            Features
          </a>
        </div>
        <p className="mt-8 text-xs text-zinc-400 dark:text-zinc-500">
          © {new Date().getFullYear()} Paper Brain. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
