<?php

namespace App\Services;

use App\Http\Resources\UserResource;
use App\Http\Resources\WorkspaceResource;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Google OAuth sign-in flow.
 *
 * Credentials and policy (registration, allowed domains) come from
 * GoogleAuthSettingsService, so the super admin can change them at runtime
 * without a deploy. Environment variables remain the fallback.
 */
class GoogleAuthService
{
    public function __construct(private readonly GoogleAuthSettingsService $settings) {}

    public function enabled(): bool
    {
        return $this->settings->usable();
    }

    public function redirectUri(): string
    {
        return $this->settings->config()['redirect_uri'];
    }

    public function authorizationUrl(string $state): string
    {
        $config = $this->requireConfigured();

        return 'https://accounts.google.com/o/oauth2/v2/auth?'.http_build_query([
            'client_id' => $config['client_id'],
            'redirect_uri' => $config['redirect_uri'],
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'access_type' => 'online',
            'include_granted_scopes' => 'true',
            'prompt' => $config['prompt'],
            'state' => $state,
        ]);
    }

    /**
     * @return array{id: string, email: string, name: string, avatar: string|null, email_verified: bool}
     */
    public function userFromAuthorizationCode(string $code): array
    {
        $config = $this->requireConfigured();

        $tokenResponse = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'code' => $code,
            'client_id' => $config['client_id'],
            'client_secret' => $config['client_secret'],
            'redirect_uri' => $config['redirect_uri'],
            'grant_type' => 'authorization_code',
        ]);

        if (! $tokenResponse->successful()) {
            throw new RuntimeException('Google token exchange failed.');
        }

        $accessToken = $tokenResponse->json('access_token');
        if (! is_string($accessToken) || $accessToken === '') {
            throw new RuntimeException('Google did not return an access token.');
        }

        $profileResponse = Http::withToken($accessToken)
            ->get('https://www.googleapis.com/oauth2/v3/userinfo');

        if (! $profileResponse->successful()) {
            throw new RuntimeException('Could not load the Google profile.');
        }

        $email = Str::lower(trim((string) $profileResponse->json('email', '')));
        $id = (string) $profileResponse->json('sub', '');
        if ($email === '' || $id === '') {
            throw new RuntimeException('Google account is missing an email address.');
        }

        return [
            'id' => $id,
            'email' => $email,
            'name' => trim((string) ($profileResponse->json('name') ?: Str::before($email, '@'))),
            'avatar' => is_string($profileResponse->json('picture')) ? $profileResponse->json('picture') : null,
            'email_verified' => (bool) $profileResponse->json('email_verified', false),
        ];
    }

    /**
     * @param  array{id: string, email: string, name: string, avatar: string|null, email_verified: bool}  $profile
     * @return array{token: string, user: UserResource, workspaces: mixed}
     */
    public function loginOrRegister(array $profile, WorkspaceService $workspaces): array
    {
        $config = $this->settings->config();

        $this->assertDomainAllowed($profile['email'], $config['allowed_domains']);

        $user = User::query()->where('google_id', $profile['id'])->first()
            ?? User::query()->where('email', $profile['email'])->first();

        if ($user?->blocked_at) {
            throw new RuntimeException('This account has been blocked. Contact support if you believe this is a mistake.');
        }

        if (! $user) {
            if (! $config['allow_registration']) {
                throw new RuntimeException('No account matches this Google address. Ask an administrator for an invitation.');
            }

            $user = User::query()->create([
                'name' => $profile['name'] ?: 'Google User',
                'email' => $profile['email'],
                'google_id' => $profile['id'],
                'avatar_url' => $profile['avatar'],
                'password' => Str::password(40),
                'email_verified_at' => $profile['email_verified'] ? now() : null,
            ]);
            $workspaces->createPersonal($user);
        } else {
            $user->forceFill([
                'google_id' => $user->google_id ?: $profile['id'],
                'avatar_url' => $profile['avatar'] ?: $user->avatar_url,
                'email_verified_at' => $user->email_verified_at ?: ($profile['email_verified'] ? now() : null),
                'name' => $user->name ?: $profile['name'],
            ])->save();
        }

        $user->refresh()->load('workspaces');
        $token = $user->createToken('google')->plainTextToken;

        return [
            'token' => $token,
            'user' => new UserResource($user),
            'workspaces' => WorkspaceResource::collection($user->workspaces),
        ];
    }

    /**
     * @param  list<string>  $allowed
     */
    private function assertDomainAllowed(string $email, array $allowed): void
    {
        if ($allowed === []) {
            return;
        }

        $domain = Str::lower(Str::afterLast($email, '@'));
        if (! in_array($domain, $allowed, true)) {
            throw new RuntimeException('Google sign-in is restricted to approved email domains.');
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function requireConfigured(): array
    {
        if (! $this->settings->usable()) {
            throw new RuntimeException('Google sign-in is not configured.');
        }

        return $this->settings->config();
    }
}
