# Decisiones técnicas — Panel operativo de incidencias

Este documento recoge **decisiones propias del proyecto**, no requisitos adicionales del enunciado. El bloque 1 (inicialización de Laravel y Docker) está implementado y verificado; los bloques funcionales posteriores siguen pendientes. El PDF de la prueba es la referencia para los requisitos obligatorios.

## 1. Alcance y arquitectura

- **Aplicación:** panel operativo de incidencias, con listado y filtros, alta, cambios de estado, historial y comentarios. Una pantalla principal y el detalle necesario; evitar pantallas y servicios superfluos.
- **Backend:** Laravel con Eloquent y validaciones del servidor. Se favorecerán convenciones del framework, sin patrón repositorio ni capas artificiales. Extraer lógica a clases específicas cuando mejore claridad o garantice una operación atómica.
- **Frontend:** Inertia + React + TypeScript, sin SPA/API independiente ni Next.js. Componentes pequeños y estado local; Inertia se encargará del intercambio de datos y navegación entre frontend y Laravel.
- **Acceso y actor:** sin autenticación, roles ni selector de usuarios. Actor único `Carlos Turmo`, definido una vez en configuración Laravel y aplicado por el backend a logs y comentarios. Cabecera: `Carlos Turmo · Demo`. El solicitante y el responsable de cada incidencia son campos de texto independientes; `assigned_to` es opcional.

## 2. Tecnologías y desarrollo local

Versiones comprobadas en el contenedor durante el bloque inicial (2 de noviembre de 2026):

| Tecnología | Versión comprobada |
| --- | --- |
| PHP | 8.4.27 |
| Laravel | 13.39.0 |
| MySQL | 8.4.13 |
| Composer | 2.11.1 |
| Node.js | 24.22.2 LTS |
| npm | 11.19.1 |

Tecnologías previstas para integrar el frontend; **todavía no instaladas ni verificadas**:

| Tecnología | Versión prevista |
| --- | --- |
| Inertia | 3 |
| React | 19 |
| Tailwind CSS | 4 |
| TypeScript | Compatible con las dependencias que se instalen |

- Laravel limpio, sin starter kit de autenticación.
- Docker Compose con **dos servicios**, aplicación y base de datos; persistencia MySQL en `mysql_data`, código montado desde el Mac y PHP servido por `artisan serve`. El contenedor espera a MySQL antes de servir Laravel. Vite queda preparado con el puerto 5173 expuesto y `host: 0.0.0.0`; HMR aún no se ha verificado.
- El uso de Docker es una elección nuestra: el PDF no lo exige.
- Diseño limpio, responsive y próximo a la identidad de Optima Retail. Verificar en `https://optimaretail.eu/` los activos y referencias visuales antes de adoptar logos, colores o tipografías. No afirmar que la identidad ya se ha comprobado.

## 3. Datos y reglas de negocio

Tablas mínimas del enunciado:

- `incidents`: `id`, `title`, `description`, `status`, `priority`, `requester_name`, `assigned_to`, `created_at`, `updated_at`.
- `incident_logs`: `id`, `incident_id`, `action`, `old_value`, `new_value`, `user_name`, `metadata`, `created_at`.
- `incident_comments`: `id`, `incident_id`, `author_name`, `body`, `created_at`, `updated_at`.

Crear claves foráneas para logs y comentarios, e índices razonables para búsquedas por estado, prioridad y fecha. Centralizar estados (preferentemente mediante enum PHP); resolver sus valores persistidos al implementar el modelo, sin dispersar strings mágicos.

### Transiciones admitidas

| Desde | Hacia |
| --- | --- |
| Abierta | En revisión |
| En revisión | Bloqueada |
| En revisión | Resuelta |
| Bloqueada | En revisión |

`Resuelta` es estado final: **no habrá reapertura** en esta entrega. Cualquier transición no incluida se rechazará en backend. La actualización del estado y el registro del log deben ser atómicos; conservar estado anterior, nuevo estado, actor y fecha. La transición a bloqueada o resuelta requerirá confirmación en UI.

## 4. Experiencia de uso

- Pantalla principal: cabecera y descripción, listado con prioridad, estado, fecha y solicitante/responsable, formulario de creación y acción visible de cambio de estado.
- Filtros por estado, prioridad y texto libre; filtro de estado sin recarga completa mediante Inertia.
- Contadores por estado y confirmación antes de bloquear o resolver. Son las mejoras de interacción escogidas para cumplir el mínimo del ejercicio; no ampliar el frontend sin necesidad.
- Historial de cambios y comentarios accesibles por incidencia; validaciones y errores claros.

## 5. Diagnóstico de inconsistencias

Preparar datos reproducibles que incluyan los tres casos del enunciado:

1. **Incidencia resuelta sin log de resolución:** detectar y enviar a revisión manual. No inventar la fecha ni la acción histórica.
2. **Estado actual distinto del último log de estado:** detectar y enviar a revisión manual. No asumir qué dato prevalece.
3. **Log duplicado o incoherente:** detectar; solo permitir una reparación controlada si el duplicado es inequívoco y se conserva evidencia de la corrección.

Implementar comando Artisan de diagnóstico con **dry-run por defecto** y modo explícito de corrección para casos seguros. Describir la consulta SQL o Eloquent y por qué detecta cada anomalía. Definir el mecanismo concreto de reparación y preservación de evidencia cuando se implemente, no antes.

## 6. Calidad, documentación y Git

- Pruebas enfocadas en reglas críticas, no suite extensa.
- README técnico, breve y reproducible: requisitos, instalación, migración, datos de ejemplo, ejecución, diagnóstico y pruebas. `.env.example` sin secretos.
- `ai-process/README.md` como registro conciso y **veraz** de asistencia de IA, decisiones manuales y errores reales.
- Trabajo por bloques en `main`, con revisión y pruebas antes de cada commit. Commits manuales, pequeños, cronológicos y descriptivos en castellano. Codex no hace commits automáticos.

## 7. Pendiente de validar

- Configuración definitiva de Vite/React al integrar el frontend.
- Valores persistidos para estados y prioridades y estructura exacta de servicios/clases.
- Identidad visual tras consultar la web oficial.
- Procedimiento preciso para corregir duplicados preservando evidencia.

Registrar aquí únicamente decisiones cerradas o cambios justificados durante la implementación. Mantener separado lo planeado de lo ejecutado.
