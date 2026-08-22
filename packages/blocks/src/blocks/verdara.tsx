import type { CSSProperties, ReactNode } from 'react'
import { useState } from 'react'
import { EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Avatar,
  Button,
  CheckList,
  LinkLines,
  Media,
  SafeText,
  SectionShell,
  animationOf,
  bool,
  cx,
  items,
  lines,
  sectionVars,
  str,
  type Props,
} from '../primitives'
import {
  ctaFields,
  descriptionField,
  field,
  headingField,
  icon,
  image,
  link,
  navLinksField,
  primaryCtaFields,
  repeater,
  schema,
  stickyField,
  text,
  textarea,
  toggle,
} from '../schema'
import { NavItem, Submenu, SubmenuCaret, hasSubmenu } from '../submenu'
import { defineBlock } from '../types'

function vdLinks(props: Props) {
  return items(props.links, []).map((item) => ({
    label: str(item.label),
    url: str(item.url) || str(item.href) || '#',
    children: item.children,
  }))
}

function BrandMark({ props }: { props: Props }) {
  const edit = editOf(props)
  return (
    <a href={str(props.logoUrl, '/')} className="ud-vd-brand">
      <span className="ud-vd-brand__mark" aria-hidden>
        <Icon name={str(props.logoIcon, 'leaf')} size={16} />
      </span>
      <EditableText edit={edit} path={['logo']} value={str(props.logo, 'Verdara')} placeholder="Brand" />
    </a>
  )
}

function AccentHeading({ props }: { props: Props }) {
  const edit = editOf(props)
  return (
    <h1 className="ud-h1 ud-vd-hero__title">
      <EditableText edit={edit} path={['headingPrefix']} value={str(props.headingPrefix)} placeholder="Build, launch and scale" />{' '}
      <em>
        <EditableText edit={edit} path={['headingAccent']} value={str(props.headingAccent, 'your business')} placeholder="accent" />
      </em>{' '}
      <EditableText edit={edit} path={['headingSuffix']} value={str(props.headingSuffix)} placeholder="with AI." />
    </h1>
  )
}

function VdButton({ href, children, ghost = false }: { href: string; children: ReactNode; ghost?: boolean }) {
  return (
    <Button href={href} variant={ghost ? 'ghost' : 'primary'} className={cx('ud-vd-btn', ghost && 'ud-vd-btn--ghost')}>
      {children}
    </Button>
  )
}

