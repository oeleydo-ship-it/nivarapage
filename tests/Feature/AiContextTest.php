<?php

use App\Models\Page;
use App\Models\Site;
use App\Services\Ai\AiPromptBuilder;
use App\Services\PageService;
use Laravel\Sanctum\Sanctum;

/**
 * What the model is told about the site it is editing.
 *
 * The prompt used to describe the current page as a list of block types and
 * headings, so "rewrite this to match the rest of the site" was asked of a
 * model that had never seen a word the site says. Copy, the site's own
 * description and the neighbouring pages are all part of the brief now.
 */

/** @param array<string, mixed> $props */
function ctxSection(string $type, array $props): array
{
    return ['id' => $type, 'type' => $type, 'version' => 1, 'hidden' => false, 'props' => $props];
}

it('shows the model the copy on the page, not just the block types', function () {
    $prompt = app(AiPromptBuilder::class)->chatPrompt(new Site(['name' => 'Anchorline']), [
        'page_name' => 'Services',
        'page_slug' => 'services',
        'messages' => [['role' => 'user', 'content' => 'Rewrite this in a warmer tone.']],
        'current_content' => ['sections' => [
            ctxSection('hero.anchor', [
                'eyebrow' => 'Services',
                'heading' => 'Your Freight, Our Priority',
                'description' => 'Air, sea and road freight moved by people who answer the phone.',
            ]),
            ctxSection('services.anchor', [
                'heading' => 'Our Services',
                'items' => [
                    ['title' => 'Customs Clearance', 'text' => 'Every document the destination asks for.'],
                    ['title' => 'Sea Freight (LCL/FCL)', 'text' => 'Consolidated or full container loads.'],
                ],
            ]),
        ]],
    ]);

    expect($prompt)->toContain('Your Freight, Our Priority')
        ->and($prompt)->toContain('eyebrow: Services')
        ->and($prompt)->toContain('Air, sea and road freight moved by people who answer the phone.')
        ->and($prompt)->toContain('Customs Clearance')
        ->and($prompt)->toContain('Sea Freight (LCL/FCL)');
});

it('flattens markup and collapses whitespace so the brief stays readable', function () {
    $prompt = app(AiPromptBuilder::class)->chatPrompt(new Site(['name' => 'Anchorline']), [
        'messages' => [['role' => 'user', 'content' => 'Tighten this.']],
        'current_content' => ['sections' => [
            ctxSection('feature.anchor', [
                'heading' => 'Complete logistics',
                'body' => "<p>We deliver   <strong>tailored</strong>\n\nsolutions.</p>",
            ]),
        ]],
    ]);

    expect($prompt)->toContain('copy: We deliver tailored solutions.')
        ->and($prompt)->not->toContain('<strong>');
});

it('tells the model how the site describes itself', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $site = test()->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->postJson('/api/v1/sites', ['name' => 'Anchorline', 'subdomain' => 'anchorctx'])
        ->json('data');

    $model = Site::query()->findOrFail($site['id']);
    $model->settings()->updateOrCreate(['site_id' => $model->id], [
        'default_description' => 'Freight forwarding across Europe and the Gulf since 2011.',
    ]);

    $prompt = app(AiPromptBuilder::class)->chatPrompt($model->fresh('settings'), [
        'messages' => [['role' => 'user', 'content' => 'Add a contact page.']],
    ]);

    expect($prompt)->toContain('Freight forwarding across Europe and the Gulf since 2011.');
});

it('describes the neighbouring pages so a new page joins the site', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $created = test()->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->postJson('/api/v1/sites', ['name' => 'Anchorline', 'subdomain' => 'anchorsib'])
        ->json('data');

    $site = Site::query()->findOrFail($created['id']);
    $home = Page::query()->where('site_id', $site->id)->firstOrFail();
    app(PageService::class)->saveDraft($home, $user, ['schemaVersion' => 1, 'sections' => [
        ctxSection('hero.anchor', ['heading' => 'Your Freight, Our Priority']),
    ]]);

    $prompt = app(AiPromptBuilder::class)->chatPrompt($site->fresh(), [
        'page_name' => 'About',
        'page_slug' => 'about',
        'messages' => [['role' => 'user', 'content' => 'Write an about page.']],
    ]);

    expect($prompt)->toContain('Other pages on this site')
        ->and($prompt)->toContain('Your Freight, Our Priority');
});

it('leaves the page being edited out of its own neighbours list', function () {
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $created = test()->withHeaders(['X-Workspace-Id' => (string) $workspace->id])
        ->postJson('/api/v1/sites', ['name' => 'Anchorline', 'subdomain' => 'anchorself'])
        ->json('data');

    $site = Site::query()->findOrFail($created['id']);
    $home = Page::query()->where('site_id', $site->id)->firstOrFail();
    app(PageService::class)->saveDraft($home, $user, ['schemaVersion' => 1, 'sections' => [
        ctxSection('hero.anchor', ['heading' => 'Only Page Here']),
    ]]);

    $prompt = app(AiPromptBuilder::class)->chatPrompt($site->fresh(), [
        'page_name' => $home->name,
        'page_slug' => $home->slug,
        'messages' => [['role' => 'user', 'content' => 'Rewrite this page.']],
    ]);

    expect($prompt)->not->toContain('Other pages on this site');
});

it('tells the model that a brief with a business in it is enough to build from', function () {
    $system = app(AiPromptBuilder::class)->chatSystemPrompt(null);

    expect($system)->toContain('reply is only for a genuinely ambiguous request')
        ->and($system)->toContain('established voice');
});
