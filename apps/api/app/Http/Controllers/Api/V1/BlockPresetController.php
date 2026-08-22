<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BlockPresetResource;
use App\Models\BlockPreset;

class BlockPresetController extends Controller
{
    public function index()
    {
        return BlockPresetResource::collection(
            BlockPreset::query()
                ->where('is_active', true)
                ->orderByDesc('is_featured')
                ->orderBy('name')
                ->get()
        );
    }
}
