<?php

namespace App\Services\Ai;

use App\Models\Site;
use App\Support\BlockCatalog;

/**
 * Builds prompts from the generated block catalog so the model is only ever
 * shown block types and prop keys that really exist.
 */
class AiPromptBuilder
{
    public function pageSystemPrompt(): string
    {
        $maxPages = max(1, (int) config('ai.max_pages', 5));

        return implode("\n", [
            'You are a website content generator for a block-based website builder.',
            'You return ONLY JSON. No markdown, no code fences, no commentary.',
            'Decide whether the request needs a full multi-page website or a single page.',
            'Preferred output for a business website:',
            '{"theme":{"primary":"#2563eb","secondary":"#0f172a","accent":"#f59e0b","background":"#ffffff","surface":"#f8fafc","text":"#0f172a","muted":"#64748b","headingFont":"Inter, system-ui, sans-serif","bodyFont":"Inter, system-ui, sans-serif","headingWeight":700,"bodyWeight":400,"buttonRadius":"8px","cardRadius":"12px","containerWidth":"1120px","sectionSpacing":"80px"},"pages":[{"name":"Home","slug":"home","is_homepage":true,"sections":[{"type":"<block type>","props":{}}]},{"name":"About","slug":"about","is_homepage":false,"sections":[...]}]}',
            'If the user clearly wants only one page (a landing page, or a named inner page), you MAY return the legacy shape {"sections":[...]} instead.',
            'Rules:',
            '- Emit between 1 and '.$maxPages.' pages. Typical sites use 3–'.$maxPages.' pages (Home plus About, services/work, contact, and similar).',
            '- Exactly one page has is_homepage true. Its slug should be "home".',
            '- Slugs are lowercase kebab-case. Navbar and footer link urls MUST be "/" for Home and "/{slug}" for other pages. Never use "#".',
            '- Every page starts with generated.nav and ends with generated.footer. Reuse the same chrome copy and links on every page.',
            '- Inner pages still need a distinct generated.hero, generated.story, or generated.form — do not copy the homepage body.',
            '- "type" MUST be one of the generated.* types listed in the catalog. Never invent a type. Never use catalog kits (hero.centered, navbar.cta, faq.accordion, ChatDeck, Genesis, Counsel, and similar).',
            '- "props" keys MUST be prop names listed for that block. Never invent prop names.',
            '- Do not emit ids, versions, HTML, scripts, styles or urls to external images. If no uploaded image path is supplied, leave image empty and use generated.composition with a CSS visual instead.',
            '- Every section must be publication-ready and about this exact request. Never rely on block defaults for visible copy.',
            '- No lorem ipsum, dummy text, "Your text here", "Item", "Feature one", "Studio", generic sample brands, or vague filler such as "innovative solutions".',
            '- Hero: write an original 4–12 word heading, a 20–45 word description, and specific CTA labels/urls.',
            '- Collections: write 3–6 distinct items with complete titles and 18–45 word bodies. FAQ: write 4–7 useful question/answer pairs. Pricing: write complete plans and use "Contact for quote" when no price was supplied.',
            '- Story descriptions should be 60–140 words when the block carries the main page narrative. Navigation/footer must contain the real generated brand and every emitted page link.',
            '- Do not invent testimonials, client names, awards, certifications, addresses, prices, or numeric claims. Use generated.voices or numeric generated.metrics only when the brief supplies evidence.',
            '- When facts are missing, write honest benefit/process copy that does not pretend the missing fact exists. Do not display blanks or placeholders.',
            '- Repeater props are arrays of objects using only the listed child keys.',
            '- Omit any prop you do not have good content for; sensible defaults are applied server-side.',
            '- Theme keys must use the names shown above. Colors are #hex. Fonts are CSS stacks such as "Inter, system-ui, sans-serif".',
        ]);
    }

