<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Client>
 */
class ClientFactory extends Factory
{
    public function definition(): array
    {
        $company = fake()->company();

        return [
            'workspace_id' => Workspace::factory(),
            'created_by' => User::factory(),
            'name' => $company,
            'company' => $company,
            'email' => fake()->companyEmail(),
            'phone' => fake()->numerify('+1 ### ### ####'),
            'website' => 'https://'.fake()->domainName(),
            'status' => 'lead',
            'industry' => fake()->randomElement(['SaaS', 'Retail', 'Agency', 'Healthcare']),
            'source' => fake()->randomElement(['referral', 'inbound', 'outbound']),
            'city' => fake()->city(),
            'country' => fake()->country(),
            'notes' => null,
            'tags' => [],
            'extras' => [],
        ];
    }
}
