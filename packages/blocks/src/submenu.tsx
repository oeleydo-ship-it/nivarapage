/**
 * Shared dropdown-submenu support for navigation blocks.
 *
 * Any nav link may carry a `children` array; when it does the link renders a
 * caret and reveals a panel on hover or keyboard focus. Child labels stay
 * inline-editable, and the whole shape is declared once by `navLinksField()`
 * so every block in every template family uses the same data.
 */
import type { ReactNode } from 'react'
import { EditableText, editOf } from './editable'
import { cx, items, str, type Props } from './primitives'

/** Child links declared on a nav item. */
export function childrenOf(item: Props): Props[] {
  return items(item.children, [])
}

export function hasSubmenu(item: Props): boolean {
  return childrenOf(item).length > 0
}

/** Chevron shown next to a link that opens a submenu. */
export function SubmenuCaret({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <span className="ud-submenu__caret" aria-hidden>
      <svg viewBox="0 0 12 12" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 4.5 6 8l3.5-3.5" />
      </svg>
    </span>
  )
}

/**
 * Wraps a nav link so its dropdown can anchor to it. Renders nothing extra
 * when the item has no children, keeping simple navs untouched.
 */
export function NavItem({
  item,
  className,
  children,
}: {
  item: Props
  className?: string
  children: ReactNode
}) {
  return <span className={cx('ud-navitem', hasSubmenu(item) && 'ud-navitem--has-menu', className)}>{children}</span>
}

/** The dropdown panel itself. */
export function Submenu({
  props,
  item,
  index,
  collection = 'links',
  className,
}: {
  props: Props
  item: Props
  index: number
  collection?: string
  className?: string
}) {
  const edit = editOf(props)
  const kids = childrenOf(item)
  if (!kids.length) return null
  return (
    <span className={cx('ud-submenu', className)} role="menu">
      {kids.map((child, childIndex) => (
        <a key={childIndex} className="ud-submenu__link" href={str(child.url, '#')} role="menuitem">
          <EditableText
            edit={edit}
            path={[collection, index, 'children', childIndex, 'label']}
            value={str(child.label)}
            as="span"
            placeholder="Menu item"
          />
        </a>
      ))}
    </span>
  )
}
