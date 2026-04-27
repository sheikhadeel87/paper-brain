import { aboutBlurb } from './content.js'

export function LandingAbout() {
  return (
    <section
      id="about"
      className="scroll-mt-20 border-b border-zinc-100 bg-white px-4 py-14 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6 sm:py-16"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-2xl">
          About Paper Brain
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
          {aboutBlurb}
        </p>
      </div>
    </section>
  )
}
