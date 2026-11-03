<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <link rel="icon" href="/images/favicon-optima-retail-32x32.jpg" sizes="32x32" type="image/jpeg">
        <link rel="icon" href="/images/favicon-optima-retail-192x192.jpg" sizes="192x192" type="image/jpeg">
        <link rel="apple-touch-icon" href="/images/favicon-optima-retail-180x180.jpg" sizes="180x180">
        <title inertia>Panel de incidencias | Optima Retail</title>
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body>
        @inertia
    </body>
</html>
