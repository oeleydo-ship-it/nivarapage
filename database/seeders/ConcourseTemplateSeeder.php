<?php

namespace Database\Seeders;

use App\Models\Template;
use App\Models\TemplateCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/** Install this kit alone without reseeding other templates. */
class ConcourseTemplateSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $category = TemplateCategory::firstOrCreate(['slug' => 'saas'], ['name' => 'SaaS']);
            $template = Template::updateOrCreate(['slug' => 'concourse'], [
                'template_category_id' => $category->id,
                'name' => 'Concourse',
                'description' => 'A cinematic enterprise finance template: six pages, thirteen reusable blocks, video backgrounds, moving logos, interactive agent reports, and customer stories.',
                'is_premium' => false, 'is_active' => true, 'is_featured' => true,
                'theme_tokens' => TemplateConcourse::theme(),
            ]);
            $template->pages()->delete();
            foreach (TemplateConcourse::pages() as $page) {
                $template->pages()->create($page);
            }
        });
    }
}
