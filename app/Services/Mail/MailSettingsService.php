<?php

namespace App\Services\Mail;

use App\Models\MailSetting;
use App\Support\EncryptedSettings;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Platform-wide outbound mail configuration.
 *
 * Values may live in the encrypted DB row or fall back to the MAIL_* env vars,
 * so an operator can either configure SMTP from the admin UI or keep managing
 * it through deployment config. The password is never returned.
 */
class MailSettingsService
{
    public const TRANSPORTS = ['smtp', 'log', 'array'];

    public const ENCRYPTIONS = ['tls', 'ssl', 'none'];

    /**
     * Config key holding a snapshot of the deployment's own mail config, taken
     * before apply() overwrites it.
     *
     * Without this, apply() writes the resolved password into
     * `mail.mailers.smtp.password` - the very key config() reads as the env
     * fallback - so clearing the stored password would fall back to the value
     * we had just applied instead of to the environment.
     */
    private const SNAPSHOT = 'uidesired.mail_env';

    public function settings(): MailSetting
    {
        return MailSetting::current();
    }

    /** Records the deployment's mail config. Safe to call more than once. */
    public function snapshotEnvironment(): void
    {
        if (Config::has(self::SNAPSHOT)) {
            return;
        }

        Config::set(self::SNAPSHOT, [
            'default' => config('mail.default'),
            'host' => config('mail.mailers.smtp.host'),
            'port' => config('mail.mailers.smtp.port'),
            'username' => config('mail.mailers.smtp.username'),
            'password' => config('mail.mailers.smtp.password'),
            'scheme' => config('mail.mailers.smtp.scheme'),
            'encryption' => config('mail.mailers.smtp.encryption'),
            'from_address' => config('mail.from.address'),
            'from_name' => config('mail.from.name'),
        ]);
    }

    /** The deployment's own value for a mail setting, ignoring anything we applied. */
    private function env(string $key): mixed
    {
        $this->snapshotEnvironment();

        return config(self::SNAPSHOT.'.'.$key);
    }

    /**
     * Resolved configuration: DB value first, env second.
     *
     * @return array<string, mixed>
     */
    public function config(): array
    {
        $row = $this->settings();
        $transport = in_array($row->transport, self::TRANSPORTS, true)
            ? $row->transport
            : (string) config('mail.default', 'log');

        $envScheme = (string) ($this->env('scheme') ?: '');
        $encryption = $row->encryption ?: ($envScheme === 'smtps' ? 'ssl' : $envScheme) ?: (string) ($this->env('encryption') ?: '');
        $encryption = in_array($encryption, ['tls', 'ssl'], true) ? $encryption : 'none';

        $envPassword = $this->env('password');

        return [
            'transport' => $transport,
            'host' => $this->first($row->host, $this->env('host')),
            'port' => (int) ($row->port ?: $this->env('port') ?: 587),
            'encryption' => $encryption,
            'username' => $this->first($row->username, $this->env('username')),
            'password' => $this->first(EncryptedSettings::read($row, 'password'), $envPassword),
            'from_address' => $this->first($row->from_address, $this->env('from_address')),
            'from_name' => $this->first($row->from_name, $this->env('from_name')),
            'timeout' => (int) ($row->timeout ?: 10),
            'password_source' => filled(EncryptedSettings::read($row, 'password')) ? 'database' : (filled($envPassword) ? 'env' : 'none'),
        ];
    }

    /**
     * Everything the admin UI needs, with no secret in it.
     *
     * @return array<string, mixed>
     */
    public function status(): array
    {
        $row = $this->settings();
        $config = $this->config();
        $configured = $config['transport'] !== 'smtp'
            || (filled($config['host']) && filled($config['from_address']));

        return [
            'transport' => $config['transport'],
            'host' => $config['host'],
            'port' => $config['port'],
            'encryption' => $config['encryption'],
            'username' => $config['username'],
            'from_address' => $config['from_address'],
            'from_name' => $config['from_name'],
            'timeout' => $config['timeout'],
            'password_set' => $config['password_source'] !== 'none',
            'password_source' => $config['password_source'],
            'configured' => $configured,
            'last_tested_at' => $row->last_tested_at,
            'last_test_status' => $row->last_test_status,
            'last_test_message' => $row->last_test_message,
        ];
    }