    public function blockSystemPrompt(): string
    {
        return implode("\n", [
            'You are a website content generator for a block-based website builder.',
            'You return ONLY JSON. No markdown, no code fences, no commentary.',
            'Default output shape: {"type":"<block type>","props":{...}}',
            'If the instruction clearly asks for several related blocks (for example a hero plus features), you MAY return {"sections":[{"type":"...","props":{}}, ...]} with at most 4 sections.',
            'Rules:',
            '- Pick generated.nav, generated.hero, generated.collection, generated.composition, generated.story, generated.faq, generated.metrics, generated.pricing, generated.voices, generated.cta, generated.footer, or generated.form. Invent original copy and pick layout/surface/density so it does not look like a catalog kit.',
            '- Use generated.composition when the instruction needs a new kind of section. Give it a descriptive blockName, select a composition and generated visual, and author 2–6 complete editable content regions.',
            '- "type" MUST be one of the generated.* types listed. Never invent a type. Never use catalog kits unless the instruction names a specific catalog type.',
            '- "props" keys MUST be prop names listed for that block. Never invent prop names.',
            '- Populate every visible content field with publication-ready copy about the exact request. Never rely on default content.',
            '- No lorem ipsum, dummy text, sample brands, generic items, or placeholder text. Repeater blocks need at least 3 complete, distinct items.',
            '- Do not invent testimonials, people, credentials, prices, addresses, or numeric claims. Use honest qualitative copy when facts were not supplied.',
            '- Do not emit ids, versions, HTML, scripts or styles.',
        ]);
    }

    public function rewriteSystemPrompt(): string
    {
        return implode("\n", [
            'You rewrite short pieces of website copy.',
            'You return ONLY JSON: {"text":"<the rewritten value>"}.',
            'Keep the same language as the input unless asked otherwise.',
            'Return plain text without markdown or HTML tags.',
        ]);
    }

    /**
     * Rewriting a template's copy, slot by slot.
     *
     * The model is never shown sections and never returns any: it sees a
     * numbered list of the strings a template ships with and answers with
     * replacements. Keeping it to strings is what guarantees the generated site
     * is still the template the customer picked.
     */
    public function templateCopySystemPrompt(): string
    {
        return implode("\n", [
            'You write website copy. You are given the existing copy of a template, one numbered slot at a time.',
            'You return ONLY JSON: {"slots":[{"i":<number>,"text":"<replacement>"}]}.',
            'Rewrite every slot for the business described. Keep each replacement the same kind of thing and about the same length as the original: a two-word button label stays a two-word button label, a heading stays one line.',
            'Never invent prices, statistics, awards, addresses or contact details. If the original holds a number you cannot know, keep the original.',
            'Write plain text. No markdown, no HTML.',
            'Answer in the language of the business description.',
        ]);
    }

