<?php

use App\Models\Template;
use Database\Seeders\TemplateSeeder;
use Laravel\Sanctum\Sanctum;

it('seeds twenty published multi-page templates with distinct themes', function () {
    $this->seed(TemplateSeeder::class);

    $slugs = ['restaurant', 'business', 'barber', 'saas', 'agency', 'portfolio', 'construction', 'realty', 'clinic', 'consulting', 'aitool', 'inkline', 'brightline', 'avivo', 'chatdeck', 'genesis', 'halewren', 'verdara', 'solara', 'moksha'];
    $templates = Template::query()->whereIn('slug', $slugs)->get()->keyBy('slug');

    expect($templates)->toHaveCount(20);

    foreach ($templates as $template) {
        expect($template->is_active)->toBeTrue()
            ->and($template->pages)->toHaveCount(5)
            ->and($template->pages->firstWhere('is_homepage', true))->not->toBeNull();
    }

    expect($templates['restaurant']->theme_tokens['headingFont'])->toContain('Playfair Display')
        ->and($templates['business']->name)->toBe('Small business')
        ->and($templates['barber']->theme_tokens['headingFont'])->toContain('Cinzel')
        ->and($templates['saas']->name)->toBe('Flypay')
        ->and($templates['agency']->name)->toBe('Lumen')
        ->and($templates['agency']->theme_tokens['headingFont'])->toContain('Syne')
        ->and($templates['portfolio']->name)->toBe('Northframe')
        ->and($templates['portfolio']->theme_tokens['headingFont'])->toContain('Instrument Serif')
        ->and($templates['construction']->name)->toBe('Ridge & Beam')
        ->and($templates['construction']->theme_tokens['headingFont'])->toContain('Oswald')
        ->and($templates['realty']->name)->toBe('Haven')
        ->and($templates['realty']->theme_tokens['headingFont'])->toContain('Fraunces')
        ->and($templates['clinic']->name)->toBe('Cedar Clinic')
        ->and($templates['clinic']->theme_tokens['headingFont'])->toContain('Cormorant Garamond')
        ->and($templates['consulting']->name)->toBe('Ashcroft')
        ->and($templates['consulting']->theme_tokens['headingFont'])->toContain('Newsreader')
        ->and($templates['aitool']->name)->toBe('AI Tool')
        ->and($templates['aitool']->theme_tokens['headingFont'])->toContain('Inter')
        ->and($templates['aitool']->theme_tokens['primary'])->toBe('#8b5cf6')
        ->and($templates['aitool']->theme_tokens['background'])->toBe('#050014')
        ->and($templates['inkline']->name)->toBe('Inkline')
        ->and($templates['inkline']->theme_tokens['headingFont'])->toContain('Inter')
        ->and($templates['inkline']->theme_tokens['lightBackground'])->toBe('#ffffff')
        ->and($templates['inkline']->theme_tokens['defaultScheme'])->toBe('dark')
        ->and($templates['brightline']->name)->toBe('Brightline')
        ->and($templates['brightline']->theme_tokens['headingFont'])->toContain('Inter')
        ->and($templates['brightline']->theme_tokens['primary'])->toBe('#3b82f6')
        ->and($templates['brightline']->theme_tokens['background'])->toBe('#ffffff')
        ->and($templates['avivo']->name)->toBe('Avivo')
        ->and($templates['avivo']->theme_tokens['headingFont'])->toContain('Fraunces')
        ->and($templates['avivo']->theme_tokens['accent'])->toBe('#FEE232')
        ->and($templates['avivo']->theme_tokens['primary'])->toBe('#5D5DFF')
        ->and($templates['chatdeck']->name)->toBe('ChatDeck')
        ->and($templates['chatdeck']->theme_tokens['headingFont'])->toContain('Inter')
        ->and($templates['chatdeck']->theme_tokens['primary'])->toBe('#111111')
        ->and($templates['chatdeck']->theme_tokens['surface'])->toBe('#F9FAFB')
        ->and($templates['genesis']->name)->toBe('Aether')
        ->and($templates['genesis']->theme_tokens['headingFont'])->toContain('Poppins')
        ->and($templates['genesis']->theme_tokens['primary'])->toBe('#F26A06')
        ->and($templates['genesis']->theme_tokens['accent'])->toBe('#D10A8A')
        ->and($templates['genesis']->theme_tokens['secondary'])->toBe('#2E08CF')
        ->and($templates['genesis']->theme_tokens['background'])->toBe('#000000')
        ->and($templates['halewren']->name)->toBe('Hale Wren')
        ->and($templates['halewren']->theme_tokens['headingFont'])->toContain('Inter')
        ->and($templates['halewren']->theme_tokens['background'])->toBe('#F8F7F4')
        ->and($templates['halewren']->theme_tokens['secondary'])->toBe('#26231D')
        ->and($templates['halewren']->theme_tokens['surface'])->toBe('#C1C3C0')
        ->and($templates['verdara']->name)->toBe('Verdara')
        ->and($templates['verdara']->theme_tokens['headingFont'])->toContain('Inter')
        ->and($templates['verdara']->theme_tokens['primary'])->toBe('#4ADE80')
        ->and($templates['verdara']->theme_tokens['background'])->toBe('#FFFFFF')
        ->and($templates['verdara']->theme_tokens['buttonRadius'])->toBe('16px')
        ->and($templates['solara']->name)->toBe('Solara')
        ->and($templates['solara']->theme_tokens['headingFont'])->toContain('Inter')
        ->and($templates['solara']->theme_tokens['primary'])->toBe('#FF6B1A')
        ->and($templates['solara']->theme_tokens['accent'])->toBe('#8B7CF6')
        ->and($templates['solara']->theme_tokens['buttonRadius'])->toBe('12px')
        ->and($templates['moksha']->name)->toBe('Nivara')
        ->and($templates['moksha']->theme_tokens['headingFont'])->toContain('Inter')
        ->and($templates['moksha']->theme_tokens['primary'])->toBe('#5437FF')
        ->and($templates['moksha']->theme_tokens['buttonRadius'])->toBe('999px');
});

