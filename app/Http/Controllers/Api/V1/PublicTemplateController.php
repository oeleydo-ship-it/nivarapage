<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TemplateResource;
use App\Models\Template;

/**
 * Ready-made templates, readable without signing in.
 *
 * The marketing site links straight to a live demo of a template, so this is
 * the one place template content is served to someone with no account. Only
 * active templates are visible, and nothing here is workspace data: a template
 * is content the platform itself ships.
 */
class PublicTemplateController extends Controller
{
    public function index()
    {
        return TemplateResource::collection(
            Template::query()
                ->with(['category', 'homepage'])
                ->withCount('pages')
                ->where('is_active', true)
                ->orderByDesc('is_featured')
                ->orderBy('name')
                ->get()
        );
    }

    public function show(Template $template)
    {
        // A template pulled from the demo gallery and then deactivated must
        // stop answering, rather than staying reachable to anyone holding the
        // link. Route-model binding does not know about is_active.
        if (! $template->is_active) {
            abort(404);
        }

        return new TemplateResource($template->load(['category', 'pages']));
    }
}
