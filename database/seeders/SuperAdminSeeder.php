<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\WorkspaceService;
use Illuminate\Database\Seeder;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = strtolower(trim((string) config('uidesired.super_admin.email')));
        $password = (string) config('uidesired.super_admin.password');
        $name = trim((string) config('uidesired.super_admin.name')) ?: 'Super Admin';

        if ($email === '' || $password === '') {
            return;
        }

        $user = User::query()->firstOrNew(['email' => $email]);
        $user->fill([
            'name' => $name,
            'password' => $password,
            'is_super_admin' => true,
        ]);
        if ($user->email_verified_at === null) {
            $user->email_verified_at = now();
        }
        $user->save();

        if (! $user->workspaces()->exists()) {
            app(WorkspaceService::class)->createPersonal($user, 'Admin Workspace');
        }
    }
}
