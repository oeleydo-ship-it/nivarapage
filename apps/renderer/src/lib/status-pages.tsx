export function PreviewUnavailable() {
  return (
    <main className="mx-auto flex min-h-full max-w-xl flex-col justify-center gap-3 px-6 py-24 text-center">
      <p className="text-sm font-medium tracking-wide text-[var(--color-muted)] uppercase">
        Preview unavailable
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        This preview link is invalid or has expired.
      </h1>
    </main>
  );
}

export function WebsiteNotFound() {
  return (
    <main className="mx-auto flex min-h-full max-w-xl flex-col justify-center gap-3 px-6 py-24 text-center">
      <p className="text-sm font-medium tracking-wide text-[var(--color-muted)] uppercase">
        Website Not Found
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        This domain is not connected to an active website.
      </h1>
    </main>
  );
}

export function PageMissing() {
  return (
    <main className="mx-auto flex min-h-full max-w-xl flex-col justify-center gap-3 px-6 py-24 text-center">
      <p className="text-sm font-medium tracking-wide text-[var(--color-muted)] uppercase">
        Page not found
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">This page is unavailable.</h1>
    </main>
  );
}

export function SiteUnavailable() {
  return (
    <main className="mx-auto flex min-h-full max-w-xl flex-col justify-center gap-3 px-6 py-24 text-center">
      <p className="text-sm font-medium tracking-wide text-[var(--color-muted)] uppercase">
        Unavailable
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">This website is currently unavailable.</h1>
    </main>
  );
}
