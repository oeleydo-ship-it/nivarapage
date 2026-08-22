import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { cn } from '@uidesired/utilities'

export function Button({
  className,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' | 'outline' }) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white',
    ghost: 'bg-transparent hover:bg-zinc-800 text-zinc-200',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    outline: 'border border-zinc-700 hover:bg-zinc-800 text-zinc-100',
  }
  return (
    <button
      className={cn('inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium disabled:opacity-50', variants[variant], className)}
      {...props}
    />
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500',
        props.className,
      )}
    />
  )
}

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <label className={cn('mb-1 block text-xs font-medium text-zinc-400', className)}>{children}</label>
}

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <div className={cn('rounded-xl border border-zinc-800 bg-zinc-900/70', padded && 'p-5', className)}>
      {children}
    </div>
  )
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-zinc-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500',
        className,
      )}
    />
  )
}

const badgeTones = {
  neutral: 'border-zinc-700 bg-zinc-800/60 text-zinc-300',
  success: 'border-emerald-800 bg-emerald-950/60 text-emerald-300',
  warning: 'border-amber-800 bg-amber-950/60 text-amber-300',
  danger: 'border-red-900 bg-red-950/60 text-red-300',
  info: 'border-blue-900 bg-blue-950/60 text-blue-300',
}

export type BadgeTone = keyof typeof badgeTones

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', badgeTones[tone], className)}>
      {children}
    </span>
  )
}

export function EmptyState({
  title,
  description,
  icon,
  children,
}: {
  title: string
  description?: string
  icon?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="py-10 text-center">
      {icon ? <div className="mb-4 flex justify-center">{icon}</div> : null}
      <div className="text-sm font-medium text-zinc-300">{title}</div>
      {description ? <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">{description}</p> : null}
      {children ? <div className="mt-4 flex justify-center">{children}</div> : null}
    </div>
  )
}

export function DataTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-zinc-500">
          <tr className="border-b border-zinc-800">
            {headers.map((header) => (
              <th key={header} className="whitespace-nowrap py-2 pr-4 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/70">{children}</tbody>
      </table>
    </div>
  )
}
