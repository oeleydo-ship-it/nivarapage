<?php

namespace App\Services\Commerce;

use App\Models\Product;
use App\Models\User;
use App\Models\Workspace;
use App\Services\AuditService;
use Illuminate\Support\Str;

/**
 * The things a workspace sells.
 *
 * Prices are held in minor units throughout - the API takes and returns them
 * that way too, so nothing rounds a price on its way through a float.
 */
class ProductService
{
    public function __construct(private readonly AuditService $audit) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(Workspace $workspace, User $user, array $data): Product
    {
        $product = Product::query()->create([
            'workspace_id' => $workspace->id,
            'created_by' => $user->id,
            'name' => $data['name'],
            'slug' => $this->uniqueSlug($workspace, $data['slug'] ?? $data['name']),
            'description' => $data['description'] ?? null,
            'image' => $data['image'] ?? null,
            'price' => max(0, (int) ($data['price'] ?? 0)),
            'currency' => Str::upper($data['currency'] ?? 'USD'),
            'type' => $data['type'] ?? 'one_time',
            'interval' => ($data['type'] ?? 'one_time') === 'subscription' ? ($data['interval'] ?? 'month') : null,
            'status' => $data['status'] ?? 'draft',
            'success_url' => $data['success_url'] ?? null,
            'inventory' => array_key_exists('inventory', $data) ? $data['inventory'] : null,
            'metadata' => $data['metadata'] ?? null,
        ]);

        $this->audit->log('product.created', $product, ['price' => $product->price], $workspace, $user);

        return $product;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Product $product, array $data): Product
    {
        $attributes = collect($data)
            ->only(['name', 'description', 'image', 'price', 'currency', 'type', 'interval', 'status', 'success_url', 'inventory', 'metadata'])
            ->all();

        if (array_key_exists('slug', $data) && filled($data['slug']) && $data['slug'] !== $product->slug) {
            $attributes['slug'] = $this->uniqueSlug($product->workspace, $data['slug'], $product->id);
        }
        if (array_key_exists('price', $attributes)) {
            $attributes['price'] = max(0, (int) $attributes['price']);
        }
        if (array_key_exists('currency', $attributes)) {
            $attributes['currency'] = Str::upper((string) $attributes['currency']);
        }
        // A one-off price has no billing interval; leaving a stale one behind
        // would send Stripe a recurring price for a single purchase.
        if (($attributes['type'] ?? $product->type) !== 'subscription') {
            $attributes['interval'] = null;
        }

        $product->update($attributes);
        $this->audit->log('product.updated', $product, [], $product->workspace);

        return $product->fresh();
    }

    public function delete(Product $product): void
    {
        $this->audit->log('product.deleted', $product, [], $product->workspace);
        $product->delete();
    }

    private function uniqueSlug(Workspace $workspace, string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value) ?: 'product';
        $slug = $base;
        $i = 2;

        while (
            Product::withTrashed()
                ->where('workspace_id', $workspace->id)
                ->where('slug', $slug)
                ->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
                ->exists()
        ) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
