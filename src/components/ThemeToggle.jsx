import { Moon, Monitor, Sun } from 'lucide-react'
import { useTheme } from '../context/useTheme.js'

export function ThemeToggle({ compact = false }) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const label =
    theme === 'system'
      ? `System (${isDark ? 'dark' : 'light'})`
      : isDark
        ? 'Dark'
        : 'Light'

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
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-950/70">
      <div className="grid grid-cols-3 gap-1" role="group" aria-label="Theme">
        {[
          { id: 'light', label: 'Light', icon: Sun },
          { id: 'dark', label: 'Dark', icon: Moon },
          { id: 'system', label: 'Auto', icon: Monitor },
        ].map((item) => {
          const Icon = item.icon
          const active = theme === item.id
          return (
            <button
              key={item.id}
              type="button"
              className={
                active
                  ? 'inline-flex items-center justify-center gap-1 rounded-lg bg-white px-2 py-1.5 text-xs font-semibold text-violet-700 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-violet-200 dark:ring-zinc-700'
                  : 'inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-white/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100'
              }
              onClick={() => setTheme(item.id)}
              aria-pressed={active}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-1 px-1 text-[10px] text-zinc-500 dark:text-zinc-500">
        Current: {label}
      </p>
    </div>
  )
}
