<?php

namespace App\Jobs;

use App\Models\Media;
use App\Services\MediaService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class OptimizeImage implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(public int $mediaId)
    {
        $this->onQueue('media');
    }

    public function handle(MediaService $media): void
    {
        $item = Media::query()->find($this->mediaId);
        if (! $item) {
            return;
        }

        $media->optimize($item);
    }
}
