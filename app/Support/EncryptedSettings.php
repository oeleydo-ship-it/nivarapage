<?php

namespace App\Support;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Model;

/**
 * Reads a column with an `encrypted` cast without letting a key change take the
 * rest of the configuration down with it.
 *
 * APP_KEY being rotated - or restored one character wrong - makes every
 * encrypted settings column throw the moment it is read. Those reads happen
 * while the application boots, where the throw was caught as "the database is
 * unavailable" and cached, so a single unreadable token silently blanked the
 * Cloudflare *and* mail configuration for every request that followed. The
 * operator then saw a Cloudflare routing error about an invalid object
 * identifier, which points nowhere near the real problem.
 *
 * An unreadable secret is treated as "not set", so everything stored beside it
 * in plain text - the zone id, the fallback origin, the SMTP host - keeps
 * working, and the admin screen can say plainly that the secret needs entering
 * again.
 */
final class EncryptedSettings
{
    /**
     * The decrypted value, or null when it is absent or no longer readable.
     */
    public static function read(Model $row, string $attribute): ?string
    {
        try {
            $value = $row->getAttribute($attribute);
        } catch (DecryptException) {
            return null;
        }

        return is_string($value) && $value !== '' ? $value : null;
    }

    /**
     * True only when something is stored but cannot be decrypted.
     *
     * This is what separates "nobody has entered a token yet" from "the token
     * is there but this APP_KEY cannot open it" - the same empty value, but
     * very different instructions for whoever has to fix it.
     */
    public static function unreadable(Model $row, string $attribute): bool
    {
        if (blank($row->getRawOriginal($attribute))) {
            return false;
        }

        try {
            $row->getAttribute($attribute);
        } catch (DecryptException) {
            return true;
        }

        return false;
    }

    /**
     * Clears columns whose ciphertext the current key cannot open.
     *
     * Reading defensively is not enough to repair one of these rows. Eloquent
     * decides whether an attribute changed by decrypting the stored value and
     * comparing it - originalIsEquivalent() inside getDirty() - so save()
     * throws on a row still holding ciphertext from a previous APP_KEY, and it
     * throws before the replacement is ever written. The column cannot be
     * overwritten through the model at all, which leaves the admin screen
     * unable to fix the very thing it is for.
     *
     * So drop the dead value with a query that goes under the cast, and resync
     * the model so the dirty check has nothing left to decrypt. Nothing is lost
     * that was not already unreadable.
     */
    public static function discardUnreadable(Model $row, string ...$attributes): void
    {
        $stale = array_values(array_filter($attributes, fn (string $key) => self::unreadable($row, $key)));

        if ($stale === [] || $row->getKey() === null) {
            return;
        }

        $row->newQuery()->whereKey($row->getKey())->update(array_fill_keys($stale, null));

        $raw = $row->getRawOriginal();
        $raw = is_array($raw) ? $raw : [];
        foreach ($stale as $attribute) {
            $raw[$attribute] = null;
        }

        $row->setRawAttributes($raw, true);
    }
}
