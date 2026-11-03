# Panel operativo de incidencias — Optima Retail

Aplicación web para registrar incidencias operativas, filtrarlas por estado y prioridad, añadir comentarios y consultar su historial. Los cambios de estado se validan en Laravel y quedan registrados junto con el actor y la fecha.

## Stack y requisitos

Versiones comprobadas en los contenedores del proyecto:

| Tecnología | Versión |
| --- | --- |
| PHP | 8.4.27 |
| Laravel | 13.39.0 |
| Composer | 2.11.1 |
| Node.js | 24.22.2 |
| npm | 11.19.1 |
| MySQL | 8.4.13 |
| Inertia Laravel / React | 3.7.0 / 3.11.0 |
| React | 19.3.1 |
| Tailwind CSS | 4.3.3 |
| TypeScript | 5.9.3 |
| Vite | 8.3.5 |

Se necesita Docker Desktop con Docker Compose y Git. PHP, Composer, Node.js, npm y MySQL se ejecutan dentro de Docker; no hace falta instalarlos en el equipo anfitrión. La aplicación usa dos servicios: `app` y `db`.

## Instalación desde un clon

Ejecutar desde la raíz del repositorio:

```sh
cp .env.example .env
docker compose build app
docker compose up -d
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate
docker compose exec app php artisan db:seed
docker compose exec app npm ci
docker compose exec app npm run build
```

Al iniciar `app`, Compose espera a MySQL y el contenedor instala las dependencias Composer con `composer install` si no existe `vendor/autoload.php`. Las dependencias npm no se instalan automáticamente: `npm ci` las instala desde `package-lock.json`. Los directorios `vendor` y `node_modules`, y el manifiesto compilado, se generan localmente y no forman parte del repositorio.

El seeder normal carga cinco incidencias de ejemplo con comentarios e historiales coherentes. Es idempotente para los ejemplos que reconoce y no prepara datos inconsistentes. La base MySQL se guarda en el volumen `mysql_data`.

Abrir <http://localhost:8000>.

## Desarrollo y pruebas

Para trabajar con actualización automática del frontend, ejecutar Vite en una terminal:

```sh
docker compose exec app npm run dev -- --host 0.0.0.0
```

Los comandos de comprobación se ejecutan dentro del servicio `app`:

```sh
docker compose exec app npm run build
docker compose exec app npx tsc --noEmit
docker compose exec app ./vendor/bin/pint --test
```

Las pruebas usan MySQL y fuerzan la base separada `optima_retail_test` desde `phpunit.xml`. Crear esa base y conceder acceso al usuario de la aplicación una vez:

```sh
docker compose exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS optima_retail_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; GRANT ALL PRIVILEGES ON optima_retail_test.* TO '\''$MYSQL_USER'\''@'\''%'\'';"'
docker compose exec app php artisan test
```

La suite ejecuta migraciones y limpia sus datos en `optima_retail_test`; no uses ese nombre para la base de desarrollo. Ejecuta build y tests secuencialmente: ambos pueden interactuar con `public/build/manifest.json` y correrlos a la vez puede interferir.

Detener los servicios sin borrar la base de datos:

```sh
docker compose down
```

## Diagnóstico de inconsistencias

El comando inspecciona las incidencias y sus logs de acción `status_changed`. Eloquent carga los logs ordenados por fecha y después por ID; compara el estado actual con el último destino registrado, comprueba valores de estado y continuidad entre transiciones, y busca logs con coincidencia exacta en transición, actor y fecha. Una coincidencia puede señalar duplicidad, pero no prueba que un registro sea eliminable.

Para preparar los datos intencionadamente inconsistentes y ejecutar el informe:

```sh
docker compose exec -T app php artisan db:seed --class='Database\Seeders\IncidentDiagnosticSeeder'
docker compose exec -T app php artisan incidents:diagnose-consistency
```

**El seeder de diagnóstico altera datos** y solo debe ejecutarse en una base de prueba o demostración. El comando de diagnóstico es exclusivamente de lectura: funciona como previsualización, no necesita `--dry-run` y no tiene opción `--apply`.

Los tres escenarios buscados son:

1. Incidencia en estado `resuelta` sin log que registre la resolución.
2. Estado actual distinto del destino del último log de estado.
3. Log duplicado o secuencia incoherente. Una misma incidencia puede activar ambas alertas (`duplicate_status_logs` e `incoherent_status_log`); en la ejecución registrada se obtuvieron cuatro alertas para tres incidencias.

Los identificadores concretos dependen de los datos y pueden cambiar entre bases. El diagnóstico no repara automáticamente: faltan pruebas para reconstruir eventos históricos, una discrepancia no indica por sí sola qué valor es correcto, logs similares no demuestran que uno sobre y no existe un identificador de evento o petición que confirme el origen de un duplicado.

Para corregir manualmente, identificar los registros afectados, contrastarlos con una fuente fiable, preparar una intervención controlada que preserve la trazabilidad y repetir el diagnóstico. No borrar ni reescribir logs basándose solo en la alerta.

## Decisiones técnicas principales

- Laravel sirve las páginas mediante Inertia + React; no hay una API independiente.
- Docker Compose agrupa aplicación y MySQL, con volumen persistente para la base de datos.
- No hay autenticación: el actor único está centralizado en configuración Laravel.
- Laravel valida las transiciones permitidas; el cambio y su registro en `incident_logs` se realizan bajo transacción y bloqueo de fila.
- El diagnóstico de inconsistencias es conservador y de solo lectura.

Las decisiones y el alcance completos están en [`docs/DECISIONS.md`](docs/DECISIONS.md); el proceso de asistencia de IA se registra en [`ai-process/README.md`](ai-process/README.md).
