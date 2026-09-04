/**
 * Halcyon — a calm, bootstrapped-SaaS product template.
 *
 * Visual language: near-white pages lit by soft pastel blooms, two-tone
 * headlines that fade from ink to grey on the second line, hairline-bordered
 * white cards, small dark pill buttons beside a bright sky-blue accent, and a
 * full-bleed scenic band closing every page above a near-black footer.
 *
 * Everything routes through `schema()`, which appends the shared design /
 * typography / background / spacing / content-width controls, so every block is
 * editable on the canvas and in the side panel, can be narrowed or widened, and
 * is reusable on any page.
 */
import type { CSSProperties, ReactNode } from 'react'
import { useState } from 'react'
import { EditableImage, EditableRich, EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Media,
  SafeText,
  SectionShell,
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
import { PublicForm } from '../public-form'
import {
  descriptionField,
  eyebrowField,
  field,
  headingField,
  icon,
  image,
  link,
  navLinksField,
  repeater,
  schema,
  select,
  stickyField,
  text,
  textarea,
  toggle,
} from '../schema'
import { NavItem, Submenu, SubmenuCaret, hasSubmenu } from '../submenu'
import { defineBlock } from '../types'

/* ------------------------------------------------------------------ helpers */

/**
 * The signature headline: an ink-coloured first line with a grey second line
 * under it. `headingAlt` is optional, so the same component serves the plain
 * one-line headings too.
 */
function TwoTone({
  props,
  as = 'h2',
  className,
}: {
  props: Props
  as?: 'h1' | 'h2' | 'h3'
  className?: string
}) {
  const edit = editOf(props)
  const heading = str(props.heading)
  const alt = str(props.headingAlt)
  if (!heading && !alt && !edit) return null
  const Tag = as
  return (
    <Tag className={cx('ud-hc-title', as === 'h1' && 'ud-hc-title--xl', className)}>
      {heading || edit ? (
        <EditableText edit={edit} path={['heading']} value={heading} as="span" className="ud-hc-title__a" placeholder="Headline" />
      ) : null}
      {alt || edit ? (
        <EditableText edit={edit} path={['headingAlt']} value={alt} as="span" className="ud-hc-title__b" placeholder="Second line" />
      ) : null}
    </Tag>
  )
}

const twoToneFields = [headingField, text('headingAlt', 'Heading second line')]

/** Small bordered pill with an icon, used above a section heading. */
function Pill({ props, path = ['eyebrow'] }: { props: Props; path?: Array<string | number> }) {
  const edit = editOf(props)
  const value = str(props[String(path[path.length - 1])])
  if (!value && !edit) return null
  return (
    <span className="ud-hc-pill">
      <Icon name={str(props.eyebrowIcon, 'sparkles')} size={11} />
      <EditableText edit={edit} path={path} value={value} as="span" placeholder="Label" />
    </span>
  )
}

const pillFields = [eyebrowField, icon('eyebrowIcon', 'Badge icon')]

/** Section head: pill, two-tone heading, lead paragraph. */
function Head({ props, as = 'h2', align = 'center' }: { props: Props; as?: 'h1' | 'h2'; align?: 'left' | 'center' }) {
  const edit = editOf(props)
  const description = str(props.description)
  if (!edit && !str(props.heading) && !str(props.headingAlt) && !description && !str(props.eyebrow)) return null
  return (
    <div className={cx('ud-hc-head', align === 'center' && 'ud-hc-head--center')}>
      <Pill props={props} />
      <TwoTone props={props} as={as} />
      {description || edit ? (
        <SafeText value={description} className="ud-hc-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
      ) : null}
    </div>
  )
}

/** Dark, blue, or hairline-outline button. */
function HcButton({
  href,
  children,
  variant = 'dark',
}: {
  href: string
  children: ReactNode
  variant?: 'dark' | 'blue' | 'outline'
}) {
  return (
    <a className={cx('ud-hc-btn', `ud-hc-btn--${variant}`)} href={href || '#'}>
      {children}
    </a>
  )
}

function Buttons({ props, primary = 'dark' }: { props: Props; primary?: 'dark' | 'blue' }) {
  const edit = editOf(props)
  const a = str(props.buttonLabel)
  const b = str(props.secondaryLabel)
  if (!a && !b && !edit) return null
  return (
    <div className="ud-hc-buttons">
      {a || edit ? (
        <HcButton href={str(props.buttonUrl, '#')} variant={primary}>
          <EditableText edit={edit} path={['buttonLabel']} value={a} as="span" placeholder="Try for free" />
        </HcButton>
      ) : null}
      {b || edit ? (
        <HcButton href={str(props.secondaryUrl, '#')} variant="outline">
          <EditableText edit={edit} path={['secondaryLabel']} value={b} as="span" placeholder="Book a demo" />
        </HcButton>
      ) : null}
    </div>
  )
}

const buttonFields = [
  text('buttonLabel', 'Button label'),
  link('buttonUrl', 'Button link'),
  text('secondaryLabel', 'Second button label'),
  link('secondaryUrl', 'Second button link'),
]

/** Brand wordmark, replaced by an uploaded logo when one is set. */
function Logo({ props, light = false }: { props: Props; light?: boolean }) {
  const edit = editOf(props)
  const src = str(props.logoImage)
  const height = Math.min(Math.max(num(props.logoHeight, 26), 14), 120)
  const widthRaw = Number(props.logoWidth)
  const width = Number.isFinite(widthRaw) && widthRaw > 0 ? Math.min(Math.max(widthRaw, 16), 400) : 'auto'
  return (
    <a className={cx('ud-hc-logo', light && 'ud-hc-logo--light')} href={str(props.logoUrl, '/')}>
      {src ? (
        <span className="ud-hc-logo__img">
          <img src={src} alt={str(props.logo, 'Logo')} style={{ height, width, display: 'block' }} />
          <EditableImage edit={edit} path={['logoImage']} current={src} label="Replace logo" />
        </span>
      ) : (
        <>
          <span className="ud-hc-logo__mark" aria-hidden>
            <Icon name="leaf" size={14} />
          </span>
          <EditableText edit={edit} path={['logo']} value={str(props.logo, 'Halcyon')} as="span" className="ud-hc-logo__text" placeholder="Brand" />
        </>
      )}
    </a>
  )
}

const logoFields = [
  text('logo', 'Wordmark'),
  image('logoImage', 'Logo image'),
  field('logoHeight', 'slider', 'Logo height', 'design', { min: 14, max: 120, unit: 'px' }),
  field('logoWidth', 'slider', 'Logo width', 'design', { min: 16, max: 400, unit: 'px', help: 'Leave empty to keep the logo\'s natural aspect ratio.' }),
  link('logoUrl', 'Logo link'),
]

/** Blue-tick feature list. */
function Ticks({ props, path }: { props: Props; path: string }) {
  const edit = editOf(props)
  const values = lines(props[path], [])
  if (!values.length && !edit) return null
  return (
    <ul className="ud-hc-ticks">
      {values.map((value, index) => (
        <li key={index}>
          <Icon name="check" size={12} />
          <EditableText edit={edit} path={[path, index]} value={value} as="span" placeholder="Feature" />
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------ navbar.halcyon */

export const navbarHalcyon = defineBlock({
  type: 'navbar.halcyon',
  version: 1,
  category: 'navigation',
  label: 'Halcyon navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Halcyon',
    logoImage: '',
    logoUrl: '/',
    links: [
      { label: 'About us', url: '/about' },
      { label: 'Pricing', url: '/pricing' },
      { label: 'Changelog', url: '/changelog' },
      { label: 'Log in', url: '/contact' },
    ],
    secondaryLabel: 'Book a demo',
    secondaryUrl: '/contact',
    buttonLabel: 'Try for free',
    buttonUrl: '/pricing',
    sticky: true,
    animation: 'fade-down',
    animationTrigger: 'load',
  },
  schema: schema(
    ...logoFields,
    navLinksField('links', 'Links'),
    text('secondaryLabel', 'Outline button label'),
    link('secondaryUrl', 'Outline button link'),
    text('buttonLabel', 'Primary button label'),
    link('buttonUrl', 'Primary button link'),
    stickyField,
  ),
  component: function NavbarHalcyon(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    const anim = animationOf(props)
    return (
      <header
        className={cx('ud-hc', 'ud-hc-nav', bool(props.sticky, true) && 'ud-hc-nav--sticky', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container ud-hc-nav__bar">
          <Logo props={props} />
          <nav className={cx('ud-hc-nav__links', open && 'is-open')} aria-label="Primary">
            {items(props.links, []).map((item, index) => (
              <NavItem key={index} item={item}>
                <a className="ud-hc-nav__link" href={str(item.url, '#')}>
                  <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
                  <SubmenuCaret show={hasSubmenu(item)} />
                </a>
                <Submenu props={props} item={item} index={index} />
              </NavItem>
            ))}
          </nav>
          <div className="ud-hc-nav__end">
            {str(props.secondaryLabel) || edit ? (
              <HcButton href={str(props.secondaryUrl, '#')} variant="outline">
                <EditableText edit={edit} path={['secondaryLabel']} value={str(props.secondaryLabel)} as="span" placeholder="Book a demo" />
              </HcButton>
            ) : null}
            {str(props.buttonLabel) || edit ? (
              <HcButton href={str(props.buttonUrl, '#')} variant="blue">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} as="span" placeholder="Try for free" />
              </HcButton>
            ) : null}
            <button type="button" className="ud-hc-nav__toggle" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
              <Icon name="menu" size={18} />
            </button>
          </div>
        </div>
      </header>
    )
  },
})

/* -------------------------------------------------------------- hero.halcyon */

export const heroHalcyon = defineBlock({
  type: 'hero.halcyon',
  version: 1,
  category: 'hero',
  label: 'Halcyon hero',
  icon: 'Sparkles',
  defaultProps: {
    heading: 'Bonjour, I’m Halcyon',
    headingAlt: 'The support tool you’ll actually enjoy',
    description:
      'Replace your sprawling helpdesk with one calm inbox. Shared conversations, a knowledge base and an AI agent that knows your product, in a single place.',
    buttonLabel: 'Try for free',
    buttonUrl: '/pricing',
    secondaryLabel: 'Book a demo',
    secondaryUrl: '/contact',
    tabs: [
      { label: 'Shared inbox' },
      { label: 'Knowledge base' },
      { label: 'AI agent' },
      { label: 'Live chat' },
    ],
    image: '',
    bloom: true,
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(
    ...twoToneFields,
    descriptionField,
    ...buttonFields,
    repeater('tabs', 'Tabs', [text('label', 'Label')], { itemLabel: 'Tab' }),
    image('image', 'Product screenshot'),
    toggle('bloom', 'Pastel bloom backdrop', 'design'),
  ),
  component: function HeroHalcyon(props) {
    const edit = editOf(props)
    const tabs = items(props.tabs, [])
    const [active, setActive] = useState(0)
    return (
      <SectionShell
        props={props}
        tone="default"
        align="center"
        className={cx('ud-hc', 'ud-hc-hero', bool(props.bloom, true) && 'ud-hc-bloom')}
      >
        <Head props={props} as="h1" align="center" />
        <Buttons props={props} />
        {tabs.length ? (
          <div className="ud-hc-tabs" role="tablist">
            {tabs.map((tab, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={active === index}
                className={cx('ud-hc-tab', active === index && 'is-active')}
                onClick={() => setActive(index)}
              >
                <EditableText edit={edit} path={['tabs', index, 'label']} value={str(tab.label)} as="span" placeholder="Tab" />
              </button>
            ))}
          </div>
        ) : null}
        <div className="ud-hc-hero__frame">
          <Media src={props.image} alt={str(props.heading)} ratio="wide" edit={edit} path={['image']} />
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- pagehead.halcyon */

export const pageHeadHalcyon = defineBlock({
  type: 'pagehead.halcyon',
  version: 1,
  category: 'hero',
  label: 'Halcyon page header',
  icon: 'Layout',
  defaultProps: {
    eyebrow: '',
    eyebrowIcon: 'sparkles',
    heading: 'Transparent, simple pricing',
    headingAlt: 'made for small teams',
    description: 'Simple and transparent. Unlimited access to every feature without restriction, and unlimited conversations. Cancel anytime, no questions asked.',
    bloom: false,
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(...pillFields, ...twoToneFields, descriptionField, toggle('bloom', 'Pastel bloom backdrop', 'design')),
  component: function PageHeadHalcyon(props) {
    return (
      <SectionShell
        props={props}
        tone="default"
        align="center"
        className={cx('ud-hc', 'ud-hc-pagehead', bool(props.bloom) && 'ud-hc-bloom')}
      >
        <Head props={props} as="h1" align="center" />
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- pricecard.halcyon */

export const priceCardHalcyon = defineBlock({
  type: 'pricecard.halcyon',
  version: 1,
  category: 'pricing',
  label: 'Halcyon single price card',
  icon: 'CreditCard',
  defaultProps: {
    price: '$29',
    unit: 'per active user\nper month',
    features: 'Shared inbox\nLive chat with AI agent\nKnowledge base\nFree migration',
    buttonLabel: 'Try free for 14 days',
    buttonUrl: '/contact',
    fineprint: 'No credit card needed. Cancel anytime.',
    animation: 'fade-up',
  },
  schema: schema(
    text('price', 'Price'),
    textarea('unit', 'Unit (one per line)'),
    textarea('features', 'Features (one per line)'),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    text('fineprint', 'Fine print'),
  ),
  component: function PriceCardHalcyon(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-hc ud-hc-pricing">
        <div className="ud-hc-price">
          <div className="ud-hc-price__top">
            <EditableText edit={edit} path={['price']} value={str(props.price)} as="span" className="ud-hc-price__value" placeholder="$29" />
            <span className="ud-hc-price__unit">
              {lines(props.unit, []).map((line, index) => (
                <EditableText key={index} edit={edit} path={['unit', index]} value={line} as="span" placeholder="per user" />
              ))}
            </span>
          </div>
          <Ticks props={props} path="features" />
          {str(props.buttonLabel) || edit ? (
            <HcButton href={str(props.buttonUrl, '#')} variant="blue">
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} as="span" placeholder="Try free" />
            </HcButton>
          ) : null}
          <EditableText edit={edit} path={['fineprint']} value={str(props.fineprint)} as="p" className="ud-hc-price__fine" placeholder="No credit card needed." />
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------- faqcolumns.halcyon */

export const faqColumnsHalcyon = defineBlock({
  type: 'faqcolumns.halcyon',
  version: 1,
  category: 'faq',
  label: 'Halcyon two-column FAQ',
  icon: 'HelpCircle',
  defaultProps: {
    heading: '',
    headingAlt: '',
    items: [
      { question: 'What makes a user count as active?', answer: 'Active users can reply to customers directly. If that permission is off, the user is passive and is not charged for a seat, so you can invite the whole team at no extra cost.' },
      { question: 'How many passive users can I invite?', answer: 'There is no limit. Invite everyone who might need to read a thread or leave an internal note.' },
      { question: 'Will I be charged when the trial ends?', answer: 'No. We do not ask for a card up front, so you are only charged when you decide you are ready.' },
      { question: 'Do I need to sign a long contract?', answer: 'No. Billing is monthly and you can cancel any time. You keep access until the end of the period you already paid for.' },
      { question: 'Can I add or remove users later?', answer: 'Any time. Removing someone stops charges for them from the next billing period onward.' },
      { question: 'Which payment methods do you accept?', answer: 'All major cards. Payments run through our processor, so we never see or store your card details.' },
      { question: 'Can I import from my current helpdesk?', answer: 'Yes, and we do it for you. Our migration service covers every major helpdesk at no charge.' },
      { question: 'Where is my data hosted?', answer: 'On servers in the EU, under GDPR. Only you and, where strictly necessary, our on-call engineers can reach it.' },
    ],
    columns: 2,
    animation: 'fade-up',
  },
  schema: schema(
    ...twoToneFields,
    repeater('items', 'Questions', [text('question', 'Question'), textarea('answer', 'Answer')], { itemLabel: 'Question' }),
    select('columns', 'Columns', [['1', '1'], ['2', '2'], ['3', '3']], 'layout'),
  ),
  component: function FaqColumnsHalcyon(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-hc ud-hc-faq">
        {str(props.heading) || str(props.headingAlt) || edit ? <TwoTone props={props} /> : null}
        <div className="ud-hc-faq__grid" data-cols={String(num(props.columns, 2))}>
          {rows.map((item, index) => (
            <div key={index} className="ud-hc-faq__item">
              <EditableText
                edit={edit}
                path={['items', index, 'question']}
                value={str(item.question)}
                as="h3"
                className="ud-hc-faq__q"
                placeholder="Question"
              />
              <SafeText value={str(item.answer)} className="ud-hc-faq__a" edit={edit} path={['items', index, 'answer']} placeholder="Answer" />
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- ctascene.halcyon */

export const ctaSceneHalcyon = defineBlock({
  type: 'ctascene.halcyon',
  version: 1,
  category: 'cta',
  label: 'Halcyon closing scene',
  icon: 'Megaphone',
  defaultProps: {
    heading: 'Everything included. No surprises.',
    headingAlt: '$29/user/month, cancel anytime.',
    description: 'Your AI agents ride free. Unlimited conversations, unlimited features, no credit card needed during the 14-day trial.',
    buttonLabel: 'Try free for 14 days',
    buttonUrl: '/contact',
    secondaryLabel: 'Book a demo with a founder',
    secondaryUrl: '/contact',
    image: '',
    animation: 'fade-up',
  },
  schema: schema(...twoToneFields, descriptionField, ...buttonFields, image('image', 'Scene image')),
  component: function CtaSceneHalcyon(props) {
    const edit = editOf(props)
    const src = str(props.image)
    return (
      <section
        className={cx('ud-hc', 'ud-hc-scene', animationOf(props).className)}
        style={{ ...sectionVars(props, 'default'), ...animationOf(props).style } as CSSProperties}
        data-ud-anim={animationOf(props).trigger}
      >
        <div className="ud-container ud-hc-scene__copy">
          <TwoTone props={props} />
          {str(props.description) || edit ? (
            <SafeText value={str(props.description)} className="ud-hc-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
          ) : null}
          <Buttons props={props} />
        </div>
        {src || edit ? (
          <Media src={props.image} alt={str(props.heading)} ratio="wide" className="ud-hc-scene__img" edit={edit} path={['image']} />
        ) : null}
      </section>
    )
  },
})

/* ------------------------------------------------------- featurerow.halcyon */

export const featureRowHalcyon = defineBlock({
  type: 'featurerow.halcyon',
  version: 1,
  category: 'features',
  label: 'Halcyon channel cards',
  icon: 'Grid',
  defaultProps: {
    heading: 'Consolidate every support channel',
    headingAlt: 'into one shared inbox',
    description: 'Email, chat, social and forms all land in the same place, so nothing is answered twice and nothing is missed.',
    items: [
      { icon: 'mail', title: 'Email', text: 'Bring your own address or use ours. Threads stay readable, even after ten replies.' },
      { icon: 'message', title: 'Live chat', text: 'A widget that matches your product and hands off to a human when it should.' },
      { icon: 'book', title: 'Knowledge base', text: 'Public articles your AI agent can quote, kept in the same editor as your replies.' },
      { icon: 'users', title: 'Social', text: 'Mentions and direct messages arrive as ordinary conversations you can assign.' },
      { icon: 'code', title: 'API', text: 'Push in-product reports straight into the inbox with the context already attached.' },
      { icon: 'phone', title: 'Forms', text: 'Contact forms create a thread instead of an email you forget to reply to.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    ...twoToneFields,
    descriptionField,
    repeater('items', 'Channels', [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Channel' }),
  ),
  component: function FeatureRowHalcyon(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="surface" align="center" className="ud-hc ud-hc-channels">
        <Head props={props} align="center" />
        <div className="ud-hc-channels__row">
          {rows.map((item, index) => (
            <article key={index} className="ud-hc-channel">
              <span className="ud-hc-channel__icon" aria-hidden>
                <Icon name={str(item.icon, 'mail')} size={15} />
              </span>
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-hc-channel__title"
                placeholder="Channel"
              />
              <SafeText value={str(item.text)} className="ud-hc-channel__text" edit={edit} path={['items', index, 'text']} placeholder="What it does" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- showcase.halcyon */

export const showcaseHalcyon = defineBlock({
  type: 'showcase.halcyon',
  version: 1,
  category: 'features',
  label: 'Halcyon showcase cards',
  icon: 'Image',
  defaultProps: {
    eyebrow: 'Integrations',
    eyebrowIcon: 'layers',
    heading: 'Support that finally connects',
    headingAlt: 'to your team and your product',
    description: 'See the customer’s plan, their last order and their open bugs without leaving the reply box.',
    items: [
      { title: 'The whole account, in the thread', text: 'Plan, billing state and recent activity sit beside the conversation.', image: '', linkLabel: 'Read more', url: '#' },
      { title: 'Bug reports that reach the backlog', text: 'Turn a complaint into a ticket in your tracker without retyping it.', image: '', linkLabel: 'Read more', url: '#' },
      { title: 'Answers your team can trust', text: 'Internal notes and saved replies keep everyone telling the same story.', image: '', linkLabel: 'Read more', url: '#' },
    ],
    columns: 3,
    animation: 'fade-up',
  },
  schema: schema(
    ...pillFields,
    ...twoToneFields,
    descriptionField,
    repeater(
      'items',
      'Cards',
      [text('title', 'Title'), textarea('text', 'Text'), image('image', 'Image'), text('linkLabel', 'Link label'), link('url', 'Link')],
      { itemLabel: 'Card' },
    ),
    select('columns', 'Columns', [['2', '2'], ['3', '3'], ['4', '4']], 'layout'),
  ),
  component: function ShowcaseHalcyon(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-hc ud-hc-showcase">
        <Head props={props} align="center" />
        <div className="ud-hc-showcase__grid" data-cols={String(num(props.columns, 3))}>
          {rows.map((item, index) => (
            <article key={index} className="ud-hc-card">
              <div className="ud-hc-card__frame ud-hc-bloom">
                <Media src={item.image} alt={str(item.title)} ratio="landscape" edit={edit} path={['items', index, 'image']} />
              </div>
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-hc-card__title"
                placeholder="Title"
              />
              <SafeText value={str(item.text)} className="ud-hc-card__text" edit={edit} path={['items', index, 'text']} placeholder="Text" />
              {str(item.linkLabel) ? (
                <a className="ud-hc-link" href={str(item.url, '#')}>
                  <EditableText edit={edit} path={['items', index, 'linkLabel']} value={str(item.linkLabel)} as="span" placeholder="Read more" />
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- split.halcyon */

export const splitHalcyon = defineBlock({
  type: 'split.halcyon',
  version: 1,
  category: 'content',
  label: 'Halcyon split feature',
  icon: 'Columns',
  defaultProps: {
    eyebrow: 'Automations',
    eyebrowIcon: 'zap',
    heading: 'Automate the repetitive part',
    headingAlt: 'and keep the human part',
    description: 'Rules triage, tag and assign before anyone opens the inbox, so the queue you see is the queue that needs you.',
    bullets: 'Route by topic, plan or sentiment\nSnooze until the customer replies\nEscalate anything the AI is unsure about',
    linkLabel: 'See how it works',
    linkUrl: '#',
    image: '',
    reverse: false,
    animation: 'fade-up',
  },
  schema: schema(
    ...pillFields,
    ...twoToneFields,
    descriptionField,
    textarea('bullets', 'Bullets (one per line)'),
    text('linkLabel', 'Link label'),
    link('linkUrl', 'Link'),
    image('image', 'Image'),
    toggle('reverse', 'Image first', 'layout'),
  ),
  component: function SplitHalcyon(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" className={cx('ud-hc', 'ud-hc-split', bool(props.reverse) && 'ud-hc-split--reverse')}>
        <div className="ud-hc-split__grid">
          <div className="ud-hc-split__copy">
            <Head props={props} align="left" />
            <Ticks props={props} path="bullets" />
            {str(props.linkLabel) || edit ? (
              <a className="ud-hc-link" href={str(props.linkUrl, '#')}>
                <EditableText edit={edit} path={['linkLabel']} value={str(props.linkLabel)} as="span" placeholder="Learn more" />
              </a>
            ) : null}
          </div>
          <div className="ud-hc-split__frame ud-hc-bloom">
            <Media src={props.image} alt={str(props.heading)} ratio="landscape" edit={edit} path={['image']} />
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- quote.halcyon */

export const quoteHalcyon = defineBlock({
  type: 'quote.halcyon',
  version: 1,
  category: 'testimonials',
  label: 'Halcyon centred quote',
  icon: 'Quote',
  defaultProps: {
    quote:
      'We moved four inboxes and a spreadsheet into Halcyon in an afternoon. The part I did not expect is that support stopped feeling like an interruption and started feeling like product research.',
    name: 'Robin Aleixo',
    role: 'Founder, Tessellate',
    image: '',
    animation: 'fade-up',
  },
  schema: schema(textarea('quote', 'Quote'), text('name', 'Name'), text('role', 'Role'), image('image', 'Avatar')),
  component: function QuoteHalcyon(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-hc ud-hc-quote">
        <SafeText value={str(props.quote)} className="ud-hc-quote__text" edit={edit} path={['quote']} placeholder="What they said" />
        <div className="ud-hc-quote__who">
          <Media src={props.image} alt={str(props.name)} ratio="square" className="ud-hc-quote__avatar" edit={edit} path={['image']} />
          <div>
            <EditableText edit={edit} path={['name']} value={str(props.name)} as="div" className="ud-hc-quote__name" placeholder="Name" />
            <EditableText edit={edit} path={['role']} value={str(props.role)} as="div" className="ud-hc-quote__role" placeholder="Role" />
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- logos.halcyon */

export const logosHalcyon = defineBlock({
  type: 'logos.halcyon',
  version: 1,
  category: 'gallery',
  label: 'Halcyon integration row',
  icon: 'Grid',
  defaultProps: {
    heading: 'Integrates with your entire stack',
    headingAlt: '',
    description: 'Connect the tools your team already lives in. Nothing to maintain, nothing to babysit.',
    items: [
      { icon: 'cloud', label: 'Nimbus' },
      { icon: 'database', label: 'Ledger' },
      { icon: 'cpu', label: 'Cortex' },
      { icon: 'cart', label: 'Basket' },
      { icon: 'code', label: 'Forge' },
      { icon: 'calendar', label: 'Almanac' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    ...twoToneFields,
    descriptionField,
    repeater('items', 'Integrations', [icon('icon', 'Icon'), text('label', 'Label'), image('image', 'Logo')], { itemLabel: 'Integration' }),
  ),
  component: function LogosHalcyon(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-hc ud-hc-logos">
        <Head props={props} align="center" />
        <div className="ud-hc-logos__row">
          {rows.map((item, index) =>
            str(item.image) ? (
              <Media key={index} src={item.image} alt={str(item.label)} ratio="square" className="ud-hc-logos__img" edit={edit} path={['items', index, 'image']} />
            ) : (
              <span key={index} className="ud-hc-logos__chip" title={str(item.label)}>
                <Icon name={str(item.icon, 'globe')} size={18} />
              </span>
            ),
          )}
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------- principles.halcyon */

export const principlesHalcyon = defineBlock({
  type: 'principles.halcyon',
  version: 1,
  category: 'features',
  label: 'Halcyon principle cards',
  icon: 'Grid',
  defaultProps: {
    eyebrow: 'Principles',
    eyebrowIcon: 'target',
    heading: 'Our guiding principles',
    headingAlt: '',
    description: '',
    items: [
      { title: 'Support is product work', text: 'Every conversation tells you something about the product. Support should help the team learn, not just close tickets.' },
      { title: 'Calm beats complexity', text: 'Small teams do not need more dashboards, workflows and settings. They need fewer decisions and faster answers.' },
      { title: 'AI should help, not hide', text: 'It should answer what it knows, act where allowed, and escalate the moment a human would be better.' },
      { title: 'Pricing should be obvious', text: 'No mandatory demo. No sales rep. Just a price you can understand before you sign up.' },
      { title: 'Taste matters', text: 'Support software is used for hours every week. It should feel fast, clean and pleasant.' },
      { title: 'Opinionated over configurable', text: 'Most tools try to be everything. We make the product decisions so you do not configure your way out of complexity.' },
    ],
    columns: 3,
    animation: 'fade-up',
  },
  schema: schema(
    ...pillFields,
    ...twoToneFields,
    descriptionField,
    repeater('items', 'Principles', [text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Principle' }),
    select('columns', 'Columns', [['2', '2'], ['3', '3'], ['4', '4']], 'layout'),
  ),
  component: function PrinciplesHalcyon(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-hc ud-hc-principles">
        <Head props={props} align="center" />
        <div className="ud-hc-principles__grid" data-cols={String(num(props.columns, 3))}>
          {rows.map((item, index) => (
            <article key={index} className="ud-hc-tile">
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-hc-tile__title"
                placeholder="Principle"
              />
              <SafeText value={str(item.text)} className="ud-hc-tile__text" edit={edit} path={['items', index, 'text']} placeholder="What it means" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ---------------------------------------------------------- manifesto.halcyon */

export const manifestoHalcyon = defineBlock({
  type: 'manifesto.halcyon',
  version: 1,
  category: 'content',
  label: 'Halcyon founder letter',
  icon: 'FileText',
  defaultProps: {
    eyebrow: '',
    eyebrowIcon: 'heart',
    heading: 'Our philosophy',
    headingAlt: 'Make work calmer, kinder and faster.',
    lead: 'We built Halcyon because support tools became too much.',
    body:
      'We are two founders who spent the last decade building and running small software businesses.\n\nWe know what support feels like when the team is still small. A bug report lands while you are shipping. A refund request arrives during a deploy. Someone asks the same onboarding question for the fifth time this week, and the person answering is the founder, the developer, or the one person who can actually fix it.\n\nThat kind of support is valuable. It keeps you close to your users. It shows you what is confusing, what is broken, and what to build next.\n\nBut most support tools were not designed for that. They were designed for large teams, complex workflows, sales calls, dashboards and long setup cycles.\n\nSo we built the tool we wished we had.',
    signature: 'The founders',
    animation: 'fade-up',
  },
  schema: schema(
    ...pillFields,
    ...twoToneFields,
    text('lead', 'Lead sentence'),
    textarea('body', 'Body (blank line between paragraphs)'),
    text('signature', 'Signature'),
  ),
  component: function ManifestoHalcyon(props) {
    const edit = editOf(props)
    const paragraphs = String(str(props.body)).split(/\n\s*\n/).filter(Boolean)
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-hc ud-hc-manifesto">
        <Head props={props} as="h1" align="center" />
        <div className="ud-hc-manifesto__body">
          {str(props.lead) || edit ? (
            <EditableText edit={edit} path={['lead']} value={str(props.lead)} as="p" className="ud-hc-manifesto__lead" placeholder="Opening line" />
          ) : null}
          {paragraphs.map((paragraph, index) => (
            <EditableText key={index} edit={edit} path={['body', index]} value={paragraph} as="p" placeholder="Paragraph" />
          ))}
          {str(props.signature) || edit ? (
            <EditableText edit={edit} path={['signature']} value={str(props.signature)} as="p" className="ud-hc-manifesto__sign" placeholder="Signed" />
          ) : null}
        </div>
      </SectionShell>
    )
  },
})

/* -------------------------------------------------------------- team.halcyon */

export const teamHalcyon = defineBlock({
  type: 'team.halcyon',
  version: 1,
  category: 'team',
  label: 'Halcyon team panel',
  icon: 'Users',
  defaultProps: {
    heading: 'Our team',
    headingAlt: '',
    description: 'An intentionally small company, fully remote and async-first.',
    items: [
      { name: 'Amelie Ferrand', role: 'Founder + Product designer', location: 'Hamburg, Germany', image: '', icon: 'twitter', url: '#' },
      { name: 'Tomas Ekwall', role: 'Founder + Engineer', location: 'Belfort, France', image: '', icon: 'twitter', url: '#' },
    ],
    columns: 2,
    animation: 'fade-up',
  },
  schema: schema(
    ...twoToneFields,
    descriptionField,
    repeater(
      'items',
      'People',
      [text('name', 'Name'), text('role', 'Role'), text('location', 'Location'), image('image', 'Photo'), icon('icon', 'Social icon'), link('url', 'Social link')],
      { itemLabel: 'Person' },
    ),
    select('columns', 'Columns', [['1', '1'], ['2', '2'], ['3', '3']], 'layout'),
  ),
  component: function TeamHalcyon(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-hc ud-hc-team">
        <div className="ud-hc-team__panel">
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-hc-team__title" placeholder="Our team" />
          <SafeText value={str(props.description)} className="ud-hc-team__lead" edit={edit} path={['description']} placeholder="About the team" />
          <div className="ud-hc-team__grid" data-cols={String(num(props.columns, 2))}>
            {rows.map((item, index) => (
              <div key={index} className="ud-hc-person">
                <Media src={item.image} alt={str(item.name)} ratio="square" className="ud-hc-person__img" edit={edit} path={['items', index, 'image']} />
                <div>
                  <EditableText
                    edit={edit}
                    path={['items', index, 'name']}
                    value={str(item.name)}
                    as="h3"
                    className="ud-hc-person__name"
                    placeholder="Name"
                  />
                  <EditableText
                    edit={edit}
                    path={['items', index, 'role']}
                    value={str(item.role)}
                    as="p"
                    className="ud-hc-person__role"
                    placeholder="Role"
                  />
                  <EditableText
                    edit={edit}
                    path={['items', index, 'location']}
                    value={str(item.location)}
                    as="p"
                    className="ud-hc-person__place"
                    placeholder="City, Country"
                  />
                  <a className="ud-hc-person__social" href={str(item.url, '#')} aria-label={str(item.name, 'profile')}>
                    <Icon name={str(item.icon, 'twitter')} size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------- story.halcyon */

export const storyHalcyon = defineBlock({
  type: 'story.halcyon',
  version: 1,
  category: 'content',
  label: 'Halcyon story with photo',
  icon: 'Image',
  defaultProps: {
    heading: 'Hey, but why “Halcyon”?',
    headingAlt: '',
    body:
      'Halcyon days are the calm ones — a stretch of still weather in the middle of winter, named after a bird that was supposed to nest on the water while the sea held its breath.\n\nThat is the bar we set for a support tool. Not louder, not busier. A steady, trustworthy way to carry a message from your customer to you, and your answer back to them.\n\nIt is a small thing to aim for, and a hard one to keep.',
    image: '',
    secondaryImage: '',
    reverse: false,
    animation: 'fade-up',
  },
  schema: schema(
    ...twoToneFields,
    textarea('body', 'Body (blank line between paragraphs)'),
    image('image', 'Photo'),
    image('secondaryImage', 'Second photo'),
    toggle('reverse', 'Photos first', 'layout'),
  ),
  component: function StoryHalcyon(props) {
    const edit = editOf(props)
    const paragraphs = String(str(props.body)).split(/\n\s*\n/).filter(Boolean)
    return (
      <SectionShell props={props} tone="default" className={cx('ud-hc', 'ud-hc-story', bool(props.reverse) && 'ud-hc-story--reverse')}>
        <div className="ud-hc-story__grid">
          <div className="ud-hc-story__copy">
            <TwoTone props={props} as="h3" />
            {paragraphs.map((paragraph, index) => (
              <EditableText key={index} edit={edit} path={['body', index]} value={paragraph} as="p" placeholder="Paragraph" />
            ))}
          </div>
          <div className="ud-hc-story__photos">
            <div className="ud-hc-story__photo ud-hc-story__photo--a">
              <Media src={props.image} alt={str(props.heading)} ratio="portrait" edit={edit} path={['image']} />
            </div>
            <div className="ud-hc-story__photo ud-hc-story__photo--b">
              <Media src={props.secondaryImage} alt={str(props.heading)} ratio="landscape" edit={edit} path={['secondaryImage']} />
            </div>
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- compare.halcyon */

export const compareHalcyon = defineBlock({
  type: 'compare.halcyon',
  version: 1,
  category: 'features',
  label: 'Halcyon before / after',
  icon: 'Columns',
  defaultProps: {
    eyebrow: '',
    eyebrowIcon: 'target',
    heading: 'A return to knowing what is going on',
    headingAlt: '',
    description: 'Fewer screens to check, fewer settings to guess at, and an inbox you can hold in your head.',
    leftTitle: 'The usual helpdesk',
    leftItems: 'Twelve tabs and three notification badges\nWorkflow builders nobody on the team understands\nSeat pricing that punishes you for asking a colleague\nA sales call before you can see the price',
    rightTitle: 'Halcyon',
    rightItems: 'One inbox, one search box, one place to look\nRules you can read out loud in a sentence\nPassive teammates are free, always\nThe price is on the pricing page',
    animation: 'fade-up',
  },
  schema: schema(
    ...pillFields,
    ...twoToneFields,
    descriptionField,
    text('leftTitle', 'Left title'),
    textarea('leftItems', 'Left items (one per line)'),
    text('rightTitle', 'Right title'),
    textarea('rightItems', 'Right items (one per line)'),
  ),
  component: function CompareHalcyon(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="surface" align="center" className="ud-hc ud-hc-compare">
        <Head props={props} align="center" />
        <div className="ud-hc-compare__grid">
          <div className="ud-hc-compare__col ud-hc-compare__col--muted">
            <EditableText edit={edit} path={['leftTitle']} value={str(props.leftTitle)} as="h3" placeholder="Before" />
            <ul>
              {lines(props.leftItems, []).map((line, index) => (
                <li key={index}>
                  <Icon name="close" size={12} />
                  <EditableText edit={edit} path={['leftItems', index]} value={line} as="span" placeholder="Pain" />
                </li>
              ))}
            </ul>
          </div>
          <div className="ud-hc-compare__col ud-hc-compare__col--good">
            <EditableText edit={edit} path={['rightTitle']} value={str(props.rightTitle)} as="h3" placeholder="After" />
            <ul>
              {lines(props.rightItems, []).map((line, index) => (
                <li key={index}>
                  <Icon name="check" size={12} />
                  <EditableText edit={edit} path={['rightItems', index]} value={line} as="span" placeholder="Relief" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* --------------------------------------------------------- changelog.halcyon */

export const changelogHalcyon = defineBlock({
  type: 'changelog.halcyon',
  version: 1,
  category: 'content',
  label: 'Halcyon changelog',
  icon: 'FileText',
  defaultProps: {
    heading: '',
    headingAlt: '',
    items: [
      { date: 'March 2026', tag: 'New', title: 'Saved replies with variables', text: 'Reuse an answer without losing the customer’s name, plan or order number.' },
      { date: 'February 2026', tag: 'Improved', title: 'Faster search across threads', text: 'Search now covers internal notes and attachments, and returns in under a second on large inboxes.' },
      { date: 'January 2026', tag: 'New', title: 'AI agent escalation rules', text: 'Decide exactly when the agent should stop and hand the conversation to a person.' },
      { date: 'December 2025', tag: 'Fixed', title: 'Threading for forwarded email', text: 'Forwarded chains no longer split into two conversations.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    ...twoToneFields,
    repeater('items', 'Entries', [text('date', 'Date'), text('tag', 'Tag'), text('title', 'Title'), textarea('text', 'Text')], { itemLabel: 'Entry' }),
  ),
  component: function ChangelogHalcyon(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-hc ud-hc-changelog">
        {str(props.heading) || str(props.headingAlt) || edit ? <TwoTone props={props} /> : null}
        <div className="ud-hc-changelog__list">
          {rows.map((item, index) => (
            <article key={index} className="ud-hc-entry">
              <EditableText
                edit={edit}
                path={['items', index, 'date']}
                value={str(item.date)}
                as="div"
                className="ud-hc-entry__date"
                placeholder="March 2026"
              />
              <div className="ud-hc-entry__body">
                {str(item.tag) ? (
                  <EditableText
                    edit={edit}
                    path={['items', index, 'tag']}
                    value={str(item.tag)}
                    as="span"
                    className="ud-hc-entry__tag"
                    placeholder="New"
                  />
                ) : null}
                <EditableText
                  edit={edit}
                  path={['items', index, 'title']}
                  value={str(item.title)}
                  as="h3"
                  className="ud-hc-entry__title"
                  placeholder="What shipped"
                />
                <SafeText value={str(item.text)} className="ud-hc-entry__text" edit={edit} path={['items', index, 'text']} placeholder="Detail" />
              </div>
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- richtext.halcyon */

export const richTextHalcyon = defineBlock({
  type: 'richtext.halcyon',
  version: 1,
  category: 'content',
  label: 'Halcyon long copy',
  icon: 'FileText',
  defaultProps: {
    body: '<h2>Terms in plain language</h2><p>This page exists so you can read what you are agreeing to without a lawyer beside you. If anything here is unclear, write to us and we will rewrite it.</p><h3>What we store</h3><p>Your conversations, the people in them, and the settings you choose. Nothing else, and nothing sold onward.</p><p>You can export everything at any time, and deleting your account deletes it for real.</p>',
    contentWidth: 'narrow',
    animation: 'fade-up',
  },
  schema: schema(field('body', 'richtext', 'Body', 'content')),
  component: function RichTextHalcyon(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" className="ud-hc ud-hc-rich">
        <EditableRich edit={edit} path={['body']} html={str(props.body)} className="ud-hc-rich__body" />
      </SectionShell>
    )
  },
})

/* ----------------------------------------------------------- contact.halcyon */

export const contactHalcyon = defineBlock({
  type: 'contact.halcyon',
  version: 1,
  category: 'form',
  label: 'Halcyon contact form',
  icon: 'Mail',
  defaultProps: {
    eyebrow: 'Contact',
    eyebrowIcon: 'mail',
    heading: 'Talk to the people',
    headingAlt: 'who build the product',
    description: 'No sales department, no qualification call. Write to us and a founder answers, usually the same day.',
    details: [
      { icon: 'mail', label: 'Email', value: 'hello@halcyon.example', url: 'mailto:hello@halcyon.example' },
      { icon: 'message', label: 'Live chat', value: 'Bottom-right of this page', url: '#' },
      { icon: 'book', label: 'Help centre', value: 'Guides and answers', url: '#' },
      { icon: 'clock', label: 'Response time', value: 'Under 4 hours, Mon–Fri', url: '' },
    ],
    formTitle: 'Send us a message',
    formId: '',
    buttonLabel: 'Send message',
    topics: 'General question\nMigrating from another tool\nBilling\nSecurity and compliance\nSomething is broken',
    fineprint: 'We reply from a real inbox. No ticket numbers, no autoresponders.',
    animation: 'fade-up',
  },
  schema: schema(
    ...pillFields,
    ...twoToneFields,
    descriptionField,
    repeater('details', 'Contact details', [icon('icon', 'Icon'), text('label', 'Label'), text('value', 'Value'), link('url', 'Link')], {
      itemLabel: 'Detail',
    }),
    text('formTitle', 'Form title'),
    textarea('topics', 'Topic options (one per line)'),
    text('formId', 'Form ID'),
    text('buttonLabel', 'Submit label'),
    text('fineprint', 'Fine print'),
  ),
  component: function ContactHalcyon(props) {
    const edit = editOf(props)
    const details = items(props.details, [])
    return (
      <SectionShell props={props} tone="default" className="ud-hc ud-hc-contact">
        <div className="ud-hc-contact__grid">
          <div className="ud-hc-contact__copy">
            <Head props={props} align="left" />
            <ul className="ud-hc-contact__details">
              {details.map((item, index) => (
                <li key={index}>
                  <span className="ud-hc-contact__icon" aria-hidden>
                    <Icon name={str(item.icon, 'mail')} size={14} />
                  </span>
                  <div>
                    <EditableText
                      edit={edit}
                      path={['details', index, 'label']}
                      value={str(item.label)}
                      as="div"
                      className="ud-hc-contact__label"
                      placeholder="Email"
                    />
                    {str(item.url) ? (
                      <a className="ud-hc-link" href={str(item.url, '#')}>
                        <EditableText
                          edit={edit}
                          path={['details', index, 'value']}
                          value={str(item.value)}
                          as="span"
                          placeholder="hello@example.com"
                        />
                      </a>
                    ) : (
                      <EditableText
                        edit={edit}
                        path={['details', index, 'value']}
                        value={str(item.value)}
                        as="div"
                        className="ud-hc-contact__value"
                        placeholder="Detail"
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="ud-hc-contact__panel">
            <EditableText
              edit={edit}
              path={['formTitle']}
              value={str(props.formTitle)}
              as="h3"
              className="ud-hc-contact__formtitle"
              placeholder="Send us a message"
            />
            <PublicForm
              formId={str(props.formId) || undefined}
              submitLabel={str(props.buttonLabel, 'Send message')}
              fields={[
                { name: 'name', label: 'Your name', type: 'text', required: true, placeholder: 'Alex Moreau' },
                { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@company.com' },
                { name: 'company', label: 'Company', type: 'text', placeholder: 'Tessellate' },
                { name: 'topic', label: 'What is it about?', type: 'select', options: lines(props.topics, ['General question']) },
                { name: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Tell us what you need…' },
              ]}
            />
            {str(props.fineprint) || edit ? (
              <EditableText
                edit={edit}
                path={['fineprint']}
                value={str(props.fineprint)}
                as="p"
                className="ud-hc-contact__fine"
                placeholder="We reply from a real inbox."
              />
            ) : null}
          </div>
        </div>
      </SectionShell>
    )
  },
})

/* ------------------------------------------------------------ footer.halcyon */

export const footerHalcyon = defineBlock({
  type: 'footer.halcyon',
  version: 1,
  category: 'footer',
  label: 'Halcyon footer',
  icon: 'Layout',
  defaultProps: {
    columns: [
      {
        title: 'Product',
        links: [
          { label: 'Pricing', url: '/pricing' },
          { label: 'Documentation', url: '#' },
          { label: 'API reference', url: '#' },
          { label: 'Changelog', url: '/changelog' },
          { label: 'About', url: '/about' },
        ],
      },
      {
        title: 'Compare',
        links: [
          { label: 'Shared inbox tools', url: '#' },
          { label: 'Helpdesk suites', url: '#' },
          { label: 'Live chat widgets', url: '#' },
          { label: 'Knowledge bases', url: '#' },
          { label: 'AI support agents', url: '#' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { label: 'Terms of service', url: '#' },
          { label: 'Privacy policy', url: '#' },
          { label: 'GDPR compliance', url: '#' },
          { label: 'Imprint', url: '#' },
        ],
      },
    ],
    brandTitle: 'Halcyon',
    brandLinks: [
      { label: 'hello@halcyon.example', url: 'mailto:hello@halcyon.example' },
      { label: 'Help centre', url: '#' },
      { label: 'API docs', url: '#' },
      { label: 'Status page', url: '#' },
    ],
    copyright: '© Halcyon',
    animation: 'fade-up',
  },
  schema: schema(
    repeater(
      'columns',
      'Link columns',
      [text('title', 'Title'), repeater('links', 'Links', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' })],
      { itemLabel: 'Column' },
    ),
    text('brandTitle', 'Brand column title'),
    repeater('brandLinks', 'Brand column links', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' }),
    text('copyright', 'Copyright'),
  ),
  component: function FooterHalcyon(props) {
    const edit = editOf(props)
    const columns = items(props.columns, [])
    const anim = animationOf(props)
    return (
      <footer
        className={cx('ud-hc', 'ud-hc-footer', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container ud-hc-footer__grid">
          {columns.map((column, index) => (
            <div key={index} className="ud-hc-footer__col">
              <EditableText
                edit={edit}
                path={['columns', index, 'title']}
                value={str(column.title)}
                as="h3"
                placeholder="Column"
              />
              <ul>
                {items(column.links, []).map((item, linkIndex) => (
                  <li key={linkIndex}>
                    <a href={str(item.url, '#')}>
                      <EditableText
                        edit={edit}
                        path={['columns', index, 'links', linkIndex, 'label']}
                        value={str(item.label)}
                        as="span"
                        placeholder="Link"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="ud-hc-footer__col ud-hc-footer__col--brand">
            <EditableText edit={edit} path={['brandTitle']} value={str(props.brandTitle)} as="h3" placeholder="Brand" />
            <ul>
              {items(props.brandLinks, []).map((item, index) => (
                <li key={index}>
                  <a href={str(item.url, '#')}>
                    <EditableText edit={edit} path={['brandLinks', index, 'label']} value={str(item.label)} as="span" placeholder="Link" />
                  </a>
                </li>
              ))}
            </ul>
            <EditableText edit={edit} path={['copyright']} value={str(props.copyright)} as="p" className="ud-hc-footer__copy" placeholder="© Brand" />
          </div>
        </div>
      </footer>
    )
  },
})
