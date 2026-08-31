<?php

namespace App\Services\Diagnostics;

use App\Models\Domain;
use App\Models\Site;
use App\Services\PlatformSettingsService;
use App\Services\PreviewTokenService;
use App\Services\PublicSiteResolver;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Answers "why does the browser say not found / preview unavailable?" without
 * shell access to the container.
 *
 * The renderer talks to the API over HTTP with a shared secret. When that call
 * fails the renderer can only show a generic page, so this replays the exact
 * calls it makes and reports which one broke.
 */
class RendererDiagnostics
{
    public function __construct(
        private readonly PreviewTokenService $tokens,
        private readonly PublicSiteResolver $resolver,
        private readonly PlatformSettingsService $platform,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function run(?string $host = null, ?int $siteId = null): array
    {
        $apiUrl = $this->apiUrl();
        $secret = (string) config('uidesired.internal_renderer_secret');

        $checks = [
            $this->appKeyCheck(),
            [
                'key' => 'renderer_secret',
                'label' => 'Renderer secret',
                'ok' => true,
                'detail' => $secret === ''
                    ? 'Not set. The API accepts renderer calls without one, which is fine for a single-container deployment.'
                    : 'Set ('.strlen($secret).' characters). The renderer must send the same value.',
            ],
            $this->transportCheck($apiUrl),
        ];

        $checks[] = $this->resolveCheck($apiUrl, $secret, $host);
        $checks[] = $this->previewCheck($apiUrl, $secret, $siteId);

        $failed = array_values(array_filter($checks, fn (array $check) => $check['ok'] === false));

        return [
            'ok' => $failed === [],
            'api_url' => $apiUrl,
            'renderer_url' => (string) config('uidesired.renderer_url'),
            'platform_domain' => $this->platform->platformDomain(),
            'checks' => $checks,
            'summary' => $failed === []
                ? 'The renderer can reach the API and both signed previews and host resolution work.'
                : ($failed[0]['detail'] ?? 'A check failed.'),
        ];
    }

    /**
     * Everything the database knows about a hostname, so a "not found" page can
     * be told apart from a broken renderer.
     *
     * @return array<string, mixed>
     */
    public function host(string $host): array
    {
        $host = $this->resolver->normalizeHost($host);
        $platform = $this->platform->platformDomain();

        $domain = Domain::query()->with('site.workspace')->whereRaw('lower(hostname) = ?', [$host])->first();
        $site = $domain?->site ?? ($this->resolver->resolve($host));

        $notes = [];
        if (! $domain && $platform !== '' && str_ends_with($host, '.'.$platform)) {
            $notes[] = 'No domain row for this hostname. The site may have been created while PLATFORM_DOMAIN was different, '
                .'or the subdomain does not exist yet.';
        }
        if ($domain && $domain->status !== 'active') {
            $notes[] = 'The domain row exists but its status is "'.$domain->status.'". Only active domains are served.';
        }
        if ($site && $site->status === 'disabled') {
            $notes[] = 'The site is disabled, so the renderer shows the unavailable page.';
        }
        if ($domain && $domain->site === null) {
            $notes[] = 'The domain row points at a site that no longer exists.';
        }
        if ($notes === [] && ! $site) {
            $notes[] = 'Nothing on this platform claims that hostname.';
        }

        return [
            'host' => $host,
            'platform_domain' => $platform,
            'is_platform_subdomain' => $platform !== '' && str_ends_with($host, '.'.$platform),
            'resolves' => $site !== null,
            'domain' => $domain ? [
                'id' => $domain->id,
                'hostname' => $domain->hostname,
                'type' => $domain->type,
                'status' => $domain->status,
                'is_primary' => (bool) $domain->is_primary,
                'ssl_status' => $domain->ssl_status,
            ] : null,
            'site' => $site ? [
                'id' => $site->id,
                'name' => $site->name,
                'status' => $site->status,
                'workspace_id' => $site->workspace_id,
            ] : null,
            'suggestions' => $this->suggestions($host, $platform),
            'notes' => $notes,
        ];
    }

    /**
     * Active hostnames that look like what was asked for, so a typo or a
     * stale platform domain is obvious.
     *
     * @return list<string>
     */
    private function suggestions(string $host, string $platform): array
    {
        $slug = $platform !== '' && str_ends_with($host, '.'.$platform)
            ? substr($host, 0, -strlen('.'.$platform))
            : explode('.', $host)[0];

        if ($slug === '') {
            return [];
        }

        return Domain::query()
            ->where('status', 'active')
            ->where('hostname', 'like', $slug.'.%')
            ->orderBy('id')
            ->limit(5)
            ->pluck('hostname')
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function appKeyCheck(): array
    {
        $key = (string) config('app.key');

        return [
            'key' => 'app_key',
            'label' => 'APP_KEY',
            'ok' => $key !== '',
            'detail' => $key !== ''
                ? 'Set. Keep it stable across redeploys, or signed preview links and encrypted settings break.'
                : 'Missing. Signed preview links cannot be verified without it.',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function transportCheck(string $apiUrl): array
    {
        try {
            $response = Http::timeout(10)->get($apiUrl.'/api/v1/health');
        } catch (Throwable $exception) {
            return [
                'key' => 'transport',
                'label' => 'API reachable at API_URL',
                'ok' => false,
                'detail' => 'Could not connect to '.$apiUrl.': '.$exception->getMessage()
                    .' The renderer uses this same address, so nothing will render.',
            ];
        }

        return [
            'key' => 'transport',
            'label' => 'API reachable at API_URL',
            'ok' => $response->successful(),
            'detail' => $response->successful()
                ? $apiUrl.' answered '.$response->status().'.'
                : $apiUrl.' answered '.$response->status().'. The renderer cannot read anything from the API.',
        ];
    }

    /**
     * The call the renderer makes for every public page view.
     *
     * @return array<string, mixed>
     */
    private function resolveCheck(string $apiUrl, string $secret, ?string $host): array
    {
        $host = $host !== null && $host !== ''
            ? $this->resolver->normalizeHost($host)
            : (string) Domain::query()->where('status', 'active')->orderBy('id')->value('hostname');

        if ($host === '') {
            return [
                'key' => 'resolve',
                'label' => 'Host resolution',
                'ok' => false,
                'detail' => 'No active domains exist yet, so there is nothing to resolve.',
            ];
        }

        $response = $this->call($apiUrl.'/api/v1/public/resolve?host='.urlencode($host), $secret);

        if ($response === null) {
            return [
                'key' => 'resolve',
                'label' => 'Host resolution',
                'ok' => false,
                'detail' => 'Could not reach the API to resolve '.$host.'.',
            ];
        }

        [$status, $message] = $response;

        return [
            'key' => 'resolve',
            'label' => 'Host resolution',
            'ok' => $status === 200,
            'detail' => match (true) {
                $status === 200 => $host.' resolves to a site.',
                $status === 403 && str_contains(strtolower($message), 'renderer secret') => 'The API rejected the renderer '
                    .'secret. INTERNAL_RENDERER_SECRET differs between the API and the renderer.',
                $status === 404 => $host.' is not connected to any site. This is what the browser reports as '
                    .'"This domain is not connected to an active website".',
                default => 'The API answered '.$status.($message !== '' ? ' - '.$message : '').'.',
            },
        ];
    }

    /**
     * The call the renderer makes for a signed preview link.
     *
     * @return array<string, mixed>
     */
    private function previewCheck(string $apiUrl, string $secret, ?int $siteId): array
    {
        $site = $siteId ? Site::query()->find($siteId) : Site::query()->orderBy('id')->first();

        if (! $site) {
            return [
                'key' => 'preview',
                'label' => 'Signed preview',
                'ok' => false,
                'detail' => 'No sites exist yet, so no preview link can be minted.',
            ];
        }

        $response = $this->call($apiUrl.$this->tokens->create($site), $secret, 'POST');

        if ($response === null) {
            return [
                'key' => 'preview',
                'label' => 'Signed preview',
                'ok' => false,
                'detail' => 'Could not reach the API to test a preview link.',
            ];
        }

        [$status, $message] = $response;

        return [
            'key' => 'preview',
            'label' => 'Signed preview',
            'ok' => $status === 200,
            'detail' => match (true) {
                $status === 200 => 'A freshly signed link for site #'.$site->id.' was accepted.',
                $status === 403 && str_contains(strtolower($message), 'renderer secret') => 'The API rejected the renderer '
                    .'secret. Set the same INTERNAL_RENDERER_SECRET for both processes.',
                $status === 403 || $status === 401 => 'The signature was rejected. APP_KEY changed after the link was '
                    .'issued, the server clock is wrong, or a proxy rewrote the path or query.',
                $status === 404 => 'The preview route is missing. Check that /api is proxied to the API untouched.',
                default => 'The API answered '.$status.($message !== '' ? ' - '.$message : '').'.',
            },
        ];
    }

    /**
     * @return array{0: int, 1: string}|null
     */
    private function call(string $url, string $secret, string $method = 'GET'): ?array
    {
        try {
            $request = Http::withHeaders(array_filter([
                'Accept' => 'application/json',
                'X-Internal-Secret' => $secret !== '' ? $secret : null,
            ]))->timeout(15);

            $response = $method === 'POST' ? $request->post($url) : $request->get($url);
        } catch (Throwable) {
            return null;
        }

        return [$response->status(), (string) ($response->json('message') ?? '')];
    }

    public function apiUrl(): string
    {
        return rtrim((string) (env('API_URL') ?: config('app.url') ?: 'http://127.0.0.1:8000'), '/');
    }
}
