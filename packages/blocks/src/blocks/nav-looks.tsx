'use client'

import { useState, type CSSProperties } from 'react'
import { EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import { useNavigationItems } from '../navigation'
import {
  Button,
  animationOf,
  bool,
  cx,
  defaultLinks,
  sectionVars,
  str,
  variantOf,
  type Props,
  type Tone,
} from '../primitives'
import { Logo, NavList, linksFromProps } from './navbar-view'

export type NavLook = 'pill' | 'split' | 'underline' | 'island' | 'utility' | 'minimal'

function useNavLinks(props: Props) {
  const fromProps = linksFromProps(props)
  const contextLinks = useNavigationItems(defaultLinks.map((item) => ({ label: item.label, href: item.url })))
  return fromProps.length ? fromProps : contextLinks
}

function Actions({ props, showCta = true }: { props: Props; showCta?: boolean }) {
  const edit = editOf(props)
  const cta = showCta && bool(props.showButton, true)
  const secondary = bool(props.showSecondary, false)
  if (!cta && !secondary) return null
  return (
    <div className="ud-nav__actions ud-nav__cta-desktop">
      {secondary ? (
        <Button href={str(props.secondaryUrl, '/login')} variant="ghost">
          <EditableText edit={edit} path={['secondaryLabel']} value={str(props.secondaryLabel, 'Log in')} placeholder="Log in" />
        </Button>
      ) : null}
      {cta ? (
        <Button href={str(props.buttonUrl, '/contact')} variant={variantOf(props.buttonVariant)}>
          <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel, 'Get started')} placeholder="Button" />
        </Button>
      ) : null}
    </div>
  )
}

function Drawer({
  open,
  props,
  links,
  showCta = true,
}: {
  open: boolean
  props: Props
  links: ReturnType<typeof useNavLinks>
  showCta?: boolean
}) {
  const edit = editOf(props)
  return (
    <div className="ud-nav__drawer" data-open={open ? 'true' : 'false'}>
      {links.map((item) => (
        <a key={`m-${item.label}-${item.href}`} href={item.href}>
          {item.label}
        </a>
      ))}
      <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
        {bool(props.showSecondary, false) ? (
          <Button href={str(props.secondaryUrl, '/login')} variant="ghost">
            <EditableText edit={edit} path={['secondaryLabel']} value={str(props.secondaryLabel, 'Log in')} placeholder="Log in" />
          </Button>
        ) : null}
        {showCta && bool(props.showButton, true) ? (
          <Button href={str(props.buttonUrl, '/contact')} variant={variantOf(props.buttonVariant)}>
            <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel, 'Get started')} placeholder="Button" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function Toggle({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button type="button" className="ud-nav__toggle" aria-expanded={open} aria-label="Toggle menu" onClick={onClick}>
      <Icon name={open ? 'close' : 'menu'} size={20} />
    </button>
  )
}

export function LookNavbar({ props, look }: { props: Props; look: NavLook }) {
  const [open, setOpen] = useState(false)
  const links = useNavLinks(props)
  const tone = (str(props.tone, look === 'underline' ? 'default' : 'default') as Tone) || 'default'
  const anim = animationOf(props)
  const radius = Number(props.barRadius)
  const style = {
    ...sectionVars(props, tone),
    ...anim.style,
    '--ud-bg': str(props.backgroundColor) || undefined,
    '--ud-nav-radius': Number.isFinite(radius) ? `${Math.min(Math.max(radius, 0), 48)}px` : undefined,
    paddingBlock: 0,
  } as CSSProperties

  return (
    <section
      className={cx(
        'ud-section',
        'ud-nav',
        `ud-nav-look ud-nav-look--${look}`,
        bool(props.sticky, true) && 'ud-nav--sticky',
        str(props.linkStyle) && `ud-nav-links--${str(props.linkStyle)}`,
        str(props.density) && `ud-nav-density--${str(props.density)}`,
        anim.className,
      )}
      style={style}
      id={str(props.anchorId) || undefined}
      data-ud-anim={anim.trigger}
    >
      <div className="ud-container">
        {look === 'utility' ? (
          <div className="ud-nav-util">
            <p className="ud-nav-util__note">
              <EditableText
                edit={editOf(props)}
                path={['note']}
                value={str(props.note, 'Mon–Fri 9:00–17:00')}
                placeholder="Note"
              />
            </p>
            <a className="ud-nav-util__mail" href={`mailto:${str(props.email, 'hello@studio.example')}`}>
              <EditableText
                edit={editOf(props)}
                path={['email']}
                value={str(props.email, 'hello@studio.example')}
                placeholder="Email"
              />
            </a>
          </div>
        ) : null}
        <div className="ud-nav-look__bar">
          <Logo props={props} />
          <div className="ud-nav-look__end">
            {look === 'split' ? (
              <div className="ud-nav-look__cluster">
                <NavList props={props} links={links} />
              </div>
            ) : look === 'minimal' ? (
              <nav className="ud-nav-look__dots" aria-label="Primary">
                <NavList props={props} links={links} />
              </nav>
            ) : (
              <NavList props={props} links={links} />
            )}
            <Actions props={props} showCta={look !== 'minimal' ? true : bool(props.showButton, true)} />
          </div>
          <Toggle open={open} onClick={() => setOpen(!open)} />
        </div>
        <Drawer open={open} props={props} links={links} />
      </div>
    </section>
  )
}
