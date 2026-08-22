<?php

namespace Tests\Support;

use Stripe\HttpClient\ClientInterface;

class FakeStripeHttpClient implements ClientInterface
{
    /**
     * @param  array<int, string>  $headers
     * @param  array<string, mixed>  $params
     * @return array{0: string, 1: int, 2: array<string, string>}
     */
    public function request($method, $absUrl, $headers, $params, $hasFile, $apiMode = 'v1', $maxNetworkRetries = null): array
    {
        $path = parse_url($absUrl, PHP_URL_PATH) ?: '';

        $payload = match (true) {
            str_contains($path, '/customers') && $method === 'post' => [
                'id' => 'cus_test_123',
                'object' => 'customer',
                'email' => $params['email'] ?? null,
            ],
            str_contains($path, '/checkout/sessions') && $method === 'post' => [
                'id' => 'cs_test_fake',
                'object' => 'checkout.session',
                'url' => 'https://checkout.stripe.com/c/pay/cs_test_fake',
                'mode' => 'subscription',
                'customer' => $params['customer'] ?? 'cus_test_123',
            ],
            str_contains($path, '/billing_portal/sessions') && $method === 'post' => [
                'id' => 'bps_test_fake',
                'object' => 'billing_portal.session',
                'url' => 'https://billing.stripe.com/p/session/test',
            ],
            default => [
                'id' => 'obj_test_fake',
                'object' => 'list',
                'data' => [],
            ],
        };

        return [json_encode($payload, JSON_THROW_ON_ERROR), 200, []];
    }
}
