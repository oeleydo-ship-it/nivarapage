<?php

namespace App\Http\Resources;

use App\Models\Domain;
use App\Services\Domains\DnsInstructionBuilder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Domain */
class DomainResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'site_id' => $this->site_id,
            'type' => $this->type,
            'hostname' => $this->hostname,
            'is_primary' => $this->is_primary,
            'status' => $this->status,
            'provider' => $this->provider,
            'provider_reference' => $this->provider_reference,
            'verification_method' => $this->verification_method,
            'verification_status' => $this->verification_status,
            'verification_data' => $this->verification_data,
            'ssl_status' => $this->ssl_status,
            'last_checked_at' => $this->last_checked_at,
            'activated_at' => $this->activated_at,
            // Everything the customer needs to point their DNS here. Only
            // custom hostnames need it; platform subdomains already resolve.
            'dns' => $this->when(
                $this->type === 'custom',
                fn () => app(DnsInstructionBuilder::class)->for($this->resource),
            ),
        ];
    }
}
