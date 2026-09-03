import type { ThemeTokens } from '@uidesired/types'
import { fontCatalogGroups, quoteFontStack } from '@uidesired/blocks/theme'
import { defaultThemeTokens } from '@uidesired/design-system'
import { X } from 'lucide-react'
import { useState } from 'react'
import { LiveColorInput } from './LiveColorInput'
import { Button, Input, Label } from '../ui/primitives'

function previewThemeColor(key: string, color: string) {
  const canvas = document.querySelector<HTMLElement>('[data-canvas-scroll] .canvas-theme')
  if (!canvas || !color) return
  canvas.style.setProperty(`--color-${key}`, color)
}

const COLOR_KEYS: Array<keyof ThemeTokens> = ['primary', 'secondary', 'accent', 'background', 'surface', 'text', 'muted']

const PRESETS: Array<{ name: string; tokens: Partial<ThemeTokens> }> = [
  {
    name: 'Studio blue',
    tokens: { primary: '#2563eb', secondary: '#0f172a', accent: '#f59e0b', background: '#ffffff', surface: '#f8fafc', text: '#0f172a', muted: '#64748b' },
  },
  {
    name: 'Harbour',
    tokens: { primary: '#0f766e', secondary: '#12211f', accent: '#f97316', background: '#fffdf8', surface: '#f3f6f4', text: '#12211f', muted: '#5c706c' },
  },
  {
    name: 'Ink',
    tokens: { primary: '#111827', secondary: '#1f2937', accent: '#6366f1', background: '#ffffff', surface: '#f4f4f5', text: '#111827', muted: '#6b7280' },
  },
  {
    name: 'Sunset',
    tokens: { primary: '#e11d48', secondary: '#3b0a1f', accent: '#fbbf24', background: '#fffbfb', surface: '#fdf2f4', text: '#3b0a1f', muted: '#8b5f6b' },
  },
  {
    name: 'Forest',
    tokens: { primary: '#166534', secondary: '#132a1c', accent: '#eab308', background: '#ffffff', surface: '#f2f7f3', text: '#132a1c', muted: '#5b7263' },
  },
]

const FONT_GROUPS = fontCatalogGroups()

function Numberish({
  label,
  value,
  onChange,
  suffix = 'px',
  min = 0,
  max = 200,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  suffix?: string
  min?: number
  max?: number
}) {
  const numeric = Number(String(value).replace(/[^\d.]/g, '')) || 0
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-[11px] text-zinc-500">{value}</span>
      </div>
      <input
        type="range"
        className="w-full accent-blue-500"
        min={min}
        max={max}
        value={numeric}
        onChange={(event) => onChange(`${event.target.value}${suffix}`)}
      />
    </div>
  )
}

