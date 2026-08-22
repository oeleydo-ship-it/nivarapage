import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@uidesired/utilities'

export function LivechatNav() {
  const { pathname } = useLocation()
  const inboxActive = pathname === '/livechat' || /^\/livechat\/\d+/.test(pathname)
  const settingsActive = pathname.startsWith('/livechat/settings')

  return (
    <nav className="mb-6 flex flex-wrap gap-1 border-b border-zinc-800" aria-label="Livechat">
      <NavLink
        to="/livechat"
        className={cn(
          '-mb-px border-b-2 px-3 py-2.5 text-sm transition',
          inboxActive ? 'border-blue-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-200',
        )}
      >
        Inbox
      </NavLink>
      <NavLink
        to="/livechat/settings"
        className={cn(
          '-mb-px border-b-2 px-3 py-2.5 text-sm transition',
          settingsActive ? 'border-blue-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-200',
        )}
      >
        Settings
      </NavLink>
    </nav>
  )
}
