<?php

namespace Database\Factories;

use App\Models\Page;
use App\Models\Site;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Page>
 */
class PageFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'site_id' => Site::factory(),
            'name' => Str::title($name),
            'slug' => Str::slug($name),
            'type' => 'page',
            'status' => 'draft',
            'is_homepage' => false,
            'robots_index' => true,
        ];
    }
}
