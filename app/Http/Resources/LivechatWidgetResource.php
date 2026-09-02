<?php

namespace App\Http\Resources;

use App\Models\LivechatWidget;
use App\Services\Livechat\LivechatService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin LivechatWidget */
class LivechatWidgetResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'workspace_id' => $this->workspace_id,
            'site_id' => $this->site_id,
            'public_key' => $this->public_key,
            'enabled' => $this->enabled,
            'ai_enabled' => $this->ai_enabled,
            'mode' => $this->mode,
            'greeting' => $this->greeting,
            'offline_message' => $this->offline_message,
            'primary_color' => $this->primary_color,
            'theme' => $this->theme ?: 'dark',
            'surface_color' => $this->surface_color,
            'text_color' => $this->text_color,
            'bubble_color' => $this->bubble_color,
            'position' => $this->position,
            'launcher_label' => $this->launcher_label,
            'launcher_icon' => $this->launcher_icon ?: 'chat',
            'collect_name' => $this->collect_name,
            'collect_email' => $this->collect_email,
            'collect_phone' => $this->collect_phone,
            'require_contact' => $this->require_contact,
            'settings' => $this->settings ?? [],
            'knowledge_count' => $this->whenCounted('knowledge'),
            'site' => $this->whenLoaded('site', fn () => $this->site ? [
                'id' => $this->site->id,
                'name' => $this->site->name,
                // The widget is written into pages when they are published, so
                // the dashboard needs to know whether there is a published site
                // for switching it on to reach.
                'status' => $this->site->status,
            ] : null),
            // Whether the live pages carry it, as opposed to whether it is
            // switched on here. They are different questions.
            'live_on_site' => app(LivechatService::class)->isLiveOnSite($this->resource),
            'embed_script' => '<script src="'.rtrim((string) config('app.url'), '/').'/api/v1/public/livechat/'.$this->public_key.'/widget.js" async></script>',
            'updated_at' => $this->updated_at,
        ];
    }
}
