<?php

namespace App\Services\Cloudflare;

use App\Models\CloudflareSetting;
use App\Services\Domains\ApexAddressResolver;
use Illuminate\Support\Facades\Config;

/**
 * Super-admin Cloudflare for SaaS configuration: the credentials and hostnames
 * that make customer custom domains resolve here and get an HTTPS certificate.
 *
 * Values stored in Admin override the CLOUDFLARE_* environment variables, and
 * apply() pushes the resolved values back into config() so every existing
 * consumer (CloudflareClient, CustomHostnameService, DnsInstructionBuilder,
 * the domain provider binding) keeps reading config as it always has.
 *
 * The API token and webhook secret are write-only and never returned.
 */
class CloudflareSettingsService
{
    /** @var list<string> */
    public const SSL_VALIDATIONS = ['txt', 'http'];

    /** @var list<string> */
    public const TLS_VERSIONS = ['1.0', '1.1', '1.2', '1.3'];

    /**
     * Config key holding a snapshot of the deployment's own Cloudflare config,
     * taken before apply() overwrites it.
     *
     * Without this, apply() writes the resolved token into
     * `services.cloudflare.api_token` - the very key config() reads as the env
     * fallback - so clearing a stored value would fall back to the value we
     * had just applied instead of to the environment.
     */
    private const SNAPSHOT = 'uidesired.cloudflare_env';

    public function __construct(
        private readonly CloudflareClient $client,
        private readonly ApexAddressResolver $apex,
    ) {}

    public function settings(): CloudflareSetting
    {
        return CloudflareSetting::current();
    }

    /** Records the deployment's Cloudflare config. Safe to call more than once. */
    public function snapshotEnvironment(): void
    {
        if (is_array(Config::get(self::SNAPSHOT))) {
            return;
        }

        Config::set(self::SNAPSHOT, [
            'saas_enabled' => (bool) config('uidesired.cloudflare.saas_enabled'),
            'api_token' => config('services.cloudflare.api_token'),
            'webhook_secret' => config('services.cloudflare.webhook_secret'),
            'zone_id' => config('services.cloudflare.zone_id'),
            'account_id' => config('services.cloudflare.account_id'),
            'fallback_origin' => config('services.cloudflare.fallback_origin'),
            'cname_target' => config('uidesired.cloudflare.cname_target'),
            'apex_ips' => (array) config('uidesired.cloudflare.apex_ips', []),
            'ssl_validation' => config('uidesired.cloudflare.ssl_validation'),
            'min_tls_version' => config('uidesired.cloudflare.min_tls_version'),
        ]);
    }

    /** The deployment's own value for a setting, ignoring anything we applied. */
    private function env(string $key): mixed
    {
        $this->snapshotEnvironment();

        return config(self::SNAPSHOT.'.'.$key);
    }

