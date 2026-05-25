import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/useTheme.js'

export function ThemeToggle({ compact = false }) {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const label = isDark ? 'Dark' : 'Light'

  if (compact) {
    return (
      <button
        type="button"
        className="inline-flex rounded-lg p-2 text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={label}
      >
        {isDark ? (
          <Sun className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Moon className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    )
  }

  return (
    <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-100 p-1 shadow-inner dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="grid grid-cols-2 gap-1" role="group" aria-label="Theme">
        {[
          { id: 'light', label: 'Switch to light mode', icon: Sun },
          { id: 'dark', label: 'Switch to dark mode', icon: Moon },
        ].map((item) => {
          const Icon = item.icon
          const active = resolvedTheme === item.id
          return (
            <button
              key={item.id}
              type="button"
              className={
                active
                  ? 'inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-violet-700 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-violet-200 dark:ring-zinc-700'
                  : 'inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition hover:bg-white/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100'
              }
              onClick={() => setTheme(item.id)}
              aria-pressed={active}
              aria-label={item.label}
              title={item.label}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
