import type { BlockPreset, Template } from '@uidesired/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { BlockPreviewModal, type BlockPreviewTarget } from '../../components/BlockPreviewModal'
import { adminApi } from '../../lib/endpoints'
import { templatePreviewPath } from '../../lib/templatePreview'
import { Badge, Button, Card, DataTable, EmptyState, Input, Label } from '../../ui/primitives'
import { AdminSearch } from './shared'

const textareaClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500'

export function TemplatesTab() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Template | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const templates = useQuery({ queryKey: ['admin-templates'], queryFn: adminApi.templates })
  const update = useMutation({
    mutationFn: (vars: {
      id: number
      body: { is_active?: boolean; is_featured?: boolean; name?: string; description?: string | null }
    }) => adminApi.updateTemplate(vars.id, vars.body),
    onSuccess: () => {
      setEditing(null)
      qc.invalidateQueries({ queryKey: ['admin-templates'] })
    },
  })

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()
    const list = templates.data || []
    if (!term) return list
    return list.filter((item) =>
      [item.name, item.slug, item.description, item.category?.name].some((value) => String(value || '').toLowerCase().includes(term)),
    )
  }, [templates.data, query])

  return (
    <div className="space-y-4">
      <GenerateTemplateCard onCreated={() => qc.invalidateQueries({ queryKey: ['admin-templates'] })} />
      <Card>
        <AdminSearch value={search} onChange={setSearch} onSubmit={() => setQuery(search)} placeholder="Filter templates…" />
        {rows.length ? (
          <DataTable headers={['Template', 'Category', 'Pages', 'Premium', 'Featured', 'Status', 'Actions']}>
            {rows.map((item: Template) => (
              <tr key={item.id}>
                <td className="py-3 pr-4">
                  <div className="text-zinc-200">{item.name}</div>
                  <div className="text-xs text-zinc-500">{item.slug}</div>
                  {item.description ? <p className="mt-1 max-w-md text-xs text-zinc-500">{item.description}</p> : null}
                </td>
                <td className="py-3 pr-4 text-zinc-400">{item.category?.name ?? '—'}</td>
                <td className="py-3 pr-4 text-zinc-400">{item.page_count ?? item.pages?.length ?? '—'}</td>
                <td className="py-3 pr-4">{item.is_premium ? <Badge tone="warning">premium</Badge> : <Badge>free</Badge>}</td>
                <td className="py-3 pr-4">{item.is_featured ? <Badge tone="info">featured</Badge> : <span className="text-zinc-500">—</span>}</td>
                <td className="py-3 pr-4">
                  <Badge tone={item.is_active === false ? 'danger' : 'success'}>{item.is_active === false ? 'inactive' : 'active'}</Badge>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap gap-2">
                    {item.slug ? (
                      <a
                        href={templatePreviewPath(item.slug)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
                      >
                        <Eye size={14} />
                        Preview
                      </a>
                    ) : null}
                    <Button
                      variant="outline"
                      disabled={update.isPending}
                      onClick={() => {
                        setEditing(item)
                        setEditName(item.name)
                        setEditDescription(item.description || '')
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      disabled={update.isPending}
                      onClick={() => update.mutate({ id: item.id, body: { is_active: item.is_active === false } })}
                    >
                      {item.is_active === false ? 'Activate' : 'Deactivate'}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={update.isPending}
                      onClick={() => update.mutate({ id: item.id, body: { is_featured: !item.is_featured } })}
                    >
                      {item.is_featured ? 'Unfeature' : 'Feature'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        ) : (
          <EmptyState title="No templates" description="Generate one with AI, or seed templates." />
        )}
      </Card>
      {editing ? (
        <Card className="space-y-3">
          <h2 className="font-medium text-white">Edit “{editing.name}”</h2>
          <p className="text-sm text-zinc-500">
            Rename and describe this starter. Page content is edited after a tenant (or you) apply it to a site in the visual builder.
          </p>
          <div>
            <Label>Name</Label>
            <Input value={editName} onChange={(event) => setEditName(event.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <textarea
              className={textareaClass}
              rows={3}
              value={editDescription}
              onChange={(event) => setEditDescription(event.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              disabled={update.isPending || editName.trim().length < 1}
              onClick={() =>
                update.mutate({
                  id: editing.id,
                  body: { name: editName.trim(), description: editDescription.trim() || null },
                })
              }
            >
              {update.isPending ? 'Saving…' : 'Save'}
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  )
}

function GenerateTemplateCard({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [prompt, setPrompt] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const generate = useMutation({
    mutationFn: () =>
      adminApi.generateTemplate({
        name: name.trim() || undefined,
        category: category.trim() || undefined,
        prompt: prompt.trim(),
      }),
    onSuccess: (result) => {
      setNotice(
        `Published “${result.template.name}” with ${result.template.page_count ?? result.template.pages?.length ?? 1} page(s). Tenants can apply it and edit every page in the builder.`,
      )
      setPrompt('')
      onCreated()
    },
  })

  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-blue-400" />
        <h2 className="font-medium text-white">Generate a template with AI</h2>
      </div>
      <p className="text-sm text-zinc-500">
        AI chooses a sitemap (typically 3–5 pages) plus a theme. Tenants apply it, then edit every page and the theme in the visual builder.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Clinic starter" />
        </div>
        <div>
          <Label>Category</Label>
          <Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Healthcare" />
        </div>
      </div>
      <div>
        <Label>Prompt</Label>
        <textarea
          className={textareaClass}
          rows={4}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="A calm neighborhood medical clinic: trust, family care, easy appointments."
        />
      </div>
      {notice ? <p className="text-sm text-emerald-400">{notice}</p> : null}
      {generate.isError ? (
        <p className="text-sm text-red-400">{generate.error instanceof Error ? generate.error.message : 'Generation failed'}</p>
      ) : null}
      <Button disabled={generate.isPending || prompt.trim().length < 8} onClick={() => generate.mutate()}>
        {generate.isPending ? 'Generating…' : 'Generate and publish'}
      </Button>
    </Card>
  )
}

export function BlocksTab() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [preview, setPreview] = useState<BlockPreviewTarget | null>(null)
  const catalog = useQuery({ queryKey: ['admin-blocks'], queryFn: adminApi.blocks })
  const presets = useQuery({ queryKey: ['admin-block-presets'], queryFn: adminApi.blockPresets })
  const update = useMutation({
    mutationFn: (vars: { id: number; body: { is_active?: boolean; is_featured?: boolean } }) =>
      adminApi.updateBlockPreset(vars.id, vars.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-block-presets'] }),
  })
  const remove = useMutation({
    mutationFn: (id: number) => adminApi.deleteBlockPreset(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-block-presets'] }),
  })

  const term = query.trim().toLowerCase()
  const presetRows = (presets.data || []).filter((item) =>
    !term ? true : [item.name, item.block_type, item.category, item.description].some((value) => String(value || '').toLowerCase().includes(term)),
  )
  const blocks = (catalog.data?.blocks || []).filter((block) =>
    !term ? true : [block.type, block.label, block.category].some((value) => value.toLowerCase().includes(term)),
  )

  return (
    <div className="space-y-4">
      <GenerateBlockCard
        types={catalog.data?.blocks || []}
        onCreated={() => qc.invalidateQueries({ queryKey: ['admin-block-presets'] })}
      />
      <Card>
        <h2 className="mb-1 font-medium text-white">Library presets</h2>
        <p className="mb-3 text-sm text-zinc-500">
          Active presets appear in the user editor palette. Click a heading in the canvas to edit it inline.
        </p>
        <AdminSearch value={search} onChange={setSearch} onSubmit={() => setQuery(search)} placeholder="Filter presets and types…" />
        {presetRows.length ? (
          <DataTable headers={['Preset', 'Type', 'Status', 'Actions']}>
            {presetRows.map((item: BlockPreset) => (
              <tr key={item.id}>
                <td className="py-3 pr-4">
                  <button
                    type="button"
                    className="text-left text-zinc-200 hover:text-white"
                    onClick={() =>
                      setPreview({
                        title: item.name,
                        type: item.block_type,
                        subtitle: item.description || undefined,
                        props: item.props,
                      })
                    }
                  >
                    {item.name}
                  </button>
                  <div className="text-xs text-zinc-500">{item.description}</div>
                </td>
                <td className="py-3 pr-4">
                  <Badge>{item.block_type}</Badge>
                </td>
                <td className="py-3 pr-4">
                  <Badge tone={item.is_active === false ? 'danger' : 'success'}>{item.is_active === false ? 'inactive' : 'active'}</Badge>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setPreview({
                          title: item.name,
                          type: item.block_type,
                          subtitle: item.description || undefined,
                          props: item.props,
                        })
                      }
                    >
                      <Eye size={14} />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      disabled={update.isPending}
                      onClick={() => update.mutate({ id: item.id, body: { is_active: item.is_active === false } })}
                    >
                      {item.is_active === false ? 'Activate' : 'Deactivate'}
                    </Button>
                    <Button variant="ghost" disabled={remove.isPending} onClick={() => remove.mutate(item.id)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        ) : (
          <EmptyState title="No library presets yet" description="Generate a block with AI to add it to every tenant editor." />
        )}
      </Card>
      <Card>
        <p className="mb-3 text-sm text-zinc-500">
          Built-in block types
          {catalog.data?.loaded ? ` · ${catalog.data.blocks.length} types` : ' · catalog file missing'}.
        </p>
        {blocks.length ? (
          <DataTable headers={['Type', 'Label', 'Category', 'Version', 'Actions']}>
            {blocks.map((block) => (
              <tr key={block.type}>
                <td className="py-3 pr-4 font-mono text-xs text-zinc-300">{block.type}</td>
                <td className="py-3 pr-4 text-zinc-200">{block.label}</td>
                <td className="py-3 pr-4">
                  <Badge>{block.category}</Badge>
                </td>
                <td className="py-3 pr-4 text-zinc-500">{block.version}</td>
                <td className="py-3 pr-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setPreview({
                        title: block.label,
                        type: block.type,
                        subtitle: block.category,
                      })
                    }
                  >
                    <Eye size={14} />
                    Preview
                  </Button>
                </td>
              </tr>
            ))}
          </DataTable>
        ) : (
          <EmptyState title="No blocks" description="Generate the catalog with pnpm blocks:catalog, or try a different filter." />
        )}
      </Card>
      <BlockPreviewModal target={preview} onClose={() => setPreview(null)} />
    </div>
  )
}

function GenerateBlockCard({
  types,
  onCreated,
}: {
  types: Array<{ type: string; label: string }>
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [prompt, setPrompt] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const generate = useMutation({
    mutationFn: () =>
      adminApi.generateBlock({
        name: name.trim() || undefined,
        type: type || undefined,
        prompt: prompt.trim(),
      }),
    onSuccess: (result) => {
      setNotice(`Published “${result.preset.name}”. It now shows in the user editor library.`)
      setPrompt('')
      onCreated()
    },
  })

  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-blue-400" />
        <h2 className="font-medium text-white">Generate a block with AI</h2>
      </div>
      <p className="text-sm text-zinc-500">
        Fills a real catalog block with copy (or a short related set). Users insert it from the editor, then click text to edit inline.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="SaaS hero" />
        </div>
        <div>
          <Label>Block type</Label>
          <select
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="">Let AI choose</option>
            {types.map((item) => (
              <option key={item.type} value={item.type}>
                {item.label} ({item.type})
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label>Prompt</Label>
        <textarea
          className={textareaClass}
          rows={4}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="A confident SaaS product hero with a start-free button."
        />
      </div>
      {notice ? <p className="text-sm text-emerald-400">{notice}</p> : null}
      {generate.isError ? (
        <p className="text-sm text-red-400">{generate.error instanceof Error ? generate.error.message : 'Generation failed'}</p>
      ) : null}
      <Button disabled={generate.isPending || prompt.trim().length < 3} onClick={() => generate.mutate()}>
        {generate.isPending ? 'Generating…' : 'Generate and publish'}
      </Button>
    </Card>
  )
}
