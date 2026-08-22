<?php

namespace App\Services;

use App\Models\PaymentGatewaySetting;
use Stripe\Exception\ApiErrorException;
use Throwable;

/**
 * Super-admin Stripe / payment gateway configuration.
 *
 * Secrets are write-only. Values stored in Admin override environment
 * variables; clearing a stored secret falls back to STRIPE_* env keys.
 */
class PaymentGatewaySettingsService
{
    public const PROVIDERS = ['stripe'];

    public function settings(): PaymentGatewaySetting
    {
        return PaymentGatewaySetting::current();
    }

    /**
     * @return array{
     *   enabled: bool,
     *   provider: string,
     *   mode: string,
     *   secret: string|null,
     *   publishable_key: string|null,
     *   webhook_secret: string|null,
     *   secret_source: string,
     *   publishable_source: string,
     *   webhook_source: string
     * }
     */
    public function config(): array
    {
        $row = $this->settings();

        $dbSecret = $this->filledString($row->secret_key);
        $envSecret = $this->filledString(config('services.stripe.secret'));
        $dbPublishable = $this->filledString($row->publishable_key);
        $envPublishable = $this->filledString(config('services.stripe.key'));
        $dbWebhook = $this->filledString($row->webhook_secret);
        $envWebhook = $this->filledString(config('services.stripe.webhook_secret'));

        $secret = $dbSecret ?? $envSecret;
        $publishable = $dbPublishable ?? $envPublishable;
        $webhook = $dbWebhook ?? $envWebhook;

        $mode = in_array($row->mode, ['test', 'live'], true)
            ? $row->mode
            : ($secret && str_starts_with($secret, 'sk_live') ? 'live' : 'test');

        return [
            'enabled' => (bool) $row->enabled,
            'provider' => $row->provider ?: 'stripe',
            'mode' => $mode,
            'secret' => $secret,
            'publishable_key' => $publishable,
            'webhook_secret' => $webhook,
            'secret_source' => $dbSecret !== null ? 'settings' : ($envSecret !== null ? 'env' : 'none'),
            'publishable_source' => $dbPublishable !== null ? 'settings' : ($envPublishable !== null ? 'env' : 'none'),
            'webhook_source' => $dbWebhook !== null ? 'settings' : ($envWebhook !== null ? 'env' : 'none'),
        ];
    }

    /**
     * Dashboard-facing status. Never includes raw secrets.
     *
     * @return array<string, mixed>
     */
    public function status(): array
    {
        $config = $this->config();
        $row = $this->settings();
        $configured = $config['enabled'] && filled($config['secret']);

        return [
            'enabled' => $config['enabled'],
            'configured' => $configured,
            'provider' => $config['provider'],
            'providers' => self::PROVIDERS,
            'mode' => $config['mode'],
            'publishable_key' => $config['publishable_key'],
            'publishable_source' => $config['publishable_source'],
            'publishable_hint' => $this->hint($config['publishable_key']),
            'secret_source' => $config['secret_source'],
            'secret_hint' => $this->hint($config['secret']),
            'webhook_source' => $config['webhook_source'],
            'webhook_hint' => $this->hint($config['webhook_secret']),
            'webhook_configured' => filled($config['webhook_secret']),
            'webhook_url' => url('/api/v1/billing/webhook'),
            'env_secret_present' => $config['secret_source'] === 'env' || (
                $config['secret_source'] === 'settings' && filled(config('services.stripe.secret'))
            ),
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
    public function update(array $data): PaymentGatewaySetting
    {
        $row = $this->settings();
        $update = [];

        if (array_key_exists('enabled', $data)) {
            $update['enabled'] = (bool) $data['enabled'];
        }
        if (array_key_exists('provider', $data) && is_string($data['provider'])) {
            $update['provider'] = in_array($data['provider'], self::PROVIDERS, true) ? $data['provider'] : 'stripe';
        }
        if (array_key_exists('mode', $data) && is_string($data['mode'])) {
            $update['mode'] = in_array($data['mode'], ['test', 'live'], true) ? $data['mode'] : 'test';
        }
        if (array_key_exists('publishable_key', $data)) {
            $value = is_string($data['publishable_key']) ? trim($data['publishable_key']) : '';
            $update['publishable_key'] = $value === '' ? null : $value;
        }
        if (array_key_exists('secret_key', $data)) {
            $value = is_string($data['secret_key']) ? trim($data['secret_key']) : '';
            $update['secret_key'] = $value === '' ? null : $value;
        }
        if (array_key_exists('webhook_secret', $data)) {
            $value = is_string($data['webhook_secret']) ? trim($data['webhook_secret']) : '';
            $update['webhook_secret'] = $value === '' ? null : $value;
        }

        if ($update !== []) {
            $row->update($update);
        }

        return $row->fresh();
    }

    /**
     * @return array{ok: bool, message: string}
     */
    public function testConnection(StripeGateway $stripe): array
    {
        $row = $this->settings();

        if (! $stripe->enabled()) {
            $message = 'Stripe is not enabled or the secret key is missing.';
            $row->update([
                'last_tested_at' => now(),
                'last_test_status' => 'failed',
                'last_test_message' => $message,
            ]);

            return ['ok' => false, 'message' => $message];
        }

        try {
            $account = $stripe->client()->accounts->retrieve();
            $label = is_string($account->id ?? null) ? $account->id : 'account';
            $message = "Connected to Stripe ({$label}).";
            $row->update([
                'last_tested_at' => now(),
                'last_test_status' => 'ok',
                'last_test_message' => $message,
            ]);

            return ['ok' => true, 'message' => $message];
        } catch (ApiErrorException $e) {
            $message = $e->getMessage() ?: 'Stripe API rejected the credentials.';
            $row->update([
                'last_tested_at' => now(),
                'last_test_status' => 'failed',
                'last_test_message' => $message,
            ]);

            return ['ok' => false, 'message' => $message];
        } catch (Throwable $e) {
            $message = $e->getMessage() ?: 'Could not reach Stripe.';
            $row->update([
                'last_tested_at' => now(),
                'last_test_status' => 'failed',
                'last_test_message' => $message,
            ]);

            return ['ok' => false, 'message' => $message];
        }
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
        if (! filled($value) || strlen($value) < 8) {
            return null;
        }

        return substr($value, 0, 7).'…'.substr($value, -4);
    }
}
