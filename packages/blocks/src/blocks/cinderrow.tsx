import type { CSSProperties, ReactNode } from 'react'
import { useState } from 'react'
import { EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import { PublicForm } from '../public-form'
import { Button, Media, SafeText, SectionShell, animationOf, bool, cx, items, lines, str, type Props } from '../primitives'
import {
  ctaFields,
  descriptionField,
  eyebrowField,
  headingField,
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

const orange = '#ff5a1f'

function E({ props, path, value, as = 'span', className, placeholder, transform }: { props: Props; path: (string | number)[]; value: unknown; as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4'; className?: string; placeholder?: string; transform?: (text: string) => string }) {
  return <EditableText edit={editOf(props)} path={path} value={str(value)} as={as} className={className} placeholder={placeholder} transform={transform} />
}

function Title({ props, heading = props.heading, accent = props.accent, as = 'h2' }: { props: Props; heading?: unknown; accent?: unknown; as?: 'h1' | 'h2' }) {
  return (
    <div className="ud-cr-title">
      <E props={props} path={['heading']} value={heading} as={as} placeholder="Heading" />
      {str(accent) || editOf(props) ? <E props={props} path={['accent']} value={accent} as="span" className="ud-cr-accent" placeholder="Accent" /> : null}
    </div>
  )
}

function ArrowLink({ href, children, dark = false }: { href: string; children: ReactNode; dark?: boolean }) {
  return <a href={href} className={cx('ud-cr-link', dark && 'ud-cr-link--dark')}>{children}<Icon name="arrow" size={16} /></a>
}

const headingSchema = [eyebrowField, headingField, text('accent', 'Accent line'), descriptionField]

export const navbarCinder = defineBlock({
  type: 'navbar.cinder', version: 1, category: 'navigation', label: 'Cinder pill navbar', icon: 'Menu',
  defaultProps: { brand: 'Cinder & Row', locality: 'NORTH · LONDON', logoLetter: 'C', status: 'OPEN TODAY', buttonLabel: 'Call now', buttonUrl: 'tel:+442079460182', sticky: true, links: [{ label: 'Story', url: '/story' }, { label: 'Services', url: '/services' }, { label: 'Journal', url: '/journal' }, { label: 'Contact', url: '/contact' }] },
  schema: schema(text('brand', 'Brand'), text('locality', 'Locality'), text('logoLetter', 'Logo letter'), text('status', 'Status'), ...primaryCtaFields, navLinksField('links', 'Navigation links'), stickyField),
  component: function NavbarCinder(props) {
    const [open, setOpen] = useState(false)
    const anim = animationOf(props)
    return <header className={cx('ud-cr-nav', bool(props.sticky, true) && 'ud-cr-nav--sticky', anim.className)} style={anim.style} data-ud-anim={anim.trigger}>
      <div className="ud-cr-nav__bar">
        <a href="/" className="ud-cr-brand"><span className="ud-cr-brand__mark"><E props={props} path={['logoLetter']} value={props.logoLetter} /></span><span><E props={props} path={['brand']} value={props.brand} /><small><E props={props} path={['locality']} value={props.locality} /></small></span></a>
        <nav className={cx('ud-cr-nav__links', open && 'is-open')}>{items(props.links, []).map((item, i) => <NavItem key={i} item={item}><a href={str(item.url, '#')}><E props={props} path={['links', i, 'label']} value={item.label} /><SubmenuCaret show={hasSubmenu(item)} /></a><Submenu props={props} item={item} index={i} /></NavItem>)}</nav>
        <div className="ud-cr-nav__status"><i /> <E props={props} path={['status']} value={props.status} /></div>
        <Button href={str(props.buttonUrl, 'tel:')} className="ud-cr-button ud-cr-button--black"><Icon name="phone" size={15} /><E props={props} path={['buttonLabel']} value={props.buttonLabel} /><Icon name="arrow" size={14} /></Button>
        <button className="ud-cr-nav__toggle" onClick={() => setOpen(!open)} aria-label="Menu"><Icon name={open ? 'close' : 'menu'} size={20} /></button>
      </div>
    </header>
  },
})

export const heroCinder = defineBlock({
  type: 'hero.cinder', version: 1, category: 'hero', label: 'Cinder editorial hero', icon: 'Image',
  defaultProps: { eyebrow: 'LIVE FROM NORTH LONDON', heading: 'Warm homes,', accent: 'honest engineers.', description: 'Local heating, careful work, and plain-English quotes from people who know these streets.', image: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=2200&q=88', overlay: true, buttonLabel: 'Call 020 7946 0182', buttonUrl: 'tel:+442079460182', secondaryLabel: 'Message us', secondaryUrl: '/contact', badges: [{ label: 'GAS SAFE REGISTERED' }, { label: 'SAME-DAY SLOTS' }, { label: '4.9 CUSTOMER RATING' }, { label: 'LOCAL SINCE 2017' }] },
  schema: schema(...headingSchema, image('image', 'Background image'), toggle('overlay', 'Soft image wash', 'design'), ...ctaFields, repeater('badges', 'Trust badges', [text('label', 'Label')], { itemLabel: 'Badge' })),
  component: function HeroCinder(props) {
    return <SectionShell props={props} className="ud-cr-hero" bleed style={{ backgroundImage: `url(${str(props.image)})` } as CSSProperties}>
      {bool(props.overlay, true) ? <div className="ud-cr-hero__wash" /> : null}
      <div className="ud-cr-wide ud-cr-hero__copy">
        <E props={props} path={['eyebrow']} value={props.eyebrow} as="p" className="ud-cr-kicker" />
        <Title props={props} as="h1" />
        <SafeText value={str(props.description)} className="ud-cr-lead" edit={editOf(props)} path={['description']} />
        <div className="ud-cr-actions"><Button href={str(props.buttonUrl, 'tel:')} className="ud-cr-button ud-cr-button--black"><Icon name="phone" size={15} /><E props={props} path={['buttonLabel']} value={props.buttonLabel} /></Button><ArrowLink href={str(props.secondaryUrl, '/contact')}><E props={props} path={['secondaryLabel']} value={props.secondaryLabel} /></ArrowLink></div>
        <div className="ud-cr-badges">{items(props.badges, []).map((item, i) => <span key={i}><i /> <E props={props} path={['badges', i, 'label']} value={item.label} /></span>)}</div>
      </div>
    </SectionShell>
  },
})

export const introCinder = defineBlock({
  type: 'content.cinder_intro', version: 1, category: 'content', label: 'Cinder page introduction', icon: 'Type',
  defaultProps: { eyebrow: 'SERVICES · NORTH LONDON', heading: 'Comfort sorted,', accent: 'priced clearly.', description: 'Every service has a starting point. If the job changes, you hear about it before the tools come out.' },
  schema: schema(...headingSchema),
  component: (props) => <SectionShell props={props} className="ud-cr-intro"><div className="ud-cr-wide"><E props={props} path={['eyebrow']} value={props.eyebrow} as="p" className="ud-cr-kicker" /><Title props={props} as="h1" /><SafeText value={str(props.description)} className="ud-cr-lead" edit={editOf(props)} path={['description']} /></div></SectionShell>,
})

export const bentoCinder = defineBlock({
  type: 'services.cinder_bento', version: 1, category: 'services', label: 'Cinder service bento', icon: 'Grid',
  defaultProps: { eyebrow: 'WHAT WE DO', heading: 'Everything heat.', accent: 'Nothing hidden.', description: 'Fixed starting prices and honest ETAs.', cards: [{ label: '01 · BOILER REPAIR', title: 'Strange noise?', accent: 'Fixed today.', description: 'Pressure loss, cold water, warning lights—diagnosed clearly.', price: 'FROM £89', image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=85', tone: 'photo' }, { label: '02 · LANDLORD CHECKS', title: 'Certificate', accent: 'in 45 minutes.', description: 'Digital copy sent the same day.', price: '£78', tone: 'orange' }, { label: '03 · EMERGENCY', title: 'No heat tonight?', accent: '', description: 'Late slots when the weather turns.', price: 'FROM £120', tone: 'light' }, { label: '04 · ANNUAL SERVICE', title: 'One hour now.', accent: 'A calmer winter.', description: 'Efficiency, safety and pressure checks.', price: '£99', tone: 'orange' }, { label: '05 · COOKERS & HOBS', title: 'Kitchen-ready,', accent: 'certified safely.', description: 'Connections, swaps and tight-space installs.', price: 'FROM £135', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=85', tone: 'photo' }] },
  schema: schema(...headingSchema, repeater('cards', 'Service cards', [text('label', 'Label'), text('title', 'Title'), text('accent', 'Accent'), textarea('description', 'Description'), text('price', 'Price'), image('image', 'Image'), text('tone', 'Tone: photo, orange, light or dark')], { itemLabel: 'Service' })),
  component: function BentoCinder(props) {
    return <SectionShell props={props} className="ud-cr-bento"><div className="ud-cr-wide"><div className="ud-cr-section-head"><div><E props={props} path={['eyebrow']} value={props.eyebrow} as="p" className="ud-cr-kicker" /><Title props={props} /></div><SafeText value={str(props.description)} className="ud-cr-copy" edit={editOf(props)} path={['description']} /></div><div className="ud-cr-bento__grid">{items(props.cards, []).map((card, i) => <article key={i} className={cx('ud-cr-bento__card', `is-${str(card.tone, 'light')}`)} style={str(card.image) ? { backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.7),rgba(0,0,0,.15)),url(${str(card.image)})` } : undefined}><E props={props} path={['cards', i, 'label']} value={card.label} as="p" className="ud-cr-kicker" /><h3><E props={props} path={['cards', i, 'title']} value={card.title} /><E props={props} path={['cards', i, 'accent']} value={card.accent} className="ud-cr-accent" /></h3><SafeText value={str(card.description)} className="ud-cr-copy" edit={editOf(props)} path={['cards', i, 'description']} /><strong><E props={props} path={['cards', i, 'price']} value={card.price} /></strong></article>)}</div></div></SectionShell>
  },
})

export const splitCinder = defineBlock({
  type: 'content.cinder_split', version: 1, category: 'content', label: 'Cinder story split', icon: 'Columns',
  defaultProps: { eyebrow: 'THE PEOPLE', heading: 'Raised nearby.', accent: 'Working locally.', description: 'We built Cinder & Row around the things homeowners actually value: clear arrival windows, tidy work and a real person who picks up the phone.', buttonLabel: 'Read our story', buttonUrl: '/story', images: [{ image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=900&q=85', alt: 'Engineer at work' }, { image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c90a?auto=format&fit=crop&w=900&q=85', alt: 'London street' }, { image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85', alt: 'Local buildings' }] },
  schema: schema(...headingSchema, ...primaryCtaFields, repeater('images', 'Images', [image('image', 'Photo'), text('alt', 'Alt text')], { itemLabel: 'Photo' })),
  component: function SplitCinder(props) { return <SectionShell props={props} className="ud-cr-split"><div className="ud-cr-wide ud-cr-split__grid"><div><E props={props} path={['eyebrow']} value={props.eyebrow} as="p" className="ud-cr-kicker" /><Title props={props} /><SafeText value={str(props.description)} className="ud-cr-copy" edit={editOf(props)} path={['description']} /><ArrowLink href={str(props.buttonUrl, '/story')} dark><E props={props} path={['buttonLabel']} value={props.buttonLabel} /></ArrowLink></div><div className="ud-cr-split__media">{items(props.images, []).map((item, i) => <Media key={i} src={str(item.image)} alt={str(item.alt)} ratio={i === 2 ? 'wide' : 'portrait'} edit={editOf(props)} path={['images', i, 'image']} />)}</div></div></SectionShell> },
})

export const tickerCinder = defineBlock({
  type: 'content.cinder_ticker', version: 1, category: 'content', label: 'Cinder editorial ticker', icon: 'MoreHorizontal',
  defaultProps: { dark: true, items: [{ label: 'HONEST QUOTES' }, { label: 'LOCAL PEOPLE' }, { label: 'TIDY WORK' }, { label: 'SAME-DAY HELP' }, { label: 'NO SURPRISES' }] },
  schema: schema(toggle('dark', 'Dark band', 'design'), repeater('items', 'Ticker items', [text('label', 'Label')], { itemLabel: 'Ticker item' })),
  component: (props) => <div className={cx('ud-cr-ticker', bool(props.dark, true) ? 'is-dark' : 'is-orange')}><div>{[...items(props.items, []), ...items(props.items, [])].map((item, i) => <span key={i}><E props={props} path={['items', i % Math.max(1, items(props.items, []).length), 'label']} value={item.label} /><i>◎</i></span>)}</div></div>,
})

export const coverageCinder = defineBlock({
  type: 'content.cinder_coverage', version: 1, category: 'content', label: 'Cinder service area', icon: 'Map',
  defaultProps: { eyebrow: 'OUR PATCH', heading: 'Close enough', accent: 'to care.', description: 'We cover the neighbourhoods around North London every weekday.', mapImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1300&q=75', areas: [{ code: 'N1', name: 'Islington', timing: 'SAME-DAY' }, { code: 'N7', name: 'Holloway', timing: 'SAME-DAY' }, { code: 'NW1', name: 'Camden', timing: 'SAME-DAY' }, { code: 'N16', name: 'Stoke Newington', timing: 'NEXT-DAY' }, { code: 'EC1', name: 'Clerkenwell', timing: 'SAME-DAY' }, { code: 'E8', name: 'Dalston', timing: 'NEXT-DAY' }] },
  schema: schema(...headingSchema, image('mapImage', 'Map or location image'), repeater('areas', 'Service areas', [text('code', 'Postcode'), text('name', 'Area'), text('timing', 'Availability')], { itemLabel: 'Area' })),
  component: function CoverageCinder(props) { return <SectionShell props={props} className="ud-cr-coverage" bleed tone="dark"><div className="ud-cr-wide"><div className="ud-cr-section-head"><div><E props={props} path={['eyebrow']} value={props.eyebrow} as="p" className="ud-cr-kicker" /><Title props={props} /></div><SafeText value={str(props.description)} className="ud-cr-copy" edit={editOf(props)} path={['description']} /></div><div className="ud-cr-coverage__grid"><div className="ud-cr-coverage__areas">{items(props.areas, []).map((area, i) => <article key={i}><strong><E props={props} path={['areas', i, 'code']} value={area.code} /></strong><E props={props} path={['areas', i, 'name']} value={area.name} as="p" /><small><E props={props} path={['areas', i, 'timing']} value={area.timing} /></small></article>)}</div><Media src={str(props.mapImage)} alt="Service area" ratio="wide" edit={editOf(props)} path={['mapImage']} /></div></div></SectionShell> },
})

export const testimonialsCinder = defineBlock({
  type: 'testimonials.cinder', version: 1, category: 'testimonials', label: 'Cinder testimonials', icon: 'Quote',
  defaultProps: { eyebrow: 'REVIEWS · 4.9 / 5', heading: 'What neighbours', accent: 'actually say.', quotes: [{ quote: 'They arrived inside the promised window, explained the pressure issue clearly and left the cupboard tidier than they found it.', name: 'Maya R.', meta: 'Homeowner · Islington' }, { quote: 'No jargon and no mysterious extras. The quote matched the invoice exactly.', name: 'Jon B.', meta: 'Landlord · Camden' }, { quote: 'Heating back the same afternoon. That is the whole review.', name: 'Priya D.', meta: 'Homeowner · Dalston' }] },
  schema: schema(eyebrowField, headingField, text('accent', 'Accent'), repeater('quotes', 'Testimonials', [textarea('quote', 'Quote'), text('name', 'Name'), text('meta', 'Detail')], { itemLabel: 'Testimonial' })),
  component: function TestimonialsCinder(props) { const [active, setActive] = useState(0); const quotes = items(props.quotes, []); const q = quotes[active] || {}; return <SectionShell props={props} className="ud-cr-testimonials"><div className="ud-cr-wide ud-cr-testimonials__grid"><div><E props={props} path={['eyebrow']} value={props.eyebrow} as="p" className="ud-cr-kicker" /><Title props={props} /><div className="ud-cr-testimonials__arrows"><button onClick={() => setActive((active - 1 + quotes.length) % quotes.length)}>←</button><button onClick={() => setActive((active + 1) % quotes.length)}>→</button></div></div><div><blockquote>“<SafeText value={str(q.quote)} edit={editOf(props)} path={['quotes', active, 'quote']} /></blockquote><strong><E props={props} path={['quotes', active, 'name']} value={q.name} /></strong><small><E props={props} path={['quotes', active, 'meta']} value={q.meta} /></small><div className="ud-cr-testimonials__tabs">{quotes.map((item, i) => <button key={i} className={i === active ? 'is-active' : ''} onClick={() => setActive(i)}><E props={props} path={['quotes', i, 'name']} value={item.name} /></button>)}</div></div></div></SectionShell> },
})

export const galleryCinder = defineBlock({
  type: 'gallery.cinder', version: 1, category: 'gallery', label: 'Cinder image gallery', icon: 'Images',
  defaultProps: { eyebrow: 'FROM THE ROAD', heading: 'Life between', accent: 'call-outs.', images: [{ image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85', alt: 'Copper pipework' }, { image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=85', alt: 'London homes' }, { image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=85', alt: 'Technician' }, { image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85', alt: 'Canal' }, { image: 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=900&q=85', alt: 'Work notes' }, { image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=85', alt: 'London' }] },
  schema: schema(eyebrowField, headingField, text('accent', 'Accent'), repeater('images', 'Gallery images', [image('image', 'Image'), text('alt', 'Alt text')], { itemLabel: 'Image' })),
  component: (props) => <SectionShell props={props} className="ud-cr-gallery"><div className="ud-cr-wide"><E props={props} path={['eyebrow']} value={props.eyebrow} as="p" className="ud-cr-kicker" /><Title props={props} /><div className="ud-cr-gallery__grid">{items(props.images, []).map((item, i) => <Media key={i} src={str(item.image)} alt={str(item.alt)} ratio="square" edit={editOf(props)} path={['images', i, 'image']} />)}</div></div></SectionShell>,
})

export const serviceListCinder = defineBlock({
  type: 'services.cinder_list', version: 1, category: 'services', label: 'Cinder service price list', icon: 'List',
  defaultProps: { eyebrow: 'FULL MENU', heading: 'Pick your', accent: 'repair.', filters: [{ label: 'Homes' }, { label: 'Landlords' }, { label: 'Commercial' }], services: [{ title: 'Boiler repair', duration: '1–2 HRS', description: 'Fault finding, replacement parts, pressure issues and strange noises.', price: '£89' }, { title: 'Annual boiler service', duration: '55 MINS', description: 'A complete safety, efficiency and pressure check with written notes.', price: '£99' }, { title: 'Landlord gas safety check', duration: '45 MINS', description: 'Every gas appliance tested, documented and emailed the same day.', price: '£78' }, { title: 'Cooker & hob installation', duration: '1–2 HRS', description: 'Certified connections, swaps and gas testing.', price: '£135' }, { title: 'Heating system repair', duration: '1–3 HRS', description: 'Cold radiators, thermostats and noisy pipes diagnosed properly.', price: '£105' }] },
  schema: schema(eyebrowField, headingField, text('accent', 'Accent'), repeater('filters', 'Filters', [text('label', 'Label')], { itemLabel: 'Filter' }), repeater('services', 'Services', [text('title', 'Service'), text('duration', 'Duration'), textarea('description', 'Description'), text('price', 'Starting price')], { itemLabel: 'Service' })),
  component: function ServiceListCinder(props) { const [active, setActive] = useState(0); return <SectionShell props={props} className="ud-cr-service-list"><div className="ud-cr-wide"><div className="ud-cr-section-head"><div><E props={props} path={['eyebrow']} value={props.eyebrow} as="p" className="ud-cr-kicker" /><Title props={props} /></div><div className="ud-cr-pills">{items(props.filters, []).map((item, i) => <button className={i === active ? 'is-active' : ''} onClick={() => setActive(i)} key={i}><E props={props} path={['filters', i, 'label']} value={item.label} /></button>)}</div></div><div>{items(props.services, []).map((item, i) => <article className="ud-cr-service-row" key={i}><div><h3><E props={props} path={['services', i, 'title']} value={item.title} /></h3><small><Icon name="clock" size={13} /> <E props={props} path={['services', i, 'duration']} value={item.duration} /></small></div><SafeText value={str(item.description)} className="ud-cr-copy" edit={editOf(props)} path={['services', i, 'description']} /><div><small>FROM</small><strong><E props={props} path={['services', i, 'price']} value={item.price} /></strong></div></article>)}</div></div></SectionShell> },
})

export const pricingCinder = defineBlock({
  type: 'pricing.cinder', version: 1, category: 'pricing', label: 'Cinder pricing packages', icon: 'CreditCard',
  defaultProps: { eyebrow: 'WAYS TO BOOK', heading: 'Three simple', accent: 'options.', description: 'Choose one visit or a plan for repeat work.', plans: [{ label: 'ONE JOB. ONE PRICE.', title: 'Single visit', price: 'From £89', features: 'Fixed starting price\nSame-day where possible\nWritten report emailed\nParts at trade cost', buttonLabel: 'Book one job', buttonUrl: '/contact', featured: false }, { label: 'MOST BOOKED', title: 'Landlord pair', price: '£169', features: 'Safety certificate\nAnnual boiler service\nDigital copies\nPriority booking', buttonLabel: 'Book the pair', buttonUrl: '/contact', featured: true }, { label: 'ONGOING SUPPORT', title: 'Property cover', price: 'POA', features: 'Fixed labour rates\nEmergency slots\nOne contact\nConsolidated invoice', buttonLabel: 'Get a quote', buttonUrl: '/contact', featured: false }] },
  schema: schema(...headingSchema, repeater('plans', 'Packages', [text('label', 'Label'), text('title', 'Title'), text('price', 'Price'), textarea('features', 'Features, one per line'), text('buttonLabel', 'Button'), link('buttonUrl', 'URL'), toggle('featured', 'Featured')], { itemLabel: 'Package' })),
  component: (props) => <SectionShell props={props} className="ud-cr-pricing"><div className="ud-cr-wide"><div className="ud-cr-section-head"><div><E props={props} path={['eyebrow']} value={props.eyebrow} as="p" className="ud-cr-kicker" /><Title props={props} /></div><SafeText value={str(props.description)} className="ud-cr-copy" edit={editOf(props)} path={['description']} /></div><div className="ud-cr-pricing__grid">{items(props.plans, []).map((plan, i) => <article key={i} className={bool(plan.featured) ? 'is-featured' : ''}><E props={props} path={['plans', i, 'label']} value={plan.label} as="p" className="ud-cr-kicker" /><h3><E props={props} path={['plans', i, 'title']} value={plan.title} /></h3><strong><E props={props} path={['plans', i, 'price']} value={plan.price} /></strong><ul>{lines(plan.features).map((f, n) => <li key={n}>● <E props={props} path={['plans', i, 'features']} value={f} transform={(text) => lines(plan.features).map((line, position) => (position === n ? text : line)).join('\n')} /></li>)}</ul><ArrowLink href={str(plan.buttonUrl, '/contact')} dark><E props={props} path={['plans', i, 'buttonLabel']} value={plan.buttonLabel} /></ArrowLink></article>)}</div></div></SectionShell>,
})

export const processCinder = defineBlock({
  type: 'process.cinder', version: 1, category: 'content', label: 'Cinder process cards', icon: 'Route',
  defaultProps: { eyebrow: 'HOW A VISIT WORKS', heading: 'Five steps.', accent: 'No guesswork.', steps: [{ title: 'Tell us what is wrong', description: 'A photo helps, but plain English is perfect.' }, { title: 'Choose a window', description: 'Real arrival windows, not an all-day wait.' }, { title: 'Meet your engineer', description: 'Photo ID, shoe covers and a clear introduction.' }, { title: 'See the issue', description: 'We explain the fault before we repair it.' }, { title: 'Approve the price', description: 'The total is agreed before work starts.' }] },
  schema: schema(eyebrowField, headingField, text('accent', 'Accent'), repeater('steps', 'Steps', [text('title', 'Title'), textarea('description', 'Description')], { itemLabel: 'Step' })),
  component: (props) => <SectionShell props={props} className="ud-cr-process"><div className="ud-cr-wide"><E props={props} path={['eyebrow']} value={props.eyebrow} as="p" className="ud-cr-kicker" /><Title props={props} /><div className="ud-cr-process__grid">{items(props.steps, []).map((step, i) => <article key={i}><span>{String(i + 1).padStart(2, '0')}</span><h3><E props={props} path={['steps', i, 'title']} value={step.title} /></h3><SafeText value={str(step.description)} className="ud-cr-copy" edit={editOf(props)} path={['steps', i, 'description']} /></article>)}</div></div></SectionShell>,
})

export const timelineCinder = defineBlock({
  type: 'content.cinder_timeline', version: 1, category: 'content', label: 'Cinder timeline', icon: 'History',
  defaultProps: { eyebrow: 'OUR TIMELINE', heading: 'How we got', accent: 'here.', description: 'No glossy origin story. Just training, long days and a growing list of neighbours who call us back.', milestones: [{ year: '2008', title: 'First proper toolbox', description: 'An apprenticeship, early starts and a lot of listening.' }, { year: '2012', title: 'Qualified for gas work', description: 'Practical exams passed and commercial experience started.' }, { year: '2017', title: 'Cinder & Row begins', description: 'One van, one phone and a promise to communicate clearly.' }, { year: '2022', title: 'The second engineer', description: 'More local coverage without losing the personal service.' }, { year: '2026', title: 'Trusted across North London', description: 'Still independent. Still answering our own phones.' }] },
  schema: schema(...headingSchema, repeater('milestones', 'Milestones', [text('year', 'Year'), text('title', 'Title'), textarea('description', 'Description')], { itemLabel: 'Milestone' })),
  component: (props) => <SectionShell props={props} className="ud-cr-timeline"><div className="ud-cr-wide ud-cr-timeline__grid"><div><E props={props} path={['eyebrow']} value={props.eyebrow} as="p" className="ud-cr-kicker" /><Title props={props} /><SafeText value={str(props.description)} className="ud-cr-copy" edit={editOf(props)} path={['description']} /></div><div>{items(props.milestones, []).map((m, i) => <article key={i}><i>{String(i + 1).padStart(2, '0')}</i><div><h3><E props={props} path={['milestones', i, 'title']} value={m.title} /></h3><SafeText value={str(m.description)} className="ud-cr-copy" edit={editOf(props)} path={['milestones', i, 'description']} /></div><strong><E props={props} path={['milestones', i, 'year']} value={m.year} /></strong></article>)}</div></div></SectionShell>,
})

export const valuesCinder = defineBlock({
  type: 'features.cinder_values', version: 1, category: 'features', label: 'Cinder values cards', icon: 'CheckCircle',
  defaultProps: { eyebrow: 'HOW WE WORK', heading: 'Four things', accent: 'we never skip.', items: [{ title: 'We arrive when we say.', description: 'Honest 30-minute windows and an update if traffic changes.' }, { title: 'We show you the fault.', description: 'A quick explanation before any decision is made.' }, { title: 'The quote stays put.', description: 'If the job changes, you approve it first.' }, { title: 'We leave it tidy.', description: 'Floor covers down, tools packed, surfaces wiped.' }] },
  schema: schema(eyebrowField, headingField, text('accent', 'Accent'), repeater('items', 'Values', [text('title', 'Title'), textarea('description', 'Description')], { itemLabel: 'Value' })),
  component: (props) => <SectionShell props={props} className="ud-cr-values"><div className="ud-cr-wide"><E props={props} path={['eyebrow']} value={props.eyebrow} as="p" className="ud-cr-kicker" /><Title props={props} /><div className="ud-cr-values__grid">{items(props.items, []).map((item, i) => <article key={i}><span>{String(i + 1).padStart(2, '0')}</span><h3><E props={props} path={['items', i, 'title']} value={item.title} /></h3><SafeText value={str(item.description)} className="ud-cr-copy" edit={editOf(props)} path={['items', i, 'description']} /></article>)}</div></div></SectionShell>,
})

export const journalCinder = defineBlock({
  type: 'blog.cinder', version: 1, category: 'blog', label: 'Cinder journal cards', icon: 'Newspaper',
  defaultProps: { eyebrow: 'LATEST NOTES', heading: 'Useful reads,', accent: 'zero filler.', featured: true, postCtaLabel: 'Read note', posts: [{ category: 'WINTER PREP', date: '12 OCT · 6 MIN', title: 'Six heating checks before the first cold snap', description: 'A short walk-through that can save an emergency call-out.', image: 'https://images.unsplash.com/photo-1585129777188-94600bc7b4b3?auto=format&fit=crop&w=1200&q=85' }, { category: 'LANDLORDS', date: '28 SEP · 4 MIN', title: 'What a gas safety certificate should actually include', description: 'The practical checklist every landlord should keep.', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=85' }, { category: 'LOCAL', date: '14 SEP · 5 MIN', title: 'The North London streets built around old industry', description: 'A short history seen from the service van.', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=85' }, { category: 'BOILERS', date: '3 SEP · 7 MIN', title: 'Repair or replace? A clear cost breakdown', description: 'The questions we use before recommending a new boiler.', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85' }] },
  schema: schema(eyebrowField, headingField, text('accent', 'Accent'), text('postCtaLabel', 'Post CTA label'), toggle('featured', 'Feature first post', 'layout'), repeater('posts', 'Posts', [text('category', 'Category'), text('date', 'Date / read time'), text('title', 'Title'), textarea('description', 'Description'), image('image', 'Image')], { itemLabel: 'Post' })),
  component: (props) => <SectionShell props={props} className={cx('ud-cr-journal', bool(props.featured, true) && 'has-featured')}><div className="ud-cr-wide"><E props={props} path={['eyebrow']} value={props.eyebrow} as="p" className="ud-cr-kicker" /><Title props={props} /><div className="ud-cr-journal__grid">{items(props.posts, []).map((post, i) => <article key={i} className={i === 0 && bool(props.featured, true) ? 'is-featured' : ''}><Media src={str(post.image)} alt={str(post.title)} ratio="wide" edit={editOf(props)} path={['posts', i, 'image']} /><div><span><E props={props} path={['posts', i, 'category']} value={post.category} /> · <E props={props} path={['posts', i, 'date']} value={post.date} /></span><h3><E props={props} path={['posts', i, 'title']} value={post.title} /></h3><SafeText value={str(post.description)} className="ud-cr-copy" edit={editOf(props)} path={['posts', i, 'description']} /><ArrowLink href="#" dark><E props={props} path={['postCtaLabel']} value={str(props.postCtaLabel, 'Read note')} /></ArrowLink></div></article>)}</div></div></SectionShell>,
})

export const contactCinder = defineBlock({
  type: 'form.cinder', version: 1, category: 'form', label: 'Cinder contact form', icon: 'Mail',
  defaultProps: { eyebrow: 'SEND A NOTE', heading: 'Tell us what', accent: 'needs fixing.', description: 'The more detail you share, the quicker we can estimate the right next step.', phoneLabel: 'PHONE', emailLabel: 'EMAIL', hoursLabel: 'HOURS', phone: '020 7946 0182', email: 'hello@cinderandrow.co.uk', hours: 'Mon–Fri 07:30–19:00 · Sat 08:00–16:00', formId: '', submitLabel: 'Send it over', topics: [{ label: 'Boiler repair' }, { label: 'Annual service' }, { label: 'Safety check' }, { label: 'New installation' }, { label: 'Something else' }] },
  schema: schema(...headingSchema, text('phoneLabel', 'Phone label'), text('phone', 'Phone'), text('emailLabel', 'Email label'), text('email', 'Email'), text('hoursLabel', 'Hours label'), text('hours', 'Hours'), text('formId', 'Connected form'), text('submitLabel', 'Submit label'), repeater('topics', 'Service choices', [text('label', 'Label')], { itemLabel: 'Choice' })),
  component: function ContactCinder(props) { return <SectionShell props={props} className="ud-cr-contact"><div className="ud-cr-wide ud-cr-contact__grid"><div><E props={props} path={['eyebrow']} value={props.eyebrow} as="p" className="ud-cr-kicker" /><Title props={props} /><SafeText value={str(props.description)} className="ud-cr-copy" edit={editOf(props)} path={['description']} /><dl><div><dt><E props={props} path={['phoneLabel']} value={str(props.phoneLabel, 'PHONE')} /></dt><dd><E props={props} path={['phone']} value={props.phone} /></dd></div><div><dt><E props={props} path={['emailLabel']} value={str(props.emailLabel, 'EMAIL')} /></dt><dd><E props={props} path={['email']} value={props.email} /></dd></div><div><dt><E props={props} path={['hoursLabel']} value={str(props.hoursLabel, 'HOURS')} /></dt><dd><E props={props} path={['hours']} value={props.hours} /></dd></div></dl></div><PublicForm formId={str(props.formId) || undefined} variant="cinder" submitLabel={str(props.submitLabel)} edit={editOf(props)} submitLabelPath={['submitLabel']} choicePath={(index) => ['topics', index, 'label']} choiceOptions={items(props.topics, []).map((item) => str(item.label)).filter(Boolean)} fields={[{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'phone', label: 'Phone', type: 'phone' }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'postcode', label: 'Postcode', type: 'text' }, { name: 'service', label: 'What do you need?', type: 'radio' }, { name: 'message', label: 'Tell us a bit more', type: 'textarea', required: true }]} /></div></SectionShell> },
})

export const ctaCinder = defineBlock({
  type: 'cta.cinder', version: 1, category: 'cta', label: 'Cinder orange CTA', icon: 'MousePointerClick',
  defaultProps: { eyebrow: 'NEED HEAT? NO DRAMA.', heading: 'Give us a ring.', accent: 'We’ll get you warm.', description: 'Call, message or email—whichever is easiest. Same-day slots when we can.', actions: [{ icon: 'phone', label: 'Call 020 7946 0182', url: 'tel:+442079460182' }, { icon: 'message-circle', label: 'WhatsApp us', url: '#' }, { icon: 'mail', label: 'Send a message', url: '/contact' }] },
  schema: schema(...headingSchema, repeater('actions', 'Actions', [text('icon', 'Icon'), text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Action' })),
  component: (props) => <SectionShell props={props} className="ud-cr-cta" bleed><div className="ud-cr-wide ud-cr-cta__grid"><div><E props={props} path={['eyebrow']} value={props.eyebrow} as="p" className="ud-cr-kicker" /><Title props={props} /><SafeText value={str(props.description)} className="ud-cr-copy" edit={editOf(props)} path={['description']} /></div><div>{items(props.actions, []).map((action, i) => <ArrowLink key={i} href={str(action.url, '#')} dark><Icon name={str(action.icon, 'arrow')} size={18} /><E props={props} path={['actions', i, 'label']} value={action.label} /></ArrowLink>)}</div></div></SectionShell>,
})

export const footerCinder = defineBlock({
  type: 'footer.cinder', version: 1, category: 'footer', label: 'Cinder editorial footer', icon: 'PanelBottom',
  defaultProps: { brand: 'Cinder & Row', heading: 'Keeping North London warm since 2017.', description: 'Independent heating engineers. Clear quotes, careful work and friendly follow-through.', copyright: '© 2026 Cinder & Row · Gas Safe registered · Fully insured', emergency: 'Smell gas? Call the National Gas Emergency Service: 0800 111 999', pagesLabel: 'PAGES', emergencyLabel: 'EMERGENCY', links: [{ label: 'Home', url: '/' }, { label: 'Our story', url: '/story' }, { label: 'Services', url: '/services' }, { label: 'Journal', url: '/journal' }, { label: 'Contact', url: '/contact' }] },
  schema: schema(text('brand', 'Brand'), headingField, descriptionField, text('copyright', 'Copyright'), text('pagesLabel', 'Links column label'), text('emergencyLabel', 'Emergency column label'), textarea('emergency', 'Emergency notice'), repeater('links', 'Links', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' })),
  component: (props) => <footer className="ud-cr-footer"><div className="ud-cr-wide ud-cr-footer__grid"><div><strong><E props={props} path={['brand']} value={props.brand} /></strong><h2><E props={props} path={['heading']} value={props.heading} /></h2><SafeText value={str(props.description)} className="ud-cr-copy" edit={editOf(props)} path={['description']} /></div><nav><span><E props={props} path={['pagesLabel']} value={str(props.pagesLabel, 'PAGES')} /></span>{items(props.links, []).map((item, i) => <a href={str(item.url, '#')} key={i}><E props={props} path={['links', i, 'label']} value={item.label} /></a>)}</nav><div><span><E props={props} path={['emergencyLabel']} value={str(props.emergencyLabel, 'EMERGENCY')} /></span><SafeText value={str(props.emergency)} className="ud-cr-copy" edit={editOf(props)} path={['emergency']} /></div></div><div className="ud-cr-wide ud-cr-footer__base"><E props={props} path={['copyright']} value={props.copyright} /></div></footer>,
})
