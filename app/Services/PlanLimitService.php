<?php

namespace App\Services;

use App\Exceptions\PlanQuotaException;
use App\Models\Activity;
use App\Models\Domain;
use App\Models\FormSubmission;
use App\Models\Media;
use App\Models\Page;
use App\Models\Site;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Models\WorkspaceUser;

class PlanLimitService
{
    public function allows(Workspace $workspace, string $key): bool
    {
        $value = $this->limitValue($workspace, $key);

        if ($value === null) {
            return false;
        }

        if (is_bool($value)) {
            return $value;
        }

        if (! is_numeric($value)) {
            return (bool) $value;
        }

        $limit = (int) $value;
        if ($limit < 0) {
            return true;
        }

        return $this->usage($workspace, $key) < $limit;
    }

    public function assertOrFail(Workspace $workspace, string $key): void
    {
        if (! $this->allows($workspace, $key)) {
            $this->fail($workspace, $key);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function limitsFor(Workspace $workspace): array
    {
        $workspace->loadMissing('subscription.plan');

        return $workspace->subscription?->plan?->limits ?? [];
    }

    public function usage(Workspace $workspace, string $key): int
    {
        return match ($key) {
            'number_of_sites' => Site::query()->where('workspace_id', $workspace->id)->count(),
            'custom_domains' => Domain::query()
                ->where('workspace_id', $workspace->id)
                ->where('type', 'custom')
                ->count(),
            'storage_mb' => (int) ceil((Media::query()->where('workspace_id', $workspace->id)->sum('size') ?: 0) / 1048576),
            'pages_per_site' => 0,
            'form_submissions' => FormSubmission::query()->where('workspace_id', $workspace->id)->count(),
            'team_members' => WorkspaceUser::query()->where('workspace_id', $workspace->id)->count(),
            'ai_generations' => $this->aiGenerationsThisMonth($workspace),
            default => 0,
        };
    }

    /**
     * AI quota is monthly and derived from the audit trail, so it always matches
     * what the Activity screen shows.
     */
    public function aiGenerationsThisMonth(Workspace $workspace): int
    {
        return Activity::query()
            ->where('workspace_id', $workspace->id)
            ->where('action', 'like', 'ai.%')
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public function usageSummary(Workspace $workspace): array
    {
        $limits = $this->limitsFor($workspace);
        $keys = ['number_of_sites', 'custom_domains', 'storage_mb', 'form_submissions', 'team_members', 'ai_generations'];
        $summary = [];
        foreach ($keys as $key) {
            $summary[$key] = [
                'used' => $this->usage($workspace, $key),
                'limit' => $limits[$key] ?? null,
            ];
        }
        $summary['pages_per_site'] = ['limit' => $limits['pages_per_site'] ?? null];
        $summary['revision_history'] = ['limit' => $limits['revision_history'] ?? null];
        $summary['premium_templates'] = ['enabled' => (bool) ($limits['premium_templates'] ?? false)];
        $summary['remove_branding'] = ['enabled' => (bool) ($limits['remove_branding'] ?? false)];

        return $summary;
    }

    public function assertTeamSeat(Workspace $workspace): void
    {
        $limit = $this->limitValue($workspace, 'team_members');
        if (! is_numeric($limit)) {
            $this->fail($workspace, 'team_members');
        }

        $cap = (int) $limit;
        if ($cap < 0) {
            return;
        }

        $used = $this->usage($workspace, 'team_members')
            + WorkspaceInvitation::query()
                ->where('workspace_id', $workspace->id)
                ->whereNull('accepted_at')
                ->where('expires_at', '>', now())
                ->count();

        if ($used >= $cap) {
            $this->fail($workspace, 'team_members', $used, $cap);
        }
    }

    public function pagesOnSite(Site $site): int
    {
        return Page::query()->where('site_id', $site->id)->count();
    }

    public function assertPagesPerSite(Workspace $workspace, Site $site): void
    {
        $limit = $this->limitValue($workspace, 'pages_per_site');
        $used = $this->pagesOnSite($site);
        if (is_numeric($limit) && (int) $limit >= 0 && $used >= (int) $limit) {
            $this->fail($workspace, 'pages_per_site', $used, (int) $limit);
        }
    }

    public function assertStorageIncoming(Workspace $workspace, int $incomingBytes): void
    {
        $limit = $this->limitValue($workspace, 'storage_mb');
        if (! is_numeric($limit)) {
            $this->fail($workspace, 'storage_mb');
        }

        $limitMb = (int) $limit;
        if ($limitMb < 0) {
            return;
        }

        $usedBytes = (int) Media::query()->where('workspace_id', $workspace->id)->sum('size');
        $projectedMb = (int) ceil(($usedBytes + $incomingBytes) / 1048576);
        if ($projectedMb > $limitMb) {
            $this->fail($workspace, 'storage_mb', (int) ceil($usedBytes / 1048576), $limitMb);
        }
    }

    public function revisionLimit(Workspace $workspace): ?int
    {
        $value = $this->limitValue($workspace, 'revision_history');

        return is_numeric($value) ? (int) $value : null;
    }

    public function limitValue(Workspace $workspace, string $key): mixed
    {
        $limits = $this->limitsFor($workspace);

        return $limits[$key] ?? null;
    }

    public function fail(Workspace $workspace, string $key, mixed $used = null, mixed $limit = null, ?string $message = null): never
    {
        throw new PlanQuotaException(
            $key,
            $used ?? $this->usage($workspace, $key),
            $limit ?? $this->limitValue($workspace, $key),
            $this->usageSummary($workspace),
            $message,
        );
    }
}
