<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class StoreReceiptController extends Controller
{
    public function show(Request $request, string $reference)
    {
        abort_unless($request->hasValidSignature(absolute: false), 403);
        $order = Order::query()->with('product')->where('reference', $reference)->firstOrFail();
        return response()->view('store-receipt', ['order' => $order])
            ->header('Cache-Control', 'private, no-store')->header('Referrer-Policy', 'no-referrer');
    }
}
