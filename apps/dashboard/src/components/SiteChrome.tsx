import { NavLink, useParams } from 'react-router-dom'
import { cn } from '@uidesired/utilities'

const TABS = [
  { suffix: 'settings', label: 'General' },
  { suffix: 'seo', label: 'SEO' },
  { suffix: 'theme', label: 'Theme' },
  { suffix: 'navigation', label: 'Navigation' },
  { suffix: 'domains', label: 'Domains' },
  { suffix: 'forms', label: 'Forms' },
  { suffix: 'livechat', label: 'Livechat' },
  { suffix: 'backups', label: 'Backups' },
] as const

export function SiteSubnav({ siteId }: { siteId?: string }) {
  const { id } = useParams()
  const sid = siteId || id
  if (!sid) return null

  return (
    <nav className="mb-6 flex flex-wrap gap-1 border-b border-zinc-800" aria-label="Site settings">
      {TABS.map((tab) => (
        <NavLink
          key={tab.suffix}
          to={`/sites/${sid}/${tab.suffix}`}
          className={({ isActive }) =>
            cn(
              '-mb-px border-b-2 px-3 py-2.5 text-sm transition',
              isActive ? 'border-blue-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-200',
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
