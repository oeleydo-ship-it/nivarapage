<?php

namespace App\Services\Storage;

use App\Models\StorageSetting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

/**
 * Platform-wide media storage: local disk or S3-compatible object storage.
 *
 * Credentials may live in encrypted DB settings or fall back to env (AWS_* / R2_*).
 * Secrets are never returned from status().
 */
class StorageSettingsService
{
    public const DISK = 'media_external';

    public const PROVIDERS = [
        'local',
        'aws_s3',
        'digitalocean',
        'cloudflare_r2',
        'wasabi',
        's3_compatible',
    ];

    /** @var list<string> */
    public const WASABI_REGIONS = [
        'us-east-1',
        'us-east-2',
        'us-west-1',
        'us-central-1',
        'eu-central-1',
        'eu-west-1',
        'eu-west-2',
        'ap-northeast-1',
        'ap-northeast-2',
    ];

    public function settings(): StorageSetting
    {
        return StorageSetting::current();
    }

    public function config(): StorageConfig
    {
        $row = $this->settings();
        $provider = $this->normaliseProvider($row->provider ?? 'local');

        if ($provider === 'local') {
            $disk = (string) config('uidesired.media_disk', 'public');

            return new StorageConfig(
                provider: 'local',
                bucket: null,
                region: null,
                endpoint: null,
                publicUrl: null,
                root: null,
                usePathStyleEndpoint: false,
                accessKeyId: null,
                secretAccessKey: null,
                keySource: 'none',
                diskName: $disk !== '' ? $disk : 'public',
            );
        }

        [$key, $secret, $keySource] = $this->resolveCredentials($row, $provider);

        $bucket = $this->firstFilled([
            $row->bucket,
            $this->envBucket($provider),
        ]);
        $region = $this->firstFilled([
            $row->region,
            $this->envRegion($provider),
            $this->defaultRegion($provider),
        ]);
        $endpoint = $this->firstFilled([
            $row->endpoint,
            $this->envEndpoint($provider),
            $this->defaultEndpoint($provider, $region),
        ]);
        $publicUrl = $this->firstFilled([
            $row->public_url,
            $this->envPublicUrl($provider),
            $this->defaultPublicUrl($provider, $bucket, $region),
        ]);
        $root = $this->firstFilled([$row->root]);
        $pathStyle = $row->use_path_style_endpoint;
        if ($row->endpoint === null && $row->bucket === null && $row->access_key_id === null) {
            // Pure env mode: honour AWS_USE_PATH_STYLE_ENDPOINT / R2 defaults.
            $pathStyle = (bool) config('filesystems.disks.s3.use_path_style_endpoint', false);
            if ($provider === 'cloudflare_r2') {
                $pathStyle = (bool) config('filesystems.disks.r2.use_path_style_endpoint', true);
            }
            if ($provider === 'wasabi') {
                $pathStyle = (bool) config('filesystems.disks.wasabi.use_path_style_endpoint', false);
            }
        }

        return new StorageConfig(
            provider: $provider,
            bucket: $bucket,
            region: $region,
            endpoint: $endpoint,
            publicUrl: $publicUrl,
            root: $root,
            usePathStyleEndpoint: (bool) $pathStyle,
            accessKeyId: $key,
            secretAccessKey: $secret,
            keySource: $keySource,
            diskName: self::DISK,
        );
    }

    /**
     * Disk name used for new uploads. Registers the S3 disk when needed.
     */
    public function activeDisk(): string
    {
        $config = $this->config();
        if ($config->isLocal()) {
            return $config->diskName;
        }

        $this->registerExternalDisk($config);

        return self::DISK;
    }

    /**
     * @return array<string, mixed>
     */
    public function status(): array
    {
        $config = $this->config();
        $row = $this->settings();

        return [
            'provider' => $config->provider,
            'providers' => self::PROVIDERS,
            'provider_labels' => [
                'local' => 'Local server (public disk)',
                'aws_s3' => 'Amazon S3',
                'digitalocean' => 'DigitalOcean Spaces',
                'cloudflare_r2' => 'Cloudflare R2',
                'wasabi' => 'Wasabi Hot Cloud Storage',
                's3_compatible' => 'Custom S3-compatible',
            ],
            'configured' => $config->configured(),
            'bucket' => $config->bucket,
            'region' => $config->region,
            'endpoint' => $config->endpoint,
            'public_url' => $config->publicUrl,
            'root' => $config->root,
            'use_path_style_endpoint' => $config->usePathStyleEndpoint,
            'disk' => $config->isLocal() ? $config->diskName : self::DISK,
            'key_source' => $config->keySource,
            'key_hint' => $config->keyHint(),
            'env_key_present' => $config->keySource === 'env',
            'regions' => [
                'wasabi' => self::WASABI_REGIONS,
            ],
            'last_tested_at' => $row->last_tested_at?->toIso8601String(),
            'last_test_status' => $row->last_test_status,
            'last_test_message' => $row->last_test_message,
        ];
    }

