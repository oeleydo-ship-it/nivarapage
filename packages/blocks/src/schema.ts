import type { BlockField, BlockFieldGroup, BlockSchema } from '@uidesired/types'
import { ICON_NAMES } from './icons'
import { fontStackOptions } from './theme'

type Extra = Partial<Omit<BlockField, 'key' | 'type' | 'label'>>

export function field(
  key: string,
  type: BlockField['type'],
  label: string,
  group: BlockFieldGroup = 'content',
  extra: Extra = {},
): BlockField {
  return { key, type, label, group, ...extra }
}

function options(...values: Array<string | [string, string]>) {
  return values.map((value) =>
    Array.isArray(value) ? { value: value[0], label: value[1] } : { value, label: value.charAt(0).toUpperCase() + value.slice(1) },
  )
}

/* ------------------------------------------------------------------ content */

export const text = (key: string, label: string, extra: Extra = {}) => field(key, 'text', label, 'content', extra)
export const textarea = (key: string, label: string, extra: Extra = {}) => field(key, 'textarea', label, 'content', extra)
export const richtext = (key: string, label: string, extra: Extra = {}) => field(key, 'richtext', label, 'content', extra)
export const image = (key: string, label: string, extra: Extra = {}) => field(key, 'image', label, 'content', extra)
export const link = (key: string, label: string, extra: Extra = {}) => field(key, 'link', label, 'content', extra)
export const toggle = (key: string, label: string, group: BlockFieldGroup = 'layout') => field(key, 'toggle', label, group)
export const icon = (key: string, label: string, extra: Extra = {}) =>
  field(key, 'icon', label, 'content', { options: ICON_NAMES.map((name) => ({ value: name, label: name })), ...extra })

export const select = (key: string, label: string, values: Array<string | [string, string]>, group: BlockFieldGroup = 'layout') =>
  field(key, 'select', label, group, { options: options(...values) })

export const slider = (
  key: string,
  label: string,
  min: number,
  max: number,
  group: BlockFieldGroup = 'layout',
  extra: Extra = {},
) => field(key, 'slider', label, group, { min, max, step: 1, ...extra })

export const number = (key: string, label: string, group: BlockFieldGroup = 'layout', extra: Extra = {}) =>
  field(key, 'number', label, group, extra)

export const repeater = (
  key: string,
  label: string,
  fields: BlockField[],
  extra: Extra = {},
): BlockField => field(key, 'repeater', label, 'content', { fields, itemLabel: 'Item', ...extra })

/**
 * Drops fields a particular block never renders. Several blocks share a repeater
 * definition but show different parts of each item; without this the inspector
 * offers controls that do nothing on that block.
 */
export function withoutFields(fields: BlockField[], ...keys: string[]): BlockField[] {
  const drop = new Set(keys)
  return fields.filter((entry) => !drop.has(entry.key))
}

export const eyebrowField = text('eyebrow', 'Eyebrow')
export const headingField = text('heading', 'Heading')
export const subheadingField = textarea('subheading', 'Subheading')
export const descriptionField = textarea('description', 'Description')

const BUTTON_STYLES: Array<[string, string]> = [
  ['', 'Block default'],
  ['primary', 'Primary'],
  ['secondary', 'Secondary'],
  ['accent', 'Accent'],
  ['outline', 'Outline'],
  ['ghost', 'Ghost'],
  ['light', 'Light'],
  ['link', 'Text link'],
]

/**
 * Call-to-action controls for blocks that render a single button. Blocks that
 * show only one button must use this instead of `ctaFields`, or the inspector
 * offers a secondary button that never appears on the canvas.
 */
export const primaryCtaFields: BlockField[] = [
  text('buttonLabel', 'Button label'),
  link('buttonUrl', 'Button link'),
  select('buttonVariant', 'Button style', BUTTON_STYLES, 'design'),
]

/** Primary + secondary call-to-action controls. */
export const ctaFields: BlockField[] = [
  ...primaryCtaFields,
  text('secondaryLabel', 'Secondary label'),
  link('secondaryUrl', 'Secondary link'),
  select('secondaryVariant', 'Secondary button style', BUTTON_STYLES, 'design'),
]

export const headFields: BlockField[] = [eyebrowField, headingField, descriptionField]

/**
 * Nav links with an optional dropdown. Every navigation block uses this so the
 * submenu shape is identical across template families.
 */
/**
 * Sticky-header toggle shared by every navigation block.
 *
 * Deliberately in the `content` group rather than `layout`: it sits with the
 * bar's own options where people look for it, instead of below the fold with
 * the generic section-layout controls.
 */
export const stickyField = toggle('sticky', 'Sticky header', 'content')

