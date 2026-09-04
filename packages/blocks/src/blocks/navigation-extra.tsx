import { LookNavbar } from './nav-looks'
import { bareSchema, field, link, repeater, select, stickyField, text, toggle } from '../schema'
import { defineBlock } from '../types'

const linkRepeater = repeater(
  'links',
  'Menu links',
  [text('label', 'Label'), link('url', 'Link'), repeater('children', 'Dropdown items', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Item' })],
  { itemLabel: 'Link', itemDefaults: { label: 'New link', url: '/' }, help: 'Leave empty to use the site navigation menu.' },
)

const brandFields = [
  text('logo', 'Logo text'),
  field('logoImage', 'image', 'Logo image', 'content'),
  field('logoUrl', 'link', 'Logo link', 'content'),
  field('logoIcon', 'icon', 'Logo mark', 'content'),
  toggle('showMark', 'Show logo mark', 'design'),
  field('logoHeight', 'slider', 'Logo height', 'design', { min: 16, max: 96, unit: 'px' }),
  field('logoWidth', 'slider', 'Logo width', 'design', { min: 16, max: 400, unit: 'px', help: 'Leave empty to keep the logo\'s natural aspect ratio.' }),
]

const ctaGroup = [
  toggle('showButton', 'Show button', 'content'),
  text('buttonLabel', 'Button label'),
  link('buttonUrl', 'Button link'),
  select('buttonVariant', 'Button style', ['primary', 'secondary', 'accent', 'outline', 'ghost'], 'design'),
  toggle('showSecondary', 'Show secondary button', 'content'),
  text('secondaryLabel', 'Secondary label'),
  link('secondaryUrl', 'Secondary link'),
]

const restyleFields = [
  select('tone', 'Color scheme', [['default', 'Light'], ['surface', 'Surface'], ['dark', 'Dark'], ['primary', 'Primary']], 'design'),
  field('backgroundColor', 'color', 'Background color', 'background'),
  select('linkStyle', 'Link style', [['plain', 'Plain'], ['pill', 'Pills'], ['line', 'Underline']], 'design'),
  select('density', 'Density', [['compact', 'Compact'], ['regular', 'Regular'], ['roomy', 'Roomy']], 'layout'),
  field('barRadius', 'slider', 'Corner radius', 'design', { min: 0, max: 48, unit: 'px' }),
  toggle('showBorder', 'Show border', 'design'),
  toggle('shadow', 'Drop shadow', 'design'),
  stickyField,
  field('anchorId', 'text', 'Anchor ID', 'layout'),
]

const links = [
  { label: 'Home', url: '/' },
  { label: 'Work', url: '/work' },
  { label: 'About', url: '/about' },
  { label: 'Contact', url: '/contact' },
]

const lookSchema = bareSchema(...brandFields, linkRepeater, ...ctaGroup, ...restyleFields)

export const navbarPill = defineBlock({
  type: 'navbar.pill',
  version: 1,
  category: 'navigation',
  label: 'Pill navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Studio',
    logoUrl: '/',
    logoIcon: 'sparkles',
    showMark: true,
    logoHeight: 28,
    showButton: true,
    buttonLabel: 'Book a call',
    buttonUrl: '/contact',
    buttonVariant: 'primary',
    tone: 'dark',
    sticky: true,
    density: 'compact',
    linkStyle: 'plain',
    barRadius: 40,
    links,
  },
  schema: lookSchema,
  component: (props) => <LookNavbar props={props} look="pill" />,
  settings: null,
})

export const navbarSplit = defineBlock({
  type: 'navbar.split',
  version: 1,
  category: 'navigation',
  label: 'Split navbar',
  icon: 'PanelTop',
  defaultProps: {
    logo: 'Studio',
    logoUrl: '/',
    logoIcon: 'layers',
    showMark: true,
    showButton: true,
    buttonLabel: 'Start',
    buttonUrl: '/contact',
    buttonVariant: 'outline',
    showSecondary: true,
    secondaryLabel: 'Log in',
    secondaryUrl: '/contact',
    tone: 'default',
    sticky: true,
    density: 'regular',
    linkStyle: 'pill',
    barRadius: 16,
    links,
  },
  schema: lookSchema,
  component: (props) => <LookNavbar props={props} look="split" />,
  settings: null,
})

export const navbarUnderline = defineBlock({
  type: 'navbar.underline',
  version: 1,
  category: 'navigation',
  label: 'Underline navbar',
  icon: 'Minus',
  defaultProps: {
    logo: 'Atelier',
    logoUrl: '/',
    showMark: false,
    showButton: false,
    tone: 'default',
    sticky: true,
    density: 'roomy',
    linkStyle: 'line',
    showBorder: true,
    links,
  },
  schema: lookSchema,
  component: (props) => <LookNavbar props={props} look="underline" />,
  settings: null,
})

export const navbarIsland = defineBlock({
  type: 'navbar.island',
  version: 1,
  category: 'navigation',
  label: 'Island navbar',
  icon: 'Layers',
  defaultProps: {
    logo: 'Harbor',
    logoUrl: '/',
    logoIcon: 'globe',
    showMark: true,
    showButton: true,
    buttonLabel: 'Get a quote',
    buttonUrl: '/contact',
    tone: 'surface',
    sticky: true,
    shadow: true,
    density: 'regular',
    linkStyle: 'plain',
    barRadius: 22,
    links,
  },
  schema: lookSchema,
  component: (props) => <LookNavbar props={props} look="island" />,
  settings: null,
})

export const navbarUtility = defineBlock({
  type: 'navbar.utility',
  version: 1,
  category: 'navigation',
  label: 'Utility navbar',
  icon: 'Menu',
  defaultProps: {
    logo: 'Fieldstone',
    logoUrl: '/',
    logoIcon: 'briefcase',
    showMark: true,
    showButton: true,
    buttonLabel: 'Get a quote',
    buttonUrl: '/contact',
    note: 'Mon–Fri 9:00–17:00 · 18 Harbour Street',
    email: 'hello@fieldstone.example',
    tone: 'default',
    sticky: true,
    density: 'compact',
    linkStyle: 'plain',
    showBorder: true,
    links,
  },
  schema: bareSchema(
    ...brandFields,
    text('note', 'Top bar note'),
    text('email', 'Top bar email'),
    linkRepeater,
    ...ctaGroup,
    ...restyleFields,
  ),
  component: (props) => <LookNavbar props={props} look="utility" />,
  settings: null,
})

export const navbarMinimal = defineBlock({
  type: 'navbar.minimal',
  version: 1,
  category: 'navigation',
  label: 'Minimal navbar',
  icon: 'Minus',
  defaultProps: {
    logo: 'North',
    logoUrl: '/',
    showMark: false,
    showButton: true,
    buttonLabel: 'Contact',
    buttonUrl: '/contact',
    buttonVariant: 'ghost',
    tone: 'default',
    sticky: true,
    density: 'roomy',
    linkStyle: 'plain',
    links,
  },
  schema: lookSchema,
  component: (props) => <LookNavbar props={props} look="minimal" />,
  settings: null,
})
