<?php

namespace App\Services\Ai;

use RuntimeException;

/**
 * Thrown when the upstream provider fails. Messages are scrubbed by the
 * providers before being raised so an API key can never appear in one.
 */
class AiProviderException extends RuntimeException {}
