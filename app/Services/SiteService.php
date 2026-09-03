<?php

namespace App\Services;

use App\Exceptions\PlanQuotaException;
use App\Models\Page;
use App\Models\Site;
use App\Models\SiteSetting;
use App\Models\SiteThemeSetting;
use App\Models\Template;
use App\Models\User;
use App\Support\CurrentWorkspace;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SiteService
{
    public function __construct(
        private readonly PlanLimitService $limits,
        private readonly SubdomainService $subdomains,
        private readonly PageService $pages,
        private readonly AuditService $audit,
        private readonly CurrentWorkspace $currentWorkspace,
        private readonly FeatureService $features,
        private readonly TenantCacheService $cache,
        private readonly NavigationService $navigation,
        private readonly FormService $forms,
        private readonly DomainService $domains,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(User $user, array $data): Site
    {
        $workspace = $this->currentWorkspace->workspace;
        abort_unless($workspace, 422, 'Workspace is required.');

        $this->limits->assertOrFail($workspace, 'number_of_sites');

        $template = null;
        if (! empty($data['template_id'])) {
            $template = Template::query()->findOrFail($data['template_id']);
            if ($template->is_premium) {
                $this->features->assertEnabled($workspace, 'premium_templates');
            }
        }

        $subdomainName = $data['subdomain'] ?? Str::slug($data['name']);

        $created = DB::transaction(function () use ($user, $data, $workspace, $template, $subdomainName) {
            $site = Site::query()->create([
                'workspace_id' => $workspace->id,
                'name' => $data['name'],
                'business_name' => $data['business_name'] ?? null,
                'slug' => Str::slug($data['name']),
                'category' => $data['category'] ?? ($template?->category?->slug),
                'description' => $data['description'] ?? null,
                'status' => 'draft',
                'created_by' => $user->id,
            ]);

            $this->subdomains->reserve($subdomainName, $workspace->id, $site->id);

            SiteSetting::query()->create([
                'site_id' => $site->id,
                'default_description' => $data['description'] ?? null,
                'robots' => 'index',
                'locale' => 'en',
                'timezone' => 'UTC',
                'redirect_secondary_to_primary' => true,
            ]);

            SiteThemeSetting::query()->create([
                'site_id' => $site->id,
                'tokens' => self::themeFromTemplate($template),
            ]);

            $this->forms->ensureDefaults($site);

            if ($template?->slug === 'cinder-row') {
                $this->forms->ensureCinderContactFields($site);
            }
            if ($template?->slug === 'lumen-lane') {
                $this->forms->ensureLumenLaneFields($site);
            }

            if ($template) {
                $this->pages->cloneFromTemplate($site->fresh('forms'), $template, $user);
            } else {
                $this->pages->create($site, $user, [
                    'name' => 'Home',
                    'slug' => 'home',
                    'is_homepage' => true,
                ]);
            }

            $this->navigation->ensureDefault($site->fresh('pages'));

            $this->audit->log('site.created', $site, [], $workspace, $user);

            return $site->fresh(['domains', 'settings', 'theme', 'pages']);
        });

        $this->cache->invalidateSite($created);

        return $created;
    }

    public function duplicate(Site $site, User $user): Site
    {
        $workspace = $site->workspace;
        $this->limits->assertOrFail($workspace, 'number_of_sites');

        return DB::transaction(function () use ($site, $user, $workspace) {
            $copy = $site->replicate(['slug', 'status']);
            $copy->name = $site->name.' Copy';
            $copy->slug = Str::slug($copy->name).'-'.Str::random(4);
            $copy->status = 'draft';
            $copy->created_by = $user->id;
            $copy->save();

            $this->subdomains->reserve($copy->slug, $workspace->id, $copy->id);

            if ($site->settings) {
                $settings = $site->settings->replicate();
                $settings->site_id = $copy->id;
                $settings->save();
            }

            if ($site->theme) {
                $theme = $site->theme->replicate();
                $theme->site_id = $copy->id;
                $theme->save();
            }

            foreach ($site->pages as $page) {
                $this->pages->create($copy, $user, [
                    'name' => $page->name,
                    'slug' => $page->slug,
                    'is_homepage' => $page->is_homepage,
                    'content' => $page->draftRevision?->content_json ?? PageService::emptyContent(),
                    'seo_title' => $page->seo_title,
                    'seo_description' => $page->seo_description,
                ]);
            }

            $this->navigation->ensureDefault($copy->fresh('pages'));
            $this->forms->copyToSite($site, $copy);
            $this->forms->bindSitePages($copy->fresh(['pages.draftRevision', 'forms']));

            $this->audit->log('site.duplicated', $copy, ['source_id' => $site->id], $workspace, $user);

            return $copy->fresh(['domains', 'pages']);
        });
    }

    public function delete(Site $site): void
    {
        // Before the site goes, so the cache is invalidated while the domains
        // can still be read back off it.
        $this->domains->releaseForSite($site);
        $site->delete();
        $this->cache->invalidateSite($site);
        $this->audit->log('site.deleted', $site);
    }

    public function restore(Site $site): Site
    {
        $this->limits->assertOrFail($site->workspace, 'number_of_sites');
        $site->restore();
        $this->domains->restoreForSite($site);
        $this->audit->log('site.restored', $site);

        return $site->fresh();
    }

    public function applyTemplate(Site $site, Template $template, User $user): Site
    {
        if ($template->is_premium) {
            $this->features->assertEnabled($site->workspace, 'premium_templates');
        }

        $this->forms->ensureDefaults($site);
        if ($template->slug === 'cinder-row') {
            $this->forms->ensureCinderContactFields($site);
        }
        if ($template->slug === 'lumen-lane') {
            $this->forms->ensureLumenLaneFields($site);
        }
        $this->pages->cloneFromTemplate($site->fresh('forms'), $template, $user);
        $site->theme()->updateOrCreate(
            ['site_id' => $site->id],
            ['tokens' => self::themeFromTemplate($template)],
        );
        $this->cache->invalidateSite($site->fresh(['domains', 'pages.publishedRevision']));
        $this->audit->log('site.template_applied', $site, ['template_id' => $template->id]);

        return $site->fresh(['pages']);
    }

    /**
     * Writes a generated sitemap onto an existing site. Extra pages respect pages_per_site.
     *
     * @param  list<array{name: string, slug: string, is_homepage?: bool, content: array<string, mixed>}>  $pages
     * @param  array<string, mixed>  $theme
     * @return array{pages: Collection<int, Page>, theme: array<string, mixed>, skipped: list<string>, current_content: array<string, mixed>|null}
     */
    public function applyAiGeneration(Site $site, User $user, array $pages, array $theme = [], ?int $currentPageId = null): array
    {
        $existing = $site->pages()->get();
        $site->loadMissing('theme');
        $bySlug = $existing->keyBy('slug');
        $homepage = $existing->firstWhere('is_homepage', true) ?? $existing->first();
        $current = $currentPageId ? $existing->firstWhere('id', $currentPageId) : null;
        $skipped = [];
        $currentContent = null;

        foreach ($pages as $draft) {
            $content = is_array($draft['content'] ?? null) ? $draft['content'] : ['schemaVersion' => 1, 'sections' => []];
            $name = (string) ($draft['name'] ?? 'Page');
            $slug = (string) ($draft['slug'] ?? Str::slug($name));
            $isHome = (bool) ($draft['is_homepage'] ?? false);

            $page = $bySlug->get($slug);
            if ($page === null && $isHome && $homepage) {
                $page = $homepage;
            }
            if ($page === null && $current && $slug === $current->slug) {
                $page = $current;
            }

            if ($page instanceof Page) {
                $this->pages->saveDraft($page, $user, $content);
                $page->update(['name' => $name]);
                if ($current && (int) $page->id === (int) $current->id) {
                    $currentContent = $content;
                }

                continue;
            }

            try {
                $created = $this->pages->create($site, $user, [
                    'name' => $name,
                    'slug' => $slug,
                    'is_homepage' => false,
                    'content' => $content,
                ]);
                $bySlug->put($created->slug, $created);
            } catch (PlanQuotaException) {
                $skipped[] = $name;
            }
        }

        if ($theme !== []) {
            $merged = array_replace(self::defaultThemeTokens(), is_array($site->theme?->tokens) ? $site->theme->tokens : [], $theme);
            $site->theme()->updateOrCreate(
                ['site_id' => $site->id],
                ['tokens' => $merged],
            );
        }

        $this->cache->invalidateSite($site->fresh(['domains', 'pages.publishedRevision']));
        $this->audit->log('ai.site_applied', $site, [
            'pages' => count($pages),
            'skipped' => $skipped,
        ], $site->workspace, $user);

        $fresh = $site->fresh(['pages.draftRevision', 'pages.publishedRevision', 'theme']);
        if ($currentContent === null && $current) {
            $reloaded = $fresh?->pages->firstWhere('id', $current->id);
            $currentContent = is_array($reloaded?->draftRevision?->content_json) ? $reloaded->draftRevision->content_json : null;
        }

        return [
            'pages' => $fresh?->pages ?? collect(),
            'theme' => is_array($fresh?->theme?->tokens) ? $fresh->theme->tokens : self::defaultThemeTokens(),
            'skipped' => $skipped,
            'current_content' => $currentContent,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function themeFromTemplate(?Template $template): array
    {
        $custom = is_array($template?->theme_tokens) ? $template->theme_tokens : [];

        return array_replace(self::defaultThemeTokens(), $custom);
    }

    /**
     * @return array<string, mixed>
     */
    public static function defaultThemeTokens(): array
    {
        return [
            'primary' => '#2563eb',
            'secondary' => '#0f172a',
            'accent' => '#f59e0b',
            'background' => '#ffffff',
            'surface' => '#f8fafc',
            'text' => '#0f172a',
            'muted' => '#64748b',
            'headingFont' => 'Inter, system-ui, sans-serif',
            'bodyFont' => 'Inter, system-ui, sans-serif',
            'headingWeight' => 700,
            'bodyWeight' => 400,
            // Site-wide text size. Every key here is also the allow-list
            // sanitizeTheme() filters incoming themes against, so a token
            // missing from this list is silently dropped on save.
            'textScale' => '100%',
            'buttonRadius' => '8px',
            'cardRadius' => '12px',
            'containerWidth' => '1120px',
            'sectionSpacing' => '80px',
        ];
    }
}