export const navbarVerdara = defineBlock({
  type: 'navbar.verdara',
  version: 1,
  category: 'navigation',
  label: 'Verdara navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Verdara',
    logoIcon: 'leaf',
    logoUrl: '/',
    secondaryLabel: 'Login',
    secondaryUrl: '/contact',
    buttonLabel: 'Join for free',
    buttonUrl: '/contact',
    sticky: true,
    links: [
      { label: 'Home', url: '/' },
      { label: 'Features', url: '/features' },
      { label: 'Testimonials', url: '/testimonials' },
      { label: 'Pricing', url: '/pricing' },
    ],
    animation: 'fade',
  },
  schema: schema(
    text('logo', 'Brand'),
    icon('logoIcon', 'Mark icon'),
    link('logoUrl', 'Brand link'),
    navLinksField('links', 'Links'),
    ...ctaFields,
    stickyField,
  ),
  component: function NavbarVerdara(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    const links = vdLinks(props)
    const anim = animationOf(props)
    return (
      <header
        className={cx('ud-vd-nav', bool(props.sticky, true) && 'ud-vd-nav--sticky', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container ud-vd-nav__bar">
          <BrandMark props={props} />
          <div className="ud-vd-nav__end">
            <nav className={cx('ud-vd-nav__links', open && 'is-open')} aria-label="Primary">
              {links.map((item, index) => (
                <NavItem key={`${item.url}-${index}`} item={item}>
                  <a href={item.url} className="ud-vd-nav__link">
                    <EditableText edit={edit} path={['links', index, 'label']} value={item.label} placeholder="Link" />
                    <SubmenuCaret show={hasSubmenu(item)} />
                  </a>
                  <Submenu props={props} item={item} index={index} />
                </NavItem>
              ))}
            </nav>
            <div className="ud-vd-nav__actions">
              {str(props.secondaryLabel) || edit ? (
                <VdButton href={str(props.secondaryUrl, '#')} ghost>
                  <EditableText edit={edit} path={['secondaryLabel']} value={str(props.secondaryLabel)} placeholder="Login" />
                </VdButton>
              ) : null}
              {str(props.buttonLabel) || edit ? (
                <VdButton href={str(props.buttonUrl, '/contact')}>
                  <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Join for free" />
                </VdButton>
              ) : null}
            </div>
          </div>
          <button type="button" className="ud-vd-nav__toggle" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>
            <Icon name={open ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </header>
    )
  },
})

export const heroVerdara = defineBlock({
  type: 'hero.verdara',
  version: 1,
  category: 'hero',
  label: 'Verdara hero',
  icon: 'Sparkles',
  defaultProps: {
    badge: 'Trusted by 500,000+ customers',
    headingPrefix: 'Build, launch and scale',
    headingAccent: 'your business',
    headingSuffix: 'with AI.',
    description:
      'Verdara drafts your site, writes the first campaigns, and keeps the stack together so you can ship without hiring a full product team.',
    buttonLabel: 'Get started →',
    buttonUrl: '/pricing',
    note: 'No credit card required. Cancel anytime.',
    avatars: [
      { image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80' },
      { image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80' },
      { image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80' },
      { image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80' },
    ],
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(
    text('badge', 'Trust badge'),
    text('headingPrefix', 'Headline start'),
    text('headingAccent', 'Highlighted phrase'),
    text('headingSuffix', 'Headline end'),
    descriptionField,
    ...primaryCtaFields,
    text('note', 'Fine print'),
    repeater('avatars', 'Badge photos', [image('image', 'Photo')], { itemLabel: 'Photo' }),
  ),
  component: function HeroVerdara(props) {
    const edit = editOf(props)
    const faces = items(props.avatars, [])
    return (
      <SectionShell props={props} className="ud-vd ud-vd-hero" align="center">
        <div className="ud-vd-glow" aria-hidden />
        <div className="ud-vd-hero__copy">
          <div className="ud-vd-badge">
            <span className="ud-vd-badge__faces">
              {faces.map((item, index) => (
                <Avatar key={index} src={str(item.image)} name="Customer" edit={edit} path={['avatars', index, 'image']} />
              ))}
            </span>
            <EditableText edit={edit} path={['badge']} value={str(props.badge)} as="span" placeholder="Trust line" />
          </div>
          <AccentHeading props={props} />
          <SafeText value={str(props.description)} className="ud-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
          <div className="ud-vd-hero__cta">
            <VdButton href={str(props.buttonUrl, '/pricing')}>
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Get started" />
            </VdButton>
            {str(props.note) || edit ? (
              <EditableText edit={edit} path={['note']} value={str(props.note)} as="p" className="ud-small" placeholder="Fine print" />
            ) : null}
          </div>
        </div>
      </SectionShell>
    )
  },
})

export const proofVerdara = defineBlock({
  type: 'proof.verdara',
  version: 1,
  category: 'features',
  label: 'Verdara logos',
  icon: 'Layers',
  defaultProps: {
    logos: [
      { label: 'Framer' },
      { label: 'HUAWEI' },
      { label: 'Instacart' },
      { label: 'Microsoft' },
      { label: 'Walmart' },
    ],
    animation: 'fade-up',
  },
  schema: schema(repeater('logos', 'Logos', [text('label', 'Name')], { itemLabel: 'Logo' })),
  component: function ProofVerdara(props) {
    const edit = editOf(props)
    const logos = items(props.logos, [])
    return (
      <SectionShell props={props} className="ud-vd ud-vd-logos">
        <div className="ud-vd-logos__row">
          {logos.map((item, index) => (
            <span key={index} className="ud-vd-logos__item">
              <EditableText edit={edit} path={['logos', index, 'label']} value={str(item.label)} placeholder="Brand" />
            </span>
          ))}
        </div>
      </SectionShell>
    )
  },
})

export const featuresVerdara = defineBlock({
  type: 'features.verdara',
  version: 1,
  category: 'features',
  label: 'Verdara features',
  icon: 'Layout',
  defaultProps: {
    eyebrow: 'Features',
    heading: 'Create smarter, faster',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Team at work',
    imageTwo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=900&q=80',
    imageTwoAlt: 'Product workshop',
    items: [
      { icon: 'zap', title: 'Smart Automation', text: 'Let routine drafts, follow-ups, and reports run while you stay on the work that needs a person.', tint: '#A78BFA' },
      { icon: 'users', title: 'Seamless Team Synergy', text: 'One workspace for copy, design notes, and launches — no more hunting across five tools.', tint: '#4ADE80' },
      { icon: 'chart', title: 'Built-in Analytics', text: 'See which pages convert, which campaigns stall, and where to put the next hour.', tint: '#F87171' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    text('eyebrow', 'Badge'),
    headingField,
    image('image', 'Front photo'),
    text('imageAlt', 'Front alt'),
    image('imageTwo', 'Back photo'),
    text('imageTwoAlt', 'Back alt'),
    repeater(
      'items',
      'Features',
      [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Body'), field('tint', 'color', 'Icon color', 'content')],
      { itemLabel: 'Feature' },
    ),
  ),
  component: function FeaturesVerdara(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-vd ud-vd-feat">
        <div className="ud-vd-feat__grid">
          <div className="ud-vd-photos">
            <Media src={str(props.image)} alt={str(props.imageAlt)} ratio="portrait" className="ud-vd-photos__a" edit={edit} path={['image']} />
            <Media src={str(props.imageTwo)} alt={str(props.imageTwoAlt)} ratio="portrait" className="ud-vd-photos__b" edit={edit} path={['imageTwo']} />
          </div>
          <div>
            {str(props.eyebrow) || edit ? (
              <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-vd-chip" placeholder="Badge" />
            ) : null}
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
            <div className="ud-vd-feat__list">
              {list.map((item, index) => (
                <article key={index} className="ud-vd-feat__item">
                  <span className="ud-vd-feat__icon" style={{ background: str(item.tint, 'var(--color-primary)') }}>
                    <Icon name={str(item.icon, 'zap')} size={16} />
                  </span>
                  <div>
                    <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="h3" className="ud-h4" placeholder="Title" />
                    <SafeText value={str(item.text)} className="ud-text" edit={edit} path={['items', index, 'text']} placeholder="Body" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </SectionShell>
    )
  },
})

export const ctaCrew = defineBlock({
  type: 'cta.crew',
  version: 1,
  category: 'cta',
  label: 'Verdara crew banner',
  icon: 'Users',
  defaultProps: {
    heading: 'Meet the builders Powering modern teams',
    buttonLabel: 'Join our team',
    buttonUrl: '/contact',
    faces: [
      { image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', name: 'Amelia' },
      { image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', name: 'Jonah' },
      { image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80', name: 'Maya' },
      { image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', name: 'Chris' },
      { image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', name: 'Priya' },
      { image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', name: 'Omar' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    ...primaryCtaFields,
    repeater('faces', 'Team photos', [image('image', 'Photo'), text('name', 'Name')], { itemLabel: 'Person' }),
  ),
  component: function CtaCrew(props) {
    const edit = editOf(props)
    const faces = items(props.faces, [])
    return (
      <SectionShell props={props} className="ud-vd ud-vd-crew" bleed>
        <div className="ud-container ud-vd-crew__inner">
          <div>
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
            <VdButton href={str(props.buttonUrl, '/contact')}>
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Join our team" />
            </VdButton>
          </div>
          <div className="ud-vd-crew__grid">
            {faces.map((item, index) => (
              <Avatar key={index} src={str(item.image)} name={str(item.name, 'Teammate')} edit={edit} path={['faces', index, 'image']} />
            ))}
          </div>
        </div>
      </SectionShell>
    )
  },
})

export const testimonialsVerdara = defineBlock({
  type: 'testimonials.verdara',
  version: 1,
  category: 'testimonials',
  label: 'Verdara quotes',
  icon: 'Quote',
  defaultProps: {
    heading: 'Loved by teams worldwide.',
    items: [
      { name: 'Amelia Chen', handle: '@amelia', text: 'We shipped a launch site in an afternoon. The copy actually sounded like us.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80' },
      { name: 'Jonah Patel', handle: '@jonah', text: 'Pricing pages used to take a week. Verdara drafted three options we could edit live.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80' },
      { name: 'Maya Ortiz', handle: '@maya', text: 'The green, airy layout is what our customers expected. We did not fight a dark theme.', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80' },
      { name: 'Chris Hale', handle: '@chris', text: 'Analytics on the same canvas as the page. No extra dashboard login.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' },
      { name: 'Priya Shah', handle: '@priya', text: 'Handoff to our designer was a shared link, not a zip of Figma comments.', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80' },
      { name: 'Omar Hassan', handle: '@omar', text: 'Cancelled the agency retainer. We still look like we have one.', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    repeater(
      'items',
      'Quotes',
      [text('name', 'Name'), text('handle', 'Handle'), textarea('text', 'Quote'), image('image', 'Photo')],
      { itemLabel: 'Quote' },
    ),
  ),
  component: function TestimonialsVerdara(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-vd ud-vd-quotes" align="center">
        <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
        <div className="ud-vd-quotes__grid">
          {list.map((item, index) => (
            <article key={index} className="ud-vd-card ud-vd-quotes__card">
              <header>
                <Avatar src={str(item.image)} name={str(item.name)} edit={edit} path={['items', index, 'image']} />
                <div>
                  <EditableText edit={edit} path={['items', index, 'name']} value={str(item.name)} as="strong" placeholder="Name" />
                  <p className="ud-vd-quotes__handle">
                    <EditableText edit={edit} path={['items', index, 'handle']} value={str(item.handle)} placeholder="@handle" />
                    <Icon name="check-circle" size={14} />
                  </p>
                </div>
              </header>
              <SafeText value={str(item.text)} className="ud-text" edit={edit} path={['items', index, 'text']} placeholder="Quote" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

export const pricingVerdara = defineBlock({
  type: 'pricing.verdara',
  version: 1,
  category: 'pricing',
  label: 'Verdara pricing',
  icon: 'CreditCard',
  defaultProps: {
    heading: 'Simple, transparent pricing.',
    monthlyLabel: 'Monthly',
    yearlyLabel: 'Yearly',
    showBillingToggle: true,
    plans: [
      {
        name: 'Basic',
        price: '$12',
        priceYearly: '$9',
        period: '/month',
        features: '1 workspace\nAI drafts\nEmail support\nCancel anytime',
        buttonLabel: 'Get started',
        buttonUrl: '/contact',
      },
      {
        name: 'Pro',
        price: '$29',
        priceYearly: '$24',
        period: '/month',
        features: 'Unlimited pages\nTeam seats\nCustom domain\nPriority chat\nRemove badge',
        buttonLabel: 'Get started',
        buttonUrl: '/contact',
        highlighted: true,
        badge: 'Popular',
      },
      {
        name: 'Premium',
        price: '$79',
        priceYearly: '$64',
        period: '/month',
        features: 'Everything in Pro\nSSO\nAudit log\nDedicated onboarding',
        buttonLabel: 'Get started',
        buttonUrl: '/contact',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    toggle('showBillingToggle', 'Monthly / yearly toggle', 'content'),
    text('monthlyLabel', 'Monthly label'),
    text('yearlyLabel', 'Yearly label'),
    repeater(
      'plans',
      'Plans',
      [
        text('name', 'Name'),
        text('price', 'Monthly price'),
        text('priceYearly', 'Yearly price'),
        text('period', 'Period'),
        textarea('features', 'Features (one per line)'),
        text('buttonLabel', 'Button'),
        link('buttonUrl', 'Button link'),
        toggle('highlighted', 'Highlight', 'content'),
        text('badge', 'Badge'),
      ],
      { itemLabel: 'Plan' },
    ),
  ),
  component: function PricingVerdara(props) {
    const edit = editOf(props)
    const [yearly, setYearly] = useState(false)
    const plans = items(props.plans, [])
    return (
      <SectionShell props={props} className="ud-vd ud-vd-price" align="center">
        <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
        {bool(props.showBillingToggle, true) ? (
          <div className="ud-vd-toggle" role="group">
            <button type="button" className={cx(!yearly && 'is-on')} onClick={() => setYearly(false)}>
              <EditableText edit={edit} path={['monthlyLabel']} value={str(props.monthlyLabel, 'Monthly')} placeholder="Monthly" />
            </button>
            <button type="button" className={cx(yearly && 'is-on')} onClick={() => setYearly(true)}>
              <EditableText edit={edit} path={['yearlyLabel']} value={str(props.yearlyLabel, 'Yearly')} placeholder="Yearly" />
            </button>
          </div>
        ) : null}
        <div className="ud-vd-price__grid">
          {plans.map((plan, index) => {
            const on = bool(plan.highlighted, false)
            const price = yearly && str(plan.priceYearly) ? str(plan.priceYearly) : str(plan.price)
            const priceKey = yearly && str(plan.priceYearly) ? 'priceYearly' : 'price'
            return (
              <article key={index} className={cx('ud-vd-card', 'ud-vd-price__card', on && 'ud-vd-price__card--on')}>
                {on ? <div className="ud-vd-price__wash" aria-hidden /> : null}
                <div className="ud-vd-price__top">
                  <EditableText edit={edit} path={['plans', index, 'name']} value={str(plan.name)} as="h3" className="ud-h4" placeholder="Plan" />
                  {str(plan.badge) || (edit && on) ? (
                    <EditableText edit={edit} path={['plans', index, 'badge']} value={str(plan.badge)} as="span" className="ud-vd-chip" placeholder="Badge" />
                  ) : null}
                </div>
                <p className="ud-vd-price__amount">
                  <EditableText edit={edit} path={['plans', index, priceKey]} value={price} placeholder="$0" />
                  <EditableText edit={edit} path={['plans', index, 'period']} value={str(plan.period, '/month')} as="span" className="ud-small" placeholder="/month" />
                </p>
                <CheckList values={lines(plan.features)} icon="check" edit={edit} path={['plans', index, 'features']} />
                <VdButton href={str(plan.buttonUrl, '/contact')}>
                  <EditableText edit={edit} path={['plans', index, 'buttonLabel']} value={str(plan.buttonLabel, 'Get started')} placeholder="Get started" />
                </VdButton>
              </article>
            )
          })}
        </div>
      </SectionShell>
    )
  },
})

export const ctaVerdara = defineBlock({
  type: 'cta.verdara',
  version: 1,
  category: 'cta',
  label: 'Verdara join bar',
  icon: 'Arrow',
  defaultProps: {
    heading: 'Start the wave and join the growing Verdara community',
    buttonLabel: 'Get started',
    buttonUrl: '/contact',
    animation: 'fade-up',
  },
  schema: schema(headingField, ...primaryCtaFields),
  component: function CtaVerdara(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-vd ud-vd-join">
        <div className="ud-vd-join__row">
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
          <VdButton href={str(props.buttonUrl, '/contact')}>
            <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Get started" />
          </VdButton>
        </div>
      </SectionShell>
    )
  },
})

export const footerVerdara = defineBlock({
  type: 'footer.verdara',
  version: 1,
  category: 'footer',
  label: 'Verdara footer',
  icon: 'PanelBottom',
  defaultProps: {
    logo: 'Verdara',
    logoIcon: 'leaf',
    tagline: 'Build, launch and scale with a calmer AI stack.',
    copyright: `© ${new Date().getFullYear()} Verdara. All rights reserved.`,
    columns: [
      { title: 'Product', links: 'Features|/features\nPricing|/pricing\nTestimonials|/testimonials' },
      { title: 'Resources', links: 'Contact|/contact\nHelp|#\nStatus|#' },
      { title: 'Legal', links: 'Privacy|#\nTerms|#\nCookies|#' },
    ],
    social: [
      { icon: 'twitter', url: '#' },
      { icon: 'linkedin', url: '#' },
      { icon: 'github', url: '#' },
    ],
    animation: 'fade',
  },
  schema: schema(
    text('logo', 'Brand'),
    icon('logoIcon', 'Mark icon'),
    textarea('tagline', 'Tagline'),
    textarea('copyright', 'Copyright'),
    repeater('columns', 'Columns', [text('title', 'Title'), textarea('links', 'Links (Label|/url)')], { itemLabel: 'Column' }),
    repeater('social', 'Social', [icon('icon', 'Icon'), link('url', 'URL')], { itemLabel: 'Social' }),
  ),
  component: function FooterVerdara(props) {
    const edit = editOf(props)
    const columns = items(props.columns, [])
    const social = items(props.social, [])
    return (
      <SectionShell props={props} className="ud-vd ud-vd-foot">
        <div className="ud-vd-foot__grid">
          <div>
            <BrandMark props={props} />
            <SafeText value={str(props.tagline)} className="ud-small" edit={edit} path={['tagline']} placeholder="Tagline" />
          </div>
          {columns.map((column, index) => (
            <div key={index}>
              <EditableText edit={edit} path={['columns', index, 'title']} value={str(column.title)} as="h3" className="ud-h4" placeholder="Column" />
              <LinkLines value={column.links} edit={edit} path={['columns', index, 'links']} />
            </div>
          ))}
        </div>
        <div className="ud-vd-foot__base">
          <EditableText edit={edit} path={['copyright']} value={str(props.copyright)} as="p" className="ud-small" placeholder="Copyright" />
          <div className="ud-vd-foot__social">
            {social.map((item, index) => (
              <a key={index} href={str(item.url, '#')} aria-label={str(item.icon, 'social')}>
                <Icon name={str(item.icon, 'globe')} size={16} />
              </a>
            ))}
          </div>
        </div>
      </SectionShell>
    )
  },
})
