<?php

namespace App\Services\Livechat;

use App\Events\LivechatConversationUpdated;
use App\Events\LivechatMessageCreated;
use App\Jobs\GenerateLivechatAiReply;
use App\Jobs\NotifyLivechatAgents;
use App\Jobs\SyncLivechatLeadToClient;
use App\Models\LivechatConversation;
use App\Models\LivechatKnowledge;
use App\Models\LivechatMessage;
use App\Models\LivechatWidget;
use App\Models\Site;
use App\Models\User;
use App\Support\BrowserDetector;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class LivechatService
{
    public function widgetForSite(Site $site): LivechatWidget
    {
        return LivechatWidget::query()->firstOrCreate(
            ['site_id' => $site->id],
            [
                'workspace_id' => $site->workspace_id,
                'enabled' => false,
                'ai_enabled' => true,
                'mode' => 'ai_first',
                'greeting' => 'Hi — how can we help?',
                'primary_color' => '#2563eb',
                'position' => 'right',
                'launcher_label' => 'Chat',
                'collect_name' => true,
                'collect_email' => true,
                'collect_phone' => true,
                'require_contact' => true,
            ],
        );
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateWidget(LivechatWidget $widget, array $data): LivechatWidget
    {
        $widget->fill($data);
        $widget->save();

        return $widget->fresh();
    }

    /**
     * @return array<string, mixed>
     */
    public function publicConfig(LivechatWidget $widget): array
    {
        $widget->loadMissing('site');
        $reverbKey = config('broadcasting.connections.reverb.key');
        $reverb = [
            'enabled' => config('broadcasting.default') === 'reverb' && filled($reverbKey),
            'key' => $reverbKey,
            'host' => config('broadcasting.connections.reverb.options.host') ?: config('reverb.servers.reverb.hostname'),
            'port' => (int) (config('broadcasting.connections.reverb.options.port') ?: 8090),
            'scheme' => config('broadcasting.connections.reverb.options.scheme') ?: 'http',
        ];

        return [
            'public_key' => $widget->public_key,
            'enabled' => (bool) $widget->enabled,
            'greeting' => $widget->greeting,
            'offline_message' => $widget->offline_message,
            'primary_color' => $widget->primary_color,
            'theme' => in_array($widget->theme, LivechatWidget::THEMES, true) ? $widget->theme : 'dark',
            'surface_color' => $widget->surface_color,
            'text_color' => $widget->text_color,
            'bubble_color' => $widget->bubble_color,
            'launcher_icon' => $widget->launcher_icon ?: 'chat',
            'position' => $widget->position === 'left' ? 'left' : 'right',
            'launcher_label' => $widget->launcher_label,
            'collect_name' => (bool) $widget->collect_name,
            'collect_email' => (bool) $widget->collect_email,
            'collect_phone' => (bool) $widget->collect_phone,
            'require_contact' => (bool) $widget->require_contact,
            'ai_enabled' => (bool) $widget->ai_enabled,
            'site_name' => $widget->site?->business_name ?: $widget->site?->name,
            'reverb' => $reverb,
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array{conversation: LivechatConversation, visitor_token: string}
     */
    public function startConversation(LivechatWidget $widget, Request $request, array $input): array
    {
        abort_unless($widget->enabled, 403, 'Live chat is not enabled on this site.');

        $name = trim((string) ($input['name'] ?? ''));
        $email = strtolower(trim((string) ($input['email'] ?? '')));
        $phone = trim((string) ($input['phone'] ?? ''));

        if ($widget->require_contact) {
            abort_if($widget->collect_name && $name === '', 422, 'Name is required.');
            abort_if($widget->collect_email && ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)), 422, 'A valid email is required.');
            abort_if($widget->collect_phone && $phone === '', 422, 'Phone number is required.');
        }

        $token = Str::random(48);
        $ua = (string) $request->userAgent();
        $agent = BrowserDetector::fromUserAgent($ua);
        $geo = BrowserDetector::locationFromRequest($request, $input);
        $handler = $widget->ai_enabled && $widget->mode !== 'human_first' ? 'ai' : 'human';

        $conversation = LivechatConversation::query()->create([
            'workspace_id' => $widget->workspace_id,
            'site_id' => $widget->site_id,
            'widget_id' => $widget->id,
            'visitor_token_hash' => hash('sha256', $token),
            'status' => $handler === 'human' ? 'waiting' : 'open',
            'handler' => $handler,
            'visitor_name' => $name !== '' ? $name : null,
            'visitor_email' => $email !== '' ? $email : null,
            'visitor_phone' => $phone !== '' ? $phone : null,
            'page_url' => isset($input['page_url']) ? mb_substr((string) $input['page_url'], 0, 500) : $request->headers->get('Referer'),
            'ip' => $request->ip(),
            'country' => $geo['country'],
            'region' => $geo['region'],
            'city' => $geo['city'],
            'locale' => mb_substr((string) ($input['locale'] ?? $request->getPreferredLanguage() ?: ''), 0, 32) ?: null,
            'timezone' => mb_substr((string) ($input['timezone'] ?? ''), 0, 64) ?: null,
            'browser' => $agent['browser'],
            'os' => $agent['os'],
            'device' => $agent['device'],
            'user_agent' => mb_substr($ua, 0, 500),
            'last_message_at' => now(),
            'meta' => [
                'screen' => $input['screen'] ?? null,
            ],
        ]);

        $greeting = trim((string) $widget->greeting) ?: 'Hi — how can we help?';
        $this->addMessage($conversation, 'system', $greeting, ['kind' => 'greeting']);

        SyncLivechatLeadToClient::dispatch($conversation->id);
        NotifyLivechatAgents::dispatch($conversation->id);
        LivechatConversationUpdated::dispatch($conversation);

        return ['conversation' => $conversation->fresh('messages'), 'visitor_token' => $token];
    }

    public function addVisitorMessage(LivechatConversation $conversation, string $body): LivechatMessage
    {
        abort_if($conversation->status === 'closed', 422, 'This conversation is closed.');

        $message = $this->addMessage($conversation, 'visitor', $body);
        $waitingOnAi = $conversation->handler === 'ai' && $conversation->widget?->ai_enabled;
        $conversation->update([
            'status' => $conversation->handler === 'human' ? 'waiting' : 'open',
            'last_message_at' => now(),
        ]);

        if ($waitingOnAi) {
            $this->markTyping($conversation, 90, 'ai');
            GenerateLivechatAiReply::dispatch($conversation->id, $message->id);
        }

        return $message;
    }

    public function addAgentMessage(LivechatConversation $conversation, User $user, string $body): LivechatMessage
    {
        abort_if($conversation->status === 'closed', 422, 'This conversation is closed.');

        $conversation->update([
            'handler' => 'human',
            'assigned_user_id' => $conversation->assigned_user_id ?: $user->id,
            'status' => 'assigned',
            'last_message_at' => now(),
            'agent_typing_until' => null,
        ]);

        return $this->addMessage($conversation, 'agent', $body, ['agent_name' => $user->name], $user->id);
    }

    public function requestHumanHandoff(LivechatConversation $conversation, string $reason = 'Visitor requested a human agent.'): LivechatConversation
    {
        abort_if($conversation->status === 'closed', 422, 'This conversation is closed.');

        $alreadyWaiting = $conversation->handler === 'human' && in_array($conversation->status, ['waiting', 'assigned'], true);
        $conversation->update([
            'handler' => 'human',
            'status' => $conversation->assigned_user_id ? 'assigned' : 'waiting',
            'agent_typing_until' => null,
        ]);

        if (! $alreadyWaiting) {
            $this->addMessage($conversation, 'system', 'A teammate has been asked to join the conversation.', [
                'kind' => 'handoff',
                'reason' => mb_substr(trim($reason), 0, 240),
            ]);
            NotifyLivechatAgents::dispatch($conversation->id);
        }
        LivechatConversationUpdated::dispatch($conversation->fresh(['site', 'assignee', 'client']));

        return $conversation->fresh(['site', 'assignee', 'client', 'messages']);
    }

    public function takeOver(LivechatConversation $conversation, User $user): LivechatConversation
    {
        abort_if($conversation->status === 'closed', 422, 'This conversation is closed.');

        $alreadyAssigned = $conversation->handler === 'human'
            && (int) $conversation->assigned_user_id === (int) $user->id;
        $conversation->update([
            'handler' => 'human',
            'assigned_user_id' => $user->id,
            'status' => 'assigned',
            'agent_typing_until' => null,
        ]);

        if (! $alreadyAssigned) {
            $this->addMessage($conversation, 'system', $user->name.' from the support team joined the conversation.', [
                'kind' => 'takeover',
                'agent_name' => $user->name,
            ]);
        }
        LivechatConversationUpdated::dispatch($conversation->fresh(['site', 'assignee', 'client']));

        return $conversation->fresh(['site', 'assignee', 'client', 'messages']);
    }

    public function markTyping(LivechatConversation $conversation, int $seconds = 12, string $who = 'agent'): LivechatConversation
    {
        abort_if($conversation->status === 'closed', 422, 'This conversation is closed.');
        $conversation->unsetRelation('messages');
        if (! $conversation->awaitingAgentReply()) {
            $conversation->update(['agent_typing_until' => null]);

            return $conversation->fresh() ?? $conversation;
        }
        $meta = $conversation->meta ?? [];
        $meta['typing_as'] = $who;
        $conversation->update([
            'agent_typing_until' => now()->addSeconds(max(3, min($seconds, 120))),
            'meta' => $meta,
        ]);
        LivechatConversationUpdated::dispatch($conversation->fresh(['site', 'assignee', 'client']));

        return $conversation->fresh();
    }

    public function clearTyping(LivechatConversation $conversation): void
    {
        if ($conversation->agent_typing_until === null) {
            return;
        }
        $conversation->update(['agent_typing_until' => null]);
        LivechatConversationUpdated::dispatch($conversation->fresh(['site', 'assignee', 'client']));
    }

    public function assign(LivechatConversation $conversation, ?User $user): LivechatConversation
    {
        $conversation->update([
            'assigned_user_id' => $user?->id,
            'handler' => 'human',
            'status' => $user ? 'assigned' : 'waiting',
        ]);
        LivechatConversationUpdated::dispatch($conversation->fresh(['site', 'assignee', 'client']));

        return $conversation->fresh(['site', 'assignee', 'client', 'messages']);
    }

    /**
     * Marks the thread as read by an agent. Drives the unread badges in the
     * inbox, so it is called whenever a conversation is opened.
     */
    public function markRead(LivechatConversation $conversation): LivechatConversation
    {
        $conversation->forceFill(['agent_last_read_at' => now()])->save();

        return $conversation;
    }

    /**
     * Puts a closed conversation back into the queue. Without this a thread
     * closed by mistake — or one a visitor returns to — is a dead end.
     */
    public function reopen(LivechatConversation $conversation, ?User $user = null): LivechatConversation
    {
        if ($conversation->status !== 'closed') {
            return $conversation;
        }

        $conversation->update([
            'status' => $conversation->assigned_user_id ? 'assigned' : 'waiting',
            'closed_at' => null,
        ]);

        $this->addMessage(
            $conversation,
            'system',
            $user ? $user->name.' reopened this conversation.' : 'This conversation was reopened.',
            ['kind' => 'reopened'],
        );

        LivechatConversationUpdated::dispatch($conversation->fresh(['site', 'assignee', 'client']));

        return $conversation->fresh(['site', 'assignee', 'client', 'messages']);
    }

    public function close(LivechatConversation $conversation): LivechatConversation
    {
        $conversation->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);
        $this->addMessage($conversation, 'system', 'This conversation was closed.', ['kind' => 'closed']);
        LivechatConversationUpdated::dispatch($conversation->fresh(['site', 'assignee', 'client']));

        return $conversation->fresh(['site', 'assignee', 'client', 'messages']);
    }

    /**
     * @return array{title:string,content:string,filename:?string,mime:?string,bytes:int}
     */
    public function extractKnowledge(?string $title, ?string $body, ?UploadedFile $file): array
    {
        $filename = $file?->getClientOriginalName();
        $mime = $file?->getMimeType();
        $content = trim((string) $body);
        if ($file) {
            $raw = (string) file_get_contents($file->getRealPath());
            $ext = strtolower($file->getClientOriginalExtension());
            if (in_array($ext, ['html', 'htm'], true) || str_contains((string) $mime, 'html')) {
                $raw = html_entity_decode(strip_tags($raw));
            }
            $content = trim($content === '' ? $raw : $content."\n\n".$raw);
        }
        $content = Str::limit(preg_replace('/\s+/', ' ', $content) ?? $content, 20000, '…');
        abort_if($content === '', 422, 'Knowledge content is empty.');

        return [
            'title' => $title ?: ($filename ? pathinfo($filename, PATHINFO_FILENAME) : 'Untitled'),
            'content' => $content,
            'filename' => $filename,
            'mime' => $mime,
            'bytes' => $file?->getSize() ?: strlen($content),
        ];
    }

    public function addKnowledge(LivechatWidget $widget, array $payload): LivechatKnowledge
    {
        return $widget->knowledge()->create([
            'workspace_id' => $widget->workspace_id,
            'site_id' => $widget->site_id,
            'source' => $payload['source'] ?? 'upload',
            'title' => $payload['title'],
            'content' => $payload['content'],
            'filename' => $payload['filename'] ?? null,
            'mime' => $payload['mime'] ?? null,
            'bytes' => $payload['bytes'] ?? 0,
        ]);
    }

    public function syncKnowledgeFromSite(LivechatWidget $widget): LivechatKnowledge
    {
        $widget->loadMissing('site.pages.publishedRevision');
        $chunks = [];
        foreach ($widget->site?->pages ?? [] as $page) {
            $revision = $page->publishedRevision;
            if (! $revision) {
                continue;
            }
            $text = $this->textFromContent($revision->content_json ?? []);
            if ($text === '') {
                continue;
            }
            $chunks[] = '# '.($page->name ?: $page->slug)."\n".$text;
        }
        abort_if($chunks === [], 422, 'Publish at least one page before syncing knowledge.');

        return $this->addKnowledge($widget, [
            'source' => 'site',
            'title' => 'Published pages — '.$widget->site?->name,
            'content' => Str::limit(implode("\n\n", $chunks), 20000, '…'),
            'filename' => null,
            'mime' => 'text/plain',
            'bytes' => 0,
        ]);
    }

    /**
     * @param  array<string, mixed>  $meta
     */
    public function addMessage(LivechatConversation $conversation, string $role, string $body, array $meta = [], ?int $userId = null): LivechatMessage
    {
        $body = trim(strip_tags($body));
        abort_if($body === '', 422, 'Message cannot be empty.');
        abort_if(mb_strlen($body) > 4000, 422, 'Message is too long.');

        $message = $conversation->messages()->create([
            'role' => $role,
            'body' => $body,
            'user_id' => $userId,
            'meta' => $meta ?: null,
        ]);
        $conversation->forceFill(['last_message_at' => now()])->save();
        if (in_array($role, ['ai', 'agent'], true)) {
            $this->clearTyping($conversation->fresh() ?? $conversation);
        }
        LivechatMessageCreated::dispatch($message);

        return $message;
    }

    /**
     * @param  array<string, mixed>  $content
     */
    private function textFromContent(array $content): string
    {
        $parts = [];
        foreach ($content['sections'] ?? [] as $section) {
            if (! is_array($section)) {
                continue;
            }
            $this->collectStrings($section['props'] ?? [], $parts);
        }

        return trim(implode(' ', array_unique($parts)));
    }

    /**
     * @param  array<string, mixed>  $node
     * @param  list<string>  $parts
     */
    private function collectStrings(mixed $node, array &$parts): void
    {
        if (is_string($node)) {
            $text = trim(strip_tags($node));
            if (mb_strlen($text) > 2) {
                $parts[] = $text;
            }

            return;
        }
        if (! is_array($node)) {
            return;
        }
        foreach ($node as $value) {
            $this->collectStrings($value, $parts);
        }
    }
}
