'use client'

import { useState } from 'react'
import { EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Avatar,
  Body,
  Card,
  CtaGroup,
  Media,
  SafeText,
  SectionHead,
  SectionShell,
  Stars,
  bool,
  gridStyle,
  items,
  num,
  str,
} from '../primitives'
import { columnsField, ctaFields, field, gapField, headFields, image, repeater, schema, select, text, toggle } from '../schema'
import { defineBlock } from '../types'

const quotes = [
  {
    text: 'The launch looked like we had a full studio behind it. Our demo requests doubled in six weeks.',
    name: 'Amelia Chen',
    role: 'Founder, Northwind',
    rating: 5,
  },
  {
    text: 'Editing pages no longer feels risky. Drafts, preview links, and publishing just work.',
    name: 'Jonah Patel',
    role: 'Operations, Lumen',
    rating: 5,
  },
  {
    text: 'Our restaurant site finally matches the room. Guests mention it when they book.',
    name: 'Riley Gomez',
    role: 'Owner, Harbour Street',
    rating: 5,
  },
]

const quoteRepeater = repeater(
  'items',
  'Testimonials',
  [
    field('text', 'textarea', 'Quote', 'content'),
    text('name', 'Name'),
    text('role', 'Role / company'),
    image('avatar', 'Photo'),
    field('rating', 'slider', 'Rating', 'content', { min: 0, max: 5 }),
  ],
  { itemLabel: 'Testimonial', itemDefaults: { text: 'A great result.', name: 'Customer', role: 'Company', rating: 5 } },
)

/* ------------------------------------------------------- testimonials.cards */

export const testimonialsCards = defineBlock({
  type: 'testimonials.cards',
  version: 1,
  category: 'testimonials',
  label: 'Testimonial cards',
  icon: 'Quote',
  defaultProps: {
    eyebrow: 'Testimonials',
    heading: 'What clients say',
    description: 'A few words from the teams we have launched with.',
    textAlign: 'center',
    columns: 3,
    showRating: true,
    tone: 'surface',
    items: quotes,
  },
  schema: schema(
    ...headFields,
    quoteRepeater,
    columnsField(1, 4),
    gapField,
    toggle('showRating', 'Show star rating', 'design'),
    toggle('showQuoteMark', 'Show quote mark', 'design'),
    ...ctaFields,
  ),
  component: (props) => (
    <SectionShell props={props} tone="surface">
      <SectionHead props={props} defaultHeading="Testimonials" />
      <Body className="ud-grid" style={gridStyle(num(props.columns, 3), num(props.gap, 20))}>
        {items(props.items, quotes).map((quote, index) => (
          <Card key={index} style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
            {bool(props.showQuoteMark, false) ? (
              <span style={{ color: 'var(--ud-accent)', opacity: 0.6 }}>
                <Icon name="quote" size={28} />
              </span>
            ) : null}
            {bool(props.showRating, true) ? <Stars count={num(quote.rating, 5)} /> : null}
            <SafeText
              value={quote.text || quote.quote}
              style={{ lineHeight: 1.65, margin: 0 }}
              edit={editOf(props)}
              path={['items', index, typeof quote.text === 'string' || quote.quote === undefined ? 'text' : 'quote']}
              placeholder="What did they say?"
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
              <Avatar src={quote.avatar} name={quote.name} edit={editOf(props)} path={['items', index, 'avatar']} />
              <div>
                <EditableText
                  edit={editOf(props)}
                  path={['items', index, 'name']}
                  value={str(quote.name, 'Customer')}
                  as="div"
                  style={{ fontWeight: 600 }}
                  placeholder="Name"
                />
                <EditableText
                  edit={editOf(props)}
                  path={['items', index, 'role']}
                  value={str(quote.role)}
                  as="div"
                  className="ud-small"
                  placeholder="Role / company"
                />
              </div>
            </div>
          </Card>
        ))}
      </Body>
      <CtaGroup props={props} primaryVariant="outline" />
    </SectionShell>
  ),
  settings: null,
})

/* ---------------------------------------------------- testimonials.carousel */

