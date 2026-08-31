<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use App\Services\Cloudflare\CloudflareSettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Super-admin Cloudflare for SaaS configuration: API token, zone, HTTPS
 * settings, the CNAME target customers point at, and the zone fallback origin.
 *
 * The API token and webhook secret are write-only and never returned.
 */
class AdminCloudflareController extends Controller
{
    public function __construct(
        private readonly CloudflareSettingsService $settings,
        private readonly AuditService $audit,
    ) {}

    public function show(): JsonResponse
    {
        return response()->json(['data' => $this->settings->status()]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'enabled' => ['sometimes', 'nullable', 'boolean'],
            // Omit a secret to keep it; send "" to clear it (falls back to env).
            'api_token' => ['sometimes', 'nullable', 'string', 'max:500'],
            'webhook_secret' => ['sometimes', 'nullable', 'string', 'max:500'],
            'zone_id' => ['sometimes', 'nullable', 'string', 'max:64'],
            'account_id' => ['sometimes', 'nullable', 'string', 'max:64'],
            'fallback_origin' => ['sometimes', 'nullable', 'string', 'max:255'],
            'cname_target' => ['sometimes', 'nullable', 'string', 'max:255'],
            'apex_ips' => ['sometimes', 'nullable', 'string', 'max:500'],
            'ssl_validation' => ['sometimes', 'nullable', 'in:'.implode(',', CloudflareSettingsService::SSL_VALIDATIONS)],
            'min_tls_version' => ['sometimes', 'nullable', 'in:'.implode(',', CloudflareSettingsService::TLS_VERSIONS)],
        ]);

        $before = $this->settings->config();
        $this->settings->update($data);
        $after = $this->settings->config();

        $this->audit->log('cloudflare.settings_updated', null, [
            'enabled' => $after['enabled'],
            'zone_id' => $after['zone_id'],
            'fallback_origin' => $after['fallback_origin'],
            'cname_target' => $after['cname_target'],
            'token_changed' => array_key_exists('api_token', $data),
            'webhook_secret_changed' => array_key_exists('webhook_secret', $data),
            'was_configured' => $before['enabled'] && filled($before['api_token']) && filled($before['zone_id']),
            'is_configured' => $this->settings->usable(),
        ], null, $request->user());

        return response()->json(['data' => $this->settings->status()]);
    }

    public function test(Request $request): JsonResponse
    {
        $result = $this->settings->testConnection();

        $this->audit->log('cloudflare.connection_tested', null, [
            'ok' => $result['ok'],
        ], null, $request->user());

        return response()->json(['data' => [
            'ok' => $result['ok'],
            'message' => $result['message'],
            'status' => $this->settings->status(),
        ]], $result['ok'] ? 200 : 422);
    }

    /**
     * The A/AAAA addresses root domains are told to use. `refresh=1` re-reads
     * DNS instead of answering from the cached lookup.
     */
    public function apexAddresses(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->settings->apexAddresses($request->boolean('refresh')),
        ]);
    }

    /** What Cloudflare currently has as the zone fallback origin. */
    public function fallbackOrigin(): JsonResponse
    {
        return response()->json(['data' => $this->settings->fallbackOrigin()]);
    }

    public function syncFallbackOrigin(Request $request): JsonResponse
    {
        $result = $this->settings->syncFallbackOrigin();

        $this->audit->log('cloudflare.fallback_origin_synced', null, [
            'ok' => $result['ok'],
            'origin' => $this->settings->config()['fallback_origin'],
        ], null, $request->user());

        return response()->json(['data' => [
            'ok' => $result['ok'],
            'message' => $result['message'],
            'fallback' => $result['ok'] ? $this->settings->fallbackOrigin() : null,
            'status' => $this->settings->status(),
        ]], $result['ok'] ? 200 : 422);
    }
}
