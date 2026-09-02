'use client'

import { useState, type CSSProperties } from 'react'
import { useNavigationItems, type NavLinkItem } from '../navigation'
import { Icon } from '../icons'
import {
  Button,
  animationOf,
  arr,
  bool,
  cx,
  defaultLinks,
  sectionVars,
  str,
  variantOf,
  type Props,
  type Tone,
} from '../primitives'
import { EditableImage, EditableText, editOf } from '../editable'
import { ThemeSwitch } from '../theme-scheme'

export function linksFromProps(props: Props): NavLinkItem[] {
  const custom = arr(props.links).map((item) => ({
    label: str(item.label),
    href: str(item.url) || str(item.href) || '#',
    target: str(item.target) || undefined,
    children: arr(item.children)
      .map((child) => ({ label: str(child.label), href: str(child.url) || str(child.href) || '#' }))
      .filter((child) => child.label),
  }))
  return custom.filter((item) => item.label)
}

export function Logo({ props }: { props: Props }) {
  const edit = editOf(props)
  const logoImage = str(props.logoImage)
  const height = Math.min(Math.max(Number(props.logoHeight) || 32, 16), 96)
  return (
    <a
      className="ud-nav__logo"
      href={str(props.logoUrl, '/')}
      onClick={(event) => {
        if (edit) event.preventDefault()
      }}
    >
      {logoImage ? (
        <span style={{ position: 'relative', display: 'inline-flex' }}>
          <img src={logoImage} alt={str(props.logo, 'Logo')} style={{ height, width: 'auto', display: 'block' }} />
          <EditableImage edit={edit} path={['logoImage']} current={logoImage} label="Replace logo" />
        </span>
      ) : (
        <>
          {bool(props.showMark, true) ? (
            <span
              aria-hidden="true"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-primary, #2563eb)',
                color: '#fff',
              }}
            >
              <Icon name={str(props.logoIcon, 'sparkles')} size={16} />
            </span>
          ) : null}
          <EditableText edit={edit} path={['logo']} value={str(props.logo, 'Your Brand')} as="span" placeholder="Logo" />
        </>
      )}
    </a>
  )
}

export function NavList({ props, links, className }: { props?: Props; links: NavLinkItem[]; className?: string }) {
  const edit = editOf(props)
  const custom = arr(props?.links)
  return (
    <nav className={cx('ud-nav__links', className)} aria-label="Primary">
      {links.map((item, index) => (
        <span className="ud-nav__group" key={`${item.label}-${item.href}-${index}`}>
          <a
            className="ud-nav__link"
            href={item.href}
            target={item.target === '_blank' ? '_blank' : undefined}
            rel={item.target === '_blank' ? 'noreferrer' : undefined}
            onClick={(event) => {
              if (edit) event.preventDefault()
            }}
          >
            {custom[index] ? (
              <EditableText
                edit={edit}
                path={['links', index, 'label']}
                value={item.label}
                as="span"
                placeholder="Link"
              />
            ) : (
              item.label
            )}
            {item.children?.length ? <Icon name="arrow" size={12} /> : null}
          </a>
          {item.children?.length ? (
            <span className="ud-nav__menu">
              {item.children.map((child, childIndex) => (
                <a key={`${child.label}-${child.href}`} href={child.href}>
                  {custom[index] ? (
                    <EditableText
                      edit={edit}
                      path={['links', index, 'children', childIndex, 'label']}
                      value={child.label}
                      as="span"
                      placeholder="Menu item"
                    />
                  ) : (
                    child.label
                  )}
                </a>
              ))}
            </span>
          ) : null}
        </span>
      ))}
    </nav>
  )
}

