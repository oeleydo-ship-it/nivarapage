<?php

namespace Database\Seeders;

class TemplateHale
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#2A2A2A',
            'secondary' => '#26231D',
            'accent' => '#E77045',
            'background' => '#F8F7F4',
            'surface' => '#C1C3C0',
            'text' => '#1A1A1A',
            'muted' => '#4D4D4D',
            'headingFont' => 'Inter, system-ui, sans-serif',
            'bodyFont' => 'Inter, system-ui, sans-serif',
            'headingWeight' => 700,
            'bodyWeight' => 400,
            'buttonRadius' => '8px',
            'cardRadius' => '6px',
            'containerWidth' => '1360px',
            'sectionSpacing' => '96px',
        ];
    }

    /** @return array<string, mixed> */
    private static function motion(int $delay = 0): array
    {
        return [
            'animation' => 'fade-up',
            'animationTrigger' => 'scroll',
            'animationDuration' => 700,
            'animationDelay' => $delay,
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $brand = 'Hale Wren';
        $nav = [
            'logo' => 'H&W',
            'logoNote' => 'llp',
            'logoUrl' => '/',
            'showButton' => true,
            'buttonLabel' => 'Reserve a conversation',
            'buttonUrl' => '/contact',
            'sticky' => true,
            'showBorder' => true,
            'links' => [
                ['label' => 'The firm', 'url' => '/about'],
                ['label' => 'Work', 'url' => '/practices'],
                ['label' => 'Notes', 'url' => '/insights'],
            ],
        ];
        $footer = TemplateContent::footer($brand, [
            'tagline' => 'Written counsel for people who still have to decide today.',
            'copyright' => '© '.date('Y').' Hale Wren LLP',
            'columns' => [
                ['title' => 'Firm', 'links' => "The firm|/about\nWork|/practices\nNotes|/insights"],
                ['title' => 'Visit', 'links' => "Portland studio|/contact\nHours|/contact"],
                ['title' => 'File', 'links' => "Privacy|#\nTerms|#"],
            ],
            'legal' => [
                ['label' => 'Privacy', 'url' => '#'],
                ['label' => 'Terms', 'url' => '#'],
            ],
            'showNewsletter' => false,
            'tone' => 'default',
            'columnCount' => 3,
        ]);

        $partners = TemplateContent::localImage('hale-partners.jpg');
        $gavel = TemplateContent::localImage('hale-gavel.jpg');
        $handshake = TemplateContent::localImage('hale-handshake.jpg');
        $a1 = TemplateContent::photo('1633332755192-727a05c4013d', 200);
        $a2 = TemplateContent::photo('1535713875002-d1d0cf377fde', 200);
        $a3 = TemplateContent::photo('1527980965255-d3b416303d12', 200);
        $a4 = TemplateContent::photo('1438761681033-6461ffad8d80', 200);

        $hero = array_merge(self::motion(0), [
            'heading' => 'Counsel that stays close to the work',
            'description' => 'A compact firm for operators who want answers in writing — not a theatre of process.',
            'buttonLabel' => 'Reserve a conversation',
            'buttonUrl' => '/contact',
            'image' => $partners,
            'imageAlt' => 'Hale Wren partners',
            'proofValue' => '2.1K+',
            'proofLabel' => 'Clients who return when the next matter lands',
            'headingSize' => 52,
            'bodySize' => 16,
            'paddingTop' => 0,
            'paddingBottom' => 0,
            'avatars' => [
                ['image' => $a1, 'name' => 'Ira'],
                ['image' => $a2, 'name' => 'Noel'],
                ['image' => $a3, 'name' => 'Sam'],
                ['image' => $a4, 'name' => 'Rae'],
            ],
        ]);

        return [
            TemplateContent::sitePage('Home', 'home', true, $nav, [
                TemplateContent::section('hero', 'hero.panel', $hero),
                TemplateContent::section('markers', 'content.markers', array_merge(self::motion(80), [
                    'heading' => 'Quiet rooms, written advice, and a partner who still reads the file.',
                    'image' => $gavel,
                    'contentWidth' => 'wide',
                    'headingSize' => 44,
                    'items' => [
                        ['number' => '01', 'text' => 'We take fewer matters so the same people stay on the file from intake to close.'],
                        ['number' => '02', 'text' => 'Advice arrives as a memo you can forward — options, risks, and a recommended next step.'],
                        ['number' => '03', 'text' => 'Fees are scoped before work starts. If the brief changes, the scope changes with it.'],
                    ],
                ])),
                TemplateContent::section('band', 'content.band', array_merge(self::motion(80), [
                    'label' => 'Why this firm',
                    'heading' => 'When the question is sharp, the answer should be too.',
                    'buttonLabel' => 'Reserve a conversation',
                    'buttonUrl' => '/contact',
                    'image' => $handshake,
                    'contentWidth' => 'wide',
                    'backgroundType' => 'color',
                    'backgroundColor' => '#C1C3C0',
                    'headingSize' => 40,
                    'items' => [
                        ['title' => 'Same desk', 'text' => 'One partner owns the matter. Associates support; they do not rotate the story.'],
                        ['title' => 'Plain English', 'text' => 'We write for the person who has to decide, not for a stack of internal memos.'],
                        ['title' => 'Held through close', 'text' => 'Calls are returned. Deadlines are named. You are not left guessing the calendar.'],
                    ],
                ])),
                TemplateContent::section('process', 'content.ruled', array_merge(self::motion(80), [
                    'label' => 'How we work',
                    'heading' => 'A short path from brief to decision.',
                    'contentWidth' => 'wide',
                    'headingSize' => 40,
                    'items' => [
                        ['title' => 'Intake', 'text' => 'A 30-minute call to name the decision, the deadline, and who else is in the room.'],
                        ['title' => 'Scope', 'text' => 'A one-page plan with fee, deliverable, and what sits outside the engagement.'],
                        ['title' => 'Work', 'text' => 'Drafts you can mark up. A live call only when the writing needs a conversation.'],
                    ],
                ])),
            ], $footer, 'footer.simple', 'navbar.counsel'),

            TemplateContent::sitePage('The firm', 'about', false, $nav, [
                TemplateContent::section('markers', 'content.markers', array_merge(self::motion(0), [
                    'heading' => 'A Portland studio, two partners, no waiting room of juniors.',
                    'image' => $gavel,
                    'contentWidth' => 'wide',
                    'headingSize' => 40,
                    'items' => [
                        ['number' => '01', 'text' => 'Matters are commercial, employment, and founder disputes — not every door on the hallway.'],
                        ['number' => '02', 'text' => 'We decline work that needs a floor of litigators. You will hear that in the first call.'],
                        ['number' => '03', 'text' => 'The office is a working room: books, a long table, and a kettle. Meetings are by appointment.'],
                    ],
                ])),
            ], $footer, 'footer.simple', 'navbar.counsel'),

            TemplateContent::sitePage('Work', 'practices', false, $nav, [
                TemplateContent::section('band', 'content.band', array_merge(self::motion(0), [
                    'label' => 'Work',
                    'heading' => 'The files we keep on the desk.',
                    'buttonLabel' => 'Reserve a conversation',
                    'buttonUrl' => '/contact',
                    'image' => $handshake,
                    'contentWidth' => 'wide',
                    'backgroundType' => 'color',
                    'backgroundColor' => '#C1C3C0',
                    'headingSize' => 40,
                    'items' => [
                        ['title' => 'Companies', 'text' => 'Shareholder papers, commercial contracts, and the messy middle of a raise.'],
                        ['title' => 'People', 'text' => 'Executive exits, team disputes, and policies that have to survive a real workplace.'],
                        ['title' => 'Disputes', 'text' => 'Letters before action, settlement maps, and counsel through a hearing when needed.'],
                    ],
                ])),
            ], $footer, 'footer.simple', 'navbar.counsel'),

            TemplateContent::sitePage('Notes', 'insights', false, $nav, [
                TemplateContent::section('process', 'content.ruled', array_merge(self::motion(0), [
                    'label' => 'Notes',
                    'heading' => 'Short pieces we send to clients first.',
                    'contentWidth' => 'wide',
                    'headingSize' => 40,
                    'items' => [
                        ['title' => 'Scope before spend', 'text' => 'Why a one-page plan saves more than a discounted hourly rate.'],
                        ['title' => 'Who signs', 'text' => 'A checklist for founder documents that actually get executed.'],
                        ['title' => 'When to wait', 'text' => 'Signals that a dispute is still cheaper than a filing.'],
                    ],
                ])),
            ], $footer, 'footer.simple', 'navbar.counsel'),

            TemplateContent::sitePage('Contact', 'contact', false, $nav, [
                TemplateContent::section('form', 'form.contact', array_merge(self::motion(0), [
                    'heading' => 'Start with the decision you need this month',
                    'description' => 'Tell us the deadline and the other people in the room. We reply with whether the matter fits, and a time if it does.',
                    'textAlign' => 'left',
                    'layout' => 'split',
                    'buttonLabel' => 'Send the brief',
                    'headingSize' => 36,
                    'details' => [
                        ['icon' => 'mail', 'label' => 'Email', 'value' => 'desk@halewren.example'],
                        ['icon' => 'home', 'label' => 'Studio', 'value' => 'Portland, by appointment'],
                    ],
                ])),
            ], $footer, 'footer.simple', 'navbar.counsel'),
        ];
    }
}
