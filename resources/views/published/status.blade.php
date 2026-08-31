<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>{{ $title }}</title>
<style>
    :root { color-scheme: light dark; --muted: #6b7280; --fg: #111827; --bg: #ffffff; }
    @media (prefers-color-scheme: dark) { :root { --muted: #9ca3af; --fg: #f9fafb; --bg: #0b0f19; } }
    html, body { height: 100%; }
    body {
        margin: 0; background: var(--bg); color: var(--fg);
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    }
    main {
        margin: 0 auto; max-width: 36rem; min-height: 100%;
        display: flex; flex-direction: column; justify-content: center; gap: .75rem;
        padding: 6rem 1.5rem; text-align: center;
    }
    .eyebrow { margin: 0; font-size: .875rem; font-weight: 500; letter-spacing: .05em; text-transform: uppercase; color: var(--muted); }
    h1 { margin: 0; font-size: 1.875rem; font-weight: 600; letter-spacing: -.025em; }
    .detail { margin: 0; font-size: .875rem; color: var(--muted); }
</style>
</head>
<body>
<main>
    <p class="eyebrow">{{ $eyebrow }}</p>
    <h1>{{ $heading }}</h1>
    @isset($detail)
        <p class="detail">{{ $detail }}</p>
    @endisset
</main>
</body>
</html>
