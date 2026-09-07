<?php

use App\Models\Template;
use Database\Seeders\ConcourseTemplateSeeder;

it('installs six Concourse pages with registered blocks and working internal destinations', function () {
    $this->seed(ConcourseTemplateSeeder::class);
    $template = Template::where('slug', 'concourse')->firstOrFail();
    expect($template->pages)->toHaveCount(6)
        ->and($template->pages->where('is_homepage', true))->toHaveCount(1);
    $catalog = collect(json_decode(file_get_contents(resource_path('blocks/block-catalog.json')), true)['blocks'])->keyBy('type');
    expect($catalog->keys()->filter(fn ($type) => str_ends_with($type, '.concourse')))->toHaveCount(13);
    $slugs = $template->pages->pluck('slug')->map(fn ($slug) => '/'.$slug)->push('/')->all();
    foreach ($template->pages as $page) {
        $sections = $page->content_json['sections'];
        expect($sections[0]['type'])->toBe('navbar.concourse')
            ->and(end($sections)['type'])->toBe('footer.concourse');
        foreach ($sections as $section) {
            expect($catalog->has($section['type']))->toBeTrue();
            $walk = function ($props) use (&$walk, $slugs) {
                foreach ($props as $key => $value) {
                    if (is_array($value)) { $walk($value); continue; }
                    if (in_array($key, ['url', 'buttonUrl']) && is_string($value) && str_starts_with($value, '/')) {
                        expect($slugs)->toContain(explode('#', $value)[0]);
                    }
                }
            };
            $walk($section['props']);
        }
    }
    $this->seed(ConcourseTemplateSeeder::class);
    expect($template->fresh()->pages)->toHaveCount(6);
});
