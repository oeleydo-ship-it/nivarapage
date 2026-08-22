'use client'

import { useState } from 'react'
import { EditableText, editOf } from '../editable'
import { Icon } from '../icons'
import {
  Body,
  Button,
  Card,
  CheckList,
  Heading,
  IconBadge,
  SafeText,
  SectionHead,
  SectionShell,
  bool,
  cx,
  gridStyle,
  items,
  lines,
  num,
  str,
  variantOf,
} from '../primitives'
import { field, gapField, headFields, icon, link, repeater, schema, select, text, toggle } from '../schema'
import { defineBlock } from '../types'

const planFields = [
  text('name', 'Plan name'),
  field('description', 'textarea', 'Short description', 'content'),
  text('price', 'Price'),
  text('priceYearly', 'Yearly price'),
  text('period', 'Billing period'),
  field('features', 'textarea', 'Features (one per line)', 'content'),
  text('buttonLabel', 'Button label'),
  link('buttonUrl', 'Button link'),
  toggle('highlighted', 'Highlight this plan', 'content'),
  text('badge', 'Badge text'),
  icon('icon', 'Plan icon'),
  text('note', 'Footnote'),
]

const threePlans = [
  {
    name: 'Starter',
    description: 'For a single site with everything essential.',
    price: '$29',
    priceYearly: '$24',
    period: '/month',
    features: '1 website\nPlatform subdomain\nForms and submissions\nEmail support',
    buttonLabel: 'Choose Starter',
    buttonUrl: '/signup',
  },
  {
    name: 'Growth',
    description: 'For teams shipping several sites a year.',
    price: '$79',
    priceYearly: '$65',
    period: '/month',
    features: '5 websites\nCustom domains\nRemove platform branding\nPriority support\nRevision history',
    buttonLabel: 'Choose Growth',
    buttonUrl: '/signup',
    highlighted: true,
    badge: 'Most popular',
  },
  {
    name: 'Scale',
    description: 'For agencies and multi-brand teams.',
    price: '$199',
    priceYearly: '$165',
    period: '/month',
    features: 'Unlimited websites\nTeam roles and permissions\nActivity log\nDedicated onboarding',
    buttonLabel: 'Talk to sales',
    buttonUrl: '/contact',
  },
]

const pricingRepeater = repeater('plans', 'Plans', planFields, {
  itemLabel: 'Plan',
  itemDefaults: { name: 'New plan', price: '$0', period: '/month', features: 'Feature one\nFeature two' },
})

const billingFields = [
  toggle('showBillingToggle', 'Monthly / yearly toggle', 'content'),
  text('monthlyLabel', 'Monthly label'),
  text('yearlyLabel', 'Yearly label'),
  text('yearlyNote', 'Yearly note'),
]