    /**
     * Omitting `password` keeps the stored one; sending "" clears it so the
     * env value takes over again.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(array $data): MailSetting
    {
        $row = $this->settings();
        // See CloudflareSettingsService::update(): a password encrypted under a
        // previous key blocks its own replacement.
        EncryptedSettings::discardUnreadable($row, 'password');
        $fields = ['transport', 'host', 'port', 'encryption', 'username', 'from_address', 'from_name', 'timeout'];

        foreach ($fields as $field) {
            if (array_key_exists($field, $data)) {
                $row->{$field} = $data[$field] === '' ? null : $data[$field];
            }
        }

        if (array_key_exists('password', $data)) {
            $row->password = $data['password'] === '' || $data['password'] === null ? null : $data['password'];
        }

        $row->save();
        $this->apply();

        return $row->fresh();
    }

    /**
     * Pushes the resolved settings into the runtime mail config.
     *
     * Called from the service provider so web requests and queue workers both
     * send through whatever the admin last saved.
     */
    public function apply(): void
    {
        $this->snapshotEnvironment();
        $config = $this->config();
        if ($config['transport'] !== 'smtp') {
            Config::set('mail.default', $config['transport']);

            return;
        }

        if (blank($config['host'])) {
            // Nothing usable stored and no env host: leave the framework
            // default alone rather than pointing SMTP at nowhere.
            return;
        }

        // The transport column defaults to smtp, so a fresh deployment claims
        // SMTP before an administrator has entered anything - and config/mail.php
        // fills the host in with its 127.0.0.1 placeholder, so the guard above
        // reads that as configured. Sending then throws a TransportException
        // that takes the whole request with it, and registration is the first
        // thing a new deployment does. Until a host is actually stored, honour
        // the mailer the deployment itself chose.
        if (blank($this->settings()->host) && (string) $this->env('default') !== 'smtp') {
            return;
        }

        Config::set('mail.default', 'smtp');
        Config::set('mail.mailers.smtp.transport', 'smtp');
        Config::set('mail.mailers.smtp.host', $config['host']);
        Config::set('mail.mailers.smtp.port', $config['port']);
        Config::set('mail.mailers.smtp.username', $config['username']);
        Config::set('mail.mailers.smtp.password', $config['password']);
        Config::set('mail.mailers.smtp.timeout', $config['timeout']);

        // Laravel 11+ reads `scheme`; older keys are set too so a stale config
        // cache cannot silently downgrade the connection.
        $scheme = $config['encryption'] === 'none' ? null : $config['encryption'];
        Config::set('mail.mailers.smtp.scheme', $scheme === 'ssl' ? 'smtps' : ($scheme === 'tls' ? 'smtp' : null));
        Config::set('mail.mailers.smtp.encryption', $scheme);

        if (filled($config['from_address'])) {
            Config::set('mail.from.address', $config['from_address']);
        }
        if (filled($config['from_name'])) {
            Config::set('mail.from.name', $config['from_name']);
        }
    }

    /**
     * Sends a real message so the operator finds out now rather than when a
     * customer fails to get a password reset.
     *
     * @return array{ok: bool, message: string}
     */
    public function sendTest(string $to): array
    {
        $this->apply();
        $config = $this->config();

        if ($config['transport'] === 'smtp' && blank($config['host'])) {
            return $this->record(false, 'No SMTP host is configured.');
        }
        if (blank($config['from_address'])) {
            return $this->record(false, 'Set a "from" address before sending a test.');
        }

        try {
            Mail::mailer($config['transport'])->raw(
                'This is a test message from your platform. If you can read it, outbound mail is working.',
                function ($message) use ($to, $config): void {
                    $message->to($to)
                        ->subject('Test message from '.(string) config('app.name', 'the platform'))
                        ->from($config['from_address'], $config['from_name'] ?: null);
                },
            );
        } catch (Throwable $e) {
            return $this->record(false, $this->readable($e));
        }

        return $this->record(true, 'Test message sent to '.$to.'.');
    }

    /**
     * @return array{ok: bool, message: string}
     */
    private function record(bool $ok, string $message): array
    {
        $this->settings()->forceFill([
            'last_tested_at' => now(),
            'last_test_status' => $ok ? 'ok' : 'failed',
            'last_test_message' => mb_substr($message, 0, 500),
        ])->save();

        return ['ok' => $ok, 'message' => $message];
    }

    /** Trims the driver's stack-trace noise down to the useful sentence. */
    private function readable(Throwable $e): string
    {
        $message = trim($e->getMessage());
        $firstLine = trim(explode("\n", $message)[0]);

        return $firstLine !== '' ? $firstLine : $e::class;
    }

    private function first(mixed ...$values): ?string
    {
        foreach ($values as $value) {
            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }
        }

        return null;
    }
}