/**
 * Two templates once shipped as "Meridian" - the consulting kit and the SaaS
 * kit - so the gallery listed the same name twice and neither could be told
 * apart. Slugs were unique, which is why nothing caught it.
 */
it('gives every template a name of its own', function () {
    $this->seed(TemplateSeeder::class);

    $names = Template::query()->pluck('name')->all();
    $duplicates = array_keys(array_filter(array_count_values($names), fn (int $count) => $count > 1));

    expect($duplicates)->toBe([]);
    expect(count($names))->toBe(count(array_unique($names)));
});

it('gives every template a slug of its own', function () {
    $this->seed(TemplateSeeder::class);

    $slugs = Template::query()->pluck('slug')->all();
    expect(count($slugs))->toBe(count(array_unique($slugs)));
});

it('applies a template theme when a tenant creates a website', function () {
    $this->seed(TemplateSeeder::class);
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    $template = Template::query()->where('slug', 'barber')->firstOrFail();
    $headers = authHeaders($user, $workspace);

    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', [
            'name' => 'Iron Oak Shop',
            'subdomain' => 'iron-oak',
            'template_id' => $template->id,
        ])
        ->assertCreated()
        ->json('data.id');

    $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/theme")
        ->assertOk()
        ->assertJsonPath('data.tokens.headingFont', $template->theme_tokens['headingFont'])
        ->assertJsonPath('data.tokens.primary', '#c9a227');

    $pages = $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/pages")
        ->assertOk()
        ->json('data');

    expect($pages)->toHaveCount(5);

    $home = collect($pages)->firstWhere('is_homepage', true);
    $types = collect($home['draft']['content']['sections'] ?? [])->pluck('type');
    expect($types)->toContain('hero.background')
        ->and($types)->toContain('navbar.cta');
});