    /**
     * Resolved configuration, secrets included. Internal use only.
     *
     * @return array<string, mixed>
     */
    public function config(): array
    {
        $row = $this->settings();

        $token = $this->resolve($row->api_token, $this->env('api_token'));
        $webhook = $this->resolve($row->webhook_secret, $this->env('webhook_secret'));
        $zone = $this->resolve($row->zone_id, $this->env('zone_id'));
        $account = $this->resolve($row->account_id, $this->env('account_id'));
        $fallback = $this->resolve($row->fallback_origin, $this->env('fallback_origin'));

        // A blank vanity target means "CNAME straight at the fallback origin",
        // which is the minimal setup Cloudflare still accepts.
        $target = $this->resolve($row->cname_target, $this->env('cname_target'));
        if ($target['value'] === null) {
            $target = [
                'value' => $fallback['value'],
                'source' => $fallback['value'] === null ? 'none' : 'fallback_origin',
            ];
        }

        $apexIps = $this->parseIps($row->apex_ips);
        $apexSource = 'settings';
        if ($apexIps === []) {
            $apexIps = array_values(array_filter((array) $this->env('apex_ips')));
            $apexSource = $apexIps === [] ? 'none' : 'env';
        }

        $validation = $this->resolve($row->ssl_validation, $this->env('ssl_validation'));
        $tls = $this->resolve($row->min_tls_version, $this->env('min_tls_version'));

        $enabled = $row->enabled === null ? (bool) $this->env('saas_enabled') : (bool) $row->enabled;

        return [
            'enabled' => $enabled,
            'enabled_source' => $row->enabled === null ? 'env' : 'settings',
            'api_token' => $token['value'],
            'api_token_source' => $token['source'],
            'webhook_secret' => $webhook['value'],
            'webhook_secret_source' => $webhook['source'],
            'zone_id' => $zone['value'],
            'zone_id_source' => $zone['source'],
            'account_id' => $account['value'],
            'account_id_source' => $account['source'],
            'fallback_origin' => $fallback['value'],
            'fallback_origin_source' => $fallback['source'],
            'cname_target' => $target['value'],
            'cname_target_source' => $target['source'],
            'apex_ips' => $apexIps,
            'apex_ips_source' => $apexSource,
            'ssl_validation' => in_array($validation['value'], self::SSL_VALIDATIONS, true) ? $validation['value'] : 'txt',
            'min_tls_version' => in_array($tls['value'], self::TLS_VERSIONS, true) ? $tls['value'] : '1.2',
        ];
    }

    /**
     * True when custom hostnames can actually be created: the toggle is on and
     * the credentials Cloudflare needs are present.
     */
    public function usable(): bool
    {
        $config = $this->config();

        return $config['enabled']
            && filled($config['api_token'])
            && filled($config['zone_id']);
    }

    /**
     * Pushes the resolved configuration into config() so the rest of the app
     * keeps reading a single source of truth.
     */
    public function apply(): void
    {
        $this->snapshotEnvironment();
        $config = $this->config();

        Config::set('services.cloudflare.api_token', $config['api_token']);
        Config::set('services.cloudflare.webhook_secret', $config['webhook_secret']);
        Config::set('services.cloudflare.zone_id', $config['zone_id']);
        Config::set('services.cloudflare.account_id', $config['account_id']);
        Config::set('services.cloudflare.fallback_origin', $config['fallback_origin']);
        Config::set('services.cloudflare.saas_enabled', $config['enabled']);

        Config::set('uidesired.cloudflare.saas_enabled', $config['enabled']);
        Config::set('uidesired.cloudflare.api_token', $config['api_token']);
        Config::set('uidesired.cloudflare.webhook_secret', $config['webhook_secret']);
        Config::set('uidesired.cloudflare.zone_id', $config['zone_id']);
        Config::set('uidesired.cloudflare.account_id', $config['account_id']);
        Config::set('uidesired.cloudflare.fallback_origin', $config['fallback_origin']);
        Config::set('uidesired.cloudflare.cname_target', $config['cname_target']);
        Config::set('uidesired.cloudflare.apex_ips', $config['apex_ips']);
        Config::set('uidesired.cloudflare.ssl_validation', $config['ssl_validation']);
        Config::set('uidesired.cloudflare.min_tls_version', $config['min_tls_version']);
    }

