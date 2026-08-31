<?php

namespace App\Console\Commands;

use App\Services\Diagnostics\RendererDiagnostics;
use Illuminate\Console\Command;

/**
 * Prints the renderer <-> API checks that Admin -> System Health shows, for
 * deployments where a shell is easier to reach than the dashboard.
 */
class PreviewDoctor extends Command
{
    protected $signature = 'uidesired:preview-doctor {--host= : Hostname to resolve} {--site= : Site id to mint a preview for}';

    protected $description = 'Diagnose why previews or published sites are not rendering';

    public function handle(RendererDiagnostics $diagnostics): int
    {
        $result = $diagnostics->run(
            $this->option('host') ?: null,
            $this->option('site') ? (int) $this->option('site') : null,
        );

        $this->line('');
        $this->line('  API_URL          '.$result['api_url']);
        $this->line('  RENDERER_URL     '.$result['renderer_url']);
        $this->line('  PLATFORM_DOMAIN  '.$result['platform_domain']);
        $this->line('');

        foreach ($result['checks'] as $check) {
            $this->line(sprintf(
                '  %s %-28s %s',
                $check['ok'] ? '<info>PASS</info>' : '<error>FAIL</error>',
                $check['label'],
                $check['detail'],
            ));
        }

        $this->line('');
        $result['ok'] ? $this->info($result['summary']) : $this->warn($result['summary']);

        if ($host = $this->option('host')) {
            $lookup = $diagnostics->host($host);
            $this->line('');
            $this->line('  '.$lookup['host'].' → '.($lookup['resolves'] ? 'resolves' : 'does not resolve'));
            foreach ($lookup['notes'] as $note) {
                $this->line('    - '.$note);
            }
            if ($lookup['suggestions'] !== []) {
                $this->line('    Similar active hostnames: '.implode(', ', $lookup['suggestions']));
            }
        }

        return $result['ok'] ? self::SUCCESS : self::FAILURE;
    }
}
