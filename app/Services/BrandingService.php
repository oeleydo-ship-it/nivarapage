<?php

namespace App\Services;

use App\Models\PlatformSetting;
use enshrined\svgSanitize\Sanitizer;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use InvalidArgumentException;

/**
 * The platform's own branding: the name, tagline and logo shown in the app
 * chrome and on the sign-in screen.
 *
 * Deliberately separate from tenant media. These files belong to the platform,
 * not to a workspace, so they do not count against anyone's storage plan and
 * are not listed in the media library.
 */
class BrandingService
{
    private const DIRECTORY = 'platform';

    /** @var array<string, string> mime => extension */
    private const ALLOWED = [
        'image/png' => 'png',
        'image/jpeg' => 'jpg',
        'image/webp' => 'webp',
        'image/svg+xml' => 'svg',
        'image/x-icon' => 'ico',
        'image/vnd.microsoft.icon' => 'ico',
    ];

    /** Max upload size in bytes. A logo has no business being larger. */
    private const MAX_BYTES = 2 * 1024 * 1024;

    /**
     * Branding safe to expose without authentication - the sign-in screen
     * needs it before anyone has a token.
     *
     * @return array<string, mixed>
     */
    public function public(): array
    {
        $stored = PlatformSetting::query()->pluck('value', 'key');

        return [
            'platform_name' => (string) ($stored->get('platform_name') ?: 'My Website Builder'),
            'platform_tagline' => (string) ($stored['platform_tagline'] ?? 'Website builder'),
            'logo_url' => $this->url((string) ($stored['platform_logo'] ?? '')),
            'logo_dark_url' => $this->url((string) ($stored['platform_logo_dark'] ?? '')),
            'favicon_url' => $this->url((string) ($stored['platform_favicon'] ?? '')),
            'platform_domain' => app(PlatformSettingsService::class)->platformDomain(),
        ];
    }

    /**
     * Stores an uploaded logo and returns its public URL.
     *
     * @param  'platform_logo'|'platform_logo_dark'|'platform_favicon'  $key
     */
    public function storeLogo(UploadedFile $file, string $key = 'platform_logo'): string
    {
        $mime = $file->getMimeType() ?: $file->getClientMimeType();
        if (! array_key_exists($mime, self::ALLOWED)) {
            throw new InvalidArgumentException('Use a PNG, JPEG, WebP, SVG or ICO image.');
        }

        $contents = $file->get();
        if ($contents === false || $contents === '') {
            throw new InvalidArgumentException('The uploaded file is empty.');
        }
        if (strlen($contents) > self::MAX_BYTES) {
            throw new InvalidArgumentException('Keep the logo under 2 MB.');
        }

        if ($mime === 'image/svg+xml') {
            // An SVG is a document that can carry script; strip anything active
            // before it is served from our own origin.
            $sanitizer = new Sanitizer;
            $sanitizer->removeRemoteReferences(true);
            $clean = $sanitizer->sanitize($contents);
            if ($clean === false || trim($clean) === '') {
                throw new InvalidArgumentException('That SVG could not be sanitised.');
            }
            $contents = $clean;
        } else {
            $info = @getimagesizefromstring($contents);
            if (! is_array($info) || empty($info[0]) || empty($info[1])) {
                throw new InvalidArgumentException('That file is not a valid image.');
            }
        }

        $disk = Storage::disk($this->disk());
        $path = self::DIRECTORY.'/'.Str::uuid()->toString().'.'.self::ALLOWED[$mime];
        $disk->put($path, $contents, 'public');

        $this->deleteStoredFile($key);
        PlatformSetting::query()->updateOrCreate(['key' => $key], ['value' => $path]);

        return $this->url($path);
    }

    /**
     * Removes the logo and its file, falling back to the wordmark.
     *
     * @param  'platform_logo'|'platform_logo_dark'|'platform_favicon'  $key
     */
    public function clearLogo(string $key = 'platform_logo'): void
    {
        $this->deleteStoredFile($key);
        PlatformSetting::query()->where('key', $key)->delete();
    }

    private function deleteStoredFile(string $key): void
    {
        $previous = (string) (PlatformSetting::query()->where('key', $key)->value('value') ?? '');
        if ($previous === '' || str_starts_with($previous, 'http')) {
            return;
        }

        $disk = Storage::disk($this->disk());
        if ($disk->exists($previous)) {
            $disk->delete($previous);
        }
    }

    private function url(string $path): ?string
    {
        if ($path === '') {
            return null;
        }
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::disk($this->disk())->url($path);
    }

    private function disk(): string
    {
        $disk = (string) config('uidesired.media_disk', 'public');

        return $disk !== '' ? $disk : 'public';
    }
}
