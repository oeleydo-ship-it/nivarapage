import type { Page } from '@uidesired/types'
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { createId } from '@uidesired/utilities'
import { SiteSubnav } from '../components/SiteChrome'
import { menusApi, pagesApi } from '../lib/endpoints'
import { Button, Input, Label, PageHeader } from '../ui/primitives'

type MenuItemDraft = {
  key: string
  type: 'page' | 'url' | 'anchor'
  label: string
  url: string
  page_id: number | null
  target: '_self' | '_blank'
  children: MenuItemDraft[]
}

type MenuDraft = {
  id?: number
  name: string
  location: string
  items: MenuItemDraft[]
}

function fromApi(item: Record<string, unknown>): MenuItemDraft {
  return {
    key: createId('nav'),
    type: (item.type as MenuItemDraft['type']) || 'page',
    label: String(item.label || ''),
    url: String(item.url || ''),
    page_id: typeof item.page_id === 'number' ? item.page_id : null,
    target: item.target === '_blank' ? '_blank' : '_self',
    children: Array.isArray(item.children) ? item.children.map((child) => fromApi(child as Record<string, unknown>)) : [],
  }
}

function toApi(item: MenuItemDraft): Record<string, unknown> {
  return {
    type: item.type,
    label: item.label,
    url: item.url,
    page_id: item.type === 'page' ? item.page_id : null,
    target: item.target,
    children: item.children.map(toApi),
  }
}

function emptyItem(): MenuItemDraft {
  return {
    key: createId('nav'),
    type: 'page',
    label: 'New link',
    url: '',
    page_id: null,
    target: '_self',
    children: [],
  }
}

