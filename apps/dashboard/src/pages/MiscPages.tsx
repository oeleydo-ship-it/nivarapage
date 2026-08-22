import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MediaLibrary } from '../components/MediaLibrary'
import { TemplateLivePreview, TemplatePreviewAssets } from '../components/TemplatePreview'
import { TemplatePreviewLink } from './TemplateFullPreviewPage'
import { TemplateSearchBar } from '../components/TemplateSearchBar'
import { templatePreviewPath } from '../lib/templatePreview'
import { templatesApi } from '../lib/endpoints'
import { featureEnabled, useSubscription } from '../lib/plan'
import { filterTemplates, templateCategoryNames } from '../lib/templateSearch'
import { Badge, Button, Card, EmptyState, PageHeader } from '../ui/primitives'

export function TemplatesPage() {
  const { data } = useQuery({ queryKey: ['templates'], queryFn: templatesApi.list })
  const sub = useSubscription()
  const premiumOk = featureEnabled(sub.data?.usage?.premium_templates)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const templates = data || []
  const categories = useMemo(() => templateCategoryNames(templates), [templates])
  const visible = useMemo(() => filterTemplates(templates, query, category), [templates, query, category])
  return (
    <div>
      <TemplatePreviewAssets />
      <PageHeader
        title="Templates"
        description="Published designs with a live homepage preview. Apply one when you create a website."
        actions={
          <Link to="/sites/new">
            <Button>Create website</Button>
          </Link>
        }
      />
      <div className="mb-5">
        <TemplateSearchBar
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategoryChange={setCategory}
          categories={categories}
        />
      </div>
      {templates.length > 0 && visible.length === 0 ? (
        <Card className="px-6 py-12">
          <EmptyState title="No matching templates" description="Try a different name, category, or description.">
            <Button
              variant="outline"
              onClick={() => {
                setQuery('')
                setCategory('all')
              }}
            >
              Clear search
            </Button>
          </EmptyState>
        </Card>
      ) : (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((t) => (
          <Card key={t.id} padded={false} className={`overflow-hidden ${t.is_premium && !premiumOk ? 'opacity-70' : ''}`}>
            <div className="group relative">
              <TemplateLivePreview template={t} />
              <a
                href={templatePreviewPath(t.slug)}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 flex items-center justify-center bg-zinc-950/0 text-sm font-medium text-white opacity-0 transition group-hover:bg-zinc-950/55 group-hover:opacity-100"
              >
                Open full preview
              </a>
            </div>
            <div className="px-5 pb-5 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="text-lg font-medium text-white">{t.name}</div>
                {t.is_premium ? <Badge tone="warning">{premiumOk ? 'premium' : 'premium · upgrade'}</Badge> : null}
              </div>
              <p className="mt-1 text-sm text-zinc-400">{t.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                {t.category ? <span>{t.category.name}</span> : null}
                {typeof t.theme_tokens?.headingFont === 'string' ? (
                  <span>{String(t.theme_tokens.headingFont).split(',')[0]}</span>
                ) : null}
                {typeof t.page_count === 'number' ? <span>{t.page_count} pages</span> : null}
                <TemplatePreviewLink slug={t.slug} className="ml-auto" />
                <Link to={`/sites/new?template=${encodeURIComponent(t.slug)}`} className="text-blue-400 hover:text-blue-300">
                  Use template
                </Link>
              </div>
              {t.is_premium && !premiumOk ? (
                <p className="mt-2 text-xs text-amber-400" title="Upgrade to use premium templates">
                  Included on Business and Agency.
                </p>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
      )}
    </div>
  )
}

export function MediaPage() {
  return (
    <div>
      <PageHeader
        title="Media"
        description="Upload, search, and reuse images across your websites."
      />
      <MediaLibrary />
    </div>
  )
}
