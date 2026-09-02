import { useEffect, useId, useMemo, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi, persistAuth } from '../lib/auth'
import { http, setSession } from '../lib/api'
import { useBranding } from '../lib/useBranding'
import type { Workspace } from '@uidesired/types'

/*
 * The auth screens are white in both themes. `.auth-shell` marks this subtree
 * so it renders as a flat, gradient-free light page regardless of the app's
 * active theme — colours below are literal, not theme tokens.
 */

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7 12.9 19.6C14.7 15.1 19 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 35.3 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.1 5.5l.1.1 6.3 5.2C39.1 37.1 44 32 44 24c0-1.3-.1-2.5-.4-3.5z" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 1.75a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5zM9.25 6a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-1.5 0V6zm.75 8.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M1.8 10S4.9 4.5 10 4.5 18.2 10 18.2 10 15.1 15.5 10 15.5 1.8 10 1.8 10z" />
      <circle cx="10" cy="10" r="2.4" />
    </svg>
  ) : (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 3l14 14M8.2 8.3A2.4 2.4 0 0 0 10 12.4c.7 0 1.3-.3 1.7-.7" />
      <path d="M6.1 5.6C7.3 4.9 8.6 4.5 10 4.5c5.1 0 8.2 5.5 8.2 5.5a15 15 0 0 1-3 3.6M4.2 7A15 15 0 0 0 1.8 10S4.9 15.5 10 15.5c.9 0 1.7-.2 2.5-.5" />
    </svg>
  )
}

/** Inline error banner. Kept as plain text content so tests can find the message. */
function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
    >
      <AlertIcon />
      <span>{children}</span>
    </div>
  )
}

function Field({
  label,
  hint,
  action,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: ReactNode; action?: ReactNode }) {
  const id = useId()
  const isPassword = props.type === 'password'
  const [revealed, setRevealed] = useState(false)

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          {label}
        </label>
        {action}
      </div>
      <div className="relative">
        <input
          {...props}
          id={id}
          type={isPassword && revealed ? 'text' : props.type}
          className={[
            'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900',
            'placeholder:text-slate-400 outline-none transition',
            'hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10',
            isPassword ? 'pr-11' : '',
          ].join(' ')}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-slate-600"
          >
            <EyeIcon open={revealed} />
          </button>
        ) : null}
      </div>
      {hint ? <div className="mt-1.5 text-xs text-slate-500">{hint}</div> : null}
    </div>
  )
}

function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/25 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <Spinner /> : null}
      {children}
    </button>
  )
}

const HIGHLIGHTS = [
  'Visual page builder with polished templates',
  'Publish to your own domain in minutes',
]

function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}) {
  const { data } = useBranding()
  const logo = data?.logo_url || data?.logo_dark_url || null
  const brand = data?.platform_name || 'My Website Builder'
  const tagline = data?.platform_tagline || 'Build beautiful websites without the busywork.'

  const wordmark = (size: 'sm' | 'lg') =>
    logo ? (
      <img
        src={logo}
        alt={brand}
        className={size === 'lg' ? 'max-h-9 max-w-[11rem] object-contain object-left' : 'max-h-7 max-w-[9rem] object-contain object-left'}
      />
    ) : (
      <span
        className={`font-[Fraunces,Georgia,serif] font-semibold tracking-tight text-slate-900 ${
          size === 'lg' ? 'text-3xl' : 'text-xl'
        }`}
      >
        {brand}
      </span>
    )

  return (
    <div className="auth-shell relative min-h-screen bg-white font-[Manrope,system-ui,sans-serif] text-slate-700">
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 sm:px-8 lg:px-10">
        {/* Mobile / tablet header — the storytelling column is desktop-only. */}
        <header className="flex items-center justify-between py-6 lg:hidden">
          <Link to="/login" className="inline-flex">
            {wordmark('sm')}
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-12 pb-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16 lg:pb-0">
          <section className="hidden min-w-0 flex-col justify-center border-r border-slate-100 py-14 pr-4 lg:flex">
            <Link to="/login" className="inline-flex w-fit">
              {wordmark('lg')}
            </Link>

            <p className="mt-14 text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">Website builder</p>
            <h2 className="mt-4 font-[Fraunces,Georgia,serif] text-[2.75rem] font-semibold leading-[1.06] tracking-tight text-slate-900 xl:text-[3.25rem]">
              Design once.
              <br />
              Publish everywhere.
            </h2>
            <p className="mt-5 max-w-md text-[0.975rem] leading-relaxed text-slate-500">{tagline}</p>

            <ul className="mt-9 space-y-3.5">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-16 text-xs text-slate-400">
              © {new Date().getFullYear()} {brand}
            </p>
          </section>

          <main className="min-w-0">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,.15)] sm:p-8">
              <h1 className="font-[Fraunces,Georgia,serif] text-[1.75rem] font-semibold leading-tight tracking-tight text-slate-900 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{subtitle}</p>
              <div className="mt-7">{children}</div>
            </div>
            {footer ? <div className="mt-5 text-center text-sm text-slate-500">{footer}</div> : null}
            <p className="mt-8 text-center text-xs text-slate-400 lg:hidden">
              © {new Date().getFullYear()} {brand}
            </p>
          </main>
        </div>
      </div>
    </div>
  )
}