export function Navbar({ props, variant }: { props: Props; variant: 'simple' | 'centered' | 'cta' | 'transparent' }) {
  const [open, setOpen] = useState(false)
  const fromProps = linksFromProps(props)
  const contextLinks = useNavigationItems(defaultLinks.map((item) => ({ label: item.label, href: item.url })))
  const links = fromProps.length ? fromProps : contextLinks

  const transparent = variant === 'transparent'
  const tone: Tone = transparent ? 'default' : (str(props.tone, 'default') as Tone)
  const showCta = variant === 'cta' ? bool(props.showButton, true) : bool(props.showButton, false)
  const ctaLabel = str(props.buttonLabel, 'Get started')
  const centered = variant === 'centered'

  const anim = animationOf(props)
  const radius = Number(props.barRadius)
  const style = {
    ...sectionVars({ ...props, tone }, tone),
    ...anim.style,
    ...(transparent
      ? { '--ud-bg': str(props.backgroundColor, 'transparent') }
      : { '--ud-bg': str(props.backgroundColor) || 'var(--color-background, #fff)' }),
    '--ud-nav-radius': Number.isFinite(radius) ? `${Math.min(Math.max(radius, 0), 40)}px` : undefined,
    paddingBlock: 0,
    borderBottom: bool(props.showBorder, !transparent)
      ? '1px solid color-mix(in srgb, var(--ud-fg, #0f172a) 10%, transparent)'
      : undefined,
    boxShadow: bool(props.shadow, false) ? '0 10px 30px -22px rgb(15 23 42 / 0.45)' : undefined,
  } as CSSProperties

  const edit = editOf(props)
  const showSecondary = bool(props.showSecondary, false)
  const showThemeSwitch = bool(props.showThemeSwitch, false)
  const secondaryLabel = str(props.secondaryLabel, 'Log in')
  const actions =
    showCta || showSecondary || showThemeSwitch ? (
      <div className="ud-nav__actions ud-nav__cta-desktop">
        {showThemeSwitch ? <ThemeSwitch /> : null}
        {showSecondary ? (
          <Button href={str(props.secondaryUrl, '/login')} variant="ghost">
            <EditableText edit={edit} path={['secondaryLabel']} value={secondaryLabel} placeholder="Log in" />
          </Button>
        ) : null}
        {showCta ? (
          <Button href={str(props.buttonUrl, '#')} variant={variantOf(props.buttonVariant)}>
            <EditableText edit={edit} path={['buttonLabel']} value={ctaLabel} placeholder="Button" />
          </Button>
        ) : null}
      </div>
    ) : null

  return (
    <section
      className={cx(
        'ud-section',
        'ud-nav',
        bool(props.sticky, false) && 'ud-nav--sticky',
        bool(props.inset, false) && 'ud-nav--inset',
        str(props.linkStyle) && `ud-nav-links--${str(props.linkStyle)}`,
        str(props.density) && `ud-nav-density--${str(props.density)}`,
        anim.className,
      )}
      style={style}
      id={str(props.anchorId) || undefined}
      data-ud-anim={anim.trigger}
    >
      <div className="ud-container">
        {centered ? (
          <div
            className="ud-nav__bar"
            style={{ flexDirection: 'column', gap: 14, paddingBlock: 18, alignItems: 'center', justifyContent: 'center' }}
          >
            <Logo props={props} />
            <div className="ud-nav__end" style={{ width: '100%', justifyContent: 'center' }}>
              <NavList props={props} links={links} />
              {actions}
            </div>
            <button
              type="button"
              className="ud-nav__toggle"
              aria-expanded={open}
              aria-label="Toggle menu"
              onClick={() => setOpen(!open)}
            >
              <Icon name={open ? 'close' : 'menu'} size={20} />
            </button>
          </div>
        ) : (
          <div className="ud-nav__bar">
            <Logo props={props} />
            <div className="ud-nav__end">
              <NavList props={props} links={links} />
              {actions}
            </div>
            <button
              type="button"
              className="ud-nav__toggle"
              aria-expanded={open}
              aria-label="Toggle menu"
              onClick={() => setOpen(!open)}
            >
              <Icon name={open ? 'close' : 'menu'} size={20} />
            </button>
          </div>
        )}
        <div className="ud-nav__drawer" data-open={open ? 'true' : 'false'}>
          {links.map((item) => (
            <a key={`m-${item.label}-${item.href}`} href={item.href}>
              {item.label}
            </a>
          ))}
          {showSecondary || showCta || showThemeSwitch ? (
            <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
              {showThemeSwitch ? <ThemeSwitch /> : null}
              {showSecondary ? (
                <Button href={str(props.secondaryUrl, '/login')} variant="ghost">
                  <EditableText edit={edit} path={['secondaryLabel']} value={secondaryLabel} placeholder="Log in" />
                </Button>
              ) : null}
              {showCta ? (
                <Button href={str(props.buttonUrl, '#')} variant={variantOf(props.buttonVariant)}>
                  <EditableText edit={edit} path={['buttonLabel']} value={ctaLabel} placeholder="Button" />
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
