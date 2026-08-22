import { EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Avatar,
  Body,
  Button,
  CheckList,
  CtaGroup,
  Grid,
  Media,
  SafeText,
  SectionHead,
  SectionShell,
  bool,
  cx,
  items,
  lines,
  str,
  type Props,
} from '../primitives'
import { ctaFields, field, headFields, image, link, repeater, schema, text, toggle } from '../schema'
import { defineBlock } from '../types'

const avatars = [
  { image: '', name: 'Amina' },
  { image: '', name: 'Leo' },
  { image: '', name: 'Priya' },
  { image: '', name: 'Jonah' },
]

function MeshShell({
  props,
  children,
  tone = 'default',
  align,
}: {
  props: Props
  children: React.ReactNode
  tone?: 'default' | 'surface' | 'dark'
  align?: 'center'
}) {
  return (
    <SectionShell props={props} tone={tone} align={align} className={bool(props.mesh, true) ? 'ud-mesh' : undefined}>
      {children}
    </SectionShell>
  )
}

/* ------------------------------------------------------------ hero.studio */

export const heroStudio = defineBlock({
  type: 'hero.studio',
  version: 1,
  category: 'hero',
  label: 'Studio hero',
  icon: 'Sparkles',
  defaultProps: {
    heading: 'Building bold brands with',
    headingAccent: 'thoughtful design',
    description: 'We craft websites, identities, and campaigns for teams who want their next launch to feel considered — not templated.',
    buttonLabel: 'View Projects',
    buttonUrl: '/work',
    buttonVariant: 'secondary',
    socialProof: '100+ clients served',
    mesh: true,
    textAlign: 'center',
    paddingTop: 96,
    paddingBottom: 72,
    animation: 'fade-up',
    avatars,
  },
  schema: schema(
    text('heading', 'Headline'),
    text('headingAccent', 'Italic phrase'),
    field('description', 'textarea', 'Description', 'content'),
    ...ctaFields,
    text('socialProof', 'Social proof'),
    repeater('avatars', 'Avatars', [image('image', 'Photo'), text('name', 'Name')], {
      itemLabel: 'Person',
      itemDefaults: { name: 'Client' },
    }),
    toggle('mesh', 'Soft gradient glow', 'design'),
  ),
  component: (props) => {
    const edit = editOf(props)
    const faces = items(props.avatars, avatars)
    return (
      <MeshShell props={props} align="center">
        <div className="ud-studio-hero">
          <h1 className="ud-h1" style={{ margin: 0 }}>
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="span" placeholder="Headline" />{' '}
            <em className="ud-h-accent">
              <EditableText edit={edit} path={['headingAccent']} value={str(props.headingAccent)} as="span" placeholder="italic phrase" />
            </em>
          </h1>
          <SafeText value={props.description} className="ud-lead" edit={edit} path={['description']} placeholder="A short introduction" />
          <div className="ud-studio-hero__row">
            <CtaGroup props={props} primaryVariant="secondary" />
            {faces.length || str(props.socialProof) || edit ? (
              <div className="ud-studio-proof">
                <div className="ud-studio-avatars">
                  {faces.map((person, index) => (
                    <Avatar key={index} src={person.image} name={person.name} edit={edit} path={['avatars', index, 'image']} />
                  ))}
                </div>
                <EditableText
                  edit={edit}
                  path={['socialProof']}
                  value={str(props.socialProof)}
                  as="span"
                  className="ud-small"
                  placeholder="100+ clients served"
                />
              </div>
            ) : null}
          </div>
        </div>
      </MeshShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------- content.capabilities */

export const contentCapabilities = defineBlock({
  type: 'content.capabilities',
  version: 1,
  category: 'content',
  label: 'Capabilities + stats',
  icon: 'Layers',
  defaultProps: {
    heading: 'Crafting exceptional web experiences that convert visitors into customers',
    description: '',
    textAlign: 'center',
    animation: 'fade-up',
    tags: [
      { label: 'Creative Design', color: '#c4b5fd' },
      { label: 'SEO Strategy', color: '#93c5fd' },
      { label: 'Web Design', color: '#FEE232' },
    ],
    items: [
      { value: '+40', label: 'projects completed' },
      { value: '+15', label: 'years of experience' },
      { value: '+12', label: 'design awards' },
    ],
  },
  schema: schema(
    ...headFields,
    repeater('tags', 'Tags', [text('label', 'Label'), field('color', 'color', 'Color', 'content')], {
      itemLabel: 'Tag',
      itemDefaults: { label: 'Capability', color: '#FEE232' },
    }),
    repeater('items', 'Stats', [text('value', 'Value'), text('label', 'Label')], {
      itemLabel: 'Stat',
      itemDefaults: { value: '+10', label: 'Metric' },
    }),
  ),
  component: (props) => {
    const edit = editOf(props)
    const tags = items(props.tags, [])
    const stats = items(props.items, [])
    return (
      <SectionShell props={props} tone="default" align="center">
        <SectionHead props={props} defaultHeading="Capabilities" />
        {tags.length ? (
          <div className="ud-studio-tags">
            {tags.map((tag, index) => (
              <span key={index} className="ud-studio-tag" style={{ background: str(tag.color, 'var(--color-accent,#FEE232)') }}>
                <EditableText edit={edit} path={['tags', index, 'label']} value={str(tag.label)} as="span" placeholder="Tag" />
              </span>
            ))}
          </div>
        ) : null}
        <Body>
          <Grid cols={Math.min(Math.max(stats.length, 1), 3)} gap={32}>
            {stats.map((item, index) => (
              <div key={index} className="ud-studio-stat">
                <EditableText edit={edit} path={['items', index, 'value']} value={str(item.value)} as="div" className="ud-stat" placeholder="+40" />
                <EditableText edit={edit} path={['items', index, 'label']} value={str(item.label)} as="p" className="ud-small" placeholder="Label" />
              </div>
            ))}
          </Grid>
        </Body>
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------------- cta.bar */

export const ctaBar = defineBlock({
  type: 'cta.bar',
  version: 1,
  category: 'cta',
  label: 'Pill CTA bar',
  icon: 'Megaphone',
  defaultProps: {
    heading: "Enough about us, let's talk about you",
    buttonLabel: 'Contact Us',
    buttonUrl: '/contact',
    buttonVariant: 'light',
    animation: 'fade-up',
    paddingTop: 24,
    paddingBottom: 24,
  },
  schema: schema(text('heading', 'Message'), ...ctaFields),
  component: (props) => {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default">
        <div className="ud-cta-bar">
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h3" placeholder="Message" />
          <CtaGroup props={props} primaryVariant="light" />
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------ gallery.projects */

const projects = [
  { title: 'Northwind rebrand', tag: 'Brand', url: '/work' },
  { title: 'Harbour Table site', tag: 'Web', url: '/work' },
  { title: 'Fieldstone campaign', tag: 'Campaign', url: '/work' },
  { title: 'Cedar Clinic identity', tag: 'Brand', url: '/work' },
]

export const galleryProjects = defineBlock({
  type: 'gallery.projects',
  version: 1,
  category: 'gallery',
  label: 'Project grid',
  icon: 'LayoutGrid',
  defaultProps: {
    heading: 'How we transformed brands and created value for them',
    description: '',
    textAlign: 'center',
    exploreLabel: 'Explore',
    animation: 'fade-up',
    items: projects,
  },
  schema: schema(
    ...headFields,
    text('exploreLabel', 'Hover label'),
    repeater(
      'items',
      'Projects',
      [text('title', 'Title'), text('tag', 'Category'), image('image', 'Image'), link('url', 'Link')],
      { itemLabel: 'Project', itemDefaults: { title: 'New project', tag: 'Work', url: '/work' } },
    ),
  ),
  component: (props) => {
    const edit = editOf(props)
    const rows = items(props.items, projects)
    const explore = str(props.exploreLabel, 'Explore')
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} defaultHeading="Work" />
        <Body>
          <Grid cols={2} gap={28}>
            {rows.map((item, index) => {
              const inner = (
                <article className="ud-project">
                  <div className="ud-project__media">
                    <Media src={item.image} alt={str(item.title)} ratio="wide" zoom edit={edit} path={['items', index, 'image']} />
                    <span className="ud-project__explore">
                      <EditableText edit={edit} path={['exploreLabel']} value={explore} as="span" placeholder="Explore" />
                    </span>
                  </div>
                  <p className="ud-small" style={{ margin: '14px 0 0' }}>
                    <EditableText edit={edit} path={['items', index, 'tag']} value={str(item.tag)} placeholder="Category" />
                  </p>
                  <EditableText
                    edit={edit}
                    path={['items', index, 'title']}
                    value={str(item.title)}
                    as="h3"
                    className="ud-h4"
                    style={{ marginTop: 4 }}
                    placeholder="Project title"
                  />
                </article>
              )
              const href = str(item.url)
              return edit || !href ? (
                <div key={index}>{inner}</div>
              ) : (
                <a key={index} href={href} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {inner}
                </a>
              )
            })}
          </Grid>
        </Body>
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------- testimonials.bento */

const bento = [
  { role: 'quote', quote: 'They treated the homepage like a product. We still change the copy ourselves.', name: 'Amelia Chen', roleLabel: 'Head of Growth' },
  { role: 'stat', value: '91%', label: 'customer satisfaction' },
  { role: 'video', title: 'Watch the case study' },
  { role: 'text', quote: 'Clear process, no theatre, and a site the marketing team can actually own.', name: 'Jonah Patel', roleLabel: 'Founder' },
]

export const testimonialsBento = defineBlock({
  type: 'testimonials.bento',
  version: 1,
  category: 'testimonials',
  label: 'Bento testimonials',
  icon: 'Quote',
  defaultProps: {
    heading: '',
    animation: 'fade-up',
    items: bento,
  },
  schema: schema(
    ...headFields,
    repeater(
      'items',
      'Cards',
      [
        field('role', 'select', 'Card type', 'content', {
          options: [
            { label: 'Quote', value: 'quote' },
            { label: 'Stat', value: 'stat' },
            { label: 'Video', value: 'video' },
            { label: 'Note', value: 'text' },
          ],
        }),
        field('quote', 'textarea', 'Quote', 'content'),
        text('name', 'Name'),
        text('roleLabel', 'Role'),
        text('value', 'Stat value'),
        text('label', 'Stat label'),
        text('title', 'Video title'),
        image('image', 'Photo / poster'),
      ],
      { itemLabel: 'Card', itemDefaults: { role: 'quote', quote: 'A kind word.', name: 'Client' } },
    ),
  ),
  component: (props) => {
    const edit = editOf(props)
    const cards = items(props.items, bento)
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} defaultHeading="" />
        <div className="ud-bento">
          {cards.slice(0, 4).map((card, index) => {
            const kind = str(card.role, 'quote')
            return (
              <article key={index} className={cx('ud-bento-card', `ud-bento-card--${kind}`)}>
                {kind === 'stat' ? (
                  <>
                    <EditableText edit={edit} path={['items', index, 'value']} value={str(card.value)} as="div" className="ud-stat" placeholder="91%" />
                    <EditableText edit={edit} path={['items', index, 'label']} value={str(card.label)} as="p" className="ud-small" placeholder="Label" />
                  </>
                ) : kind === 'video' ? (
                  <div className="ud-bento-video">
                    <Media src={card.image} alt={str(card.title)} ratio="wide" edit={edit} path={['items', index, 'image']} />
                    <span className="ud-bento-play">
                      <Icon name="play" size={22} />
                    </span>
                    <EditableText edit={edit} path={['items', index, 'title']} value={str(card.title)} as="p" className="ud-small" placeholder="Watch" />
                  </div>
                ) : (
                  <>
                    <SafeText value={card.quote} className="ud-text" edit={edit} path={['items', index, 'quote']} placeholder="Quote" />
                    <div className="ud-bento-person">
                      <Avatar src={card.image} name={card.name} edit={edit} path={['items', index, 'image']} />
                      <div>
                        <EditableText edit={edit} path={['items', index, 'name']} value={str(card.name)} as="strong" placeholder="Name" />
                        <EditableText edit={edit} path={['items', index, 'roleLabel']} value={str(card.roleLabel)} as="p" className="ud-small" placeholder="Role" />
                      </div>
                    </div>
                  </>
                )}
              </article>
            )
          })}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ----------------------------------------------------------- pricing.duo */

const duoPlans = [
  {
    name: 'Launch',
    price: '$2,500',
    period: 'project',
    features: 'Homepage and inner pages\nBrand-aligned theme\nForms and CMS training\nTwo weeks of live support',
    buttonLabel: 'Get Started',
    buttonUrl: '/contact',
    tone: 'accent',
  },
  {
    name: 'Studio',
    price: '$3,500',
    period: 'project',
    features: 'Everything in Launch\nCampaign landing page\nMotion and art direction\nDedicated producer',
    buttonLabel: 'Get Started',
    buttonUrl: '/contact',
    tone: 'primary',
  },
]

export const pricingDuo = defineBlock({
  type: 'pricing.duo',
  version: 1,
  category: 'pricing',
  label: 'Color pricing pair',
  icon: 'CircleDollarSign',
  defaultProps: {
    heading: 'Pick the plan that fits your group',
    textAlign: 'center',
    animation: 'fade-up',
    plans: duoPlans,
  },
  schema: schema(
    ...headFields,
    repeater(
      'plans',
      'Plans',
      [
        text('name', 'Name'),
        text('price', 'Price'),
        text('period', 'Period'),
        field('features', 'textarea', 'Features', 'content'),
        text('buttonLabel', 'Button label'),
        link('buttonUrl', 'Button link'),
        field('tone', 'select', 'Color', 'design', {
          options: [
            { label: 'Accent', value: 'accent' },
            { label: 'Primary', value: 'primary' },
            { label: 'Dark', value: 'dark' },
          ],
        }),
      ],
      { itemLabel: 'Plan', itemDefaults: { name: 'Plan', price: '$0', tone: 'accent' } },
    ),
  ),
  component: (props) => {
    const edit = editOf(props)
    const plans = items(props.plans, duoPlans)
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} defaultHeading="Pricing" />
        <Body>
          <Grid cols={2} gap={24}>
            {plans.slice(0, 2).map((plan, index) => (
              <article key={index} className={cx('ud-duo-card', `ud-duo-card--${str(plan.tone, 'accent')}`)}>
                <EditableText edit={edit} path={['plans', index, 'name']} value={str(plan.name)} as="p" className="ud-small" placeholder="Plan" />
                <div className="ud-duo-price">
                  <EditableText edit={edit} path={['plans', index, 'price']} value={str(plan.price)} as="span" className="ud-stat" placeholder="$0" />
                  <EditableText edit={edit} path={['plans', index, 'period']} value={str(plan.period)} as="span" className="ud-small" placeholder="project" />
                </div>
                <CheckList values={lines(plan.features)} edit={edit} path={['plans', index, 'features']} />
                <div style={{ marginTop: 28 }}>
                  <Button href={str(plan.buttonUrl, '#')} variant={str(plan.tone) === 'primary' ? 'light' : 'secondary'}>
                    <EditableText
                      edit={edit}
                      path={['plans', index, 'buttonLabel']}
                      value={str(plan.buttonLabel, 'Get Started')}
                      placeholder="Button label"
                    />
                  </Button>
                </div>
              </article>
            ))}
          </Grid>
        </Body>
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------- cta.gradient */

export const ctaGradient = defineBlock({
  type: 'cta.gradient',
  version: 1,
  category: 'cta',
  label: 'Gradient CTA',
  icon: 'Sparkles',
  defaultProps: {
    heading: "Let's make something amazing together",
    buttonLabel: 'Contact Us',
    buttonUrl: '/contact',
    buttonVariant: 'secondary',
    mesh: true,
    textAlign: 'center',
    animation: 'fade-up',
    paddingTop: 32,
    paddingBottom: 32,
  },
  schema: schema(text('heading', 'Headline'), ...ctaFields, toggle('mesh', 'Soft glow behind the banner', 'design')),
  component: (props) => {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default">
        <div className={cx('ud-cta-gradient', bool(props.mesh, true) && 'ud-cta-gradient--glow')}>
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Headline" />
          <CtaGroup props={props} primaryVariant="secondary" />
        </div>
      </SectionShell>
    )
  },
  settings: null,
})
