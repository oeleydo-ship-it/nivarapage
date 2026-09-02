<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SiteBackupResource;
use App\Models\Site;
use App\Models\SiteBackup;
use App\Services\SiteBackupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

/**
 * Point-in-time backups of a site, and restoring one.
 *
 * Restoring takes a safety copy first, so the response hands back the id of
 * the snapshot that would undo it.
 */
class SiteBackupController extends Controller
{
    public function __construct(private readonly SiteBackupService $backups) {}

    public function index(Site $site)
    {
        $this->authorize('view', $site);

        return SiteBackupResource::collection(
            $site->backups()->with('user:id,name')->orderByDesc('id')->get()
        );
    }

    public function store(Request $request, Site $site)
    {
        $this->authorize('update', $site);
        $data = $request->validate([
            'label' => ['sometimes', 'nullable', 'string', 'max:120'],
        ]);

        $backup = $this->backups->create($site, $request->user(), (string) ($data['label'] ?? ''));

        return (new SiteBackupResource($backup->load('user:id,name')))->response()->setStatusCode(201);
    }

    public function restore(Request $request, Site $site, SiteBackup $siteBackup): JsonResponse
    {
        $this->authorize('update', $site);
        abort_if($siteBackup->site_id !== $site->id, 404);

        try {
            $safety = $this->backups->restore($site, $siteBackup, $request->user());
        } catch (RuntimeException $e) {
            abort(422, $e->getMessage());
        }

        return response()->json(['data' => [
            'restored_from' => new SiteBackupResource($siteBackup),
            'undo_backup' => new SiteBackupResource($safety),
        ]]);
    }

    public function destroy(Request $request, Site $site, SiteBackup $siteBackup): JsonResponse
    {
        $this->authorize('update', $site);
        abort_if($siteBackup->site_id !== $site->id, 404);

        $this->backups->delete($siteBackup, $request->user());

        return response()->json(['data' => ['ok' => true]]);
    }
}
