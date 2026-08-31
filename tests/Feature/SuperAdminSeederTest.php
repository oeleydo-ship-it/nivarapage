<?php

use App\Models\User;
use Database\Seeders\SuperAdminSeeder;
use Illuminate\Support\Facades\Hash;

it('seeds a super admin that can sign in', function () {
    config([
        'uidesired.super_admin.email' => 'ops@uidesired.test',
        'uidesired.super_admin.password' => 'change-me-now',
        'uidesired.super_admin.name' => 'Ops Admin',
    ]);

    $this->seed(SuperAdminSeeder::class);

    $user = User::query()->where('email', 'ops@uidesired.test')->first();
    expect($user)->not->toBeNull()
        ->and($user->is_super_admin)->toBeTrue()
        ->and($user->name)->toBe('Ops Admin')
        ->and(Hash::check('change-me-now', $user->password))->toBeTrue()
        ->and($user->workspaces()->exists())->toBeTrue();

    $this->postJson('/api/v1/auth/login', [
        'email' => 'ops@uidesired.test',
        'password' => 'change-me-now',
    ])->assertOk()->assertJsonPath('data.user.is_super_admin', true);
});
