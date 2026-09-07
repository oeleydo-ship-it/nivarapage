/**
 * Finlio — a personal-finance / fintech SaaS template.
 *
 * Visual language: pale-cream page background showing between big rounded
 * "floating card" sections, a deep-green brand colour carrying every dark
 * band and heading, one bright lime-green accent for highlighted words,
 * buttons and stat gradients, and Archivo set at a confident medium weight.
 *
 * Every block routes through `schema()`, which appends the shared design /
 * typography / background / spacing / content-width controls, so each one is
 * editable on the canvas and in the side panel and stays reusable on any
 * page. Buttons, grids and media reuse the shared primitives (`Button`,
 * `CtaGroup`, `Grid`, `Media`) rather than bespoke components, so the family
 * recolours from theme tokens instead of hard-coded styling.
 */
import { useState, type CSSProperties } from 'react'
import { EditableImage, EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Button,
  Grid,
  Heading,
  Media,
  SafeText,
  SectionShell,
  bool,
  cx,
  items,
  sectionVars,
  str,
} from '../primitives'
import {
  descriptionField,
  headingField,
  image,
  link,
  navLinksField,
  repeater,
  schema,
  stickyField,
  text,
  textarea,
} from '../schema'
import { defineBlock } from '../types'

/* ------------------------------------------------------------------ head */

function FlHead({ props, align = 'center' }: { props: Record<string, unknown>; align?: 'left' | 'center' }) {
  const edit = editOf(props)
  const heading = str(props.heading)
  const highlight = str(props.headingHighlight)
  const description = str(props.description)
  if (!edit && !heading && !description) return null
  return (
    <div className={cx('ud-fl-head', align === 'center' && 'ud-fl-head--center')}>
      <span className="ud-fl-dash" aria-hidden />
      {heading || edit ? (
        <h2 className="ud-fl-title">
          <EditableText edit={edit} path={['heading']} value={heading} as="span" placeholder="Heading" />{' '}
          {highlight || edit ? (
            <EditableText edit={edit} path={['headingHighlight']} value={highlight} as="span" className="ud-fl-title__accent" placeholder="highlight" />
          ) : null}
        </h2>
      ) : null}
      {description || edit ? (
        <SafeText value={description} className="ud-fl-lead" edit={edit} path={['description']} placeholder="Short description" />
      ) : null}
    </div>
  )
}

const logoFields = [text('logo', 'Wordmark'), text('tagline', 'Tagline'), image('logoImage', 'Logo image'), link('logoUrl', 'Logo link')]

function FinlioLogo({ props }: { props: Record<string, unknown> }) {
  const edit = editOf(props)
  const src = str(props.logoImage)
  const tagline = str(props.tagline)
  return (
    <a className="ud-fl-logo" href={str(props.logoUrl, '/')}>
      {src ? (
        <span className="ud-fl-logo__img">
          <img src={src} alt={str(props.logo, 'Logo')} />
          <EditableImage edit={edit} path={['logoImage']} current={src} label="Replace logo" />
        </span>
      ) : (
        <span className="ud-fl-logo__mark" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      )}
      <span className="ud-fl-logo__text">
        <EditableText edit={edit} path={['logo']} value={str(props.logo, 'Finlio')} as="span" className="ud-fl-logo__name" placeholder="Brand" />
        {tagline || edit ? (
          <EditableText edit={edit} path={['tagline']} value={tagline} as="span" className="ud-fl-logo__tag" placeholder="Tagline" />
        ) : null}
      </span>
    </a>
  )
}

/* ---------------------------------------------------------- navbar.finlio */