export function ThemePanel({
  theme,
  onChange,
  onSave,
  onClose,
}: {
  theme: ThemeTokens
  onChange: (patch: Partial<ThemeTokens>) => void
  onSave: () => Promise<void> | void
  onClose: () => void
}) {
  const [saving, setSaving] = useState(false)
  const value = (key: keyof ThemeTokens) => String(theme[key] ?? '')

  return (
    <div className="absolute inset-0 z-30 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="flex h-full w-96 flex-col border-l border-zinc-800 bg-zinc-950"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <h2 className="font-medium text-white">Theme</h2>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
          <section>
            <Label>Presets</Label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => onChange(preset.tokens)}
                  className="flex items-center gap-2 rounded-lg border border-zinc-800 px-2 py-1.5 text-left text-xs text-zinc-200 hover:border-blue-500"
                >
                  <span className="flex gap-0.5">
                    {['primary', 'secondary', 'accent'].map((key) => (
                      <span
                        key={key}
                        className="h-3.5 w-3.5 rounded-full"
                        style={{ background: String((preset.tokens as Record<string, unknown>)[key]) }}
                      />
                    ))}
                  </span>
                  {preset.name}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <Label>Colors</Label>
            {COLOR_KEYS.map((key) => (
              <div key={String(key)} className="flex items-center gap-2">
                <LiveColorInput
                  className="h-8 w-9 shrink-0 cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950"
                  value={value(key)}
                  fallback="#000000"
                  onPreview={(hex) => previewThemeColor(String(key), hex)}
                  onCommit={(hex) => onChange({ [key]: hex } as Partial<ThemeTokens>)}
                />
                <span className="w-20 text-xs capitalize text-zinc-400">{String(key)}</span>
                <Input value={value(key)} onChange={(event) => onChange({ [key]: event.target.value } as Partial<ThemeTokens>)} />
              </div>
            ))}
          </section>

          <section className="space-y-2">
            <Label>Light background</Label>
            <p className="text-xs text-zinc-500">Shown when visitors use the dark / light switcher. Leave empty to hide it.</p>
            {(
              [
                ['lightBackground', 'Background'],
                ['lightSurface', 'Surface'],
                ['lightText', 'Text'],
                ['lightMuted', 'Muted'],
                ['lightSecondary', 'Secondary'],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <LiveColorInput
                  className="h-8 w-9 shrink-0 cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950"
                  value={value(key)}
                  fallback="#ffffff"
                  onPreview={(hex) => previewThemeColor(key, hex)}
                  onCommit={(hex) => onChange({ [key]: hex } as Partial<ThemeTokens>)}
                />
                <span className="w-20 text-xs text-zinc-400">{label}</span>
                <Input value={value(key)} onChange={(event) => onChange({ [key]: event.target.value } as Partial<ThemeTokens>)} />
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <Label>Typography</Label>
            {(['headingFont', 'bodyFont', 'monoFont', 'serifFont'] as const).map((key) => (
              <div key={key}>
                <Label>{key === 'headingFont' ? 'Heading font' : key === 'bodyFont' ? 'Body font' : key === 'monoFont' ? 'Mono / label font' : 'Serif / editorial font'}</Label>
                <select
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  value={value(key)}
                  onChange={(event) => onChange({ [key]: event.target.value } as Partial<ThemeTokens>)}
                  style={{ fontFamily: quoteFontStack(value(key) || 'Inter, system-ui, sans-serif') }}
                >
                  {FONT_GROUPS.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.fonts.map((font) => (
                        <option key={font.stack} value={font.stack} style={{ fontFamily: quoteFontStack(font.stack) }}>
                          {font.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  {value(key) && !FONT_GROUPS.some((group) => group.fonts.some((font) => font.stack === value(key))) ? (
                    <option value={value(key)}>{value(key).split(',')[0]}</option>
                  ) : null}
                </select>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              {(['headingWeight', 'bodyWeight'] as const).map((key) => (
                <div key={key}>
                  <Label>{key === 'headingWeight' ? 'Heading weight' : 'Body weight'}</Label>
                  <select
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                    value={value(key)}
                    onChange={(event) => onChange({ [key]: Number(event.target.value) } as Partial<ThemeTokens>)}
                  >
                    {[300, 400, 500, 600, 700, 800, 900].map((weight) => (
                      <option key={weight} value={weight}>
                        {weight}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <Numberish
              label="Text size"
              value={value('textScale') || '100%'}
              suffix="%"
              min={80}
              max={140}
              onChange={(next) => onChange({ textScale: next })}
            />
          </section>

          <section className="space-y-3">
            <Label>Shape and rhythm</Label>
            <Numberish label="Button radius" value={value('buttonRadius')} max={40} onChange={(next) => onChange({ buttonRadius: next })} />
            <Numberish label="Card radius" value={value('cardRadius')} max={40} onChange={(next) => onChange({ cardRadius: next })} />
            <Numberish
              label="Container width"
              value={value('containerWidth')}
              min={880}
              max={1600}
              onChange={(next) => onChange({ containerWidth: next })}
            />
            <Numberish
              label="Section spacing"
              value={value('sectionSpacing')}
              min={24}
              max={180}
              onChange={(next) => onChange({ sectionSpacing: next })}
            />
          </section>
        </div>

        <div className="flex items-center gap-2 border-t border-zinc-800 p-4">
          <Button
            disabled={saving}
            onClick={async () => {
              setSaving(true)
              try {
                await onSave()
              } finally {
                setSaving(false)
              }
            }}
          >
            {saving ? 'Saving…' : 'Save theme'}
          </Button>
          <Button variant="ghost" onClick={() => onChange(defaultThemeTokens)}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
