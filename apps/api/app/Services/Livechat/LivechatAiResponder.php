<?php

namespace App\Services\Livechat;

use App\Models\LivechatConversation;
use App\Models\LivechatKnowledge;
use App\Services\Ai\AiJson;
use App\Services\Ai\AiProviderFactory;
use App\Services\Ai\AiSettingsService;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class LivechatAiResponder
{
    public function __construct(
        private readonly AiSettingsService $settings,
        private readonly AiProviderFactory $factory,
    ) {}

    /**
     * @return array{reply:string,confidence:string,handoff:bool,handoff_reason:?string,suggested_replies:list<string>,sources:list<string>}
     */
    public function respond(LivechatConversation $conversation): array
    {
        $config = $this->settings->config();
        if (! $config->enabled || ! $config->configured()) {
            return $this->emptyResponse();
        }

        $latestVisitor = (string) ($conversation->messages
            ->where('role', 'visitor')
            ->sortByDesc('id')
            ->first()?->body ?? '');

        if ($this->requestsHuman($latestVisitor)) {
            return [
                'reply' => 'Of course — I’ll ask a teammate to join this conversation.',
                'confidence' => 'high',
                'handoff' => true,
                'handoff_reason' => 'Visitor requested a human agent.',
                'suggested_replies' => [],
                'sources' => [],
            ];
        }

        $knowledgeRows = LivechatKnowledge::query()
            ->where('site_id', $conversation->site_id)
            ->orderByDesc('id')
            ->limit(40)
            ->get();
        $selected = $this->relevantKnowledge($knowledgeRows, $latestVisitor);
        $knowledge = $selected
            ->map(fn (LivechatKnowledge $row) => '# '.$row->title."\n".$row->content)
            ->implode("\n\n");
        $sourceTitles = $selected->pluck('title')
            ->map(fn ($title) => trim((string) $title))
            ->filter()
            ->values()
            ->all();

        $history = $conversation->messages
            ->filter(fn ($message) => in_array($message->role, ['visitor', 'ai', 'agent'], true))
            ->take(-16)
            ->map(fn ($message) => strtoupper($message->role).': '.$message->body)
            ->implode("\n");

        $site = $conversation->site?->business_name ?: $conversation->site?->name ?: 'this website';
        $system = <<<TXT
You are the AI support assistant for {$site}. Ground factual answers only in the supplied knowledge and conversation.
Return ONLY JSON with this shape:
{"reply":"helpful answer","confidence":"high|medium|low","handoff":false,"handoff_reason":null,"suggested_replies":["short visitor reply"],"sources":["exact knowledge title"]}
Keep reply concise, warm, and direct. Ask at most one necessary follow-up question.
Use 0–3 short suggested replies that a visitor could tap next. Cite only exact supplied knowledge titles.
Set confidence high only when the knowledge directly answers the question. Use medium for a reasonable partial answer.
Set handoff true when confidence is low, the visitor asks for a person, the request needs account access, or the issue is sensitive, urgent, legal, medical, payment-related, or complaint-related.
Never invent prices, availability, policies, guarantees, legal claims, people, or account data. Do not output HTML or scripts.
TXT;
        if (trim($knowledge) !== '') {
            $system .= "\n\nKnowledge base:\n".Str::limit($knowledge, 10000, '…');
        } else {
            $system .= "\n\nNo knowledge matched this request. Do not guess; offer a human handoff.";
        }

        $prompt = "Visitor: {$conversation->visitor_name} <{$conversation->visitor_email}>\nCurrent page: {$conversation->page_url}\nConversation:\n{$history}\n\nWrite the next grounded assistant response.";

        $text = trim($this->factory->make($config)->complete($system, $prompt, [
            'max_tokens' => 900,
            'temperature' => 0.25,
            'json' => true,
        ]));

        $decoded = AiJson::object($text);
        if ($decoded === null) {
            $reply = $this->cleanText($text, 4000);

            return [
                'reply' => $reply,
                'confidence' => $knowledge !== '' ? 'medium' : 'low',
                'handoff' => $reply === '' || $knowledge === '',
                'handoff_reason' => $knowledge === '' ? 'No relevant knowledge was available.' : null,
                'suggested_replies' => [],
                'sources' => [],
            ];
        }

        $reply = $this->cleanText((string) ($decoded['reply'] ?? $decoded['message'] ?? ''), 4000);
        $confidence = strtolower((string) ($decoded['confidence'] ?? 'low'));
        if (! in_array($confidence, ['high', 'medium', 'low'], true)) {
            $confidence = 'low';
        }

        $suggestions = collect(is_array($decoded['suggested_replies'] ?? null) ? $decoded['suggested_replies'] : [])
            ->filter(fn ($value) => is_scalar($value))
            ->map(fn ($value) => $this->cleanText((string) $value, 90))
            ->filter()
            ->unique()
            ->take(3)
            ->values()
            ->all();
        $sources = collect(is_array($decoded['sources'] ?? null) ? $decoded['sources'] : [])
            ->filter(fn ($value) => is_scalar($value))
            ->map(fn ($value) => trim((string) $value))
            ->filter(fn ($value) => in_array($value, $sourceTitles, true))
            ->unique()
            ->values()
            ->all();
        $handoff = filter_var($decoded['handoff'] ?? false, FILTER_VALIDATE_BOOLEAN) || $confidence === 'low';

        return [
            'reply' => $reply,
            'confidence' => $confidence,
            'handoff' => $handoff,
            'handoff_reason' => $handoff
                ? $this->cleanText((string) ($decoded['handoff_reason'] ?? 'The AI could not answer confidently.'), 240)
                : null,
            'suggested_replies' => $suggestions,
            'sources' => $sources,
        ];
    }

    public function reply(LivechatConversation $conversation): string
    {
        return $this->respond($conversation)['reply'];
    }

    private function cleanText(string $text, int $limit): string
    {
        $text = trim(strip_tags($text));
        $text = preg_replace('/^(AI|ASSISTANT|AGENT)\s*:\s*/i', '', $text) ?? $text;

        return Str::limit(trim($text), $limit, '…');
    }

    private function requestsHuman(string $text): bool
    {
        return preg_match('/\b(human|person|real agent|live agent|representative|someone|team member|speak to|talk to|call me)\b/i', $text) === 1;
    }

    /**
     * @param  Collection<int, LivechatKnowledge>  $rows
     * @return Collection<int, LivechatKnowledge>
     */
    private function relevantKnowledge(Collection $rows, string $query): Collection
    {
        $tokens = collect(preg_split('/[^\pL\pN]+/u', mb_strtolower($query)) ?: [])
            ->filter(fn ($word) => mb_strlen((string) $word) >= 4)
            ->unique()
            ->values();

        return $rows
            ->map(function (LivechatKnowledge $row) use ($tokens) {
                $haystack = mb_strtolower($row->title.' '.$row->content);
                $score = $tokens->sum(fn ($token) => substr_count($haystack, (string) $token));

                return ['row' => $row, 'score' => $score];
            })
            ->sortByDesc('score')
            ->take(8)
            ->pluck('row')
            ->values();
    }

    /**
     * @return array{reply:string,confidence:string,handoff:bool,handoff_reason:?string,suggested_replies:list<string>,sources:list<string>}
     */
    private function emptyResponse(): array
    {
        return [
            'reply' => '',
            'confidence' => 'low',
            'handoff' => true,
            'handoff_reason' => 'AI support is unavailable.',
            'suggested_replies' => [],
            'sources' => [],
        ];
    }
}