export const navbarFinlio = defineBlock({
  type: 'navbar.finlio',
  version: 1,
  category: 'navigation',
  label: 'Finlio navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Finlio',
    tagline: 'Your finances, our mission',
    logoImage: '',
    logoUrl: '/',
    links: [
      { label: 'Home', url: '/' },
      { label: 'Features', url: '/features' },
      { label: 'Pricing', url: '/pricing' },
      { label: 'About', url: '/about' },
      { label: 'Contact', url: '/contact' },
    ],
    buttonLabel: 'Start 30 day trial',
    buttonUrl: '/contact',
    sticky: true,
    animation: 'fade-down',
    animationTrigger: 'load',
  },
  schema: schema(...logoFields, navLinksField('links', 'Links'), text('buttonLabel', 'Button label'), link('buttonUrl', 'Button link'), stickyField),
  component: function NavbarFinlio(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    return (
      <header className={cx('ud-fl', 'ud-fl-nav', bool(props.sticky, true) && 'ud-fl-nav--sticky')} style={sectionVars(props, 'default') as CSSProperties}>
        <div className="ud-container ud-fl-nav__bar">
          <FinlioLogo props={props} />
          <nav className={cx('ud-fl-nav__links', open && 'is-open')} aria-label="Primary">
            {items(props.links, []).map((item, index) => (
              <a key={index} className="ud-fl-nav__link" href={str(item.url, '#')}>
                <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
              </a>
            ))}
          </nav>
          <div className="ud-fl-nav__end">
            {str(props.buttonLabel) || edit ? (
              <Button href={str(props.buttonUrl, '#')} variant="primary" className="ud-fl-nav__cta">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
              </Button>
            ) : null}
            <button
              type="button"
              className="ud-fl-nav__toggle"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              <Icon name={open ? 'close' : 'menu'} size={20} />
            </button>
          </div>
        </div>
      </header>
    )
  },
})

/* ----------------------------------------------------------- pagehead.finlio */

export const pageHeadFinlio = defineBlock({
  type: 'pagehead.finlio',
  version: 1,
  category: 'hero',
  label: 'Finlio page header',
  icon: 'Layout',
  defaultProps: {
    heading: 'About Us',
    homeLabel: 'Home',
    homeUrl: '/',
    parentLabel: 'Pages',
  },
  schema: schema(headingField, text('homeLabel', 'Home link label'), link('homeUrl', 'Home link'), text('parentLabel', 'Middle crumb label')),
  component: function PageHeadFinlio(props) {
    const edit = editOf(props)
    const heading = str(props.heading, 'Page')
    return (
      <SectionShell props={props} tone="dark" align="center" className="ud-fl ud-fl-pagehead">
        <EditableText edit={edit} path={['heading']} value={heading} as="h1" className="ud-fl-title ud-fl-title--xl" placeholder="Page title" />
        <nav className="ud-fl-crumbs" aria-label="Breadcrumb">
          <a href={str(props.homeUrl, '/')}>
            <EditableText edit={edit} path={['homeLabel']} value={str(props.homeLabel, 'Home')} placeholder="Home" />
          </a>
          <span aria-hidden>/</span>
          <EditableText edit={edit} path={['parentLabel']} value={str(props.parentLabel, 'Pages')} placeholder="Pages" />
          <span aria-hidden>/</span>
          <span className="is-current">{heading}</span>
        </nav>
      </SectionShell>
    )
  },
  settings: null,
})

/* -------------------------------------------------------------- hero.finlio */