it('applies the Flypay template with editable landing blocks', function () {
    $this->seed(TemplateSeeder::class);
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    $template = Template::query()->where('slug', 'saas')->firstOrFail();
    $headers = authHeaders($user, $workspace);

    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', [
            'name' => 'Flypay Demo',
            'subdomain' => 'flypay-demo',
            'template_id' => $template->id,
        ])
        ->assertCreated()
        ->json('data.id');

    $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/theme")
        ->assertOk()
        ->assertJsonPath('data.tokens.headingFont', $template->theme_tokens['headingFont'])
        ->assertJsonPath('data.tokens.primary', '#0f172a');

    $pages = $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/pages")
        ->assertOk()
        ->json('data');

    expect($pages)->toHaveCount(5);

    $home = collect($pages)->firstWhere('is_homepage', true);
    $types = collect($home['draft']['content']['sections'] ?? [])->pluck('type');
    expect($types)->toContain('navbar.cta')
        ->and($types)->toContain('hero.split')
        ->and($types)->toContain('proof.bar')
        ->and($types)->toContain('features.cards')
        ->and($types)->toContain('pricing.three_columns')
        ->and($types)->toContain('faq.accordion');
});

it('applies the AI Tool template with editable dark SaaS blocks', function () {
    $this->seed(TemplateSeeder::class);
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    $template = Template::query()->where('slug', 'aitool')->firstOrFail();
    $headers = authHeaders($user, $workspace);

    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', [
            'name' => 'AI Tool Demo',
            'subdomain' => 'aitool-demo',
            'template_id' => $template->id,
        ])
        ->assertCreated()
        ->json('data.id');

    $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/theme")
        ->assertOk()
        ->assertJsonPath('data.tokens.headingFont', $template->theme_tokens['headingFont'])
        ->assertJsonPath('data.tokens.primary', '#8b5cf6');

    $pages = $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/pages")
        ->assertOk()
        ->json('data');

    expect($pages)->toHaveCount(5);

    $slugs = collect($pages)->pluck('slug');
    expect($slugs)->toContain('home', 'about', 'pricing', 'blog', 'contact');

    $home = collect($pages)->firstWhere('is_homepage', true);
    $types = collect($home['draft']['content']['sections'] ?? [])->pluck('type');
    expect($types)->toContain('navbar.cta')
        ->and($types)->toContain('hero.saas')
        ->and($types)->toContain('features.cards')
        ->and($types)->toContain('pricing.three_columns')
        ->and($types)->toContain('form.contact')
        ->and($types)->toContain('cta.simple');

    $about = collect($pages)->firstWhere('slug', 'about');
    $aboutTypes = collect($about['draft']['content']['sections'] ?? [])->pluck('type');
    expect($aboutTypes)->toContain('hero.page')
        ->and($aboutTypes)->toContain('team.cards')
        ->and($aboutTypes)->toContain('content.video');

    $pricing = collect($pages)->firstWhere('slug', 'pricing');
    $pricingTypes = collect($pricing['draft']['content']['sections'] ?? [])->pluck('type');
    expect($pricingTypes)->toContain('hero.page')
        ->and($pricingTypes)->toContain('pricing.three_columns')
        ->and($pricingTypes)->toContain('faq.accordion');
});

it('applies the Inkline template with a dark and light switcher', function () {
    $this->seed(TemplateSeeder::class);
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    $template = Template::query()->where('slug', 'inkline')->firstOrFail();
    $headers = authHeaders($user, $workspace);

    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', [
            'name' => 'Inkline Demo',
            'subdomain' => 'inkline-demo',
            'template_id' => $template->id,
        ])
        ->assertCreated()
        ->json('data.id');

    $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/theme")
        ->assertOk()
        ->assertJsonPath('data.tokens.primary', '#8b5cf6')
        ->assertJsonPath('data.tokens.lightBackground', '#ffffff')
        ->assertJsonPath('data.tokens.defaultScheme', 'dark');

    $pages = $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/pages")
        ->assertOk()
        ->json('data');

    expect($pages)->toHaveCount(5);

    $home = collect($pages)->firstWhere('is_homepage', true);
    $sections = collect($home['draft']['content']['sections'] ?? []);
    $types = $sections->pluck('type');
    $nav = $sections->firstWhere('type', 'navbar.cta');

    expect($types)->toContain('navbar.cta')
        ->and($types)->toContain('hero.saas')
        ->and($types)->toContain('pricing.three_columns')
        ->and($nav['props']['showThemeSwitch'] ?? false)->toBeTrue()
        ->and($nav['props']['logo'] ?? null)->toBe('Inkline');
});

