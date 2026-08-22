<?php

namespace App\Services;

use App\Jobs\OptimizeImage;
use App\Models\Media;
use App\Models\PageRevision;
use App\Models\Site;
use App\Models\User;
use App\Services\Storage\StorageSettingsService;
use App\Support\CurrentWorkspace;
use enshrined\svgSanitize\Sanitizer;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use InvalidArgumentException;

class MediaService
{
    /**
     * @var list<string>
     */
    private array $allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif',
        'image/svg+xml',
        'video/mp4',
        'video/webm',
        'video/quicktime',
    ];

    /**
     * @var list<string>
     */
    private array $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg', 'mp4', 'webm', 'mov'];

    /**
     * @var list<string>
     */
    private array $videoMimes = [
        'video/mp4',
        'video/webm',
        'video/quicktime',
    ];

    public function __construct(
        private readonly CurrentWorkspace $currentWorkspace,
        private readonly PlanLimitService $limits,
        private readonly AuditService $audit,
        private readonly StorageSettingsService $storageSettings,
    ) {}

    public function disk(): string
    {
        return $this->storageSettings->activeDisk();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, Media>
     */
    public function list(?string $search = null, ?int $siteId = null)
    {
        $workspace = $this->currentWorkspace->workspace;
        abort_unless($workspace, 422);

        $query = Media::query()->where('workspace_id', $workspace->id)->latest();

        if ($siteId) {
            $query->where(function ($q) use ($siteId) {
                $q->where('site_id', $siteId)->orWhereNull('site_id');
            });
        }

        if ($search) {
            $like = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';
            $query->where(function ($q) use ($like) {
                $q->where('filename', 'like', $like)
                    ->orWhere('alt_text', 'like', $like);
            });
        }

        return $query->get();
    }

    public function store(UploadedFile $file, User $user, ?int $siteId = null, ?string $alt = null): Media
    {
        $workspace = $this->currentWorkspace->workspace;
        abort_unless($workspace, 422);

        if ($siteId) {
            abort_unless(
                Site::query()->where('workspace_id', $workspace->id)->where('id', $siteId)->exists(),
                404,
            );
        }

        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension());
        if (! in_array($extension, $this->allowedExtensions, true)) {
            throw new InvalidArgumentException('Unsupported media type.');
        }

        $mime = $file->getMimeType() ?: $file->getClientMimeType();
        if (! in_array($mime, $this->allowedMimes, true)) {
            throw new InvalidArgumentException('Unsupported media type.');
        }

        $contents = $file->get();
        if ($contents === false || $contents === '') {
            throw new InvalidArgumentException('The uploaded file is empty.');
        }

        $head = strtolower(ltrim(substr($contents, 0, 256)));
        if (str_starts_with($head, '<?') || str_starts_with($head, '<html') || str_starts_with($head, '<!doctype html')) {
            throw new InvalidArgumentException('Unsupported media type.');
        }

        $this->limits->assertStorageIncoming($workspace, strlen($contents));

        if ($mime === 'image/svg+xml') {
            $sanitizer = new Sanitizer;
            $sanitizer->removeRemoteReferences(true);
            $contents = $sanitizer->sanitize($contents);
            if ($contents === false || $contents === '') {
                throw new InvalidArgumentException('SVG could not be sanitized.');
            }
        } elseif (in_array($mime, $this->videoMimes, true)) {
            if (! $this->looksLikeVideo($contents, $mime)) {
                throw new InvalidArgumentException('The file is not a valid video.');
            }
        } elseif (in_array($mime, ['image/jpeg', 'image/png', 'image/webp', 'image/avif'], true)) {
            $info = @getimagesizefromstring($contents);
            if (! is_array($info) || empty($info[0]) || empty($info[1])) {
                throw new InvalidArgumentException('The file is not a valid image.');
            }
        }

        $disk = $this->disk();
        $filename = Str::uuid()->toString().'.'.$extension;
        $path = 'media/'.$workspace->id.'/'.$filename;
        Storage::disk($disk)->put($path, $contents, 'public');

        $dimensions = $this->dimensions($contents, $mime);

        $media = Media::query()->create([
            'workspace_id' => $workspace->id,
            'site_id' => $siteId,
            'user_id' => $user->id,
            'disk' => $disk,
            'path' => $path,
            'filename' => $file->getClientOriginalName() ?: $filename,
            'mime_type' => $mime,
            'size' => strlen($contents),
            'width' => $dimensions['width'],
            'height' => $dimensions['height'],
            'alt_text' => $alt,
        ]);

        if (! in_array($mime, $this->videoMimes, true)) {
            OptimizeImage::dispatch($media->id)->onQueue('media');
        }

        $this->audit->log('media.uploaded', $media, ['filename' => $media->filename], $workspace, $user);

        return $media;
    }

    /**
     * @param  array{filename?: string, alt_text?: string|null}  $data
     */
    public function update(Media $media, array $data): Media
    {
        if (isset($data['filename'])) {
            $data['filename'] = $this->safeFilename($data['filename'], $media->filename);
        }

        $media->update($data);

        return $media->fresh();
    }

    public function delete(Media $media, User $user): void
    {
        Storage::disk($media->disk)->delete($media->path);
        $this->audit->log('media.deleted', $media, ['filename' => $media->filename], $media->workspace, $user);
        $media->delete();
    }

    public function url(Media $media): string
    {
        $disk = Storage::disk($media->disk);
        try {
            return $disk->url($media->path);
        } catch (\Throwable) {
            return rtrim((string) config('app.url'), '/').'/storage/'.$media->path;
        }
    }

    /**
     * @return array{count: int, pages: list<array{id: int, name: string, slug: string}>}
     */
    public function usage(Media $media): array
    {
        $url = $this->url($media);
        $needles = array_values(array_filter([
            $media->path,
            $url,
            (string) $media->id,
            $media->filename,
        ]));

        $pages = [];
        $revisions = PageRevision::query()
            ->whereHas('page.site', fn ($q) => $q->where('workspace_id', $media->workspace_id))
            ->with('page:id,name,slug,site_id')
            ->get(['id', 'page_id', 'content_json']);

        foreach ($revisions as $revision) {
            $json = json_encode($revision->content_json) ?: '';
            foreach ($needles as $needle) {
                if ($needle !== '' && str_contains($json, $needle)) {
                    if ($revision->page) {
                        $pages[$revision->page->id] = [
                            'id' => $revision->page->id,
                            'name' => $revision->page->name,
                            'slug' => $revision->page->slug,
                        ];
                    }
                    break;
                }
            }
        }

        return [
            'count' => count($pages),
            'pages' => array_values($pages),
        ];
    }

    public function optimize(Media $media): void
    {
        if ($media->mime_type === 'image/svg+xml' || in_array($media->mime_type, $this->videoMimes, true)) {
            return;
        }

        $disk = Storage::disk($media->disk);
        if (! $disk->exists($media->path)) {
            return;
        }

        $contents = $disk->get($media->path);
        if (! is_string($contents) || $contents === '') {
            return;
        }

        $dimensions = $this->dimensions($contents, $media->mime_type);
        $size = strlen($contents);

        if (function_exists('imagecreatefromstring') && in_array($media->mime_type, ['image/jpeg', 'image/png', 'image/webp'], true)) {
            $image = @imagecreatefromstring($contents);
            if ($image !== false) {
                ob_start();
                if ($media->mime_type === 'image/png') {
                    imagesavealpha($image, true);
                    imagepng($image, null, 6);
                } elseif ($media->mime_type === 'image/webp' && function_exists('imagewebp')) {
                    imagewebp($image, null, 82);
                } else {
                    imagejpeg($image, null, 82);
                }
                $optimized = ob_get_clean();
                imagedestroy($image);

                if (is_string($optimized) && $optimized !== '' && strlen($optimized) < $size) {
                    $disk->put($media->path, $optimized, 'public');
                    $contents = $optimized;
                    $size = strlen($optimized);
                    $dimensions = $this->dimensions($contents, $media->mime_type);
                }
            }
        }

        $media->forceFill([
            'width' => $dimensions['width'] ?? $media->width,
            'height' => $dimensions['height'] ?? $media->height,
            'size' => $size,
        ])->save();
    }

    /**
     * @return array{width: int|null, height: int|null}
     */
    private function dimensions(string $contents, string $mime): array
    {
        if ($mime === 'image/svg+xml' || in_array($mime, $this->videoMimes, true)) {
            return ['width' => null, 'height' => null];
        }

        $info = @getimagesizefromstring($contents);
        if (! is_array($info)) {
            return ['width' => null, 'height' => null];
        }

        return [
            'width' => isset($info[0]) ? (int) $info[0] : null,
            'height' => isset($info[1]) ? (int) $info[1] : null,
        ];
    }

    private function looksLikeVideo(string $contents, string $mime): bool
    {
        if ($contents === '') {
            return false;
        }

        if ($mime === 'video/webm') {
            // EBML header
            return strlen($contents) >= 4
                && ord($contents[0]) === 0x1A
                && ord($contents[1]) === 0x45
                && ord($contents[2]) === 0xDF
                && ord($contents[3]) === 0xA3;
        }

        // MP4 / QuickTime: "ftyp" box near the start
        $probe = substr($contents, 0, 64);

        return str_contains($probe, 'ftyp');
    }

    private function safeFilename(string $name, string $fallback): string
    {
        $name = trim(str_replace(['\\', '/', "\0"], '', $name));
        $name = basename($name);

        return $name !== '' ? mb_substr($name, 0, 255) : $fallback;
    }
}
