<?php

namespace App\Services\Funnels;

use App\Mail\FunnelAutomationMail;
use App\Models\FunnelAutomation;
use App\Models\FunnelAutomationRun;
use App\Models\FunnelEvent;
use App\Models\FunnelLead;
use App\Models\Workspace;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Throwable;

/**
 * Running a funnel's automations.
 *
 * Two things this must never become. It must not be a way to send mail to
 * whoever a tenant likes, so an email only ever goes to the person who
 * triggered it or to somebody already on the workspace. And it must not be a
 * way to reach machines behind our firewall, so a webhook has to be a public
 * https address - a rule pointing at localhost or a private range is refused
 * when it is saved, not when it fires.
 */
class FunnelAutomationService
{
    /** Addresses nobody outside can reach, and so nowhere a tenant may send us. */
    private const BLOCKED_HOSTS = ['localhost', '127.0.0.1', '::1', '0.0.0.0', 'metadata.google.internal'];

    /**
     * The rules an event should set off.
     *
     * A rule with no step matches anywhere in the funnel; one with a step only
     * matches there.
     *
     * @return Collection<int, FunnelAutomation>
     */
    public function matching(FunnelEvent $event): Collection
    {
        return FunnelAutomation::query()
            ->where('funnel_id', $event->funnel_id)
            ->where('status', 'active')
            ->where('trigger_event', $event->event_type)
            ->where(fn ($query) => $query->whereNull('trigger_step_id')->orWhere('trigger_step_id', $event->step_id))
            ->get();
    }

    /**
     * Books a rule to run, now or later.
     *
     * The run row is written here rather than when the work starts, so a
     * delayed automation is visible while it is still waiting, and so the
     * unique key refuses a second booking for the same event - a queue that
     * delivers twice must not send the same person the same email twice.
     */
    public function schedule(FunnelAutomation $automation, FunnelEvent $event): ?FunnelAutomationRun
    {
        $existing = FunnelAutomationRun::query()
            ->where('funnel_automation_id', $automation->id)
            ->where('funnel_event_id', $event->id)
            ->first();

        if ($existing) {
            return null;
        }

        return FunnelAutomationRun::query()->create([
            'workspace_id' => $automation->workspace_id,
            'funnel_automation_id' => $automation->id,
            'funnel_event_id' => $event->id,
            'funnel_lead_id' => $event->lead_id,
            'status' => $automation->delay_minutes > 0 ? 'waiting' : 'pending',
        ]);
    }

    /**
     * Does the thing, and records what happened either way.
     *
     * A rule that was switched off while its delay ran does not fire: the
     * decision that matters is the one in force when it would reach somebody,
     * not the one in force when it was booked.
     */
    public function run(FunnelAutomationRun $run): void
    {
        $automation = $run->automation;

        if (! $automation || $automation->status !== 'active') {
            $run->update(['status' => 'skipped', 'detail' => 'The rule is no longer active.', 'ran_at' => now()]);

            return;
        }

        try {
            $detail = match ($automation->action) {
                'email' => $this->sendEmail($automation, $run),
                'webhook' => $this->callWebhook($automation, $run),
                default => throw new InvalidArgumentException('Unknown action: '.$automation->action),
            };

            $run->update(['status' => 'done', 'detail' => Str::limit($detail, 480, ''), 'ran_at' => now()]);
            $automation->increment('run_count');
            $automation->update(['last_run_at' => now()]);
        } catch (Throwable $e) {
            // Kept rather than thrown away: a rule that quietly failed is worse
            // than one that visibly did.
            $run->update(['status' => 'failed', 'detail' => Str::limit($e->getMessage(), 480, ''), 'ran_at' => now()]);
        }
    }