    /**
     * Omit secret fields to keep stored values; send "" to clear (falls back to env).
     *
     * @param  array<string, mixed>  $data
     */
    public function update(array $data): StorageSetting
    {
        $row = $this->settings();
        $update = [];

        if (array_key_exists('provider', $data) && $data['provider'] !== null) {
            $update['provider'] = $this->normaliseProvider($data['provider']);
        }

        foreach (['bucket', 'region', 'endpoint', 'public_url', 'root'] as $key) {
            if (array_key_exists($key, $data)) {
                $value = is_string($data[$key]) ? trim($data[$key]) : null;
                $update[$key] = $value === '' ? null : $value;
            }
        }

        if (array_key_exists('use_path_style_endpoint', $data)) {
            $update['use_path_style_endpoint'] = (bool) $data['use_path_style_endpoint'];
        }

        foreach (['access_key_id', 'secret_access_key'] as $key) {
            if (array_key_exists($key, $data)) {
                $value = is_string($data[$key]) ? trim($data[$key]) : '';
                $update[$key] = $value === '' ? null : $value;
            }
        }

        $row->update($update);

        return $row->fresh();
    }

    /**
     * @return array{ok: bool, message: string}
     */
    public function testConnection(): array
    {
        $config = $this->config();

        if ($config->isLocal()) {
            $disk = Storage::disk($config->diskName);
            $probe = 'media/_health/'.Str::uuid()->toString().'.txt';
            try {
                $disk->put($probe, 'ok', 'public');
                $exists = $disk->exists($probe);
                $disk->delete($probe);
                if (! $exists) {
                    return $this->recordTest(false, 'Local disk write succeeded but the file was not readable.');
                }

                return $this->recordTest(true, 'Local public disk is writable.');
            } catch (Throwable $exception) {
                return $this->recordTest(false, 'Local disk error: '.$exception->getMessage());
            }
        }

        if (! $config->configured()) {
            return $this->recordTest(false, 'Bucket and access keys are required for external storage.');
        }

        try {
            $this->registerExternalDisk($config);
            $disk = Storage::disk(self::DISK);
            $probe = 'media/_health/'.Str::uuid()->toString().'.txt';
            $disk->put($probe, 'uidesired-storage-probe', 'public');
            $exists = $disk->exists($probe);
            $url = null;
            try {
                $url = $disk->url($probe);
            } catch (Throwable) {
                $url = null;
            }
            $disk->delete($probe);

            if (! $exists) {
                return $this->recordTest(false, 'Upload succeeded but the object was not found.');
            }

            $message = 'Connected to '.$config->provider.' bucket "'.$config->bucket.'"';
            if ($url) {
                $message .= '. Public URL sample: '.$url;
            }

            return $this->recordTest(true, $message);
        } catch (Throwable $exception) {
            return $this->recordTest(false, 'Connection failed: '.$this->scrubMessage($exception->getMessage()));
        }
    }

    public function registerExternalDisk(StorageConfig $config): void
    {
        Config::set('filesystems.disks.'.self::DISK, [
            'driver' => 's3',
            'key' => $config->accessKeyId,
            'secret' => $config->secretAccessKey,
            'region' => $config->region ?: 'us-east-1',
            'bucket' => $config->bucket,
            'url' => $config->publicUrl,
            'endpoint' => $config->endpoint,
            'use_path_style_endpoint' => $config->usePathStyleEndpoint,
            'root' => $config->root ?: null,
            'throw' => true,
            'report' => false,
            'visibility' => 'public',
        ]);
    }

    private function normaliseProvider(mixed $provider): string
    {
        $value = is_string($provider) ? strtolower(trim($provider)) : '';
        $aliases = [
            's3' => 'aws_s3',
            'aws' => 'aws_s3',
            'spaces' => 'digitalocean',
            'do' => 'digitalocean',
            'r2' => 'cloudflare_r2',
            'custom' => 's3_compatible',
            'minio' => 's3_compatible',
        ];
        $value = $aliases[$value] ?? $value;

        return in_array($value, self::PROVIDERS, true) ? $value : 'local';
    }

    public static function wasabiEndpointForRegion(?string $region): string
    {
        $region = is_string($region) && trim($region) !== '' ? trim($region) : 'us-east-1';

        if ($region === 'us-east-1') {
            return 'https://s3.wasabisys.com';
        }

        return 'https://s3.'.$region.'.wasabisys.com';
    }

    /**
     * @return array{0: ?string, 1: ?string, 2: string}
     */
    private function resolveCredentials(StorageSetting $row, string $provider): array
    {
        $dbKey = is_string($row->access_key_id) && trim($row->access_key_id) !== '' ? trim($row->access_key_id) : null;
        $dbSecret = is_string($row->secret_access_key) && trim($row->secret_access_key) !== '' ? trim($row->secret_access_key) : null;

        if ($dbKey && $dbSecret) {
            return [$dbKey, $dbSecret, 'settings'];
        }

        $envKey = $this->envKey($provider);
        $envSecret = $this->envSecret($provider);
        if ($envKey && $envSecret) {
            return [$envKey, $envSecret, 'env'];
        }

        return [$dbKey ?? $envKey, $dbSecret ?? $envSecret, 'none'];
    }

