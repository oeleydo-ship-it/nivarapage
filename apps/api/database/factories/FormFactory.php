<?php

namespace Database\Factories;

use App\Models\Form;
use App\Models\Site;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Form>
 */
class FormFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->words(2, true);

        return [
            'workspace_id' => Workspace::factory(),
            'site_id' => Site::factory(),
            'name' => Str::title($name),
            'slug' => Str::slug($name),
            'type' => 'contact',
            'settings' => [],
        ];
    }
}
