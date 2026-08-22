<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_values(array_filter([
        env('FRONTEND_URL', 'http://localhost:5174'),
        env('RENDERER_URL', 'http://localhost:3100'),
        'http://localhost:5174',
        'http://app.localhost:8088',
        'http://localhost:3100',
    ])),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => ['X-Request-Id'],
    'max_age' => 0,
    'supports_credentials' => true,
];
