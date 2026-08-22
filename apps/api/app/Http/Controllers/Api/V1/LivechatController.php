<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\LivechatConversationResource;
use App\Http\Resources\LivechatKnowledgeResource;
use App\Http\Resources\LivechatMessageResource;
use App\Http\Resources\LivechatWidgetResource;
use App\Models\LivechatConversation;
use App\Models\LivechatKnowledge;
use App\Models\LivechatWidget;
use App\Models\Site;
use App\Models\User;
use App\Rules\HexColor;
use App\Services\Livechat\LivechatService;
use App\Services\TenantCacheService;
use App\Support\CurrentWorkspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LivechatController extends Controller
{
    public function inbox(Request $request, CurrentWorkspace $current)
    {
        $this->authorize('viewAny', LivechatWidget::class);

        $items = LivechatConversation::query()
            ->where('workspace_id', $current->id())
            ->with(['site', 'assignee', 'client', 'messages' => fn ($q) => $q->orderByDesc('id')->limit(1)])
            ->withCount(['messages as unread_count' => fn ($q) => $q->where('role', 'visitor')->whereRaw(
                '(livechat_conversations.agent_last_read_at is null or livechat_messages.created_at > livechat_conversations.agent_last_read_at)'
            )])
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->when($request->query('site_id'), fn ($q, $siteId) => $q->where('site_id', $siteId))
            ->when($request->filled('q'), function ($q) use ($request) {
                $term = '%'.trim((string) $request->query('q')).'%';
                $q->where(function ($inner) use ($term) {
                    $inner->where('visitor_name', 'like', $term)
                        ->orWhere('visitor_email', 'like', $term)
                        ->orWhere('visitor_phone', 'like', $term);
                });
            })
            ->orderByDesc('last_message_at')
            ->paginate(40);

        return LivechatConversationResource::collection($items);
    }

    public function widgets(CurrentWorkspace $current, LivechatService $livechat)
    {
        $this->authorize('viewAny', LivechatWidget::class);

        $sites = Site::query()
            ->where('workspace_id', $current->id())
            ->with('livechatWidget')
            ->orderBy('name')
            ->get();

        $widgets = $sites->map(fn (Site $site) => $livechat->widgetForSite($site)->load('site')->loadCount('knowledge'));

        return LivechatWidgetResource::collection($widgets);
    }

    public function conversation(LivechatConversation $livechatConversation, LivechatService $livechat)
    {
        $this->authorize('view', $livechatConversation);
        $livechat->markRead($livechatConversation);

        return new LivechatConversationResource(
            $livechatConversation->load(['site', 'assignee', 'client', 'messages' => fn ($q) => $q->orderBy('id')->with('user')])
        );
    }

    public function reply(Request $request, LivechatConversation $livechatConversation, LivechatService $livechat)
    {
        $this->authorize('update', $livechatConversation);
        $data = $request->validate(['body' => ['required', 'string', 'max:4000']]);
        $message = $livechat->addAgentMessage($livechatConversation, $request->user(), $data['body']);

        return (new LivechatMessageResource($message->load('user')))->response()->setStatusCode(201);
    }

    public function typing(LivechatConversation $livechatConversation, LivechatService $livechat)
    {
        $this->authorize('update', $livechatConversation);

        return new LivechatConversationResource(
            $livechat->markTyping($livechatConversation, 8, 'agent')->load(['site', 'assignee', 'client'])
        );
    }

    public function assign(Request $request, LivechatConversation $livechatConversation, LivechatService $livechat)
    {
        $this->authorize('update', $livechatConversation);
        $data = $request->validate(['user_id' => ['nullable', 'integer']]);
        $user = null;
        if (! empty($data['user_id'])) {
            $user = User::query()->findOrFail($data['user_id']);
            abort_unless($user->membershipFor($livechatConversation->workspace_id), 422, 'User is not in this workspace.');
        }

        return new LivechatConversationResource($livechat->assign($livechatConversation, $user));
    }

    public function takeover(Request $request, LivechatConversation $livechatConversation, LivechatService $livechat)
    {
        $this->authorize('update', $livechatConversation);

        return new LivechatConversationResource(
            $livechat->takeOver($livechatConversation, $request->user()),
        );
    }

    public function reopen(Request $request, LivechatConversation $livechatConversation, LivechatService $livechat)
    {
        $this->authorize('update', $livechatConversation);

        return new LivechatConversationResource(
            $livechat->reopen($livechatConversation, $request->user())->load(['site', 'assignee', 'client'])
        );
    }

    public function close(LivechatConversation $livechatConversation, LivechatService $livechat)
    {
        $this->authorize('update', $livechatConversation);

        return new LivechatConversationResource($livechat->close($livechatConversation));
    }

    public function widget(Site $site, LivechatService $livechat)
    {
        $this->authorize('view', $site);
        $widget = $livechat->widgetForSite($site);

        return new LivechatWidgetResource($widget->load('site')->loadCount('knowledge'));
    }

    public function updateWidget(Request $request, Site $site, LivechatService $livechat, TenantCacheService $cache)
    {
        $this->authorize('update', $site);
        $widget = $livechat->widgetForSite($site);
        $data = $request->validate([
            'enabled' => ['sometimes', 'boolean'],
            'ai_enabled' => ['sometimes', 'boolean'],
            'mode' => ['sometimes', 'in:ai_first,human_first,hybrid'],
            'greeting' => ['sometimes', 'string', 'max:240'],
            'offline_message' => ['nullable', 'string', 'max:240'],
            'primary_color' => ['sometimes', 'string', new HexColor],
            'theme' => ['sometimes', 'in:dark,light,auto'],
            'surface_color' => ['sometimes', 'nullable', 'string', new HexColor],
            'text_color' => ['sometimes', 'nullable', 'string', new HexColor],
            'bubble_color' => ['sometimes', 'nullable', 'string', new HexColor],
            'position' => ['sometimes', 'in:left,right'],
            'launcher_label' => ['sometimes', 'string', 'max:32'],
            'launcher_icon' => ['sometimes', 'in:chat,bubble,headset,sparkle'],
            'collect_name' => ['sometimes', 'boolean'],
            'collect_email' => ['sometimes', 'boolean'],
            'collect_phone' => ['sometimes', 'boolean'],
            'require_contact' => ['sometimes', 'boolean'],
        ]);
        $updated = $livechat->updateWidget($widget, $data);
        $cache->invalidateSite($site);

        return new LivechatWidgetResource($updated->load('site')->loadCount('knowledge'));
    }

    public function knowledge(Site $site)
    {
        $this->authorize('view', $site);

        $rows = LivechatKnowledge::query()->where('site_id', $site->id)->latest()->get();

        return LivechatKnowledgeResource::collection($rows);
    }

    public function storeKnowledge(Request $request, Site $site, LivechatService $livechat)
    {
        $this->authorize('update', $site);
        $widget = $livechat->widgetForSite($site);
        $request->validate([
            'title' => ['nullable', 'string', 'max:160'],
            'content' => ['nullable', 'string', 'max:20000'],
            'file' => ['nullable', 'file', 'max:2048', 'mimes:txt,md,csv,json,html,htm'],
        ]);
        $payload = $livechat->extractKnowledge(
            $request->input('title'),
            $request->input('content'),
            $request->file('file'),
        );
        $payload['source'] = $request->file('file') ? 'upload' : 'note';

        return (new LivechatKnowledgeResource($livechat->addKnowledge($widget, $payload)))->response()->setStatusCode(201);
    }

    public function syncKnowledge(Site $site, LivechatService $livechat)
    {
        $this->authorize('update', $site);

        return (new LivechatKnowledgeResource($livechat->syncKnowledgeFromSite($livechat->widgetForSite($site))))
            ->response()
            ->setStatusCode(201);
    }

    public function destroyKnowledge(LivechatKnowledge $livechatKnowledge): JsonResponse
    {
        $site = $livechatKnowledge->site;
        abort_unless($site, 404);
        $this->authorize('update', $site);
        $livechatKnowledge->delete();

        return response()->json(['data' => ['ok' => true]]);
    }
}
