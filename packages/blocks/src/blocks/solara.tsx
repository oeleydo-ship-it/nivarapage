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
  Stars,
  animationOf,
  bool,
  cx,
  items,
  lines,
  num,
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

function slLinks(props: Props) {
  return items(props.links, []).map((item) => ({
    label: str(item.label),
    url: str(item.url) || str(item.href) || '#',
    children: item.children,
  }))
}

function BrandMark({ props, ghost = false }: { props: Props; ghost?: boolean }) {
  const edit = editOf(props)
  return (
    <a href={str(props.logoUrl, '/')} className={cx('ud-sl-brand', ghost && 'ud-sl-brand--ghost')}>
      <span className="ud-sl-brand__mark" aria-hidden>
        <Icon name={str(props.logoIcon, 'sparkles')} size={15} />
      </span>
      <EditableText edit={edit} path={['logo']} value={str(props.logo, 'Solara')} placeholder="Brand" />
    </a>
  )
}

function SlButton({
  href,
  children,
  ghost = false,
}: {
  href: string
  children: ReactNode
  ghost?: boolean
}) {
  return (
    <Button href={href} variant={ghost ? 'ghost' : 'primary'} className={cx('ud-sl-btn', ghost && 'ud-sl-btn--ghost')}>
      {children}
    </Button>
  )
}

