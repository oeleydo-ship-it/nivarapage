<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\Client;
use App\Models\Domain;
use App\Models\FormSubmission;
use App\Models\Media;
use App\Models\Site;
use App\Services\PlanLimitService;
use App\Support\CurrentWorkspace;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class OverviewController extends Controller
{
    public function show(CurrentWorkspace $current, PlanLimitService $limits)
    {
        $workspace = $current->workspace;
        if (! $workspace) {
            abort(422, 'Workspace is required.');
        }

        $workspace->loadMissing('subscription.plan');
        $workspaceId = $workspace->id;

        return response()->json([
            'data' => [
                'total_websites' => Site::query()->where('workspace_id', $workspaceId)->count(),
                'published' => Site::query()->where('workspace_id', $workspaceId)->where('status', 'published')->count(),
                'custom_domains' => Domain::query()->where('workspace_id', $workspaceId)->where('type', 'custom')->count(),
                'form_submissions' => FormSubmission::query()->where('workspace_id', $workspaceId)->count(),
                'clients' => $this->countForWorkspace(Client::class, $workspaceId),
                'blog_posts' => $this->countForWorkspace(BlogPost::class, $workspaceId),
                'storage_usage' => [
                    'bytes' => (int) Media::query()->where('workspace_id', $workspaceId)->sum('size'),
                    'mb' => $limits->usage($workspace, 'storage_mb'),
                ],
                'usage' => $limits->usageSummary($workspace),
                'plan' => $workspace->subscription?->plan?->only(['id', 'slug', 'name']),
            ],
        ]);
    }

    /**
     * @param  class-string<Model>  $model
     */
    private function countForWorkspace(string $model, int $workspaceId): int
    {
        $table = (new $model)->getTable();
        if (! Schema::hasTable($table)) {
            return 0;
        }

        return $model::query()->where('workspace_id', $workspaceId)->count();
    }
}
