<?php

namespace Database\Seeders;

class TemplateConcourse
{
    public static function theme(): array
    {
        return [
            'primary' => '#0d1018', 'secondary' => '#334155', 'accent' => '#1f49db',
            'background' => '#ffffff', 'surface' => '#f3f3f3', 'text' => '#0d1018', 'muted' => '#777984',
            'headingFont' => 'Concourse Sans, Arial, sans-serif', 'bodyFont' => 'Concourse Sans, Arial, sans-serif',
            'headingWeight' => 400, 'bodyWeight' => 400, 'buttonRadius' => '5px',
            'cardRadius' => '0px', 'containerWidth' => '1240px', 'sectionSpacing' => '104px',
        ];
    }

    public static function pages(): array
    {
        $s = fn (string $id, string $type, array $props = []) => TemplateContent::section($id, $type.'.concourse', $props);
        $page = fn (string $title, string $slug, bool $home, array $sections) => TemplateContent::sitePage($title, $slug, $home, [], $sections, [], 'footer.concourse', 'navbar.concourse');
        $head = fn (string $heading, string $description) => $s('hero', 'hero', ['layout' => 'plain', 'heading' => $heading, 'description' => $description, 'paddingTop' => 110, 'paddingBottom' => 110, 'video' => '', 'image' => '']);
        return [
            $page('Home', 'home', true, [
                $s('hero', 'hero'), $s('connections', 'logos'), $s('platform', 'features'),
                $s('partnership', 'statement'), $s('agents', 'agents'), $s('stories', 'testimonials'),
                $s('departments', 'solutions'), $s('integrations', 'integrations'), $s('impact', 'stats'),
                $s('security', 'security'), $s('next-step', 'cta'),
            ]),
            $page('Platform', 'platform', false, [
                $head("A platform built\nfor what comes next.", 'Connect knowledge, workflows, and the people behind every financial decision.'),
                $s('capabilities', 'features'), $s('agents', 'agents'), $s('connected', 'integrations'),
                $s('deployment', 'statement', ['heading' => "From the first workflow\nto the bigger picture.", 'description' => 'Start with a focused use case. Map the process, connect the information, test the results, and expand with your team.']),
                $s('next-step', 'cta'),
            ]),
            $page('Solutions', 'solutions', false, [
                $head("A new way to work.\nAcross finance.", 'Give each team a focused workflow and everyone a connected view.'),
                $s('departments', 'solutions'), $s('workflows', 'agents', ['anchorId' => 'workflows']),
                $s('results', 'stats'), $s('next-step', 'cta'),
            ]),
            $page('Security', 'security', false, [
                $head("Built on trust.\nDesigned for oversight.", 'Keep your team in control of access, evidence, and the decisions that matter.'),
                $s('controls', 'security', ['buttonLabel' => 'Discuss your requirements', 'buttonUrl' => '/company#contact']),
                $s('principles', 'features', ['heading' => 'An intentional approach to governance.', 'eyebrow' => 'Your security requirements', 'items' => [
                    ['title' => 'Clear boundaries', 'description' => 'Define who can access connected information and who can approve changes.'],
                    ['title' => 'Traceable decisions', 'description' => 'Keep the sources and review steps alongside the work they support.'],
                    ['title' => 'Human review', 'description' => 'Design escalation and approval steps around your organization’s needs.'],
                ]]),
                $s('review', 'statement', ['heading' => "Ask the right questions.\nSee the supporting evidence.", 'description' => 'Discuss your deployment requirements, data policies, and review process with the team.']),
                $s('next-step', 'cta'),
            ]),
            $page('Customers', 'customers', false, [
                $head("More time for\nthe work that matters.", 'Explore how a connected approach can change the rhythm of your finance team.'),
                $s('stories', 'testimonials'), $s('impact', 'stats'),
                $s('journeys', 'features', ['eyebrow' => 'Illustrative customer journeys', 'heading' => 'Different teams. Shared ambition.', 'items' => [
                    ['title' => 'A clearer month-end', 'description' => 'A growing team brings reconciliations and supporting documents into one repeatable process.', 'image' => '/templates/concourse/showcase-feature-card-1.webp'],
                    ['title' => 'A more useful forecast', 'description' => 'A finance team connects business signals and assumptions for a more informed planning conversation.', 'image' => '/templates/concourse/showcase-feature-card-2.webp'],
                    ['title' => 'A connected review', 'description' => 'Leaders see performance updates in the places they already work.', 'image' => '/templates/concourse/showcase-feature-background-card-3.webp'],
                ]]), $s('next-step', 'cta'),
            ]),
            $page('Company', 'company', false, [
                $head("Finance expertise.\nA builder’s mindset.", 'We believe better tools should give people more room to think, collaborate, and move forward.'),
                $s('mission', 'statement', ['heading' => "Build with the people\nwho know the work.", 'description' => 'The best systems start with listening. We work alongside teams to understand the details, challenge assumptions, and make useful progress.', 'buttonLabel' => 'Start a conversation', 'buttonUrl' => '/company#contact']),
                $s('values', 'features', ['eyebrow' => 'Our approach', 'heading' => 'Thoughtful work. Lasting value.', 'items' => [
                    ['title' => 'Start with understanding', 'description' => 'Ask good questions and take the time to learn how the work really happens.'],
                    ['title' => 'Build in the open', 'description' => 'Make assumptions visible and give teams a meaningful role in the process.'],
                    ['title' => 'Keep improving', 'description' => 'Use feedback and evidence to make each iteration more useful.'],
                ]]),
                TemplateContent::section('contact', 'form.contact', ['anchorId' => 'contact', 'heading' => 'Let’s talk about your team.', 'description' => 'Tell us what you are working on and where you would like to go next.', 'buttonLabel' => 'Send inquiry', 'details' => []]),
            ]),
        ];
    }
}