function PlanCards({ props, fallback }: { props: Record<string, unknown>; fallback: Record<string, unknown>[] }) {
  const plans = items(props.plans, fallback)
  const edit = editOf(props)
  const [yearly, setYearly] = useState(false)
  const showToggle = bool(props.showBillingToggle, false) && plans.some((plan) => str(plan.priceYearly))
  return (
    <>
      <SectionHead props={props} defaultHeading="Plans" />
      {showToggle ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 26 }}>
          <div
            role="group"
            style={{
              display: 'inline-flex',
              padding: 4,
              gap: 4,
              borderRadius: 999,
              background: 'color-mix(in srgb, var(--ud-fg) 8%, transparent)',
            }}
          >
            {[
              { label: str(props.monthlyLabel, 'Monthly'), value: false, key: 'monthlyLabel' },
              { label: str(props.yearlyLabel, 'Yearly'), value: true, key: 'yearlyLabel' },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setYearly(option.value)}
                style={{
                  border: 0,
                  cursor: 'pointer',
                  padding: '9px 18px',
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: '.9rem',
                  background: yearly === option.value ? 'var(--color-primary)' : 'transparent',
                  color: yearly === option.value ? '#fff' : 'inherit',
                }}
              >
                <EditableText edit={edit} path={[option.key]} value={option.label} placeholder="Label" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {showToggle && (yearly || edit) && (str(props.yearlyNote) || edit) ? (
        <EditableText
          edit={edit}
          path={['yearlyNote']}
          value={str(props.yearlyNote)}
          as="p"
          className="ud-small"
          style={{ textAlign: 'center', marginTop: 10 }}
          placeholder="Yearly note"
        />
      ) : null}
      <Body className="ud-grid" style={gridStyle(Math.min(plans.length, num(props.columns, plans.length)), num(props.gap, 22))}>
        {plans.map((plan, index) => {
          const highlighted = bool(plan.highlighted, false)
          const price = yearly && str(plan.priceYearly) ? str(plan.priceYearly) : str(plan.price, '$0')
          const priceKey = yearly && str(plan.priceYearly) ? 'priceYearly' : 'price'
          return (
            <Card
              key={index}
              className={cx(bool(props.cardGlow, false) && 'ud-card--glow')}
              variant={highlighted ? 'featured' : 'solid'}
              style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <Heading level={4} edit={edit} path={['plans', index, 'name']}>
                  {str(plan.name, 'Plan')}
                </Heading>
                {str(plan.icon) ? <IconBadge name={str(plan.icon)} shape="plain" size="sm" /> : null}
                {str(plan.badge) || edit ? (
                  <EditableText
                    edit={edit}
                    path={['plans', index, 'badge']}
                    value={str(plan.badge)}
                    as="span"
                    className="ud-badge ud-badge--solid"
                    placeholder="Badge"
                  />
                ) : null}
              </div>
              <SafeText
                value={plan.description}
                className="ud-text"
                edit={edit}
                path={['plans', index, 'description']}
                placeholder="Short description"
              />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap', margin: '20px 0 4px' }}>
                <EditableText
                  edit={edit}
                  path={['plans', index, priceKey]}
                  value={price}
                  as="span"
                  className="ud-h2"
                  style={{ fontSize: '2.5rem', color: 'var(--color-primary, inherit)' }}
                  placeholder="$0"
                />
                <EditableText
                  edit={edit}
                  path={['plans', index, 'period']}
                  value={str(plan.period, '/month')}
                  as="span"
                  className="ud-small"
                  placeholder="/month"
                />
              </div>
              <div style={{ marginTop: 20, flex: 1 }}>
                <CheckList values={lines(plan.features)} variant="pills" edit={edit} path={['plans', index, 'features']} />
              </div>
              <div style={{ marginTop: 26 }}>
                <Button
                  href={str(plan.buttonUrl, '#')}
                  variant={highlighted ? variantOf(props.buttonVariant, 'primary') : 'outline'}
                  style={{ width: '100%' }}
                >
                  <EditableText
                    edit={edit}
                    path={['plans', index, 'buttonLabel']}
                    value={str(plan.buttonLabel, 'Choose plan')}
                    placeholder="Button"
                  />
                </Button>
              </div>
              {str(plan.note) || edit ? (
                <EditableText
                  edit={edit}
                  path={['plans', index, 'note']}
                  value={str(plan.note)}
                  as="p"
                  className="ud-small"
                  style={{ textAlign: 'center', marginTop: 14 }}
                  placeholder="No extra hidden charge"
                />
              ) : null}
            </Card>
          )
        })}
      </Body>
    </>
  )
}

/* ------------------------------------------------------ pricing.two_columns */

export const pricingTwo = defineBlock({
  type: 'pricing.two_columns',
  version: 1,
  category: 'pricing',
  label: 'Two-column pricing',
  icon: 'CircleDollarSign',
  defaultProps: {
    eyebrow: 'Pricing',
    heading: 'Simple pricing, no surprises',
    description: 'Start free, upgrade when your site goes live.',
    textAlign: 'center',
    showBillingToggle: true,
    monthlyLabel: 'Monthly',
    yearlyLabel: 'Yearly',
    yearlyNote: 'Two months free when billed yearly.',
    plans: threePlans.slice(0, 2),
  },
  schema: schema(
    ...headFields,
    pricingRepeater,
    ...billingFields,
    gapField,
    toggle('cardGlow', 'Glow on cards', 'design'),
    select('buttonVariant', 'Button style', ['primary', 'secondary', 'accent'], 'design'),
  ),
  component: (props) => (
    <SectionShell props={props} tone="default">
      <PlanCards props={props} fallback={threePlans.slice(0, 2)} />
    </SectionShell>
  ),
  settings: null,
})

/* ---------------------------------------------------- pricing.three_columns */

export const pricingThree = defineBlock({
  type: 'pricing.three_columns',
  version: 1,
  category: 'pricing',
  label: 'Three-column pricing',
  icon: 'BadgeDollarSign',
  defaultProps: {
    eyebrow: 'Pricing',
    heading: 'Pick the plan that fits',
    description: 'Every plan includes the full block library and unlimited pages.',
    textAlign: 'center',
    tone: 'surface',
    showBillingToggle: true,
    monthlyLabel: 'Monthly',
    yearlyLabel: 'Yearly',
    yearlyNote: 'Save ~17% when billed yearly.',
    plans: threePlans,
  },
  schema: schema(
    ...headFields,
    pricingRepeater,
    ...billingFields,
    gapField,
    toggle('cardGlow', 'Glow on cards', 'design'),
    select('buttonVariant', 'Button style', ['primary', 'secondary', 'accent'], 'design'),
  ),
  component: (props) => (
    <SectionShell props={props} tone="surface">
      <PlanCards props={props} fallback={threePlans} />
    </SectionShell>
  ),
  settings: null,
})

