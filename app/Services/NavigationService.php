<?php

namespace App\Services;

use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\Site;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class NavigationService
{
    /**
     * @var list<string>
     */
    public const TYPES = ['page', 'url', 'anchor'];

    public function __construct(private readonly TenantCacheService $cache) {}

    /**
     * @return list<array<string, mixed>>
     */
    public function tree(Site $site): array
    {
        $menus = $site->menus()
            ->with(['items' => fn ($q) => $q->whereNull('parent_id')->orderBy('sort_order')->with($this->itemEagerLoad())])
            ->get();

        if ($menus->isEmpty() || $menus->every(fn (Menu $menu) => $menu->items->isEmpty())) {
            $this->ensureDefault($site);
            $site->unsetRelation('menus');
            $menus = $site->menus()
                ->with(['items' => fn ($q) => $q->whereNull('parent_id')->orderBy('sort_order')->with($this->itemEagerLoad())])
                ->get();
        }

        return $menus->map(fn (Menu $menu) => [
            'id' => $menu->id,
            'name' => $menu->name,
            'location' => $menu->location,
            'items' => $menu->items->map(fn (MenuItem $item) => $this->serializeItem($item))->values()->all(),
        ])->values()->all();
    }

    public function ensureDefault(Site $site): Menu
    {
        $menu = $site->menus()->first();
        if (! $menu) {
            $menu = Menu::query()->create([
                'site_id' => $site->id,
                'name' => 'Main',
                'location' => 'header',
            ]);
        }

        if ($menu->items()->exists()) {
            return $menu;
        }

        foreach ($site->pages()->orderBy('id')->get() as $index => $page) {
            MenuItem::query()->create([
                'menu_id' => $menu->id,
                'type' => 'page',
                'label' => $page->name,
                'page_id' => $page->id,
                'sort_order' => $index,
                'target' => '_self',
            ]);
        }

        return $menu;
    }

    /**
     * @param  array<int, array<string, mixed>>  $menus
     * @return list<array<string, mixed>>
     */
    public function sync(Site $site, array $menus): array
    {
        $tree = DB::transaction(function () use ($site, $menus) {
            foreach ($menus as $menuData) {
                $menu = isset($menuData['id'])
                    ? Menu::query()->where('site_id', $site->id)->findOrFail($menuData['id'])
                    : Menu::query()->create([
                        'site_id' => $site->id,
                        'name' => $menuData['name'] ?? 'Main',
                        'location' => $menuData['location'] ?? 'header',
                    ]);

                $menu->update([
                    'name' => $menuData['name'] ?? $menu->name,
                    'location' => $menuData['location'] ?? $menu->location,
                ]);

                MenuItem::query()->where('menu_id', $menu->id)->update(['parent_id' => null]);
                MenuItem::query()->where('menu_id', $menu->id)->delete();
                $this->createItems($menu, $site, $menuData['items'] ?? [], null);
            }

            return $this->tree($site->fresh());
        });

        $this->cache->invalidateSite($site);

        return $tree;
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    private function createItems(Menu $menu, Site $site, array $items, ?int $parentId): void
    {
        foreach (array_values($items) as $index => $item) {
            if (! is_array($item) || blank($item['label'] ?? null)) {
                throw new InvalidArgumentException('Each menu item needs a label.');
            }

            $type = (string) ($item['type'] ?? 'page');
            if (! in_array($type, self::TYPES, true)) {
                throw new InvalidArgumentException("Invalid menu item type [{$type}].");
            }

            $pageId = $type === 'page' ? ($item['page_id'] ?? null) : null;
            if ($pageId) {
                $belongs = Page::query()->where('site_id', $site->id)->where('id', $pageId)->exists();
                if (! $belongs) {
                    throw new InvalidArgumentException('Menu items can only link to pages on this site.');
                }
            }

            $created = MenuItem::query()->create([
                'menu_id' => $menu->id,
                'parent_id' => $parentId,
                'type' => $type,
                'label' => $item['label'],
                'url' => $type === 'page' ? null : ($item['url'] ?? null),
                'page_id' => $pageId,
                'sort_order' => $item['sort_order'] ?? $index,
                'target' => in_array($target = $item['target'] ?? '_self', ['_self', '_blank'], true) ? $target : '_self',
            ]);

            if (! empty($item['children']) && is_array($item['children'])) {
                $this->createItems($menu, $site, $item['children'], $created->id);
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeItem(MenuItem $item): array
    {
        $children = $item->children
            ->sortBy('sort_order')
            ->map(fn (MenuItem $child) => $this->serializeItem($child))
            ->values()
            ->all();

        return [
            'id' => $item->id,
            'type' => $item->type,
            'label' => $item->label,
            'url' => $item->url,
            'page_id' => $item->page_id,
            'target' => $item->target,
            'sort_order' => $item->sort_order,
            'href' => $this->href($item),
            'children' => $children,
        ];
    }

    public function href(MenuItem $item): string
    {
        return match ($item->type) {
            'page' => $this->pageHref($item->page),
            'anchor' => str_starts_with((string) $item->url, '#')
                ? (string) $item->url
                : '#'.ltrim((string) $item->url, '#'),
            default => $item->url ?: '#',
        };
    }

    private function pageHref(?Page $page): string
    {
        if (! $page) {
            return '#';
        }

        if ($page->is_homepage || $page->slug === 'home' || $page->slug === '') {
            return '/';
        }

        return '/'.ltrim($page->slug, '/');
    }

    /**
     * @return list<string>
     */
    private function itemEagerLoad(): array
    {
        return [
            'page',
            'children' => fn ($q) => $q->orderBy('sort_order'),
            'children.page',
            'children.children' => fn ($q) => $q->orderBy('sort_order'),
            'children.children.page',
        ];
    }
}
