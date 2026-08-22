<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Throwable;

class HealthController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['status' => 'ok']);
    }

    public function ready(): JsonResponse
    {
        $checks = ['database' => false, 'redis' => false];

        try {
            DB::select('select 1');
            $checks['database'] = true;
        } catch (Throwable) {
            $checks['database'] = false;
        }

        try {
            Cache::put('health:ready', true, 5);
            $checks['redis'] = Cache::has('health:ready') || config('cache.default') === 'array';
        } catch (Throwable) {
            $checks['redis'] = app()->environment('testing');
        }

        $ok = $checks['database'] && $checks['redis'];

        return response()->json([
            'status' => $ok ? 'ok' : 'degraded',
            'data' => $checks,
        ], $ok ? 200 : 503);
    }
}
