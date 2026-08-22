import { EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Avatar,
  Body,
  Card,
  CtaGroup,
  Grid,
  IconBadge,
  Media,
  SafeText,
  SectionHead,
  SectionShell,
  bool,
  items,
  str,
} from '../primitives'
import { ctaFields, field, headFields, icon, image, link, repeater, schema, text, toggle } from '../schema'
import { defineBlock } from '../types'

const socialKeys = [
  { key: 'linkedin', icon: 'linkedin' },
  { key: 'twitter', icon: 'twitter' },
  { key: 'github', icon: 'github' },
  { key: 'mail', icon: 'mail' },
] as const

/* ------------------------------------------------------------ hero.product */

export const heroProduct = defineBlock({
  type: 'hero.product',
  version: 1,
  category: 'hero',
  label: 'Product hero',
  icon: 'Play',
  defaultProps: {
    eyebrow: 'A new way to provide customer service',
    heading: 'AI Chatbot for Customer Support.',
    description:
      'ChatDeck answers the repetitive tickets so your team can stay on the conversations that actually need a person.',
    buttonLabel: 'Try for Free',
    buttonUrl: '/pricing',
    buttonVariant: 'secondary',
    image: '',
    imageAlt: 'Product dashboard',
    videoUrl: '#demo',
    showPlay: true,
    textAlign: 'center',
    paddingTop: 88,
    paddingBottom: 48,
    headingSize: 56,
    bodySize: 18,
    animation: 'fade-up',
  },
  schema: schema(
    text('eyebrow', 'Kicker'),
    text('heading', 'Headline'),
    field('description', 'textarea', 'Description', 'content'),
    ...ctaFields,
    image('image', 'Product screenshot'),
    text('imageAlt', 'Image alt text'),
    link('videoUrl', 'Play button link'),
    toggle('showPlay', 'Show play overlay', 'design'),
  ),
  component: (props) => {
    const edit = editOf(props)
    const playHref = str(props.videoUrl, '#')
    return (
      <SectionShell props={props} tone="default" align="center">
        <div className="ud-product-hero">
          {str(props.eyebrow) || edit ? (
            <EditableText
              edit={edit}
              path={['eyebrow']}
              value={str(props.eyebrow)}
              as="p"
              className="ud-kicker"
              placeholder="A short kicker"
            />
          ) : null}
          <EditableText
            edit={edit}
            path={['heading']}
            value={str(props.heading)}
            as="h1"
            className="ud-h1"
            placeholder="Headline"
          />
          <SafeText
            value={props.description}
            className="ud-lead"
            edit={edit}
            path={['description']}
            placeholder="Supporting sentence"
          />
          <CtaGroup props={props} primaryVariant="secondary" />
        </div>
        <div className="ud-product-media">
          <Media
            src={props.image}
            alt={str(props.imageAlt, 'Product screenshot')}
            ratio="wide"
            edit={edit}
            path={['image']}
          />
          {bool(props.showPlay, true) && (playHref || edit) ? (
            <a className="ud-play" href={playHref || '#demo'} aria-label="Play video">
              <Icon name="play" size={22} />
            </a>
          ) : null}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------- features.minimal */

const defaultFeatures = [
  { icon: 'briefcase', title: 'Focus on Your Core Business', text: 'Let the bot take first replies so agents stay on work that needs judgment.' },
  { icon: 'clock', title: 'Always-on coverage', text: 'Customers get a useful answer at 2am without staffing a night shift.' },
  { icon: 'database', title: 'Trained on your content', text: 'Point ChatDeck at your help center, product docs, and past tickets.' },
  { icon: 'users', title: 'Smooth human handoff', text: 'When confidence drops, the thread lands in the right inbox with full context.' },
  { icon: 'chart', title: 'Insights from every chat', text: 'See which questions repeat, where people get stuck, and what to write next.' },
  { icon: 'lock', title: 'Secure by default', text: 'Role-based access, audit logs, and no training on other customers’ data.' },
]

export const featuresMinimal = defineBlock({
  type: 'features.minimal',
  version: 1,
  category: 'features',
  label: 'Minimal feature grid',
  icon: 'LayoutGrid',
  defaultProps: {
    heading: 'Why Choose ChatDeck?',
    description: 'A quieter support stack: fewer queues, faster answers, and a team that still feels human.',
    textAlign: 'center',
    animation: 'fade-up',
    items: defaultFeatures,
  },
  schema: schema(
    ...headFields,
    repeater(
      'items',
      'Features',
      [icon('icon', 'Icon'), text('title', 'Title'), field('text', 'textarea', 'Description', 'content')],
      { itemLabel: 'Feature', itemDefaults: { icon: 'sparkles', title: 'New feature', text: 'Describe the benefit.' } },
    ),
  ),
  component: (props) => {
    const edit = editOf(props)
    const rows = items(props.items, defaultFeatures)
    return (
      <SectionShell props={props} tone="default" align="center">
        <SectionHead props={props} defaultHeading="Why choose us?" />
        <Body>
          <Grid cols={3} gap={36}>
            {rows.map((item, index) => (
              <div key={index} className="ud-feature-min">
                <IconBadge name={str(item.icon, 'sparkles')} shape="plain" size="md" />
                <EditableText
                  edit={edit}
                  path={['items', index, 'title']}
                  value={str(item.title)}
                  as="h3"
                  className="ud-h4"
                  placeholder="Title"
                />
                <SafeText
                  value={item.text}
                  className="ud-text"
                  edit={edit}
                  path={['items', index, 'text']}
                  placeholder="Description"
                />
              </div>
            ))}
          </Grid>
        </Body>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------ team.circle */

const defaultTeam = [
  { name: 'Amelia Chen', role: 'Founder & CEO', image: '', linkedin: '#', twitter: '#', github: '#', mail: 'mailto:hello@example.com' },
  { name: 'Jonah Patel', role: 'Head of Product', image: '', linkedin: '#', twitter: '#', github: '#', mail: '#' },
  { name: 'Maya Ortiz', role: 'Customer Success', image: '', linkedin: '#', twitter: '#', github: '#', mail: '#' },
  { name: 'Chris Hale', role: 'Engineering', image: '', linkedin: '#', twitter: '#', github: '#', mail: '#' },
]

export const teamCircle = defineBlock({
  type: 'team.circle',
  version: 1,
  category: 'team',
  label: 'Circle team grid',
  icon: 'Users',
  defaultProps: {
    heading: 'Meet Our Amazing Team',
    description: 'The people who train the models, write the replies, and pick up when a customer needs a human.',
    textAlign: 'center',
    animation: 'fade-up',
    items: defaultTeam,
  },
  schema: schema(
    ...headFields,
    repeater(
      'items',
      'People',
      [
        text('name', 'Name'),
        text('role', 'Role'),
        image('image', 'Photo'),
        link('linkedin', 'LinkedIn'),
        link('twitter', 'Twitter / X'),
        link('github', 'GitHub'),
        link('mail', 'Email or profile'),
      ],
      { itemLabel: 'Person', itemDefaults: { name: 'New teammate', role: 'Role', linkedin: '#', twitter: '#', github: '#', mail: '#' } },
    ),
  ),
  component: (props) => {
    const edit = editOf(props)
    const rows = items(props.items, defaultTeam)
    return (
      <SectionShell props={props} tone="default" align="center">
        <SectionHead props={props} defaultHeading="Team" />
        <Body>
          <Grid cols={Math.min(Math.max(rows.length, 1), 4)} gap={32}>
            {rows.map((person, index) => (
              <div key={index} className="ud-team-circle">
                <div className="ud-team-circle__photo">
                  <Media
                    src={person.image}
                    alt={str(person.name)}
                    ratio="square"
                    edit={edit}
                    path={['items', index, 'image']}
                  />
                </div>
                <EditableText
                  edit={edit}
                  path={['items', index, 'name']}
                  value={str(person.name)}
                  as="h3"
                  className="ud-h4"
                  placeholder="Name"
                />
                <EditableText
                  edit={edit}
                  path={['items', index, 'role']}
                  value={str(person.role)}
                  as="p"
                  className="ud-small"
                  placeholder="Role"
                />
                <div className="ud-team-circle__social">
                  {socialKeys.map((social) => (
                    <a key={social.key} href={str(person[social.key], '#')} aria-label={social.key}>
                      <Icon name={social.icon} size={16} />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </Grid>
        </Body>
      </SectionShell>
    )
  },
  settings: null,
})

/* -------------------------------------------------- testimonials.compact */

const defaultQuotes = [
  { text: 'First-response time dropped from hours to under a minute. The queue finally looks manageable.', name: 'Lena Park', role: 'Support lead, Northwind', avatar: '' },
  { text: 'We trained it on our help center in an afternoon. Agents now jump in only when the bot is unsure.', name: 'Omar Hassan', role: 'Ops, Lumen', avatar: '' },
  { text: 'Customers still feel like they reached a person. The tone stays on-brand without a script.', name: 'Riley Gomez', role: 'Founder, Harbour', avatar: '' },
  { text: 'Handoff is the part we worried about. Threads arrive with the full chat — no recap needed.', name: 'Priya Shah', role: 'CX, Vertex', avatar: '' },
  { text: 'The insight report told us which docs were missing. We wrote three articles and tickets fell off.', name: 'Noah Ellis', role: 'Knowledge, Cobalt', avatar: '' },
  { text: 'Setup was boring in the best way. SSO, roles, and a test inbox before we went live.', name: 'Sofia Mendes', role: 'IT, Fieldstone', avatar: '' },
  { text: 'We run ChatDeck on three brands from one workspace. Each bot stays in its own voice.', name: 'Kenji Sato', role: 'Director, Cedar', avatar: '' },
  { text: 'After a month the bot handled most password and shipping questions without us touching them.', name: 'Ava Brooks', role: 'Retail, Meridian', avatar: '' },
]

export const testimonialsCompact = defineBlock({
  type: 'testimonials.compact',
  version: 1,
  category: 'testimonials',
  label: 'Compact quote grid',
  icon: 'Quote',
  defaultProps: {
    heading: 'What Our Customers Say',
    description: 'Teams that swapped a shared inbox for ChatDeck — and kept a human in the loop.',
    textAlign: 'center',
    animation: 'fade-up',
    items: defaultQuotes,
  },
  schema: schema(
    ...headFields,
    repeater(
      'items',
      'Quotes',
      [field('text', 'textarea', 'Quote', 'content'), text('name', 'Name'), text('role', 'Role / company'), image('avatar', 'Photo')],
      { itemLabel: 'Quote', itemDefaults: { text: 'A short review.', name: 'Customer', role: 'Company' } },
    ),
  ),
  component: (props) => {
    const edit = editOf(props)
    const rows = items(props.items, defaultQuotes)
    return (
      <SectionShell props={props} tone="default" align="center">
        <SectionHead props={props} defaultHeading="Testimonials" />
        <Body>
          <Grid cols={4} gap={16}>
            {rows.map((quote, index) => (
              <Card key={index} className="ud-quote-compact" hover>
                <div className="ud-quote-compact__who">
                  <Avatar src={quote.avatar} name={quote.name} edit={edit} path={['items', index, 'avatar']} />
                  <div>
                    <EditableText
                      edit={edit}
                      path={['items', index, 'name']}
                      value={str(quote.name)}
                      as="div"
                      className="ud-quote-compact__name"
                      placeholder="Name"
                    />
                    <EditableText
                      edit={edit}
                      path={['items', index, 'role']}
                      value={str(quote.role)}
                      as="div"
                      className="ud-small"
                      placeholder="Role"
                    />
                  </div>
                </div>
                <SafeText
                  value={quote.text}
                  className="ud-quote-compact__text"
                  edit={edit}
                  path={['items', index, 'text']}
                  placeholder="Quote"
                />
              </Card>
            ))}
          </Grid>
        </Body>
      </SectionShell>
    )
  },
  settings: null,
})
