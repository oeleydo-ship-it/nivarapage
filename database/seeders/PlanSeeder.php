<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            'free' => [
                'name' => 'Free',
                'prices' => ['monthly' => 0, 'yearly' => 0],
                'limits' => [
                    'number_of_sites' => 1,
                    'custom_domains' => 0,
                    'storage_mb' => 100,
                    'pages_per_site' => 5,
                    'form_submissions' => 50,
                    'team_members' => 1,
                    'premium_templates' => false,
                    'revision_history' => 5,
                    'remove_branding' => false,
                    // Monthly AI generations. 0 = plan not entitled, -1 = unlimited.
                    'ai_generations' => 0,
                ],
            ],
            'starter' => [
                'name' => 'Starter',
                'prices' => ['monthly' => 1500, 'yearly' => 14400],
                'limits' => [
                    'number_of_sites' => 3,
                    'custom_domains' => 1,
                    'storage_mb' => 1024,
                    'pages_per_site' => 20,
                    'form_submissions' => 500,
                    'team_members' => 3,
                    'premium_templates' => false,
                    'revision_history' => 20,
                    'remove_branding' => true,
                    'ai_generations' => 25,
                ],
            ],
            'business' => [
                'name' => 'Business',
                'prices' => ['monthly' => 3900, 'yearly' => 37400],
                'limits' => [
                    'number_of_sites' => 10,
                    'custom_domains' => 10,
                    'storage_mb' => 10240,
                    'pages_per_site' => 100,
                    'form_submissions' => 5000,
                    'team_members' => 10,
                    'premium_templates' => true,
                    'revision_history' => 100,
                    'remove_branding' => true,
                    'ai_generations' => 200,
                ],
            ],
            'agency' => [
                'name' => 'Agency',
                'prices' => ['monthly' => 9900, 'yearly' => 95000],
                'limits' => [
                    'number_of_sites' => -1,
                    'custom_domains' => -1,
                    'storage_mb' => 51200,
                    'pages_per_site' => -1,
                    'form_submissions' => -1,
                    'team_members' => -1,
                    'premium_templates' => true,
                    'revision_history' => -1,
                    'remove_branding' => true,
                    'ai_generations' => -1,
                ],
            ],
        ];

        foreach ($plans as $slug => $plan) {
            $envKey = strtoupper($slug);
            Plan::query()->updateOrCreate(['slug' => $slug], [
                'name' => $plan['name'],
                'prices' => $plan['prices'],
                'limits' => $plan['limits'],
                'is_active' => true,
                'stripe_price_monthly' => env("STRIPE_PRICE_{$envKey}_MONTHLY") ?: null,
                'stripe_price_yearly' => env("STRIPE_PRICE_{$envKey}_YEARLY") ?: null,
            ]);
        }
    }
}
