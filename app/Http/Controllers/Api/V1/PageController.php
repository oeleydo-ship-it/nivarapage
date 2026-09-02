<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PageResource;
use App\Http\Resources\PageRevisionResource;
use App\Models\Page;
use App\Models\PageRevision;
use App\Models\Site;
use App\Services\PageService;
use App\Services\PublishService;
use App\Services\RevisionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function index(Site $site)
    {
        $this->authorize('view', $site);

        return PageResource::collection($site->pages()->with(['draftRevision', 'publishedRevision'])->get());
    }

    public function store(Request $request, Site $site, PageService $pages)
    {
        $this->authorize('update', $site);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'in:page,system'],
            'is_homepage' => ['boolean'],
            'content' => ['nullable', 'array'],
            'seo_title' => ['nullable', 'string'],
            'seo_description' => ['nullable', 'string'],
        ]);

        return (new PageResource($pages->create($site, $request->user(), $data)->load('draftRevision')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Page $page)
    {
        $this->authorize('view', $page);

        return new PageResource($page->load(['draftRevision', 'publishedRevision']));
    }

    public function update(Request $request, Page $page, PageService $pages)
    {
        $this->authorize('update', $page);
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255'],
            'status' => ['sometimes', 'in:draft,published,hidden'],
            'is_homepage' => ['boolean'],
            'seo_title' => ['nullable', 'string', 'max:70'],
            'seo_description' => ['nullable', 'string', 'max:320'],
            'seo_image' => ['nullable', 'string', 'max:2048'],
            'canonical_url' => ['nullable', 'string', 'max:2048'],
            'og_title' => ['nullable', 'string', 'max:70'],
            'og_description' => ['nullable', 'string', 'max:320'],
            'og_image' => ['nullable', 'string', 'max:2048'],
            'robots_index' => ['boolean'],
        ]);

        return new PageResource($pages->update($page, $data)->load(['draftRevision', 'publishedRevision']));
    }

    public function destroy(Page $page, PageService $pages): JsonResponse
    {
        $this->authorize('delete', $page);
        $pages->delete($page);

        return response()->json(['data' => ['ok' => true]]);
    }

    public function saveDraft(Request $request, Page $page, PageService $pages)
    {
        $this->authorize('update', $page);
        $data = $request->validate(['content' => ['required', 'array']]);
        $revision = $pages->saveDraft($page, $request->user(), $data['content']);

        return new PageRevisionResource($revision);
    }

    public function publish(Request $request, Page $page, PublishService $publisher)
    {
        $this->authorize('publish', $page);

        return new PageResource($publisher->publishPage($page, $request->user()));
    }

    public function revisions(Page $page)
    {
        $this->authorize('view', $page);

        // Content is deliberately left out: a page's whole section tree per
        // revision would make the history list enormous.
        $rows = PageRevisionResource::collection(
            $page->revisions()->with('user:id,name')->orderByDesc('version_number')->get()
        );
        // Mutate in place: mapping the collection would drop the `data` wrapper.
        $rows->collection->each(fn (PageRevisionResource $row) => $row->withoutContent());

        return $rows;
    }

    /** One revision including its content, for previewing before a restore. */
    public function revision(Page $page, PageRevision $revision)
    {
        $this->authorize('view', $page);
        abort_if($revision->page_id !== $page->id, 404);

        return new PageRevisionResource($revision->load('user:id,name'));
    }

    public function restore(Request $request, Page $page, PageRevision $revision, RevisionService $revisions)
    {
        $this->authorize('update', $page);

        return (new PageRevisionResource($revisions->restore($page, $revision, $request->user())))
            ->response()
            ->setStatusCode(200);
    }
}
