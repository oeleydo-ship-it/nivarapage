import { EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Avatar,
  Body,
  Card,
  CtaGroup,
  Grid,
  Media,
  SafeText,
  SectionHead,
  SectionShell,
  bool,
  items,
  num,
  str,
} from '../primitives'
import { columnsField, ctaFields, field, gapField, headFields, image, link, repeater, schema, select, text, toggle, withoutFields } from '../schema'
import { defineBlock } from '../types'

const people = [
  {
    name: 'Amelia Chen',
    role: 'Founder & design lead',
    bio: 'Ships the first pages with every new client and still reviews every homepage.',
    image: '',
  },
  {
    name: 'Jonah Patel',
    role: 'Engineering',
    bio: 'Keeps publishing fast, forms honest, and custom domains boringly reliable.',
    image: '',
  },
  {
    name: 'Maya Ortiz',
    role: 'Customer success',
    bio: 'The person who actually picks up when month-end is due tomorrow.',
    image: '',
  },
  {
    name: 'Chris Hale',
    role: 'Operations',
    bio: 'Schedules, payroll, and the shop running on time without a ticket queue.',
    image: '',
  },
]

const personFields = [
  text('name', 'Name'),
  text('role', 'Role'),
  field('bio', 'textarea', 'Bio', 'content'),
  image('image', 'Photo'),
  link('url', 'Profile link'),
  link('twitter', 'Twitter / X'),
  link('linkedin', 'LinkedIn'),
  link('instagram', 'Instagram'),
]

const peopleOptions = {
  itemLabel: 'Person',
  itemDefaults: { name: 'New teammate', role: 'Role', bio: 'A short line about their work.' },
}

const peopleRepeater = repeater('items', 'People', personFields, peopleOptions)

/* -------------------------------------------------------------- team.cards */