/* ------------------------------------------------------- pricing.comparison */

const comparisonRows = [
  { label: 'Websites', starter: '1', growth: '5', scale: 'Unlimited' },
  { label: 'Custom domain', starter: 'no', growth: 'yes', scale: 'yes' },
  { label: 'Remove branding', starter: 'no', growth: 'yes', scale: 'yes' },
  { label: 'Revision history', starter: '7 days', growth: '90 days', scale: 'Unlimited' },
  { label: 'Team members', starter: '1', growth: '5', scale: 'Unlimited' },
  { label: 'Priority support', starter: 'no', growth: 'yes', scale: 'yes' },
]

function Cell({
  value,
  edit,
  path,
}: {
  value: string
  edit?: ReturnType<typeof editOf>
  path?: Array<string | number>
}) {
  if (edit && path) {
    return <EditableText edit={edit} path={path} value={value} as="span" placeholder="yes" />
  }
  const normalized = value.trim().toLowerCase()
  if (normalized === 'yes' || normalized === 'true' || normalized === '✓') return <Icon name="check" />
  if (normalized === 'no' || normalized === 'false' || normalized === '-') return <span style={{ opacity: 0.4 }}>—</span>
  return <>{value}</>
}

export const pricingComparison = defineBlock({
  type: 'pricing.comparison',
  version: 1,
  category: 'pricing',
  label: 'Comparison table',
  icon: 'Table',
  defaultProps: {
    eyebrow: 'Compare',
    heading: 'Everything side by side',
    description: 'Use “yes” or “no” in a cell to render a tick or a dash.',
    textAlign: 'center',
    columnHeadings: 'Starter\nGrowth\nScale',
    rows: comparisonRows,
    highlightColumn: 2,
    footerNote: 'All plans include SSL, forms, and unlimited pages.',
  },
  schema: schema(
    ...headFields,
    field('columnHeadings', 'textarea', 'Column headings (one per line)', 'content'),
    repeater(
      'rows',
      'Rows',
      [text('label', 'Feature'), text('starter', 'Column 1'), text('growth', 'Column 2'), text('scale', 'Column 3'), text('extra', 'Column 4')],
      { itemLabel: 'Row', itemDefaults: { label: 'New feature', starter: 'no', growth: 'yes', scale: 'yes' } },
    ),
    field('highlightColumn', 'slider', 'Highlight column', 'design', { min: 0, max: 4 }),
    text('footerNote', 'Footer note'),
  ),
  component: (props) => {
    const headings = lines(props.columnHeadings, ['Starter', 'Growth', 'Scale'])
    const rows = items(props.rows, comparisonRows)
    const highlight = num(props.highlightColumn, 0)
    const keys = ['starter', 'growth', 'scale', 'extra']
    const edit = editOf(props)
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} defaultHeading="Compare plans" />
        <Body>
          <div className="ud-table-wrap">
            <table className="ud-table">
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  {headings.map((heading, index) => (
                    <th
                      key={`${heading}-${index}`}
                      scope="col"
                      style={
                        highlight === index + 1
                          ? { background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' }
                          : undefined
                      }
                    >
                      <EditableText
                        edit={edit}
                        path={['columnHeadings']}
                        value={heading}
                        as="span"
                        placeholder="Plan"
                        transform={(text) => headings.map((entry, position) => (position === index ? text : entry)).join('\n')}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <th scope="row" style={{ fontWeight: 500 }}>
                      <EditableText edit={edit} path={['rows', rowIndex, 'label']} value={str(row.label)} placeholder="Feature" />
                    </th>
                    {headings.map((_, index) => (
                      <td
                        key={index}
                        style={
                          highlight === index + 1
                            ? { background: 'color-mix(in srgb, var(--color-primary) 6%, transparent)' }
                            : undefined
                        }
                      >
                        <Cell value={str(row[keys[index]])} edit={edit} path={['rows', rowIndex, keys[index]]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {str(props.footerNote) || edit ? (
            <EditableText
              edit={edit}
              path={['footerNote']}
              value={str(props.footerNote)}
              as="p"
              className="ud-small"
              style={{ marginTop: 16 }}
              placeholder="Footer note"
            />
          ) : null}
        </Body>
      </SectionShell>
    )
  },
  settings: null,
})