    /**
     * Checks a webhook address before it is ever stored.
     *
     * @throws InvalidArgumentException when the address is not somewhere we may send
     */
    public function assertWebhookUrl(string $url): void
    {
        $parts = parse_url($url);
        $scheme = strtolower($parts['scheme'] ?? '');
        $host = strtolower($parts['host'] ?? '');

        if ($scheme !== 'https') {
            throw new InvalidArgumentException('A webhook address has to be https.');
        }
        if ($host === '' || in_array($host, self::BLOCKED_HOSTS, true)) {
            throw new InvalidArgumentException('That address is not reachable from outside.');
        }

        // Both the literal address and whatever the name resolves to, so a
        // hostname pointed at a private range is refused as well.
        foreach (array_unique([$host, ...$this->resolve($host)]) as $candidate) {
            if (filter_var($candidate, FILTER_VALIDATE_IP) && ! filter_var(
                $candidate,
                FILTER_VALIDATE_IP,
                FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE,
            )) {
                throw new InvalidArgumentException('That address is inside a private network.');
            }
        }
    }

    /**
     * Checks who an email may be sent to.
     *
     * "lead" means the person who set the rule off. Anything else has to be
     * somebody already on the workspace, so this can never be used to mail
     * strangers.
     *
     * @throws InvalidArgumentException
     */
    public function assertRecipient(Workspace $workspace, string $to): void
    {
        if ($to === 'lead') {
            return;
        }

        $known = $workspace->members()->where('email', $to)->exists();
        if (! $known) {
            throw new InvalidArgumentException('Send to the lead, or to somebody on this workspace.');
        }
    }

    private function sendEmail(FunnelAutomation $automation, FunnelAutomationRun $run): string
    {
        $config = $automation->config ?? [];
        $lead = $run->funnel_lead_id ? FunnelLead::query()->find($run->funnel_lead_id) : null;

        $to = ($config['to'] ?? 'lead') === 'lead' ? $lead?->email : $config['to'];
        if (! $to) {
            // Nothing went wrong; there was simply nobody to write to.
            return 'No recipient: the event carried no email address.';
        }

        $body = $this->fill((string) ($config['body'] ?? ''), $lead, $automation);
        $subject = $this->fill((string) ($config['subject'] ?? $automation->name), $lead, $automation);

        Mail::to($to)->send(new FunnelAutomationMail($subject, $body));

        return 'Emailed '.$to;
    }

    private function callWebhook(FunnelAutomation $automation, FunnelAutomationRun $run): string
    {
        $config = $automation->config ?? [];
        $url = (string) ($config['url'] ?? '');
        // Checked again here, not only when it was saved: DNS can be repointed
        // at a private address after the fact.
        $this->assertWebhookUrl($url);

        $lead = $run->funnel_lead_id ? FunnelLead::query()->find($run->funnel_lead_id) : null;
        $payload = [
            'automation' => ['id' => $automation->id, 'name' => $automation->name],
            'funnel_id' => $automation->funnel_id,
            'event' => $automation->trigger_event,
            'lead' => $lead ? [
                'id' => $lead->id,
                'email' => $lead->email,
                'first_name' => $lead->first_name,
                'phone' => $lead->phone,
            ] : null,
            'sent_at' => now()->toIso8601String(),
        ];

        $body = (string) json_encode($payload);
        $headers = ['Content-Type' => 'application/json'];

        // Signed the way Stripe signs its own, so the receiver can tell the
        // call came from us and not from somebody who guessed the URL.
        if (! empty($config['secret'])) {
            $headers['X-Uidesired-Signature'] = hash_hmac('sha256', $body, (string) $config['secret']);
        }

        $response = Http::withHeaders($headers)->timeout(15)->withBody($body, 'application/json')->post($url);

        if ($response->failed()) {
            throw new \RuntimeException('The webhook answered '.$response->status().'.');
        }

        return 'Called '.parse_url($url, PHP_URL_HOST).' and got '.$response->status();
    }

    /** Replaces the handful of placeholders a message may use. */
    private function fill(string $text, ?FunnelLead $lead, FunnelAutomation $automation): string
    {
        return strtr($text, [
            '{{first_name}}' => $lead?->first_name ?? 'there',
            '{{email}}' => $lead?->email ?? '',
            '{{funnel}}' => $automation->funnel?->name ?? '',
        ]);
    }

    /**
     * @return list<string>
     */
    private function resolve(string $host): array
    {
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return [];
        }

        $records = @dns_get_record($host, DNS_A | DNS_AAAA) ?: [];

        return array_values(array_filter(array_map(
            fn (array $record) => $record['ip'] ?? $record['ipv6'] ?? null,
            $records,
        )));
    }
}