    private function envKey(string $provider): ?string
    {
        if ($provider === 'cloudflare_r2') {
            return $this->firstFilled([
                config('filesystems.disks.r2.key'),
                config('filesystems.disks.s3.key'),
            ]);
        }

        if ($provider === 'wasabi') {
            return $this->firstFilled([
                config('filesystems.disks.wasabi.key'),
                config('filesystems.disks.s3.key'),
            ]);
        }

        return $this->firstFilled([config('filesystems.disks.s3.key')]);
    }

    private function envSecret(string $provider): ?string
    {
        if ($provider === 'cloudflare_r2') {
            return $this->firstFilled([
                config('filesystems.disks.r2.secret'),
                config('filesystems.disks.s3.secret'),
            ]);
        }

        if ($provider === 'wasabi') {
            return $this->firstFilled([
                config('filesystems.disks.wasabi.secret'),
                config('filesystems.disks.s3.secret'),
            ]);
        }

        return $this->firstFilled([config('filesystems.disks.s3.secret')]);
    }

    private function envBucket(string $provider): ?string
    {
        if ($provider === 'cloudflare_r2') {
            return $this->firstFilled([
                config('filesystems.disks.r2.bucket'),
                config('filesystems.disks.s3.bucket'),
            ]);
        }

        if ($provider === 'wasabi') {
            return $this->firstFilled([
                config('filesystems.disks.wasabi.bucket'),
                config('filesystems.disks.s3.bucket'),
            ]);
        }

        return $this->firstFilled([config('filesystems.disks.s3.bucket')]);
    }

    private function envRegion(string $provider): ?string
    {
        if ($provider === 'cloudflare_r2') {
            return $this->firstFilled([
                config('filesystems.disks.r2.region'),
                config('filesystems.disks.s3.region'),
                'auto',
            ]);
        }

        if ($provider === 'wasabi') {
            return $this->firstFilled([
                config('filesystems.disks.wasabi.region'),
                config('filesystems.disks.s3.region'),
            ]);
        }

        return $this->firstFilled([config('filesystems.disks.s3.region')]);
    }

    private function envEndpoint(string $provider): ?string
    {
        if ($provider === 'cloudflare_r2') {
            return $this->firstFilled([
                config('filesystems.disks.r2.endpoint'),
                config('filesystems.disks.s3.endpoint'),
            ]);
        }

        if ($provider === 'wasabi') {
            return $this->firstFilled([
                config('filesystems.disks.wasabi.endpoint'),
                config('filesystems.disks.s3.endpoint'),
            ]);
        }

        return $this->firstFilled([config('filesystems.disks.s3.endpoint')]);
    }

    private function envPublicUrl(string $provider): ?string
    {
        if ($provider === 'cloudflare_r2') {
            return $this->firstFilled([
                config('filesystems.disks.r2.url'),
                config('filesystems.disks.s3.url'),
            ]);
        }

        if ($provider === 'wasabi') {
            return $this->firstFilled([
                config('filesystems.disks.wasabi.url'),
                config('filesystems.disks.s3.url'),
            ]);
        }

        return $this->firstFilled([config('filesystems.disks.s3.url')]);
    }

    private function defaultRegion(string $provider): ?string
    {
        return match ($provider) {
            'cloudflare_r2' => 'auto',
            'digitalocean' => 'nyc3',
            'wasabi' => 'us-east-1',
            default => 'us-east-1',
        };
    }

    private function defaultEndpoint(string $provider, ?string $region): ?string
    {
        if ($provider === 'digitalocean' && filled($region)) {
            return 'https://'.$region.'.digitaloceanspaces.com';
        }

        if ($provider === 'wasabi') {
            return self::wasabiEndpointForRegion($region);
        }

        return null;
    }

    private function defaultPublicUrl(string $provider, ?string $bucket, ?string $region): ?string
    {
        if ($provider !== 'wasabi' || ! filled($bucket)) {
            return null;
        }

        // Virtual-hosted style so published <img src> URLs resolve without signing.
        $endpoint = rtrim(self::wasabiEndpointForRegion($region), '/');
        $host = parse_url($endpoint, PHP_URL_HOST) ?: 's3.wasabisys.com';

        return 'https://'.$bucket.'.'.$host;
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

    private function scrubMessage(string $message): string
    {
        $message = preg_replace('/AKIA[0-9A-Z]{16}/', '[key]', $message) ?? $message;
        $message = preg_replace('/(?i)(secret|password|token)[=:]\s*\S+/', '$1=[redacted]', $message) ?? $message;

        return mb_substr($message, 0, 400);
    }

    /**
     * @param  list<mixed>  $values
     */
    private function firstFilled(array $values): ?string
    {
        foreach ($values as $value) {
            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }
        }

        return null;
    }
}
