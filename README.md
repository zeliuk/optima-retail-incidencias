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

Detener sin borrar la base de datos:

```sh
docker compose down
```

Reconstruir la imagen:

```sh
docker compose build --no-cache app
docker compose up -d
```
