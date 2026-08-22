import { BLOG_STATUSES, type BlogPost, type BlogStatus, type Site } from '@uidesired/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ExternalLink, Newspaper, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { MediaPicker } from '../components/MediaLibrary'
import { RichTextEditor } from '../components/RichTextEditor'
import { relativeTime } from '../components/SiteCard'
import { blogApi, sitesApi } from '../lib/endpoints'
import { liveUrl } from '../lib/siteUrls'
import { Badge, Button, Card, EmptyState, Input, Label, PageHeader, Select, type BadgeTone } from '../ui/primitives'

const textareaClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500'

const STATUS_FILTERS = [{ value: 'all', label: 'All statuses' }, ...BLOG_STATUSES.map((value) => ({ value, label: labelStatus(value) }))] as const

function labelStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function statusTone(status: string): BadgeTone {
  if (status === 'published') return 'success'
  if (status === 'draft') return 'warning'
  return 'neutral'
}

function hashHue(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  return hash % 360
}

function postLiveUrl(post: BlogPost): string | null {
  return liveUrl(post.site as Site | undefined, post.path || `/blog/${post.slug}`)
}

export function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const siteFilter = searchParams.get('site') || 'all'
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]['value']>('all')
  const [creating, setCreating] = useState(false)

  const sitesQuery = useQuery({ queryKey: ['sites'], queryFn: sitesApi.list })
  const postsQuery = useQuery({
    queryKey: ['blog-posts', siteFilter, status],
    queryFn: () =>
      blogApi.list({
        site_id: siteFilter !== 'all' ? siteFilter : undefined,
        status: status !== 'all' ? status : undefined,
      }),
  })

  const sites = sitesQuery.data || []
  const posts = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (postsQuery.data || []).filter((post) => {
      if (!q) return true
      return [post.title, post.excerpt, post.slug, post.category, post.site?.name].some((value) =>
        (value || '').toLowerCase().includes(q),
      )
    })
  }, [postsQuery.data, search])

  const publishedCount = (postsQuery.data || []).filter((post) => post.status === 'published').length

  return (
    <div>
      <PageHeader
        title="Blog"
        description={
          postsQuery.isPending
            ? 'Loading posts…'
            : `${posts.length} post${posts.length === 1 ? '' : 's'} · ${publishedCount} published`
        }
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} />
            New post
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search size={15} className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-zinc-500" />
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pr-3 pl-9 text-sm text-zinc-100 outline-none focus:border-blue-500"
            placeholder="Search by title, excerpt, or category…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search posts"
          />
        </div>
        <Select
          value={siteFilter}
          onChange={(event) => {
            const next = event.target.value
            const params = new URLSearchParams(searchParams)
            if (next === 'all') params.delete('site')
            else params.set('site', next)
            setSearchParams(params, { replace: true })
          }}
          aria-label="Filter by website"
        >
          <option value="all">All websites</option>
          {sites.map((site) => (
            <option key={site.id} value={String(site.id)}>
              {site.name}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} aria-label="Filter by status">
          {STATUS_FILTERS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
      </div>

      {postsQuery.isPending ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="h-40 animate-pulse bg-zinc-900">
              <span className="sr-only">Loading posts</span>
            </Card>
          ))}
        </div>
      ) : posts.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<Newspaper size={28} className="text-zinc-600" />}
            title="No blog posts yet"
            description="Create a post and pick the website it should appear on. Published posts show on that site’s /blog page."
          >
            <Button onClick={() => setCreating(true)}>
              <Plus size={16} />
              New post
            </Button>
          </EmptyState>
        </Card>
      )}

      {creating ? (
        <CreatePostModal
          sites={sites}
          defaultSiteId={siteFilter !== 'all' ? siteFilter : ''}
          onClose={() => setCreating(false)}
        />
      ) : null}
    </div>
  )
}

