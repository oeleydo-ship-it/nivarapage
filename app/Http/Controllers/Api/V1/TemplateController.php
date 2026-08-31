<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TemplateResource;
use App\Models\Site;
use App\Models\Template;
use App\Services\SiteService;
use Illuminate\Http\Request;

class TemplateController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Template::class);

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
        $this->authorize('view', $template);

        return new TemplateResource($template->load(['category', 'pages']));
    }

    public function apply(Request $request, Site $site, SiteService $sites)
    {
        $this->authorize('update', $site);
        $data = $request->validate(['template_id' => ['required', 'exists:templates,id']]);
        $template = Template::query()->findOrFail($data['template_id']);
        $this->authorize('apply', $template);

        if (! $template->is_active) {
            abort(422, 'This template is not available.');
        }

        return new \App\Http\Resources\SiteResource($sites->applyTemplate($site, $template, $request->user()));
    }
}
