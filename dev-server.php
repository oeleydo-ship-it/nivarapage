<?php

/**
 * Windows-safe router for the PHP built-in server.
 * Laravel's default server.php logs to php://stdout, which can emit notices on
 * Windows and corrupt JSON API responses consumed by the Next.js renderer.
 *
 * Start from the repository root:
 *   php -d display_errors=0 -S 127.0.0.1:8000 -t public dev-server.php
 */

$publicPath = __DIR__.'/public';

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? ''
);

if ($uri !== '/' && file_exists($publicPath.$uri)) {
    return false;
}

require_once $publicPath.'/index.php';
