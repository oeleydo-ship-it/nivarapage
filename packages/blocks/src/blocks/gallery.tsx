import type { CSSProperties } from 'react'
import { EditableImage, EditableText, editOf } from '../editable'
import {
  Body,
  Button,
  Grid,
  Media,
  SafeText,
  SectionHead,
  SectionShell,
  bool,
  items,
  num,
  str,
  type Props,
} from '../primitives'
import { columnsField, descriptionField, field, gapField, headFields, headingField, image, link, repeater, schema, select, text, textarea, toggle } from '../schema'
import { defineBlock } from '../types'

const galleryRepeater = repeater(
  'images',
  'Images',
  [image('src', 'Image'), text('caption', 'Caption'), text('alt', 'Alt text'), link('url', 'Link')],
  { itemLabel: 'Image', itemDefaults: { src: '', caption: '' } },
)

const placeholders = Array.from({ length: 6 }).map((_, index) => ({ src: '', caption: '', alt: '', tint: index }))

/** Supports both the repeater shape and the legacy image1..image6 props. */
function galleryItems(props: Props, fallbackCount = 6): Props[] {
  const list = items(props.images, [])
  if (list.length) return list
  const legacy = [props.image1, props.image2, props.image3, props.image4, props.image5, props.image6]
    .filter((value) => str(value))
    .map((value) => ({ src: str(value) }))
  if (legacy.length) return legacy
  return placeholders.slice(0, fallbackCount)
}

function Tile({
  item,
  index,
  ratio,
  zoom,
  props,
  collection = 'images',
}: {
  item: Props
  index: number
  ratio: string
  zoom: boolean
  props: Props
  collection?: string
}) {
  const edit = editOf(props)
  const caption = str(item.caption)
  const url = str(item.url)
  const srcKey = str(item.src) || item.image === undefined ? 'src' : 'image'
  const media = (
    <Media
      src={item.src || item.image}
      alt={str(item.alt, caption)}
      ratio={ratio}
      zoom={zoom}
      edit={edit}
      path={[collection, index, srcKey]}
      style={
        str(item.src) || str(item.image)
          ? undefined
          : ({
              background: `color-mix(in srgb, var(--color-primary) ${10 + (index % 4) * 6}%, var(--color-surface))`,
            } as CSSProperties)
      }
    />
  )
  return (
    <figure style={{ margin: 0 }}>
      {url ? (
        <a href={url} style={{ display: 'block' }}>
          {media}
        </a>
      ) : (
        media
      )}
      {caption || edit ? (
        <figcaption className="ud-small" style={{ marginTop: 10 }}>
          <EditableText
            edit={edit}
            path={[collection, index, 'caption']}
            value={caption}
            as="span"
            placeholder="Caption"
          />
        </figcaption>
      ) : null}
    </figure>
  )
}

/* ------------------------------------------------------------- gallery.grid */

export const galleryGrid = defineBlock({
  type: 'gallery.grid',
  version: 1,
  category: 'gallery',
  label: 'Gallery grid',
  icon: 'Images',
  defaultProps: {
    eyebrow: 'Gallery',
    heading: 'The room',
    description: 'A look inside before you arrive.',
    columns: 3,
    imageRatio: 'landscape',
    zoomOnHover: true,
    images: placeholders,
  },
  schema: schema(
    ...headFields,
    galleryRepeater,
    columnsField(2, 4),
    gapField,
    select('imageRatio', 'Image ratio', [['landscape', '4:3'], ['square', '1:1'], ['portrait', '3:4'], ['wide', '16:9']], 'design'),
    toggle('zoomOnHover', 'Zoom on hover', 'design'),
  ),
  component: (props) => (
    <SectionShell props={props} tone="default">
      <SectionHead props={props} defaultHeading="Gallery" />
      <Grid cols={num(props.columns, 3)} gap={num(props.gap, 14)}>
        {galleryItems(props).map((item, index) => (
          <Tile key={index} item={item} index={index} ratio={str(props.imageRatio, 'landscape')} zoom={bool(props.zoomOnHover, true)} props={props} />
        ))}
      </Grid>
    </SectionShell>
  ),
  settings: null,
})

/* ---------------------------------------------------------- gallery.masonry */