export const heroFinlio = defineBlock({
  type: 'hero.finlio',
  version: 1,
  category: 'hero',
  label: 'Finlio card hero',
  icon: 'Sparkles',
  defaultProps: {
    heading: 'Innovative solutions for',
    headingHighlight: 'your finances',
    description: 'Make your wallet work for you!',
    buttonLabel: 'Start 30 day trial',
    buttonUrl: '/contact',
    secondaryLabel: 'Watch Promo Video',
    secondaryUrl: '#',
    image: '',
    statValue: '$398.50',
    statLabel: 'Balance',
    statTrend: '+7.2%',
  },
  schema: schema(
    headingField,
    text('headingHighlight', 'Highlighted words'),
    descriptionField,
    text('buttonLabel', 'Primary button label'),
    link('buttonUrl', 'Primary button link'),
    text('secondaryLabel', 'Secondary button label'),
    link('secondaryUrl', 'Secondary button link'),
    image('image', 'Side image'),
    text('statValue', 'Floating stat value'),
    text('statLabel', 'Floating stat label'),
    text('statTrend', 'Floating stat trend'),
  ),
  component: function HeroFinlio(props) {
    const edit = editOf(props)
    const hasImage = Boolean(str(props.image)) || Boolean(edit)
    return (
      <SectionShell props={props} tone="dark" className={cx('ud-fl', 'ud-fl-hero', hasImage && 'has-image')}>
        <div className="ud-fl-hero__inner">
          <div className="ud-fl-hero__copy">
            <span className="ud-fl-dash" aria-hidden />
            <h1 className="ud-fl-title ud-fl-title--xl">
              <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="span" placeholder="Heading" />{' '}
              <EditableText edit={edit} path={['headingHighlight']} value={str(props.headingHighlight)} as="span" className="ud-fl-title__accent" placeholder="highlight" />
            </h1>
            {str(props.description) || edit ? (
              <SafeText value={str(props.description)} className="ud-fl-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
            ) : null}
            <div className="ud-fl-hero__actions">
              {str(props.buttonLabel) || edit ? (
                <Button href={str(props.buttonUrl, '#')} variant="accent">
                  <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
                </Button>
              ) : null}
              {str(props.secondaryLabel) || edit ? (
                <Button href={str(props.secondaryUrl, '#')} variant="outline">
                  <EditableText edit={edit} path={['secondaryLabel']} value={str(props.secondaryLabel)} placeholder="Secondary" />
                </Button>
              ) : null}
            </div>
          </div>
          {hasImage ? (
            <div className="ud-fl-hero__media">
              <Media src={props.image} alt="" ratio="landscape" edit={edit} path={['image']} />
              {str(props.statTrend) || edit ? (
                <span className="ud-fl-hero__badge ud-fl-hero__badge--trend">
                  <Icon name="trending-up" size={12} />
                  <EditableText edit={edit} path={['statTrend']} value={str(props.statTrend)} as="span" placeholder="+0%" />
                </span>
              ) : null}
              {str(props.statValue) || edit ? (
                <span className="ud-fl-hero__badge ud-fl-hero__badge--card">
                  <EditableText edit={edit} path={['statValue']} value={str(props.statValue)} as="span" className="ud-fl-hero__badge-value" placeholder="$0.00" />
                  <EditableText edit={edit} path={['statLabel']} value={str(props.statLabel)} as="span" placeholder="Label" />
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- intro.finlio */

export const introFinlio = defineBlock({
  type: 'intro.finlio',
  version: 1,
  category: 'content',
  label: 'Finlio centered intro',
  icon: 'Info',
  defaultProps: {
    heading: 'The road to financial stability',
    headingHighlight: 'starts here',
    description: 'Powerful, self-serve product and growth analytics to help you convert, engage, and retain more users. Trusted by over 4,000 startups.',
  },
  schema: schema(headingField, text('headingHighlight', 'Highlighted words'), descriptionField),
  component: function IntroFinlio(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-fl ud-fl-intro">
        <span className="ud-fl-intro__icon" aria-hidden>
          <Icon name="chart" size={22} />
        </span>
        <FlHead props={props} align="center" />
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------- features.finlio */

const dashboardFeatures = [
  { title: 'Budgeting', text: 'Set monthly limits by category and get a nudge before you go over, not after.', value: '$398.50', valueLabel: 'Balance', trend: '+7.2%' },
  { title: 'Savings planning', text: 'Round up spare change from every purchase and route it straight into your goals.', value: '$398.50', valueLabel: 'This month', trend: '+12%' },
  { title: 'Investment monitoring', text: 'Track every account in one place, with plain-language alerts when something needs attention.', value: '28%', valueLabel: 'Portfolio growth', trend: '+3.1%' },
  { title: 'Investment tracking', text: 'See exactly which holdings are pulling your returns up, month over month.', value: '$398.50', valueLabel: 'Balance', trend: '+7.2%' },
]

export const featuresFinlio = defineBlock({
  type: 'features.finlio',
  version: 1,
  category: 'features',
  label: 'Finlio dashboard feature stack',
  icon: 'Layers',
  defaultProps: {
    items: dashboardFeatures,
  },
  schema: schema(
    repeater(
      'items',
      'Features',
      [text('title', 'Title'), textarea('text', 'Description'), text('value', 'Stat value'), text('valueLabel', 'Stat label'), text('trend', 'Trend')],
      { itemLabel: 'Feature' },
    ),
  ),
  component: function FeaturesFinlio(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-fl ud-fl-features">
        <div className="ud-fl-features__list">
          {rows.map((item, index) => (
            <div key={index} className={cx('ud-fl-feature', index % 2 === 1 && 'is-reverse')}>
              <div className="ud-fl-feature__copy">
                <Heading level={3} edit={edit} path={['items', index, 'title']}>
                  {str(item.title, 'Feature')}
                </Heading>
                <SafeText value={item.text} className="ud-fl-lead" edit={edit} path={['items', index, 'text']} placeholder="Description" />
              </div>
              <div className="ud-fl-feature__card">
                <div className="ud-fl-feature__stat">
                  <EditableText edit={edit} path={['items', index, 'value']} value={str(item.value)} as="span" className="ud-fl-feature__value" placeholder="0" />
                  {str(item.trend) || edit ? (
                    <span className="ud-fl-feature__trend">
                      <Icon name="trending-up" size={13} />
                      <EditableText edit={edit} path={['items', index, 'trend']} value={str(item.trend)} as="span" placeholder="+0%" />
                    </span>
                  ) : null}
                </div>
                <EditableText edit={edit} path={['items', index, 'valueLabel']} value={str(item.valueLabel)} as="p" className="ud-fl-feature__label" placeholder="Label" />
                <div className="ud-fl-feature__bars" aria-hidden>
                  {[38, 62, 44, 80, 56].map((h, barIndex) => (
                    <span key={barIndex} style={{ '--ud-fl-bar-h': `${h}%` } as CSSProperties} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ----------------------------------------------------------- statement.finlio */

export const statementFinlio = defineBlock({
  type: 'statement.finlio',
  version: 1,
  category: 'features',
  label: 'Finlio statement + video',
  icon: 'Play',
  defaultProps: {
    heading: 'Whether you have a team of 2 or 200, our shared workspace keeps everyone on the same page and in the loop.',
    metrics: [
      { label: 'Automated categorisation', value: '60%' },
      { label: 'Faster monthly close', value: '75%' },
    ],
    videoImage: '',
    videoUrl: '#',
  },
  schema: schema(
    headingField,
    repeater('metrics', 'Progress rows', [text('label', 'Label'), text('value', 'Value')], { itemLabel: 'Row' }),
    image('videoImage', 'Video preview image'),
    link('videoUrl', 'Video link'),
  ),
  component: function StatementFinlio(props) {
    const edit = editOf(props)
    const rows = items(props.metrics, [])
    return (
      <SectionShell props={props} tone="dark" className="ud-fl ud-fl-statement">
        <span className="ud-fl-dash" aria-hidden />
        <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-fl-title" placeholder="Heading" />
        {rows.length ? (
          <div className="ud-fl-statement__metrics">
            {rows.map((row, index) => (
              <div key={index} className="ud-fl-metric">
                <div className="ud-fl-metric__top">
                  <EditableText edit={edit} path={['metrics', index, 'label']} value={str(row.label)} as="span" placeholder="Label" />
                  <EditableText edit={edit} path={['metrics', index, 'value']} value={str(row.value)} as="span" className="ud-fl-metric__value" placeholder="0%" />
                </div>
                <div className="ud-fl-metric__bar">
                  <span style={{ width: str(row.value, '0%') }} />
                </div>
              </div>
            ))}
          </div>
        ) : null}
        <a className="ud-fl-statement__video" href={str(props.videoUrl, '#')}>
          <Media src={props.videoImage} alt="" ratio="ultrawide" edit={edit} path={['videoImage']} />
          <span className="ud-fl-play" aria-hidden>
            <Icon name="play" size={20} filled />
          </span>
        </a>
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------------- stats.finlio */

export const statsFinlio = defineBlock({
  type: 'stats.finlio',
  version: 1,
  category: 'features',
  label: 'Finlio big stat',
  icon: 'TrendingUp',
  defaultProps: {
    value: '98%',
    heading: "Satisfied users can't be wrong",
    description: 'Powerful, self-serve product and growth analytics to help you convert, engage, and retain more users. Trusted by over 4,000 startups.',
  },
  schema: schema(text('value', 'Stat value'), headingField, descriptionField),
  component: function StatsFinlio(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-fl ud-fl-stats">
        <span className="ud-fl-dash" aria-hidden />
        <EditableText edit={edit} path={['value']} value={str(props.value)} as="div" className="ud-fl-stats__value" placeholder="0%" />
        <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-fl-title" placeholder="Heading" />
        {str(props.description) || edit ? (
          <SafeText value={str(props.description)} className="ud-fl-lead" edit={edit} path={['description']} placeholder="Description" />
        ) : null}
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------- testimonials.finlio */

export const testimonialsFinlio = defineBlock({
  type: 'testimonials.finlio',
  version: 1,
  category: 'testimonials',
  label: 'Finlio review cards',
  icon: 'Quote',
  defaultProps: {
    items: [
      {
        badge: 'Confirmed Purchase',
        quote: 'This is the best financial management app I have ever used. I no longer just track expenses — I plan investments and save for real goals, and it has changed my financial life for the better.',
        name: 'Jack Butterbean',
        avatar: '',
      },
      {
        badge: 'Confirmed Purchase',
        quote: 'I had never managed to stay on budget before, but this app made it possible. The spending analysis is intuitive and it genuinely helped me understand where my money was going.',
        name: 'Elizabeth Severalson',
        avatar: '',
      },
      {
        badge: 'Confirmed Purchase',
        quote: 'This app changed my whole approach to finance. I can track spending, build budgets and reach savings goals in one place — I recommend it to anyone who wants control of their money.',
        name: 'Markus Stanford',
        avatar: '',
      },
    ],
  },
  schema: schema(repeater('items', 'Reviews', [text('badge', 'Badge'), textarea('quote', 'Quote'), text('name', 'Name'), image('avatar', 'Photo')], { itemLabel: 'Review' })),
  component: function TestimonialsFinlio(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-fl ud-fl-testimonials">
        <Grid cols={Math.min(rows.length || 1, 3)} gap={24}>
          {rows.map((item, index) => (
            <figure key={index} className="ud-fl-review">
              {str(item.badge) || edit ? (
                <span className="ud-fl-review__badge">
                  <EditableText edit={edit} path={['items', index, 'badge']} value={str(item.badge)} placeholder="Badge" />
                </span>
              ) : null}
              <Icon name="quote" size={22} />
              <SafeText value={str(item.quote)} className="ud-fl-review__text" edit={edit} path={['items', index, 'quote']} placeholder="Quote" />
              <figcaption>
                <Media src={item.avatar} alt={str(item.name)} ratio="square" className="ud-fl-review__avatar" edit={edit} path={['items', index, 'avatar']} />
                <EditableText edit={edit} path={['items', index, 'name']} value={str(item.name)} as="span" placeholder="Name" />
              </figcaption>
            </figure>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------ payments.finlio */

export const paymentsFinlio = defineBlock({
  type: 'payments.finlio',
  version: 1,
  category: 'content',
  label: 'Finlio payment methods',
  icon: 'CreditCard',
  defaultProps: {
    heading: 'Integrated with the most popular',
    headingHighlight: 'payments',
    description: 'Connect the cards and wallets your customers already use — funds settle the same way regardless of how they choose to pay.',
    methods: [{ label: 'Klarna' }, { label: 'Google Pay' }, { label: 'Apple Pay' }, { label: 'Visa' }, { label: 'Mastercard' }, { label: 'PayPal' }],
  },
  schema: schema(headingField, text('headingHighlight', 'Highlighted words'), descriptionField, repeater('methods', 'Payment methods', [text('label', 'Label')], { itemLabel: 'Method' })),
  component: function PaymentsFinlio(props) {
    const edit = editOf(props)
    const methods = items(props.methods, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-fl ud-fl-payments">
        <FlHead props={props} align="center" />
        <div className="ud-fl-payments__row">
          {methods.map((method, index) => (
            <span key={index} className="ud-fl-payments__pill">
              <EditableText edit={edit} path={['methods', index, 'label']} value={str(method.label)} placeholder="Brand" />
            </span>
          ))}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------------ faq.finlio */

export const faqFinlio = defineBlock({
  type: 'faq.finlio',
  version: 1,
  category: 'faq',
  label: 'Finlio simple FAQ',
  icon: 'HelpCircle',
  defaultProps: {
    heading: 'Frequently asked questions',
    description: "Everything you need to know about the product and billing. Can't find the answer you're looking for? Please chat to our friendly team.",
    items: [
      { question: 'Is there a free trial available?', answer: 'Yes — every plan starts with a 30-day free trial, no card required until you decide to continue.' },
      { question: 'Can I change my plan later?', answer: 'Anytime. Upgrades apply immediately and downgrades take effect at your next billing date.' },
      { question: 'What is your cancellation policy?', answer: 'Cancel from your account settings whenever you like — you keep access through the end of the period you already paid for.' },
      { question: 'Can other info be added to an invoice?', answer: 'Yes, add a VAT number, PO number or billing address from the invoicing tab in settings.' },
      { question: 'How does billing work?', answer: 'You are billed monthly or annually depending on the plan you choose, by card or bank transfer on annual plans.' },
      { question: 'How do I change my account email?', answer: 'Go to Account settings, update your email, and confirm the change from the link we send you.' },
    ],
  },
  schema: schema(headingField, descriptionField, repeater('items', 'Questions', [text('question', 'Question'), textarea('answer', 'Answer')], { itemLabel: 'Question' })),
  component: function FaqFinlio(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const [open, setOpen] = useState(0)
    return (
      <SectionShell props={props} tone="default" className="ud-fl ud-fl-faq">
        <div className="ud-fl-faq__head">
          <span className="ud-fl-faq__icon" aria-hidden>
            <Icon name="message" size={22} />
          </span>
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-fl-title" placeholder="Heading" />
          {str(props.description) || edit ? (
            <SafeText value={str(props.description)} className="ud-fl-lead" edit={edit} path={['description']} placeholder="Description" />
          ) : null}
        </div>
        <div className="ud-fl-faq__list">
          {rows.map((item, index) => {
            const isOpen = Boolean(edit) || open === index
            return (
              <div key={index} className={cx('ud-fl-faq__row', isOpen && 'is-open')}>
                <button type="button" className="ud-fl-faq__q" aria-expanded={isOpen} onClick={() => setOpen((current) => (current === index ? -1 : index))}>
                  <EditableText edit={edit} path={['items', index, 'question']} value={str(item.question)} as="span" placeholder="Question" />
                  <span className="ud-fl-faq__sign" aria-hidden>
                    <Icon name={isOpen ? 'minus' : 'plus'} size={16} />
                  </span>
                </button>
                <div className="ud-fl-faq__a" hidden={!isOpen}>
                  <SafeText value={str(item.answer)} edit={edit} path={['items', index, 'answer']} placeholder="Answer" />
                </div>
              </div>
            )
          })}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------------- cta.finlio */

export const ctaFinlio = defineBlock({
  type: 'cta.finlio',
  version: 1,
  category: 'cta',
  label: 'Finlio photo CTA',
  icon: 'Megaphone',
  defaultProps: {
    heading: 'Pay $0/month.',
    headingHighlight: 'Earn up to 5.40%',
    description: 'No monthly fees, no minimum balance, and a savings rate that beats the national average by miles.',
    buttonLabel: 'Start 30 day trial',
    buttonUrl: '/contact',
    backgroundType: 'image',
    backgroundImage: '',
    overlayColor: '#0c1f1c',
    overlayOpacity: 52,
    lightText: true,
  },
  schema: schema(headingField, text('headingHighlight', 'Second line'), descriptionField, text('buttonLabel', 'Button label'), link('buttonUrl', 'Button link')),
  component: function CtaFinlio(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="dark" align="center" className="ud-fl ud-fl-cta">
        <span className="ud-fl-dash" aria-hidden />
        <h2 className="ud-fl-title">
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="span" placeholder="Heading" />
          <br />
          <EditableText edit={edit} path={['headingHighlight']} value={str(props.headingHighlight)} as="span" placeholder="Second line" />
        </h2>
        {str(props.description) || edit ? (
          <SafeText value={str(props.description)} className="ud-fl-lead" edit={edit} path={['description']} placeholder="Description" />
        ) : null}
        {str(props.buttonLabel) || edit ? (
          <Button href={str(props.buttonUrl, '#')} variant="accent" className="ud-fl-cta__btn">
            <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
          </Button>
        ) : null}
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------ footer.finlio */

export const footerFinlio = defineBlock({
  type: 'footer.finlio',
  version: 1,
  category: 'footer',
  label: 'Finlio footer',
  icon: 'Layout',
  defaultProps: {
    logo: 'Finlio',
    tagline: '',
    logoImage: '',
    logoUrl: '/',
    description: 'A calmer way to manage money — budgets, savings and investing in one place.',
    columns: [
      {
        title: 'Product',
        links: [
          { label: 'Overview', url: '#' },
          { label: 'Features', url: '/features' },
          { label: 'Pricing', url: '/pricing' },
          { label: 'Releases', url: '#' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'About', url: '/about' },
          { label: 'News', url: '#' },
          { label: 'Media kit', url: '#' },
          { label: 'Contact', url: '/contact' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { label: 'Blog', url: '#' },
          { label: 'Help center', url: '#' },
          { label: 'Support', url: '/contact' },
        ],
      },
    ],
    copyright: 'Finlio. All Rights Reserved.',
  },
  schema: schema(
    ...logoFields,
    textarea('description', 'Description'),
    repeater('columns', 'Link columns', [text('title', 'Title'), repeater('links', 'Links', [text('label', 'Label'), link('url', 'Link')], { itemLabel: 'Link' })], { itemLabel: 'Column' }),
    text('copyright', 'Copyright (after the ©)'),
  ),
  component: function FooterFinlio(props) {
    const edit = editOf(props)
    const columns = items(props.columns, [])
    return (
      <footer className="ud-fl ud-fl-footer">
        <div className="ud-container ud-fl-footer__grid">
          <div className="ud-fl-footer__brand">
            <span className="ud-fl-logo__mark" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <SafeText value={str(props.description)} className="ud-fl-footer__desc" edit={edit} path={['description']} placeholder="Description" />
          </div>
          {columns.map((column, index) => (
            <div key={index} className="ud-fl-footer__col">
              <EditableText edit={edit} path={['columns', index, 'title']} value={str(column.title)} as="h3" placeholder="Column" />
              <ul>
                {items(column.links, []).map((item, linkIndex) => (
                  <li key={linkIndex}>
                    <a href={str(item.url, '#')}>
                      <EditableText edit={edit} path={['columns', index, 'links', linkIndex, 'label']} value={str(item.label)} placeholder="Link" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="ud-container ud-fl-footer__base">
          <a className="ud-fl-footer__top" href="#top">
            <Icon name="arrow" size={14} />
            Move to the top
          </a>
          <p>
            &copy;{' '}
            <EditableText edit={edit} path={['copyright']} value={str(props.copyright, 'Finlio. All Rights Reserved.')} placeholder="Studio, All rights reserved." />
          </p>
        </div>
      </footer>
    )
  },
})
