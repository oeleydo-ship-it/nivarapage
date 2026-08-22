import { Moon, Sun } from 'lucide-react'
import { cn } from '@uidesired/utilities'
import { useThemeStore } from '../stores/themeStore'

/** Switches the dashboard between the dark and light surface themes. */
export function ThemeToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const light = theme === 'light'
  const label = light ? 'Switch to dark background' : 'Switch to light background'

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        title={label}
        aria-label={label}
        className={cn('rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white', className)}
      >
        {light ? <Moon size={15} /> : <Sun size={15} />}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={light}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white',
        className,
      )}
    >
      {light ? <Moon size={16} /> : <Sun size={16} />}
      {light ? 'Dark background' : 'Light background'}
    </button>
  )
}
