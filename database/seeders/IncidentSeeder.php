<?php

namespace Database\Seeders;

use App\Enums\IncidentPriority as Priority;
use App\Enums\IncidentStatus as Status;
use App\Models\Incident;
use Illuminate\Database\Seeder;

class IncidentSeeder extends Seeder
{
    public function run(): void
    {
        $records = [
            ['El terminal de caja no imprime tickets', 'La impresora de la caja 3 no responde desde la apertura.', Status::Open, Priority::High, 'Lucía Martín', 'Diego Ruiz'],
            ['Diferencia de stock en almacén', 'El recuento físico de la referencia ZK-204 no coincide con el sistema.', Status::InReview, Priority::Medium, 'Marcos Vidal', 'Elena Torres'],
            ['Fallos intermitentes en lector', 'El lector de códigos de la entrada pierde conexión durante unos segundos.', Status::Blocked, Priority::Critical, 'Nuria León', 'Pablo Gil'],
            ['Actualizar etiqueta de precio', 'La etiqueta del lineal muestra el precio anterior a la promoción.', Status::Resolved, Priority::Low, 'Sergio Cano', 'Marta Soler'],
            ['Acceso lento al panel de pedidos', 'La búsqueda de pedidos tarda más de lo habitual en cargar.', Status::InReview, Priority::High, 'Ainhoa Rey', null],
        ];

        foreach ($records as [$title, $description, $status, $priority, $requester, $assignee]) {
            // The stable example title is the natural key; existing rows are left untouched.
            if (Incident::query()->where('title', $title)->exists()) {
                continue;
            }

            $incident = Incident::create([
                'title' => $title,
                'description' => $description,
                'status' => $status,
                'priority' => $priority,
                'requester_name' => $requester,
                'assigned_to' => $assignee,
            ]);

            $incident->logs()->create([
                'action' => 'created',
                'new_value' => Status::Open->value,
                'user_name' => config('incident.actor_name'),
                'metadata' => ['priority' => $priority->value],
            ]);

            if ($status !== Status::Open) {
                $incident->logs()->create([
                    'action' => 'status_changed',
                    'old_value' => Status::Open->value,
                    'new_value' => Status::InReview->value,
                    'user_name' => config('incident.actor_name'),
                ]);
            }

            if (in_array($status, [Status::Blocked, Status::Resolved], true)) {
                $incident->logs()->create([
                    'action' => 'status_changed',
                    'old_value' => Status::InReview->value,
                    'new_value' => $status->value,
                    'user_name' => config('incident.actor_name'),
                ]);
            }

            $incident->comments()->create([
                'author_name' => config('incident.actor_name'),
                'body' => 'Caso de demostración: se está realizando el seguimiento con el equipo de tienda.',
            ]);
        }
    }
}