it('applies the Brightline template including skills map and appointment blocks', function () {
    $this->seed(TemplateSeeder::class);
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    $template = Template::query()->where('slug', 'brightline')->firstOrFail();
    $headers = authHeaders($user, $workspace);

    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', [
            'name' => 'Brightline Demo',
            'subdomain' => 'brightline-demo',
            'template_id' => $template->id,
        ])
        ->assertCreated()
        ->json('data.id');

    $pages = $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/pages")
        ->assertOk()
        ->json('data');

    expect($pages)->toHaveCount(5);

    $allTypes = collect($pages)->flatMap(fn ($page) => collect($page['draft']['content']['sections'] ?? [])->pluck('type'));
    expect($allTypes)->toContain('content.skills')
        ->and($allTypes)->toContain('content.map')
        ->and($allTypes)->toContain('content.locations')
        ->and($allTypes)->toContain('form.appointment');
});

it('applies the Avivo studio template with the new reusable blocks', function () {
    $this->seed(TemplateSeeder::class);
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    $template = Template::query()->where('slug', 'avivo')->firstOrFail();
    $headers = authHeaders($user, $workspace);

    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', [
            'name' => 'Avivo Demo',
            'subdomain' => 'avivo-demo',
            'template_id' => $template->id,
        ])
        ->assertCreated()
        ->json('data.id');

    $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/theme")
        ->assertOk()
        ->assertJsonPath('data.tokens.accent', '#FEE232');

    $pages = $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/pages")
        ->assertOk()
        ->json('data');

    expect($pages)->toHaveCount(5);

    $home = collect($pages)->firstWhere('is_homepage', true);
    $types = collect($home['draft']['content']['sections'] ?? [])->pluck('type');
    expect($types)->toContain('hero.studio')
        ->and($types)->toContain('content.capabilities')
        ->and($types)->toContain('cta.bar')
        ->and($types)->toContain('gallery.projects')
        ->and($types)->toContain('testimonials.bento')
        ->and($types)->toContain('pricing.duo')
        ->and($types)->toContain('cta.gradient');
});

it('applies the ChatDeck template with the new reusable blocks', function () {
    $this->seed(TemplateSeeder::class);
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    $template = Template::query()->where('slug', 'chatdeck')->firstOrFail();
    $headers = authHeaders($user, $workspace);

    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', [
            'name' => 'ChatDeck Demo',
            'subdomain' => 'chatdeck-demo',
            'template_id' => $template->id,
        ])
        ->assertCreated()
        ->json('data.id');

    $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/theme")
        ->assertOk()
        ->assertJsonPath('data.tokens.primary', '#111111')
        ->assertJsonPath('data.tokens.headingFont', 'Inter, system-ui, sans-serif');

    $pages = $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/pages")
        ->assertOk()
        ->json('data');

    expect($pages)->toHaveCount(5);

    $home = collect($pages)->firstWhere('is_homepage', true);
    $types = collect($home['draft']['content']['sections'] ?? [])->pluck('type');
    expect($types)->toContain('hero.product')
        ->and($types)->toContain('features.minimal')
        ->and($types)->toContain('team.circle')
        ->and($types)->toContain('testimonials.compact')
        ->and($types)->toContain('pricing.three_columns')
        ->and($types)->toContain('faq.accordion');
});

