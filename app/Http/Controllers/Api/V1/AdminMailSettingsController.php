<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use App\Services\Mail\MailSettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Super-admin outbound mail (SMTP) configuration.
 *
 * The password is write-only and never returned; responses expose whether one
 * is set and where it came from.
 */
class AdminMailSettingsController extends Controller
{
    public function __construct(
        private readonly MailSettingsService $settings,
        private readonly AuditService $audit,
    ) {}

    public function show(): JsonResponse
    {
        return response()->json(['data' => $this->settings->status()]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'transport' => ['sometimes', 'in:'.implode(',', MailSettingsService::TRANSPORTS)],
            'host' => ['sometimes', 'nullable', 'string', 'max:255'],
            'port' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:65535'],
            'encryption' => ['sometimes', 'in:'.implode(',', MailSettingsService::ENCRYPTIONS)],
            'username' => ['sometimes', 'nullable', 'string', 'max:255'],
            // Omit to keep the stored password; send "" to clear it.
            'password' => ['sometimes', 'nullable', 'string', 'max:500'],
            'from_address' => ['sometimes', 'nullable', 'email', 'max:255'],
            'from_name' => ['sometimes', 'nullable', 'string', 'max:120'],
            'timeout' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:120'],
        ]);

        $before = $this->settings->status();
        $this->settings->update($data);
        $after = $this->settings->status();

        $this->audit->log('mail.settings_updated', null, [
            'transport' => $after['transport'],
            'host' => $after['host'],
            'password_changed' => array_key_exists('password', $data),
            'was_configured' => $before['configured'],
            'is_configured' => $after['configured'],
        ], null, $request->user());

        return response()->json(['data' => $after]);
    }

    public function test(Request $request): JsonResponse
    {
        $data = $request->validate([
            'to' => ['required', 'email', 'max:255'],
        ]);

        $result = $this->settings->sendTest($data['to']);

        $this->audit->log('mail.test_sent', null, [
            'ok' => $result['ok'],
            'to' => $data['to'],
        ], null, $request->user());

        return response()->json(['data' => [
            'ok' => $result['ok'],
            'message' => $result['message'],
            'status' => $this->settings->status(),
        ]], $result['ok'] ? 200 : 422);
    }
}
