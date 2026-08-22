<?php

use App\Models\Template;
use Database\Seeders\TemplateContent;
use Database\Seeders\TemplateSeeder;

/**
 * Every seeded template should ship with a sticky header. The default is
 * applied centrally in TemplateContent::section(), so these guard both the
 * helper's contract and the seeded result.
 */
describe('seeded navbars', function () {
    it('defaults a navbar section to sticky', function () {
        $section = TemplateContent::section('nav', 'navbar.cta', ['logo' => 'Acme']);

        expect($section['props']['sticky'])->toBeTrue();
    });

    it('lets a template opt out explicitly', function () {
        $section = TemplateContent::section('nav', 'navbar.cta', ['sticky' => false]);

        expect($section['props']['sticky'])->toBeFalse();
    });

    it('leaves non-navbar chrome alone', function () {
        // A topbar or sub-nav stacking under a sticky navbar helps nobody.
        $topbar = TemplateContent::section('top', 'topbar.northbook', []);
        $subnav = TemplateContent::section('sub', 'subnav.kindred', []);

        expect($topbar['props']['sticky'] ?? false)->toBeFalse();
        expect($subnav['props']['sticky'] ?? false)->toBeFalse();
    });

    it('does not touch ordinary content sections', function () {
        $hero = TemplateContent::section('hero', 'hero.centered', []);

        expect($hero['props'])->not->toHaveKey('sticky');
    });

    it('ships every seeded template navbar sticky', function () {
        $this->seed(TemplateSeeder::class);

        $navbars = 0;
        $notSticky = [];

        foreach (Template::with('pages')->get() as $template) {
            foreach ($template->pages as $page) {
                foreach (($page->content_json['sections'] ?? []) as $section) {
                    if (! str_starts_with((string) ($section['type'] ?? ''), 'navbar.')) {
                        continue;
                    }
                    $navbars++;
                    if (($section['props']['sticky'] ?? null) !== true) {
                        $notSticky[] = $template->slug.'/'.$page->slug.' '.$section['type'];
                    }
                }
            }
        }

        expect($navbars)->toBeGreaterThan(100);
        expect($notSticky)->toBe([]);
    });
});
