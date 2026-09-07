<?php

namespace App\Services\Commerce;

use App\Models\Product;
use App\Models\Site;

class ProductBlockService
{
    public function hydrateContent(Site $site, array $content): array
    {
        $types = ['products.grid', 'products.featured', 'products.list'];
        $sections = $content['sections'] ?? [];
        $ids = [];
        foreach ($sections as $section) {
            if (in_array($section['type'] ?? '', $types, true)) {
                foreach ((array) ($section['props']['productIds'] ?? []) as $id) {
                    if (is_scalar($id) && ctype_digit((string) $id)) $ids[] = (int) $id;
                }
            }
        }
        $products = $ids === [] ? collect() : Product::query()
            ->where('workspace_id', $site->workspace_id)->where('status', 'active')
            ->whereIn('id', array_unique($ids))
            ->get(['id', 'name', 'description', 'image', 'price', 'currency', 'type', 'interval', 'inventory'])->keyBy('id');
        foreach ($sections as &$section) {
            if (! in_array($section['type'] ?? '', $types, true)) continue;
            $selected = array_unique(array_filter((array) ($section['props']['productIds'] ?? []), fn ($id) => is_scalar($id) && ctype_digit((string) $id)));
            $section['props']['productPreview'] = false;
            $section['props']['productData'] = collect($selected)->map(fn ($id) => $products->get((int) $id))->filter()->values()->toArray();
        }
        unset($section);
        $content['sections'] = $sections;
        return $content;
    }
}
