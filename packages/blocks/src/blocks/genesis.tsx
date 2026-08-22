import type { CSSProperties, ReactNode } from 'react'
import { EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Avatar,
  Body,
  CtaGroup,
  Grid,
  Media,
  SafeText,
  SectionHead,
  SectionShell,
  Stars,
  items,
  num,
  str,
  type Props,
} from '../primitives'
import { ctaFields, field, headFields, icon, image, repeater, schema, text } from '../schema'
import { defineBlock } from '../types'

const RAILS = ['#D10A8A', '#2E08CF', '#F26A06'] as const

function railOf(item: Props, index: number): string {
  return str(item.accent) || RAILS[index % RAILS.length]
}

function RailCard({
  accent,
  children,
  className = '',
}: {
  accent: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`ud-rail ${className}`.trim()} style={{ '--ud-rail': accent } as CSSProperties}>
      {children}
    </div>
  )
}

const features = [
  {
    icon: 'cpu',
    title: 'Autonomous Agents',
    text: 'Agents that plan, execute & think step-by-step.',
    accent: '#D10A8A',
  },
  {
    icon: 'clock',
    title: 'Memory & Learning',
    text: 'Agents retain memory and improve over time.',
    accent: '#2E08CF',
  },
  {
    icon: 'rocket',
    title: 'Real-time Execution',
    text: 'Fast responses with async task processing.',
    accent: '#F26A06',
  },
]

const steps = [
  {
    title: 'Start with a prompt',
    text: 'Describe what you want your agent to do. The builder interprets the idea and drafts the structure in seconds.',
    image: '',
    number: '01',
  },
  {
    title: 'Adjust and personalize',
    text: 'Tune tasks, actions, and integrations. Add personality, rules, and data sources so it works the way you want.',
    image: '',
    number: '02',
  },
  {
    title: 'Launch & Automate',
    text: 'Deploy the agent and let it run. It executes tasks, reports results, and keeps working in the background.',
    image: '',
    number: '03',
  },
]

const quotes = [
  {
    text: 'We went from a blank prompt to a live research agent before lunch. The left-rail cards make the product feel as sharp as the agents.',
    name: 'Richard Nelson',
    role: 'Founder & CEO',
    avatar: '',
    rating: 5,
  },
  {
    text: 'Memory actually sticks. Our support agent remembers account context across sessions without us wiring a custom store.',
    name: 'Sophia Martinez',
    role: 'Founder & CEO',
    avatar: '',
    rating: 5,
  },
  {
    text: 'Launching was the boring part — in a good way. Prompt, personalize, automate. We reused the same blocks on the pricing page.',
    name: 'Ethan Roberts',
    role: 'Founder & CEO',
    avatar: '',
    rating: 5,
  },
  {
    text: 'The glow, type, and card sizes match what we showed investors. Editing copy in the builder did not break the layout.',
    name: 'Isabella Kim',
    role: 'Founder & CEO',
    avatar: '',
    rating: 5,
  },
  {
    text: 'Real-time execution is the reason we switched. Async jobs finish while the chat stays snappy.',
    name: 'Liam Johnson',
    role: 'Founder & CEO',
    avatar: '',
    rating: 5,
  },
  {
    text: 'Clean structure, Poppins, and those accent rails. Our marketing site finally looks like the product.',
    name: 'Ava Patel',
    role: 'Founder & CEO',
    avatar: '',
    rating: 5,
  },
]

/* -------------------------------------------------------------- hero.glow */

