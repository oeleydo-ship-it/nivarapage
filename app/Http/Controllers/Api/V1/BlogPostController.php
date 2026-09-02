<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BlogPostResource;
use App\Models\BlogPost;
use App\Models\Site;
use App\Services\BlogIndexService;
use App\Services\BlogService;
use App\Support\CurrentWorkspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class BlogPostController extends Controller
{
    public function index(Request $request, CurrentWorkspace $current)
    {
        $this->authorize('viewAny', BlogPost::class);

        $posts = BlogPost::query()
            ->where('workspace_id', $current->id())
            ->with('site.domains')
            ->when($request->query('site_id'), fn ($query, $siteId) => $query->where('site_id', $siteId))
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->when($request->filled('q'), function ($query) use ($request) {
                $term = '%'.trim((string) $request->query('q')).'%';
                $query->where(function ($inner) use ($term) {
                    $inner->where('title', 'like', $term)
                        ->orWhere('excerpt', 'like', $term)
                        ->orWhere('category', 'like', $term)
                        ->orWhere('slug', 'like', $term);
                });
            })
            ->latest()
            ->get();

        return BlogPostResource::collection($posts);
    }

    public function store(Request $request, BlogService $blog)
    {
        $this->authorize('create', BlogPost::class);

        $post = $blog->create($request->user(), $this->validated($request));

        return (new BlogPostResource($post))->response()->setStatusCode(201);
    }

    public function show(BlogPost $blogPost)
    {
        $this->authorize('view', $blogPost);

        return new BlogPostResource($blogPost->load('site.domains'));
    }

    public function update(Request $request, BlogPost $blogPost, BlogService $blog)
    {
        $this->authorize('update', $blogPost);

        return new BlogPostResource($blog->update($blogPost, $this->validated($request, true)));
    }

    public function publish(BlogPost $blogPost, BlogService $blog)
    {
        $this->authorize('update', $blogPost);

        return new BlogPostResource($blog->publish($blogPost));
    }

    public function destroy(BlogPost $blogPost, BlogService $blog): JsonResponse
    {
        $this->authorize('delete', $blogPost);
        $blog->delete($blogPost);

        return response()->json(['data' => ['ok' => true]]);
    }

    /**
     * Gives a website the blog index page its posts link back to.
     *
     * Most templates ship without one, so a site can have published posts and
     * nothing at /blog for them to sit under. Idempotent, and it never touches
     * a blog page that already exists.
     */
    public function ensureIndex(Site $site, BlogIndexService $index, BlogService $blog, Request $request): JsonResponse
    {
        Gate::authorize('update', $site);

        $page = $index->ensure($site, $request->user());

        return response()->json(['data' => [
            'page_id' => $page->id,
            'path' => $blog->indexPath($site),
        ]]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'site_id' => [$required, 'integer'],
            'title' => [$required, 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:180'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'body' => ['nullable', 'string', 'max:100000'],
            'cover_image' => ['nullable', 'string', 'max:2048'],
            'author_name' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:80'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:40'],
            'status' => ['nullable', 'in:'.implode(',', BlogPost::STATUSES)],
            'published_at' => ['nullable', 'date'],
            'seo_title' => ['nullable', 'string', 'max:70'],
            'seo_description' => ['nullable', 'string', 'max:320'],
            'extras' => ['nullable', 'array'],
        ]);
    }
}
