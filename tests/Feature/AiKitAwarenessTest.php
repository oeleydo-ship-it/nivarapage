<?php

use App\Models\Site;
use App\Services\Ai\AiPromptBuilder;
use App\Services\Ai\SiteKitProfile;

/** A page section as the editor stores it. */
function sect(string $type, array $props = []): array
{
    return ['id' => $type, 'type' => $type, 'version' => 1, 'hidden' => false, 'props' => $props];
}

/** Motion/measure conventions a kit page uses on every body section. */
function kitDesign(): array
{
    return ['animation' => 'fade-up', 'animationTrigger' => 'scroll', 'animationDuration' => 640, 'contentWidth' => 'wide'];
}

function cinderPage(): array
{
    return [
        sect('navbar.cinder'),
        sect('hero.cinder', kitDesign()),
        sect('services.cinder', kitDesign()),
        sect('story.cinder', kitDesign()),
        sect('footer.cinder'),
    ];
}

describe('kit detection', function () {
    it('recognises the kit a page is built from', function () {
        $kit = app(SiteKitProfile::class)->detect(new Site, cinderPage());

        expect($kit)->not->toBeNull();
        expect($kit['key'])->toBe('cinder');
        expect($kit['types'])->toContain('hero.cinder');
    });

    it('ignores generic block shapes that only look like a family', function () {
        $kit = app(SiteKitProfile::class)->detect(new Site, [
            sect('hero.centered'),
            sect('features.grid'),
            sect('cta.simple'),
        ]);

        expect($kit)->toBeNull();
    });

    it('picks the dominant kit when a page mixes them', function () {
        $kit = app(SiteKitProfile::class)->detect(new Site, [
            sect('navbar.voltera'),
            sect('hero.voltera'),
            sect('services.voltera'),
            sect('quote.halcyon'),
        ]);

        expect($kit['key'])->toBe('voltera');
    });

    it('treats a page with no sections as having no kit', function () {
        expect(app(SiteKitProfile::class)->detect(new Site, []))->toBeNull();
    });

    it('only counts families big enough to dress a whole page', function () {
        $kits = app(SiteKitProfile::class)->kits();

        expect($kits)->toHaveKey('cinder');
        expect($kits)->toHaveKey('voltera');
        // `cards`, `centered`, `grid` are block shapes shared across kits.
        expect($kits)->not->toHaveKey('cards');
        expect($kits)->not->toHaveKey('centered');
    });
});

describe('design conventions', function () {
    it('reads the motion and measure the page agrees on', function () {
        $design = app(SiteKitProfile::class)->designFrom(cinderPage());

        expect($design['animation'])->toBe('fade-up');
        expect($design['animationDuration'])->toBe(640);
        expect($design['contentWidth'])->toBe('wide');
    });

    it('ignores navigation and footer chrome when deciding', function () {
        $design = app(SiteKitProfile::class)->designFrom([
            sect('navbar.cinder', ['animation' => 'fade-down']),
            sect('hero.cinder', ['animation' => 'fade-up']),
            sect('services.cinder', ['animation' => 'fade-up']),
            sect('footer.cinder', ['animation' => 'none']),
        ]);

        expect($design['animation'])->toBe('fade-up');
    });

    it('does not let one odd section become the convention', function () {
        $design = app(SiteKitProfile::class)->designFrom([
            sect('hero.cinder', ['animation' => 'fade-up']),
            sect('services.cinder', ['animation' => 'zoom-in']),
        ]);

        expect($design)->not->toHaveKey('animation');
    });

    it('fills the conventions onto sections that left them out', function () {
        $filled = app(SiteKitProfile::class)->applyDesign(
            [sect('hero.cinder'), sect('services.cinder', ['animation' => 'zoom-in'])],
            kitDesign(),
        );

        expect($filled[0]['props']['animation'])->toBe('fade-up');
        expect($filled[0]['props']['contentWidth'])->toBe('wide');
        // A deliberate per-section choice is left alone.
        expect($filled[1]['props']['animation'])->toBe('zoom-in');
    });

    it('leaves the block content untouched', function () {
        $filled = app(SiteKitProfile::class)->applyDesign(
            [sect('hero.cinder', ['heading' => 'Warm homes'])],
            kitDesign(),
        );

        expect($filled[0]['props']['heading'])->toBe('Warm homes');
    });
});

describe('prompt built for a kit site', function () {
    it('tells the model to use the site kit and lists its blocks', function () {
        $site = new Site(['name' => 'Cinder & Row']);
        $prompt = app(AiPromptBuilder::class)->chatPrompt($site, [
            'page_name' => 'Home',
            'page_slug' => 'home',
            'current_content' => ['sections' => cinderPage()],
            'messages' => [['role' => 'user', 'content' => 'Add a section about our boiler servicing']],
        ]);

        expect($prompt)->toContain('DESIGN SYSTEM');
        expect($prompt)->toContain('Cinder');
        expect($prompt)->toContain('hero.cinder');
        expect($prompt)->toContain('Kit blocks — prefer these');
    });

    it('passes the page design conventions to the model', function () {
        $site = new Site(['name' => 'Cinder & Row']);
        $prompt = app(AiPromptBuilder::class)->chatPrompt($site, [
            'current_content' => ['sections' => cinderPage()],
            'messages' => [],
        ]);

        expect($prompt)->toContain('"animation":"fade-up"');
        expect($prompt)->toContain('"contentWidth":"wide"');
    });

    it('keeps the original blocks available as a fallback', function () {
        $site = new Site(['name' => 'Cinder & Row']);
        $prompt = app(AiPromptBuilder::class)->chatPrompt($site, [
            'current_content' => ['sections' => cinderPage()],
            'messages' => [],
        ]);

        expect($prompt)->toContain('Fallback original blocks');
        expect($prompt)->toContain('generated.composition');
    });

    it('still carries what the user is looking at', function () {
        $site = new Site(['name' => 'Cinder & Row']);
        $prompt = app(AiPromptBuilder::class)->chatPrompt($site, [
            'page_name' => 'Services',
            'page_slug' => 'services',
            'current_content' => ['sections' => cinderPage()],
            'selected_type' => 'hero.cinder',
            'selected_heading' => 'Warm homes, straight answers.',
            'messages' => [['role' => 'user', 'content' => 'Make this punchier']],
        ]);

        expect($prompt)->toContain('Current editor page: Services (/services)');
        expect($prompt)->toContain('Selected block: hero.cinder');
        expect($prompt)->toContain('Warm homes, straight answers.');
        expect($prompt)->toContain('Make this punchier');
    });

    it('falls back to original composition when the site uses no kit', function () {
        $site = new Site(['name' => 'Blank']);
        $prompt = app(AiPromptBuilder::class)->chatPrompt($site, [
            'current_content' => ['sections' => [sect('hero.centered')]],
            'messages' => [],
        ]);

        expect($prompt)->not->toContain('DESIGN SYSTEM');
        expect($prompt)->toContain('not using a template kit');
        expect($prompt)->toContain('generated.composition');
    });
});
