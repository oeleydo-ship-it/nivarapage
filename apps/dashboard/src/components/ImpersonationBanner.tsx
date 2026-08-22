import { getImpersonation, setImpersonation, setSession } from '../lib/api'
import { Button } from '../ui/primitives'

export function ImpersonationBanner() {
  const session = getImpersonation()
  if (!session) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-800 bg-amber-950/90 px-4 py-2.5 text-sm text-amber-100">
      <div>
        <span className="font-medium">Support impersonation</span>
        <span className="text-amber-200/80">
          {' '}
          — viewing as {session.targetName} ({session.targetEmail}). Signed in as admin {session.adminName}.
        </span>
      </div>
      <Button
        variant="outline"
        onClick={() => {
          setSession(session.adminToken, session.adminWorkspaceId)
          setImpersonation(null)
          window.location.assign('/admin?tab=users')
        }}
      >
        Exit to admin
      </Button>
    </div>
  )
}
