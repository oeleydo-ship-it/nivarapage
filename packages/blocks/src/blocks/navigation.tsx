import type { BlockProps } from '@uidesired/types'
import { Navbar } from './navbar-view'
import { bareSchema, field, link, repeater, select, stickyField, text, toggle } from '../schema'
import { defineBlock } from '../types'

const linkRepeater = repeater(
  'links',
  'Menu links',
  [text('label', 'Label'), link('url', 'Link'), select('target', 'Opens in', [['', 'Same tab'], ['_blank', 'New tab']], 'content'), repeater('children', 'Dropdown items', [text('label', 'Label'), link('url', 'URL')], { itemLabel: 'Item' })],
  { itemLabel: 'Link', itemDefaults: { label: 'New link', url: '/' }, help: 'Leave empty to use the site navigation menu.' },
)

const brandFields = [
  text('logo', 'Logo text'),
  field('logoImage', 'image', 'Logo image', 'content'),
  field('logoUrl', 'link', 'Logo link', 'content'),
  field('logoIcon', 'icon', 'Logo mark', 'content'),
  toggle('showMark', 'Show logo mark', 'design'),
  field('logoHeight', 'slider', 'Logo height', 'design', { min: 16, max: 96, unit: 'px' }),
]

const ctaGroup = [
  toggle('showButton', 'Show button', 'content'),
  text('buttonLabel', 'Button label'),
  link('buttonUrl', 'Button link'),
  select('buttonVariant', 'Button style', ['primary', 'secondary', 'accent', 'outline', 'ghost'], 'design'),
  toggle('showSecondary', 'Show secondary button', 'content'),
  text('secondaryLabel', 'Secondary label'),
  link('secondaryUrl', 'Secondary link'),
  field('showThemeSwitch', 'toggle', 'Dark / light switcher', 'content', {
    help: 'Only appears once the theme has a Light background set, under Theme → Light background.',
  }),
]

const chromeFields = [
  select('tone', 'Color scheme', [['default', 'Light'], ['surface', 'Surface'], ['dark', 'Dark'], ['primary', 'Primary']], 'design'),
  field('backgroundColor', 'color', 'Background color', 'background'),
  select('linkStyle', 'Link style', [['plain', 'Plain'], ['pill', 'Pills'], ['line', 'Underline']], 'design'),
  select('density', 'Density', [['compact', 'Compact'], ['regular', 'Regular'], ['roomy', 'Roomy']], 'layout'),
  field('barRadius', 'slider', 'Corner radius', 'design', { min: 0, max: 40, unit: 'px' }),
  toggle('inset', 'Inset bar', 'layout'),
  toggle('showBorder', 'Show bottom border', 'design'),
  toggle('shadow', 'Drop shadow', 'design'),
  stickyField,
  field('anchorId', 'text', 'Anchor ID', 'layout'),
]

const navSchema = bareSchema(...brandFields, linkRepeater, ...ctaGroup, ...chromeFields)

const baseNavProps: BlockProps = {
  logo: 'Your Brand',
  logoUrl: '/',
  logoIcon: 'sparkles',
  showMark: true,
  logoHeight: 32,
  showBorder: true,
  tone: 'default',
  links: [
    { label: 'Home', url: '/' },
    { label: 'About', url: '/about' },
    { label: 'Services', url: '/services' },
    { label: 'Contact', url: '/contact' },
  ],
}

export const navbarSimple = defineBlock({
  type: 'navbar.simple',
  version: 1,
  category: 'navigation',
  label: 'Simple navbar',
  icon: 'Menu',
  defaultProps: { ...baseNavProps },
  schema: navSchema,
  component: (props) => <Navbar props={props} variant="simple" />,
  settings: null,
})

export const navbarCentered = defineBlock({
  type: 'navbar.centered',
  version: 1,
  category: 'navigation',
  label: 'Centered navbar',
  icon: 'PanelTop',
  defaultProps: { ...baseNavProps },
  schema: navSchema,
  component: (props) => <Navbar props={props} variant="centered" />,
  settings: null,
})

export const navbarCta = defineBlock({
  type: 'navbar.cta',
  version: 1,
  category: 'navigation',
  label: 'Navbar with CTA',
  icon: 'MousePointerClick',
  defaultProps: { ...baseNavProps, showButton: true, buttonLabel: 'Get started', buttonUrl: '/contact', shadow: true },
  schema: navSchema,
  component: (props) => <Navbar props={props} variant="cta" />,
  settings: null,
})

export const navbarTransparent = defineBlock({
  type: 'navbar.transparent',
  version: 1,
  category: 'navigation',
  label: 'Transparent navbar',
  icon: 'Layers',
  defaultProps: { ...baseNavProps, showBorder: false, sticky: true, showButton: true, buttonLabel: 'Book now', buttonVariant: 'outline' },
  schema: navSchema,
  component: (props) => <Navbar props={props} variant="transparent" />,
  settings: null,
})
