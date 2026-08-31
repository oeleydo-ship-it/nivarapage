<?php

namespace App\Services\Cloudflare;

use App\Jobs\SyncCustomHostnameStatus;
use App\Models\Domain;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CloudflareWebhookService
{
    public function handle(Request $request): void
    {
        $secret = (string) config('services.cloudflare.webhook_secret');
        if ($secret !== '') {
            $signature = (string) $request->header('X-Cloudflare-Webhook-Signature', '');
            if (! hash_equals($secret, $signature)) {
                abort(403);
            }
        }

        $hostname = $request->input('hostname') ?? $request->input('data.hostname');
        if (! $hostname) {
            Log::info('cloudflare.webhook.ignored', $request->all());

            return;
        }

        $domain = Domain::query()->where('hostname', $hostname)->first();
        if ($domain) {
            SyncCustomHostnameStatus::dispatch($domain->id)->onQueue('domains');
        }
    }
}
