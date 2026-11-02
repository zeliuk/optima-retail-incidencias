# Uso de IA en la prueba técnica

Este registro describe el uso **real** de IA durante el trabajo. Se completará por bloques tras revisar los resultados. No se consignarán errores ni validaciones no observados.

## Herramientas

- **ChatGPT:** análisis del enunciado, delimitación del alcance y decisiones de arquitectura iniciales; preparación de instrucciones para Codex.
- **Codex:** asistió en la inicialización de Laravel y Docker y en las correcciones documentales de este bloque.

## Consultas y decisiones iniciales

- Se contrastó la necesidad de autenticación con el PDF y se descartaron el login, las cuentas demo, los roles y el selector de usuarios. Se acordó un actor único en configuración de backend, independiente de solicitante y responsable.
- Se propuso el stack PHP 8.4, Laravel 13, MySQL 8.4 LTS, Inertia 3, React 19, Tailwind 4 y Node.js 24 LTS. Se aceptó como punto de partida **sujeto a validación técnica**, no como entorno ya probado.
- Se acordó desarrollo por bloques, Docker Compose de dos servicios, validación en backend de transiciones, trazabilidad transaccional y diagnóstico conservador de inconsistencias.
- Se redactaron instrucciones persistentes (`AGENTS.md`) y decisiones técnicas (`docs/DECISIONS.md`) con asistencia de ChatGPT. Revisión humana pendiente antes de incorporarlas al repositorio.

## Registro de implementación

_Añadir una entrada breve por bloque completado, cuando realmente ocurra._

| Bloque | Prompt o consulta principal | Código asistido | Revisión / decisión humana | Errores observados y corrección | Verificación real |
| --- | --- | --- | --- | --- | --- |
| Inicialización Laravel + Docker | Prompt inicial del bloque 1 y seguimientos de diagnóstico, revisión y corrección documental (2-11-2026). | Codex inicializó el esqueleto Laravel 13 y Compose con `app` y `db`; no instaló Inertia ni React. | El usuario autorizó reiniciar Docker Desktop y eliminar únicamente el volumen incompleto recién creado. En la revisión posterior se señalaron inconsistencias documentales, una carrera de instalación Composer en el README y una guía CLAUDE incompatible. | PHP local 7.4 no arrancó por una dependencia ICU ausente; se usó Docker. Se corrigió una interpolación accidental en Compose. El primer arranque MySQL falló por falta de espacio, generó errores de escritura en el disco virtual y bloqueó Docker Desktop. Tras reiniciar el backend y eliminar con autorización el volumen incompleto, MySQL arrancó. La primera petición HTTP respondió 500; se resolvió generando `APP_KEY` y ejecutando las migraciones. | `docker compose config`, `docker compose build` y `docker compose up -d --build` pasaron. PHP 8.4.27, Laravel 13.39.0, Composer 2.11.1, Node 24.22.2 y npm 11.19.1 comprobados; `php artisan about`, `migrate` y `migrate:status` pasaron. MySQL 8.4.13 quedó healthy y la página respondió HTTP 200 después de inicializar la aplicación. `git diff --check` pasó en la revisión. En esta corrección documental se actualizaron el estado y las versiones previstas/comprobadas, se hizo explícito Composer antes de arrancar, se retiró CLAUDE.md por instrucciones incompatibles y `libzip-dev` por no usarse: se instala `unzip` y no se requiere `ext-zip`. |

## Criterio de registro

Resumir los prompts relevantes, no necesariamente transcribir todas las conversaciones. Diferenciar propuestas de la IA, decisiones aceptadas, cambios realizados manualmente y verificaciones efectivamente ejecutadas. Si no se detectan errores en un bloque, indicarlo sin inventarlos.
