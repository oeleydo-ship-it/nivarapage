<?php

namespace Database\Factories;

use App\Models\Site;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Site>
 */
class SiteFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->company();

        return [
            'workspace_id' => Workspace::factory(),
            'name' => $name,
            'business_name' => $name,
            'slug' => Str::slug($name).'-'.Str::random(4),
            'category' => 'business',
            'description' => fake()->sentence(),
            'status' => 'draft',
            'created_by' => User::factory(),
        ];
    }
}
