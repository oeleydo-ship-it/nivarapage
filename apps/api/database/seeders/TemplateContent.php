<?php

namespace Database\Seeders;

class TemplateContent
{
    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    public static function section(string $id, string $type, array $props = []): array
    {
        $defaults = self::blockDefaults($type);
        if (str_contains($type, '.cinder')) {
            $isLoadBlock = in_array($type, ['navbar.cinder', 'hero.cinder'], true);
            $defaults = array_replace($defaults, [
                'animation' => $type === 'navbar.cinder' ? 'fade-down' : ($type === 'hero.cinder' ? 'fade' : 'fade-up'),
                'animationDuration' => $type === 'hero.cinder' ? 1100 : 780,
                'animationDelay' => $type === 'hero.cinder' ? 80 : 0,
                'animationTrigger' => $isLoadBlock ? 'load' : 'scroll',
            ]);
        }
        if (str_contains($type, '.lumen')) {
            $isLoadBlock = in_array($type, ['navbar.lumen', 'hero.lumen'], true);
            $defaults = array_replace($defaults, [
                'animation' => $type === 'navbar.lumen' ? 'fade-down' : ($type === 'hero.lumen' ? 'fade' : 'fade-up'),
                'animationDuration' => $type === 'hero.lumen' ? 900 : 680,
                'animationDelay' => $type === 'hero.lumen' ? 60 : 0,
                'animationTrigger' => $isLoadBlock ? 'load' : 'scroll',
            ]);
        }

        $resolved = array_replace($defaults, $props);

        // Every seeded navbar sticks to the top unless the template asked for
        // something else. Checked against $props rather than the merged set so
        // an explicit 'sticky' => false in a template still wins. Deliberately
        // limited to navbar.*: a topbar or sub-nav stacking under a sticky
        // navbar is not what anyone wants.
        if (str_starts_with($type, 'navbar.') && ! array_key_exists('sticky', $props)) {
            $resolved['sticky'] = true;
        }

        return [
            'id' => $id,
            'type' => $type,
            'version' => 1,
            'hidden' => false,
            // Persist the full editable prop set. This keeps partial template
            // overrides visually complete and exposes every registered field
            // immediately when the section is opened in the builder.
            'props' => $resolved,
        ];
    }

    /** @return array<string, mixed> */
    private static function blockDefaults(string $type): array
    {
        static $defaults = null;

        if ($defaults === null) {
            $defaults = [];
            $path = dirname(__DIR__, 2).'/resources/blocks/block-catalog.json';
            $catalog = is_file($path) ? json_decode((string) file_get_contents($path), true) : null;
            foreach (($catalog['blocks'] ?? []) as $block) {
                if (is_string($block['type'] ?? null) && is_array($block['defaultProps'] ?? null)) {
                    $defaults[$block['type']] = $block['defaultProps'];
                }
            }
        }

        return is_array($defaults[$type] ?? null) ? $defaults[$type] : [];
    }

    /**
     * @param  list<array<string, mixed>>  $sections
     * @return array{schemaVersion: int, sections: list<array<string, mixed>>}
     */
    public static function page(array $sections): array
    {
        return [
            'schemaVersion' => 1,
            'sections' => $sections,
        ];
    }

    /**
     * @param  list<array{label: string, url: string}>  $links
     * @param  array<string, mixed>  $extra
     * @return array<string, mixed>
     */
    public static function nav(string $logo, array $links, array $extra = []): array
    {
        return array_merge([
            'logo' => $logo,
            'logoUrl' => '/',
            'showMark' => true,
            'showBorder' => true,
            'links' => $links,
        ], $extra);
    }

    /**
     * @param  array<string, mixed>  $extra
     * @return array<string, mixed>
     */
    public static function footer(string $brand, array $extra = []): array
    {
        return array_merge([
            'brand' => $brand,
            'copyright' => '© '.date('Y').' '.$brand,
        ], $extra);
    }

    public static function photo(string $id, int $width = 1400): string
    {
        return 'https://images.unsplash.com/photo-'.$id.'?auto=format&fit=crop&w='.$width.'&q=80';
    }

    public static function localImage(string $filename): string
    {
        return '/docs/images/'.$filename;
    }

    /**
     * @param  list<array<string, mixed>>  $sections
     * @param  array<string, mixed>  $nav
     * @param  array<string, mixed>  $footer
     * @return array<string, mixed>
     */
    public static function sitePage(
        string $name,
        string $slug,
        bool $homepage,
        array $nav,
        array $sections,
        array $footer,
        string $footerType = 'footer.multi_column',
        string $navType = 'navbar.cta',
    ): array {
        return [
            'name' => $name,
            'slug' => $slug,
            'is_homepage' => $homepage,
            'content_json' => self::page(array_merge(
                [self::section('nav', $navType, $nav)],
                $sections,
                [self::section('footer', $footerType, $footer)],
            )),
        ];
    }
}
