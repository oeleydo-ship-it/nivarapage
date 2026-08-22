import type { ReactNode } from 'react'
import { EditableText, editOf } from '../editable'
import {
  Body,
  Card,
  CtaGroup,
  Grid,
  Media,
  SafeText,
  SectionHead,
  SectionShell,
  arr,
  bool,
  items,
  num,
  str,
  type Props,
} from '../primitives'
import { ctaFields, field, headFields, image, link, repeater, schema, slider, text, withoutFields } from '../schema'
import { defineBlock } from '../types'

const articles: Props[] = [
  {
    title: 'Why your homepage should argue one thing',
    excerpt: 'Write the first screen as a decision, not a tour.',
    date: 'Mar 12, 2026',
    tag: 'Copy',
    url: '/blog/homepage-one-thing',
  },
  {
    title: 'Inter at 16px, on purpose',
    excerpt: 'Body copy stays 16. Headlines do the scale.',
    date: 'Feb 28, 2026',
    tag: 'Design',
    url: '/blog/inter-16',
  },
  {
    title: 'Forms that get answered',
    excerpt: 'Ask for less. Confirm like a person. Then actually reply.',
    date: 'Feb 4, 2026',
    tag: 'Product',
    url: '/blog/forms-that-get-answered',
  },
]

const articleFields = [
  text('title', 'Title'),
  field('excerpt', 'textarea', 'Excerpt', 'content'),
  text('date', 'Date'),
  text('tag', 'Tag'),
  image('image', 'Image'),
  link('url', 'Link'),
]

function blogSchema(options: { excerpt?: boolean } = {}) {
  const itemFields = options.excerpt === false ? withoutFields(articleFields, 'excerpt') : articleFields
  return schema(
    ...headFields,
    field('useSitePosts', 'toggle', 'Show this site’s blog posts', 'content', {
      help: 'Fill this block from published posts assigned to this website.',
    }),
    slider('limit', 'Post count', 0, 12, 'content', { unit: '', help: '0 shows every published post.' }),
    repeater('items', 'Articles', itemFields, {
      itemLabel: 'Article',
      itemDefaults: { title: 'New article', excerpt: 'A short summary.', date: '', tag: 'Notes' },
      when: { key: 'useSitePosts', not: true },
    }),
    ...ctaFields,
  )
}

function blogRows(props: Props) {
  const edit = editOf(props)
  const live = bool(props.useSitePosts, true)
  const rows = live ? arr(props.items) : items(props.items, articles)
  const limit = num(props.limit, 0)
  return {
    edit,
    live,
    itemEdit: live ? undefined : edit,
    rows: limit > 0 ? rows.slice(0, limit) : rows,
  }
}

function wrapPost(edit: ReturnType<typeof editOf>, href: string, inner: ReactNode, key: number, className?: string) {
  return edit ? (
    <article key={key} className={className}>
      {inner}
    </article>
  ) : (
    <a key={key} href={href} className={className} style={{ color: 'inherit', textDecoration: 'none' }}>
      {inner}
    </a>
  )
}

function EmptyPosts({ live, rows }: { live: boolean; rows: Props[] }) {
  if (!live || rows.length) return null
  return (
    <p className="ud-text" style={{ margin: 0 }}>
      Publish a blog post assigned to this website to show it here.
    </p>
  )
}

function Meta({
  post,
  index,
  edit,
  light = false,
}: {
  post: Props
  index: number
  edit?: ReturnType<typeof editOf>
  light?: boolean
}) {
  return (
    <p className="ud-small" style={{ margin: 0, display: 'flex', gap: 10, color: light ? 'rgba(255,255,255,.82)' : undefined }}>
      <EditableText edit={edit} path={['items', index, 'tag']} value={str(post.tag)} placeholder="Tag" />
      <span aria-hidden="true">·</span>
      <EditableText edit={edit} path={['items', index, 'date']} value={str(post.date)} placeholder="Date" />
    </p>
  )
}

/* ------------------------------------------------------------- blog.list */