it('applies the Aether template with glow hero and accent-rail blocks', function () {
    $this->seed(TemplateSeeder::class);
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    $template = Template::query()->where('slug', 'genesis')->firstOrFail();
    $headers = authHeaders($user, $workspace);

    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', [
            'name' => 'Aether Demo',
            'subdomain' => 'genesis-demo',
            'template_id' => $template->id,
        ])
        ->assertCreated()
        ->json('data.id');

    $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/theme")
        ->assertOk()
        ->assertJsonPath('data.tokens.primary', '#F26A06')
        ->assertJsonPath('data.tokens.headingFont', 'Poppins, system-ui, sans-serif');

    $pages = $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/pages")
        ->assertOk()
        ->json('data');

    expect($pages)->toHaveCount(5);

    $home = collect($pages)->firstWhere('is_homepage', true);
    $types = collect($home['draft']['content']['sections'] ?? [])->pluck('type');
    expect($types)->toContain('hero.glow')
        ->and($types)->toContain('features.rail')
        ->and($types)->toContain('process.zigzag')
        ->and($types)->toContain('testimonials.rail')
        ->and($types)->toContain('pricing.three_columns')
        ->and($types)->toContain('faq.accordion');
});

it('applies the Verdara template with green SaaS kit blocks', function () {
    $this->seed(TemplateSeeder::class);
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    $template = Template::query()->where('slug', 'verdara')->firstOrFail();
    $headers = authHeaders($user, $workspace);

    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', [
            'name' => 'Verdara Demo',
            'subdomain' => 'verdara-demo',
            'template_id' => $template->id,
        ])
        ->assertCreated()
        ->json('data.id');

    $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/theme")
        ->assertOk()
        ->assertJsonPath('data.tokens.primary', '#4ADE80')
        ->assertJsonPath('data.tokens.headingFont', 'Inter, system-ui, sans-serif');

    $pages = $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/pages")
        ->assertOk()
        ->json('data');

    expect($pages)->toHaveCount(5);

    $home = collect($pages)->firstWhere('is_homepage', true);
    $types = collect($home['draft']['content']['sections'] ?? [])->pluck('type');
    expect($types)->toContain('navbar.verdara')
        ->and($types)->toContain('hero.verdara')
        ->and($types)->toContain('proof.verdara')
        ->and($types)->toContain('features.verdara')
        ->and($types)->toContain('cta.crew')
        ->and($types)->toContain('testimonials.verdara')
        ->and($types)->toContain('pricing.verdara')
        ->and($types)->toContain('cta.verdara')
        ->and($types)->toContain('footer.verdara');
});

it('applies the Solara template with the orange SaaS kit blocks', function () {
    $this->seed(TemplateSeeder::class);
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    $template = Template::query()->where('slug', 'solara')->firstOrFail();
    $headers = authHeaders($user, $workspace);

    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', [
            'name' => 'Solara Demo',
            'subdomain' => 'solara-demo',
            'template_id' => $template->id,
        ])
        ->assertCreated()
        ->json('data.id');

    $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/theme")
        ->assertOk()
        ->assertJsonPath('data.tokens.primary', '#FF6B1A')
        ->assertJsonPath('data.tokens.headingFont', 'Inter, system-ui, sans-serif');

    $pages = $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/pages")
        ->assertOk()
        ->json('data');

    expect($pages)->toHaveCount(5);

    $home = collect($pages)->firstWhere('is_homepage', true);
    $types = collect($home['draft']['content']['sections'] ?? [])->pluck('type');
    expect($types)->toContain('navbar.solara')
        ->and($types)->toContain('hero.solara')
        ->and($types)->toContain('stats.solara')
        ->and($types)->toContain('features.solara')
        ->and($types)->toContain('faq.solara')
        ->and($types)->toContain('team.solara')
        ->and($types)->toContain('testimonials.solara')
        ->and($types)->toContain('pricing.solara')
        ->and($types)->toContain('footer.solara');
});

