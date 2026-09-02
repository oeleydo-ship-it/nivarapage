<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\LivechatConversationResource;
use App\Http\Resources\LivechatMessageResource;
use App\Models\LivechatConversation;
use App\Models\LivechatWidget;
use App\Services\Livechat\LivechatService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PublicLivechatController extends Controller
{
    public function show(string $publicKey, LivechatService $livechat)
    {
        $widget = $this->widget($publicKey);
        abort_unless($widget->enabled, 404);

        return response()->json(['data' => $livechat->publicConfig($widget)]);
    }

    public function widgetScript(string $publicKey, LivechatService $livechat): Response
    {
        $widget = $this->widget($publicKey);
        $config = $livechat->publicConfig($widget);
        $endpoint = rtrim((string) config('app.url'), '/').'/api/v1/public/livechat/'.$widget->public_key;
        $payload = json_encode([
            'endpoint' => $endpoint,
            'config' => $config,
        ], JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);

        // PHP heredocs have no backtick escape, so JS template literals are
        // spliced in through this variable instead.
        $bt = chr(96);

        $js = <<<JS
(() => {
  const boot = {$payload};
  if (!boot.config.enabled || window.__udLivechat) return;
  window.__udLivechat = true;
  const root = document.createElement('div');
  root.id = 'ud-livechat-root';
  document.body.appendChild(root);
  const css = document.createElement('style');
  css.textContent = {$bt}
    #ud-livechat-root{position:fixed;z-index:2147483000;font-family:Inter,ui-sans-serif,system-ui,sans-serif;display:flex;flex-direction:column;align-items:flex-end;gap:14px}
    #ud-livechat-root[data-pos="right"]{right:22px;bottom:22px}
    #ud-livechat-root[data-pos="left"]{left:22px;bottom:22px;align-items:flex-start}
    .ud-lc-fab{width:60px;height:60px;border-radius:999px;border:1px solid var(--ud-lc-line);color:var(--ud-lc-on-accent);cursor:pointer;display:grid;place-items:center;box-shadow:0 16px 40px var(--ud-lc-shadow),0 0 0 8px var(--ud-lc-soft)}
    .ud-lc-panel{width:min(392px,calc(100vw - 28px));height:min(580px,calc(100vh - 110px));background:linear-gradient(180deg,var(--ud-lc-surface),var(--ud-lc-surface-2));color:var(--ud-lc-text);border-radius:24px;box-shadow:0 28px 80px var(--ud-lc-shadow);display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--ud-lc-line)}
    .ud-lc-head{display:flex;align-items:center;gap:12px;padding:16px 16px 12px}
    .ud-lc-av{width:40px;height:40px;border-radius:14px;display:grid;place-items:center;font-weight:700;color:var(--ud-lc-on-accent);flex:none}
    .ud-lc-online{display:flex;align-items:center;gap:6px;margin-top:3px;font-size:11px;color:var(--ud-lc-muted)}
    .ud-lc-dot{width:7px;height:7px;border-radius:99px;background:#4ade80;box-shadow:0 0 0 4px rgba(74,222,128,.15)}
    .ud-lc-x{width:34px;height:34px;border:0;border-radius:10px;background:var(--ud-lc-soft);color:var(--ud-lc-text);cursor:pointer}
    .ud-lc-greet{margin:0 16px 12px;padding:10px 12px;border-radius:14px;background:var(--ud-lc-soft);border:1px solid var(--ud-lc-line);font-size:13px;line-height:1.5;color:var(--ud-lc-muted)}
    .ud-lc-msgs{flex:1;overflow:auto;padding:4px 16px 12px;display:flex;flex-direction:column;gap:8px}
    .ud-lc-bubble{max-width:82%;padding:9px 12px;border-radius:16px;font-size:13.5px;line-height:1.45}
    .ud-lc-bubble.visitor{align-self:flex-end;background:var(--ud-lc-accent);color:var(--ud-lc-on-accent);border-bottom-right-radius:6px}
    .ud-lc-bubble.ai,.ud-lc-bubble.agent,.ud-lc-bubble.system{align-self:flex-start;background:var(--ud-lc-bubble);color:var(--ud-lc-on-bubble);border-bottom-left-radius:6px}
    .ud-lc-form{padding:4px 16px 16px;display:grid;gap:10px}
    .ud-lc-form p{margin:0;font-size:13px;color:var(--ud-lc-muted);line-height:1.5}
    .ud-lc-composer{padding:12px;display:grid;grid-template-columns:1fr 44px;gap:8px;border-top:1px solid var(--ud-lc-line);background:var(--ud-lc-soft)}
    .ud-lc-form input,.ud-lc-composer input{width:100%;box-sizing:border-box;border:1px solid var(--ud-lc-line);background:var(--ud-lc-field);color:var(--ud-lc-text);border-radius:12px;padding:11px 12px;font:inherit;font-size:14px;outline:none}
    .ud-lc-form button{border:0;border-radius:12px;padding:12px 14px;background:var(--ud-lc-accent);color:var(--ud-lc-on-accent);font-weight:650;cursor:pointer}
    .ud-lc-send{width:44px;height:44px;border:0;border-radius:12px;background:var(--ud-lc-accent);color:var(--ud-lc-on-accent);cursor:pointer;display:grid;place-items:center}
    .ud-lc-typing{align-self:flex-start;background:var(--ud-lc-bubble);color:var(--ud-lc-muted);display:flex;align-items:center;gap:8px}
    .ud-lc-ai-label{margin-bottom:4px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ud-lc-accent)}
    .ud-lc-source{margin-top:7px;font-size:10.5px;color:var(--ud-lc-muted)}
    .ud-lc-suggestions{padding:0 12px 8px;display:flex;gap:6px;overflow:auto}
    .ud-lc-suggestion{flex:none;border:1px solid var(--ud-lc-line);border-radius:999px;background:var(--ud-lc-soft);color:var(--ud-lc-text);padding:7px 10px;font-size:11.5px;cursor:pointer}
    .ud-lc-human{margin:0 12px 8px;align-self:flex-start;border:0;background:transparent;color:var(--ud-lc-muted);font-size:11.5px;text-decoration:underline;cursor:pointer}
    .ud-lc-pulse{width:6px;height:6px;border-radius:99px;background:var(--ud-lc-muted);display:inline-block;animation:ud-lc-dot 1s ease-in-out infinite}
    @keyframes ud-lc-dot{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
  {$bt};
  document.head.appendChild(css);
  root.dataset.pos = boot.config.position || 'right';
  const color = boot.config.primary_color || '#6366f1';
  const palette = (() => {
    const cfg = boot.config;
    const rgb = (hex) => {
      let v = String(hex || '').replace('#','').trim();
      if (v.length === 3) v = v.split('').map(c => c + c).join('');
      if (v.length === 8) v = v.slice(0, 6);
      const n = parseInt(v, 16);
      return (v.length !== 6 || !isFinite(n)) ? [24,24,27] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const hex = (a) => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2,'0')).join('');
    const mix = (from, to, t) => { const a = rgb(from), b = rgb(to); return hex([0,1,2].map(i => a[i] + (b[i]-a[i])*t)); };
    const alpha = (c, a) => { const [r,g,b] = rgb(c); return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; };
    const lum = (c) => { const p = rgb(c).map(v => { const x = v/255; return x <= 0.03928 ? x/12.92 : Math.pow((x+0.055)/1.055, 2.4); }); return 0.2126*p[0] + 0.7152*p[1] + 0.0722*p[2]; };
    const ink = (c) => lum(c) > 0.5 ? '#111827' : '#ffffff';
    const wanted = (cfg.theme === 'light' || cfg.theme === 'dark') ? cfg.theme : null;
    const dark = wanted ? wanted === 'dark' : !(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
    const surface = cfg.surface_color || (dark ? '#18181b' : '#ffffff');
    const text = cfg.text_color || (dark ? '#fafafa' : '#18181b');
    const bubble = cfg.bubble_color || mix(surface, text, 0.09);
    return {
      '--ud-lc-accent': color,
      '--ud-lc-on-accent': ink(color),
      '--ud-lc-surface': surface,
      '--ud-lc-surface-2': mix(surface, dark ? '#000000' : '#ffffff', 0.4),
      '--ud-lc-text': text,
      '--ud-lc-muted': mix(surface, text, 0.62),
      '--ud-lc-line': alpha(text, dark ? 0.12 : 0.14),
      '--ud-lc-soft': alpha(text, dark ? 0.06 : 0.05),
      '--ud-lc-field': mix(surface, dark ? '#000000' : text, dark ? 0.45 : 0.05),
      '--ud-lc-bubble': bubble,
      '--ud-lc-on-bubble': ink(bubble),
      '--ud-lc-shadow': alpha(dark ? '#000000' : mix(text, '#000000', 0.2), dark ? 0.55 : 0.22),
      '--ud-lc-fab-2': mix(color, '#000000', 0.45),
    };
  })();
  Object.keys(palette).forEach(key => root.style.setProperty(key, palette[key]));
  const brand = boot.config.site_name || 'Support';
  let open = false, token = localStorage.getItem('ud.lc.' + boot.config.public_key), conv = null, messages = [], typing = false;
  function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; }
  async function api(path, opts={}){
    const headers = {'Accept':'application/json','Content-Type':'application/json', ...(opts.headers||{})};
    if (token) headers['X-Livechat-Token'] = token;
    const res = await fetch(boot.endpoint + path, {...opts, headers, body: opts.json ? JSON.stringify(opts.json) : opts.body});
    const json = await res.json().catch(()=>({}));
    if (!res.ok) throw new Error(json.message || 'Request failed');
    return json.data ?? json;
  }
  function awaitingReply(list){
    const last = (list||[]).filter(m => m.role !== 'system').pop();
    return last && last.role === 'visitor';
  }
  function bubble(m){
    const label = m.role === 'ai' ? '<div class="ud-lc-ai-label">AI assistant</div>' : (m.role === 'agent' ? '<div class="ud-lc-ai-label" style="opacity:.7">Support agent</div>' : '');
    const sources = m.meta && Array.isArray(m.meta.sources) && m.meta.sources.length ? '<div class="ud-lc-source">Based on: ' + m.meta.sources.slice(0,3).map(escapeHtml).join(', ') + '</div>' : '';
    return '<div class="ud-lc-bubble ' + escapeHtml(m.role) + '">' + label + escapeHtml(m.body) + sources + '</div>';
  }
  function suggestionsRow(){
    const last = (messages||[]).filter(m => m.role !== 'system').pop();
    const items = last && last.role === 'ai' && last.meta && Array.isArray(last.meta.suggested_replies) ? last.meta.suggested_replies.slice(0,3) : [];
    return items.length ? '<div class="ud-lc-suggestions">' + items.map((item,i) => '<button type="button" class="ud-lc-suggestion" data-suggestion="'+i+'">'+escapeHtml(item)+'</button>').join('') + '</div>' : '';
  }
  function typingRow(){
    if (!typing) return '';
    const label = conv && conv.handler === 'ai' ? 'Agent is checking the details' : 'Agent is typing';
    return '<div class="ud-lc-bubble ud-lc-typing"><span style="display:inline-flex;gap:4px"><i class="ud-lc-pulse"></i><i class="ud-lc-pulse" style="animation-delay:140ms"></i><i class="ud-lc-pulse" style="animation-delay:280ms"></i></span>'+label+'</div>';
  }
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function icon(kind){
    if (kind === 'x') return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 7l10 10M17 7 7 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    if (kind === 'send') return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4.5 12 20 4.5 14.5 20l-2.2-6.3L4.5 12Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';
    if (kind === 'bubble') return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 4c4.4 0 8 2.9 8 6.5S16.4 17 12 17c-.7 0-1.4-.07-2-.2L5.5 19l.9-3.2C5 14.6 4 12.7 4 10.5 4 6.9 7.6 4 12 4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    if (kind === 'headset') return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 14v-2a7 7 0 0 1 14 0v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M6.6 13H5.8A1.8 1.8 0 0 0 4 14.8v1.4A1.8 1.8 0 0 0 5.8 18h.8A1.4 1.4 0 0 0 8 16.6v-2.2A1.4 1.4 0 0 0 6.6 13Zm10.8 0h.8A1.8 1.8 0 0 1 20 14.8v1.4A1.8 1.8 0 0 1 18.2 18h-.8a1.4 1.4 0 0 1-1.4-1.4v-2.2a1.4 1.4 0 0 1 1.4-1.4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    if (kind === 'sparkle') return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 4.5 13.6 9 18 10.5 13.6 12 12 16.5 10.4 12 6 10.5 10.4 9 12 4.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M18 16.2 18.7 18l1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" fill="currentColor"/></svg>';
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 6.8A2.8 2.8 0 0 1 7.8 4h8.4A2.8 2.8 0 0 1 19 6.8v6.4A2.8 2.8 0 0 1 16.2 16H12l-3.6 3.2V16H7.8A2.8 2.8 0 0 1 5 13.2V6.8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 9h6M9 12h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  }
  function render(){
    root.innerHTML = '';
    if (open) {
      const panel = el('<div class="ud-lc-panel"></div>');
      panel.innerHTML = {$bt}<div class="ud-lc-head"><div class="ud-lc-av" style="background:linear-gradient(145deg,var(--ud-lc-accent),var(--ud-lc-surface-2))">\${escapeHtml(brand.charAt(0).toUpperCase())}</div><div style="flex:1;min-width:0"><div style="font-weight:650;font-size:14px">\${escapeHtml(brand)}</div><div class="ud-lc-online"><span class="ud-lc-dot"></span>Online · usually replies in a minute</div></div><button type="button" class="ud-lc-x" aria-label="Close">\${icon('x')}</button></div><p class="ud-lc-greet">\${escapeHtml(boot.config.greeting||'')}</p>{$bt};
      panel.querySelector('.ud-lc-x').onclick = () => { open = false; render(); };
      if (!token || !conv) {
        const form = el('<form class="ud-lc-form"></form>');
        form.innerHTML = '<p>Leave your details and we’ll pick this up right away.</p>';
        if (boot.config.collect_name) form.innerHTML += '<input name="name" placeholder="Full name" required />';
        if (boot.config.collect_email) form.innerHTML += '<input name="email" type="email" placeholder="Work email" required />';
        if (boot.config.collect_phone) form.innerHTML += '<input name="phone" placeholder="Phone" required />';
        form.innerHTML += '<button>Start conversation</button>';
        form.onsubmit = async (e) => {
          e.preventDefault();
          const fd = new FormData(form);
          try {
            const data = await api('/conversations', { method:'POST', json: {
              name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'),
              page_url: location.href, locale: navigator.language, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              screen: screen.width + 'x' + screen.height,
            }});
            conv = data; token = data.visitor_token; messages = data.messages || [];
            localStorage.setItem('ud.lc.' + boot.config.public_key, token);
            localStorage.setItem('ud.lc.uuid.' + boot.config.public_key, data.uuid);
            render(); poll();
          } catch (err) { alert(err.message); }
        };
        panel.appendChild(form);
      } else {
        const msgs = el('<div class="ud-lc-msgs"></div>');
        msgs.innerHTML = messages.map(bubble).join('') + typingRow();
        panel.appendChild(msgs);
        panel.insertAdjacentHTML('beforeend', suggestionsRow());
        if (boot.config.ai_enabled !== false && conv.handler !== 'human') {
          const human = el('<button type="button" class="ud-lc-human">Talk to a person</button>');
          human.onclick = async () => {
            conv = await api('/conversations/' + conv.uuid + '/handoff', { method:'POST', json:{ reason:'Visitor used the Talk to a person button.' } });
            messages = conv.messages || []; typing = false; render();
          };
          panel.appendChild(human);
        }
        const composer = el('<form class="ud-lc-composer"></form>');
        composer.innerHTML = {$bt}<input name="body" placeholder="Write a message…" autocomplete="off" /><button class="ud-lc-send" style="background:\${color}" aria-label="Send">\${icon('send')}</button>{$bt};
        composer.onsubmit = async (e) => {
          e.preventDefault();
          const body = composer.body.value.trim(); if (!body) return;
          composer.body.value = '';
          const data = await api('/conversations/' + conv.uuid + '/messages', { method:'POST', json: { body } });
          messages.push(data);
          typing = boot.config.ai_enabled !== false && conv.handler !== 'human' && awaitingReply(messages);
          render();
        };
        panel.appendChild(composer);
        panel.querySelectorAll('[data-suggestion]').forEach((button) => {
          button.onclick = () => {
            const last = messages.filter(m => m.role !== 'system').pop();
            const options = last && last.meta && Array.isArray(last.meta.suggested_replies) ? last.meta.suggested_replies : [];
            composer.body.value = options[Number(button.dataset.suggestion)] || button.textContent || '';
            composer.requestSubmit();
          };
        });
        queueMicrotask(() => { msgs.scrollTop = msgs.scrollHeight; });
      }
      root.appendChild(panel);
    }
    const btn = el({$bt}<button class="ud-lc-fab" style="background:linear-gradient(160deg,var(--ud-lc-accent) 0%,var(--ud-lc-fab-2) 130%)" aria-label="\${open?'Close chat':escapeHtml(boot.config.launcher_label||'Open chat')}">\${open?icon('x'):icon(boot.config.launcher_icon||'chat')}</button>{$bt});
    btn.onclick = () => { open = !open; render(); };
    root.appendChild(btn);
  }
  async function poll(){
    if (!token || !conv) return;
    try {
      const data = await api('/conversations/' + (conv.uuid || localStorage.getItem('ud.lc.uuid.' + boot.config.public_key)));
      conv = data; messages = data.messages || []; typing = Boolean(data.agent_typing) && awaitingReply(messages);
      // render() rebuilds the whole panel from scratch, which would otherwise
      // wipe out whatever the visitor is mid-typing every time a poll lands.
      const draftField = root.querySelector('.ud-lc-composer input[name="body"]');
      const draft = draftField ? draftField.value : '';
      const draftFocused = draftField === document.activeElement;
      render();
      if (draft) {
        const nextField = root.querySelector('.ud-lc-composer input[name="body"]');
        if (nextField) {
          nextField.value = draft;
          if (draftFocused) nextField.focus();
        }
      }
    } catch {}
    setTimeout(poll, typing ? 1200 : 3500);
  }
  render();
  if (token) poll();
})();
JS;

        return response($js, 200, [
            'Content-Type' => 'application/javascript; charset=UTF-8',
            'Cache-Control' => 'public, max-age=60',
        ]);
    }

    public function start(Request $request, string $publicKey, LivechatService $livechat)
    {
        $widget = $this->widget($publicKey);
        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:120'],
            'email' => ['nullable', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:40'],
            'page_url' => ['nullable', 'string', 'max:500'],
            'locale' => ['nullable', 'string', 'max:32'],
            'timezone' => ['nullable', 'string', 'max:64'],
            'country' => ['nullable', 'string', 'max:80'],
            'region' => ['nullable', 'string', 'max:80'],
            'city' => ['nullable', 'string', 'max:80'],
            'screen' => ['nullable', 'string', 'max:32'],
        ]);

        $started = $livechat->startConversation($widget, $request, $data);
        $payload = (new LivechatConversationResource($started['conversation']->load('messages')))->resolve($request);
        $payload['visitor_token'] = $started['visitor_token'];

        return response()->json(['data' => $payload], 201);
    }

    public function conversation(Request $request, string $publicKey, string $uuid)
    {
        $conversation = $this->authorizedConversation($request, $publicKey, $uuid);

        return new LivechatConversationResource($conversation->load(['assignee', 'messages' => fn ($q) => $q->orderBy('id')]));
    }

    public function message(Request $request, string $publicKey, string $uuid, LivechatService $livechat)
    {
        $conversation = $this->authorizedConversation($request, $publicKey, $uuid);
        $data = $request->validate([
            'body' => ['required', 'string', 'max:4000'],
        ]);
        $conversation->load('widget');
        $message = $livechat->addVisitorMessage($conversation, $data['body']);

        return (new LivechatMessageResource($message))->response()->setStatusCode(201);
    }

    public function handoff(Request $request, string $publicKey, string $uuid, LivechatService $livechat)
    {
        $conversation = $this->authorizedConversation($request, $publicKey, $uuid);
        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:240'],
        ]);

        return new LivechatConversationResource(
            $livechat->requestHumanHandoff($conversation, (string) ($data['reason'] ?? 'Visitor requested a human agent.')),
        );
    }

    private function widget(string $publicKey): LivechatWidget
    {
        return LivechatWidget::query()->where('public_key', $publicKey)->firstOrFail();
    }

    private function authorizedConversation(Request $request, string $publicKey, string $uuid): LivechatConversation
    {
        $widget = $this->widget($publicKey);
        $conversation = LivechatConversation::query()
            ->where('widget_id', $widget->id)
            ->where('uuid', $uuid)
            ->firstOrFail();
        $token = (string) $request->header('X-Livechat-Token', '');
        abort_unless($token !== '' && $conversation->matchesVisitorToken($token), 403, 'Invalid chat session.');

        return $conversation;
    }
}
