<?php

namespace Database\Seeders;

use App\Enums\IncidentPriority;
use App\Enums\IncidentStatus;
use App\Models\Incident;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class IncidentDiagnosticSeeder extends Seeder
{
    public function run(): void
    {
        $this->createOnce('[DIAGNOSTICO-5.1] Resuelta sin log', IncidentStatus::Resolved, function (Incident $incident): void {
            // No status log is intentional: no historical resolution date/action is fabricated.
        });

        $this->createOnce('[DIAGNOSTICO-5.1] Estado distinto del último log', IncidentStatus::Blocked, function (Incident $incident): void {
            $incident->logs()->create(['action' => 'status_changed', 'old_value' => IncidentStatus::Open->value,
                'new_value' => IncidentStatus::InReview->value, 'user_name' => config('incident.actor_name')]);
        });

        $this->createOnce('[DIAGNOSTICO-5.1] Log duplicado', IncidentStatus::InReview, function (Incident $incident): void {
            $date = Carbon::parse('2026-11-01 12:00:00');
            foreach ([1, 2] as $_) {
                $incident->logs()->create(['action' => 'status_changed', 'old_value' => IncidentStatus::Open->value,
                    'new_value' => IncidentStatus::InReview->value, 'user_name' => config('incident.actor_name'), 'created_at' => $date]);
            }
        });
    }

    private function createOnce(string $title, IncidentStatus $status, callable $seedLogs): void
    {
        if (Incident::query()->where('title', $title)->exists()) {
            return;
        }

        $incident = Incident::create(['title' => $title, 'description' => 'Escenario aislado para el diagnóstico del bloque 5.1.',
            'status' => $status, 'priority' => IncidentPriority::Medium, 'requester_name' => 'Escenario de diagnóstico']);
        $seedLogs($incident);
    }
}
