<?php

namespace App\Services;

use App\Models\GoogleAuthSetting;
use App\Support\EncryptedSettings;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

/**
 * Super-admin Google sign-in configuration.
 *
 * The client secret is write-only. Values stored in Admin override the
 * GOOGLE_* environment variables; clearing a stored value falls back to env.
 */
class GoogleAuthSettingsService
{
    public const PROMPTS = ['select_account', 'consent', 'none'];

    public function settings(): GoogleAuthSetting
    {
        return GoogleAuthSetting::current();
    }

    /**
     * Resolved configuration, secrets included. Internal use only.
     *
     * @return array{
     *   enabled: bool,
     *   client_id: string|null,
     *   client_secret: string|null,
     *   redirect_uri: string,
     *   allow_registration: bool,
     *   allowed_domains: list<string>,
     *   prompt: string,
     *   client_id_source: string,
     *   client_secret_source: string,
     *   redirect_source: string
     * }
     */
    public function config(): array
    {
        $row = $this->settings();

        $dbId = $this->filledString($row->client_id);
        $envId = $this->filledString(config('services.google.client_id'));
        $dbSecret = $this->filledString(EncryptedSettings::read($row, 'client_secret'));
        $envSecret = $this->filledString(config('services.google.client_secret'));
        $dbRedirect = $this->filledString($row->redirect_uri);
        $envRedirect = $this->filledString(config('services.google.redirect'));

        return [
            'enabled' => (bool) $row->enabled,
            'client_id' => $dbId ?? $envId,
            'client_secret' => $dbSecret ?? $envSecret,
            'redirect_uri' => $dbRedirect ?? $envRedirect ?? url('/api/v1/auth/google/callback'),
            'allow_registration' => (bool) $row->allow_registration,
            'allowed_domains' => $this->parseDomains($row->allowed_domains),
            'prompt' => in_array($row->prompt, self::PROMPTS, true) ? $row->prompt : 'select_account',
            'client_id_source' => $dbId !== null ? 'settings' : ($envId !== null ? 'env' : 'none'),
            'client_secret_source' => $dbSecret !== null ? 'settings' : ($envSecret !== null ? 'env' : 'none'),
            'redirect_source' => $dbRedirect !== null ? 'settings' : ($envRedirect !== null ? 'env' : 'none'),
        ];
    }

    /**
     * True when the admin toggle is on AND both credentials are present.
     *
     * This is what the sign-in screen asks for, so the Google button never
     * appears unless a click would actually reach Google.
     */
    public function usable(): bool
    {
        $config = $this->config();

        return $config['enabled']
            && filled($config['client_id'])
            && filled($config['client_secret']);
    }

    /**
     * Dashboard-facing status. Never includes the raw client secret.
     *
     * @return array<string, mixed>
     */
    public function status(): array
    {
        $config = $this->config();
        $row = $this->settings();

        return [
            'enabled' => $config['enabled'],
            'configured' => $this->usable(),
            'client_id' => $config['client_id'],
            'client_id_source' => $config['client_id_source'],
            'client_id_hint' => $this->hint($config['client_id']),
            'client_secret_source' => $config['client_secret_source'],
            'client_secret_hint' => $this->hint($config['client_secret']),
            'client_secret_configured' => filled($config['client_secret']),
            'redirect_uri' => $config['redirect_uri'],
            'redirect_source' => $config['redirect_source'],
            'default_redirect_uri' => url('/api/v1/auth/google/callback'),
            'allow_registration' => $config['allow_registration'],
            'allowed_domains' => implode(', ', $config['allowed_domains']),
            'prompt' => $config['prompt'],
            'prompts' => self::PROMPTS,
            'console_url' => 'https://console.cloud.google.com/apis/credentials',
            'env_client_id_present' => filled(config('services.google.client_id')),
            'env_client_secret_present' => filled(config('services.google.client_secret')),
            'last_tested_at' => $row->last_tested_at?->toIso8601String(),
            'last_test_status' => $row->last_test_status,
            'last_test_message' => $row->last_test_message,
        ];
    }

