import { EditableText, editOf } from '../editable'
import { PublicForm } from '../public-form'
import {
  CtaGroup,
  Media,
  SafeText,
  SectionShell,
  bool,
  cx,
  items,
  str,
  type Props,
  type Tone,
} from '../primitives'
import { ctaFields, descriptionField, eyebrowField, field, headingField, image, link, primaryCtaFields, repeater, schema, select, stickyField, text, textarea } from '../schema'
import { defineBlock } from '../types'
import { useSiteName } from '../site'

const surfaces: Array<[string, string]> = [
  ['paper', 'Paper'],
  ['ink', 'Ink'],
  ['mist', 'Mist'],
  ['chalk', 'Chalk'],
  ['ember', 'Ember'],
  ['tide', 'Tide'],
]

function surfaceTone(surface: string): Tone {
  if (surface === 'ink') return 'dark'
  if (surface === 'ember') return 'accent'
  if (surface === 'tide') return 'primary'
  if (surface === 'mist') return 'surface'
  return 'default'
}

function GenMark({ props, className }: { props: Props; className?: string }) {
  const edit = editOf(props)
  const siteName = useSiteName('')
  const logo = str(props.logo, str(props.brand, siteName))
  return (
    <a href={str(props.logoUrl, '/')} className={cx('ud-gen-mark', className)}>
      <span className="ud-gen-mark__dot" aria-hidden />
      <EditableText edit={edit} path={['logo']} value={logo} placeholder="Brand" />
    </a>
  )
}

function GenLinks({ props }: { props: Props }) {
  const edit = editOf(props)
  const links = items(props.links, [])
  return (
    <nav className="ud-gen-links" aria-label="Primary">
      {links.map((item, index) => (
        <a key={`${str(item.url, '/')}-${index}`} href={str(item.url, '/')} className="ud-gen-links__item">
          <EditableText edit={edit} path={['links', index, 'label']} value={str(item.label)} placeholder="Link" />
        </a>
      ))}
    </nav>
  )
}

function GenHeroCopy({ props, level = 1 }: { props: Props; level?: 1 | 2 }) {
  const edit = editOf(props)
  const eyebrow = str(props.eyebrow)
  return (
    <div className="ud-gen-copy">
      {eyebrow || edit ? (
        <EditableText edit={edit} path={['eyebrow']} value={eyebrow} as="p" className="ud-gen-kicker" placeholder="Kicker" />
      ) : null}
      <EditableText
        edit={edit}
        path={['heading']}
        value={str(props.heading)}
        as={level === 1 ? 'h1' : 'h2'}
        className={level === 1 ? 'ud-h1' : 'ud-h2'}
        placeholder="Headline"
      />
      <SafeText
        value={str(props.description)}
        className="ud-lead"
        edit={edit}
        path={['description']}
        placeholder="Supporting line"
      />
      <CtaGroup props={props} />
    </div>
  )
}

