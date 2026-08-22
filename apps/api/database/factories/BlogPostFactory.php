<?php

namespace Database\Factories;

use App\Models\BlogPost;
use App\Models\Site;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<BlogPost>
 */
class BlogPostFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->sentence(6);

        return [
            'workspace_id' => Workspace::factory(),
            'site_id' => Site::factory(),
            'created_by' => User::factory(),
            'title' => rtrim($title, '.'),
            'slug' => Str::slug($title).'-'.Str::random(4),
            'excerpt' => fake()->sentence(12),
            'body' => fake()->paragraphs(3, true),
            'status' => 'draft',
            'tags' => [],
            'extras' => [],
        ];
    }

    public function published(): static
    {
        return $this->state(fn () => [
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);
    }
}
