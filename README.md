# optima-retail-incidencias

## Desarrollo local

Requiere Docker Desktop con Docker Compose. El servicio `app` incluye PHP 8.4, Composer y Node.js 24; `db` usa MySQL 8.4. Laravel instala Composer al iniciar `app` cuando falta `vendor/autoload.php`.

```sh
cp .env.example .env
docker compose build app
docker compose run --rm --no-deps app composer install
docker compose up -d
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate
docker compose exec app php artisan db:seed
```

El seeder carga cinco incidencias de ejemplo con historiales y comentarios coherentes, sin sobrescribir ejemplos ya existentes que conserve el seeder.

Abrir <http://localhost:8000>. El código se monta desde el proyecto y MySQL persiste en `mysql_data`. Para iniciar Vite cuando se integre el frontend, instalar las dependencias npm y ejecutar `npm run dev -- --host 0.0.0.0` dentro de `app`; el puerto 5173 está expuesto.

## Pruebas del backend

Las pruebas fuerzan MySQL en el servicio `db` y la base separada `optima_retail_test`, independientemente de los valores `DB_CONNECTION` y `DB_DATABASE` del entorno. Crear la base una vez y ejecutar la suite desde el contenedor:

```sh
docker compose exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS optima_retail_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; GRANT ALL PRIVILEGES ON optima_retail_test.* TO '\''$MYSQL_USER'\''@'\''%'\'';"'
docker compose exec app php artisan test
docker compose exec app ./vendor/bin/pint --test
```

Las pruebas ejecutan migraciones y limpian sus datos únicamente en `optima_retail_test`. La conexión y el nombre de base se fijan en `phpunit.xml` y antes del arranque de la aplicación de pruebas; no se necesitan credenciales nuevas ni cambiar la configuración de producción.

Detener sin borrar la base de datos:

```sh
docker compose down
```

Reconstruir la imagen:

```sh
docker compose build --no-cache app
docker compose up -d
```
