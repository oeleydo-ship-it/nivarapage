<?php

use App\Models\User;

it('rejects invalid credentials and short passwords', function () {
    $this->postJson('/api/v1/auth/register', [
        'name' => 'Ada',
        'email' => 'ada-auth@example.com',
        'password' => 'short',
        'password_confirmation' => 'short',
    ])->assertStatus(422);

    $this->postJson('/api/v1/auth/register', [
        'name' => 'Ada Lovelace',
        'email' => 'ada-auth@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertCreated();

    $this->postJson('/api/v1/auth/login', [
        'email' => 'ada-auth@example.com',
        'password' => 'wrong-password',
    ])->assertStatus(422);
});

it('creates a personal workspace on register and logs out the current token', function () {
    $register = $this->postJson('/api/v1/auth/register', [
        'name' => 'Grace Hopper',
        'email' => 'grace@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertCreated();

    $token = $register->json('data.token');
    $workspaceId = $register->json('data.workspaces.0.id') ?? $register->json('data.workspaces.data.0.id');

    expect($token)->toBeString()->not->toBeEmpty();
    expect($workspaceId)->not->toBeNull();

    $this->withToken($token)
        ->getJson('/api/v1/auth/user')
        ->assertOk()
        ->assertJsonPath('data.email', 'grace@example.com');

    $this->withToken($token)
        ->postJson('/api/v1/auth/logout')
        ->assertOk();

    $user = User::query()->where('email', 'grace@example.com')->firstOrFail();
    expect($user->tokens()->count())->toBe(0);
});

it('reports google auth as disabled when credentials are missing', function () {
    config([
        'services.google.client_id' => null,
        'services.google.client_secret' => null,
    ]);

    $this->getJson('/api/v1/auth/google')
        ->assertOk()
        ->assertJsonPath('data.enabled', false);

    $this->getJson('/api/v1/auth/google/redirect')
        ->assertStatus(422);
});
