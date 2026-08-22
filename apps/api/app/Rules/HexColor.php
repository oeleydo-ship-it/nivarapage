<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Accepts a CSS hex colour in #rgb, #rrggbb or #rrggbbaa form.
 *
 * The widget palette is injected straight into inline styles, so anything that
 * is not a plain hex value is rejected rather than sanitised.
 */
class HexColor implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($value === null || $value === '') {
            return;
        }

        if (! is_string($value) || preg_match('/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/', $value) !== 1) {
            $fail('The :attribute must be a hex colour such as #2563eb.');
        }
    }
}
