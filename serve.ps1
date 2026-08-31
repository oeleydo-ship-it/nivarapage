# Starts the API dev server on port 8000 (see docs/ports.md).
#
# Why this script exists instead of a plain `php artisan serve`:
# PHP on Windows derives its upload temp dir from the short-name TMP path
# (C:\Users\<USER>~1\AppData\Local\Temp), which the built-in server process cannot write
# to. Every multipart request then fails during PHP request startup and Laravel answers
# "The file failed to upload." (HTTP 422), so all media uploads break.
#
# Only `-d upload_tmp_dir=...` on the process that actually serves requests fixes it, and
# `artisan serve` spawns a separate `php -S` child that inherits neither -d flags nor
# PHP_INI_SCAN_DIR. So we start the built-in server (with Laravel's router script)
# directly, which is what `artisan serve` does under the hood.
$ErrorActionPreference = 'Stop'

$tmp = Join-Path $PSScriptRoot 'storage/tmp'
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$uploads = (Resolve-Path $tmp).Path

$router = Join-Path $PSScriptRoot 'vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php'
if (-not (Test-Path $router)) {
  throw "Laravel router script not found at $router - run composer install first."
}

$public = (Resolve-Path (Join-Path $PSScriptRoot 'public')).Path
$router = (Resolve-Path $router).Path

# Laravel's router script resolves the document root from getcwd().
Push-Location $public
try {
  Write-Host "API listening on http://127.0.0.1:8000 (upload_tmp_dir=$uploads)"
  php -d upload_tmp_dir="$uploads" -S 127.0.0.1:8000 -t "$public" "$router"
} finally {
  Pop-Location
}