    /**
     * Dashboard-facing status. Never includes the token or webhook secret.
     *
     * @return array<string, mixed>
     */
    public function status(): array
    {
        $config = $this->config();
        $row = $this->settings();

        return [
            'enabled' => $config['enabled'],
            'enabled_source' => $config['enabled_source'],
            'configured' => $this->usable(),
            'provider' => (string) config('uidesired.domain_provider', 'cloudflare'),
            'live' => $this->usable() && config('uidesired.domain_provider') !== 'fake',

            'api_token_configured' => filled($config['api_token']),
            'api_token_source' => $config['api_token_source'],
            'api_token_hint' => $this->hint($config['api_token']),

            'webhook_secret_configured' => filled($config['webhook_secret']),
            'webhook_secret_source' => $config['webhook_secret_source'],
            'webhook_secret_hint' => $this->hint($config['webhook_secret']),

            'zone_id' => $config['zone_id'],
            'zone_id_source' => $config['zone_id_source'],
            'account_id' => $config['account_id'],
            'account_id_source' => $config['account_id_source'],

            'fallback_origin' => $config['fallback_origin'],
            'fallback_origin_source' => $config['fallback_origin_source'],
            'cname_target' => $config['cname_target'],
            'cname_target_source' => $config['cname_target_source'],
            'apex_ips' => implode(', ', $config['apex_ips']),
            'apex_ips_source' => $config['apex_ips_source'],
            // What a customer's root domain is actually told to point at: the
            // override above when set, otherwise whatever the CNAME target
            // resolves to right now.
            'apex_addresses' => $this->apexAddresses(),

            'ssl_validation' => $config['ssl_validation'],
            'ssl_validations' => self::SSL_VALIDATIONS,
            'min_tls_version' => $config['min_tls_version'],
            'tls_versions' => self::TLS_VERSIONS,

            'env' => [
                'saas_enabled' => (bool) $this->env('saas_enabled'),
                'api_token' => filled($this->env('api_token')),
                'zone_id' => filled($this->env('zone_id')),
                'account_id' => filled($this->env('account_id')),
                'fallback_origin' => filled($this->env('fallback_origin')),
                'cname_target' => filled($this->env('cname_target')),
                'webhook_secret' => filled($this->env('webhook_secret')),
            ],

            'dashboard_url' => filled($config['account_id'])
                ? 'https://dash.cloudflare.com/'.$config['account_id']
                : 'https://dash.cloudflare.com/',

            'last_tested_at' => $row->last_tested_at?->toIso8601String(),
            'last_test_status' => $row->last_test_status,
            'last_test_message' => $row->last_test_message,
            'fallback_synced_at' => $row->fallback_synced_at?->toIso8601String(),
            'fallback_status' => $row->fallback_status,
            'fallback_message' => $row->fallback_message,
        ];
    }

    /**
     * The addresses root domains are pointed at. Reads DNS, so it is applied
     * config first and cached by the resolver.
     *
     * @return array{ipv4: list<string>, ipv6: list<string>, source: string, target: string|null}
     */
    public function apexAddresses(bool $refresh = false): array
    {
        $this->apply();

        return $refresh ? $this->apex->refresh() : $this->apex->addresses();
    }

    /**
     * Secret fields: omit to keep; send "" to clear (falls back to env).
     *
     * @param  array<string, mixed>  $data
     */
    public function update(array $data): CloudflareSetting
    {
        $row = $this->settings();
        $update = [];

        if (array_key_exists('enabled', $data)) {
            $update['enabled'] = $data['enabled'] === null ? null : (bool) $data['enabled'];
        }

        foreach (['api_token', 'webhook_secret', 'zone_id', 'account_id', 'fallback_origin', 'cname_target'] as $field) {
            if (! array_key_exists($field, $data)) {
                continue;
            }
            $value = is_string($data[$field]) ? trim($data[$field]) : '';
            $update[$field] = $value === '' ? null : $value;
        }

        foreach (['fallback_origin', 'cname_target'] as $field) {
            if (isset($update[$field])) {
                $update[$field] = $this->normalizeHost($update[$field]);
            }
        }

        if (array_key_exists('apex_ips', $data)) {
            $ips = $this->parseIps($data['apex_ips']);
            $update['apex_ips'] = $ips === [] ? null : implode(',', $ips);
        }

        if (array_key_exists('ssl_validation', $data)) {
            $value = is_string($data['ssl_validation']) ? trim($data['ssl_validation']) : '';
            $update['ssl_validation'] = in_array($value, self::SSL_VALIDATIONS, true) ? $value : null;
        }

        if (array_key_exists('min_tls_version', $data)) {
            $value = is_string($data['min_tls_version']) ? trim($data['min_tls_version']) : '';
            $update['min_tls_version'] = in_array($value, self::TLS_VERSIONS, true) ? $value : null;
        }

        if ($update !== []) {
            $row->update($update);
        }

        $row = $row->fresh();
        // New credentials have to reach config() before the next Cloudflare
        // call in this same request (the connection test right after a save).
        $this->apply();

        // Root domains are pointed at whatever the CNAME target resolves to, so
        // a new target must not keep handing out the old addresses.
        if (array_key_exists('cname_target', $data) || array_key_exists('fallback_origin', $data)) {
            $this->apex->refresh();
        }

        return $row;
    }