export const teamCards = defineBlock({
  type: 'team.cards',
  version: 1,
  category: 'team',
  label: 'Team cards',
  icon: 'Users',
  defaultProps: {
    eyebrow: 'The people',
    heading: 'A small team you can actually name',
    description: 'No offshore queue. These are the people who will know your site.',
    textAlign: 'center',
    columns: 4,
    showBio: true,
    items: people,
  },
  schema: schema(
    ...headFields,
    peopleRepeater,
    columnsField(2, 4),
    gapField,
    toggle('showBio', 'Show bios', 'content'),
    toggle('showCards', 'Show cards', 'design'),
    select('photoShape', 'Photo shape', [['portrait', 'Portrait'], ['round', 'Circle']], 'design'),
  ),
  component: (props) => {
    const edit = editOf(props)
    const rows = items(props.items, people)
    const round = str(props.photoShape) === 'round'
    const boxed = bool(props.showCards, true)
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} defaultHeading="Team" />
        <Body>
          <Grid cols={num(props.columns, 4)} gap={num(props.gap, 24)}>
            {rows.map((person, index) => {
              const socials = [
                { key: 'twitter', icon: 'twitter', url: str(person.twitter) },
                { key: 'linkedin', icon: 'linkedin', url: str(person.linkedin) },
                { key: 'instagram', icon: 'instagram', url: str(person.instagram) },
              ].filter((item) => item.url)
              const inner = (
                <>
                  {round ? (
                    <div style={{ width: 120, height: 120, margin: '0 auto 16px', borderRadius: 999, overflow: 'hidden' }}>
                      <Media
                        src={person.image}
                        alt={str(person.name)}
                        ratio="square"
                        edit={edit}
                        path={['items', index, 'image']}
                        style={{ borderRadius: 999, height: '100%' }}
                      />
                    </div>
                  ) : (
                    <Media
                      src={person.image}
                      alt={str(person.name)}
                      ratio="portrait"
                      edit={edit}
                      path={['items', index, 'image']}
                      style={{ margin: boxed ? '-4px -4px 18px' : '0 0 18px', borderRadius: 'calc(var(--radius-card, 12px) - 4px)' }}
                    />
                  )}
                  <EditableText
                    edit={edit}
                    path={['items', index, 'name']}
                    value={str(person.name, 'Name')}
                    as="h3"
                    className="ud-h4"
                    style={round ? { textAlign: 'center' } : undefined}
                    placeholder="Name"
                  />
                  <EditableText
                    edit={edit}
                    path={['items', index, 'role']}
                    value={str(person.role)}
                    as="p"
                    className="ud-small"
                    style={{ marginTop: 4, textAlign: round ? 'center' : undefined }}
                    placeholder="Role"
                  />
                  {bool(props.showBio, true) ? (
                    <SafeText
                      value={person.bio}
                      className="ud-text"
                      style={{ marginTop: 10, textAlign: round ? 'center' : undefined }}
                      edit={edit}
                      path={['items', index, 'bio']}
                      placeholder="A short bio"
                    />
                  ) : null}
                  {socials.length ? (
                    <div className="ud-row" style={{ justifyContent: round ? 'center' : 'flex-start', gap: 10, marginTop: 12 }}>
                      {socials.map((item) => (
                        <a key={item.key} href={item.url} aria-label={item.key} style={{ color: 'inherit', opacity: 0.7 }}>
                          <Icon name={item.icon} size={16} />
                        </a>
                      ))}
                    </div>
                  ) : null}
                </>
              )
              return boxed ? (
                <Card key={index} hover={false}>
                  {inner}
                </Card>
              ) : (
                <div key={index}>{inner}</div>
              )
            })}
          </Grid>
        </Body>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------- team.spotlight */

export const teamSpotlight = defineBlock({
  type: 'team.spotlight',
  version: 1,
  category: 'team',
  label: 'Team spotlight',
  icon: 'Award',
  defaultProps: {
    eyebrow: 'Leadership',
    heading: 'Meet the person who still reviews every homepage',
    description: 'Amelia founded the studio in 2014 and still sits in on kickoffs.',
    name: 'Amelia Chen',
    role: 'Founder & design lead',
    quote: 'We take fewer clients so the work still has our name on it.',
    buttonLabel: 'Work with us',
    buttonUrl: '/contact',
    imageRatio: 'portrait',
    items: people.slice(1),
  },
  schema: schema(
    ...headFields,
    text('name', 'Featured name'),
    text('role', 'Featured role'),
    field('quote', 'textarea', 'Quote', 'content'),
    image('image', 'Featured photo'),
    select('imageRatio', 'Image ratio', [['landscape', '4:3'], ['wide', '16:9'], ['square', '1:1'], ['portrait', '3:4'], ['tall', '4:5']], 'design'),
    ...ctaFields,
    // The spotlight grid shows name and role only.
    repeater('items', 'Team', withoutFields(personFields, 'bio'), peopleOptions),
  ),
  component: (props) => {
    const edit = editOf(props)
    const rest = items(props.items, people.slice(1))
    return (
      <SectionShell props={props} tone="surface">
        <div className="ud-split">
          <Media
            src={props.image}
            alt={str(props.name)}
            ratio={str(props.imageRatio, 'portrait')}
            edit={edit}
            path={['image']}
          />
          <div>
            <SectionHead props={props} defaultHeading="Leadership" center={false} />
            <blockquote className="ud-quote" style={{ margin: '22px 0 0', fontSize: '1.35rem' }}>
              “
              <EditableText
                edit={edit}
                path={['quote']}
                value={str(props.quote)}
                as="span"
                placeholder="A short quote"
              />
              ”
            </blockquote>
            <div className="ud-row" style={{ marginTop: 18, gap: 12 }}>
              <Avatar src={props.image} name={props.name} edit={edit} path={['image']} />
              <div>
                <EditableText edit={edit} path={['name']} value={str(props.name)} as="div" style={{ fontWeight: 600 }} placeholder="Name" />
                <EditableText edit={edit} path={['role']} value={str(props.role)} as="div" className="ud-small" placeholder="Role" />
              </div>
            </div>
            <CtaGroup props={props} />
          </div>
        </div>
        {rest.length ? (
          <Grid cols={Math.min(rest.length, 3)} gap={20} style={{ marginTop: 40 }}>
            {rest.map((person, index) => (
              <div key={index} className="ud-row" style={{ alignItems: 'flex-start', gap: 14 }}>
                <Avatar src={person.image} name={person.name} edit={edit} path={['items', index, 'image']} />
                <div>
                  <EditableText
                    edit={edit}
                    path={['items', index, 'name']}
                    value={str(person.name)}
                    as="div"
                    className="ud-h4"
                    placeholder="Name"
                  />
                  <EditableText
                    edit={edit}
                    path={['items', index, 'role']}
                    value={str(person.role)}
                    as="p"
                    className="ud-small"
                    style={{ marginTop: 2 }}
                    placeholder="Role"
                  />
                </div>
              </div>
            ))}
          </Grid>
        ) : null}
      </SectionShell>
    )
  },
  settings: null,
})