function PostCard({ post }: { post: BlogPost }) {
  const hue = hashHue(`${post.site_id}:${post.title}`)
  const updated = relativeTime(post.updated_at || post.created_at)
  const url = postLiveUrl(post)

  return (
    <Link to={`/blog/${post.id}`} className="block">
      <Card className="h-full transition hover:border-zinc-700">
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
            style={{ background: `hsl(${hue} 45% 28%)` }}
          >
            {(post.title.trim()[0] || 'P').toUpperCase()}
          </div>
          <Badge tone={statusTone(post.status)}>{labelStatus(post.status)}</Badge>
        </div>
        <h2 className="mt-3 text-lg font-medium text-white">{post.title}</h2>
        {post.excerpt ? <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{post.excerpt}</p> : null}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
          <span className="text-zinc-300">{post.site?.name || 'Unassigned site'}</span>
          {post.category ? <span>{post.category}</span> : null}
          {updated ? <span>Updated {updated}</span> : null}
        </div>
        {post.status === 'published' && url ? (
          <p className="mt-2 truncate text-xs text-zinc-600">{url.replace(/^https?:\/\//, '')}</p>
        ) : null}
      </Card>
    </Link>
  )
}

function CreatePostModal({
  sites,
  defaultSiteId,
  onClose,
}: {
  sites: Site[]
  defaultSiteId: string
  onClose: () => void
}) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [siteId, setSiteId] = useState(defaultSiteId || (sites[0] ? String(sites[0].id) : ''))
  const [excerpt, setExcerpt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const create = useMutation({
    mutationFn: () =>
      blogApi.create({
        site_id: Number(siteId),
        title: title.trim(),
        excerpt: excerpt.trim() || null,
      }),
    onSuccess: (post) => {
      qc.invalidateQueries({ queryKey: ['blog-posts'] })
      qc.invalidateQueries({ queryKey: ['overview'] })
      onClose()
      navigate(`/blog/${post.id}`)
    },
    onError: (err: Error) => setError(err.message),
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim() || !siteId) return
    create.mutate()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose} role="presentation">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-title"
        className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="create-post-title" className="text-lg font-medium text-white">
              New blog post
            </h2>
            <p className="mt-1 text-sm text-zinc-500">Choose the website this article should appear on.</p>
          </div>
          <Button type="button" variant="ghost" onClick={onClose} aria-label="Close">
            <X size={16} />
          </Button>
        </div>
        <div className="space-y-3">
          <div>
            <Label>Website</Label>
            <Select className="w-full" value={siteId} onChange={(event) => setSiteId(event.target.value)} required>
              <option value="" disabled>
                Select a website
              </option>
              {sites.map((site) => (
                <option key={site.id} value={String(site.id)}>
                  {site.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Shipping the first page" required />
          </div>
          <div>
            <Label>Excerpt</Label>
            <textarea className={textareaClass} rows={3} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} />
          </div>
        </div>
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim() || !siteId || create.isPending}>
            {create.isPending ? 'Saving…' : 'Create post'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export function BlogPostDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const postQuery = useQuery({
    queryKey: ['blog-post', id],
    queryFn: () => blogApi.get(id!),
    enabled: Boolean(id),
  })
  const sitesQuery = useQuery({ queryKey: ['sites'], queryFn: sitesApi.list })
  const post = postQuery.data

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [siteId, setSiteId] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [cover, setCover] = useState('')
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [status, setStatus] = useState<BlogStatus>('draft')

  useEffect(() => {
    if (!post) return
    setTitle(post.title || '')
    setSlug(post.slug || '')
    setSiteId(String(post.site_id))
    setExcerpt(post.excerpt || '')
    setBody(post.body || '')
    setCover(post.cover_image || '')
    setAuthor(post.author_name || '')
    setCategory(post.category || '')
    setSeoTitle(post.seo_title || '')
    setSeoDescription(post.seo_description || '')
    setStatus((BLOG_STATUSES.includes(post.status as BlogStatus) ? post.status : 'draft') as BlogStatus)
  }, [post])

  const payload = {
    site_id: Number(siteId),
    title: title.trim(),
    slug: slug.trim() || undefined,
    excerpt: excerpt.trim() || null,
    body,
    cover_image: cover.trim() || null,
    author_name: author.trim() || null,
    category: category.trim() || null,
    seo_title: seoTitle.trim() || null,
    seo_description: seoDescription.trim() || null,
    status,
  }

  const save = useMutation({
    mutationFn: () => blogApi.update(id!, payload),
    onSuccess: (updated) => {
      qc.setQueryData(['blog-post', id], updated)
      qc.invalidateQueries({ queryKey: ['blog-posts'] })
      qc.invalidateQueries({ queryKey: ['overview'] })
      setError(null)
    },
    onError: (err: Error) => setError(err.message),
  })

  const publish = useMutation({
    mutationFn: async () => {
      await blogApi.update(id!, { ...payload, status: undefined })
      return blogApi.publish(id!)
    },
    onSuccess: (updated) => {
      qc.setQueryData(['blog-post', id], updated)
      qc.invalidateQueries({ queryKey: ['blog-posts'] })
      qc.invalidateQueries({ queryKey: ['overview'] })
      setError(null)
    },
    onError: (err: Error) => setError(err.message),
  })

  const remove = useMutation({
    mutationFn: () => blogApi.remove(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-posts'] })
      qc.invalidateQueries({ queryKey: ['overview'] })
      navigate('/blog')
    },
    onError: (err: Error) => setError(err.message),
  })

  if (postQuery.isPending) {
    return (
      <Card className="h-64 animate-pulse bg-zinc-900">
        <span className="sr-only">Loading post</span>
      </Card>
    )
  }

  if (!post) {
    return (
      <Card>
        <EmptyState title="Post not found" description="It may have been deleted or belongs to another workspace.">
          <Link to="/blog" className="text-sm text-blue-400">
            Back to blog
          </Link>
        </EmptyState>
      </Card>
    )
  }

  const url = postLiveUrl({ ...post, path: post.path, site: post.site, slug: slug || post.slug })
  const selectedSite = (sitesQuery.data || []).find((site) => String(site.id) === siteId) || (post.site as Site | undefined)

  return (
    <div>
      <Link to="/blog" className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white">
        <ArrowLeft size={14} />
        Blog
      </Link>
      <PageHeader
        title={title || post.title}
        description={`Appears on ${selectedSite?.name || 'the selected website'} at ${post.path || `/blog/${post.slug}`}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {post.status === 'published' && url ? (
              <a href={url} target="_blank" rel="noreferrer">
                <Button variant="outline">
                  <ExternalLink size={15} />
                  View live
                </Button>
              </a>
            ) : null}
            <Button variant="outline" disabled={save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? 'Saving…' : 'Save draft'}
            </Button>
            <Button disabled={publish.isPending || !title.trim()} onClick={() => publish.mutate()}>
              {publish.isPending ? 'Publishing…' : 'Publish'}
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Card className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div>
            <Label>Body</Label>
            <RichTextEditor
              value={body}
              onChange={setBody}
              siteId={siteId}
              placeholder="Write the article. Headings, lists, links, images, and tables appear as you see them here."
            />
          </div>
          <div>
            <Label>Excerpt</Label>
            <textarea className={textareaClass} rows={3} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} />
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3">
            <div>
              <Label>Website</Label>
              <Select className="w-full" value={siteId} onChange={(event) => setSiteId(event.target.value)}>
                {(sitesQuery.data || []).map((site) => (
                  <option key={site.id} value={String(site.id)}>
                    {site.name}
                  </option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-zinc-500">Posts only appear on this site’s host.</p>
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={slug} onChange={(event) => setSlug(event.target.value)} />
            </div>
            <div>
              <Label>Status</Label>
              <Select className="w-full" value={status} onChange={(event) => setStatus(event.target.value as BlogStatus)}>
                {BLOG_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {labelStatus(value)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Product" />
            </div>
            <div>
              <Label>Author</Label>
              <Input value={author} onChange={(event) => setAuthor(event.target.value)} />
            </div>
            <div>
              <Label>Cover image</Label>
              <MediaPicker value={cover} onChange={(url) => setCover(url)} siteId={siteId} />
            </div>
          </Card>
          <Card className="space-y-3">
            <h2 className="font-medium text-white">SEO</h2>
            <div>
              <Label>SEO title</Label>
              <Input value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} />
            </div>
            <div>
              <Label>SEO description</Label>
              <textarea className={textareaClass} rows={3} value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} />
            </div>
          </Card>
          <Button
            variant="danger"
            className="w-full"
            disabled={remove.isPending}
            onClick={() => {
              if (window.confirm('Delete this post? It will disappear from the live site.')) remove.mutate()
            }}
          >
            <Trash2 size={15} />
            {remove.isPending ? 'Deleting…' : 'Delete post'}
          </Button>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </div>
      </div>
    </div>
  )
}
