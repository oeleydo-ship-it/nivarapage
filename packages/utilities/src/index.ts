import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

export function normalizeHostname(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./, '')
}

export function debounce<T extends (...args: never[]) => void>(fn: T, wait: number): T {
  let timer: ReturnType<typeof setTimeout> | undefined
  const wrapped = ((...args: never[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }) as T
  return wrapped
}

export function createId(prefix = 'sec'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}
