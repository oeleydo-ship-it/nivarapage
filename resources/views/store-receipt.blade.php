<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Order confirmation</title>
@if($order->status === 'pending')<meta http-equiv="refresh" content="5">@endif
<style>body{font:16px/1.6 system-ui;background:#f5f5f5;color:#171717;margin:0;padding:32px}main{max-width:560px;margin:8vh auto;background:white;padding:40px;border-radius:24px}a{display:inline-block;background:#171717;color:white;padding:12px 24px;border-radius:10px;text-decoration:none}small{color:#666}h1{line-height:1.2}</style></head><body><main>
@if($order->status === 'paid')
<h1>Thank you for your order</h1><p>Your payment has been confirmed.</p>
<p>{{ $order->product?->name }}</p><p>{{ strtoupper($order->currency) }} {{ number_format($order->amount / 100, 2) }}</p>
@if(($order->metadata['kind'] ?? '') === 'digital' && filled($order->metadata['delivery_url'] ?? null))
<a href="{{ $order->metadata['delivery_url'] }}" rel="noreferrer">Access your digital product</a>
@elseif(($order->metadata['kind'] ?? '') === 'physical')
<p>Order status: {{ ucfirst($order->metadata['fulfillment'] ?? 'unfulfilled') }}</p>
@if(filled($order->metadata['tracking_url'] ?? null))<a href="{{ $order->metadata['tracking_url'] }}" rel="noreferrer">Track your shipment</a>@endif
@endif
@elseif($order->status === 'pending')
<h1>Confirming your payment</h1><p>We are waiting for confirmation from the payment provider. This page refreshes automatically. Please do not pay again.</p>
@else
<h1>Order {{ $order->status }}</h1><p>Please contact the shop if you need help with this order.</p>
@endif
<p><small>Order {{ $order->reference }}</small></p></main></body></html>