export const navbarSolara = defineBlock({
  type: 'navbar.solara',
  version: 1,
  category: 'navigation',
  label: 'Solara navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Solara',
    logoIcon: 'sparkles',
    logoUrl: '/',
    buttonLabel: 'Get started',
    buttonUrl: '/pricing',
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
    ...primaryCtaFields,
    stickyField,
  ),
  component: function NavbarSolara(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    const links = slLinks(props)
    const anim = animationOf(props)
    return (
      <header
        className={cx('ud-sl-nav', bool(props.sticky, true) && 'ud-sl-nav--sticky', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container ud-sl-nav__bar">
          <BrandMark props={props} />
          <nav className={cx('ud-sl-nav__links', open && 'is-open')} aria-label="Primary">
            {links.map((item, index) => (
              <NavItem key={`${item.url}-${index}`} item={item}>
                <a href={item.url} className="ud-sl-nav__link">
                  <EditableText edit={edit} path={['links', index, 'label']} value={item.label} placeholder="Link" />
                  <SubmenuCaret show={hasSubmenu(item)} />
                </a>
                <Submenu props={props} item={item} index={index} />
              </NavItem>
            ))}
          </nav>
          <div className="ud-sl-nav__actions">
            {str(props.buttonLabel) || edit ? (
              <SlButton href={str(props.buttonUrl, '/pricing')}>
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Get started" />
              </SlButton>
            ) : null}
          </div>
          <button type="button" className="ud-sl-nav__toggle" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>
            <Icon name={open ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </header>
    )
  },
})

export const heroSolara = defineBlock({
  type: 'hero.solara',
  version: 1,
  category: 'hero',
  label: 'Solara hero',
  icon: 'Sparkles',
  defaultProps: {
    badge: 'Join 50+ teams',
    tag: 'New!',
    heading: 'Build, Launch & Scale with AI agents.',
    description:
      'Solara gives your team agents that draft, ship, and follow up — so launches leave the slide deck and actually go live.',
    buttonLabel: 'Get started',
    buttonUrl: '/pricing',
    secondaryLabel: 'See in action',
    secondaryUrl: '#demo',
    avatars: [
      { image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80' },
      { image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80' },
      { image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80' },
    ],
    animation: 'fade-up',
    animationTrigger: 'load',
    headingSize: 56,
    bodySize: 17,
  },
  schema: schema(
    text('badge', 'Trust badge'),
    text('tag', 'New tag'),
    headingField,
    descriptionField,
    ...ctaFields,
    repeater('avatars', 'Badge photos', [image('image', 'Photo')], { itemLabel: 'Photo' }),
  ),
  component: function HeroSolara(props) {
    const edit = editOf(props)
    const faces = items(props.avatars, [])
    return (
      <SectionShell props={props} className="ud-sl ud-sl-hero" align="center">
        <div className="ud-sl-glow" aria-hidden />
        <div className="ud-sl-hero__copy">
          <div className="ud-sl-badge">
            <span className="ud-sl-badge__faces">
              {faces.map((item, index) => (
                <Avatar key={index} src={str(item.image)} name="Customer" edit={edit} path={['avatars', index, 'image']} />
              ))}
            </span>
            <EditableText edit={edit} path={['badge']} value={str(props.badge)} as="span" placeholder="Trust line" />
            {str(props.tag) || edit ? (
              <EditableText edit={edit} path={['tag']} value={str(props.tag, 'New!')} as="span" className="ud-sl-badge__tag" placeholder="New!" />
            ) : null}
          </div>
          <EditableText
            edit={edit}
            path={['heading']}
            value={str(props.heading)}
            as="h1"
            className="ud-h1 ud-sl-hero__title"
            placeholder="Headline"
          />
          <SafeText value={str(props.description)} className="ud-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
          <div className="ud-sl-hero__cta">
            <SlButton href={str(props.buttonUrl, '/pricing')}>
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Get started" />
            </SlButton>
            {str(props.secondaryLabel) || edit ? (
              <SlButton href={str(props.secondaryUrl, '#demo')} ghost>
                <span className="ud-sl-play" aria-hidden>
                  <Icon name="play" size={12} />
                </span>
                <EditableText edit={edit} path={['secondaryLabel']} value={str(props.secondaryLabel)} placeholder="See in action" />
              </SlButton>
            ) : null}
          </div>
        </div>
      </SectionShell>
    )
  },
})

export const statsSolara = defineBlock({
  type: 'stats.solara',
  version: 1,
  category: 'features',
  label: 'Solara stats',
  icon: 'Chart',
  defaultProps: {
    items: [
      { value: '1x', label: 'faster agent generation' },
      { value: '10%', label: 'less time in review' },
      { value: '22.1%', label: 'more launches shipped' },
    ],
    animation: 'fade-up',
  },
  schema: schema(repeater('items', 'Stats', [text('value', 'Value'), text('label', 'Label')], { itemLabel: 'Stat' })),
  component: function StatsSolara(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-sl ud-sl-stats">
        <div className="ud-sl-stats__row">
          {list.map((item, index) => (
            <article key={index} className="ud-sl-stats__item">
              <EditableText edit={edit} path={['items', index, 'value']} value={str(item.value)} as="p" className="ud-sl-stats__value" placeholder="0" />
              <EditableText edit={edit} path={['items', index, 'label']} value={str(item.label)} as="p" className="ud-small" placeholder="Label" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

export const featuresSolara = defineBlock({
  type: 'features.solara',
  version: 1,
  category: 'features',
  label: 'Solara feature stack',
  icon: 'Layout',
  defaultProps: {
    eyebrow: 'Core features',
    heading: 'Everything an agent team needs on one canvas.',
    description: 'Describe the job, attach your tools, and launch. Solara keeps memory, handoff, and reporting in the same place.',
    buttonLabel: 'Build your agent',
    buttonUrl: '/pricing',
    items: [
      { icon: 'zap', title: 'Prompt to agent', text: 'Start with a sentence. Solara sketches tasks, tools, and a first personality.', tint: '#FF6B1A', wash: '#FFF4EC' },
      { icon: 'cpu', title: 'Memory that sticks', text: 'Agents keep context across sessions so customers never restart from zero.', tint: '#22C55E', wash: '#ECFDF5' },
      { icon: 'rocket', title: 'Live execution', text: 'Jobs run in the background and report back when the work is done.', tint: '#3B82F6', wash: '#EFF6FF' },
      { icon: 'users', title: 'Human handoff', text: 'When confidence drops, the thread lands with a person and the full history.', tint: '#EC4899', wash: '#FDF2F8' },
      { icon: 'chart', title: 'Clear analytics', text: 'See which prompts convert, which tools stall, and where to train next.', tint: '#84CC16', wash: '#F7FEE7' },
      { icon: 'shield', title: 'Safe by default', text: 'Workspace roles, audit logs, and no training on other customers’ data.', tint: '#B45309', wash: '#FEF3C7' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    text('eyebrow', 'Eyebrow'),
    headingField,
    descriptionField,
    ...primaryCtaFields,
    repeater(
      'items',
      'Features',
      [
        icon('icon', 'Icon'),
        text('title', 'Title'),
        textarea('text', 'Body'),
        field('tint', 'color', 'Icon color', 'content'),
        field('wash', 'color', 'Card color', 'content'),
      ],
      { itemLabel: 'Feature' },
    ),
  ),
  component: function FeaturesSolara(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-sl ud-sl-feat">
        <div className="ud-sl-feat__grid">
          <div>
            {str(props.eyebrow) || edit ? (
              <p className="ud-sl-kicker">
                <span className="ud-sl-kicker__icon" aria-hidden>
                  <Icon name="sparkles" size={14} />
                </span>
                <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} placeholder="Core features" />
              </p>
            ) : null}
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
            <SafeText value={str(props.description)} className="ud-text" edit={edit} path={['description']} placeholder="Body" />
            {str(props.buttonLabel) || edit ? (
              <div className="ud-sl-feat__cta">
                <SlButton href={str(props.buttonUrl, '/pricing')}>
                  <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Build your agent" />
                </SlButton>
              </div>
            ) : null}
          </div>
          <div className="ud-sl-feat__list">
            {list.map((item, index) => (
              <article key={index} className="ud-sl-feat__card" style={{ background: str(item.wash, '#FFF7ED') }}>
                <span className="ud-sl-feat__icon" style={{ background: str(item.tint, 'var(--color-primary)') }}>
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
      </SectionShell>
    )
  },
})

export const faqSolara = defineBlock({
  type: 'faq.solara',
  version: 1,
  category: 'faq',
  label: 'Solara FAQ + chat card',
  icon: 'CircleHelp',
  defaultProps: {
    heading: 'Last questions?',
    openFirst: true,
    items: [
      { question: 'Do I need to write code?', answer: 'No. Describe the job in plain language. Technical teams can still attach APIs and rules in the same builder.' },
      { question: 'How fast can we launch an agent?', answer: 'Most teams ship a first agent the same afternoon: prompt, tools, then deploy.' },
      { question: 'Can agents remember past chats?', answer: 'Yes. Memory stays on the conversation so the next visit does not start from zero.' },
      { question: 'What happens after we go live?', answer: 'The agent keeps working in the background, reports results, and can hand off to a person.' },
    ],
    cardHeading: 'Still have questions? Chat with our AI design assistant.',
    cardButton: 'Chat with Solara',
    cardUrl: '/contact',
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    toggle('openFirst', 'Open the first item', 'design'),
    repeater('items', 'Questions', [text('question', 'Question'), textarea('answer', 'Answer')], { itemLabel: 'Question' }),
    text('cardHeading', 'Side card heading'),
    text('cardButton', 'Side card button'),
    link('cardUrl', 'Side card link'),
  ),
  component: function FaqSolara(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-sl ud-sl-faq">
        <div className="ud-sl-faq__grid">
          <div>
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
            <div className="ud-sl-faq__list">
              {list.map((item, index) => (
                <details key={index} className="ud-sl-faq__item" open={bool(props.openFirst, true) && index === 0}>
                  <summary
                    onClick={(event) => {
                      if (edit && (event.target as HTMLElement).closest('.ud-editable')) event.preventDefault()
                    }}
                  >
                    <EditableText edit={edit} path={['items', index, 'question']} value={str(item.question)} as="span" placeholder="Question" />
                    <Icon name="plus" size={16} />
                  </summary>
                  <SafeText
                    value={str(item.answer)}
                    className="ud-sl-faq__body"
                    edit={edit}
                    path={['items', index, 'answer']}
                    placeholder="Answer"
                  />
                </details>
              ))}
            </div>
          </div>
          <aside className="ud-sl-faq__card">
            <EditableText edit={edit} path={['cardHeading']} value={str(props.cardHeading)} as="h3" className="ud-h3" placeholder="Side heading" />
            <SlButton href={str(props.cardUrl, '/contact')} ghost>
              <EditableText edit={edit} path={['cardButton']} value={str(props.cardButton)} placeholder="Chat with Solara" />
            </SlButton>
          </aside>
        </div>
      </SectionShell>
    )
  },
})

export const teamSolara = defineBlock({
  type: 'team.solara',
  version: 1,
  category: 'team',
  label: 'Solara portraits',
  icon: 'Users',
  defaultProps: {
    heading: 'The people behind the agents.',
    items: [
      {
        name: 'Amelia Chen',
        role: 'Co-founder, product',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Jonah Patel',
        role: 'Co-founder, engineering',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    headingField,
    repeater('items', 'People', [text('name', 'Name'), text('role', 'Role'), image('image', 'Photo')], { itemLabel: 'Person' }),
  ),
  component: function TeamSolara(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-sl ud-sl-team" align="center">
        {str(props.heading) || edit ? (
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
        ) : null}
        <div className="ud-sl-team__grid">
          {list.map((item, index) => (
            <article key={index} className="ud-sl-team__card">
              <Media src={str(item.image)} alt={str(item.name)} ratio="square" className="ud-sl-team__photo" edit={edit} path={['items', index, 'image']} />
              <EditableText edit={edit} path={['items', index, 'name']} value={str(item.name)} as="h3" className="ud-h4" placeholder="Name" />
              <EditableText edit={edit} path={['items', index, 'role']} value={str(item.role)} as="p" className="ud-small" placeholder="Role" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

export const pricingSolara = defineBlock({
  type: 'pricing.solara',
  version: 1,
  category: 'pricing',
  label: 'Solara pricing',
  icon: 'CreditCard',
  defaultProps: {
    eyebrow: 'Pricing',
    heading: 'Simple, transparent pricing',
    monthlyLabel: 'Monthly',
    yearlyLabel: 'Yearly',
    showBillingToggle: true,
    plans: [
      {
        name: 'Basic',
        price: '$0.00',
        priceYearly: '$0.00',
        period: '/mo',
        features: '1 agent\n50 tasks / month\nCommunity support\nCancel anytime',
        buttonLabel: 'Get started',
        buttonUrl: '/contact',
      },
      {
        name: 'Starter',
        price: '$19.00',
        priceYearly: '$15.00',
        period: '/mo',
        features: '5 agents\nUnlimited tasks\nPriority chat\nRemove badge\nCustom domain',
        buttonLabel: 'Get started',
        buttonUrl: '/contact',
        highlighted: true,
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    text('eyebrow', 'Eyebrow'),
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
      ],
      { itemLabel: 'Plan' },
    ),
  ),
  component: function PricingSolara(props) {
    const edit = editOf(props)
    const [yearly, setYearly] = useState(false)
    const plans = items(props.plans, [])
    return (
      <SectionShell props={props} className="ud-sl ud-sl-price" align="center">
        <p className="ud-sl-kicker ud-sl-kicker--center">
          <span className="ud-sl-kicker__icon" aria-hidden>
            <Icon name="sparkles" size={14} />
          </span>
          <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow, 'Pricing')} placeholder="Pricing" />
        </p>
        <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
        {bool(props.showBillingToggle, true) ? (
          <div className="ud-sl-toggle" role="group">
            <button type="button" className={cx(!yearly && 'is-on')} onClick={() => setYearly(false)}>
              <EditableText edit={edit} path={['monthlyLabel']} value={str(props.monthlyLabel, 'Monthly')} placeholder="Monthly" />
            </button>
            <button type="button" className={cx(yearly && 'is-on')} onClick={() => setYearly(true)}>
              <EditableText edit={edit} path={['yearlyLabel']} value={str(props.yearlyLabel, 'Yearly')} placeholder="Yearly" />
            </button>
          </div>
        ) : null}
        <div className="ud-sl-price__grid">
          {plans.map((plan, index) => {
            const on = bool(plan.highlighted, false)
            const price = yearly && str(plan.priceYearly) ? str(plan.priceYearly) : str(plan.price)
            const priceKey = yearly && str(plan.priceYearly) ? 'priceYearly' : 'price'
            return (
              <article key={index} className={cx('ud-sl-price__card', on && 'ud-sl-price__card--on')}>
                <EditableText edit={edit} path={['plans', index, 'name']} value={str(plan.name)} as="h3" className="ud-h4" placeholder="Plan" />
                <p className="ud-sl-price__amount">
                  <EditableText edit={edit} path={['plans', index, priceKey]} value={price} placeholder="$0" />
                  <EditableText edit={edit} path={['plans', index, 'period']} value={str(plan.period, '/mo')} as="span" className="ud-small" placeholder="/mo" />
                </p>
                <SlButton href={str(plan.buttonUrl, '/contact')}>
                  <EditableText edit={edit} path={['plans', index, 'buttonLabel']} value={str(plan.buttonLabel, 'Get started')} placeholder="Get started" />
                </SlButton>
                <CheckList values={lines(plan.features)} icon="check" edit={edit} path={['plans', index, 'features']} />
              </article>
            )
          })}
        </div>
      </SectionShell>
    )
  },
})

export const testimonialsSolara = defineBlock({
  type: 'testimonials.solara',
  version: 1,
  category: 'testimonials',
  label: 'Solara quotes',
  icon: 'Quote',
  defaultProps: {
    moreLabel: 'View more',
    moreUrl: '/testimonials',
    items: [
      {
        name: 'Amelia Chen',
        handle: '@amelia',
        text: 'We launched an agent landing page in an afternoon. The orange kit already looked like our product.',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        highlighted: false,
      },
      {
        name: 'Jonah Patel',
        handle: '@jonah',
        text: 'Memory and handoff just worked. Investors noticed the site before they noticed the deck.',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        highlighted: true,
      },
      {
        name: 'Maya Ortiz',
        handle: '@maya',
        text: 'Pricing, FAQ, and quotes stay on-brand when we duplicate inner pages. Easy to extend.',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        highlighted: false,
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    text('moreLabel', 'More button'),
    link('moreUrl', 'More link'),
    repeater(
      'items',
      'Quotes',
      [
        text('name', 'Name'),
        text('handle', 'Handle'),
        textarea('text', 'Quote'),
        image('image', 'Photo'),
        field('rating', 'number', 'Stars', 'content'),
        toggle('highlighted', 'Highlight', 'content'),
      ],
      { itemLabel: 'Quote' },
    ),
  ),
  component: function TestimonialsSolara(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-sl ud-sl-quotes" align="center">
        <div className="ud-sl-quotes__grid">
          {list.map((item, index) => {
            const on = bool(item.highlighted, false)
            return (
              <article key={index} className={cx('ud-sl-quotes__card', on && 'ud-sl-quotes__card--on')}>
                <Stars count={num(item.rating, 5)} />
                <SafeText value={str(item.text)} className="ud-text" edit={edit} path={['items', index, 'text']} placeholder="Quote" />
                <footer>
                  <Avatar src={str(item.image)} name={str(item.name)} edit={edit} path={['items', index, 'image']} />
                  <div>
                    <EditableText edit={edit} path={['items', index, 'name']} value={str(item.name)} as="strong" placeholder="Name" />
                    <EditableText edit={edit} path={['items', index, 'handle']} value={str(item.handle)} as="p" className="ud-small" placeholder="@handle" />
                  </div>
                </footer>
              </article>
            )
          })}
        </div>
        {str(props.moreLabel) || edit ? (
          <a className="ud-sl-more" href={str(props.moreUrl, '/testimonials')}>
            <EditableText edit={edit} path={['moreLabel']} value={str(props.moreLabel, 'View more')} placeholder="View more" />
          </a>
        ) : null}
      </SectionShell>
    )
  },
})

export const footerSolara = defineBlock({
  type: 'footer.solara',
  version: 1,
  category: 'footer',
  label: 'Solara footer',
  icon: 'PanelBottom',
  defaultProps: {
    logo: 'Solara',
    logoIcon: 'sparkles',
    logoUrl: '/',
    copyright: `© ${new Date().getFullYear()} Solara. All rights reserved.`,
    columns: [
      { title: 'Product', links: 'Features|/features\nPricing|/pricing\nTestimonials|/testimonials' },
      { title: 'Resources', links: 'Contact|/contact\nHelp|#\nStatus|#' },
      { title: 'Company', links: 'About|/contact\nCareers|#\nPress|#' },
    ],
    animation: 'fade',
  },
  schema: schema(
    text('logo', 'Brand'),
    icon('logoIcon', 'Mark icon'),
    link('logoUrl', 'Brand link'),
    textarea('copyright', 'Copyright'),
    repeater('columns', 'Columns', [text('title', 'Title'), textarea('links', 'Links (Label|/url)')], { itemLabel: 'Column' }),
  ),
  component: function FooterSolara(props) {
    const edit = editOf(props)
    const columns = items(props.columns, [])
    return (
      <SectionShell props={props} className="ud-sl ud-sl-foot" bleed>
        <div className="ud-container ud-sl-foot__inner">
          <div className="ud-sl-foot__mark" aria-hidden>
            {str(props.logo, 'Solara')}
          </div>
          <div className="ud-sl-foot__grid">
            <div>
              <BrandMark props={props} />
              <EditableText edit={edit} path={['copyright']} value={str(props.copyright)} as="p" className="ud-small" placeholder="Copyright" />
            </div>
            {columns.map((column, index) => (
              <div key={index}>
                <EditableText edit={edit} path={['columns', index, 'title']} value={str(column.title)} as="h3" className="ud-h4" placeholder="Column" />
                <LinkLines value={column.links} edit={edit} path={['columns', index, 'links']} />
              </div>
            ))}
          </div>
        </div>
      </SectionShell>
    )
  },
})
