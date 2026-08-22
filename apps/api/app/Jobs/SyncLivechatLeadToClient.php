<?php

namespace App\Jobs;

use App\Models\Client;
use App\Models\LivechatConversation;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class SyncLivechatLeadToClient implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $conversationId)
    {
        $this->onQueue('notifications');
    }

    public function handle(): void
    {
        $conversation = LivechatConversation::query()->find($this->conversationId);
        if (! $conversation) {
            return;
        }

        $email = strtolower(trim((string) $conversation->visitor_email));
        $name = trim((string) $conversation->visitor_name);
        $phone = trim((string) $conversation->visitor_phone);
        if ($email === '' && $name === '' && $phone === '') {
            return;
        }

        DB::transaction(function () use ($conversation, $email, $name, $phone): void {
            $client = null;
            if ($email !== '') {
                $client = Client::query()
                    ->where('workspace_id', $conversation->workspace_id)
                    ->whereRaw('lower(email) = ?', [$email])
                    ->first();
            }
            if (! $client && $phone !== '') {
                $client = Client::query()
                    ->where('workspace_id', $conversation->workspace_id)
                    ->where('phone', $phone)
                    ->first();
            }

            $payload = [
                'name' => $name !== '' ? $name : ($email !== '' ? $email : 'Livechat visitor'),
                'email' => $email !== '' ? $email : ($client?->email),
                'phone' => $phone !== '' ? $phone : ($client?->phone),
                'source' => 'livechat',
                'status' => $client?->status ?: 'lead',
                'city' => $conversation->city ?: $client?->city,
                'region' => $conversation->region ?: $client?->region,
                'country' => $conversation->country ?: $client?->country,
            ];

            if ($client) {
                $client->fill(array_filter($payload, fn ($value) => $value !== null && $value !== ''));
                $extras = $client->extras ?? [];
                $extras['livechat'] = array_filter([
                    'last_conversation_id' => $conversation->id,
                    'browser' => $conversation->browser,
                    'os' => $conversation->os,
                    'site_id' => $conversation->site_id,
                ]);
                $client->extras = $extras;
                $client->save();
            } else {
                $client = Client::query()->create([
                    ...$payload,
                    'workspace_id' => $conversation->workspace_id,
                    'tags' => ['livechat'],
                    'extras' => [
                        'livechat' => [
                            'first_conversation_id' => $conversation->id,
                            'browser' => $conversation->browser,
                            'os' => $conversation->os,
                            'site_id' => $conversation->site_id,
                        ],
                    ],
                    'notes' => 'Captured from live chat on site #'.$conversation->site_id,
                ]);
            }

            $hasContact = $client->contacts()
                ->where(function ($query) use ($email, $phone) {
                    if ($email !== '') {
                        $query->orWhereRaw('lower(email) = ?', [$email]);
                    }
                    if ($phone !== '') {
                        $query->orWhere('phone', $phone);
                    }
                })
                ->exists();

            if (! $hasContact && ($name !== '' || $email !== '')) {
                $client->contacts()->create([
                    'workspace_id' => $client->workspace_id,
                    'name' => $payload['name'],
                    'email' => $email !== '' ? $email : null,
                    'phone' => $phone !== '' ? $phone : null,
                    'title' => 'Livechat visitor',
                    'is_primary' => $client->contacts()->count() === 0,
                    'extras' => ['source' => 'livechat'],
                ]);
            }

            $conversation->update(['client_id' => $client->id]);
        });
    }
}
