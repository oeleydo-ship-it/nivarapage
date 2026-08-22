<?php

namespace Database\Factories;

use App\Models\Media;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Media>
 */
class MediaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory(),
            'site_id' => null,
            'user_id' => User::factory(),
            'disk' => 'public',
            'path' => 'media/test.jpg',
            'filename' => 'test.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1024,
        ];
    }
}
