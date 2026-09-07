import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2, Upload } from 'lucide-react'
import { mediaApi } from '../lib/endpoints'
import { Button } from '../ui/primitives'
import { MediaPicker } from './MediaLibrary'

const MAX_IMAGES = 9
const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml'
export function ProductMediaEditor({ cover, gallery, onChange, onBusyChange }: {
  cover: string; gallery: string[]; onChange: (cover: string, gallery: string[]) => void; onBusyChange?: (busy: boolean) => void
}) {
  const images = [...new Set([cover, ...gallery].filter(Boolean))]
  const [selected, setSelected] = useState(0)
  const [picker, setPicker] = useState<number | 'add' | null>(null)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState('')
  const [notice, setNotice] = useState('')
  const busy = !!progress
  const busyRef = useRef(false)
  const input = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()
  const active = Math.min(selected, Math.max(0, images.length - 1))
  function commit(next: string[], focus = 0) {
    const unique = [...new Set(next.filter(Boolean))].slice(0, MAX_IMAGES)
    onChange(unique[0] || '', unique.slice(1))
    setSelected(Math.min(focus, Math.max(0, unique.length - 1)))
  }
  function move(from: number, to: number) {
    if (busy || to < 0 || to >= images.length) return
    const next = [...images]
    const [image] = next.splice(from, 1)
    next.splice(to, 0, image)
    commit(next, to)
  }
  async function upload(files: File[]) {
    if (busyRef.current || !files.length) return
    const room = MAX_IMAGES - images.length
    const valid = files.filter((file) => ACCEPT.split(',').includes(file.type) && file.size <= 50 * 1024 * 1024)
    const queue = valid.slice(0, room)
    const warnings: string[] = []
    if (valid.length < files.length) warnings.push('Some files were skipped. Use JPG, PNG, WebP, AVIF, GIF or SVG images up to 50 MB each.')
    if (valid.length > room) warnings.push('A product can have up to 9 images. Extra files were skipped.')
    if (!queue.length) { setNotice(warnings.join(' ') || 'This product already has 9 images.'); return }
    busyRef.current = true; onBusyChange?.(true); setNotice('')
    const next = [...images]
    try {
      for (const [index, file] of queue.entries()) {
        setProgress(`Uploading ${index + 1} of ${queue.length}`)
        try {
          const item = await mediaApi.upload(file)
          if (!item.url) throw new Error('The uploaded image has no URL. Please try again.')
          next.push(item.url)
        }
        catch (error) { warnings.push(`${file.name}: ${error instanceof Error ? error.message : 'Upload failed.'}`) }
      }
      commit(next, images.length)
      void qc.invalidateQueries({ queryKey: ['media'] })
      setNotice(warnings.join(' ') || `${next.length - images.length} image${next.length - images.length === 1 ? '' : 's'} uploaded. Save the product to apply your changes.`)
    } finally { busyRef.current = false; setProgress(''); onBusyChange?.(false) }
  }
  return <section aria-label="Product images" className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
      <div><h3 className="text-sm font-semibold text-zinc-900">Product images</h3><p className="mt-1 text-xs text-zinc-500">Your first image is the cover shown on product cards.</p></div>
      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">{images.length} / {MAX_IMAGES} images</span>
    </div>
    <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div>
        <div className="relative flex aspect-square max-h-96 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
          {images[active] ? <img src={images[active]} alt={active === 0 ? 'Product cover preview' : `Product gallery preview ${active}`} className="h-full w-full object-contain p-4" /> : <div className="text-center text-zinc-400"><ImagePlus size={44} className="mx-auto mb-3" /><p className="text-sm">Show your product at its best</p></div>}
          {images.length ? <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-medium shadow-sm">{active === 0 ? 'Cover image' : `Gallery image ${active}`}</span> : null}
        </div>
        {images.length ? <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" disabled={busy} onClick={() => setPicker(active)}>Replace image</Button>
          {active > 0 ? <Button type="button" variant="outline" disabled={busy} onClick={() => move(active, 0)}><Star size={14} /> Make cover</Button> : null}
          <button type="button" disabled={busy} onClick={() => commit(images.filter((_, i) => i !== active), active)} className="ml-auto rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40" aria-label="Remove selected image"><Trash2 size={16} /></button>
        </div> : null}
      </div>
      <div className="min-w-0 space-y-4">
        <div className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${dragging ? 'border-blue-500 bg-blue-50' : 'border-zinc-200 bg-zinc-50/50'}`}
          onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true) }} onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); void upload(Array.from(event.dataTransfer.files)) }}>
          {busy ? <Loader2 size={28} className="mx-auto mb-3 animate-spin text-blue-600" /> : <Upload size={28} className="mx-auto mb-3 text-zinc-400" />}
          <p className="text-sm font-medium text-zinc-800">{busy ? progress : 'Drop product images here'}</p>
          <p className="mt-1 text-xs text-zinc-500">Upload multiple images together, or choose existing media.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button type="button" disabled={busy || images.length >= MAX_IMAGES} onClick={() => input.current?.click()}>Upload images</Button>
            <Button type="button" variant="outline" disabled={busy || images.length >= MAX_IMAGES} onClick={() => setPicker('add')}>Media library</Button>
          </div>
          <input ref={input} type="file" accept={ACCEPT} multiple className="sr-only" aria-label="Upload product images" disabled={busy} onChange={(event) => { void upload(Array.from(event.target.files || [])); event.target.value = '' }} />
          <p className="mt-3 text-[11px] text-zinc-400">JPG, PNG, WebP, AVIF, GIF, SVG · Up to 50 MB each</p>
        </div>
        {images.length ? <>
          <div className="flex items-center justify-between"><p className="text-xs font-medium text-zinc-700">Display order</p><p className="text-[11px] text-zinc-500">Select an image to manage it</p></div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{images.map((url, index) => <button type="button" key={url} disabled={busy} aria-label={`Select ${index === 0 ? 'cover image' : `gallery image ${index}`}`} aria-pressed={active === index} onClick={() => setSelected(index)} className={`relative aspect-square overflow-hidden rounded-lg border-2 bg-zinc-50 ${active === index ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent hover:border-zinc-300'}`}>
            <img src={url} alt="" className="h-full w-full object-contain p-1" /><span className="absolute bottom-1 left-1 rounded bg-white/95 px-1.5 py-0.5 text-[10px] font-medium">{index === 0 ? 'Cover' : index + 1}</span>
          </button>)}</div>
          <div className="flex gap-2"><Button type="button" variant="outline" disabled={busy || active === 0} onClick={() => move(active, active - 1)}><ArrowLeft size={14} /> Move earlier</Button><Button type="button" variant="outline" disabled={busy || active === images.length - 1} onClick={() => move(active, active + 1)}>Move later <ArrowRight size={14} /></Button></div>
          <p className="text-[11px] text-zinc-500">Removing an image here keeps the original in your media library.</p>
        </> : null}
      </div>
    </div>
    {notice || busy ? <p role="status" className="border-t border-zinc-100 bg-zinc-50 px-5 py-3 text-xs text-zinc-600">{busy ? progress : notice}</p> : null}
    {picker !== null ? <MediaPicker dialogOnly kind="image" value={typeof picker === 'number' ? images[picker] : undefined} onClose={() => setPicker(null)} onChange={(url) => {
      if (url) { const next = [...images]; if (picker === 'add') next.push(url); else next[picker] = url; commit(next, picker === 'add' ? next.length - 1 : picker) }
      setPicker(null)
    }} /> : null}
  </section>
}
