import { useBranding } from '../lib/useBranding'

/**
 * Renders the uploaded logo when the admin has set one, falling back to the
 * wordmark so the sidebar is never empty while the request is in flight.
 */
export function PlatformBrand({ onDark = true, className }: { onDark?: boolean; className?: string }) {
  const { data } = useBranding()
  const name = data?.platform_name || 'UiDesired'
  const tagline = data?.platform_tagline ?? 'Website builder'
  const logo = (onDark ? data?.logo_dark_url || data?.logo_url : data?.logo_url) || null

  if (logo) {
    return (
      <div className={className}>
        <img src={logo} alt={name} className="max-h-9 max-w-[10rem] object-contain object-left" />
        {tagline ? <div className="mt-1 text-xs text-zinc-500">{tagline}</div> : null}
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="text-lg font-semibold tracking-tight text-white">{name}</div>
      {tagline ? <div className="text-xs text-zinc-500">{tagline}</div> : null}
    </div>
  )
}