const linkRepeater = repeater(
  'links',
  'Menu links',
  [text('label', 'Label'), link('url', 'Link'), repeater('children', 'Dropdown items', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Item' })],
  { itemLabel: 'Link', itemDefaults: { label: 'Page', url: '/' } },
)

const itemRepeater = repeater(
  'items',
  'Items',
  [text('title', 'Title'), textarea('body', 'Body'), text('meta', 'Meta')],
  { itemLabel: 'Item', itemDefaults: { title: 'Item', body: 'A short original line.', meta: '01' } },
)

const questionRepeater = repeater(
  'items',
  'Questions',
  [text('question', 'Question'), textarea('answer', 'Answer')],
  { itemLabel: 'Question', itemDefaults: { question: 'Question', answer: 'A useful, specific answer.' } },
)

const metricRepeater = repeater(
  'items',
  'Metrics',
  [text('value', 'Value'), text('label', 'Label'), textarea('note', 'Context')],
  { itemLabel: 'Metric', itemDefaults: { value: '24/7', label: 'Availability', note: 'Context for this proof point.' } },
)

const planRepeater = repeater(
  'items',
  'Plans',
  [text('name', 'Plan name'), text('price', 'Price'), textarea('description', 'Description'), textarea('features', 'Features')],
  { itemLabel: 'Plan', itemDefaults: { name: 'Plan', price: 'Custom', description: 'Who this plan is for.', features: 'Feature one\nFeature two\nFeature three' } },
)

const compositionRepeater = repeater(
  'items',
  'Content regions',
  [text('label', 'Label'), text('title', 'Title'), textarea('text', 'Body'), text('linkLabel', 'Link label'), link('linkUrl', 'Link')],
  { itemLabel: 'Region', itemDefaults: { label: '01', title: 'Region title', text: 'Write the supporting content here.', linkLabel: '', linkUrl: '/' } },
)

const genLookFields = [
  select('surface', 'Surface', [...surfaces], 'content'),
  select('density', 'Density', [['airy', 'Airy'], ['regular', 'Regular'], ['tight', 'Tight']], 'content'),
  field('wash', 'color', 'Wash color', 'design'),
]

export const generatedNav = defineBlock({
  type: 'generated.nav',
  version: 1,
  category: 'navigation',
  label: 'Original navbar',
  icon: 'sparkles',
  defaultProps: {
    logo: 'Studio',
    logoUrl: '/',
    layout: 'wordmark',
    surface: 'paper',
    density: 'regular',
    buttonLabel: 'Start a project',
    buttonUrl: '/contact',
    links: [
      { label: 'Work', url: '/work' },
      { label: 'About', url: '/about' },
      { label: 'Notes', url: '/notes' },
    ],
    sticky: false,
  },
  schema: schema(
    text('logo', 'Brand'),
    link('logoUrl', 'Brand link'),
    linkRepeater,
    ...ctaFields,
    select('layout', 'Layout', [
      ['wordmark', 'Wordmark + rail'],
      ['split', 'Split bar'],
      ['stack', 'Stacked brand'],
    ], 'content'),
    stickyField,
    ...genLookFields,
  ),
  component: function GeneratedNav(props) {
    const layout = str(props.layout, 'wordmark')
    const surface = str(props.surface, 'paper')
    return (
      <SectionShell
        props={props}
        tone={surfaceTone(surface)}
        className={cx('ud-gen', 'ud-gen-nav', bool(props.sticky) && 'ud-is-sticky', `ud-gen-nav--${layout}`, `ud-gen--${surface}`)}
        style={str(props.wash) ? { ['--ud-gen-wash' as string]: str(props.wash) } : undefined}
      >
        <div className="ud-gen-nav__bar">
          <GenMark props={props} />
          {layout !== 'stack' ? (
            <div className="ud-gen-nav__end">
              <GenLinks props={props} />
              <CtaGroup props={props} className="ud-gen-nav__cta" />
            </div>
          ) : (
            <CtaGroup props={props} className="ud-gen-nav__cta" />
          )}
        </div>
        {layout === 'stack' ? <GenLinks props={props} /> : null}
      </SectionShell>
    )
  },
})

export const generatedHero = defineBlock({
  type: 'generated.hero',
  version: 1,
  category: 'hero',
  label: 'Original hero',
  icon: 'sparkles',
  defaultProps: {
    eyebrow: 'Independent practice',
    heading: 'Websites with a point of view',
    description: 'Design, build, and host — written as original work, not a kit.',
    buttonLabel: 'See the work',
    buttonUrl: '/work',
    secondaryLabel: 'Write to us',
    secondaryUrl: '/contact',
    layout: 'mast',
    surface: 'ink',
    density: 'airy',
    image: '',
    imageAlt: '',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    ...ctaFields,
    image('image', 'Image'),
    text('imageAlt', 'Image alt'),
    select('layout', 'Layout', [
      ['mast', 'Mast'],
      ['cut', 'Diagonal cut'],
      ['overlay', 'Overlay card'],
      ['folio', 'Folio'],
      ['slab', 'Media slab'],
    ], 'content'),
    ...genLookFields,
  ),
  component: function GeneratedHero(props) {
    const layout = str(props.layout, 'mast')
    const surface = str(props.surface, 'ink')
    const media = str(props.image)
    return (
      <SectionShell
        props={props}
        tone={surfaceTone(surface)}
        bleed={layout === 'cut' || layout === 'slab'}
        className={cx('ud-gen', 'ud-gen-hero', `ud-gen-hero--${layout}`, `ud-gen--${surface}`, `ud-gen-density--${str(props.density, 'airy')}`)}
        style={str(props.wash) ? { ['--ud-gen-wash' as string]: str(props.wash) } : undefined}
      >
        {layout === 'cut' ? (
          <div className="ud-gen-hero__cut">
            <div className="ud-container">
              <GenHeroCopy props={props} />
            </div>
            <div className="ud-gen-hero__blade" aria-hidden />
          </div>
        ) : layout === 'overlay' ? (
          <div className="ud-gen-hero__stage">
            {media ? <Media src={media} alt={str(props.imageAlt)} ratio="wide" className="ud-gen-hero__stage-media" /> : <div className="ud-gen-hero__stage-media ud-gen-hero__fill" />}
            <div className="ud-gen-hero__card">
              <GenHeroCopy props={props} />
            </div>
          </div>
        ) : layout === 'slab' ? (
          <div className="ud-gen-hero__slab">
            {media ? <Media src={media} alt={str(props.imageAlt)} ratio="ultrawide" /> : <div className="ud-gen-hero__fill ud-gen-hero__slab-fill" />}
            <div className="ud-container ud-gen-hero__slab-copy">
              <GenHeroCopy props={props} />
            </div>
          </div>
        ) : layout === 'folio' ? (
          <div className="ud-gen-hero__folio">
            <p className="ud-gen-hero__index">Vol. 01</p>
            <GenHeroCopy props={props} />
            {media ? <Media src={media} alt={str(props.imageAlt)} ratio="portrait" /> : null}
          </div>
        ) : (
          <GenHeroCopy props={props} />
        )}
      </SectionShell>
    )
  },
})

export const generatedCollection = defineBlock({
  type: 'generated.collection',
  version: 1,
  category: 'features',
  label: 'Original collection',
  icon: 'sparkles',
  defaultProps: {
    eyebrow: 'What we make',
    heading: 'Services, named plainly',
    description: 'Each card is a real offer, not a generic feature tile.',
    layout: 'mosaic',
    surface: 'paper',
    density: 'regular',
    items: [
      { title: 'Web design', body: 'Layouts that hold a brand without a template look.', meta: '01' },
      { title: 'Development', body: 'Front-end and CMS work you can actually edit.', meta: '02' },
      { title: 'Hosting', body: 'Quiet infrastructure, mail included when you need it.', meta: '03' },
    ],
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    itemRepeater,
    select('layout', 'Layout', [
      ['mosaic', 'Mosaic'],
      ['rail', 'Horizontal rail'],
      ['index', 'Numbered index'],
      ['pills', 'Pill list'],
    ], 'content'),
    ...genLookFields,
  ),
  component: function GeneratedCollection(props) {
    const edit = editOf(props)
    const layout = str(props.layout, 'mosaic')
    const surface = str(props.surface, 'paper')
    const list = items(props.items, [])
    return (
      <SectionShell
        props={props}
        tone={surfaceTone(surface)}
        className={cx('ud-gen', 'ud-gen-collect', `ud-gen-collect--${layout}`, `ud-gen--${surface}`)}
        style={str(props.wash) ? { ['--ud-gen-wash' as string]: str(props.wash) } : undefined}
      >
        <div className="ud-gen-copy ud-gen-copy--intro">
          {str(props.eyebrow) || edit ? (
            <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-gen-kicker" placeholder="Kicker" />
          ) : null}
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
          <SafeText value={str(props.description)} className="ud-lead" edit={edit} path={['description']} placeholder="Lead" />
        </div>
        <div className={cx('ud-gen-collect__list', `ud-gen-collect__list--${layout}`)}>
          {list.map((item, index) => (
            <article key={index} className="ud-gen-collect__item">
              <span className="ud-gen-collect__meta">
                <EditableText edit={edit} path={['items', index, 'meta']} value={str(item.meta, String(index + 1).padStart(2, '0'))} placeholder="01" />
              </span>
              <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="h3" className="ud-h3" placeholder="Title" />
              <SafeText value={str(item.body)} className="ud-text" edit={edit} path={['items', index, 'body']} placeholder="Body" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

export const generatedStory = defineBlock({
  type: 'generated.story',
  version: 1,
  category: 'content',
  label: 'Original story',
  icon: 'sparkles',
  defaultProps: {
    eyebrow: 'About',
    heading: 'Built in Dubai, for work that has to last',
    description: 'A short studio note — specific, not stock.',
    layout: 'letter',
    surface: 'chalk',
    density: 'airy',
    image: '',
    imageAlt: '',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    image('image', 'Image'),
    text('imageAlt', 'Image alt'),
    select('layout', 'Layout', [
      ['letter', 'Letter'],
      ['offset', 'Offset photo'],
      ['manifesto', 'Manifesto'],
    ], 'content'),
    ...genLookFields,
  ),
  component: function GeneratedStory(props) {
    const edit = editOf(props)
    const layout = str(props.layout, 'letter')
    const surface = str(props.surface, 'chalk')
    const media = str(props.image)
    return (
      <SectionShell
        props={props}
        tone={surfaceTone(surface)}
        className={cx('ud-gen', 'ud-gen-story', `ud-gen-story--${layout}`, `ud-gen--${surface}`)}
        style={str(props.wash) ? { ['--ud-gen-wash' as string]: str(props.wash) } : undefined}
      >
        <div className="ud-gen-story__grid">
          <div>
            {str(props.eyebrow) || edit ? (
              <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-gen-kicker" placeholder="Kicker" />
            ) : null}
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
            <SafeText value={str(props.description)} className="ud-lead" edit={edit} path={['description']} placeholder="Story" />
          </div>
          {media ? <Media src={media} alt={str(props.imageAlt)} ratio={layout === 'manifesto' ? 'wide' : 'portrait'} /> : <div className="ud-gen-hero__fill" />}
        </div>
      </SectionShell>
    )
  },
})

/**
 * A safe, data-driven canvas for layouts invented by the AI. The model owns
 * the composition and copy, while the renderer owns markup and safety. Every
 * visible region is still exposed through the normal visual-editor bindings.
 */
export const generatedComposition = defineBlock({
  type: 'generated.composition',
  version: 1,
  category: 'content',
  label: 'AI original composition',
  icon: 'sparkles',
  defaultProps: {
    // Named so an AI-authored section reads as itself in the section list
    // rather than as the generic block label.
    blockName: 'Editorial composition',
    eyebrow: 'A closer look',
    heading: 'A section composed for this page',
    description: 'Use flexible regions to shape information around the story this page needs to tell.',
    layout: 'asymmetric',
    visual: 'rings',
    surface: 'paper',
    density: 'airy',
    items: [
      { label: '01', title: 'First idea', text: 'A focused explanation with enough detail to be useful.', linkLabel: '', linkUrl: '/' },
      { label: '02', title: 'Second idea', text: 'A complementary point that moves the story forward.', linkLabel: '', linkUrl: '/' },
      { label: '03', title: 'Third idea', text: 'A practical conclusion or next step for the visitor.', linkLabel: '', linkUrl: '/' },
    ],
  },
  schema: schema(
    text('blockName', 'Block name'),
    eyebrowField,
    headingField,
    descriptionField,
    compositionRepeater,
    select('layout', 'Composition', [
      ['asymmetric', 'Asymmetric feature'],
      ['bento', 'Bento canvas'],
      ['editorial', 'Editorial ledger'],
      ['split', 'Split narrative'],
      ['marquee', 'Horizontal marquee'],
    ], 'content'),
    select('visual', 'Generated visual', [
      ['rings', 'Orbital rings'],
      ['grid', 'Perspective grid'],
      ['beam', 'Light beam'],
      ['type', 'Typographic mark'],
      ['none', 'None'],
    ], 'content'),
    ...genLookFields,
  ),
  component: function GeneratedComposition(props) {
    const edit = editOf(props)
    const layout = str(props.layout, 'asymmetric')
    const visual = str(props.visual, 'rings')
    const surface = str(props.surface, 'paper')
    const list = items(props.items, [])
    return (
      <SectionShell
        props={props}
        tone={surfaceTone(surface)}
        className={cx('ud-gen', 'ud-gen-composition', `ud-gen-composition--${layout}`, `ud-gen-composition-visual--${visual}`, `ud-gen--${surface}`)}
        style={str(props.wash) ? { ['--ud-gen-wash' as string]: str(props.wash) } : undefined}
      >
        <div className="ud-gen-composition__head">
          <div className="ud-gen-copy">
            {str(props.eyebrow) || edit ? <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-gen-kicker" placeholder="Kicker" /> : null}
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
            <SafeText value={str(props.description)} className="ud-lead" edit={edit} path={['description']} placeholder="Introduction" />
          </div>
          {visual !== 'none' ? <div className="ud-gen-composition__visual" aria-hidden><span /><span /><span /></div> : null}
        </div>
        <div className="ud-gen-composition__regions">
          {list.map((item, index) => (
            <article className="ud-gen-composition__region" key={index}>
              <EditableText edit={edit} path={['items', index, 'label']} value={str(item.label, String(index + 1).padStart(2, '0'))} as="span" className="ud-gen-composition__label" placeholder="Label" />
              <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} as="h3" className="ud-h3" placeholder="Title" />
              <SafeText value={str(item.text)} className="ud-text" edit={edit} path={['items', index, 'text']} placeholder="Body" />
              {str(item.linkLabel) || edit ? (
                <a href={str(item.linkUrl, '/')} className="ud-gen-composition__link">
                  <EditableText edit={edit} path={['items', index, 'linkLabel']} value={str(item.linkLabel)} placeholder="Link label" />
                  <span aria-hidden> ↗</span>
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

export const generatedFaq = defineBlock({
  type: 'generated.faq',
  version: 1,
  category: 'faq',
  label: 'Original FAQ',
  icon: 'sparkles',
  defaultProps: {
    eyebrow: 'Good to know',
    heading: 'Questions, answered clearly',
    description: 'Practical details for deciding what happens next.',
    layout: 'ledger',
    surface: 'paper',
    density: 'regular',
    items: [
      { question: 'How does the process begin?', answer: 'Start with a short conversation so the next step fits the actual request.' },
      { question: 'What should I prepare?', answer: 'Bring the goal, timing, and anything that helps explain the outcome you need.' },
      { question: 'When will I hear back?', answer: 'You will receive a clear response with the recommended next step.' },
    ],
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    questionRepeater,
    select('layout', 'Layout', [['ledger', 'Editorial ledger'], ['split', 'Split questions'], ['cards', 'Question cards']], 'content'),
    ...genLookFields,
  ),
  component: function GeneratedFaq(props) {
    const edit = editOf(props)
    const layout = str(props.layout, 'ledger')
    const surface = str(props.surface, 'paper')
    const list = items(props.items, [])
    return (
      <SectionShell props={props} tone={surfaceTone(surface)} className={cx('ud-gen', 'ud-gen-faq', `ud-gen-faq--${layout}`, `ud-gen--${surface}`)}>
        <div className="ud-gen-copy ud-gen-copy--intro">
          {str(props.eyebrow) || edit ? <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-gen-kicker" placeholder="Kicker" /> : null}
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
          <SafeText value={str(props.description)} className="ud-lead" edit={edit} path={['description']} placeholder="Introduction" />
        </div>
        <div className="ud-gen-faq__list">
          {list.map((item, index) => (
            <article className="ud-gen-faq__item" key={index}>
              <span className="ud-gen-faq__index">{String(index + 1).padStart(2, '0')}</span>
              <EditableText edit={edit} path={['items', index, 'question']} value={str(item.question)} as="h3" className="ud-h3" placeholder="Question" />
              <SafeText value={str(item.answer)} className="ud-text" edit={edit} path={['items', index, 'answer']} placeholder="Answer" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

export const generatedMetrics = defineBlock({
  type: 'generated.metrics',
  version: 1,
  category: 'features',
  label: 'Original metrics',
  icon: 'sparkles',
  defaultProps: {
    eyebrow: 'At a glance',
    heading: 'The details that matter',
    description: 'A concise view of the facts people need before they choose.',
    layout: 'signal',
    surface: 'mist',
    density: 'regular',
    items: [
      { value: '01', label: 'Clear starting point', note: 'One focused first step.' },
      { value: '02', label: 'Visible progress', note: 'Updates without guesswork.' },
      { value: '03', label: 'Practical handoff', note: 'Everything ready to use.' },
    ],
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    metricRepeater,
    select('layout', 'Layout', [['signal', 'Signal strip'], ['poster', 'Metric posters'], ['orbit', 'Orbit grid']], 'content'),
    ...genLookFields,
  ),
  component: function GeneratedMetrics(props) {
    const edit = editOf(props)
    const layout = str(props.layout, 'signal')
    const surface = str(props.surface, 'mist')
    const list = items(props.items, [])
    return (
      <SectionShell props={props} tone={surfaceTone(surface)} className={cx('ud-gen', 'ud-gen-metrics', `ud-gen-metrics--${layout}`, `ud-gen--${surface}`)}>
        <div className="ud-gen-copy ud-gen-copy--intro">
          {str(props.eyebrow) || edit ? <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-gen-kicker" placeholder="Kicker" /> : null}
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
          <SafeText value={str(props.description)} className="ud-lead" edit={edit} path={['description']} placeholder="Introduction" />
        </div>
        <div className="ud-gen-metrics__list">
          {list.map((item, index) => (
            <article className="ud-gen-metrics__item" key={index}>
              <EditableText edit={edit} path={['items', index, 'value']} value={str(item.value)} as="strong" className="ud-gen-metrics__value" placeholder="Value" />
              <EditableText edit={edit} path={['items', index, 'label']} value={str(item.label)} as="h3" className="ud-h4" placeholder="Label" />
              <SafeText value={str(item.note)} className="ud-text" edit={edit} path={['items', index, 'note']} placeholder="Context" />
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

export const generatedPricing = defineBlock({
  type: 'generated.pricing',
  version: 1,
  category: 'pricing',
  label: 'Original pricing',
  icon: 'sparkles',
  defaultProps: {
    eyebrow: 'Ways to begin',
    heading: 'Choose the right level of support',
    description: 'Straightforward options with enough detail to compare confidently.',
    buttonLabel: 'Choose this option',
    buttonUrl: '/contact',
    layout: 'sheets',
    surface: 'chalk',
    density: 'regular',
    items: [
      { name: 'Essential', price: 'Custom', description: 'A focused starting point.', features: 'Discovery\nCore delivery\nPractical handoff' },
      { name: 'Complete', price: 'Custom', description: 'The full experience from first step to launch.', features: 'Strategy\nComplete delivery\nPriority support' },
    ],
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    ...primaryCtaFields,
    planRepeater,
    select('layout', 'Layout', [['sheets', 'Layered sheets'], ['editorial', 'Editorial plans'], ['compact', 'Compact comparison']], 'content'),
    ...genLookFields,
  ),
  component: function GeneratedPricing(props) {
    const edit = editOf(props)
    const layout = str(props.layout, 'sheets')
    const surface = str(props.surface, 'chalk')
    const list = items(props.items, [])
    return (
      <SectionShell props={props} tone={surfaceTone(surface)} className={cx('ud-gen', 'ud-gen-pricing', `ud-gen-pricing--${layout}`, `ud-gen--${surface}`)}>
        <div className="ud-gen-copy ud-gen-copy--intro">
          {str(props.eyebrow) || edit ? <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-gen-kicker" placeholder="Kicker" /> : null}
          <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
          <SafeText value={str(props.description)} className="ud-lead" edit={edit} path={['description']} placeholder="Introduction" />
        </div>
        <div className="ud-gen-pricing__list">
          {list.map((item, index) => (
            <article className="ud-gen-pricing__item" key={index}>
              <EditableText edit={edit} path={['items', index, 'name']} value={str(item.name)} as="h3" className="ud-h3" placeholder="Plan name" />
              <EditableText edit={edit} path={['items', index, 'price']} value={str(item.price)} as="strong" className="ud-gen-pricing__price" placeholder="Price" />
              <SafeText value={str(item.description)} className="ud-text" edit={edit} path={['items', index, 'description']} placeholder="Description" />
              <SafeText value={str(item.features)} className="ud-gen-pricing__features" edit={edit} path={['items', index, 'features']} placeholder="Features" />
              <a className="ud-button ud-button--primary" href={str(props.buttonUrl, '/contact')}>
                <EditableText edit={edit} path={['buttonLabel']} value={str(props.buttonLabel, 'Choose this option')} placeholder="Button" />
              </a>
            </article>
          ))}
        </div>
      </SectionShell>
    )
  },
})

export const generatedVoices = defineBlock({
  type: 'generated.voices',
  version: 1,
  category: 'testimonials',
  label: 'Original voices',
  icon: 'sparkles',
  defaultProps: {
    heading: 'People we have built with',
    layout: 'pull',
    surface: 'mist',
    items: [
      { title: 'Aisha K.', body: 'The site finally sounds like the studio, not a theme.', meta: 'Founder, Atelier' },
      { title: 'Omar R.', body: 'Hosting and mail just worked. We stopped thinking about it.', meta: 'Operator' },
    ],
  },
  schema: schema(
    headingField,
    itemRepeater,
    select('layout', 'Layout', [['pull', 'Pull quote'], ['stagger', 'Staggered'], ['strip', 'Film strip']], 'content'),
    ...genLookFields,
  ),
  component: function GeneratedVoices(props) {
    const edit = editOf(props)
    const layout = str(props.layout, 'pull')
    const surface = str(props.surface, 'mist')
    const list = items(props.items, [])
    return (
      <SectionShell
        props={props}
        tone={surfaceTone(surface)}
        className={cx('ud-gen', 'ud-gen-voices', `ud-gen-voices--${layout}`, `ud-gen--${surface}`)}
      >
        <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
        <div className={cx('ud-gen-voices__list', `ud-gen-voices__list--${layout}`)}>
          {list.map((item, index) => (
            <blockquote key={index} className="ud-gen-voices__item">
              <SafeText value={str(item.body)} className="ud-gen-voices__quote" edit={edit} path={['items', index, 'body']} placeholder="Quote" />
              <footer>
                <EditableText edit={edit} path={['items', index, 'title']} value={str(item.title)} placeholder="Name" />
                {str(item.meta) || edit ? (
                  <span>
                    {' · '}
                    <EditableText edit={edit} path={['items', index, 'meta']} value={str(item.meta)} placeholder="Role" />
                  </span>
                ) : null}
              </footer>
            </blockquote>
          ))}
        </div>
      </SectionShell>
    )
  },
})

export const generatedCta = defineBlock({
  type: 'generated.cta',
  version: 1,
  category: 'cta',
  label: 'Original CTA',
  icon: 'sparkles',
  defaultProps: {
    heading: 'Tell us what you are building',
    description: 'A short note is enough. We reply with a plan, not a pitch deck.',
    buttonLabel: 'Write to the studio',
    buttonUrl: '/contact',
    layout: 'ticket',
    surface: 'ember',
  },
  schema: schema(
    headingField,
    descriptionField,
    ...ctaFields,
    select('layout', 'Layout', [['ticket', 'Ticket'], ['bleed', 'Full bleed'], ['quiet', 'Quiet line']], 'content'),
    ...genLookFields,
  ),
  component: function GeneratedCta(props) {
    const layout = str(props.layout, 'ticket')
    const surface = str(props.surface, 'ember')
    return (
      <SectionShell
        props={props}
        tone={surfaceTone(surface)}
        className={cx('ud-gen', 'ud-gen-cta', `ud-gen-cta--${layout}`, `ud-gen--${surface}`)}
      >
        <div className="ud-gen-cta__inner">
          <GenHeroCopy props={props} level={2} />
        </div>
      </SectionShell>
    )
  },
})

export const generatedFooter = defineBlock({
  type: 'generated.footer',
  version: 1,
  category: 'footer',
  label: 'Original footer',
  icon: 'sparkles',
  defaultProps: {
    logo: 'Studio',
    layout: 'colophon',
    surface: 'ink',
    copyright: '© Studio. All rights reserved.',
    links: [
      { label: 'Work', url: '/work' },
      { label: 'About', url: '/about' },
      { label: 'Contact', url: '/contact' },
    ],
  },
  schema: schema(
    text('logo', 'Brand'),
    textarea('copyright', 'Copyright'),
    linkRepeater,
    select('layout', 'Layout', [['colophon', 'Colophon'], ['stripe', 'Stripe'], ['quiet', 'Quiet']], 'content'),
    ...genLookFields,
  ),
  component: function GeneratedFooter(props) {
    const edit = editOf(props)
    const layout = str(props.layout, 'colophon')
    const surface = str(props.surface, 'ink')
    return (
      <SectionShell
        props={props}
        tone={surfaceTone(surface)}
        className={cx('ud-gen', 'ud-gen-foot', `ud-gen-foot--${layout}`, `ud-gen--${surface}`)}
      >
        <div className="ud-gen-foot__row">
          <GenMark props={props} />
          {layout !== 'quiet' ? <GenLinks props={props} /> : null}
        </div>
        <p className="ud-gen-foot__copy">
          <EditableText edit={edit} path={['copyright']} value={str(props.copyright)} placeholder="Copyright" />
        </p>
      </SectionShell>
    )
  },
})

export const generatedForm = defineBlock({
  type: 'generated.form',
  version: 1,
  category: 'form',
  label: 'Original form',
  icon: 'sparkles',
  defaultProps: {
    eyebrow: 'Contact',
    heading: 'Write to the studio',
    description: 'A few lines about the work. We reply within one business day.',
    buttonLabel: 'Send',
    successNote: 'We never share your details.',
    layout: 'desk',
    surface: 'paper',
    density: 'regular',
    formId: '',
  },
  schema: schema(
    eyebrowField,
    headingField,
    descriptionField,
    text('buttonLabel', 'Submit label'),
    field('successNote', 'text', 'Note under the form', 'content'),
    field('formId', 'text', 'Connected form', 'content'),
    select('layout', 'Layout', [['desk', 'Desk'], ['narrow', 'Narrow column']], 'content'),
    ...genLookFields,
  ),
  component: function GeneratedForm(props) {
    const edit = editOf(props)
    const layout = str(props.layout, 'desk')
    const surface = str(props.surface, 'paper')
    return (
      <SectionShell
        props={props}
        tone={surfaceTone(surface)}
        className={cx('ud-gen', 'ud-gen-form', `ud-gen-form--${layout}`, `ud-gen--${surface}`)}
      >
        <div className="ud-gen-form__grid">
          <div className="ud-gen-copy">
            {str(props.eyebrow) || edit ? (
              <EditableText edit={edit} path={['eyebrow']} value={str(props.eyebrow)} as="p" className="ud-gen-kicker" placeholder="Kicker" />
            ) : null}
            <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" placeholder="Heading" />
            <SafeText value={str(props.description)} className="ud-lead" edit={edit} path={['description']} placeholder="Lead" />
          </div>
          <div className="ud-gen-form__panel">
            <PublicForm
              formId={str(props.formId) || undefined}
              fields={[
                { name: 'name', label: 'Name', type: 'text', required: true },
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'message', label: 'How can we help?', type: 'textarea', required: true },
              ]}
              submitLabel={str(props.buttonLabel) || undefined}
              edit={editOf(props)}
              submitLabelPath={['buttonLabel']}
            />
            {str(props.successNote) || edit ? (
              <p className="ud-small" style={{ marginTop: 14 }}>
                <EditableText edit={edit} path={['successNote']} value={str(props.successNote)} placeholder="Note" />
              </p>
            ) : null}
          </div>
        </div>
      </SectionShell>
    )
  },
})