export const galleryMasonry = defineBlock({
  type: 'gallery.masonry',
  version: 1,
  category: 'gallery',
  label: 'Masonry gallery',
  icon: 'LayoutPanelTop',
  defaultProps: {
    eyebrow: 'Portfolio',
    heading: 'Selected work',
    description: 'Recent launches across hospitality, services, and retail.',
    textAlign: 'center',
    columns: 3,
    images: placeholders,
  },
  schema: schema(...headFields, galleryRepeater, columnsField(2, 4), gapField, toggle('zoomOnHover', 'Zoom on hover', 'design')),
  component: (props) => {
    const list = galleryItems(props)
    const ratios = ['portrait', 'landscape', 'square', 'tall', 'wide', 'square']
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} defaultHeading="Gallery" />
        <Body className="ud-masonry" style={{ '--ud-mcols': String(num(props.columns, 3)), '--ud-gap': `${num(props.gap, 16)}px` } as CSSProperties}>
          {list.map((item, index) => (
            <Tile key={index} item={item} index={index} ratio={ratios[index % ratios.length]} zoom={bool(props.zoomOnHover, true)} props={props} />
          ))}
        </Body>
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------- gallery.carousel */

export const galleryCarousel = defineBlock({
  type: 'gallery.carousel',
  version: 1,
  category: 'gallery',
  label: 'Gallery carousel',
  icon: 'GalleryHorizontalEnd',
  defaultProps: {
    eyebrow: 'Gallery',
    heading: 'Swipe through the space',
    description: 'Scroll sideways to see more.',
    imageRatio: 'wide',
    images: placeholders,
    tone: 'surface',
  },
  schema: schema(
    ...headFields,
    galleryRepeater,
    select('imageRatio', 'Image ratio', [['wide', '16:9'], ['landscape', '4:3'], ['square', '1:1']], 'design'),
    gapField,
  ),
  component: (props) => (
    <SectionShell props={props} tone="surface">
      <SectionHead props={props} defaultHeading="Gallery" />
      <Body className="ud-scroller" style={{ gap: num(props.gap, 20) }}>
        {galleryItems(props).map((item, index) => (
          <Tile key={index} item={item} index={index} ratio={str(props.imageRatio, 'wide')} zoom={false} props={props} />
        ))}
      </Body>
    </SectionShell>
  ),
  settings: null,
})

/* ------------------------------------------------------------ gallery.logos */

export const galleryLogos = defineBlock({
  type: 'gallery.logos',
  version: 1,
  category: 'gallery',
  label: 'Logo wall',
  icon: 'Building2',
  defaultProps: {
    heading: 'Trusted by teams everywhere',
    textAlign: 'center',
    tone: 'default',
    paddingTop: 56,
    paddingBottom: 56,
    logos: [{ label: 'Northwind' }, { label: 'Acme' }, { label: 'Lumen' }, { label: 'Vertex' }, { label: 'Cobalt' }],
  },
  schema: schema(
    // No eyebrow in this layout - the heading is the whole intro.
    headingField,
    descriptionField,
    repeater('logos', 'Logos', [text('label', 'Name'), image('image', 'Logo image'), link('url', 'Link')], {
      itemLabel: 'Logo',
      itemDefaults: { label: 'Brand' },
    }),
    field('grayscale', 'toggle', 'Grayscale until hover', 'design'),
  ),
  component: (props) => {
    const logos = items(props.logos, [{ label: 'Brand' }])
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default" align="center">
        {str(props.heading) || edit ? (
          <EditableText
            edit={edit}
            path={['heading']}
            value={str(props.heading)}
            as="p"
            className="ud-small"
            style={{ marginBottom: 26 }}
            placeholder="Heading"
          />
        ) : null}
        <SafeText value={props.description} className="ud-small" edit={edit} path={['description']} placeholder="Short description" />
        <div className="ud-logos" style={bool(props.grayscale, true) ? undefined : ({ filter: 'none' } as CSSProperties)}>
          {logos.map((logo, index) => {
            const image = str(logo.image)
            const content = image ? (
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                <img src={image} alt={str(logo.label)} loading="lazy" />
                {edit ? <EditableImage edit={edit} path={['logos', index, 'image']} current={image} label="Replace logo" /> : null}
              </span>
            ) : (
              <EditableText
                edit={edit}
                path={['logos', index, 'label']}
                value={str(logo.label, 'Brand')}
                as="span"
                className="ud-logo-text"
                placeholder="Brand"
              />
            )
            return str(logo.url) ? (
              <a key={index} href={str(logo.url)} style={{ display: 'inline-flex' }}>
                {content}
              </a>
            ) : (
              <span key={index} style={{ display: 'inline-flex' }}>
                {content}
              </span>
            )
          })}
        </div>
      </SectionShell>
    )
  },
  settings: null,
})

/* -------------------------------------------------------- gallery.showcase */

/** Six demo cards, so the block reads as a showcase before anything is filled in. */
const showcasePlaceholders = Array.from({ length: 6 }).map((_, index) => ({
  src: '',
  title: '',
  description: '',
  url: '',
  tint: index,
}))

export const galleryShowcase = defineBlock({
  type: 'gallery.showcase',
  version: 1,
  category: 'gallery',
  label: 'Demo showcase',
  icon: 'LayoutGrid',
  defaultProps: {
    eyebrow: 'Templates',
    heading: 'Ready-made designs',
    description: 'Every template is fully editable once it is applied. Open one to see how it behaves.',
    columns: 3,
    gap: 24,
    imageRatio: 'landscape',
    zoomOnHover: true,
    buttonLabel: 'View demo',
    buttonVariant: 'secondary',
    openInNewTab: true,
    // Real template slugs, so the block arrives with working demo links and
    // the button is visible from the moment it is dropped in.
    items: [
      { src: '', title: 'Voltera', description: 'A high-energy marketing agency site with bold panels and a lime accent.', url: '/templates/voltera/preview' },
      { src: '', title: 'Northbook', description: 'A calm, professional template for accountancy and financial services.', url: '/templates/northbook/preview' },
      { src: '', title: 'Halcyon', description: 'A light product template for SaaS, with pricing and a changelog.', url: '/templates/halcyon/preview' },
    ],
  },
  schema: schema(
    ...headFields,
    repeater(
      'items',
      'Demos',
      [
        image('src', 'Screenshot'),
        text('title', 'Title'),
        textarea('description', 'Description'),
        link('url', 'Demo link'),
        text('buttonLabel', 'Button label', { placeholder: 'Leave blank to use the shared label' }),
      ],
      { itemLabel: 'Demo', itemDefaults: { src: '', title: '', description: '', url: '' } },
    ),
    text('buttonLabel', 'Shared button label'),
    select('buttonVariant', 'Button style', [['primary', 'Solid'], ['secondary', 'Outline'], ['ghost', 'Quiet']], 'design'),
    toggle('openInNewTab', 'Open demos in a new tab'),
    columnsField(2, 4),
    gapField,
    select('imageRatio', 'Image ratio', [['landscape', '4:3'], ['square', '1:1'], ['portrait', '3:4'], ['wide', '16:9']], 'design'),
    toggle('zoomOnHover', 'Zoom on hover', 'design'),
  ),
  component: function DemoShowcase(props) {
    const edit = editOf(props)
    const list = items(props.items, showcasePlaceholders)
    const sharedLabel = str(props.buttonLabel, 'View demo')
    const ratio = str(props.imageRatio, 'landscape')
    const zoom = bool(props.zoomOnHover, true)
    const newTab = bool(props.openInNewTab, true)

    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} defaultHeading="Ready-made designs" />
        <Grid cols={num(props.columns, 3)} gap={num(props.gap, 24)}>
          {list.map((item, index) => {
            const url = str(item.url)
            // A per-demo label wins, so one card can say "Preview" while the
            // rest say "View demo"; blank falls back to the shared one.
            const label = str(item.buttonLabel) || sharedLabel

            return (
              <article
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  border: '1px solid var(--color-border, rgba(0,0,0,.08))',
                  borderRadius: 'var(--radius-card, 14px)',
                  overflow: 'hidden',
                  background: 'var(--color-surface)',
                }}
              >
                <Media
                  src={item.src}
                  alt={str(item.alt, str(item.title))}
                  ratio={ratio}
                  zoom={zoom}
                  edit={edit}
                  path={['items', index, 'src']}
                  style={
                    str(item.src)
                      ? undefined
                      : ({
                          background: `color-mix(in srgb, var(--color-primary) ${10 + (index % 4) * 6}%, var(--color-surface))`,
                        } as CSSProperties)
                  }
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 18px 20px' }}>
                  <EditableText
                    edit={edit}
                    path={['items', index, 'title']}
                    value={str(item.title)}
                    as="h3"
                    className="ud-h4"
                    style={{ margin: 0 }}
                    placeholder="Template name"
                  />
                  <EditableText
                    edit={edit}
                    path={['items', index, 'description']}
                    value={str(item.description)}
                    as="p"
                    className="ud-small"
                    style={{ margin: 0 }}
                    placeholder="What this template is for"
                    multiline
                  />

                  {/* The button stays on screen while editing even before a link
                      is set, so the label can be written before the demo exists. */}
                  {url || edit ? (
                    <div style={{ marginTop: 6 }}>
                      <Button
                        href={url || '#'}
                        variant={str(props.buttonVariant, 'secondary') as 'primary' | 'secondary' | 'ghost'}
                        target={newTab ? '_blank' : undefined}
                      >
                        <EditableText
                          edit={edit}
                          path={['items', index, 'buttonLabel']}
                          value={label}
                          as="span"
                          placeholder="View demo"
                        />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </article>
            )
          })}
        </Grid>
      </SectionShell>
    )
  },
  settings: null,
})
