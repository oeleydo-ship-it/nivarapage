<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\ClientContact;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ClientContact>
 */
class ClientContactFactory extends Factory
{
    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory(),
            'client_id' => Client::factory(),
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->numerify('+1 ### ### ####'),
            'title' => fake()->jobTitle(),
            'is_primary' => false,
            'notes' => null,
            'extras' => [],
        ];
    }
}
