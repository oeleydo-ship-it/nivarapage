<?php

use App\Jobs\SyncCustomHostnameStatus;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new SyncCustomHostnameStatus)->everyFiveMinutes();
Schedule::command('funnels:aggregate')->everyMinute()->withoutOverlapping();
Schedule::command('funnels:retention')->dailyAt('02:30')->withoutOverlapping();
