import { Link } from 'react-router-dom'
import { hero } from './content.js'
import { btnBase, btnPrimary } from '../../lib/uiClasses.js'

function HeroVisual() {
  return (
    <div
      className="relative mx-auto max-w-lg rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-zinc-50 p-6 shadow-lg dark:border-violet-900/40 dark:from-violet-950/40 dark:via-zinc-900 dark:to-zinc-950"
      aria-hidden
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="h-2 w-24 rounded-full bg-violet-200 dark:bg-violet-800" />
        <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/60" />
      </div>
      <div className="space-y-3 rounded-xl border border-zinc-200/80 bg-white/90 p-4 dark:border-zinc-700 dark:bg-zinc-900/80">
        <div className="flex gap-2">
          <div className="h-16 w-12 shrink-0 rounded-lg bg-violet-100 dark:bg-violet-900/50" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-2 w-full max-w-[12rem] rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-2 w-1/2 rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-8 w-full rounded-md bg-emerald-100/80 dark:bg-emerald-950/40" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="h-14 rounded-lg bg-violet-100/90 dark:bg-violet-950/50" />
          <div className="h-14 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/40" />
          <div className="h-14 rounded-lg bg-sky-100/80 dark:bg-sky-950/40" />
        </div>
      </div>
      <p className="mt-4 text-center text-xs font-medium text-violet-700 dark:text-violet-300">
        Receipt → review → dashboard
      </p>
    </div>
  )
}

export function LandingHero() {
  return (
    <section className="border-b border-zinc-100 bg-white px-4 py-14 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="text-left">
          <p className="mb-4 inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-800 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-200">
            {hero.badge}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl lg:text-5xl">
            {hero.titleLead}{' '}
            <span className="text-violet-600 dark:text-violet-400">
              {hero.titleAccent}
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
            {hero.subtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/login"
              className={`${btnPrimary} inline-flex justify-center px-6 py-3 text-base no-underline`}
            >
              Log in
            </Link>
            <Link
              to="/register"
              className={`${btnBase} inline-flex justify-center border-violet-300 px-6 py-3 text-base text-violet-800 no-underline hover:bg-violet-50 dark:border-violet-700 dark:text-violet-200 dark:hover:bg-violet-950/40`}
            >
              Create account
            </Link>
          </div>
          <p className="mt-6 text-center text-sm text-zinc-600 sm:text-left dark:text-zinc-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-violet-600 underline-offset-2 hover:underline dark:text-violet-400"
            >
              Log in
            </Link>
          </p>
        </div>
        <HeroVisual />
      </div>
    </section>
  )
}
