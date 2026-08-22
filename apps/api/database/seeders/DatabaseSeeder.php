<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Form;
use App\Models\Site;
use App\Models\User;
use App\Services\ClientService;
use App\Services\PageService;
use App\Services\PublishService;
use App\Services\SiteService;
use App\Services\WorkspaceService;
use App\Support\CurrentWorkspace;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PlanSeeder::class,
            TemplateSeeder::class,
        ]);

        if (config('uidesired.seed_demo') && app()->environment('local')) {
            $user = User::query()->firstOrCreate(
                ['email' => 'admin@uidesired.test'],
                [
                    'name' => 'Demo Admin',
                    'password' => 'password',
                    'is_super_admin' => true,
                    'email_verified_at' => now(),
                ],
            );
            $user->forceFill(['is_super_admin' => true, 'email_verified_at' => now()])->save();

            if (! $user->workspaces()->exists()) {
                app(WorkspaceService::class)->createPersonal($user, 'Demo Workspace');
            }

            $workspace = $user->workspaces()->first();
            $membership = $workspace ? $user->membershipFor($workspace->id) : null;
            if ($workspace && $membership) {
                app(CurrentWorkspace::class)->set($workspace, $membership);
            }

            if ($workspace && $membership && ! Site::query()->where('workspace_id', $workspace->id)->exists()) {
                $site = app(SiteService::class)->create($user, [
                    'name' => 'Demo Studio',
                    'business_name' => 'Demo Studio',
                    'subdomain' => 'demo',
                ]);
                $form = Form::query()->where('site_id', $site->id)->where('type', 'contact')->first();
                $page = $site->pages()->where('is_homepage', true)->first();
                if ($page) {
                    app(PageService::class)->saveDraft($page, $user, [
                        'schemaVersion' => 1,
                        'sections' => [
                            [
                                'id' => 'nav-1',
                                'type' => 'navbar.simple',
                                'version' => 1,
                                'hidden' => false,
                                'props' => ['logo' => 'Demo Studio'],
                            ],
                            [
                                'id' => 'hero-1',
                                'type' => 'hero.centered',
                                'version' => 1,
                                'hidden' => false,
                                'props' => [
                                    'heading' => 'A website built with UiDesired',
                                    'subheading' => 'This is the published demo front page.',
                                    'ctaLabel' => 'Get in touch',
                                    'ctaUrl' => '#contact',
                                ],
                            ],
                            [
                                'id' => 'form-1',
                                'type' => 'form.contact',
                                'version' => 1,
                                'hidden' => false,
                                'props' => [
                                    'heading' => 'Say hello',
                                    'formId' => $form ? (string) $form->id : '',
                                ],
                            ],
                        ],
                    ]);
                    app(PublishService::class)->publishSite($site->fresh('pages'), $user);
                }
            }

            if ($workspace && $membership && ! Client::query()->where('workspace_id', $workspace->id)->exists()) {
                $crm = app(ClientService::class);
                $northwind = $crm->create($user, [
                    'name' => 'Northwind Retail',
                    'company' => 'Northwind Retail',
                    'email' => 'hello@northwind.test',
                    'phone' => '+1 415 555 0142',
                    'status' => 'active',
                    'industry' => 'Retail',
                    'source' => 'referral',
                    'city' => 'San Francisco',
                    'country' => 'United States',
                    'notes' => 'Primary demo account. Websites, invoices, and projects can attach to this record.',
                    'tags' => ['demo'],
                ]);
                $crm->addContact($northwind, [
                    'name' => 'Maya Chen',
                    'email' => 'maya@northwind.test',
                    'title' => 'Marketing lead',
                    'is_primary' => true,
                ]);
                $linked = Site::query()->where('workspace_id', $workspace->id)->first();
                if ($linked) {
                    $crm->attachSite($northwind, $linked->id);
                }
                $crm->create($user, [
                    'name' => 'Harbor Clinic',
                    'company' => 'Harbor Clinic',
                    'email' => 'info@harbor.test',
                    'status' => 'lead',
                    'industry' => 'Healthcare',
                    'source' => 'inbound',
                ]);
            }
        }
    }
}
