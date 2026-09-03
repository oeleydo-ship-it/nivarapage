import type { User } from '@uidesired/types'
import { PlatformBrand } from '../components/PlatformBrand'
import { useBranding } from '../lib/useBranding'
import { useQuery } from '@tanstack/react-query'
import {
  CreditCard,
  FileText,
  FolderOpen,
  History,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Newspaper,
  Settings,
  ShoppingBag,
  Shield,
  Users,
  Globe,
  Briefcase,
  Workflow,
  X,
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getToken, getWorkspaceId, setSession } from '../lib/api'
import { authApi, logoutAndClear } from '../lib/auth'
import { featuresApi, workspacesApi } from '../lib/endpoints'
import { ThemeToggle } from '../components/ThemeToggle'
import { UpgradePrompt } from '../components/UpgradePrompt'
import { ImpersonationBanner } from '../components/ImpersonationBanner'
import { useEffect, useState } from 'react'
import { cn } from '@uidesired/utilities'

const nav: Array<{ to: string; label: string; icon: typeof LayoutDashboard; feature?: 'funnels' }> = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/sites', label: 'Websites', icon: Globe },
  { to: '/clients', label: 'Clients', icon: Briefcase },
  { to: '/livechat', label: 'Livechat', icon: MessageCircle },
  { to: '/funnels', label: 'Funnels', icon: Workflow, feature: 'funnels' },
  { to: '/templates', label: 'Templates', icon: FolderOpen },
  { to: '/media', label: 'Media', icon: ImageIcon },
  { to: '/forms', label: 'Forms', icon: FileText },
  { to: '/products', label: 'Products', icon: ShoppingBag },
  { to: '/blog', label: 'Blog', icon: Newspaper },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/activity', label: 'Activity', icon: History },
  { to: '/billing', label: 'Billing', icon: CreditCard },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function SidebarNav({
  user,
  features,
  onNavigate,
}: {
  user?: User
  features?: { funnels?: boolean }
  onNavigate?: () => void
}) {
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-2">
      {nav
        .filter((item) => !item.feature || features?.[item.feature as 'funnels'])
        .map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm sm:py-2',
                isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
              )
            }
          >
            <item.icon size={16} className="shrink-0" />
            {item.label}
          </NavLink>
        ))}
      {user?.is_super_admin ? (
        <NavLink
          to="/admin"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm sm:py-2',
              isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
            )
          }
        >
          <Shield size={16} className="shrink-0" />
          Admin
        </NavLink>
      ) : null}
    </nav>
  )
}

export function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = getToken()
  const [mobileOpen, setMobileOpen] = useState(false)
  const userQuery = useQuery({
    queryKey: ['me'],
    queryFn: authApi.user,
    enabled: Boolean(token),
  })
  const workspaces = useQuery({
    queryKey: ['workspaces'],
    queryFn: workspacesApi.list,
    enabled: Boolean(token),
  })
  const features = useQuery({ queryKey: ['features'], queryFn: featuresApi.get, enabled: Boolean(token) })

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token, navigate])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  const user = userQuery.data as User | undefined
  const currentId = getWorkspaceId()
  const workspaceName = (workspaces.data || []).find((w) => String(w.id) === String(currentId))?.name
  const brandName = useBranding().data?.platform_name || 'My Website Builder'

  const workspaceSelect = (
    <select
      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-2 text-sm"
      value={currentId ?? ''}
      onChange={async (e) => {
        const id = Number(e.target.value)
        await workspacesApi.switch(id)
        setSession(token!, id)
        window.location.reload()
      }}
    >
      {(workspaces.data || []).map((w) => (
        <option key={w.id} value={w.id}>
          {w.name}
        </option>
      ))}
    </select>
  )

  const signOut = (
    <button
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-400 hover:bg-zinc-900"
      onClick={async () => {
        await logoutAndClear()
        navigate('/login')
      }}
    >
      <LogOut size={16} />
      Sign out
    </button>
  )

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-200">
      <ImpersonationBanner />
      <div className="flex min-h-0 flex-1">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 lg:flex">
        <div className="px-5 py-5">
          <PlatformBrand />
        </div>
        <div className="px-3 pb-3">{workspaceSelect}</div>
        <SidebarNav user={user} features={features.data} />
        <ThemeToggle className="mx-3" />
        <div className="m-3">{signOut}</div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col border-r border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="flex items-start justify-between gap-3 px-5 py-4">
              <PlatformBrand />
              <button
                type="button"
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-3 pb-3">{workspaceSelect}</div>
            <SidebarNav user={user} features={features.data} onNavigate={() => setMobileOpen(false)} />
            <ThemeToggle className="mx-3" />
            <div className="m-3">{signOut}</div>
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-zinc-800 bg-zinc-950/95 px-3 py-2.5 backdrop-blur lg:hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-900 hover:text-white"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-white">{brandName}</div>
            {workspaceName ? <div className="truncate text-xs text-zinc-500">{workspaceName}</div> : null}
          </div>
          <ThemeToggle compact />
        </header>

        <main className="min-w-0 flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-none px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-10">
            <Outlet />
          </div>
        </main>
      </div>
      </div>
      <UpgradePrompt />
    </div>
  )
}
