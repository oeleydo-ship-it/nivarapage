<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use App\Services\PaymentGatewaySettingsService;
use App\Services\StripeGateway;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Super-admin payment gateway (Stripe) configuration.
 *
 * Secret key and webhook secret are write-only. Publishable key is returned
 * because Stripe designs it as a client-safe value.
 */
class AdminPaymentGatewayController extends Controller
{
    public function __construct(
        private readonly PaymentGatewaySettingsService $settings,
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
            'provider' => ['sometimes', 'in:'.implode(',', PaymentGatewaySettingsService::PROVIDERS)],
            'mode' => ['sometimes', 'in:test,live'],
            'publishable_key' => ['sometimes', 'nullable', 'string', 'max:255'],
            // Omit to keep; send "" to clear (falls back to env).
            'secret_key' => ['sometimes', 'nullable', 'string', 'max:500'],
            'webhook_secret' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        $before = $this->settings->config();
        $this->settings->update($data);
        $after = $this->settings->config();

        $this->audit->log('billing.gateway_settings_updated', null, [
            'enabled' => $after['enabled'],
            'provider' => $after['provider'],
            'mode' => $after['mode'],
            'secret_changed' => array_key_exists('secret_key', $data),
            'webhook_changed' => array_key_exists('webhook_secret', $data),
            'was_configured' => $before['enabled'] && filled($before['secret']),
            'is_configured' => $after['enabled'] && filled($after['secret']),
        ], null, $request->user());

        return response()->json(['data' => $this->settings->status()]);
    }

    public function test(Request $request, StripeGateway $stripe): JsonResponse
    {
        $result = $this->settings->testConnection($stripe);

        $this->audit->log('billing.gateway_tested', null, [
            'ok' => $result['ok'],
            'provider' => $this->settings->config()['provider'],
        ], null, $request->user());

        return response()->json(['data' => [
            'ok' => $result['ok'],
            'message' => $result['message'],
            'status' => $this->settings->status(),
        ]], $result['ok'] ? 200 : 422);
    }
}
