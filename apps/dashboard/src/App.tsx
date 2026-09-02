import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from './layouts/DashboardLayout'
import { AuthCallbackPage, ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from './pages/AuthPages'
import { BuilderPage } from './pages/BuilderPage'
import { MediaPage, TemplatesPage } from './pages/MiscPages'
import { TemplateFullPreviewPage } from './pages/TemplateFullPreviewPage'
import { ActivityPage } from './pages/ActivityPage'
import { AdminPage } from './pages/AdminPage'
import { BillingPage } from './pages/BillingPage'
import { SettingsPage } from './pages/SettingsPage'
import { TeamPage } from './pages/TeamPage'
import { FormsInboxPage, SiteFormsPage } from './pages/FormsPages'
import { OverviewPage } from './pages/OverviewPage'
import { DomainsPage, ThemePage } from './pages/SiteExtrasPages'
import { SiteSettingsPage } from './pages/SiteSettingsPage'
import { SiteSeoPage } from './pages/SeoPages'
import { NavigationPage } from './pages/NavigationPage'
import { CreateSitePage, SitesPage } from './pages/SitesPages'
import { ClientDetailPage, ClientsPage } from './pages/ClientsPages'
import { LivechatInboxPage } from './pages/LivechatPages'
import { LivechatSettingsPage } from './pages/LivechatSettingsPage'
import { SiteLivechatPage } from './pages/SiteLivechatPage'
import { SiteBackupsPage } from './pages/SiteBackupsPage'
import { BlogPage, BlogPostDetailPage } from './pages/BlogPages'
import { CreateFunnelPage, FunnelAnalyticsPage, FunnelBuilderPage, FunnelLeadsPage, FunnelsPage, FunnelSettingsPage, FunnelTemplatesPage } from './pages/FunnelPages'
import { FunnelStepEditorPage } from './pages/FunnelStepEditorPage'
import { getToken } from './lib/api'
import { featuresApi } from './lib/endpoints'
import { useQuery } from '@tanstack/react-query'
import SitePreviewPage from '@/pages/SitePreviewPage'

function RequireAuth({ children }: { children: ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />
  return children
}

function RequireFunnels({ children }: { children: ReactNode }) {
  const features = useQuery({ queryKey: ['features'], queryFn: featuresApi.get })
  if (features.isLoading) return null
  if (!features.data?.funnels) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Signed, noindex draft preview. Public in the routing sense: the
          signed token is the credential, so a client can open it without
          a dashboard session. */}
      <Route path="/preview" element={<SitePreviewPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route
        path="/sites/:id/builder"
        element={
          <RequireAuth>
            <BuilderPage />
          </RequireAuth>
        }
      />
      <Route
        path="/funnels/:id/steps/:stepId/editor"
        element={<RequireAuth><RequireFunnels><FunnelStepEditorPage /></RequireFunnels></RequireAuth>}
      />
      <Route
        path="/templates/:slug/preview/:pageSlug"
        element={
          <RequireAuth>
            <TemplateFullPreviewPage />
          </RequireAuth>
        }
      />
      <Route
        path="/templates/:slug/preview"
        element={
          <RequireAuth>
            <TemplateFullPreviewPage />
          </RequireAuth>
        }
      />
      <Route
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<OverviewPage />} />
        <Route path="/sites" element={<SitesPage />} />
        <Route path="/sites/new" element={<CreateSitePage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/clients/:id" element={<ClientDetailPage />} />
        <Route path="/livechat" element={<LivechatInboxPage />} />
        <Route path="/livechat/settings" element={<LivechatSettingsPage />} />
        <Route path="/livechat/:id" element={<LivechatInboxPage />} />
        <Route path="/sites/:id/domains" element={<DomainsPage />} />
        <Route path="/sites/:id/navigation" element={<NavigationPage />} />
        <Route path="/sites/:id/settings" element={<SiteSettingsPage />} />
        <Route path="/sites/:id/seo" element={<SiteSeoPage />} />
        <Route path="/sites/:id/theme" element={<ThemePage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/forms" element={<FormsInboxPage />} />
        <Route path="/sites/:id/forms" element={<SiteFormsPage />} />
        <Route path="/sites/:id/livechat" element={<SiteLivechatPage />} />
        <Route path="/sites/:id/backups" element={<SiteBackupsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogPostDetailPage />} />
        <Route path="/funnels" element={<RequireFunnels><FunnelsPage /></RequireFunnels>} />
        <Route path="/funnels/new" element={<RequireFunnels><CreateFunnelPage /></RequireFunnels>} />
        <Route path="/funnels/leads" element={<RequireFunnels><FunnelLeadsPage /></RequireFunnels>} />
        <Route path="/funnels/analytics" element={<RequireFunnels><FunnelAnalyticsPage /></RequireFunnels>} />
        <Route path="/funnels/templates" element={<RequireFunnels><FunnelTemplatesPage /></RequireFunnels>} />
        <Route path="/funnels/settings" element={<RequireFunnels><FunnelSettingsPage /></RequireFunnels>} />
        <Route path="/funnels/:id" element={<RequireFunnels><FunnelBuilderPage /></RequireFunnels>} />
        <Route path="/funnels/:id/analytics" element={<RequireFunnels><FunnelAnalyticsPage /></RequireFunnels>} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Routes>
  )
}
