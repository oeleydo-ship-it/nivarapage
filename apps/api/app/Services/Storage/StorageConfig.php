<?php

namespace App\Services\Storage;

readonly class StorageConfig
{
    public function __construct(
        public string $provider,
        public ?string $bucket,
        public ?string $region,
        public ?string $endpoint,
        public ?string $publicUrl,
        public ?string $root,
        public bool $usePathStyleEndpoint,
        public ?string $accessKeyId,
        public ?string $secretAccessKey,
        public string $keySource,
        public string $diskName,
    ) {}

    public function isLocal(): bool
    {
        return $this->provider === 'local';
    }

    public function configured(): bool
    {
        if ($this->isLocal()) {
            return true;
        }

        return filled($this->bucket)
            && filled($this->accessKeyId)
            && filled($this->secretAccessKey);
    }

    public function keyHint(): ?string
    {
        if (! filled($this->accessKeyId) || strlen($this->accessKeyId) < 4) {
            return null;
        }

        return '••••'.substr($this->accessKeyId, -4);
    }
}
