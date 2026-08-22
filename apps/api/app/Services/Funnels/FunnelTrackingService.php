<?php

namespace App\Services\Funnels;

use App\Jobs\ProcessFunnelEvent;
use App\Models\Funnel;
use App\Models\FunnelEvent;
use App\Models\FunnelLead;
use App\Models\FunnelSession;
use App\Models\FunnelStep;
use App\Models\FunnelVisitor;
use App\Support\BrowserDetector;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FunnelTrackingService
{
    public function __construct(private readonly FunnelBotDetector $bots) {}

    /** @param array<string, mixed> $data */
    public function track(Funnel $funnel, FunnelStep $step, Request $request, array $data): array
    {
        abort_unless($funnel->status === 'published' && $step->funnel_id === $funnel->id, 404);
        $visitorUuid = $this->uuid($data['visitor_id'] ?? null);
        $sessionUuid = $this->uuid($data['session_id'] ?? null);
        $consent = in_array($data['consent'] ?? null, ['analytics', 'all'], true) ? $data['consent'] : 'essential';
        if ($consent === 'essential') {
            return ['visitor_id' => $visitorUuid, 'session_id' => $sessionUuid, 'next_step' => $this->nextStep($funnel, $step)?->slug, 'tracked' => false];
        }
        $now = now();
        $referrer = $data['referrer'] ?? $request->headers->get('referer');
        $source = $this->source($data['utm_source'] ?? null, $referrer);
        $medium = $data['utm_medium'] ?? ($source === 'direct' ? null : 'referral');
        $campaign = $data['utm_campaign'] ?? null;
        $metadata = is_array($data['metadata'] ?? null) ? $data['metadata'] : [];
        $visitor = FunnelVisitor::query()->firstOrCreate(
            ['workspace_id' => $funnel->workspace_id, 'uuid' => $visitorUuid],
            ['first_seen_at' => $now, 'last_seen_at' => $now, 'first_source' => $source, 'first_medium' => $medium, 'first_campaign' => $campaign, 'first_referrer' => $referrer],
        );
        $visitor->update(['last_seen_at' => $now, 'last_source' => $source, 'last_medium' => $medium, 'last_campaign' => $campaign, 'last_referrer' => $referrer]);
        $agent = BrowserDetector::fromUserAgent((string) $request->userAgent());
        $location = BrowserDetector::locationFromRequest($request, $data);
        $isBot = $this->bots->isLikelyBot($request->userAgent());
        $session = FunnelSession::query()->firstOrCreate(
            ['workspace_id' => $funnel->workspace_id, 'session_uuid' => $sessionUuid],
            ['visitor_id' => $visitor->id, 'funnel_id' => $funnel->id, 'landing_step_id' => $step->id, 'source' => $source, 'medium' => $medium, 'campaign' => $campaign, 'term' => $data['utm_term'] ?? null, 'content' => $data['utm_content'] ?? null, 'landing_page' => $data['url'] ?? null, 'referrer' => $referrer, 'device' => $agent['device'] ?? null, 'browser' => $agent['browser'] ?? null, 'os' => $agent['os'] ?? null, 'country' => $location['country'], 'region' => $location['region'], 'city' => $location['city'], 'is_bot' => $isBot, 'consent' => $consent, 'started_at' => $now, 'last_activity_at' => $now],
        );
        $session->update(['last_activity_at' => $now]);

        $lead = null;
        if (in_array($data['event_type'], ['lead_created', 'form_submission'], true)) {
            $contact = is_array($metadata['contact'] ?? null) ? $metadata['contact'] : $metadata;
            $email = isset($contact['email']) ? Str::lower(trim((string) $contact['email'])) : null;
            $lead = $email ? FunnelLead::query()->where('email', $email)->where('workspace_id', $funnel->workspace_id)->where('funnel_id', $funnel->id)->first() : null;
            $payload = ['workspace_id' => $funnel->workspace_id, 'funnel_id' => $funnel->id, 'funnel_step_id' => $step->id, 'visitor_id' => $visitor->id, 'first_name' => $contact['first_name'] ?? $contact['name'] ?? null, 'last_name' => $contact['last_name'] ?? null, 'email' => $email, 'phone' => $contact['phone'] ?? null, 'company' => $contact['company'] ?? null, 'country' => $contact['country'] ?? $location['country'], 'source' => $source, 'campaign' => $campaign, 'data' => $contact];
            $lead ? $lead->update($payload) : $lead = FunnelLead::query()->create($payload);
        }

        $currency = strtoupper((string) ($metadata['currency'] ?? ''));
        $eventPayload = ['workspace_id' => $funnel->workspace_id, 'funnel_id' => $funnel->id, 'step_id' => $step->id, 'visitor_id' => $visitor->id, 'session_id' => $session->id, 'lead_id' => $lead?->id, 'idempotency_key' => $data['idempotency_key'] ?? null, 'event_type' => $data['event_type'], 'source' => $source, 'medium' => $medium, 'campaign' => $campaign, 'device' => $agent['device'] ?? null, 'browser' => $agent['browser'] ?? null, 'country' => $location['country'], 'revenue' => in_array($data['event_type'], ['purchase', 'conversion'], true) ? (float) ($metadata['amount'] ?? 0) : 0, 'currency' => $currency !== '' ? $currency : null, 'is_bot' => $isBot, 'event_data' => $metadata, 'url' => $data['url'] ?? null, 'referrer' => $referrer, 'occurred_at' => $now];
        $event = ! empty($data['idempotency_key'])
            ? FunnelEvent::query()->firstOrCreate(['workspace_id' => $funnel->workspace_id, 'idempotency_key' => $data['idempotency_key']], $eventPayload)
            : FunnelEvent::query()->create($eventPayload);
        if ($event->wasRecentlyCreated || empty($data['idempotency_key'])) ProcessFunnelEvent::dispatch($event->id);
        if (in_array($data['event_type'], ['conversion', 'purchase', 'booking', 'form_submission', 'lead_created'], true) && ! $session->converted_at) $session->update(['converted_at' => $now]);

        return ['visitor_id' => $visitorUuid, 'session_id' => $sessionUuid, 'next_step' => $this->nextStep($funnel, $step)?->slug, 'tracked' => true];
    }

    public function nextStep(Funnel $funnel, FunnelStep $step): ?FunnelStep
    {
        $connection = $funnel->connections()->where('source_step_id', $step->id)->orderBy('priority')->first();
        return $connection ? $funnel->steps()->find($connection->target_step_id) : null;
    }

    private function uuid(mixed $value): string
    {
        $value = is_string($value) ? $value : '';
        return Str::isUuid($value) ? $value : (string) Str::uuid();
    }

    private function source(mixed $utmSource, mixed $referrer): string
    {
        $utm = Str::lower(trim(is_string($utmSource) ? $utmSource : ''));
        if ($utm !== '') return Str::limit($utm, 120, '');
        $host = is_string($referrer) ? Str::lower((string) parse_url($referrer, PHP_URL_HOST)) : '';
        if ($host === '') return 'direct';
        return match (true) {
            str_contains($host, 'google.') => 'google',
            str_contains($host, 'facebook.') => 'facebook',
            str_contains($host, 'instagram.') => 'instagram',
            str_contains($host, 'linkedin.') => 'linkedin',
            str_contains($host, 'tiktok.') => 'tiktok',
            default => $host,
        };
    }
}
