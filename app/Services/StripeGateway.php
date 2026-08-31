<?php

namespace App\Services;

use Stripe\Exception\SignatureVerificationException;
use Stripe\StripeClient;
use Stripe\Webhook;
use UnexpectedValueException;

class StripeGateway
{
    public function __construct(
        private readonly PaymentGatewaySettingsService $settings,
    ) {}

    public function enabled(): bool
    {
        $config = $this->settings->config();

        return $config['enabled'] && filled($config['secret']);
    }

    public function publishableKeySet(): bool
    {
        return filled($this->settings->config()['publishable_key']);
    }

    public function publishableKey(): ?string
    {
        return $this->settings->config()['publishable_key'];
    }

    public function webhookConfigured(): bool
    {
        return filled($this->settings->config()['webhook_secret']);
    }

    /**
     * @return array{configured: bool, publishable_key: bool, webhook_configured: bool, mode?: string, enabled?: bool}
     */
    public function status(): array
    {
        $config = $this->settings->config();

        return [
            'configured' => $this->enabled(),
            'enabled' => $config['enabled'],
            'publishable_key' => $this->publishableKeySet(),
            'webhook_configured' => $this->webhookConfigured(),
            'mode' => $config['mode'],
        ];
    }

    public function client(): StripeClient
    {
        if (! $this->enabled()) {
            throw new UnexpectedValueException('Stripe is not configured.');
        }

        return new StripeClient($this->secret());
    }

    public function constructEvent(string $payload, ?string $signature): \Stripe\Event
    {
        $secret = (string) ($this->settings->config()['webhook_secret'] ?? '');
        if ($secret === '') {
            throw new UnexpectedValueException('Stripe webhooks are not configured.');
        }

        if (! is_string($signature) || $signature === '') {
            throw new SignatureVerificationException('Missing Stripe-Signature header.');
        }

        return Webhook::constructEvent($payload, $signature, $secret);
    }

    private function secret(): string
    {
        return trim((string) ($this->settings->config()['secret'] ?? ''));
    }
}
