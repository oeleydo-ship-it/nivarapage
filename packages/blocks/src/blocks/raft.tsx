/**
 * Raft — a dark fintech / neobank landing-page template.
 *
 * Visual language: an all-black canvas lit by one vivid signal-green accent
 * that floods full-bleed statement bands and the testimonial section, a
 * darker forest green carrying every button, softly rounded (12px) charcoal
 * cards for elevated content, and a clean geometric sans set at a light
 * display weight for headlines.
 *
 * Every block routes through `schema()`, which appends the shared design /
 * typography / background / spacing / content-width controls, so each one is
 * editable on the canvas and in the side panel and stays reusable on any
 * page. Buttons, cards and grids reuse the shared primitives (`Button`,
 * `Card`, `Grid`, `Avatar`) rather than bespoke components, so the family
 * recolours from theme tokens instead of hard-coded styling.
 */
import { useState, type CSSProperties } from 'react'
import { EditableImage, EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Avatar,
  Button,
  Card,
  CtaGroup,
  Grid,
  Heading,
  IconBadge,
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
  eyebrowField,
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
} from '../schema'
import { defineBlock } from '../types'

/* ------------------------------------------------------------------ head */

function RfHead({ props, align = 'left' }: { props: Record<string, unknown>; align?: 'left' | 'center' }) {
  const edit = editOf(props)
  const eyebrow = str(props.eyebrow)
  const heading = str(props.heading)
  const description = str(props.description)
  if (!edit && !heading && !description && !eyebrow) return null
  return (
    <div className={cx('ud-rf-head', align === 'center' && 'ud-rf-head--center')}>
      {eyebrow || edit ? (
        <EditableText edit={edit} path={['eyebrow']} value={eyebrow} as="p" className="ud-rf-kicker" placeholder="Eyebrow" />
      ) : null}
      {heading || edit ? (
        <EditableText edit={edit} path={['heading']} value={heading} as="h2" className="ud-rf-title" placeholder="Heading" />
      ) : null}
      {description || edit ? (
        <SafeText value={description} className="ud-rf-lead" edit={edit} path={['description']} placeholder="Short description" />
      ) : null}
    </div>
  )
}

const logoFields = [text('logo', 'Wordmark'), image('logoImage', 'Logo image'), link('logoUrl', 'Logo link')]

function RaftLogo({ props }: { props: Record<string, unknown> }) {
  const edit = editOf(props)
  const src = str(props.logoImage)
  return (
    <a className="ud-rf-logo" href={str(props.logoUrl, '/')}>
      {src ? (
        <span className="ud-rf-logo__img">
          <img src={src} alt={str(props.logo, 'Logo')} />
          <EditableImage edit={edit} path={['logoImage']} current={src} label="Replace logo" />
        </span>
      ) : (
        <span className="ud-rf-logo__mark">
          <span className="ud-rf-logo__dot" aria-hidden>
            <Icon name="zap" size={14} />
          </span>
          <EditableText edit={edit} path={['logo']} value={str(props.logo, 'Raft')} as="span" placeholder="Brand" />
        </span>
      )}
    </a>
  )
}

/* ----------------------------------------------------------- navbar.raft */

