<?php

namespace App\Support;

/**
 * The canonical set of plan limits.
 *
 * One definition drives all three things that used to drift apart: what the
 * admin screen renders, what the API accepts, and what a plan falls back to
 * when a key was never authored. Adding a limit means adding it here, wiring
 * its usage counter in PlanLimitService, and calling assertOrFail where the
 * resource is created.
 *
 * A quota is an integer: -1 is unlimited, 0 means the plan does not include the
 * feature at all, and anything higher is a ceiling. A flag is a plain boolean
 * entitlement with no counting behind it.
 */
final class PlanLimits
{
    public const QUOTA = 'quota';

    public const FLAG = 'flag';

    /**
     * Defaults are what a plan that never mentioned a key falls back to.
     *
     * They matter more than they look. Before this existed a missing key read
     * as null and every gate denied, so one unset field locked a paying
     * workspace out of a feature it was entitled to. The limits that existed
     * before default to the free tier's values - a floor, not a lockout - and
     * the ones added later default to unlimited so that turning them on cannot
     * retroactively restrict a plan authored without them.
     *
     * @return array<string, array{type: string, label: string, group: string, default: int|bool, unit: ?string, help: string}>
     */
    public static function schema(): array
    {
        return [
            'number_of_sites' => [
                'type' => self::QUOTA, 'group' => 'Content', 'label' => 'Websites',
                'default' => 1, 'unit' => null,
                'help' => 'Websites the workspace may have at one time.',
            ],
            'pages_per_site' => [
                'type' => self::QUOTA, 'group' => 'Content', 'label' => 'Pages per website',
                'default' => 5, 'unit' => null,
                'help' => 'Counted per website, not across the workspace.',
            ],
            'blog_posts' => [
                'type' => self::QUOTA, 'group' => 'Content', 'label' => 'Blog posts',
                'default' => -1, 'unit' => null,
                'help' => 'Published and draft posts across the workspace.',
            ],
            'revision_history' => [
                'type' => self::QUOTA, 'group' => 'Content', 'label' => 'Revisions kept',
                'default' => 5, 'unit' => 'per page',
                'help' => 'Older revisions are pruned beyond this depth.',
            ],

            'custom_domains' => [
                'type' => self::QUOTA, 'group' => 'Domains', 'label' => 'Custom domains',
                'default' => 0, 'unit' => null,
                'help' => 'Customer-owned hostnames. Platform subdomains are always free.',
            ],

            'storage_mb' => [
                'type' => self::QUOTA, 'group' => 'Storage', 'label' => 'Media storage',
                'default' => 100, 'unit' => 'MB',
                'help' => 'Checked before an upload is written, not after.',
            ],

            'form_submissions' => [
                'type' => self::QUOTA, 'group' => 'Engagement', 'label' => 'Form submissions',
                'default' => 50, 'unit' => null,
                'help' => 'Lifetime total across every form in the workspace.',
            ],
            'clients' => [
                'type' => self::QUOTA, 'group' => 'Engagement', 'label' => 'CRM clients',
                'default' => -1, 'unit' => null,
                'help' => 'Client records in the workspace CRM.',
            ],
            'funnels' => [
                'type' => self::QUOTA, 'group' => 'Engagement', 'label' => 'Funnels',
                'default' => -1, 'unit' => null,
                'help' => 'Only applies where the funnels module is enabled platform-wide.',
            ],

            'team_members' => [
                'type' => self::QUOTA, 'group' => 'Team', 'label' => 'Team members',
                'default' => 1, 'unit' => null,
                'help' => 'Counts accepted members plus invitations still open.',
            ],

            'ai_generations' => [
                'type' => self::QUOTA, 'group' => 'AI', 'label' => 'AI generations',
                'default' => 0, 'unit' => 'per month',
                'help' => 'Resets on the first of the month, counted from the audit trail.',
            ],

            'premium_templates' => [
                'type' => self::FLAG, 'group' => 'Entitlements', 'label' => 'Premium templates',
                'default' => false, 'unit' => null,
                'help' => 'Allows templates marked premium to be applied.',
            ],
            'remove_branding' => [
                'type' => self::FLAG, 'group' => 'Entitlements', 'label' => 'Remove branding',
                'default' => false, 'unit' => null,
                'help' => 'Hides the platform badge on published sites.',
            ],
        ];
    }

    /** @return array<int, string> */
    public static function keys(): array
    {
        return array_keys(self::schema());
    }

    /** @return array<string, int|bool> */
    public static function defaults(): array
    {
        return array_map(fn (array $definition) => $definition['default'], self::schema());
    }

    public static function isQuota(string $key): bool
    {
        return (self::schema()[$key]['type'] ?? null) === self::QUOTA;
    }

    /**
     * Coerces a submitted set of limits into exactly the known keys.
     *
     * Unknown keys are dropped rather than rejected so that a plan authored
     * against a newer build, or one carrying a limit that has since been
     * retired, still saves instead of erroring on a field nobody can see.
     *
     * @param  array<string, mixed>  $input
     * @param  array<string, mixed>  $base  existing limits to merge over
     * @return array<string, int|bool>
     */
    public static function normalize(array $input, array $base = []): array
    {
        $merged = array_merge(self::defaults(), $base, $input);
        $out = [];

        foreach (self::schema() as $key => $definition) {
            $value = $merged[$key] ?? $definition['default'];

            if ($definition['type'] === self::FLAG) {
                $out[$key] = filter_var($value, FILTER_VALIDATE_BOOL);

                continue;
            }

            if (! is_numeric($value)) {
                $out[$key] = $definition['default'];

                continue;
            }

            // Anything below -1 is meaningless; clamp rather than reject so a
            // stray value cannot make a plan unsavable.
            $out[$key] = max(-1, (int) $value);
        }

        return $out;
    }

    /**
     * Validation rules for a `limits` payload, keyed for a nested array.
     *
     * @return array<string, array<int, mixed>>
     */
    public static function rules(string $prefix = 'limits'): array
    {
        $rules = [];

        foreach (self::schema() as $key => $definition) {
            $rules["{$prefix}.{$key}"] = $definition['type'] === self::FLAG
                ? ['sometimes', 'boolean']
                : ['sometimes', 'integer', 'min:-1', 'max:1000000000'];
        }

        return $rules;
    }
}