export const testimonialsCarousel = defineBlock({
  type: 'testimonials.carousel',
  version: 1,
  category: 'testimonials',
  label: 'Testimonial carousel',
  icon: 'GalleryHorizontal',
  defaultProps: {
    eyebrow: 'Loved by teams',
    heading: 'Hear it from our customers',
    textAlign: 'center',
    tone: 'default',
    showRating: true,
    items: quotes,
  },
  schema: schema(...headFields, quoteRepeater, toggle('showRating', 'Show star rating', 'design'), toggle('showDots', 'Show dots', 'design')),
  component: (props) => {
    const list = items(props.items, quotes)
    const [index, setIndex] = useState(0)
    const activeIndex = Math.min(index, Math.max(list.length - 1, 0))
    const active = list[activeIndex] || list[0]
    const edit = editOf(props)
    const go = (delta: number) => setIndex((current) => (current + delta + list.length) % list.length)
    return (
      <SectionShell props={props} tone="default" align="center">
        <SectionHead props={props} center />
        <Body style={{ maxWidth: 820, marginInline: 'auto' }}>
          <figure style={{ margin: 0 }}>
            {bool(props.showRating, true) ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                <Stars count={num(active?.rating, 5)} />
              </div>
            ) : null}
            <blockquote className="ud-quote" style={{ margin: 0, fontSize: 'clamp(1.25rem, 1.6cqi + .9rem, 1.9rem)' }}>
              “
              <EditableText
                edit={edit}
                path={['items', activeIndex, typeof active?.text === 'string' || active?.quote === undefined ? 'text' : 'quote']}
                value={str(active?.text || active?.quote, 'A memorable experience.')}
                as="span"
                placeholder="What did they say?"
              />
              ”
            </blockquote>
            <figcaption style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', marginTop: 26 }}>
              <Avatar src={active?.avatar} name={active?.name} edit={edit} path={['items', activeIndex, 'avatar']} />
              <div style={{ textAlign: 'left' }}>
                <EditableText
                  edit={edit}
                  path={['items', activeIndex, 'name']}
                  value={str(active?.name, 'Customer')}
                  as="div"
                  style={{ fontWeight: 600 }}
                  placeholder="Name"
                />
                <EditableText
                  edit={edit}
                  path={['items', activeIndex, 'role']}
                  value={str(active?.role)}
                  as="div"
                  className="ud-small"
                  placeholder="Role / company"
                />
              </div>
            </figcaption>
          </figure>
          {list.length > 1 ? (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', marginTop: 28 }}>
              <button type="button" className="ud-btn ud-btn--outline" onClick={() => go(-1)} aria-label="Previous testimonial">
                <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>
                  <Icon name="arrow" size={16} />
                </span>
              </button>
              {bool(props.showDots, true)
                ? list.map((_, dot) => (
                    <button
                      key={dot}
                      type="button"
                      aria-label={`Go to testimonial ${dot + 1}`}
                      onClick={() => setIndex(dot)}
                      style={{
                        width: 9,
                        height: 9,
                        padding: 0,
                        borderRadius: 999,
                        border: 0,
                        cursor: 'pointer',
                        background: dot === index ? 'var(--color-primary)' : 'color-mix(in srgb, var(--ud-fg) 22%, transparent)',
                      }}
                    />
                  ))
                : null}
              <button type="button" className="ud-btn ud-btn--outline" onClick={() => go(1)} aria-label="Next testimonial">
                <Icon name="arrow" size={16} />
              </button>
            </div>
          ) : null}
        </Body>
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------- testimonials.featured */

export const testimonialsFeatured = defineBlock({
  type: 'testimonials.featured',
  version: 1,
  category: 'testimonials',
  label: 'Featured testimonial',
  icon: 'MessageSquareQuote',
  defaultProps: {
    quote: 'The best table in the city — and now the best website to match.',
    name: 'Riley Gomez',
    role: 'Owner, Harbour Street',
    rating: 5,
    tone: 'dark',
    layout: 'split',
    stat: '2×',
    statLabel: 'more online bookings',
  },
  schema: schema(
    field('quote', 'textarea', 'Quote', 'content'),
    text('name', 'Name'),
    text('role', 'Role / company'),
    image('avatar', 'Photo'),
    image('image', 'Side image'),
    field('rating', 'slider', 'Rating', 'content', { min: 0, max: 5 }),
    text('stat', 'Stat value'),
    text('statLabel', 'Stat label'),
    select('layout', 'Layout', [['split', 'Quote beside image'], ['centered', 'Centered']], 'layout'),
  ),
  component: (props) => {
    const edit = editOf(props)
    const copy = (
      <div>
        <Stars count={num(props.rating, 5)} />
        <blockquote className="ud-quote" style={{ margin: '18px 0 0', fontSize: 'clamp(1.3rem, 1.8cqi + .9rem, 2.1rem)' }}>
          “
          <EditableText edit={edit} path={['quote']} value={str(props.quote, 'Outstanding.')} as="span" placeholder="Quote" />
          ”
        </blockquote>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 24 }}>
          <Avatar src={props.avatar} name={props.name} edit={edit} path={['avatar']} />
          <div>
            <EditableText edit={edit} path={['name']} value={str(props.name, 'Guest')} as="div" style={{ fontWeight: 600 }} placeholder="Name" />
            <EditableText edit={edit} path={['role']} value={str(props.role)} as="div" className="ud-small" placeholder="Role" />
          </div>
        </div>
        {str(props.stat) || edit ? (
          <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid color-mix(in srgb, var(--ud-fg) 18%, transparent)' }}>
            <EditableText edit={edit} path={['stat']} value={str(props.stat)} as="div" className="ud-h2" style={{ fontSize: '2.2rem' }} placeholder="2×" />
            <EditableText edit={edit} path={['statLabel']} value={str(props.statLabel)} as="p" className="ud-small" style={{ marginTop: 4 }} placeholder="Stat label" />
          </div>
        ) : null}
      </div>
    )

    if (str(props.layout, 'split') === 'centered' || !str(props.image)) {
      return (
        <SectionShell props={props} tone="dark" align="center">
          <div style={{ maxWidth: 820, marginInline: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>{copy}</div>
          </div>
        </SectionShell>
      )
    }

    return (
      <SectionShell props={props} tone="dark">
        <div className="ud-split">
          {copy}
          <div className="ud-split__media">
            <Media src={props.image} alt={str(props.name)} ratio="square" edit={editOf(props)} path={['image']} />
          </div>
        </div>
      </SectionShell>
    )
  },
  settings: null,
})
