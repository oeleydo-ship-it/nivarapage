<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\LivechatConversation */
class LivechatConversationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $includeToken = $this->additional['visitor_token'] ?? null;

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'workspace_id' => $this->workspace_id,
            'site_id' => $this->site_id,
            'widget_id' => $this->widget_id,
            'client_id' => $this->client_id,
            'assigned_user_id' => $this->assigned_user_id,
            'status' => $this->status,
            'handler' => $this->handler,
            'visitor_name' => $this->visitor_name,
            'visitor_email' => $this->visitor_email,
            'visitor_phone' => $this->visitor_phone,
            'page_url' => $this->page_url,
            'ip' => $this->when($request->user() !== null, $this->ip),
            'country' => $this->country,
            'region' => $this->region,
            'city' => $this->city,
            'locale' => $this->locale,
            'timezone' => $this->timezone,
            'browser' => $this->browser,
            'os' => $this->os,
            'device' => $this->device,
            'last_message_at' => $this->last_message_at,
            'agent_last_read_at' => $this->agent_last_read_at,
            'unread_count' => (int) ($this->unread_count ?? 0),
            'agent_typing' => $this->isAgentTyping(),
            'typing_as' => $this->isAgentTyping() ? (string) (($this->meta ?? [])['typing_as'] ?? 'agent') : null,
            'closed_at' => $this->closed_at,
            'created_at' => $this->created_at,
            'visitor_token' => $this->when($includeToken !== null, $includeToken),
            'site' => $this->whenLoaded('site', fn () => $this->site ? [
                'id' => $this->site->id,
                'name' => $this->site->name,
            ] : null),
            'assignee' => $this->whenLoaded('assignee', fn () => $this->assignee ? [
                'id' => $this->assignee->id,
                'name' => $this->assignee->name,
            ] : null),
            'client' => $this->whenLoaded('client', fn () => $this->client ? [
                'id' => $this->client->id,
                'name' => $this->client->name,
                'email' => $this->client->email,
            ] : null),
            'messages' => LivechatMessageResource::collection($this->whenLoaded('messages')),
            'latest_message' => $this->when(
                $this->relationLoaded('messages') && $this->messages->isNotEmpty(),
                fn () => new LivechatMessageResource($this->messages->sortByDesc('id')->first()),
            ),
        ];
    }
}
