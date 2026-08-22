import { EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  CheckList,
  CtaGroup,
  Heading,
  IconBadge,
  Media,
  SafeText,
  SectionHead,
  SectionShell,
  bool,
  cx,
  isCentered,
  lines,
  num,
  str,
} from '../primitives'
import { ctaFields, field, headFields, icon, image, schema, select, slider, text, toggle } from '../schema'
import { defineBlock } from '../types'

/* ------------------------------------------------------------- cta.simple */

export const ctaSimple = defineBlock({
  type: 'cta.simple',
  version: 1,
  category: 'cta',
  label: 'Simple CTA',
  icon: 'Megaphone',
  defaultProps: {
    eyebrow: '',
    heading: 'Ready to see your site come together?',
    description: 'Start with a template or a blank page — you can change everything later.',
    buttonLabel: 'Start building',
    buttonUrl: '/signup',
    secondaryLabel: 'Talk to us',
    secondaryUrl: '/contact',
    textAlign: 'center',
    tone: 'surface',
    boxed: true,
  },
  schema: schema(
    ...headFields,
    ...ctaFields,
    toggle('boxed', 'Show as a card', 'design'),
    toggle('showIcon', 'Show icon', 'design'),
    icon('iconName', 'Icon'),
    field('note', 'text', 'Small note', 'content'),
  ),
  component: (props) => {
    const edit = editOf(props)
    const inner = (
      <div style={{ maxWidth: 720, marginInline: isCentered(props, 'center') ? 'auto' : undefined }}>
        {bool(props.showIcon, false) ? (
          <div style={{ display: 'flex', justifyContent: isCentered(props, 'center') ? 'center' : 'flex-start', marginBottom: 18 }}>
            <IconBadge name={str(props.iconName, 'rocket')} solid shape="round" size="lg" />
          </div>
        ) : null}
        <SectionHead props={props} defaultHeading="Ready to get started?" center={isCentered(props, 'center')} />
        <CtaGroup props={props} />
        {str(props.note) || edit ? (
          <EditableText edit={edit} path={['note']} value={str(props.note)} as="p" className="ud-small" style={{ marginTop: 16 }} placeholder="Small note" />
        ) : null}
      </div>
    )
    return (
      <SectionShell props={props} tone="surface" align="center">
        {bool(props.boxed, false) ? (
          <div
            style={{
              background: 'var(--ud-card)',
              borderRadius: 'var(--radius-card, 12px)',
              padding: 'clamp(28px, 4cqi, 56px)',
              border: '1px solid color-mix(in srgb, var(--ud-fg) 8%, transparent)',
            }}
          >
            {inner}
          </div>
        ) : (
          inner
        )}
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------------- cta.split */

export const ctaSplit = defineBlock({
  type: 'cta.split',
  version: 1,
  category: 'cta',
  label: 'Split CTA',
  icon: 'Split',
  defaultProps: {
    eyebrow: 'Start a project',
    heading: 'Tell us what you are building',
    description: 'A short brief is enough. We reply with next steps and a rough timeline.',
    buttonLabel: 'Send a brief',
    buttonUrl: '/contact',
    bullets: 'Reply within one business day\nFixed-price proposals\nNo obligation call',
    tone: 'dark',
    layout: 'copy-media',
  },
  schema: schema(
    ...headFields,
    ...ctaFields,
    field('bullets', 'textarea', 'Bullets (one per line)', 'content'),
    image('image', 'Image'),
    select('layout', 'Layout', [['copy-media', 'Copy + image'], ['copy-cta', 'Copy + buttons'], ['media-copy', 'Image + copy']], 'layout'),
  ),
  component: (props) => {
    const edit = editOf(props)
    const layout = str(props.layout, 'copy-cta')
    const copy = (
      <div>
        {str(props.eyebrow) || edit ? (
          <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-eyebrow" placeholder="Eyebrow" />
        ) : null}
        <Heading level={2} edit={edit} path={['heading']}>
          {str(props.heading, 'Let’s begin')}
        </Heading>
        <SafeText
          value={str(props.description) || str(props.subheading)}
          className="ud-lead"
          edit={edit}
          path={[str(props.description) || !str(props.subheading) ? 'description' : 'subheading']}
          placeholder="Supporting sentence"
        />
        {lines(props.bullets).length || edit ? (
          <div style={{ marginTop: 22 }}>
            <CheckList values={lines(props.bullets)} edit={edit} path={['bullets']} />
          </div>
        ) : null}
      </div>
    )

    if (layout === 'copy-cta' || !str(props.image)) {
      return (
        <SectionShell props={props} tone="dark">
          <div className="ud-row ud-row--stack ud-between" style={{ gap: 32 }}>
            <div style={{ maxWidth: 640 }}>{copy}</div>
            <CtaGroup props={props} secondaryVariant="outline" className="ud-btns" />
          </div>
        </SectionShell>
      )
    }

    return (
      <SectionShell props={props} tone="dark">
        <div className={cx('ud-split', layout === 'media-copy' && 'ud-split--reverse')}>
          <div>
            {copy}
            <CtaGroup props={props} secondaryVariant="outline" />
          </div>
          <div className="ud-split__media">
            <Media src={props.image} ratio="landscape" edit={editOf(props)} path={['image']} />
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------- cta.background */

export const ctaBackground = defineBlock({
  type: 'cta.background',
  version: 1,
  category: 'cta',
  label: 'Background CTA',
  icon: 'Spotlight',
  defaultProps: {
    eyebrow: 'Go live this week',
    heading: 'Your next website is one afternoon away',
    description: 'Publish to a free subdomain today and connect your own domain whenever you are ready.',
    buttonLabel: 'Publish my site',
    buttonUrl: '/signup',
    secondaryLabel: 'See pricing',
    secondaryUrl: '/pricing',
    textAlign: 'center',
    tone: 'primary',
    minHeight: 380,
    showPattern: true,
  },
  schema: schema(
    ...headFields,
    ...ctaFields,
    slider('minHeight', 'Minimum height', 200, 700, 'layout', { unit: 'px' }),
    toggle('showPattern', 'Decorative glow', 'design'),
    text('note', 'Small note'),
  ),
  component: (props) => {
    const edit = editOf(props)
    return (
      <SectionShell
        props={props}
        tone="primary"
        align="center"
        style={{ display: 'grid', alignContent: 'center', minHeight: num(props.minHeight, 380), overflow: 'hidden' }}
      >
        {bool(props.showPattern, true) ? (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: -1,
              background:
                'radial-gradient(60% 120% at 15% 0%, rgba(255,255,255,0.22), transparent 60%), radial-gradient(50% 100% at 100% 100%, rgba(255,255,255,0.16), transparent 60%)',
            }}
          />
        ) : null}
        <div style={{ maxWidth: 760, marginInline: isCentered(props, 'center') ? 'auto' : undefined }}>
          {str(props.eyebrow) || edit ? (
            <EditableText
              edit={edit}
              path={['eyebrow']}
              value={str(props.eyebrow)}
              as="p"
              className="ud-eyebrow"
              style={{ color: 'inherit', opacity: 0.85 }}
              placeholder="Eyebrow"
            />
          ) : null}
          <Heading level={2} edit={edit} path={['heading']}>
            {str(props.heading, 'Go live this week')}
          </Heading>
          <SafeText
            value={str(props.description) || str(props.subheading)}
            className="ud-lead"
            edit={edit}
            path={[str(props.description) || !str(props.subheading) ? 'description' : 'subheading']}
            placeholder="Supporting sentence"
          />
          <CtaGroup props={props} primaryVariant="light" secondaryVariant="outline" />
          {str(props.note) || edit ? (
            <p className="ud-small" style={{ marginTop: 16, display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <Icon name="check-circle" size={16} />
              <EditableText edit={edit} path={['note']} value={str(props.note)} placeholder="Small note" />
            </p>
          ) : null}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})
