import type { CSSProperties } from 'react'
import { useState } from 'react'
import { EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Avatar,
  Button,
  Grid,
  Media,
  SafeText,
  SectionShell,
  animationOf,
  arr,
  bool,
  cx,
  items,
  sectionVars,
  str,
  type Props,
} from '../primitives'
import {
  field,
  image,
  link,
  navLinksField,
  primaryCtaFields,
  repeater,
  schema,
  stickyField,
  text,
  toggle,
} from '../schema'
import { NavItem, Submenu, SubmenuCaret, hasSubmenu } from '../submenu'
import { defineBlock } from '../types'

function counselLinks(props: Props) {
  return arr(props.links)
    .map((item) => ({ label: str(item.label), url: str(item.url) || str(item.href) || '#' }))
    .filter((item) => item.label)
}

/* ---------------------------------------------------------- navbar.counsel */

export const navbarCounsel = defineBlock({
  type: 'navbar.counsel',
  version: 1,
  category: 'navigation',
  label: 'Counsel navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'H&W',
    logoNote: 'llp',
    logoUrl: '/',
    buttonLabel: 'Reserve a conversation',
    buttonUrl: '/contact',
    showButton: true,
    showBorder: true,
    sticky: true,
    links: [
      { label: 'The firm', url: '/about' },
      { label: 'Work', url: '/practices' },
      { label: 'Notes', url: '/insights' },
    ],
    animation: 'fade',
  },
  schema: schema(
    text('logo', 'Logo'),
    text('logoNote', 'Small mark'),
    link('logoUrl', 'Logo link'),
    navLinksField('links', 'Links'),
    text('buttonLabel', 'Button label'),
    link('buttonUrl', 'Button link'),
    toggle('showButton', 'Show button', 'content'),
    toggle('showBorder', 'Show border', 'design'),
    stickyField,
  ),
  component: (props) => {
    const edit = editOf(props)
    const [open, setOpen] = useState(false)
    const links = counselLinks(props)
    const anim = animationOf(props)
    return (
      <header
        className={cx('ud-counsel-nav', bool(props.sticky, true) && 'ud-is-sticky', anim.className)}
        style={{ ...sectionVars(props, 'default'), ...anim.style } as CSSProperties}
        data-ud-anim={anim.trigger}
      >
        <div className="ud-counsel-nav__bar">
          <a className="ud-counsel-logo" href={str(props.logoUrl, '/')}>
            <EditableText edit={edit} path={['logo']} value={str(props.logo, 'H&W')} as="span" placeholder="Logo" />
            {str(props.logoNote) || edit ? (
              <sup>
                <EditableText edit={edit} path={['logoNote']} value={str(props.logoNote)} placeholder="llp" />
              </sup>
            ) : null}
          </a>
          <div className="ud-counsel-nav__end">
            <nav className="ud-counsel-nav__links" aria-label="Primary">
              {links.map((item, index) => (
                <NavItem key={index} item={item}>
                  <a href={item.url}>
                    <EditableText edit={edit} path={['links', index, 'label']} value={item.label} placeholder="Link" />
                    <SubmenuCaret show={hasSubmenu(item)} />
                  </a>
                  <Submenu props={props} item={item} index={index} />
                </NavItem>
              ))}
            </nav>
            {bool(props.showButton, true) ? (
              <Button href={str(props.buttonUrl, '/contact')} variant="secondary" className="ud-counsel-dot-btn">
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
                <span className="ud-counsel-dot" aria-hidden="true" />
              </Button>
            ) : null}
          </div>
          <button type="button" className="ud-nav__toggle" aria-label="Menu" onClick={() => setOpen((value) => !value)}>
            <Icon name="menu" size={22} />
          </button>
        </div>
        {open ? (
          <div className="ud-counsel-nav__mobile">
            {links.map((item, index) => (
              <a key={index} href={item.url}>
                {item.label}
              </a>
            ))}
          </div>
        ) : null}
      </header>
    )
  },
  settings: null,
})

/* -------------------------------------------------------------- hero.panel */