function SortableItem({
  item,
  pages,
  onChange,
  onRemove,
}: {
  item: MenuItemDraft
  pages: Page[]
  onChange: (next: MenuItemDraft) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.key })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-xl border border-zinc-800 bg-zinc-950 p-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="text-zinc-500" {...attributes} {...listeners}>
          <GripVertical size={16} />
        </button>
        <Input className="max-w-[160px]" value={item.label} onChange={(e) => onChange({ ...item, label: e.target.value })} />
        <select
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
          value={item.type}
          onChange={(e) => onChange({ ...item, type: e.target.value as MenuItemDraft['type'] })}
        >
          <option value="page">Page</option>
          <option value="url">External URL</option>
          <option value="anchor">Anchor</option>
        </select>
        {item.type === 'page' ? (
          <select
            className="min-w-[140px] rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
            value={item.page_id ?? ''}
            onChange={(e) => onChange({ ...item, page_id: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">Select page</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        ) : (
          <Input
            className="max-w-[220px]"
            placeholder={item.type === 'anchor' ? '#section' : 'https://'}
            value={item.url}
            onChange={(e) => onChange({ ...item, url: e.target.value })}
          />
        )}
        <select
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
          value={item.target}
          onChange={(e) => onChange({ ...item, target: e.target.value as '_self' | '_blank' })}
        >
          <option value="_self">Same tab</option>
          <option value="_blank">New tab</option>
        </select>
        <Button variant="ghost" onClick={() => onChange({ ...item, children: [...item.children, emptyItem()] })}>
          <Plus size={14} /> Submenu
        </Button>
        <Button variant="danger" onClick={onRemove}>
          <Trash2 size={14} />
        </Button>
      </div>
      {item.children.length ? (
        <div className="mt-3 ml-6 space-y-2 border-l border-zinc-800 pl-3">
          {item.children.map((child, index) => (
            <div key={child.key} className="flex flex-wrap items-center gap-2">
              <Input className="max-w-[140px]" value={child.label} onChange={(e) => {
                const children = [...item.children]
                children[index] = { ...child, label: e.target.value }
                onChange({ ...item, children })
              }} />
              <select
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
                value={child.type}
                onChange={(e) => {
                  const children = [...item.children]
                  children[index] = { ...child, type: e.target.value as MenuItemDraft['type'] }
                  onChange({ ...item, children })
                }}
              >
                <option value="page">Page</option>
                <option value="url">URL</option>
                <option value="anchor">Anchor</option>
              </select>
              {child.type === 'page' ? (
                <select
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
                  value={child.page_id ?? ''}
                  onChange={(e) => {
                    const children = [...item.children]
                    children[index] = { ...child, page_id: e.target.value ? Number(e.target.value) : null }
                    onChange({ ...item, children })
                  }}
                >
                  <option value="">Page</option>
                  {pages.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              ) : (
                <Input
                  className="max-w-[180px]"
                  value={child.url}
                  onChange={(e) => {
                    const children = [...item.children]
                    children[index] = { ...child, url: e.target.value }
                    onChange({ ...item, children })
                  }}
                />
              )}
              <Button variant="danger" onClick={() => onChange({ ...item, children: item.children.filter((c) => c.key !== child.key) })}>
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function NavigationPage() {
  const { id } = useParams()
  const qc = useQueryClient()
  const pages = useQuery({ queryKey: ['pages', id], queryFn: () => pagesApi.list(id!) })
  const menusQuery = useQuery({ queryKey: ['menus', id], queryFn: () => menusApi.get(id!) })
  const [menu, setMenu] = useState<MenuDraft | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  useEffect(() => {
    const raw = menusQuery.data as MenuDraft[] | undefined
    if (!raw?.length) return
    const first = raw[0]
    setMenu({
      id: first.id,
      name: first.name || 'Main',
      location: first.location || 'header',
      items: (first.items || []).map((item) => fromApi(item as unknown as Record<string, unknown>)),
    })
  }, [menusQuery.data])

  const save = useMutation({
    mutationFn: () => {
      if (!menu) return Promise.resolve(null)
      return menusApi.update(id!, [{ id: menu.id, name: menu.name, location: menu.location, items: menu.items.map(toApi) }])
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus', id] }),
  })

  function onDragEnd(event: DragEndEvent) {
    if (!menu) return
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = menu.items.findIndex((i) => i.key === active.id)
    const newIndex = menu.items.findIndex((i) => i.key === over.id)
    setMenu({ ...menu, items: arrayMove(menu.items, oldIndex, newIndex) })
  }

  return (
    <div>
      <PageHeader
        title="Navigation"
        description="Header and footer links visitors use to move around the site."
        actions={
          <div className="flex gap-2">
            <Link to={`/sites/${id}/builder`} className="text-sm text-blue-400">
              Open builder
            </Link>
            <Button onClick={() => save.mutate()} disabled={!menu || save.isPending}>
              Save menu
            </Button>
          </div>
        }
      />
      <SiteSubnav />
      {menu ? (
        <div className="space-y-4">
          <div className="grid max-w-xl grid-cols-2 gap-3">
            <div>
              <Label>Menu name</Label>
              <Input value={menu.name} onChange={(e) => setMenu({ ...menu, name: e.target.value })} />
            </div>
            <div>
              <Label>Location</Label>
              <select
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                value={menu.location}
                onChange={(e) => setMenu({ ...menu, location: e.target.value })}
              >
                <option value="header">Header</option>
                <option value="footer">Footer</option>
              </select>
            </div>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={menu.items.map((i) => i.key)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {menu.items.map((item, index) => (
                  <SortableItem
                    key={item.key}
                    item={item}
                    pages={pages.data || []}
                    onChange={(next) => {
                      const items = [...menu.items]
                      items[index] = next
                      setMenu({ ...menu, items })
                    }}
                    onRemove={() => setMenu({ ...menu, items: menu.items.filter((i) => i.key !== item.key) })}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <Button variant="outline" onClick={() => setMenu({ ...menu, items: [...menu.items, emptyItem()] })}>
            Add item
          </Button>
          {save.isSuccess ? <p className="text-sm text-emerald-400">Menu saved. Navbars and the live site use this structure.</p> : null}
        </div>
      ) : (
        <p className="text-zinc-500">Loading menu…</p>
      )}
    </div>
  )
}
