<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use App\Services\Storage\StorageSettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Super-admin media storage configuration (local or S3-compatible).
 *
 * Access keys are write-only and never returned. Responses expose `configured`
 * plus a masked key hint.
 */
class AdminStorageSettingsController extends Controller
{
    public function __construct(
        private readonly StorageSettingsService $settings,
        private readonly AuditService $audit,
    ) {}

    public function show(): JsonResponse
    {
        return response()->json(['data' => $this->settings->status()]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'provider' => ['sometimes', 'in:'.implode(',', StorageSettingsService::PROVIDERS)],
            'bucket' => ['sometimes', 'nullable', 'string', 'max:190'],
            'region' => ['sometimes', 'nullable', 'string', 'max:64'],
            'endpoint' => ['sometimes', 'nullable', 'string', 'max:255'],
            'public_url' => ['sometimes', 'nullable', 'string', 'max:255', 'url'],
            'root' => ['sometimes', 'nullable', 'string', 'max:190'],
            'use_path_style_endpoint' => ['sometimes', 'boolean'],
            // Omit to keep; send "" to clear (falls back to env).
            'access_key_id' => ['sometimes', 'nullable', 'string', 'max:500'],
            'secret_access_key' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        $before = $this->settings->config();
        $this->settings->update($data);
        $after = $this->settings->config();

        $this->audit->log('storage.settings_updated', null, [
            'provider' => $after->provider,
            'bucket' => $after->bucket,
            'keys_changed' => array_key_exists('access_key_id', $data) || array_key_exists('secret_access_key', $data),
            'was_configured' => $before->configured(),
            'is_configured' => $after->configured(),
        ], null, $request->user());

        return response()->json(['data' => $this->settings->status()]);
    }

    public function test(Request $request): JsonResponse
    {
        $result = $this->settings->testConnection();

        $this->audit->log('storage.connection_tested', null, [
            'ok' => $result['ok'],
            'provider' => $this->settings->config()->provider,
        ], null, $request->user());

        return response()->json(['data' => [
            'ok' => $result['ok'],
            'message' => $result['message'],
            'status' => $this->settings->status(),
        ]], $result['ok'] ? 200 : 422);
    }
}
