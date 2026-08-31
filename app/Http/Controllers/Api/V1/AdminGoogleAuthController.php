<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use App\Services\GoogleAuthSettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Super-admin Google sign-in configuration.
 *
 * The client secret is write-only. The client ID is returned because it is
 * public by design — it travels in the OAuth authorization URL anyway.
 */
class AdminGoogleAuthController extends Controller
{
    public function __construct(
        private readonly GoogleAuthSettingsService $settings,
        private readonly AuditService $audit,
    ) {}

    public function show(): JsonResponse
    {
        return response()->json(['data' => $this->settings->status()]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'enabled' => ['sometimes', 'boolean'],
            'allow_registration' => ['sometimes', 'boolean'],
            'prompt' => ['sometimes', 'in:'.implode(',', GoogleAuthSettingsService::PROMPTS)],
            'client_id' => ['sometimes', 'nullable', 'string', 'max:255'],
            // Omit to keep; send "" to clear (falls back to env).
            'client_secret' => ['sometimes', 'nullable', 'string', 'max:500'],
            'redirect_uri' => ['sometimes', 'nullable', 'string', 'url', 'max:500'],
            'allowed_domains' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ]);

        $before = $this->settings->usable();
        $this->settings->update($data);
        $after = $this->settings->config();

        $this->audit->log('auth.google_settings_updated', null, [
            'enabled' => $after['enabled'],
            'allow_registration' => $after['allow_registration'],
            'allowed_domains' => $after['allowed_domains'],
            'secret_changed' => array_key_exists('client_secret', $data),
            'client_id_changed' => array_key_exists('client_id', $data),
            'was_configured' => $before,
            'is_configured' => $this->settings->usable(),
        ], null, $request->user());

        return response()->json(['data' => $this->settings->status()]);
    }

    public function test(Request $request): JsonResponse
    {
        $result = $this->settings->testConnection();

        $this->audit->log('auth.google_tested', null, [
            'ok' => $result['ok'],
        ], null, $request->user());

        return response()->json(['data' => [
            'ok' => $result['ok'],
            'message' => $result['message'],
            'status' => $this->settings->status(),
        ]], $result['ok'] ? 200 : 422);
    }
}