export const navbarRaft = defineBlock({
  type: 'navbar.raft',
  version: 1,
  category: 'navigation',
  label: 'Raft navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Raft',
    logoImage: '',
    logoUrl: '/',
    links: [
      { label: 'Solutions', url: '#solutions' },
      { label: 'Learn', url: '#learn' },
      { label: 'About', url: '#about' },
      { label: 'Login', url: '#login' },
    ],
    buttonLabel: 'Get Started',
    buttonUrl: '#',
    sticky: true,
    animation: 'fade-down',
    animationTrigger: 'load',
  },
  schema: schema(...logoFields, navLinksField('links', 'Links'), text('buttonLabel', 'Button label'), link('buttonUrl', 'Button link'), stickyField),
  component: function NavbarRaft(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    return (
      <header className={cx('ud-rf', 'ud-rf-nav', bool(props.sticky, true) && 'ud-rf-nav--sticky')} style={sectionVars(props, 'default') as CSSProperties}>
        <div className="ud-container ud-rf-nav__bar">
          <RaftLogo props={props} />
          <nav className={cx('ud-rf-nav__links', open && 'is-open')} aria-label="Primary">
            {items(props.links, []).map((item, index) => (
              <a key={index} className="ud-rf-nav__link" href={str(item.url, '#')}>
                <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
              </a>
            ))}
          </nav>
          <div className="ud-rf-nav__end">
            {str(props.buttonLabel) || edit ? (
              <Button href={str(props.buttonUrl, '#')} variant="primary">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
              </Button>
            ) : null}
            <button
              type="button"
              className="ud-rf-nav__toggle"
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

/* -------------------------------------------------------------- hero.raft */

export const heroRaft = defineBlock({
  type: 'hero.raft',
  version: 1,
  category: 'hero',
  label: 'Raft dark hero',
  icon: 'Sparkles',
  defaultProps: {
    badgeLabel: 'Introducing Raft cards',
    badgeUrl: '#',
    heading: 'Building the future of banking',
    description: 'Experience the future of banking with RAFT. We’re here to empower your financial journey.',
    buttonLabel: 'Get Started',
    buttonUrl: '#',
    image: '',
    textAlign: 'center',
  },
  schema: schema(
    text('badgeLabel', 'Badge label'),
    link('badgeUrl', 'Badge link'),
    headingField,
    descriptionField,
    ...primaryCtaFields,
    image('image', 'Image'),
  ),
  component: function HeroRaft(props) {
    const edit = editOf(props)
    const badge = str(props.badgeLabel)
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-rf ud-rf-hero">
        {badge || edit ? (
          <a className="ud-rf-badge" href={str(props.badgeUrl, '#')}>
            <EditableText edit={edit} path={['badgeLabel']} value={badge} placeholder="Badge" />
            <Icon name="arrow" size={14} />
          </a>
        ) : null}
        <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h1" className="ud-rf-title ud-rf-title--xl" placeholder="Headline" />
        {str(props.description) || edit ? (
          <SafeText value={str(props.description)} className="ud-rf-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
        ) : null}
        <CtaGroup props={props} primaryVariant="primary" className="ud-rf-hero__cta" />
        {str(props.image) || edit ? (
          <Media src={props.image} alt={str(props.heading)} ratio="wide" className="ud-rf-hero__img" edit={edit} path={['image']} />
        ) : null}
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- logos.raft */

export const logosRaft = defineBlock({
  type: 'logos.raft',
  version: 1,
  category: 'features',
  label: 'Raft trust bar',
  icon: 'Grid',
  defaultProps: {
    heading: 'Featured and seen in',
    items: [{ label: 'Finwire' }, { label: 'Ledgerly' }, { label: 'CapitalPulse' }, { label: 'Marketary' }, { label: 'Fisclane' }],
  },
  schema: schema(headingField, repeater('items', 'Logos', [text('label', 'Label'), image('image', 'Logo')], { itemLabel: 'Logo' })),
  component: function LogosRaft(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-rf ud-rf-logos">
        {str(props.heading) || edit ? (
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="p" className="ud-rf-logos__heading" placeholder="Featured and seen in" />
        ) : null}
        <div className="ud-rf-logos__row">
          {rows.map((item, index) =>
            str(item.image) ? (
              <Media key={index} src={item.image} alt={str(item.label)} ratio="wide" className="ud-rf-logos__img" edit={edit} path={['items', index, 'image']} />
            ) : (
              <EditableText key={index} edit={edit} path={['items', index, 'label']} value={str(item.label)} as="span" className="ud-rf-logos__word" placeholder="Brand" />
            ),
          )}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ----------------------------------------------------------- showcase.raft */

const showcaseCards = [
  { title: 'Seamless Payments', text: 'Enjoy secure, seamless transactions that make managing your money a breeze.', image: '' },
  { title: 'Smart Investing', text: 'Grow your wealth confidently with personalised investment solutions, tailored to your goals.', image: '' },
  { title: 'Wealth Management', text: 'Make informed decisions for your financial future with our wealth management expertise.', image: '' },
  { title: 'Financial Planning', text: 'Achieve your financial dreams with comprehensive planning that guides you toward a secure future.', image: '' },
]

export const showcaseRaft = defineBlock({
  type: 'showcase.raft',
  version: 1,
  category: 'content',
  label: 'Raft feature showcase',
  icon: 'Layers',
  defaultProps: {
    eyebrow: '',
    heading: 'Elevate Your Financial Journey with RAFT',
    description: 'RAFT offers a world of financial possibilities. From investments to payments, we’ve got you covered. Join us and unlock your potential today.',
    items: showcaseCards,
  },
  schema: schema(eyebrowField, headingField, descriptionField, repeater('items', 'Cards', [image('image', 'Image'), text('title', 'Title'), textarea('text', 'Description')], { itemLabel: 'Card' })),
  component: function ShowcaseRaft(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-rf ud-rf-showcase">
        <RfHead props={props} align="center" />
        <Grid cols={2} gap={24} style={{ marginTop: 44, textAlign: 'left' }}>
          {rows.map((item, index) => (
            <div key={index} className="ud-rf-card">
              <Media src={item.image} alt={str(item.title)} ratio="landscape" className="ud-rf-card__media" edit={edit} path={['items', index, 'image']} />
              <Heading level={3} edit={edit} path={['items', index, 'title']}>
                {str(item.title, 'Title')}
              </Heading>
              <SafeText value={item.text} className="ud-text" edit={edit} path={['items', index, 'text']} placeholder="Description" />
            </div>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* ----------------------------------------------------------- benefits.raft */

const feePoints = [
  { icon: 'shield', title: 'No minimum balance fees', text: 'Say goodbye to minimum balance fees. Your account, your balance — no hidden charges.' },
  { icon: 'database', title: 'No monthly fees', text: 'Bank with us without worrying about monthly fees. Keep more of your money where it belongs.' },
  { icon: 'arrow', title: 'No bank transfer fees', text: 'Seamlessly transfer funds without the extra cost. Send and receive money with zero fees.' },
]

export const benefitsRaft = defineBlock({
  type: 'benefits.raft',
  version: 1,
  category: 'features',
  label: 'Raft fee-free benefits',
  icon: 'CheckCircle',
  defaultProps: {
    eyebrow: '',
    heading: 'Your Financial Freedom, Your Way',
    description: 'We believe that managing your finances should be effortless and cost-effective. That’s why we offer you the freedom you deserve.',
    items: feePoints,
  },
  schema: schema(eyebrowField, headingField, descriptionField, repeater('items', 'Points', [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Description')], { itemLabel: 'Point' })),
  component: function BenefitsRaft(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-rf ud-rf-benefits">
        <RfHead props={props} align="center" />
        <div className="ud-rf-benefits__list">
          {rows.map((item, index) => (
            <div key={index} className="ud-rf-benefit">
              <Icon name={str(item.icon, 'shield')} size={22} />
              <div>
                <Heading level={4} edit={edit} path={['items', index, 'title']}>
                  {str(item.title, 'Title')}
                </Heading>
                <SafeText value={item.text} className="ud-text" edit={edit} path={['items', index, 'text']} placeholder="Description" />
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------- statement.raft */

export const statementRaft = defineBlock({
  type: 'statement.raft',
  version: 1,
  category: 'cta',
  label: 'Raft colour-block statement',
  icon: 'Megaphone',
  defaultProps: {
    heading: 'Smart investments, secure payments, and expert guidance, all in one place.',
    tone: 'accent',
    textAlign: 'center',
  },
  schema: schema(headingField),
  component: function StatementRaft(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="accent" align="center" className="ud-rf ud-rf-statement">
        <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-rf-title ud-rf-title--statement" placeholder="Statement" />
      </SectionShell>
    )
  },
  settings: null,
})

/* -------------------------------------------------------------- panels.raft */

const futurePanels = [
  { icon: 'target', title: 'Spend Better', text: 'Set and achieve financial goals with ease, automate your savings, and watch your money grow without the stress.' },
  { icon: 'chart', title: 'Invest Better', text: 'Build a portfolio that matches your appetite for risk, rebalanced automatically as markets move.' },
]

export const panelsRaft = defineBlock({
  type: 'panels.raft',
  version: 1,
  category: 'services',
  label: 'Raft dark panel pair',
  icon: 'Layers',
  defaultProps: {
    eyebrow: '',
    heading: 'Confidently Shape Your Financial Future',
    description: 'At RAFT, we empower you to confidently shape your financial future. Our modern approach simplifies saving and investing, making it easier than ever.',
    items: futurePanels,
  },
  schema: schema(eyebrowField, headingField, descriptionField, repeater('items', 'Panels', [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Description')], { itemLabel: 'Panel' })),
  component: function PanelsRaft(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-rf ud-rf-panels">
        <RfHead props={props} align="center" />
        <Grid cols={Math.min(rows.length || 1, 2)} gap={24} style={{ marginTop: 44 }}>
          {rows.map((item, index) => (
            <Card key={index} className="ud-rf-panel">
              <IconBadge name={str(item.icon, 'target')} shape="round" size="lg" />
              <Heading level={3} edit={edit} path={['items', index, 'title']}>
                {str(item.title, 'Title')}
              </Heading>
              <SafeText value={item.text} className="ud-text" edit={edit} path={['items', index, 'text']} placeholder="Description" />
            </Card>
          ))}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------------- stats.raft */

export const statsRaft = defineBlock({
  type: 'stats.raft',
  version: 1,
  category: 'features',
  label: 'Raft counter row',
  icon: 'BarChart',
  defaultProps: {
    items: [
      { value: '50+', label: 'Cities' },
      { value: '50,000+', label: 'Transactions' },
      { value: '3M+', label: 'Users' },
      { value: '5★', label: 'User ratings' },
    ],
    image: '',
  },
  schema: schema(repeater('items', 'Counters', [text('value', 'Value'), text('label', 'Label')], { itemLabel: 'Counter' }), image('image', 'Photo')),
  component: function StatsRaft(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-rf ud-rf-stats">
        <Grid cols={Math.min(rows.length || 1, 4)} gap={24}>
          {rows.map((stat, index) => (
            <div key={index} className="ud-rf-stat">
              <EditableText edit={edit} path={['items', index, 'value']} value={str(stat.value)} as="div" className="ud-rf-stat__value" placeholder="0" />
              <EditableText edit={edit} path={['items', index, 'label']} value={str(stat.label)} as="p" className="ud-rf-stat__label" placeholder="Label" />
            </div>
          ))}
        </Grid>
        {str(props.image) || edit ? (
          <Media src={props.image} alt="" ratio="wide" className="ud-rf-stats__img" edit={edit} path={['image']} />
        ) : null}
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------------- cards.raft */

const cardFeatures = [
  { icon: 'zap', title: 'Contactless Technology', text: 'Our new cards come equipped with contactless technology, allowing you to make swift, secure payments with a simple tap.' },
  { icon: 'palette', title: 'Personalization', text: 'Customise your card to reflect your unique style. Choose from a range of designs that suit your personality.' },
  { icon: 'lock', title: 'Enhanced Security', text: 'Your peace of mind is our priority. Our cards feature advanced security measures to protect your transactions and data.' },
]

export const cardsRaft = defineBlock({
  type: 'cards.raft',
  version: 1,
  category: 'content',
  label: 'Raft next-gen cards',
  icon: 'CreditCard',
  defaultProps: {
    eyebrow: 'Introducing',
    heading: 'Introducing RAFT’s Next-Gen Cards',
    description: 'Discover RAFT’s latest innovation — our new cards. Elevate your banking experience with cutting-edge features, security, and unprecedented convenience.',
    image: '',
    items: cardFeatures,
  },
  schema: schema(eyebrowField, headingField, descriptionField, image('image', 'Card image'), repeater('items', 'Features', [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Description')], { itemLabel: 'Feature' })),
  component: function CardsRaft(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" className="ud-rf ud-rf-cards">
        <div className="ud-split">
          <div className="ud-split__media">
            <Media src={props.image} alt={str(props.heading)} ratio="portrait" className="ud-rf-cards__img" edit={edit} path={['image']} />
          </div>
          <div>
            <RfHead props={props} />
            <div className="ud-rf-cards__list">
              {rows.map((item, index) => (
                <div key={index} className="ud-rf-cards__feature">
                  <Icon name={str(item.icon, 'zap')} size={22} />
                  <div>
                    <Heading level={4} edit={edit} path={['items', index, 'title']}>
                      {str(item.title, 'Title')}
                    </Heading>
                    <SafeText value={item.text} className="ud-text" edit={edit} path={['items', index, 'text']} placeholder="Description" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------- testimonial.raft */

export const testimonialRaft = defineBlock({
  type: 'testimonial.raft',
  version: 1,
  category: 'testimonials',
  label: 'Raft colour-block quote',
  icon: 'Quote',
  defaultProps: {
    heading: 'Join over 3 million members',
    quote: 'RAFT has transformed my approach to finance. Their smart investing options have helped me grow my wealth, and their user-friendly platform makes managing my money a breeze. I’ve never felt more confident about my financial future.',
    name: 'Robert Fox',
    role: 'Happy RAFT User',
    avatar: '',
  },
  schema: schema(headingField, textarea('quote', 'Quote'), text('name', 'Name'), text('role', 'Role'), image('avatar', 'Avatar')),
  component: function TestimonialRaft(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="accent" className="ud-rf ud-rf-testimonial">
        <div className="ud-split">
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-rf-title" placeholder="Heading" />
          <div>
            <SafeText value={str(props.quote)} className="ud-rf-testimonial__quote" edit={edit} path={['quote']} placeholder="What did they say?" />
            <div className="ud-rf-testimonial__by">
              <Avatar src={props.avatar} name={props.name} edit={edit} path={['avatar']} />
              <div>
                <EditableText edit={edit} path={['name']} value={str(props.name)} as="div" className="ud-rf-testimonial__name" placeholder="Name" />
                <EditableText edit={edit} path={['role']} value={str(props.role)} as="div" className="ud-rf-testimonial__role" placeholder="Role" />
              </div>
            </div>
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------------- faq.raft */

export const faqRaft = defineBlock({
  type: 'faq.raft',
  version: 1,
  category: 'faq',
  label: 'Raft questions',
  icon: 'HelpCircle',
  defaultProps: {
    eyebrow: '',
    heading: 'Frequently asked questions',
    description: '',
    items: [
      { question: 'How do I create an account with RAFT?', answer: 'Download the app or sign up on the site, verify your identity, and fund your account — most people are up and running in under five minutes.' },
      { question: 'How does RAFT ensure the security of my financial data?', answer: 'Bank-grade encryption, continuous fraud monitoring and optional biometric login protect every account by default.' },
      { question: 'What types of transactions can I perform with RAFT?', answer: 'Transfers, bill payments, card purchases, and automated investing — all from the same balance, with no hidden conversion steps.' },
      { question: 'What benefits does RAFT offer for wealth management?', answer: 'A named advisor, automated rebalancing, and a plain-language breakdown of fees before you ever commit to a plan.' },
    ],
  },
  schema: schema(eyebrowField, headingField, descriptionField, repeater('items', 'Questions', [text('question', 'Question'), textarea('answer', 'Answer')], { itemLabel: 'Question' })),
  component: function FaqRaft(props) {
    const edit = editOf(props)
    const rows = items(props.items, [])
    const [open, setOpen] = useState(0)
    return (
      <SectionShell props={props} tone="default" className="ud-rf ud-rf-faq">
        <RfHead props={props} />
        <div className="ud-rf-faq__list">
          {rows.map((item, index) => {
            const isOpen = Boolean(edit) || open === index
            return (
              <div key={index} className={cx('ud-rf-faq__row', isOpen && 'is-open')}>
                <button type="button" className="ud-rf-faq__q" aria-expanded={isOpen} onClick={() => setOpen((current) => (current === index ? -1 : index))}>
                  <EditableText edit={edit} path={['items', index, 'question']} value={str(item.question)} as="span" placeholder="Question" />
                  <span className="ud-rf-faq__sign" aria-hidden>
                    <Icon name={isOpen ? 'minus' : 'plus'} size={16} />
                  </span>
                </button>
                <div className="ud-rf-faq__a" hidden={!isOpen}>
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

/* ------------------------------------------------------------- footer.raft */

export const footerRaft = defineBlock({
  type: 'footer.raft',
  version: 1,
  category: 'footer',
  label: 'Raft footer',
  icon: 'Layout',
  defaultProps: {
    logo: 'Raft',
    logoImage: '',
    logoUrl: '/',
    qrHeading: 'Scan to download the app on the Playstore and Appstore.',
    qrImage: '',
    columns: [
      { title: 'Company', links: [{ label: 'Our Company', url: '#' }, { label: 'Careers', url: '#' }, { label: 'Press kit', url: '#' }] },
      { title: 'Legal', links: [{ label: 'Terms of use', url: '#' }, { label: 'Privacy policy', url: '#' }] },
      { title: 'Support', links: [{ label: 'Contact us', url: '#' }, { label: 'FAQ', url: '#' }] },
    ],
    languageLabel: 'English (United Kingdom)',
    copyright: 'Raft Corp, LLC.',
  },
  schema: schema(
    ...logoFields,
    text('qrHeading', 'QR caption'),
    image('qrImage', 'QR code image'),
    repeater('columns', 'Link columns', [text('title', 'Title'), repeater('links', 'Links', [text('label', 'Label'), link('url', 'Link')], { itemLabel: 'Link' })], { itemLabel: 'Column' }),
    text('languageLabel', 'Language label'),
    text('copyright', 'Copyright (after the ©)'),
  ),
  component: function FooterRaft(props) {
    const edit = editOf(props)
    const columns = items(props.columns, [])
    const qrImage = str(props.qrImage)
    return (
      <footer className="ud-rf ud-rf-footer">
        <div className="ud-container">
          <RaftLogo props={props} />
          {qrImage || edit ? (
            <div className="ud-rf-footer__qr">
              <Media src={props.qrImage} alt="QR code" ratio="square" className="ud-rf-footer__qrimg" edit={edit} path={['qrImage']} />
              <div>
                <EditableText edit={edit} path={['qrHeading']} value={str(props.qrHeading)} as="p" placeholder="Scan to download" />
                <div className="ud-rf-footer__stores">
                  <Icon name="play" size={18} />
                  <Icon name="globe" size={18} />
                </div>
              </div>
            </div>
          ) : null}
          <div className="ud-rf-footer__cols">
            {columns.map((column, index) => (
              <div key={index} className="ud-rf-footer__col">
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
          <div className="ud-rf-footer__base">
            <span className="ud-rf-footer__lang">
              <EditableText edit={edit} path={['languageLabel']} value={str(props.languageLabel)} placeholder="Language" />
              <Icon name="arrow" size={14} />
            </span>
            <p>
              &copy;{' '}
              <EditableText edit={edit} path={['copyright']} value={str(props.copyright, 'Raft Corp, LLC.')} placeholder="Company, LLC." />
            </p>
          </div>
        </div>
      </footer>
    )
  },
})
