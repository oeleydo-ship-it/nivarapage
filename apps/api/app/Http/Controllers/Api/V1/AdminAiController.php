<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Ai\AiProviderFactory;
use App\Services\Ai\AiSettingsService;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Super-admin AI configuration.
 *
 * The API key is write-only: it can be set or cleared here but is never
 * returned. Responses expose `configured` plus a masked four-character hint.
 */
class AdminAiController extends Controller
{
    public function __construct(
        private readonly AiSettingsService $settings,
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
            'provider' => ['sometimes', 'in:'.implode(',', AiSettingsService::PROVIDERS)],
            'model' => ['sometimes', 'nullable', 'string', 'max:190'],
            'base_url' => ['sometimes', 'nullable', 'string', 'max:255', 'url'],
            'max_tokens' => ['sometimes', 'nullable', 'integer', 'min:256', 'max:128000'],
            'temperature' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:2'],
            // Omit to keep the stored key; send "" to clear it.
            'api_key' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        $before = $this->settings->config();
        $this->settings->update($data);
        $after = $this->settings->config();

        $this->audit->log('ai.settings_updated', null, [
            'enabled' => $after->enabled,
            'provider' => $after->provider,
            'model' => $after->model,
            'key_changed' => array_key_exists('api_key', $data) ? true : null,
            'was_configured' => $before->configured(),
            'is_configured' => $after->configured(),
        ], null, $request->user());

        return response()->json(['data' => $this->settings->status()]);
    }

    public function test(Request $request, AiProviderFactory $factory): JsonResponse
    {
        $result = $this->settings->testConnection($factory);

        $this->audit->log('ai.connection_tested', null, [
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
