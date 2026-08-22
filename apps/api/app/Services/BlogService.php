<?php

namespace App\Services;

use App\Jobs\InvalidateRendererCache;
use App\Models\BlogPost;
use App\Models\Page;
use App\Models\Site;
use App\Models\User;
use App\Support\CurrentWorkspace;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class BlogService
{
    public function __construct(
        private readonly AuditService $audit,
        private readonly CurrentWorkspace $currentWorkspace,
        private readonly TenantCacheService $cache,
        private readonly HtmlSanitizer $html,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(User $user, array $data): BlogPost
    {
        $workspace = $this->currentWorkspace->workspace;
        abort_unless($workspace, 422, 'Workspace is required.');

        $site = Site::query()
            ->where('workspace_id', $workspace->id)
            ->where('id', $data['site_id'])
            ->firstOrFail();

        $post = BlogPost::query()->create([
            'workspace_id' => $workspace->id,
            'site_id' => $site->id,
            'created_by' => $user->id,
            ...$this->attributes($data, $site->id),
        ]);

        $this->audit->log('blog.created', $post, ['site_id' => $site->id], $workspace, $user);
        $this->bust($site);

        return $post->fresh('site.domains');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(BlogPost $post, array $data): BlogPost
    {
        $previous = $post->site;
        $previousSlug = $post->slug;
        $siteId = $post->site_id;
        if (isset($data['site_id']) && (int) $data['site_id'] !== $post->site_id) {
            $site = Site::query()
                ->where('workspace_id', $post->workspace_id)
                ->where('id', $data['site_id'])
                ->firstOrFail();
            $siteId = $site->id;
            $data['site_id'] = $siteId;
        }

        $post->update($this->attributes($data, $siteId, $post));
        $this->audit->log('blog.updated', $post, ['site_id' => $post->site_id]);

        $fresh = $post->fresh('site.domains');
        if ($previous) {
            Cache::forget($this->cache->blogPostKey($previous->id, $previousSlug));
            $this->bust($previous);
        }
        if ($fresh?->site && $fresh->site_id !== $previous?->id) {
            $this->bust($fresh->site);
        }

        return $fresh ?? $post;
    }

    public function delete(BlogPost $post): void
    {
        $site = $post->site;
        $slug = $post->slug;
        $post->delete();
        $this->audit->log('blog.deleted', $post, ['site_id' => $site?->id]);
        if ($site) {
            Cache::forget($this->cache->blogPostKey($site->id, $slug));
            $this->bust($site);
        }
    }

    public function publish(BlogPost $post): BlogPost
    {
        $post->update([
            'status' => 'published',
            'published_at' => $post->published_at ?: now(),
        ]);
        $this->audit->log('blog.published', $post, ['site_id' => $post->site_id]);
        $this->bust($post->site);

        return $post->fresh('site.domains');
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function publishedCards(Site $site): array
    {
        $prefix = $this->indexPath($site);

        return $site->blogPosts()
            ->live()
            ->latest('published_at')
            ->latest('id')
            ->get()
            ->map(fn (BlogPost $post) => [
                'title' => $post->title,
                'excerpt' => $post->excerpt ?: Str::limit(strip_tags((string) $post->body), 160),
                'date' => optional($post->published_at)->toFormattedDateString(),
                'tag' => $post->category ?: 'Blog',
                'image' => $post->cover_image,
                'url' => $prefix.'/'.$post->slug,
            ])
            ->values()
            ->all();
    }

    /**
     * @param  array<string, mixed>  $content
     * @return array<string, mixed>
     */
    public function hydratePageContent(Site $site, array $content, ?Page $page = null): array
    {
        $cards = $this->publishedCards($site);
        $sections = $content['sections'] ?? [];
        if (! is_array($sections)) {
            return $content;
        }

        $prefix = $this->indexPath($site);
        $found = false;
        foreach ($sections as $index => $section) {
            if (! is_array($section) || ! $this->isBlogListingType((string) ($section['type'] ?? ''))) {
                continue;
            }
            if (! $this->sectionUsesSitePosts($section, $page)) {
                continue;
            }
            $props = is_array($section['props'] ?? null) ? $section['props'] : [];
            $props['useSitePosts'] = true;
            if ($cards !== []) {
                $limit = (int) ($props['limit'] ?? 0);
                $props['items'] = $limit > 0 ? array_slice($cards, 0, $limit) : $cards;
                $props['buttonUrl'] = $props['buttonUrl'] ?? $prefix;
            }
            $sections[$index]['props'] = $props;
            $found = true;
        }

        if (! $found && $page && in_array($page->slug, ['blog', 'journal'], true) && $cards !== []) {
            $sections[] = [
                'type' => 'blog.featured',
                'props' => [
                    'eyebrow' => 'Blog',
                    'heading' => 'Latest posts',
                    'description' => 'Articles published on this site.',
                    'buttonLabel' => '',
                    'buttonUrl' => $prefix,
                    'useSitePosts' => true,
                    'items' => $cards,
                ],
            ];
        }

        $content['sections'] = array_values($sections);

        return $content;
    }

    private function isBlogListingType(string $type): bool
    {
        return $type === 'posts.cards' || str_starts_with($type, 'blog.');
    }

    /**
     * Blog index pages default to live posts. Other pages keep curated cards
     * unless the editor turns the option on.
     *
     * @param  array<string, mixed>  $section
     */
    private function sectionUsesSitePosts(array $section, ?Page $page = null): bool
    {
        $props = is_array($section['props'] ?? null) ? $section['props'] : [];
        if (array_key_exists('useSitePosts', $props)) {
            return (bool) $props['useSitePosts'];
        }

        return in_array($page?->slug, ['blog', 'journal'], true);
    }

    public function indexPath(Site $site): string
    {
        $hasJournal = $site->pages()->where('slug', 'journal')->exists();

        return $hasJournal ? '/journal' : '/blog';
    }

    public function publicPost(BlogPost $post): array
    {
        $post->loadMissing('site');
        $prefix = $post->site ? $this->indexPath($post->site) : '/blog';
        $path = $prefix.'/'.$post->slug;

        return [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $post->excerpt,
            'body' => $post->body,
            'body_html' => $this->bodyHtml((string) $post->body, $post->cover_image, $post->title),
            'cover_image' => $post->cover_image,
            'author_name' => $post->author_name,
            'category' => $post->category,
            'tags' => $post->tags ?? [],
            'published_at' => $post->published_at?->toIso8601String(),
            'path' => $path,
            'seo_title' => $post->seo_title ?: $post->title,
            'seo_description' => $post->seo_description ?: $post->excerpt,
        ];
    }

    public function bodyHtml(string $body, ?string $cover = null, string $title = ''): string
    {
        $html = trim($body);
        if ($html === '') {
            $html = '';
        } elseif ($this->looksLikeHtml($html)) {
            $html = $this->html->sanitizeArticle($html);
        } else {
            $parts = preg_split("/\n{2,}/", $html) ?: [];
            $html = collect($parts)
                ->map(fn (string $part) => '<p>'.nl2br(e(trim($part))).'</p>')
                ->implode('');
        }
        if ($cover) {
            $html = '<p><img src="'.e($cover).'" alt="'.e($title).'" /></p>'.$html;
        }

        return $html;
    }

    private function looksLikeHtml(string $value): bool
    {
        return (bool) preg_match('/<\/?(p|h[1-6]|ul|ol|li|blockquote|pre|img|table|strong|em|a)\b/i', $value);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function attributes(array $data, int $siteId, ?BlogPost $existing = null): array
    {
        $keys = [
            'site_id', 'title', 'excerpt', 'body', 'cover_image', 'author_name', 'category',
            'tags', 'status', 'published_at', 'seo_title', 'seo_description', 'extras',
        ];
        $attributes = [];
        foreach ($keys as $key) {
            if (array_key_exists($key, $data)) {
                $attributes[$key] = $data[$key];
            }
        }

        $title = $attributes['title'] ?? $existing?->title ?? 'Post';
        $requestedSlug = isset($data['slug']) ? Str::slug((string) $data['slug']) : null;
        $attributes['slug'] = $this->uniqueSlug(
            $siteId,
            $requestedSlug ?: Str::slug($title) ?: 'post',
            $existing?->id,
        );

        if (($attributes['status'] ?? $existing?->status) === 'published' && empty($attributes['published_at']) && ! $existing?->published_at) {
            $attributes['published_at'] = now();
        }

        return $attributes;
    }

    private function uniqueSlug(int $siteId, string $base, ?int $ignoreId = null): string
    {
        $slug = $base !== '' ? $base : 'post';
        $i = 2;
        while (
            BlogPost::query()
                ->where('site_id', $siteId)
                ->where('slug', $slug)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base.'-'.$i;
            $i++;
        }

        return $slug;
    }

    private function bust(?Site $site): void
    {
        if (! $site) {
            return;
        }
        $this->cache->invalidateSite($site);
        InvalidateRendererCache::dispatch($site->id);
    }
}