export const navLinksField = (key = 'links', label = 'Links'): BlockField =>
  repeater(
    key,
    label,
    [
      text('label', 'Label'),
      link('url', 'URL'),
      repeater('children', 'Dropdown items', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Item' }),
    ],
    { itemLabel: 'Link' },
  )


/* --------------------------------------------------- shared design controls */

export const toneField = select(
  'tone',
  'Color scheme',
  [
    ['default', 'Page background'],
    ['surface', 'Surface'],
    ['dark', 'Dark'],
    ['primary', 'Primary'],
    ['accent', 'Accent'],
    ['gradient', 'Gradient'],
  ],
  'design',
)

export const eyebrowStyleField = select(
  'eyebrowStyle',
  'Eyebrow style',
  [
    ['plain', 'Uppercase'],
    ['pill', 'Pill badge'],
  ],
  'design',
)

export const backgroundFields: BlockField[] = [
  field('backgroundType', 'background', 'Background', 'background', {
    options: options(['tone', 'Theme'], ['color', 'Solid color'], ['gradient', 'Gradient'], ['image', 'Image'], ['video', 'Video']),
  }),
  field('backgroundColor', 'color', 'Background color', 'background', { when: { key: 'backgroundType', equals: 'color' } }),
  field('gradientFrom', 'color', 'Gradient from', 'background', { when: { key: 'backgroundType', equals: 'gradient' } }),
  field('gradientTo', 'color', 'Gradient to', 'background', { when: { key: 'backgroundType', equals: 'gradient' } }),
  slider('gradientAngle', 'Gradient angle', 0, 360, 'background', { when: { key: 'backgroundType', equals: 'gradient' }, unit: 'deg' }),
  field('backgroundImage', 'image', 'Background image', 'background', { when: { key: 'backgroundType', equals: 'image' } }),
  field('backgroundVideo', 'video', 'Background video upload', 'background', {
    when: { key: 'backgroundType', equals: 'video' },
    help: 'Upload an MP4 or WebM loop. Prefer short muted clips under ~20 MB.',
  }),
  field('backgroundVideoUrl', 'text', 'Background video URL', 'background', {
    when: { key: 'backgroundType', equals: 'video' },
    help: 'Direct .mp4 or .webm link. YouTube/Vimeo page URLs are not supported.',
  }),
  field('videoPoster', 'image', 'Video poster', 'background', { when: { key: 'backgroundType', equals: 'video' } }),
  field('videoAutoplay', 'toggle', 'Autoplay video', 'background', { when: { key: 'backgroundType', equals: 'video' } }),
  field('videoLoop', 'toggle', 'Loop video', 'background', { when: { key: 'backgroundType', equals: 'video' } }),
  field('videoMuted', 'toggle', 'Mute video', 'background', { when: { key: 'backgroundType', equals: 'video' } }),
  field('overlayColor', 'color', 'Overlay color', 'background', { when: { key: 'backgroundType', in: ['image', 'video'] } }),
  slider('overlayOpacity', 'Overlay opacity', 0, 100, 'background', { when: { key: 'backgroundType', in: ['image', 'video'] }, unit: '%' }),
  field('lightText', 'toggle', 'Light text', 'background', { when: { key: 'backgroundType', in: ['image', 'gradient', 'video'] } }),
]

const FONT_STACKS: Array<[string, string]> = fontStackOptions(true)

export const ANIMATION_IDS = [
  'fade',
  'fade-up',
  'fade-down',
  'fade-left',
  'fade-right',
  'zoom-in',
  'slide-up',
] as const

const ANIMATION_OPTIONS: Array<[string, string]> = [
  ['none', 'None'],
  ['fade', 'Fade'],
  ['fade-up', 'Fade up'],
  ['fade-down', 'Fade down'],
  ['fade-left', 'Fade left'],
  ['fade-right', 'Fade right'],
  ['zoom-in', 'Zoom in'],
  ['slide-up', 'Slide up'],
]

const FONT_WEIGHTS: Array<[string, string]> = [
  ['', 'Site theme'],
  ['300', '300 Light'],
  ['400', '400 Regular'],
  ['500', '500 Medium'],
  ['600', '600 Semibold'],
  ['700', '700 Bold'],
  ['800', '800 Extra bold'],
  ['900', '900 Black'],
]

export const typographyFields: BlockField[] = [
  field('headingColor', 'color', 'Heading color', 'typography'),
  field('textColor', 'color', 'Text color', 'typography'),
  field('accentColor', 'color', 'Accent color', 'typography'),
  select('headingFont', 'Heading font', FONT_STACKS, 'typography'),
  select('bodyFont', 'Body font', FONT_STACKS, 'typography'),
  slider('headingSize', 'Heading size', 16, 80, 'typography', {
    unit: 'px',
    placeholder: 'theme',
    help: 'Empty uses the site theme.',
  }),
  slider('bodySize', 'Body size', 12, 28, 'typography', {
    unit: 'px',
    placeholder: 'theme',
    help: 'Empty uses the site theme.',
  }),
  select('headingWeight', 'Heading weight', FONT_WEIGHTS, 'typography'),
  select('bodyWeight', 'Body weight', FONT_WEIGHTS, 'typography'),
]

export const animationFields: BlockField[] = [
  field('animation', 'select', 'Animation', 'animation', { options: options(...ANIMATION_OPTIONS) }),
  slider('animationDuration', 'Duration', 200, 2000, 'animation', {
    unit: 'ms',
    when: { key: 'animation', in: [...ANIMATION_IDS] },
  }),
  slider('animationDelay', 'Delay', 0, 2000, 'animation', {
    unit: 'ms',
    when: { key: 'animation', in: [...ANIMATION_IDS] },
  }),
  field('animationTrigger', 'select', 'Play when', 'animation', {
    options: options(['scroll', 'On scroll'], ['load', 'On load']),
    when: { key: 'animation', in: [...ANIMATION_IDS] },
  }),
  field('textAnimation', 'select', 'Text load animation', 'animation', {
    options: options(['none', 'None'], ['fade', 'Fade in'], ['fade-up', 'Fade up'], ['blur-in', 'Blur in'], ['reveal', 'Reveal'], ['slide-up', 'Slide up']),
  }),
  slider('textAnimationDuration', 'Text duration', 100, 3000, 'animation', { unit: 'ms', when: { key: 'textAnimation', not: 'none' } }),
  slider('textAnimationDelay', 'Text delay', 0, 2000, 'animation', { unit: 'ms', when: { key: 'textAnimation', not: 'none' } }),
]

export const layoutFields: BlockField[] = [
  field('textAlign', 'alignment', 'Text alignment', 'layout'),
  select('contentWidth', 'Content width', [['narrow', 'Narrow'], ['default', 'Default'], ['wide', 'Wide'], ['full', 'Full']], 'layout'),
  slider('sectionMinHeight', 'Minimum height', 0, 1000, 'layout', { unit: 'px', placeholder: 'theme' }),
  select('overflow', 'Overflow', [['visible', 'Visible'], ['hidden', 'Clip content']], 'layout'),
  field('anchorId', 'text', 'Anchor ID', 'layout', { help: 'Target for #jump links.' }),
]

export const spacingFields: BlockField[] = [
  field('paddingTop', 'spacing', 'Padding top', 'spacing', { min: 0, max: 240, unit: 'px' }),
  field('paddingBottom', 'spacing', 'Padding bottom', 'spacing', { min: 0, max: 240, unit: 'px' }),
  field('paddingInline', 'spacing', 'Side padding', 'spacing', { min: 0, max: 160, unit: 'px' }),
]

export const sectionStyleFields: BlockField[] = [
  slider('borderWidth', 'Border width', 0, 12, 'design', { unit: 'px' }),
  field('borderColor', 'color', 'Border color', 'design'),
  slider('borderRadius', 'Section corners', 0, 80, 'design', { unit: 'px' }),
  select('sectionShadow', 'Section shadow', [['none', 'None'], ['soft', 'Soft'], ['medium', 'Medium'], ['strong', 'Strong']], 'design'),
]

/** Column count control for grid blocks. */
export const columnsField = (min = 2, max = 4) => slider('columns', 'Columns', min, max, 'layout')
export const gapField = slider('gap', 'Gap', 8, 64, 'layout', { unit: 'px' })

/**
 * Builds a block schema: block-specific fields first, then the shared
 * design / layout / typography / spacing / background controls.
 */
export function schema(...fields: BlockField[]): BlockSchema {
  const keys = new Set(fields.map((entry) => entry.key))
  const shared = [
    toneField,
    eyebrowStyleField,
    ...sectionStyleFields,
    ...layoutFields,
    ...typographyFields,
    ...animationFields,
    ...spacingFields,
    ...backgroundFields,
  ].filter((entry) => !keys.has(entry.key))
  return { fields: [...fields, ...shared] }
}

/** Compact blocks still receive the same shared controls as every other block. */
export function bareSchema(...fields: BlockField[]): BlockSchema {
  const keys = new Set(fields.map((entry) => entry.key))
  const extra = [
    toneField,
    ...sectionStyleFields,
    ...layoutFields,
    ...typographyFields,
    ...animationFields,
    ...spacingFields,
    ...backgroundFields,
  ].filter((entry) => !keys.has(entry.key))
  return { fields: [...fields, ...extra] }
}

export const designFields: BlockField[] = [toneField, ...sectionStyleFields, ...layoutFields, ...typographyFields]