it('applies the Moksha template with the purple yoga kit blocks', function () {
    $this->seed(TemplateSeeder::class);
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    $template = Template::query()->where('slug', 'moksha')->firstOrFail();
    $headers = authHeaders($user, $workspace);

    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', [
            'name' => 'Nivara Demo',
            'subdomain' => 'moksha-demo',
            'template_id' => $template->id,
        ])
        ->assertCreated()
        ->json('data.id');

    $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/theme")
        ->assertOk()
        ->assertJsonPath('data.tokens.primary', '#5437FF')
        ->assertJsonPath('data.tokens.headingFont', 'Inter, system-ui, sans-serif');

    $pages = $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/pages")
        ->assertOk()
        ->json('data');

    expect($pages)->toHaveCount(5);

    $home = collect($pages)->firstWhere('is_homepage', true);
    $types = collect($home['draft']['content']['sections'] ?? [])->pluck('type');
    expect($types)->toContain('navbar.moksha')
        ->and($types)->toContain('hero.moksha')
        ->and($types)->toContain('about.moksha')
        ->and($types)->toContain('features.moksha')
        ->and($types)->toContain('benefits.moksha')
        ->and($types)->toContain('story.moksha')
        ->and($types)->toContain('testimonials.moksha')
        ->and($types)->toContain('pricing.moksha')
        ->and($types)->toContain('faq.moksha')
        ->and($types)->toContain('cta.moksha')
        ->and($types)->toContain('footer.moksha');
});

it('fills an existing blank site when Verdara is applied later', function () {
    $this->seed(TemplateSeeder::class);
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);
    $headers = authHeaders($user, $workspace);

    $siteId = $this->withHeaders($headers)
        ->postJson('/api/v1/sites', [
            'name' => 'Blank Then Verdara',
            'subdomain' => 'blank-then-verdara',
        ])
        ->assertCreated()
        ->json('data.id');

    $home = $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/pages")
        ->assertOk()
        ->json('data.0');
    expect($home['draft']['content']['sections'] ?? [])->toBe([]);

    $template = Template::query()->where('slug', 'verdara')->firstOrFail();
    $this->withHeaders($headers)
        ->postJson("/api/v1/sites/{$siteId}/apply-template", ['template_id' => $template->id])
        ->assertOk();

    $pages = $this->withHeaders($headers)
        ->getJson("/api/v1/sites/{$siteId}/pages")
        ->assertOk()
        ->json('data');

    expect($pages)->toHaveCount(5);
    $home = collect($pages)->firstWhere('is_homepage', true);
    expect(collect($home['draft']['content']['sections'] ?? [])->pluck('type')->all())
        ->toContain('navbar.verdara', 'hero.verdara', 'footer.verdara');
});

