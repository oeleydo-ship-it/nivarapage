import type { EditPath } from '@uidesired/blocks'

/** Writes `value` into a nested prop path, cloning only the containers it touches. */
export function setAtPath(root: Record<string, unknown>, path: EditPath, value: unknown): Record<string, unknown> {
  if (!path.length) return root
  const [head, ...rest] = path
  const clone: Record<string, unknown> | unknown[] = Array.isArray(root) ? [...(root as unknown[])] : { ...root }
  const container = clone as Record<string | number, unknown>
  if (!rest.length) {
    container[head as string | number] = value
    return clone as Record<string, unknown>
  }
  const child = container[head as string | number]
  // A numeric next segment means the missing container is a list. Creating an
  // object there would store `{ "0": … }`, which the blocks read as "no items"
  // and quietly replace with their demo content.
  const empty: Record<string, unknown> | unknown[] = typeof rest[0] === 'number' ? [] : {}
  const next = child && typeof child === 'object' ? (child as Record<string, unknown>) : (empty as Record<string, unknown>)
  container[head as string | number] = setAtPath(next, rest, value)
  return clone as Record<string, unknown>
}
