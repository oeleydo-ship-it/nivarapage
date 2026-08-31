<?php

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;

class PlanQuotaException extends HttpException
{
    /**
     * @param  array<string, mixed>  $usage
     */
    public function __construct(
        public readonly string $limitKey,
        public readonly mixed $used,
        public readonly mixed $limit,
        public readonly array $usage = [],
        ?string $message = null,
    ) {
        $label = str_replace('_', ' ', $limitKey);
        parent::__construct(
            402,
            $message ?? "Plan limit reached for {$label}. Upgrade to continue.",
        );
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'error' => 'plan_limit',
            'limit_key' => $this->limitKey,
            'used' => $this->used,
            'limit' => $this->limit,
            'usage' => $this->usage,
        ], 402);
    }
}