function Divider({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-slate-400">
      <div className="h-px flex-1 bg-slate-200" />
      <span>{children}</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  )
}

/**
 * Renders the Google button only when the super admin has Google sign-in
 * configured and ready. `requiresSignup` hides it on the register screen when
 * Admin has turned off account creation through Google.
 */
function GoogleAuthBlock({ label, requiresSignup = false }: { label: string; requiresSignup?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<{ enabled: boolean; allow_registration?: boolean } | null>(null)

  useEffect(() => {
    void authApi
      .googleStatus()
      .then(setStatus)
      .catch(() => setStatus({ enabled: false }))
  }, [])

  if (status === null) {
    return <div className="mb-6 h-[46px] animate-pulse rounded-xl bg-slate-100" aria-hidden />
  }
  if (!status.enabled) return null
  if (requiresSignup && status.allow_registration === false) return null

  return (
    <>
      <div className="space-y-2">
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            setError('')
            setLoading(true)
            try {
              const { url } = await authApi.googleRedirect()
              window.location.assign(url)
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Google sign-in failed')
              setLoading(false)
            }
          }}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Spinner /> : <GoogleIcon />}
          {loading ? 'Redirecting…' : label}
        </button>
        {error ? <ErrorNote>{error}</ErrorNote> : null}
      </div>
      <Divider>or continue with email</Divider>
    </>
  )
}

