<?php

namespace Database\Factories;

use App\Models\Domain;
use App\Models\Site;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Domain>
 */
class DomainFactory extends Factory
{
    public function definition(): array
    {
        $workspace = Workspace::factory();

        return [
            'workspace_id' => $workspace,
            'site_id' => Site::factory()->state(fn (array $attrs) => [
                'workspace_id' => $attrs['workspace_id'] ?? null,
            ]),
            'type' => 'subdomain',
            'hostname' => fake()->unique()->domainName(),
            'is_primary' => true,
            'status' => 'active',
            'provider' => 'platform',
            'activated_at' => now(),
        ];
    }
}