export const heroGlow = defineBlock({
  type: 'hero.glow',
  version: 1,
  category: 'hero',
  label: 'Glow hero',
  icon: 'Sparkles',
  defaultProps: {
    eyebrow: 'Create your own agents — Start now',
    heading: 'Build, Deploy & Talk to AI Agents in Seconds.',
    description:
      'Introducing a cloud platform that lets you build, deploy, and talk to AI agents in seconds.',
    buttonLabel: 'Start free trial',
    buttonUrl: '/pricing',
    secondaryLabel: 'Watch demo',
    secondaryUrl: '#demo',
    textAlign: 'center',
    paddingTop: 128,
    paddingBottom: 48,
    headingSize: 60,
    bodySize: 16,
    animation: 'fade-up',
  },
  schema: schema(
    text('eyebrow', 'Kicker'),
    text('heading', 'Headline'),
    field('description', 'textarea', 'Description', 'content'),
    ...ctaFields,
  ),
  component: (props) => {
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" align="center" className="ud-glow-hero">
        <div className="ud-glow-orbs" aria-hidden="true">
          <span className="ud-glow-orb ud-glow-orb--orange" />
          <span className="ud-glow-orb ud-glow-orb--pink" />
          <span className="ud-glow-orb ud-glow-orb--blue" />
        </div>
        <div className="ud-glow-copy">
          {str(props.eyebrow) || edit ? (
            <EditableText
              edit={edit}
              path={['eyebrow']}
              value={str(props.eyebrow)}
              as="p"
              className="ud-glow-kicker"
              placeholder="Kicker"
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
          <CtaGroup props={props} primaryVariant="light" secondaryVariant="outline" />
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------- features.rail */

export const featuresRail = defineBlock({
  type: 'features.rail',
  version: 1,
  category: 'features',
  label: 'Accent rail cards',
  icon: 'LayoutGrid',
  defaultProps: {
    heading: 'Agent features',
    description: 'Design AI assistants that research, plan, and execute tasks — all powered by your prompts.',
    textAlign: 'center',
    headingSize: 36,
    animation: 'fade-up',
    items: features,
  },
  schema: schema(
    ...headFields,
    repeater(
      'items',
      'Features',
      [
        text('title', 'Title'),
        field('text', 'textarea', 'Description', 'content'),
        icon('icon', 'Icon'),
        text('accent', 'Left rail color'),
      ],
      { itemLabel: 'Feature', itemDefaults: { title: 'New feature', text: 'Describe the benefit.', icon: 'sparkles', accent: '#F26A06' } },
    ),
  ),
  component: (props) => {
    const edit = editOf(props)
    const rows = items(props.items, features)
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} defaultHeading="Agent features" />
        <Body>
          <Grid cols={Math.min(rows.length, 3) || 3} gap={num(props.gap, 20)}>
            {rows.map((item, index) => (
              <RailCard key={index} accent={railOf(item, index)}>
                <span className="ud-rail__icon">
                  <Icon name={str(item.icon, 'sparkles')} size={22} />
                </span>
                <EditableText
                  edit={edit}
                  path={['items', index, 'title']}
                  value={str(item.title, 'Feature')}
                  as="h3"
                  className="ud-h4"
                  placeholder="Title"
                />
                <SafeText
                  value={item.text}
                  className="ud-text"
                  edit={edit}
                  path={['items', index, 'text']}
                  placeholder="Describe the benefit"
                />
              </RailCard>
            ))}
          </Grid>
        </Body>
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------- process.zigzag */

export const processZigzag = defineBlock({
  type: 'process.zigzag',
  version: 1,
  category: 'features',
  label: 'Zigzag process',
  icon: 'Layers',
  defaultProps: {
    heading: 'From idea to autonomous agent quickly and effortlessly.',
    description: 'Empower your business with AI agents that optimize processes and accelerate performance.',
    textAlign: 'center',
    headingSize: 36,
    animation: 'fade-up',
    items: steps,
  },
  schema: schema(
    ...headFields,
    repeater(
      'items',
      'Steps',
      [text('number', 'Number'), text('title', 'Title'), field('text', 'textarea', 'Description', 'content'), image('image', 'Image')],
      { itemLabel: 'Step', itemDefaults: { number: '01', title: 'New step', text: 'What happens here.' } },
    ),
  ),
  component: (props) => {
    const edit = editOf(props)
    const rows = items(props.items, steps)
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} defaultHeading="How it works" />
        <Body className="ud-zigzag">
          {rows.map((item, index) => {
            const flipped = index % 2 === 1
            return (
              <div key={index} className={`ud-zigzag__row${flipped ? ' ud-zigzag__row--flip' : ''}`}>
                <div className="ud-zigzag__media">
                  <Media
                    src={item.image}
                    alt={str(item.title)}
                    ratio="wide"
                    edit={edit}
                    path={['items', index, 'image']}
                  />
                </div>
                <div className="ud-zigzag__copy">
                  <EditableText
                    edit={edit}
                    path={['items', index, 'number']}
                    value={str(item.number, String(index + 1).padStart(2, '0'))}
                    as="p"
                    className="ud-zigzag__num"
                    placeholder="01"
                  />
                  <EditableText
                    edit={edit}
                    path={['items', index, 'title']}
                    value={str(item.title, 'Step')}
                    as="h3"
                    className="ud-h3"
                    placeholder="Title"
                  />
                  <SafeText
                    value={item.text}
                    className="ud-text"
                    edit={edit}
                    path={['items', index, 'text']}
                    placeholder="What happens in this step"
                  />
                </div>
              </div>
            )
          })}
        </Body>
      </SectionShell>
    )
  },
  settings: null,
})

/* ----------------------------------------------------- testimonials.rail */

export const testimonialsRail = defineBlock({
  type: 'testimonials.rail',
  version: 1,
  category: 'testimonials',
  label: 'Accent rail quotes',
  icon: 'Quote',
  defaultProps: {
    heading: 'Hear what our trusted users say about our best AI agents.',
    description: 'Empower your business with AI agents that optimize processes and accelerate performance.',
    textAlign: 'center',
    headingSize: 36,
    animation: 'fade-up',
    items: quotes,
  },
  schema: schema(
    ...headFields,
    repeater(
      'items',
      'Testimonials',
      [
        field('text', 'textarea', 'Quote', 'content'),
        text('name', 'Name'),
        text('role', 'Role'),
        image('avatar', 'Photo'),
        field('rating', 'slider', 'Rating', 'content', { min: 0, max: 5 }),
        text('accent', 'Left rail color'),
      ],
      { itemLabel: 'Quote', itemDefaults: { text: 'A great result.', name: 'Customer', role: 'Founder & CEO', rating: 5 } },
    ),
  ),
  component: (props) => {
    const edit = editOf(props)
    const rows = items(props.items, quotes)
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} defaultHeading="Testimonials" />
        <Body>
          <Grid cols={3} gap={num(props.gap, 20)}>
            {rows.map((item, index) => (
              <RailCard key={index} accent={railOf(item, index)} className="ud-rail--quote">
                <Stars count={num(item.rating, 5)} />
                <SafeText
                  value={item.text}
                  className="ud-text"
                  edit={edit}
                  path={['items', index, 'text']}
                  placeholder="Quote"
                />
                <div className="ud-rail__who">
                  <Avatar
                    src={item.avatar}
                    name={item.name}
                    edit={edit}
                    path={['items', index, 'avatar']}
                  />
                  <div>
                    <EditableText
                      edit={edit}
                      path={['items', index, 'name']}
                      value={str(item.name, 'Customer')}
                      as="p"
                      className="ud-rail__name"
                      placeholder="Name"
                    />
                    <EditableText
                      edit={edit}
                      path={['items', index, 'role']}
                      value={str(item.role, 'Founder & CEO')}
                      as="p"
                      className="ud-small"
                      placeholder="Role"
                    />
                  </div>
                </div>
              </RailCard>
            ))}
          </Grid>
        </Body>
      </SectionShell>
    )
  },
  settings: null,
})