/** Cheap, honest password meter — length and character variety only. */
function passwordScore(value: string) {
  if (!value) return 0
  let score = 0
  if (value.length >= 8) score += 1
  if (value.length >= 12) score += 1
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1
  if (/\d/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1
  return Math.min(score, 4)
}

function PasswordMeter({ value }: { value: string }) {
  const score = useMemo(() => passwordScore(value), [value])
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
  const tones = ['bg-slate-300', 'bg-red-400', 'bg-amber-400', 'bg-teal-500', 'bg-emerald-500']

  if (!value) return <>At least 8 characters.</>

  return (
    <span className="flex items-center gap-2">
      <span className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors ${index < score ? tones[score] : 'bg-slate-200'}`}
          />
        ))}
      </span>
      <span className="w-16 shrink-0 text-right">{labels[score]}</span>
    </span>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(params.get('google_error') || '')
  const [pending, setPending] = useState(false)

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your workspace and keep building."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-semibold text-teal-600 transition hover:text-teal-700">
            Create an account
          </Link>
        </>
      }
    >
      <GoogleAuthBlock label="Continue with Google" />
      <form
        className="space-y-4"
        onSubmit={async (e: FormEvent) => {
          e.preventDefault()
          setError('')
          setPending(true)
          try {
            const payload = await authApi.login({ email, password })
            persistAuth(payload)
            navigate('/')
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to sign in')
          } finally {
            setPending(false)
          }
        }}
      >
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          action={
            <Link to="/forgot-password" className="text-xs font-medium text-teal-600 transition hover:text-teal-700">
              Forgot password?
            </Link>
          }
        />
        {error ? <ErrorNote>{error}</ErrorNote> : null}
        <SubmitButton pending={pending}>{pending ? 'Signing in…' : 'Continue'}</SubmitButton>
      </form>
    </AuthShell>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password_confirmation, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const mismatch = password_confirmation !== '' && password !== password_confirmation

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start a workspace and launch your first site — no credit card needed."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-teal-600 transition hover:text-teal-700">
            Sign in
          </Link>
        </>
      }
    >
      <GoogleAuthBlock label="Sign up with Google" requiresSignup />
      <form
        className="space-y-4"
        onSubmit={async (e: FormEvent) => {
          e.preventDefault()
          if (mismatch) {
            setError('Those passwords do not match.')
            return
          }
          setError('')
          setPending(true)
          try {
            const payload = await authApi.register({ name, email, password, password_confirmation })
            persistAuth(payload)
            navigate('/')
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to register')
          } finally {
            setPending(false)
          }
        }}
      >
        <Field
          label="Full name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          hint={<PasswordMeter value={password} />}
        />
        <Field
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password_confirmation}
          onChange={(e) => setConfirm(e.target.value)}
          required
          hint={mismatch ? <span className="text-red-300">Passwords do not match.</span> : undefined}
        />
        {error ? <ErrorNote>{error}</ErrorNote> : null}
        <SubmitButton pending={pending}>{pending ? 'Creating…' : 'Create account'}</SubmitButton>
        <p className="pt-1 text-center text-xs leading-relaxed text-slate-500">
          By creating an account you agree to the terms of service and privacy policy.
        </p>
      </form>
    </AuthShell>
  )
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  return (
    <AuthShell
      title="Reset your account"
      subtitle="We’ll email you a secure link to choose a new password."
      footer={
        done ? null : (
          <>
            Remembered it?{' '}
            <Link to="/login" className="font-semibold text-teal-600 transition hover:text-teal-700">
              Sign in
            </Link>
          </>
        )
      }
    >
      {done ? (
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2.5 text-sm text-teal-800">
            <CheckIcon />
            <span>If that email exists, we sent a reset link. Check your inbox and spam folder.</span>
          </div>
          <Link to="/login" className="inline-flex text-sm font-semibold text-teal-600 transition hover:text-teal-700">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e: FormEvent) => {
            e.preventDefault()
            setError('')
            setPending(true)
            try {
              await authApi.forgotPassword(email)
              setDone(true)
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Unable to send reset link')
            } finally {
              setPending(false)
            }
          }}
        >
          <Field
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error ? <ErrorNote>{error}</ErrorNote> : null}
          <SubmitButton pending={pending}>{pending ? 'Sending…' : 'Send reset link'}</SubmitButton>
        </form>
      )}
    </AuthShell>
  )
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState(params.get('email') || '')
  const [password, setPassword] = useState('')
  const [password_confirmation, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const token = params.get('token') || ''

  const mismatch = password_confirmation !== '' && password !== password_confirmation

  return (
    <AuthShell title="Choose a new password" subtitle="Enter a strong password to regain access to your account.">
      {!token ? (
        <ErrorNote>
          This reset link is missing a token.{' '}
          <Link to="/forgot-password" className="font-semibold text-teal-600 underline-offset-2 hover:underline">
            Request a new one
          </Link>
          .
        </ErrorNote>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e: FormEvent) => {
            e.preventDefault()
            if (mismatch) {
              setError('Those passwords do not match.')
              return
            }
            setError('')
            setPending(true)
            try {
              await authApi.resetPassword({ token, email, password, password_confirmation })
              navigate('/login')
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Unable to reset password')
            } finally {
              setPending(false)
            }
          }}
        >
          <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Field
            label="New password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            hint={<PasswordMeter value={password} />}
          />
          <Field
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password_confirmation}
            onChange={(e) => setConfirm(e.target.value)}
            required
            hint={mismatch ? <span className="text-red-300">Passwords do not match.</span> : undefined}
          />
          {error ? <ErrorNote>{error}</ErrorNote> : null}
          <SubmitButton pending={pending}>{pending ? 'Saving…' : 'Update password'}</SubmitButton>
        </form>
      )}
    </AuthShell>
  )
}

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      setError('Missing sign-in token from Google.')
      return
    }

    setSession(token)
    void (async () => {
      try {
        const [user, workspaces] = await Promise.all([authApi.user(), http.get<Workspace[]>('/workspaces')])
        persistAuth({ token, user, workspaces })
        navigate('/', { replace: true })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Google sign-in failed')
      }
    })()
  }, [navigate, params])

  return (
    <AuthShell title="Finishing sign-in" subtitle="Connecting your Google account…">
      {error ? (
        <div className="space-y-3">
          <ErrorNote>{error}</ErrorNote>
          <Link to="/login" className="inline-flex text-sm font-semibold text-teal-600 transition hover:text-teal-700">
            Back to sign in
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Spinner />
          Please wait a moment.
        </div>
      )}
    </AuthShell>
  )
}