    /**
     * Verifies the token and that it can actually see the zone and its custom
     * hostnames - a token with the wrong scope answers 200 on /user/tokens/verify
     * but fails the moment a customer connects a domain.
     *
     * @return array{ok: bool, message: string}
     */
    public function testConnection(): array
    {
        $this->apply();
        $config = $this->config();

        if (blank($config['api_token'])) {
            return $this->recordTest(false, 'An API token is required.');
        }
        if (blank($config['zone_id'])) {
            return $this->recordTest(false, 'A zone ID is required.');
        }

        $verify = $this->client->request('GET', 'user/tokens/verify');
        if (! ($verify['success'] ?? false)) {
            return $this->recordTest(false, 'Cloudflare rejected the API token: '.$this->messages($verify));
        }

        $zone = $this->client->request('GET', 'zones/'.$config['zone_id']);
        if (! ($zone['success'] ?? false)) {
            return $this->recordTest(false, 'The token cannot read zone '.$config['zone_id'].': '.$this->messages($zone));
        }

        $hostnames = $this->client->request('GET', 'zones/'.$config['zone_id'].'/custom_hostnames?per_page=1');
        if (! ($hostnames['success'] ?? false)) {
            return $this->recordTest(
                false,
                'The token reads the zone but not its custom hostnames. Add the "SSL and Certificates: Edit" permission. '
                    .$this->messages($hostnames),
            );
        }

        $name = (string) ($zone['result']['name'] ?? $config['zone_id']);
        $plan = (string) ($zone['result']['plan']['name'] ?? '');

        return $this->recordTest(
            true,
            'Connected to zone '.$name.($plan !== '' ? ' ('.$plan.')' : '').'. Custom hostnames are readable.',
        );
    }

    /**
     * What Cloudflare currently believes the zone's fallback origin is.
     *
     * @return array<string, mixed>
     */
    public function fallbackOrigin(): array
    {
        $this->apply();
        $config = $this->config();

        if (blank($config['api_token']) || blank($config['zone_id'])) {
            return [
                'configured' => false,
                'origin' => null,
                'status' => null,
                'expected' => $config['fallback_origin'],
                'matches' => false,
                'errors' => ['API token and zone ID are required.'],
            ];
        }

        $response = $this->client->request('GET', 'zones/'.$config['zone_id'].'/custom_hostnames/fallback_origin');

        if (! ($response['success'] ?? false)) {
            return [
                'configured' => false,
                'origin' => null,
                'status' => null,
                'expected' => $config['fallback_origin'],
                'matches' => false,
                'errors' => [$this->messages($response)],
            ];
        }

        $result = (array) ($response['result'] ?? []);
        $origin = is_string($result['origin'] ?? null) ? $result['origin'] : null;

        return [
            'configured' => filled($origin),
            'origin' => $origin,
            'status' => $result['status'] ?? null,
            'expected' => $config['fallback_origin'],
            'matches' => filled($origin) && $origin === $config['fallback_origin'],
            'errors' => array_values(array_filter((array) ($result['errors'] ?? []), 'is_string')),
        ];
    }

