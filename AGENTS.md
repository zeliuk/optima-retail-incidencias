# Instrucciones para Codex — Panel operativo de incidencias

## Objetivo y fuentes

Construir una solución pequeña, completa, mantenible y fácil de ejecutar para la prueba técnica de Optima Retail. El PDF del enunciado define los requisitos; `docs/DECISIONS.md` documenta las decisiones propias del proyecto. No confundir propuestas con obligaciones del enunciado.

Antes de implementar un bloque, consulta este archivo y las decisiones pertinentes. Si hay contradicciones, explica el conflicto y solicita una decisión solo cuando cambie materialmente el resultado; no sustituyas silenciosamente una decisión vigente.

## Stack y alcance

- Stack previsto: PHP 8.4, Laravel 13, MySQL 8.4 LTS, Inertia 3, React 19, Tailwind CSS 4 y Node.js 24 LTS; TypeScript compatible con las dependencias instaladas. **Versiones pendientes de verificar en el entorno real**.
- Desarrollo local desde Mac y VS Code, con Docker Compose: servicios `app` y `db`, MySQL persistente. Código montado para edición local y Vite con actualización automática durante el desarrollo. La entrega debe poder ejecutarse siguiendo el README.
- Laravel limpio; integrar Inertia y React sin starter kit de autenticación. No usar Next.js.
- Acceso directo al panel, sin login, roles, selector de usuarios ni cuentas de negocio. El actor único para cambios y comentarios es `Carlos Turmo`, definido en un único punto de configuración del backend. `requester_name` y `assigned_to` son datos independientes del actor.
- No añadir notificaciones, integraciones, despliegue ni capas arquitectónicas que no aporten valor al alcance.

## Convenciones de implementación

- Respetar las convenciones nativas de Laravel, Inertia y React antes que crear estructuras propias. Preferir controladores concisos, Form Requests para validaciones y servicios/clases de acción solo cuando encapsulen reglas de negocio o transacciones relevantes.
- Centralizar los estados de incidencia y las transiciones permitidas en backend; nunca confiar en una validación exclusiva de React. Reglas vigentes: `abierta → en revisión`, `en revisión → bloqueada`, `en revisión → resuelta`, `bloqueada → en revisión`. `resuelta` es final. Rechazar todas las demás transiciones.
- Al cambiar estados, actualizar la incidencia y registrar su log en una misma transacción. Registrar actor, fecha, valor anterior y nuevo; preservar la trazabilidad. Evitar logs históricos inventados.
- Modelar las tres tablas de negocio exigidas (`incidents`, `incident_logs`, `incident_comments`) con claves foráneas e índices razonables. Mantener la solución simple, con Eloquent para operaciones habituales.
- En frontend, separar páginas Inertia de componentes reutilizables cuando reduzca la complejidad. Usar TypeScript de forma consistente, props tipadas y estado local salvo necesidad justificada. Evitar componentes gigantes, estado global innecesario y CSS disperso.
- Diseñar una interfaz responsive y usable, con filtros y errores visibles. Priorizar semántica HTML y accesibilidad básica. El estilo corporativo se contrastará con la web oficial antes de fijar logo, paleta o tipografía; no inventar activos de marca.
- Escribir nombres de clases, métodos, variables y rutas de código en inglés; textos de interfaz y documentación en español. Comentar decisiones no evidentes, no describir línea por línea el código obvio.
- Probar especialmente validaciones, transiciones, atomicidad de estado + log y diagnóstico de inconsistencias. No crear una batería extensa sin justificación.

## Forma de trabajo

1. Implementar **solo el bloque solicitado** y no anticipar bloques posteriores.
2. Antes de añadir una dependencia, servicio, archivo estructural o abstracción, comprobar que responde a una necesidad real.
3. Ejecutar las comprobaciones que permita el entorno. Comunicar resultados reales, comandos ejecutados y limitaciones; no dar por probado algo que no se ha ejecutado.
4. Al terminar, resumir archivos afectados, decisiones tomadas, pruebas realizadas, errores pendientes y siguientes riesgos. Detenerse para revisión humana.
5. No hacer `git commit`, `git push`, cambios destructivos ni reescrituras de historial sin autorización explícita. El desarrollador revisará diferencias y confirmará cada bloque con commits pequeños y descriptivos en castellano.
6. Mantener `docs/DECISIONS.md` alineado con decisiones **efectivamente cerradas**. Mantener `ai-process/README.md` fiel al proceso real: prompts principales, asistencia recibida, revisión humana y errores detectados. No inventar resultados ni incidencias.
7. Preparar el README de ejecución a medida que los comandos se verifiquen; no documentar comandos hipotéticos como probados.

## Entrega de cada bloque

Informe breve con: archivos creados/modificados; decisiones no triviales; versiones si aplica; verificaciones aprobadas/fallidas/no ejecutadas; cuestiones pendientes; comandos para reproducir lo comprobado. No avanzar por iniciativa propia.
