<?php

use App\Models\Product;
use App\Models\Site;
use App\Services\Commerce\ProductBlockService;
use App\Support\PageSchemaValidator;

it('resolves only selected active products owned by the site workspace', function () {
    ['workspace' => $workspace] = tenant();
    ['workspace' => $other] = tenant();
    $create = fn ($workspaceId, $name, $status) => Product::query()->create([
        'workspace_id' => $workspaceId, 'name' => $name, 'slug' => strtolower($name),
        'price' => 4900, 'currency' => 'USD', 'type' => 'one_time', 'status' => $status,
    ]);
    $first = $create($workspace->id, 'First', 'active');
    $second = $create($workspace->id, 'Second', 'active');
    $draft = $create($workspace->id, 'Draft', 'draft');
    $foreign = $create($other->id, 'Foreign', 'active');
    $site = new Site(['workspace_id' => $workspace->id]);
    foreach (['products.grid', 'products.featured', 'products.list'] as $type) {
        $content = ['schemaVersion' => 1, 'sections' => [[
            'id' => 'products', 'type' => $type, 'version' => 1, 'hidden' => false,
            'props' => ['productIds' => [$second->id, $draft->id, $foreign->id, $first->id, $second->id], 'productData' => [['name' => 'Forged']], 'productPreview' => true],
        ]]];
        app(PageSchemaValidator::class)->validate($content);
        $result = app(ProductBlockService::class)->hydrateContent($site, $content);
        $props = $result['sections'][0]['props'];
        expect(array_column($props['productData'], 'name'))->toBe(['Second', 'First'])
            ->and($props['productPreview'])->toBeFalse()
            ->and($props['productData'][0])->not->toHaveKey('workspace_id');
        $content['sections'][0]['props']['productIds'] = [];
        expect(app(ProductBlockService::class)->hydrateContent($site, $content)['sections'][0]['props']['productData'])->toBe([]);
    }
});