    /**
     * @param  array<string, mixed>  $input
     * @param  list<array{path: string, label: string, text: string}>  $slots
     */
    public function templateCopyPrompt(Site $site, array $slots, array $input): string
    {
        $lines = ['Business name: '.($site->business_name ?: $site->name)];
        if ($site->category) {
            $lines[] = 'Industry: '.$site->category;
        }
        if ($site->description) {
            $lines[] = 'What it does: '.$site->description;
        }
        if (! empty($input['prompt'])) {
            // The customer's own words about what they want written. It leads,
            // because a site's stored name and category are often placeholders
            // typed in a hurry while this is what they actually asked for.
            $lines[] = 'Write about this, and prefer it over the details above where they disagree:';
            $lines[] = $input['prompt'];
        }
        if (! empty($input['tone'])) {
            $lines[] = 'Tone of voice: '.$input['tone'];
        }

        $lines[] = '';
        $lines[] = 'Rewrite each slot below. The label says which block and which field it belongs to - use it to judge what the string is for.';
        $lines[] = '';

        foreach ($slots as $index => $slot) {
            $lines[] = $index.'. ['.$slot['label'].'] '.$slot['text'];
        }

        return implode("\n", $lines);
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public function pagePrompt(Site $site, array $input): string
    {
        $sections = is_array($input['sections'] ?? null)
            ? array_values(array_filter(array_map('strval', $input['sections'])))
            : [];

        $lines = [
            'Business / website description:',
            trim((string) ($input['prompt'] ?? '')),
            '',
            'Website name: '.$site->name,
        ];

        if ($site->business_name) {
            $lines[] = 'Business name: '.$site->business_name;
        }
        if ($site->category) {
            $lines[] = 'Category: '.$site->category;
        }
        if (! empty($input['page_name'])) {
            $lines[] = 'Page: '.$input['page_name'].' ('.($input['page_type'] ?? 'landing').')';
        }
        if (! empty($input['tone'])) {
            $lines[] = 'Tone of voice: '.$input['tone'];
        }
        if ($sections !== []) {
            $lines[] = 'The current page should cover these sections, in order: '.implode(', ', $sections);
        }

        $lines[] = 'If this prompt describes a whole business or website, generate a multi-page site (Home plus the inner pages that business needs).';
        $lines[] = 'If it is clearly a single landing page or only the named page above, generate that one page.';
        $lines[] = 'Every page: start with generated.nav and end with generated.footer. Home needs 7–10 purposeful sections; each inner page needs 4–7 sections.';
        $lines[] = 'Navbar links.url values must match the page slugs you emit.';
        $lines[] = 'Compose an original layout: vary layout, surface, and density on each generated.* block. Do not reuse catalog kits.';
        $lines[] = 'Use generated.composition for page-specific sections that do not fit a standard purpose. Set blockName and create 2–6 complete regions; every region remains editable.';
        $lines[] = 'Never put descriptive prose into an image field and never invent an external image URL. With no uploaded image path, leave image empty and use a generated.composition visual.';
        $lines[] = 'Write all visible content now. Every heading, paragraph, CTA, question, answer, plan, and repeater item must be specific to this business request and ready to publish.';
        $lines[] = 'Do not use default/sample phrases from the catalog. Do not invent claims or people. When details are missing, use accurate process and benefit language rather than placeholders.';
        $lines[] = '';
        $lines[] = 'Available blocks (type — label — allowed props). Use ONLY these types:';
        $lines[] = $this->generationCatalogText();

        return implode("\n", $lines);
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public function blockPrompt(Site $site, array $input): string
    {
        $type = is_string($input['type'] ?? null) ? BlockCatalog::resolveType($input['type']) : null;

        $lines = [
            'Instruction:',
            trim((string) ($input['prompt'] ?? '')),
            '',
            'Website name: '.$site->name,
        ];

        if ($site->category) {
            $lines[] = 'Category: '.$site->category;
        }
        if (! empty($input['tone'])) {
            $lines[] = 'Tone of voice: '.$input['tone'];
        }

        if ($type !== null) {
            $lines[] = 'You MUST use the block type "'.$type.'".';
        } else {
            $lines[] = 'Choose a generated.* type (or a short related set) that invents an original composition. Do not pick catalog kits.';
        }

        if (is_array($input['props'] ?? null) && $input['props'] !== []) {
            $lines[] = '';
            $lines[] = 'Rewrite / improve this existing content (keep what still works):';
            $lines[] = json_encode($input['props'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) ?: '{}';
        }

        $lines[] = '';
        $lines[] = 'Available blocks (type — label — allowed props):';
        $types = BlockCatalog::generatedTypes();
        $lines[] = $this->catalogText($type === null ? ($types === [] ? null : $types) : [$type]);

        return implode("\n", $lines);
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public function rewritePrompt(array $input): string
    {
        $mode = (string) ($input['mode'] ?? 'improve');
        $instruction = match ($mode) {
            'expand' => 'Expand this into a slightly longer, richer version (at most double the length).',
            'shorten' => 'Make this noticeably shorter while keeping the meaning.',
            'tone' => 'Rewrite this in a '.($input['tone'] ?: 'professional').' tone.',
            'fix' => 'Fix spelling, grammar and punctuation. Change nothing else.',
            default => 'Improve the clarity and impact of this website copy.',
        };

        $lines = [$instruction];

        if (! empty($input['tone']) && $mode !== 'tone') {
            $lines[] = 'Tone of voice: '.$input['tone'];
        }
        if (! empty($input['context'])) {
            $lines[] = 'Context: '.$input['context'];
        }

        $lines[] = '';
        $lines[] = 'Text:';
        $lines[] = (string) ($input['text'] ?? '');

        return implode("\n", $lines);
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public function libraryPagePrompt(array $input): string
    {
        $lines = [
            'This is a reusable starter template for the platform library. Every tenant will be able to apply it.',
            'Business / industry description:',
            trim((string) ($input['prompt'] ?? '')),
        ];

        if (! empty($input['name'])) {
            $lines[] = 'Template name: '.$input['name'];
        }
        if (! empty($input['tone'])) {
            $lines[] = 'Tone of voice: '.$input['tone'];
        }

        $lines[] = 'This template must be fully editable in the visual builder after a tenant applies it.';
        $lines[] = 'Decide a sitemap of 3–'.max(1, (int) config('ai.max_pages', 5)).' pages unless the prompt is clearly a single landing page.';
        $lines[] = 'Every page: start with generated.nav and end with generated.footer. Same chrome and links on every page.';
        $lines[] = 'Home should use 5–'.max(5, (int) config('ai.max_sections', 14)).' sections. Include a theme object.';
        $lines[] = 'Write complete, industry-specific marketing copy for every visible field and every repeater row. Never use defaults, dummy text, or placeholders. Invent original layouts via layout/surface/density — do not use catalog kits.';
        $lines[] = '';
        $lines[] = 'Available blocks (type — label — allowed props). Use ONLY these types:';
        $lines[] = $this->generationCatalogText();

        return implode("\n", $lines);
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public function libraryBlockPrompt(array $input): string
    {
        $type = is_string($input['type'] ?? null) ? BlockCatalog::resolveType($input['type']) : null;

        $lines = [
            'This is a reusable block preset for the platform library. Tenants will insert it into their pages.',
            'Instruction:',
            trim((string) ($input['prompt'] ?? '')),
        ];

        if (! empty($input['tone'])) {
            $lines[] = 'Tone of voice: '.$input['tone'];
        }
        if ($type !== null) {
            $lines[] = 'You MUST use the block type "'.$type.'".';
        } else {
            $lines[] = 'Choose the most appropriate catalog block type for this instruction.';
        }

        $lines[] = '';
        $lines[] = 'Available blocks (type — label — allowed props):';
        $lines[] = $this->catalogText($type === null ? null : [$type]);

        return implode("\n", $lines);
    }

    public function chatSystemPrompt(): string
    {
        $maxPages = max(1, (int) config('ai.max_pages', 5));

        return implode("\n", [
            'You are a website-builder copilot in a chat. The user can follow up, revise, add pages, add blocks, and change the theme.',
            'You return ONLY JSON. No markdown, no code fences, no commentary.',
            'Output shape:',
            '{"action":"apply_site|replace_page|create_page|insert_blocks|update_theme|reply","message":"<short chat reply>","theme":{},"pages":[{"name":"Home","slug":"home","is_homepage":true,"sections":[{"type":"...","props":{}}]}],"sections":[{"type":"...","props":{}}]}',
            'action meanings:',
            '- apply_site: build or rebuild a multi-page website. Fill pages (1–'.$maxPages.') and optional theme.',
            '- replace_page: rewrite the current page. Fill pages with exactly one page (the current one) or sections for that page.',
            '- create_page: add a new site page. Fill pages with one non-homepage page (name, slug, sections). Include navbar + footer matching the site.',
            '- insert_blocks: add one or more generated.* blocks to the current page. Fill sections (max 4).',
            '- update_theme: only change theme tokens. Fill theme with the keys that change.',
            '- reply: ask a clarifying question. No pages/sections/theme.',
            'When Generation mode is supplied in the user prompt, obey it: full_site uses apply_site, current_page uses replace_page, and blocks uses insert_blocks.',
            'Follow-ups: honour the conversation. Do not regenerate the whole site unless asked. "Add an About page" is create_page. "Make the hero shorter" is replace_page. "Add a FAQ" is insert_blocks. "Use navy and gold" is update_theme.',
            'Theme keys allowed: primary, secondary, accent, background, surface, text, muted, headingFont, bodyFont, headingWeight, bodyWeight, buttonRadius, cardRadius, containerWidth, sectionSpacing.',
            'Rules:',
            '- "type" MUST be a generated.* block type listed below. Never invent types. Never use catalog kits (hero.centered, navbar.cta, faq.accordion, and similar).',
            '- Do not emit ids, versions, HTML, scripts, styles or external image urls.',
            '- Navbar link urls are "/" and "/{slug}". Never "#".',
            '- Produce publication-ready content for every visible field. Never rely on catalog defaults.',
            '- No lorem ipsum, dummy text, sample brands, "Item", "Feature one", generic filler, blanks, or placeholder copy.',
            '- Home pages need 7–10 purposeful sections; inner pages need 4–7. Each page must have a distinct job and non-repeated body copy.',
            '- Hero copy includes a specific heading, 20–45 word description, and useful CTA. Collections need 3–6 complete items. FAQ needs 4–7 complete answers.',
            '- Navigation and footer use the actual business brand and link every emitted page. CTAs point to a real emitted slug or a meaningful contact action.',
            '- You may invent page-specific block compositions with generated.composition. Set blockName, layout, visual, and 2–6 complete regions. These become independently editable blocks in the editor.',
            '- Never put alt text or descriptive prose in image. Never invent external image URLs. Leave image empty when no uploaded asset path was supplied.',
            '- Do not fabricate testimonials, names, credentials, addresses, prices, or numerical claims. Only use generated.voices or factual metrics when supplied by the user.',
            '- message is 1–3 sentences for the chat UI, past tense when you produced content.',
        ]);
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public function chatPrompt(Site $site, array $input): string
    {
        $lines = [
            'Website name: '.$site->name,
        ];
        if ($site->business_name) {
            $lines[] = 'Business name: '.$site->business_name;
        }
        if ($site->category) {
            $lines[] = 'Category: '.$site->category;
        }

        $pageName = trim((string) ($input['page_name'] ?? 'Home'));
        $pageSlug = trim((string) ($input['page_slug'] ?? 'home'));
        $lines[] = 'Current editor page: '.$pageName.' (/'.$pageSlug.')'.(! empty($input['is_homepage']) ? ' [homepage]' : '');

        $mode = (string) ($input['generation_mode'] ?? 'auto');
        $modeLabel = match ($mode) {
            'full_site' => 'Full website. Return action apply_site and a complete sitemap.',
            'current_page' => 'Current page only. Return action replace_page and exactly one page.',
            'blocks' => 'Blocks only. Return action insert_blocks with one to four sections.',
            default => 'Automatic. Infer the smallest appropriate scope from the request.',
        };
        $lines[] = 'Generation mode: '.$modeLabel;
        if ($mode === 'full_site') {
            $requestedPages = max(2, min((int) config('ai.max_pages', 8), (int) ($input['requested_pages'] ?? 5)));
            $lines[] = 'Requested sitemap size: '.$requestedPages.' pages. Generate that many useful, distinct pages when the business brief supports it.';
        }

        $existing = is_array($input['existing_pages'] ?? null) ? $input['existing_pages'] : [];
        if ($existing !== []) {
            $labels = [];
            foreach ($existing as $page) {
                if (! is_array($page)) {
                    continue;
                }
                $labels[] = trim((string) ($page['name'] ?? '')).' (/'.trim((string) ($page['slug'] ?? '')).')';
            }
            if ($labels !== []) {
                $lines[] = 'Existing pages: '.implode(', ', $labels);
            }
        }

        if (is_array($input['theme'] ?? null) && $input['theme'] !== []) {
            $lines[] = 'Current theme: '.(json_encode($input['theme'], JSON_UNESCAPED_SLASHES) ?: '{}');
        }

        $content = is_array($input['current_content'] ?? null) ? $input['current_content'] : [];
        $outline = $this->pageOutline($content);
        if ($outline !== '') {
            $lines[] = 'Current page blocks:';
            $lines[] = $outline;
        }

        if (! empty($input['selected_type'])) {
            $lines[] = 'Selected block: '.$input['selected_type'].(! empty($input['selected_heading']) ? ' — '.$input['selected_heading'] : '');
        }

        $history = is_array($input['messages'] ?? null) ? $input['messages'] : [];
        $lines[] = '';
        $lines[] = 'Conversation:';
        foreach (array_slice($history, -16) as $item) {
            if (! is_array($item)) {
                continue;
            }
            $role = ($item['role'] ?? '') === 'assistant' ? 'Assistant' : 'User';
            $text = trim((string) ($item['content'] ?? ''));
            if ($text === '') {
                continue;
            }
            $lines[] = $role.': '.mb_substr($text, 0, $role === 'User' ? 2000 : 400);
        }

        $lines[] = '';
        $lines[] = 'Available blocks (type — label — allowed props). Use only these generated types. Populate their content props fully:';
        $lines[] = $this->generationCatalogText();

        return implode("\n", $lines);
    }

    /**
     * @param  array<string, mixed>  $content
     */
    private function pageOutline(array $content): string
    {
        $sections = is_array($content['sections'] ?? null) ? $content['sections'] : [];
        $lines = [];
        foreach (array_slice($sections, 0, 16) as $index => $section) {
            if (! is_array($section)) {
                continue;
            }
            $type = (string) ($section['type'] ?? 'unknown');
            $props = is_array($section['props'] ?? null) ? $section['props'] : [];
            $heading = '';
            foreach (['heading', 'title', 'logo', 'question'] as $key) {
                if (is_string($props[$key] ?? null) && trim($props[$key]) !== '') {
                    $heading = mb_substr(trim($props[$key]), 0, 80);
                    break;
                }
            }
            $lines[] = ($index + 1).'. '.$type.($heading !== '' ? ' — '.$heading : '');
        }

        return implode("\n", $lines);
    }

    public function catalogIndex(): string
    {
        return $this->indexFor(BlockCatalog::promptBlocks());
    }

    public function generationCatalogIndex(): string
    {
        $types = BlockCatalog::generatedTypes();
        $blocks = $types === [] ? BlockCatalog::promptBlocks() : BlockCatalog::promptBlocks($types);

        return $this->indexFor($blocks);
    }

    public function generationCatalogText(): string
    {
        $types = BlockCatalog::generatedTypes();

        return $this->catalogText($types === [] ? null : $types);
    }

    /**
     * @param  list<array<string, mixed>>  $blocks
     */
    private function indexFor(array $blocks): string
    {
        $lines = [];
        foreach ($blocks as $block) {
            $lines[] = '- '.$block['type'].' — '.$block['label'];
        }

        return implode("\n", $lines);
    }

    /**
     * @param  list<string>|null  $onlyTypes
     */
    public function catalogText(?array $onlyTypes = null): string
    {
        $lines = [];
        foreach (BlockCatalog::promptBlocks($onlyTypes) as $block) {
            $lines[] = '- '.$block['type'].' — '.$block['label'].' — props: '
                .($block['props'] === [] ? '(none)' : implode('; ', $block['props']));
        }

        return implode("\n", $lines);
    }
}