    /**
     * Secret fields: omit to keep; send "" to clear (falls back to env).
     *
     * @param  array<string, mixed>  $data
     */
    public function update(array $data): GoogleAuthSetting
    {
        $row = $this->settings();
        EncryptedSettings::discardUnreadable($row, 'client_secret');
        $update = [];

        if (array_key_exists('enabled', $data)) {
            $update['enabled'] = (bool) $data['enabled'];
        }
        if (array_key_exists('allow_registration', $data)) {
            $update['allow_registration'] = (bool) $data['allow_registration'];
        }
        if (array_key_exists('prompt', $data) && is_string($data['prompt'])) {
            $update['prompt'] = in_array($data['prompt'], self::PROMPTS, true) ? $data['prompt'] : 'select_account';
        }
        foreach (['client_id', 'client_secret', 'redirect_uri', 'allowed_domains'] as $field) {
            if (! array_key_exists($field, $data)) {
                continue;
            }
            $value = is_string($data[$field]) ? trim($data[$field]) : '';
            $update[$field] = $value === '' ? null : $value;
        }

        if ($update !== []) {
            $row->update($update);
        }

        return $row->fresh();
    }

    /**
     * Verify the credentials by asking Google's token endpoint to exchange a
     * deliberately invalid code. Bad credentials answer `invalid_client`;
     * good credentials get as far as `invalid_grant`, which is the signal we
     * want without sending a real user through the consent screen.
     *
     * @return array{ok: bool, message: string}
     */
    public function testConnection(): array
    {
        $config = $this->config();

        if (! filled($config['client_id']) || ! filled($config['client_secret'])) {
            return $this->recordTest(false, 'Client ID and client secret are both required.');
        }

        try {
            $response = Http::asForm()->timeout(15)->post('https://oauth2.googleapis.com/token', [
                'code' => 'uidesired-credential-probe',
                'client_id' => $config['client_id'],
                'client_secret' => $config['client_secret'],
                'redirect_uri' => $config['redirect_uri'],
                'grant_type' => 'authorization_code',
            ]);
        } catch (Throwable $e) {
            return $this->recordTest(false, 'Could not reach Google: '.($e->getMessage() ?: 'network error'));
        }

        $error = (string) $response->json('error', '');
        $description = (string) $response->json('error_description', '');

        return match ($error) {
            'invalid_grant' => $this->recordTest(true, 'Credentials accepted by Google.'),
            'invalid_client' => $this->recordTest(false, 'Google rejected the client ID or secret.'),
            'redirect_uri_mismatch' => $this->recordTest(
                false,
                'Google rejected the redirect URI. Add '.$config['redirect_uri'].' to the OAuth client.',
            ),
            '' => $this->recordTest(false, 'Unexpected response from Google.'),
            default => $this->recordTest(false, $description !== '' ? $description : 'Google returned: '.$error),
        };
    }

    /**
     * @return array{ok: bool, message: string}
     */
    private function recordTest(bool $ok, string $message): array
    {
        $this->settings()->update([
            'last_tested_at' => now(),
            'last_test_status' => $ok ? 'ok' : 'failed',
            'last_test_message' => $message,
        ]);

        return ['ok' => $ok, 'message' => $message];
    }

    /**
     * @return list<string>
     */
    private function parseDomains(mixed $value): array
    {
        if (! is_string($value) || trim($value) === '') {
            return [];
        }

        return collect(preg_split('/[\s,;]+/', $value) ?: [])
            ->map(fn (string $domain) => Str::lower(ltrim(trim($domain), '@')))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    private function filledString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }
        $value = trim($value);

        return $value === '' ? null : $value;
    }

    private function hint(?string $value): ?string
    {
        if (! filled($value) || strlen($value) < 12) {
            return null;
        }

        return substr($value, 0, 8).'…'.substr($value, -4);
    }
}