it('lists published templates with a live homepage preview', function () {
    $this->seed(TemplateSeeder::class);
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    $payload = $this->withHeaders(authHeaders($user, $workspace))
        ->getJson('/api/v1/templates')
        ->assertOk()
        ->json('data');

    $slugs = collect($payload)->pluck('slug');
    expect($slugs)->toContain('restaurant', 'business', 'barber', 'saas', 'agency', 'portfolio', 'construction', 'realty', 'clinic', 'consulting', 'aitool', 'inkline', 'brightline', 'avivo', 'chatdeck', 'genesis', 'halewren', 'verdara', 'solara', 'moksha');

    $flypay = collect($payload)->firstWhere('slug', 'saas');
    $types = collect($flypay['preview']['sections'] ?? [])->pluck('type');

    expect($flypay['name'])->toBe('Flypay')
        ->and($flypay['is_active'])->toBeTrue()
        ->and($flypay['is_featured'])->toBeTrue()
        ->and($types)->toContain('navbar.cta')
        ->and($types)->toContain('hero.split')
        ->and($types)->toContain('proof.bar')
        ->and($types)->not->toContain('footer.multi_column')
        ->and(collect($payload)->every(fn ($row) => is_array($row['preview']['sections'] ?? null) && $row['preview']['sections'] !== []))->toBeTrue();

    $aitool = collect($payload)->firstWhere('slug', 'aitool');
    $aiTypes = collect($aitool['preview']['sections'] ?? [])->pluck('type');
    expect($aitool['name'])->toBe('AI Tool')
        ->and($aitool['is_featured'])->toBeTrue()
        ->and($aiTypes)->toContain('hero.saas')
        ->and($aiTypes)->toContain('pricing.three_columns')
        ->and($aiTypes)->not->toContain('footer.multi_column');

    $inkline = collect($payload)->firstWhere('slug', 'inkline');
    $inkTypes = collect($inkline['preview']['sections'] ?? [])->pluck('type');
    expect($inkline['name'])->toBe('Inkline')
        ->and($inkline['is_featured'])->toBeTrue()
        ->and($inkTypes)->toContain('hero.saas')
        ->and($inkTypes)->toContain('navbar.cta')
        ->and($inkTypes)->not->toContain('footer.multi_column');

    $brightline = collect($payload)->firstWhere('slug', 'brightline');
    $brightTypes = collect($brightline['preview']['sections'] ?? [])->pluck('type');
    expect($brightline['name'])->toBe('Brightline')
        ->and($brightline['is_featured'])->toBeTrue()
        ->and($brightTypes)->toContain('navbar.cta')
        ->and($brightTypes)->toContain('hero.split')
        ->and($brightTypes)->toContain('features.showcase')
        ->and($brightTypes)->toContain('services.cards')
        ->and($brightTypes)->not->toContain('footer.multi_column');

    $genesis = collect($payload)->firstWhere('slug', 'genesis');
    $genesisTypes = collect($genesis['preview']['sections'] ?? [])->pluck('type');
    expect($genesis['name'])->toBe('Aether')
        ->and($genesis['is_featured'])->toBeTrue()
        ->and($genesisTypes)->toContain('hero.glow')
        ->and($genesisTypes)->toContain('features.rail')
        ->and($genesisTypes)->not->toContain('footer.multi_column');

    $hale = collect($payload)->firstWhere('slug', 'halewren');
    $haleTypes = collect($hale['preview']['sections'] ?? [])->pluck('type');
    expect($hale['name'])->toBe('Hale Wren')
        ->and($hale['is_featured'])->toBeTrue()
        ->and($haleTypes)->toContain('hero.panel')
        ->and($haleTypes)->toContain('content.markers')
        ->and($haleTypes)->not->toContain('footer.simple');

    $verdara = collect($payload)->firstWhere('slug', 'verdara');
    $verdaraTypes = collect($verdara['preview']['sections'] ?? [])->pluck('type');
    expect($verdara['name'])->toBe('Verdara')
        ->and($verdara['is_featured'])->toBeTrue()
        ->and($verdaraTypes)->toContain('hero.verdara')
        ->and($verdaraTypes)->toContain('features.verdara')
        ->and($verdaraTypes)->toContain('pricing.verdara')
        ->and($verdaraTypes)->not->toContain('footer.multi_column');

    $solara = collect($payload)->firstWhere('slug', 'solara');
    $solaraTypes = collect($solara['preview']['sections'] ?? [])->pluck('type');
    expect($solara['name'])->toBe('Solara')
        ->and($solara['is_featured'])->toBeTrue()
        ->and($solaraTypes)->toContain('hero.solara')
        ->and($solaraTypes)->toContain('features.solara')
        ->and($solaraTypes)->toContain('pricing.solara')
        ->and($solaraTypes)->not->toContain('footer.multi_column');

    $moksha = collect($payload)->firstWhere('slug', 'moksha');
    $mokshaTypes = collect($moksha['preview']['sections'] ?? [])->pluck('type');
    expect($moksha['name'])->toBe('Nivara')
        ->and($moksha['is_featured'])->toBeTrue()
        ->and($mokshaTypes)->toContain('hero.moksha')
        ->and($mokshaTypes)->toContain('features.moksha')
        ->and($mokshaTypes)->toContain('pricing.moksha')
        ->and($mokshaTypes)->not->toContain('footer.multi_column');
});

it('loads a template by slug with full page content for the preview tab', function () {
    $this->seed(TemplateSeeder::class);
    ['user' => $user, 'workspace' => $workspace] = tenant();
    Sanctum::actingAs($user);

    $payload = $this->withHeaders(authHeaders($user, $workspace))
        ->getJson('/api/v1/templates/chatdeck')
        ->assertOk()
        ->assertJsonPath('data.slug', 'chatdeck')
        ->json('data');

    $home = collect($payload['pages'] ?? [])->firstWhere('is_homepage', true);
    $types = collect($home['content_json']['sections'] ?? [])->pluck('type');
    expect($types)->toContain('hero.product')
        ->and($types)->toContain('footer.multi_column');
});