export const blogList = defineBlock({
  type: 'blog.list',
  version: 1,
  category: 'blog',
  label: 'Blog list',
  icon: 'Book',
  defaultProps: {
    eyebrow: 'Journal',
    heading: 'Latest from the studio',
    description: 'Published posts assigned to this website.',
    buttonLabel: '',
    buttonUrl: '/blog',
    useSitePosts: true,
    limit: 6,
    items: articles,
  },
  schema: blogSchema(),
  component: (props) => {
    const { edit, live, itemEdit, rows } = blogRows(props)
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} defaultHeading="Blog" />
        <Body>
          <EmptyPosts live={live} rows={rows} />
          {rows.length ? (
            <div className="ud-blog-list">
              {rows.map((post, index) =>
                wrapPost(
                  edit,
                  str(post.url, '#'),
                  <div className="ud-blog-row">
                    <Media src={post.image} alt={str(post.title)} ratio="wide" zoom edit={itemEdit} path={['items', index, 'image']} />
                    <div>
                      <Meta post={post} index={index} edit={itemEdit} />
                      <EditableText
                        edit={itemEdit}
                        path={['items', index, 'title']}
                        value={str(post.title)}
                        as="h3"
                        className="ud-h3"
                        style={{ marginTop: 8 }}
                        placeholder="Title"
                      />
                      <SafeText
                        value={post.excerpt}
                        className="ud-text"
                        edit={itemEdit}
                        path={['items', index, 'excerpt']}
                        placeholder="Excerpt"
                      />
                    </div>
                  </div>,
                  index,
                ),
              )}
            </div>
          ) : null}
        </Body>
        <CtaGroup props={props} primaryVariant="link" />
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------- blog.featured */

export const blogFeatured = defineBlock({
  type: 'blog.featured',
  version: 1,
  category: 'blog',
  label: 'Featured + list',
  icon: 'Book',
  defaultProps: {
    eyebrow: 'Blog',
    heading: 'What we published',
    description: 'The latest article up front, the rest in a compact list.',
    buttonLabel: 'All articles',
    buttonUrl: '/blog',
    useSitePosts: true,
    limit: 4,
    items: articles,
  },
  schema: blogSchema(),
  component: (props) => {
    const { edit, live, itemEdit, rows } = blogRows(props)
    const [lead, ...rest] = rows
    return (
      <SectionShell props={props} tone="default">
        <SectionHead props={props} defaultHeading="Blog" />
        <Body>
          <EmptyPosts live={live} rows={rows} />
          {lead ? (
            <div className="ud-blog-featured">
              {wrapPost(
                edit,
                str(lead.url, '#'),
                <div>
                  <Media src={lead.image} alt={str(lead.title)} ratio="wide" zoom edit={itemEdit} path={['items', 0, 'image']} />
                  <div style={{ marginTop: 18 }}>
                    <Meta post={lead} index={0} edit={itemEdit} />
                    <EditableText
                      edit={itemEdit}
                      path={['items', 0, 'title']}
                      value={str(lead.title)}
                      as="h3"
                      className="ud-h2"
                      style={{ marginTop: 10 }}
                      placeholder="Title"
                    />
                    <SafeText
                      value={lead.excerpt}
                      className="ud-text"
                      edit={itemEdit}
                      path={['items', 0, 'excerpt']}
                      placeholder="Excerpt"
                    />
                  </div>
                </div>,
                0,
              )}
              <div className="ud-blog-featured__side">
                {rest.map((post, offset) => {
                  const index = offset + 1
                  return wrapPost(
                    edit,
                    str(post.url, '#'),
                    <div className="ud-blog-side">
                      <Meta post={post} index={index} edit={itemEdit} />
                      <EditableText
                        edit={itemEdit}
                        path={['items', index, 'title']}
                        value={str(post.title)}
                        as="h3"
                        className="ud-h4"
                        style={{ marginTop: 6 }}
                        placeholder="Title"
                      />
                      <SafeText
                        value={post.excerpt}
                        className="ud-small"
                        edit={itemEdit}
                        path={['items', index, 'excerpt']}
                        placeholder="Excerpt"
                      />
                    </div>,
                    index,
                  )
                })}
              </div>
            </div>
          ) : null}
        </Body>
        <CtaGroup props={props} primaryVariant="link" />
      </SectionShell>
    )
  },
  settings: null,
})

/* --------------------------------------------------------- blog.magazine */

export const blogMagazine = defineBlock({
  type: 'blog.magazine',
  version: 1,
  category: 'blog',
  label: 'Magazine grid',
  icon: 'Book',
  defaultProps: {
    eyebrow: 'Reading',
    heading: 'From the desk',
    description: 'A lead story with supporting notes beside it.',
    buttonLabel: '',
    buttonUrl: '/blog',
    useSitePosts: true,
    limit: 5,
    items: articles,
  },
  schema: blogSchema(),
  component: (props) => {
    const { edit, live, itemEdit, rows } = blogRows(props)
    const [lead, ...rest] = rows
    return (
      <SectionShell props={props} tone="surface">
        <SectionHead props={props} defaultHeading="Blog" />
        <Body>
          <EmptyPosts live={live} rows={rows} />
          {lead ? (
            <div className="ud-blog-magazine">
              {wrapPost(
                edit,
                str(lead.url, '#'),
                <Card variant="outline" hover>
                  <Media src={lead.image} alt={str(lead.title)} ratio="wide" zoom edit={itemEdit} path={['items', 0, 'image']} />
                  <div style={{ paddingTop: 18 }}>
                    <Meta post={lead} index={0} edit={itemEdit} />
                    <EditableText
                      edit={itemEdit}
                      path={['items', 0, 'title']}
                      value={str(lead.title)}
                      as="h3"
                      className="ud-h3"
                      style={{ marginTop: 10 }}
                      placeholder="Title"
                    />
                    <SafeText
                      value={lead.excerpt}
                      className="ud-text"
                      edit={itemEdit}
                      path={['items', 0, 'excerpt']}
                      placeholder="Excerpt"
                    />
                  </div>
                </Card>,
                0,
                'ud-blog-magazine__lead',
              )}
              <div className="ud-stack" style={{ gap: 16 }}>
                {rest.map((post, offset) => {
                  const index = offset + 1
                  return wrapPost(
                    edit,
                    str(post.url, '#'),
                    <Card variant="solid" hover>
                      <Meta post={post} index={index} edit={itemEdit} />
                      <EditableText
                        edit={itemEdit}
                        path={['items', index, 'title']}
                        value={str(post.title)}
                        as="h3"
                        className="ud-h4"
                        style={{ marginTop: 8 }}
                        placeholder="Title"
                      />
                    </Card>,
                    index,
                  )
                })}
              </div>
            </div>
          ) : null}
        </Body>
        <CtaGroup props={props} primaryVariant="link" />
      </SectionShell>
    )
  },
  settings: null,
})

/* ---------------------------------------------------------- blog.overlay */

export const blogOverlay = defineBlock({
  type: 'blog.overlay',
  version: 1,
  category: 'blog',
  label: 'Cover cards',
  icon: 'Book',
  defaultProps: {
    eyebrow: 'Stories',
    heading: 'Notes on launching',
    description: 'Image-forward cards for the posts on this site.',
    buttonLabel: '',
    buttonUrl: '/blog',
    useSitePosts: true,
    limit: 3,
    items: articles,
  },
  schema: blogSchema({ excerpt: false }),
  component: (props) => {
    const { edit, live, itemEdit, rows } = blogRows(props)
    return (
      <SectionShell props={props} tone="dark">
        <SectionHead props={props} defaultHeading="Blog" />
        <Body>
          <EmptyPosts live={live} rows={rows} />
          {rows.length ? (
            <Grid cols={Math.min(rows.length, 3)} gap={20}>
              {rows.map((post, index) =>
                wrapPost(
                  edit,
                  str(post.url, '#'),
                  <div className="ud-blog-overlay">
                    <Media src={post.image} alt={str(post.title)} ratio="portrait" zoom edit={itemEdit} path={['items', index, 'image']} />
                    <div className="ud-blog-overlay__copy">
                      <Meta post={post} index={index} edit={itemEdit} light />
                      <EditableText
                        edit={itemEdit}
                        path={['items', index, 'title']}
                        value={str(post.title)}
                        as="h3"
                        className="ud-h3"
                        style={{ marginTop: 10, color: '#fff' }}
                        placeholder="Title"
                      />
                    </div>
                  </div>,
                  index,
                ),
              )}
            </Grid>
          ) : null}
        </Body>
        <CtaGroup props={props} primaryVariant="link" />
      </SectionShell>
    )
  },
  settings: null,
})
