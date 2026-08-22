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
  descriptionField,
  eyebrowField,
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

function mkLinks(props: Props) {
  return items(props.links, []).map((item) => ({
    label: str(item.label),
    url: str(item.url) || str(item.href) || '#',
    children: item.children,
  }))
}

function BrandMark({ props }: { props: Props }) {
  const edit = editOf(props)
  return (
    <a href={str(props.logoUrl, '/')} className="ud-mk-brand">
      <span className="ud-mk-brand__mark" aria-hidden>
        {str(props.logoIcon, 'm') === 'm' ? 'm' : <Icon name={str(props.logoIcon, 'heart')} size={15} />}
      </span>
      <EditableText edit={edit} path={['logo']} value={str(props.logo, 'Nivara')} placeholder="Brand" />
    </a>
  )
}

function MkButton({ href, children, light = false }: { href: string; children: ReactNode; light?: boolean }) {
  return (
    <Button href={href} variant={light ? 'ghost' : 'primary'} className={cx('ud-mk-btn', light && 'ud-mk-btn--light')}>
      {children}
    </Button>
  )
}

export const navbarMoksha = defineBlock({
  type: 'navbar.moksha',
  version: 1,
  category: 'navigation',
  label: 'Nivara navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Nivara',
    logoIcon: 'm',
    logoUrl: '/',
    buttonLabel: 'Start free trial',
    buttonUrl: '/contact',
    sticky: true,
    links: [
      { label: 'Home', url: '/' },
      { label: 'About', url: '#about' },
      { label: 'Classes', url: '#classes' },
      { label: 'Benefits', url: '#benefits' },
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
  component: function NavbarMoksha(props) {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    const links = mkLinks(props)
    const anim = animationOf(props)
    return (
      <header
        className={cx('ud-mk-nav', bool(props.sticky, true) && 'ud-mk-nav--sticky', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-container ud-mk-nav__bar">
          <BrandMark props={props} />
          <nav className={cx('ud-mk-nav__links', open && 'is-open')} aria-label="Primary">
            {links.map((item, index) => (
              <NavItem key={`${item.url}-${index}`} item={item}>
                <a href={item.url} className="ud-mk-nav__link">
                  <EditableText edit={edit} path={['links', index, 'label']} value={item.label} placeholder="Link" />
                  <SubmenuCaret show={hasSubmenu(item)} />
                </a>
                <Submenu props={props} item={item} index={index} />
              </NavItem>
            ))}
          </nav>
          <div className="ud-mk-nav__actions">
            {str(props.buttonLabel) || edit ? (
              <MkButton href={str(props.buttonUrl, '/contact')}>
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Get started" />
              </MkButton>
            ) : null}
          </div>
          <button type="button" className="ud-mk-nav__toggle" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>
            <Icon name={open ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </header>
    )
  },
})

export const heroMoksha = defineBlock({
  type: 'hero.moksha',
  version: 1,
  category: 'hero',
  label: 'Nivara hero',
  icon: 'Image',
  defaultProps: {
    heading: 'Transform your body and mind through yoga',
    description: 'Join a community of mindful movers. In-studio and online yoga classes for all levels, designed to reconnect your body and breath.',
    buttonLabel: 'Book a Class',
    buttonUrl: '/pricing',
    image: 'https://images.squarespace-cdn.com/content/v1/5ff4ecb14a7dfd4e6e8c2926/1627067207628-RV1N3Q0393HPZ208WNZJ/sabi-pathways-yoga-pose-virabhadrasana-2',
    imageAlt: 'Yoga class in a bright studio',
    minHeight: 994,
    headingSize: 52,
    bodySize: 18,
    lightText: true,
    animation: 'fade-up',
    animationTrigger: 'load',
  },
  schema: schema(
    headingField,
    descriptionField,
    ...primaryCtaFields,
    image('image', 'Background photo'),
    text('imageAlt', 'Image alt text'),
    field('minHeight', 'number', 'Minimum height', 'layout'),
  ),
  component: function HeroMoksha(props) {
    const edit = editOf(props)
    const image = str(props.image)
    const minHeight = num(props.minHeight, 520)
    return (
      <SectionShell
        props={props}
        className="ud-mk ud-mk-hero"
        bleed
        tone="dark"
        style={{ minHeight, backgroundImage: image ? `url(${image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' } as CSSProperties}
      >
        <div className="ud-mk-hero__overlay" aria-hidden />
        <div className="ud-container ud-mk-hero__copy">
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h1" className="ud-h1" placeholder="Headline" />
          <SafeText value={str(props.description)} className="ud-lead" edit={edit} path={['description']} placeholder="Supporting copy" />
          {str(props.buttonLabel) || edit ? (
            <MkButton href={str(props.buttonUrl, '/pricing')} light>
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Join now" />
            </MkButton>
          ) : null}
        </div>
        {edit ? (
          <div className="ud-container" style={{ position: 'relative', zIndex: 3, marginTop: 12 }}>
            <Media src={image} alt={str(props.imageAlt, 'Studio')} ratio="wide" edit={edit} path={['image']} />
          </div>
        ) : null}
      </SectionShell>
    )
  },
})

export const aboutMoksha = defineBlock({
  type: 'about.moksha',
  version: 1,
  category: 'content',
  label: 'Nivara about',
  icon: 'Users',
  defaultProps: {
    eyebrow: 'Welcome to Nivara',
    heading: 'About Nivara',
    subheading: 'Build Strength, Improve Balance & Calm Your Mind',
    description:
      'Experience mindful movement, guided sessions and a supportive space to strengthen your body and calm your mind.',
    buttonLabel: 'More About Us',
    buttonUrl: '/classes',
    image: 'https://images.unsplash.com/photo-1713201509882-e514071fec1a?auto=format&fit=crop&w=1100&q=85',
    imageAlt: 'Instructor in a yoga pose',
    stats: [
      { icon: 'calendar', value: '25+', label: 'Courses' },
      { icon: 'users', value: '30+', label: 'Trainers' },
      { icon: 'star', value: '500+', label: 'Events' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    text('subheading', 'Subheading'),
    descriptionField,
    ...primaryCtaFields,
    image('image', 'Photo'),
    text('imageAlt', 'Photo alt'),
    repeater(
      'stats',
      'Stats',
      [icon('icon', 'Icon'), text('value', 'Value'), text('label', 'Label')],
      { itemLabel: 'Stat' },
    ),
  ),
  component: function AboutMoksha(props) {
    const edit = editOf(props)
    const stats = items(props.stats, [])
    return (
      <SectionShell props={props} className="ud-mk ud-mk-about" anchorId="about">
        <div className="ud-mk-section-head">
          {str(props.eyebrow) || edit ? (
            <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-mk-eyebrow" placeholder="Eyebrow" />
          ) : null}
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
        </div>
        <div className="ud-mk-about__grid">
          <Media src={str(props.image)} alt={str(props.imageAlt)} ratio="portrait" className="ud-mk-about__photo" edit={edit} path={['image']} />
          <div>
            {str(props.subheading) || edit ? (
              <EditableText edit={edit} path={['subheading']} value={str(props.subheading)} as="h3" className="ud-h3" placeholder="Subheading" />
            ) : null}
            <SafeText value={str(props.description)} className="ud-text" edit={edit} path={['description']} placeholder="Body" />
            <div className="ud-mk-about__stats">
              {stats.map((item, index) => (
                <article key={index} className="ud-mk-about__stat">
                  <span className="ud-mk-about__stat-icon" aria-hidden>
                    <Icon name={str(item.icon, 'star')} size={18} />
                  </span>
                  <EditableText edit={edit} path={['stats', index, 'value']} value={str(item.value)} as="p" className="ud-mk-about__stat-value" placeholder="0" />
                  <EditableText edit={edit} path={['stats', index, 'label']} value={str(item.label)} as="p" className="ud-small" placeholder="Label" />
                </article>
              ))}
            </div>
            {str(props.buttonLabel) || edit ? (
              <MkButton href={str(props.buttonUrl, '/classes')}>
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Read more" />
              </MkButton>
            ) : null}
          </div>
        </div>
      </SectionShell>
    )
  },
})

export const featuresMoksha = defineBlock({
  type: 'features.moksha',
  version: 1,
  category: 'features',
  label: 'Nivara feature list',
  icon: 'Layout',
  defaultProps: {
    eyebrow: 'Explore Classes',
    heading: 'Yoga Designed for You',
    buttonLabel: 'Explore All Classes',
    buttonUrl: '/classes',
    image: 'https://cdn.prod.website-files.com/5f8efb5ada9510581ae5242b/65815cec1505805ec583ba42_pexels-vlada-karpovich-4534604.jpg',
    imageAlt: 'Member practicing near a window',
    items: [
      { title: 'Relaxing Flow', text: 'Slow, gentle movements to release tension and calm your mind.' },
      { title: 'Guided Meditation', text: 'Mindful breathing and focus techniques to reduce stress and improve clarity.' },
      { title: 'Strength Flow', text: 'Build strength, stability, and endurance through dynamic sequences.' },
      { title: 'Balance & Flexibility', text: 'Improve posture, coordination, and flexibility with controlled movements.' },
      { title: 'Power Vinyasa', text: 'Improve posture, coordination, and flexibility with controlled movements.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    text('buttonLabel', 'Link label'),
    link('buttonUrl', 'Link URL'),
    image('image', 'Photo'),
    text('imageAlt', 'Photo alt'),
    repeater(
      'items',
      'Features',
      [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Body')],
      { itemLabel: 'Feature' },
    ),
  ),
  component: function FeaturesMoksha(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-mk ud-mk-feat" anchorId="classes">
        {str(props.eyebrow) || edit ? <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-mk-eyebrow" placeholder="Eyebrow" /> : null}
        <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
        <div className="ud-mk-feat__grid">
          <div>
            <div className="ud-mk-feat__list">
              {list.map((item, index) => (
                <article key={index} className="ud-mk-feat__item">
                  <span className="ud-mk-feat__number" aria-hidden>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="h3" className="ud-h4" placeholder="Title" />
                    <SafeText value={str(item.text)} className="ud-text" edit={edit} path={['items', index, 'text']} placeholder="Body" />
                  </div>
                  <span className="ud-mk-feat__arrow" aria-hidden><Icon name="arrow" size={17} /></span>
                </article>
              ))}
            </div>
          </div>
          <div className="ud-mk-feat__visual">
            <a href={str(props.buttonUrl, '/classes')} className="ud-mk-feat__more"><EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel, 'Explore All Classes')} placeholder="Link label" /> <Icon name="arrow" size={16} /></a>
            <Media src={str(props.image)} alt={str(props.imageAlt)} ratio="portrait" className="ud-mk-feat__photo" edit={edit} path={['image']} />
          </div>
        </div>
      </SectionShell>
    )
  },
})

export const benefitsMoksha = defineBlock({
  type: 'benefits.moksha',
  version: 1,
  category: 'features',
  label: 'Nivara benefits grid',
  icon: 'LayoutGrid',
  defaultProps: {
    eyebrow: "What You'll Gain",
    heading: 'Benefits of Yoga',
    description: 'Improve your body, calm your mind and build a healthier lifestyle with consistent yoga practice.',
    items: [
      { icon: 'heart', title: 'Better Heart Health', text: 'Support cardiovascular health and improve blood circulation naturally.' },
      { icon: 'chart', title: 'Flexibility & mobility', text: 'Increase your range of motion and move with greater ease every day.' },
      { icon: 'target', title: 'Mental Clarity', text: 'Enhance focus, reduce stress, and bring calmness to your mind.' },
      { icon: 'zap', title: 'Boost Energy', text: 'Feel more energized and refreshed with regular yoga sessions.' },
      { icon: 'shield', title: 'Stronger Immunity', text: "Strengthen your body's natural defense system and overall wellness." },
      { icon: 'sun', title: 'Emotional Balance', text: 'Improve mood and achieve a sense of inner peace and stability.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater(
      'items',
      'Benefits',
      [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Body')],
      { itemLabel: 'Benefit' },
    ),
  ),
  component: function BenefitsMoksha(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-mk ud-mk-benefits" align="center" anchorId="benefits">
        {str(props.eyebrow) || edit ? <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-mk-eyebrow" placeholder="Eyebrow" /> : null}
        <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
        <SafeText value={str(props.description)} className="ud-lead" edit={edit} path={['description']} placeholder="Body" />
        <div className="ud-mk-benefits__grid">
          {list.map((item, index) => (
            <article key={index} className="ud-mk-benefits__card">
              <span className="ud-mk-benefits__icon" aria-hidden>
                <Icon name={str(item.icon, 'heart')} size={18} />
              </span>
              <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="h3" className="ud-h4" placeholder="Title" />
              <SafeText value={str(item.text)} className="ud-text" edit={edit} path={['items', index, 'text']} placeholder="Body" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

export const storyMoksha = defineBlock({
  type: 'story.moksha',
  version: 1,
  category: 'content',
  label: 'Nivara story band',
  icon: 'BookOpen',
  defaultProps: {
    eyebrow: 'About Instructor',
    heading: "Hi, I’m Elena, Your Coach",
    description: 'Helping you build strength, find balance, and reconnect with your mind through guided yoga practices.',
    items: [
      { icon: 'award', title: 'Certified Yoga Instructor', text: '500+ hours Yoga Alliance certified' },
      { icon: 'sparkles', title: 'Holistic Approach', text: 'Blending breath, movement and mindfulness' },
      { icon: 'globe', title: 'Global Experience', text: 'Trained and practiced across India and Europe.' },
    ],
    image: 'https://images.pexels.com/photos/6958391/pexels-photo-6958391.jpeg?auto=compress&cs=tinysrgb&w=1400',
    imageAlt: 'Member stretching in studio light',
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater('items', 'Credentials', [icon('icon', 'Icon'), text('title', 'Title'), textarea('text', 'Body')], { itemLabel: 'Credential' }),
    image('image', 'Photo'),
    text('imageAlt', 'Photo alt'),
  ),
  component: function StoryMoksha(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-mk ud-mk-story">
        <div className="ud-mk-story__grid">
          <Media src={str(props.image)} alt={str(props.imageAlt)} ratio="wide" className="ud-mk-story__photo" edit={edit} path={['image']} />
          <div>
            {str(props.eyebrow) || edit ? <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-mk-eyebrow" placeholder="Eyebrow" /> : null}
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
            <SafeText value={str(props.description)} className="ud-text" edit={edit} path={['description']} placeholder="Body" />
            <div className="ud-mk-story__list">
              {list.map((item, index) => (
                <article key={index} className="ud-mk-story__item">
                  <span className="ud-mk-story__icon"><Icon name={str(item.icon, 'award')} size={20} /></span>
                  <div>
                    <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="h3" className="ud-h4" placeholder="Title" />
                    <SafeText value={str(item.text)} className="ud-small" edit={edit} path={['items', index, 'text']} placeholder="Body" />
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

export const testimonialsMoksha = defineBlock({
  type: 'testimonials.moksha',
  version: 1,
  category: 'testimonials',
  label: 'Nivara quotes',
  icon: 'Quote',
  defaultProps: {
    eyebrow: 'Loved by community',
    heading: 'What Our Members Say',
    items: [
      { name: 'Richard Nelson', role: 'Los Angeles', text: '“Super clean and easy to use. These Tailwind + React components saved me hours of dev time and countless lines of extra code!”', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', rating: 5 },
      { name: 'Sophia Martinez', role: 'Los Angeles', text: '“The design quality is top-notch. Perfect balance between simplicity and style. Highly recommend for any creative developer!”', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', rating: 5 },
      { name: 'Ethan Roberts', role: 'Calgary', text: '“Absolutely love the reusability of these components. My workflow feels 10x faster now with cleaner and more consistent layouts.”', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80', rating: 5 },
      { name: 'Isabella Kim', role: 'Toronto', text: '“Clean, elegant and efficient. These components are a dream for any modern web developer who values beautiful code.”', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80', rating: 5 },
      { name: 'Liam Johnson', role: 'Calgary', text: '“I’ve tried dozens of UI kits, but this one just feels right. Everything works seamlessly and looks incredibly polished.”', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', rating: 5 },
      { name: 'Ava Patel', role: 'Toronto', text: '“Brilliantly structured components with clean, modern styling. Makes development a joy and design updates super quick.”', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80', rating: 5 },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    repeater(
      'items',
      'Quotes',
      [
        text('name', 'Name'),
        text('role', 'Role'),
        textarea('text', 'Quote'),
        image('image', 'Photo'),
        field('rating', 'number', 'Stars', 'content'),
      ],
      { itemLabel: 'Quote' },
    ),
  ),
  component: function TestimonialsMoksha(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    return (
      <SectionShell props={props} className="ud-mk ud-mk-quotes" align="center">
        {str(props.eyebrow) || edit ? <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-mk-eyebrow" placeholder="Eyebrow" /> : null}
        <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
        <div className="ud-mk-quotes__grid">
          {list.map((item, index) => (
            <article key={index} className="ud-mk-quotes__card">
              <Stars count={num(item.rating, 5)} />
              <SafeText value={str(item.text)} className="ud-text" edit={edit} path={['items', index, 'text']} placeholder="Quote" />
              <footer>
                <Avatar src={str(item.image)} name={str(item.name)} edit={edit} path={['items', index, 'image']} />
                <div>
                  <EditableText edit={edit} path={['items', index, 'name']} value={str(item.name)} as="strong" placeholder="Name" />
                  <EditableText edit={edit} path={['items', index, 'role']} value={str(item.role)} as="p" className="ud-small" placeholder="Role" />
                </div>
              </footer>
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

export const pricingMoksha = defineBlock({
  type: 'pricing.moksha',
  version: 1,
  category: 'pricing',
  label: 'Nivara pricing',
  icon: 'CreditCard',
  defaultProps: {
    eyebrow: 'Membership Plans',
    heading: 'Choose Your Yoga Journey',
    description: 'Flexible plans designed to support your wellness journey at every stage.',
    plans: [
      {
        name: 'Beginner Flow',
        price: '$9',
        period: '/month',
        tagline: 'Perfect for starting your yoga journey',
        features: '5 guided classes per week\nAccess to basics library\nCommunity forum access\nMonthly progress check-in\nEmail support only',
        buttonLabel: 'Get Started',
        buttonUrl: '/contact',
      },
      {
        name: 'Balanced Practice',
        price: '$29',
        period: '/month',
        tagline: 'Build consistency and improve steadily',
        features: '10 guided classes per week\nFull library access\nPose analysis tool\nMonthly coaching call\nPriority support',
        buttonLabel: 'Upgrade Now',
        buttonUrl: '/contact',
        highlighted: true,
        badge: 'Most Popular',
      },
      {
        name: 'Full Experience',
        price: '$49',
        period: '/month',
        tagline: 'For deep practice and transformation',
        features: 'Unlimited classes\nPersonalized programs\nOne-on-one sessions\nPrivate community\n24/7 priority support',
        buttonLabel: 'Contact Sales',
        buttonUrl: '/contact',
      },
    ],
    animation: 'fade-up',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    repeater(
      'plans',
      'Plans',
      [
        text('name', 'Name'),
        text('price', 'Price'),
        text('period', 'Period'),
        text('tagline', 'Tagline'),
        textarea('features', 'Features (one per line)'),
        text('buttonLabel', 'Button'),
        link('buttonUrl', 'Button link'),
        toggle('highlighted', 'Highlight', 'content'),
        text('badge', 'Badge'),
      ],
      { itemLabel: 'Plan' },
    ),
  ),
  component: function PricingMoksha(props) {
    const edit = editOf(props)
    const plans = items(props.plans, [])
    return (
      <SectionShell props={props} className="ud-mk ud-mk-price" align="center">
        {str(props.eyebrow) || edit ? <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-mk-eyebrow" placeholder="Eyebrow" /> : null}
        <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
        <SafeText value={str(props.description)} className="ud-lead" edit={edit} path={['description']} placeholder="Body" />
        <div className="ud-mk-price__grid">
          {plans.map((plan, index) => {
            const on = bool(plan.highlighted, false)
            return (
              <article key={index} className={cx('ud-mk-price__card', on && 'ud-mk-price__card--on')}>
                {str(plan.badge) || (edit && on) ? (
                  <EditableText edit={edit} path={['plans', index, 'badge']} value={str(plan.badge)} as="span" className="ud-mk-price__badge" placeholder="Badge" />
                ) : null}
                <EditableText edit={edit} path={['plans', index, 'name']} value={str(plan.name)} as="h3" className="ud-h4" placeholder="Plan" />
                <p className="ud-mk-price__amount">
                  <EditableText edit={edit} path={['plans', index, 'price']} value={str(plan.price)} placeholder="$0" />
                  <EditableText edit={edit} path={['plans', index, 'period']} value={str(plan.period, '/mo')} as="span" className="ud-small" placeholder="/mo" />
                </p>
                {str(plan.tagline) || edit ? <EditableText edit={edit} path={['plans', index, 'tagline']} value={str(plan.tagline)} as="p" className="ud-small ud-mk-price__tagline" placeholder="Tagline" /> : null}
                <CheckList values={lines(plan.features)} icon="check" edit={edit} path={['plans', index, 'features']} />
                <MkButton href={str(plan.buttonUrl, '/contact')}>
                  <EditableText edit={edit} path={['plans', index, 'buttonLabel']} value={str(plan.buttonLabel, 'Select plan')} placeholder="Select plan" />
                </MkButton>
              </article>
            )
          })}
        </div>
      </SectionShell>
    )
  },
})

export const faqMoksha = defineBlock({
  type: 'faq.moksha',
  version: 1,
  category: 'faq',
  label: 'Nivara FAQ grid',
  icon: 'CircleHelp',
  defaultProps: {
    eyebrow: 'FAQs',
    heading: 'Frequently asked questions',
    description: 'Improve your body, calm your mind and build a healthier lifestyle with consistent yoga practice.',
    openFirst: false,
    items: [
      { question: 'What is included in the Starter plan?', answer: 'Five guided classes each week, access to the basics library, and community support.' },
      { question: 'Do you offer a free trial?', answer: 'Yes. New members can try their first guided class free.' },
      { question: 'Can I switch plans later?', answer: 'Yes, you can upgrade or change your plan at any time.' },
      { question: 'What payment methods do you accept?', answer: 'We accept all major cards and supported digital wallets.' },
      { question: 'How secure is my data?', answer: 'Your account and payment details are protected using modern security standards.' },
      { question: 'How does the 2% donation work?', answer: 'Two percent of eligible membership revenue supports community wellness programs.' },
      { question: 'Can I integrate this platform with other tools?', answer: 'Yes, supported integrations can connect your favorite planning and wellness tools.' },
      { question: 'What makes your platform different?', answer: 'Thoughtful instruction, flexible access, and a supportive community in one place.' },
    ],
    animation: 'fade-up',
  },
  schema: schema(eyebrowField, headingField, descriptionField, toggle('openFirst', 'Open the first item', 'design'), repeater('items', 'Questions', [text('question', 'Question'), textarea('answer', 'Answer')], { itemLabel: 'Question' })),
  component: function FaqMoksha(props) {
    const edit = editOf(props)
    const list = items(props.items, [])
    const left = list.filter((_, index) => index % 2 === 0)
    const right = list.filter((_, index) => index % 2 === 1)
    const renderCol = (col: typeof list, offset: number) =>
      col.map((item, index) => {
        const globalIndex = offset + index * 2
        return (
          <details key={globalIndex} className="ud-mk-faq__item" open={bool(props.openFirst, true) && globalIndex === 0}>
            <summary
              onClick={(event) => {
                if (edit && (event.target as HTMLElement).closest('.ud-editable')) event.preventDefault()
              }}
            >
              <EditableText edit={edit} path={['items', globalIndex, 'question']} value={str(item.question)} as="span" placeholder="Question" />
              <Icon name="plus" size={16} />
            </summary>
            <SafeText value={str(item.answer)} className="ud-mk-faq__body" edit={edit} path={['items', globalIndex, 'answer']} placeholder="Answer" />
          </details>
        )
      })
    return (
      <SectionShell props={props} className="ud-mk ud-mk-faq" align="center">
        {str(props.eyebrow) || edit ? <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-mk-eyebrow" placeholder="Eyebrow" /> : null}
        <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
        <SafeText value={str(props.description)} className="ud-lead" edit={edit} path={['description']} placeholder="Body" />
        <div className="ud-mk-faq__grid">
          <div className="ud-mk-faq__col">{renderCol(left, 0)}</div>
          <div className="ud-mk-faq__col">{renderCol(right, 1)}</div>
        </div>
      </SectionShell>
    )
  },
})

export const ctaMoksha = defineBlock({
  type: 'cta.moksha',
  version: 1,
  category: 'cta',
  label: 'Nivara CTA band',
  icon: 'Arrow',
  defaultProps: {
    eyebrow: 'Ready to Start?',
    heading: 'Start Your Yoga Today',
    description: 'Take the first step toward balance, strength and inner peace with Nivara.',
    buttonLabel: 'Explore Memberships →',
    buttonUrl: '/contact',
    animation: 'fade-up',
  },
  schema: schema(eyebrowField, headingField, descriptionField, ...primaryCtaFields),
  component: function CtaMoksha(props) {
    const edit = editOf(props)
    return (
      <SectionShell props={props} className="ud-mk ud-mk-cta" align="center">
        {str(props.eyebrow) || edit ? <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-mk-eyebrow" placeholder="Eyebrow" /> : null}
        <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
        <SafeText value={str(props.description)} className="ud-lead" edit={edit} path={['description']} placeholder="Body" />
        <MkButton href={str(props.buttonUrl, '/contact')}>
          <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Get started" />
        </MkButton>
      </SectionShell>
    )
  },
})

export const footerMoksha = defineBlock({
  type: 'footer.moksha',
  version: 1,
  category: 'footer',
  label: 'Nivara footer',
  icon: 'PanelBottom',
  defaultProps: {
    logo: 'Nivara',
    logoIcon: 'm',
    logoUrl: '/',
    tagline: 'PrebuiltUI provides high-quality, customizable UI components and templates to help teams build faster and ship better products.',
    copyright: `© ${new Date().getFullYear()} PrebuiltUI. All Right Reserved.`,
    columns: [
      { title: 'Products', links: 'Templates|#\nComponents|#\nIcons|#\nUI Kits|#' },
      { title: 'Company', links: 'About Us|#\nCareers|#\nBlog|#\nContact|#' },
      { title: 'Resources', links: 'Documentation|#\nChangelog|#\nSupport|#\nAPI Reference|#' },
    ],
    legal: [
      { label: 'Privacy Policy', url: '#' },
      { label: 'Terms of Service', url: '#' },
      { label: 'About Us', url: '#' },
      { label: 'Team', url: '#' },
    ],
    social: [
      { icon: 'twitter', url: '#' },
      { icon: 'linkedin', url: '#' },
      { icon: 'youtube', url: '#' },
      { icon: 'instagram', url: '#' },
    ],
    animation: 'fade',
  },
  schema: schema(
    text('logo', 'Brand'),
    icon('logoIcon', 'Mark icon'),
    link('logoUrl', 'Brand link'),
    textarea('tagline', 'Tagline'),
    textarea('copyright', 'Copyright'),
    repeater('columns', 'Columns', [text('title', 'Title'), textarea('links', 'Links (Label|/url or plain line)')], { itemLabel: 'Column' }),
    repeater('legal', 'Legal links', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Link' }),
    repeater('social', 'Social', [icon('icon', 'Icon'), link('url', 'URL')], { itemLabel: 'Social' }),
  ),
  component: function FooterMoksha(props) {
    const edit = editOf(props)
    const columns = items(props.columns, [])
    const legal = items(props.legal, [])
    const social = items(props.social, [])
    return (
      <SectionShell props={props} className="ud-mk ud-mk-foot">
        <div className="ud-mk-foot__grid">
          <div>
            <BrandMark props={props} />
            <SafeText value={str(props.tagline)} className="ud-small" edit={edit} path={['tagline']} placeholder="Tagline" />
            <div className="ud-mk-foot__social">
              {social.map((item, index) => (
                <a key={index} href={str(item.url, '#')} aria-label={str(item.icon, 'social')}>
                  <Icon name={str(item.icon, 'globe')} size={16} />
                </a>
              ))}
            </div>
          </div>
          {columns.map((column, index) => (
            <div key={index}>
              <EditableText edit={edit} path={['columns', index, 'title']} value={str(column.title)} as="h3" className="ud-h4" placeholder="Column" />
              <LinkLines value={column.links} edit={edit} path={['columns', index, 'links']} />
            </div>
          ))}
        </div>
        <div className="ud-mk-foot__base">
          <EditableText edit={edit} path={['copyright']} value={str(props.copyright)} as="p" className="ud-small" placeholder="Copyright" />
          <div className="ud-mk-foot__legal">
            {legal.map((item, index) => (
              <a key={index} href={str(item.url, '#')}>
                <EditableText edit={edit} path={['legal', index, 'label']} value={str(item.label)} placeholder="Link" />
              </a>
            ))}
          </div>
        </div>
      </SectionShell>
    )
  },
})
