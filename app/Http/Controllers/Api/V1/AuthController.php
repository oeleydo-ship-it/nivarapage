<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Resources\WorkspaceResource;
use App\Models\User;
use App\Services\GoogleAuthService;
use App\Services\GoogleAuthSettingsService;
use App\Services\WorkspaceService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use RuntimeException;

class AuthController extends Controller
{
    public function register(Request $request, WorkspaceService $workspaces): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)->max(72)],
        ]);

        $user = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);

        event(new Registered($user));

        $workspaces->createPersonal($user);
        $user->refresh()->load('workspaces');

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'data' => [
                'token' => $token,
                'user' => new UserResource($user),
                'workspaces' => WorkspaceResource::collection($user->workspaces),
            ],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $data['email'])->first();
        $passwordHash = $user?->getRawOriginal('password');
        if (! $user || ! filled($passwordHash) || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 422);
        }

        if ($user->blocked_at) {
            return response()->json([
                'message' => 'This account has been blocked. Contact support if you believe this is a mistake.',
                'error' => 'account_blocked',
            ], 403);
        }

        $user->load('workspaces');
        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'data' => [
                'token' => $token,
                'user' => new UserResource($user),
                'workspaces' => WorkspaceResource::collection($user->workspaces),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();
        if ($token instanceof \Laravel\Sanctum\PersonalAccessToken) {
            $token->delete();
        } else {
            $request->user()?->tokens()->delete();
        }

        return response()->json(['data' => ['ok' => true]]);
    }

    public function user(Request $request): UserResource
    {
        return new UserResource($request->user()->load('workspaces'));
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);
        Password::sendResetLink($request->only('email'));

        return response()->json(['data' => ['ok' => true]]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)->max(72)],
        ]);

        $status = Password::reset($request->only('email', 'password', 'password_confirmation', 'token'), function (User $user, string $password) {
            $user->forceFill([
                'password' => $password,
                'remember_token' => Str::random(60),
            ])->save();
            $user->tokens()->delete();
            event(new PasswordReset($user));
        });

        abort_unless($status === Password::PASSWORD_RESET, 422, __($status));

        return response()->json(['data' => ['ok' => true]]);
    }

    public function verifyEmail(Request $request, int $id, string $hash): JsonResponse
    {
        $user = User::query()->findOrFail($id);
        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            abort(403);
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        return response()->json(['data' => ['verified' => true]]);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        if (! $request->user()->hasVerifiedEmail()) {
            $request->user()->sendEmailVerificationNotification();
        }

        return response()->json(['data' => ['ok' => true]]);
    }

    public function googleStatus(GoogleAuthSettingsService $settings): JsonResponse
    {
        return response()->json(['data' => [
            'enabled' => $settings->usable(),
            'allow_registration' => $settings->config()['allow_registration'],
        ]]);
    }

    public function googleRedirect(Request $request, GoogleAuthService $google): JsonResponse
    {
        if (! $google->enabled()) {
            return response()->json(['message' => 'Google sign-in is not configured.'], 422);
        }

        $state = Str::random(40);
        Cache::put($this->googleStateKey($state), [
            'ip' => $request->ip(),
            'created_at' => now()->toIso8601String(),
        ], now()->addMinutes(10));

        return response()->json(['data' => [
            'url' => $google->authorizationUrl($state),
        ]]);
    }

    public function googleCallback(Request $request, GoogleAuthService $google, WorkspaceService $workspaces): RedirectResponse
    {
        $frontend = rtrim((string) config('uidesired.frontend_url', 'http://localhost:5174'), '/');
        $fail = fn (string $message) => redirect()->away($frontend.'/login?google_error='.urlencode($message));

        if (! $google->enabled()) {
            return $fail('Google sign-in is not configured.');
        }

        if ($request->filled('error')) {
            return $fail((string) $request->query('error_description', 'Google sign-in was cancelled.'));
        }

        $state = (string) $request->query('state', '');
        $code = (string) $request->query('code', '');
        if ($state === '' || $code === '' || ! Cache::pull($this->googleStateKey($state))) {
            return $fail('Invalid or expired Google sign-in session.');
        }

        try {
            $profile = $google->userFromAuthorizationCode($code);
            $payload = $google->loginOrRegister($profile, $workspaces);
        } catch (RuntimeException $e) {
            return $fail($e->getMessage());
        }

        $token = $payload['token'];

        return redirect()->away($frontend.'/auth/callback?token='.urlencode($token));
    }

    private function googleStateKey(string $state): string
    {
        return 'google_oauth_state:'.$state;
    }
}
