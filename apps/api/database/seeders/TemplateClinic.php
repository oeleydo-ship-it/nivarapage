<?php

namespace Database\Seeders;

class TemplateClinic
{
    /** @return array<string, mixed> */
    public static function theme(): array
    {
        return [
            'primary' => '#0f766e',
            'secondary' => '#134e4a',
            'accent' => '#0ea5e9',
            'background' => '#f4fbfa',
            'surface' => '#e7f5f3',
            'text' => '#134e4a',
            'muted' => '#5b7c78',
            'headingFont' => 'Cormorant Garamond, Georgia, serif',
            'bodyFont' => 'Nunito Sans, system-ui, sans-serif',
            'headingWeight' => 600,
            'bodyWeight' => 400,
            'buttonRadius' => '999px',
            'cardRadius' => '16px',
            'containerWidth' => '1100px',
            'sectionSpacing' => '84px',
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function pages(): array
    {
        $brand = 'Cedar Clinic';
        $nav = TemplateContent::nav($brand, [
            ['label' => 'Care', 'url' => '/care'],
            ['label' => 'Team', 'url' => '/team'],
            ['label' => 'Patients', 'url' => '/patients'],
            ['label' => 'Contact', 'url' => '/contact'],
        ], [
            'logoIcon' => 'heart',
            'showButton' => true,
            'buttonLabel' => 'Book a visit',
            'buttonUrl' => '/contact',
        ]);
        $footer = TemplateContent::footer($brand, [
            'tagline' => 'Primary care that still has time to listen.',
            'columns' => [
                ['title' => 'Clinic', 'links' => "Care|/care\nTeam|/team\nPatients|/patients\nContact|/contact"],
                ['title' => 'Hours', 'links' => "Mon–Thu 8–5\nFri 8–3"],
            ],
            'tone' => 'dark',
        ]);

        $doctor = TemplateContent::photo('1559839734-2b71ea197ec2');
        $clinic = TemplateContent::photo('1666214280557-f1b5022eb634');
        $care = TemplateContent::photo('1579684385127-1ef15d508118');
        $tablet = TemplateContent::photo('1576091160550-2173dba999ef');
        $lead = TemplateContent::photo('1612349317150-e413f6a5b16d', 800);
        $maya = TemplateContent::photo('1559839734-2b71ea197ec2', 600);
        $jonah = TemplateContent::photo('1500648767791-00dcc994a43e', 600);

        return [
            TemplateContent::sitePage('Home', 'home', true, $nav, [
                TemplateContent::section('hero', 'hero.split', [
                    'eyebrow' => 'Family medicine',
                    'heading' => 'A clinic that still knows your name',
                    'description' => 'Cedar is a small primary-care practice: same-week visits, a nurse who calls back, and doctors who are not on a 7-minute clock.',
                    'buttonLabel' => 'Book a visit',
                    'buttonUrl' => '/contact',
                    'secondaryLabel' => 'Meet the team',
                    'secondaryUrl' => '/team',
                    'image' => $doctor,
                    'imageAlt' => 'Physician',
                    'imageRatio' => 'portrait',
                    'headingSize' => 52,
                    'highlights' => [
                        ['label' => 'New patients welcome'],
                        ['label' => 'Most insurance'],
                        ['label' => 'Same-week sick visits'],
                    ],
                ]),
                TemplateContent::section('care', 'features.cards', [
                    'eyebrow' => 'What we treat',
                    'heading' => 'Whole-person primary care',
                    'textAlign' => 'center',
                    'items' => [
                        ['title' => 'Annual visits', 'text' => 'Physicals, vaccines, and a plan you can actually follow.', 'icon' => 'heart'],
                        ['title' => 'Chronic care', 'text' => 'Diabetes, blood pressure, and follow-ups that are not a portal maze.', 'icon' => 'calendar'],
                        ['title' => 'Same-week sick', 'text' => 'Leave a message before 10. We hold slots every afternoon.', 'icon' => 'clock'],
                    ],
                ]),
                TemplateContent::section('proof', 'stats.row', [
                    'columns' => 3,
                    'items' => [
                        ['value' => '1,800', 'label' => 'Active patients'],
                        ['value' => '2 days', 'label' => 'Typical sick-visit wait'],
                        ['value' => '4.9', 'label' => 'Patient rating'],
                    ],
                ]),
                TemplateContent::section('hours', 'content.hours', [
                    'heading' => 'Hours & the door',
                    'description' => 'Park in the lot behind the building. Ring if the door is locked at lunch.',
                    'address' => '220 Cedar Street',
                    'phone' => '+1 (555) 015 3300',
                    'note' => 'After-hours nurse line for established patients.',
                    'image' => $clinic,
                    'buttonLabel' => 'Book a visit',
                    'buttonUrl' => '/contact',
                    'items' => [
                        ['day' => 'Monday – Thursday', 'hours' => '08:00 – 17:00'],
                        ['day' => 'Friday', 'hours' => '08:00 – 15:00'],
                        ['day' => 'Saturday – Sunday', 'hours' => 'Closed · nurse line'],
                    ],
                ]),
                TemplateContent::section('cta', 'cta.simple', [
                    'heading' => 'New here? We are accepting patients.',
                    'description' => 'Bring insurance, a medication list, and the last physical if you have it.',
                    'buttonLabel' => 'Request an appointment',
                    'buttonUrl' => '/contact',
                    'tone' => 'primary',
                    'headingSize' => 40,
                ]),
            ], $footer),
            TemplateContent::sitePage('Care', 'care', false, $nav, [
                TemplateContent::section('hero', 'hero.centered', [
                    'eyebrow' => 'Services',
                    'heading' => 'How we care for you',
                    'description' => 'Primary care for adults and teens. Pediatrics by referral.',
                    'showTrust' => false,
                    'headingSize' => 48,
                    'buttonLabel' => '',
                    'secondaryLabel' => '',
                ]),
                TemplateContent::section('list', 'services.list', [
                    'showNumbers' => true,
                    'items' => [
                        ['title' => 'Preventive visits', 'text' => 'Physicals, screenings, vaccines, and a written plan.'],
                        ['title' => 'Chronic conditions', 'text' => 'Diabetes, hypertension, asthma, thyroid.'],
                        ['title' => 'Women’s health', 'text' => 'Well visits, contraception, and menopause care.'],
                        ['title' => 'Mental health', 'text' => 'First-line support and coordinated referrals.'],
                        ['title' => 'Procedures', 'text' => 'Skin, joints, and in-office labs when they save a trip.'],
                    ],
                ]),
                TemplateContent::section('photo', 'content.image_text', [
                    'heading' => 'In-house labs, fewer extra trips',
                    'body' => 'Draws in the morning. Most results the next day. We call when something needs a conversation — not just a portal ping.',
                    'image' => $care,
                    'headingSize' => 36,
                ]),
            ], $footer),
            TemplateContent::sitePage('Team', 'team', false, $nav, [
                TemplateContent::section('lead', 'team.spotlight', [
                    'eyebrow' => 'Physicians',
                    'heading' => 'Meet Dr. Elena Voss',
                    'description' => 'Board-certified family medicine. Still does her own notes.',
                    'name' => 'Elena Voss, MD',
                    'role' => 'Founding physician',
                    'quote' => 'If a visit needs twenty minutes, it gets twenty minutes.',
                    'image' => $lead,
                    'buttonLabel' => 'Book with Elena',
                    'buttonUrl' => '/contact',
                    'items' => [
                        ['name' => 'Amelia Chen, FNP', 'role' => 'Nurse practitioner', 'bio' => 'Same-week sick visits and chronic-care follow-ups.', 'image' => $maya],
                        ['name' => 'Jonah Patel, PA-C', 'role' => 'Physician assistant', 'bio' => 'Procedures, joints, and the afternoon clinic.', 'image' => $jonah],
                    ],
                ]),
            ], $footer),
            TemplateContent::sitePage('Patients', 'patients', false, $nav, [
                TemplateContent::section('hero', 'hero.centered', [
                    'eyebrow' => 'New & established',
                    'heading' => 'Patient information',
                    'description' => 'Insurance, forms, and what to bring.',
                    'showTrust' => false,
                    'headingSize' => 44,
                    'buttonLabel' => '',
                    'secondaryLabel' => '',
                ]),
                TemplateContent::section('faq', 'faq.accordion', [
                    'heading' => 'Before your first visit',
                    'items' => [
                        ['question' => 'Are you accepting new patients?', 'answer' => 'Yes. Adults and teens 14+. Pediatrics by referral to our partners down the street.'],
                        ['question' => 'Which insurance do you take?', 'answer' => 'Most commercial plans, Medicare, and several local HMOs. Call the desk to confirm yours.'],
                        ['question' => 'How do I get records?', 'answer' => 'A portal request is usually enough. We send to specialists the same day when we can.'],
                        ['question' => 'Is there a nurse line?', 'answer' => 'Established patients get an after-hours number. We are not an ER — call 911 for emergencies.'],
                    ],
                ]),
                TemplateContent::section('note', 'content.centered', [
                    'heading' => 'Bring to your first visit',
                    'body' => 'Photo ID, insurance card, a medication list, and prior records if you have them. Arrive ten minutes early for paperwork.',
                ]),
            ], $footer),
            TemplateContent::sitePage('Contact', 'contact', false, $nav, [
                TemplateContent::section('hero', 'hero.split', [
                    'eyebrow' => 'Appointments',
                    'heading' => 'Book a visit',
                    'description' => 'New patients: tell us your insurance. Established: a same-week sick slot is often open.',
                    'image' => $tablet,
                    'headingSize' => 44,
                    'buttonLabel' => '',
                    'secondaryLabel' => '',
                ]),
                TemplateContent::section('form', 'form.contact', [
                    'heading' => 'Request an appointment',
                    'buttonLabel' => 'Send request',
                    'layout' => 'split',
                    'details' => [
                        ['icon' => 'phone', 'label' => 'Front desk', 'value' => '+1 (555) 015 3300'],
                        ['icon' => 'mail', 'label' => 'Email', 'value' => 'care@cedarclinic.example'],
                        ['icon' => 'map-pin', 'label' => 'Address', 'value' => '220 Cedar Street'],
                    ],
                ]),
            ], $footer),
        ];
    }
}