export const heroPanel = defineBlock({
  type: 'hero.panel',
  version: 1,
  category: 'hero',
  label: 'Split panel hero',
  icon: 'Columns',
  defaultProps: {
    heading: 'Counsel that stays close to the work',
    description: 'A compact firm for operators who want answers in writing — not a theatre of process.',
    buttonLabel: 'Reserve a conversation',
    buttonUrl: '/contact',
    image: '',
    imageAlt: 'Partners in the studio',
    proofValue: '2.1K+',
    proofLabel: 'Clients who return when the next matter lands',
    avatars: [{ image: '' }, { image: '' }, { image: '' }, { image: '' }],
    paddingTop: 0,
    paddingBottom: 0,
    headingSize: 52,
    bodySize: 16,
    animation: 'fade-up',
  },
  schema: schema(
    text('heading', 'Headline'),
    field('description', 'textarea', 'Description', 'content'),
    ...primaryCtaFields,
    image('image', 'Portrait'),
    text('imageAlt', 'Image alt'),
    text('proofValue', 'Proof number'),
    text('proofLabel', 'Proof label'),
    repeater('avatars', 'Avatars', [image('image', 'Photo'), text('name', 'Name')], { itemLabel: 'Person' }),
  ),
  component: (props) => {
    const edit = editOf(props)
    const faces = items(props.avatars, [{ image: '' }])
    return (
      <SectionShell props={props} tone="default" bleed className="ud-panel-hero">
        <div className="ud-panel-hero__grid">
          <div className="ud-panel-hero__copy">
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
            <a className="ud-counsel-arrow-btn" href={str(props.buttonUrl, '/contact')}>
              <Icon name="arrow" size={16} />
              <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
            </a>
          </div>
          <div className="ud-panel-hero__media">
            <Media src={props.image} alt={str(props.imageAlt)} ratio="portrait" edit={edit} path={['image']} />
            <div className="ud-panel-proof">
              <div className="ud-panel-proof__faces">
                {faces.slice(0, 4).map((face, index) => (
                  <Avatar key={index} src={face.image} name={face.name || index} edit={edit} path={['avatars', index, 'image']} />
                ))}
              </div>
              <div>
                <EditableText
                  edit={edit}
                  path={['proofValue']}
                  value={str(props.proofValue)}
                  as="p"
                  className="ud-panel-proof__value"
                  placeholder="2.1K+"
                />
                <EditableText
                  edit={edit}
                  path={['proofLabel']}
                  value={str(props.proofLabel)}
                  as="p"
                  className="ud-panel-proof__label"
                  placeholder="Proof"
                />
              </div>
            </div>
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------- content.markers */

export const contentMarkers = defineBlock({
  type: 'content.markers',
  version: 1,
  category: 'content',
  label: 'Numbered markers',
  icon: 'Hash',
  defaultProps: {
    heading: 'Quiet rooms, written advice, and a partner who still reads the file.',
    contentWidth: 'wide',
    paddingTop: 88,
    paddingBottom: 88,
    headingSize: 44,
    animation: 'fade-up',
    image: '',
    items: [
      { number: '01', text: 'We take fewer matters so the same people stay on the file from intake to close.' },
      { number: '02', text: 'Advice arrives as a memo you can forward — options, risks, and a recommended next step.' },
      { number: '03', text: 'Fees are scoped before work starts. If the brief changes, the scope changes with it.' },
    ],
  },
  schema: schema(
    text('heading', 'Headline'),
    image('image', 'Clipped image'),
    repeater('items', 'Notes', [text('number', 'Marker'), field('text', 'textarea', 'Text', 'content')], {
      itemLabel: 'Note',
      itemDefaults: { number: '04', text: 'A short paragraph.' },
    }),
  ),
  component: (props) => {
    const edit = editOf(props)
    const notes = items(props.items, [])
    const first = notes[0]
    const rest = notes.slice(1)
    return (
      <SectionShell props={props} tone="default" className="ud-counsel-edit">
        <div className="ud-counsel-edit__grid">
          <EditableText
            edit={edit}
            path={['heading']}
            value={str(props.heading)}
            as="h2"
            className="ud-h2 ud-counsel-edit__h"
            placeholder="Headline"
          />
          {first ? (
            <div className="ud-counsel-edit__n1">
              <p className="ud-counsel-marker">
                {'{ '}
                <EditableText edit={edit} path={['items', 0, 'number']} value={str(first.number, '01')} as="span" placeholder="01" />
                {' }'}
              </p>
              <SafeText value={first.text} className="ud-text" edit={edit} path={['items', 0, 'text']} placeholder="Note" />
            </div>
          ) : null}
          <div className="ud-counsel-edit__stack">
            {rest.map((item, index) => (
              <div key={index}>
                <p className="ud-counsel-marker">
                  {'{ '}
                  <EditableText
                    edit={edit}
                    path={['items', index + 1, 'number']}
                    value={str(item.number, String(index + 2).padStart(2, '0'))}
                    as="span"
                    placeholder="02"
                  />
                  {' }'}
                </p>
                <SafeText
                  value={item.text}
                  className="ud-text"
                  edit={edit}
                  path={['items', index + 1, 'text']}
                  placeholder="Note"
                />
              </div>
            ))}
          </div>
          <div className="ud-counsel-edit__media">
            <Media src={props.image} alt="" ratio="portrait" edit={edit} path={['image']} />
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------- content.band */

export const contentBand = defineBlock({
  type: 'content.band',
  version: 1,
  category: 'content',
  label: 'Ruled grey band',
  icon: 'Layout',
  defaultProps: {
    label: 'Why this firm',
    heading: 'When the question is sharp, the answer should be too.',
    buttonLabel: 'Reserve a conversation',
    buttonUrl: '/contact',
    image: '',
    contentWidth: 'wide',
    backgroundType: 'color',
    backgroundColor: '#C1C3C0',
    paddingTop: 56,
    paddingBottom: 56,
    headingSize: 40,
    animation: 'fade-up',
    items: [
      { title: 'Same desk', text: 'One partner owns the matter. Associates support; they do not rotate the story.' },
      { title: 'Plain English', text: 'We write for the person who has to decide, not for a stack of internal memos.' },
      { title: 'Held through close', text: 'Calls are returned. Deadlines are named. You are not left guessing the calendar.' },
    ],
  },
  schema: schema(
    text('label', 'Section label'),
    text('heading', 'Headline'),
    ...primaryCtaFields,
    image('image', 'Wide photo'),
    repeater('items', 'Columns', [text('title', 'Title'), field('text', 'textarea', 'Text', 'content')], {
      itemLabel: 'Column',
    }),
  ),
  component: (props) => {
    const edit = editOf(props)
    const columns = items(props.items, [])
    return (
      <SectionShell props={props} tone="surface" className="ud-counsel-band">
        <div className="ud-counsel-rulehead">
          <EditableText
            edit={edit}
            path={['label']}
            value={str(props.label)}
            as="p"
            className="ud-counsel-label"
            placeholder="Label"
          />
        </div>
        <EditableText
          edit={edit}
          path={['heading']}
          value={str(props.heading)}
          as="h2"
          className="ud-h2"
          placeholder="Headline"
        />
        <a className="ud-counsel-arrow-btn ud-counsel-arrow-btn--dark" href={str(props.buttonUrl, '/contact')}>
          <Icon name="arrow" size={16} />
          <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel)} placeholder="Button" />
        </a>
        <Grid cols={3} gap={32} className="ud-counsel-band__cols">
          {columns.map((item, index) => (
            <div key={index}>
              <EditableText
                edit={edit}
                path={['items', index, 'title']}
                value={str(item.title)}
                as="h3"
                className="ud-h4"
                placeholder="Title"
              />
              <SafeText value={item.text} className="ud-text" edit={edit} path={['items', index, 'text']} placeholder="Text" />
            </div>
          ))}
        </Grid>
        {str(props.image) || edit ? (
          <div className="ud-counsel-band__photo">
            <Media src={props.image} alt="" ratio="ultrawide" edit={edit} path={['image']} />
          </div>
        ) : null}
      </SectionShell>
    )
  },
  settings: null,
})

/* ------------------------------------------------------------ content.ruled */

export const contentRuled = defineBlock({
  type: 'content.ruled',
  version: 1,
  category: 'content',
  label: 'Ruled section intro',
  icon: 'Minus',
  defaultProps: {
    label: 'How we work',
    heading: 'A short path from brief to decision.',
    contentWidth: 'wide',
    paddingTop: 72,
    paddingBottom: 96,
    headingSize: 40,
    animation: 'fade-up',
    items: [
      { title: 'Intake', text: 'A 30-minute call to name the decision, the deadline, and who else is in the room.' },
      { title: 'Scope', text: 'A one-page plan with fee, deliverable, and what sits outside the engagement.' },
      { title: 'Work', text: 'Drafts you can mark up. A live call only when the writing needs a conversation.' },
    ],
  },
  schema: schema(
    text('label', 'Section label'),
    text('heading', 'Headline'),
    repeater('items', 'Steps', [text('title', 'Title'), field('text', 'textarea', 'Text', 'content')], { itemLabel: 'Step' }),
  ),
  component: (props) => {
    const edit = editOf(props)
    const steps = items(props.items, [])
    return (
      <SectionShell props={props} tone="default">
        <div className="ud-counsel-rulehead">
          <EditableText
            edit={edit}
            path={['label']}
            value={str(props.label)}
            as="p"
            className="ud-counsel-label"
            placeholder="Label"
          />
        </div>
        <EditableText
          edit={edit}
          path={['heading']}
          value={str(props.heading)}
          as="h2"
          className="ud-h2"
          placeholder="Headline"
        />
        {steps.length ? (
          <Grid cols={3} gap={28} className="ud-counsel-steps">
            {steps.map((item, index) => (
              <div key={index}>
                <p className="ud-counsel-marker">{`{ ${String(index + 1).padStart(2, '0')} }`}</p>
                <EditableText
                  edit={edit}
                  path={['items', index, 'title']}
                  value={str(item.title)}
                  as="h3"
                  className="ud-h4"
                  placeholder="Title"
                />
                <SafeText value={item.text} className="ud-text" edit={edit} path={['items', index, 'text']} placeholder="Text" />
              </div>
            ))}
          </Grid>
        ) : null}
      </SectionShell>
    )
  },
  settings: null,
})