    /**
     * Points the zone's fallback origin at the configured hostname. This is the
     * record every custom hostname proxies to, so nothing works until it is set
     * and Cloudflare reports it active.
     *
     * @return array{ok: bool, message: string}
     */
    public function syncFallbackOrigin(): array
    {
        $this->apply();
        $config = $this->config();

        if (blank($config['api_token']) || blank($config['zone_id'])) {
            return $this->recordFallback(false, 'API token and zone ID are required.');
        }
        if (blank($config['fallback_origin'])) {
            return $this->recordFallback(false, 'Set a fallback origin hostname first.');
        }

        $response = $this->client->request('PUT', 'zones/'.$config['zone_id'].'/custom_hostnames/fallback_origin', [
            'json' => ['origin' => $config['fallback_origin']],
        ]);

        if (! ($response['success'] ?? false)) {
            return $this->recordFallback(false, 'Cloudflare refused the fallback origin: '.$this->messages($response));
        }

        $status = (string) ($response['result']['status'] ?? 'pending_deployment');

        return $this->recordFallback(
            true,
            'Fallback origin set to '.$config['fallback_origin'].' (status: '.$status.'). It can take a few minutes to become active.',
            $status,
        );
    }

    /**
     * @return array{ok: bool, message: string}
     */
    private function recordTest(bool $ok, string $message): array
    {
        $this->settings()->update([
            'last_tested_at' => now(),
            'last_test_status' => $ok ? 'ok' : 'failed',
            'last_test_message' => mb_substr($message, 0, 500),
        ]);

        return ['ok' => $ok, 'message' => $message];
    }

    /**
     * @return array{ok: bool, message: string}
     */
    private function recordFallback(bool $ok, string $message, ?string $status = null): array
    {
        $this->settings()->update([
            'fallback_synced_at' => now(),
            'fallback_status' => $ok ? ($status ?: 'ok') : 'failed',
            'fallback_message' => mb_substr($message, 0, 500),
        ]);

        return ['ok' => $ok, 'message' => $message];
    }

    /**
     * @param  array<string, mixed>  $response
     */
    private function messages(array $response): string
    {
        $out = [];
        foreach ((array) ($response['errors'] ?? []) as $error) {
            $message = is_array($error) ? ($error['message'] ?? null) : $error;
            if (is_string($message) && $message !== '') {
                $out[] = $message;
            }
        }

        return $out === [] ? 'Cloudflare returned no error detail.' : implode(' ', array_unique($out));
    }

    /**
     * @return array{value: string|null, source: string}
     */
    private function resolve(mixed $stored, mixed $env): array
    {
        $db = $this->filledString($stored);
        if ($db !== null) {
            return ['value' => $db, 'source' => 'settings'];
        }

        $fromEnv = $this->filledString($env);

        return ['value' => $fromEnv, 'source' => $fromEnv !== null ? 'env' : 'none'];
    }

    private function filledString(mixed $value): ?string
    {
        return is_string($value) && trim($value) !== '' ? trim($value) : null;
    }

    private function normalizeHost(string $value): string
    {
        $value = strtolower(trim($value));
        $value = preg_replace('#^https?://#', '', $value) ?? $value;

        return rtrim(explode('/', $value)[0], '.');
    }

    /**
     * @return list<string>
     */
    private function parseIps(mixed $value): array
    {
        $parts = is_array($value) ? $value : explode(',', (string) $value);
        $out = [];
        foreach ($parts as $part) {
            $ip = trim((string) $part);
            if ($ip !== '' && filter_var($ip, FILTER_VALIDATE_IP)) {
                $out[] = $ip;
            }
        }

        return array_values(array_unique($out));
    }

    private function hint(?string $secret): ?string
    {
        if (! is_string($secret) || $secret === '') {
            return null;
        }

        return strlen($secret) <= 8
            ? str_repeat('*', strlen($secret))
            : substr($secret, 0, 4).str_repeat('*', 4).substr($secret, -4);
    }
}
