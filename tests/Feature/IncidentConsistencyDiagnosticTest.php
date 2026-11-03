<?php

namespace Tests\Feature;

use App\Enums\IncidentPriority;
use App\Enums\IncidentStatus;
use App\Models\Incident;
use App\Models\IncidentLog;
use App\Services\IncidentConsistencyDiagnostician;
use Database\Seeders\IncidentDiagnosticSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class IncidentConsistencyDiagnosticTest extends TestCase
{
    use RefreshDatabase;

    public function test_explicit_diagnostic_seeder_creates_three_stable_idempotent_scenarios(): void
    {
        $this->seed(IncidentDiagnosticSeeder::class);
        $firstIncidentCount = Incident::count();
        $firstLogCount = IncidentLog::count();
        $this->seed(IncidentDiagnosticSeeder::class);

        $this->assertSame(3, $firstIncidentCount);
        $this->assertSame(3, Incident::count());
        $this->assertSame($firstLogCount, IncidentLog::count());
        $this->assertSame(3, Incident::where('title', 'like', '[DIAGNOSTICO-5.1]%')->count());
    }

    public function test_diagnosis_detects_three_required_cases_and_ignores_coherent_records_and_other_actions(): void
    {
        $this->seed(IncidentDiagnosticSeeder::class);
        $coherent = $this->incident('Coherente', IncidentStatus::InReview);
        $coherent->logs()->create(['action' => 'created', 'new_value' => 'abierta', 'user_name' => 'Carlos']);
        $coherent->logs()->create(['action' => 'commented', 'old_value' => null, 'new_value' => 'texto', 'user_name' => 'Carlos']);
        $coherent->logs()->create(['action' => 'status_changed', 'old_value' => 'abierta', 'new_value' => 'en_revision', 'user_name' => 'Carlos']);

        $alerts = app(IncidentConsistencyDiagnostician::class)->diagnose();
        $this->assertSame([
            'resolved_without_resolution_log',
            'current_status_differs_from_last_log',
            'incoherent_status_log',
            'duplicate_status_logs',
        ], $alerts->pluck('type')->all());
        $this->assertSame('[DIAGNOSTICO-5.1] Resuelta sin log', $alerts[0]['title']);
        $this->assertSame('[DIAGNOSTICO-5.1] Estado distinto del último log', $alerts[1]['title']);
        $this->assertSame('[DIAGNOSTICO-5.1] Log duplicado', $alerts[2]['title']);
        $this->assertSame('[DIAGNOSTICO-5.1] Log duplicado', $alerts[3]['title']);
        $this->assertSame(2, count($alerts[3]['log_ids']));
        $this->assertTrue(collect($alerts)->every(fn (array $alert) => $alert['requires_manual_review']));
        $this->assertSame('en_revision', $alerts[1]['evidence']['last_log_new_value']);
        $this->assertSame(['action', 'old_value', 'new_value', 'user_name', 'created_at'],
            array_keys($alerts[3]['evidence']['matching_fields']));
        $this->assertStringContainsString('no prueban', $alerts[3]['reason']);
        $this->assertFalse($alerts->contains(fn (array $alert) => $alert['incident_id'] === $coherent->id));
    }

    public function test_command_is_read_only_reports_records_and_orders_equal_time_logs_by_id(): void
    {
        $incident = $this->incident('Orden determinista', IncidentStatus::InReview);
        $date = Carbon::parse('2026-10-20 10:00:00');
        $first = $incident->logs()->create(['action' => 'status_changed', 'old_value' => 'abierta', 'new_value' => 'en_revision',
            'user_name' => 'Carlos', 'created_at' => $date]);
        $second = $incident->logs()->create(['action' => 'status_changed', 'old_value' => 'abierta', 'new_value' => 'en_revision',
            'user_name' => 'Carlos', 'created_at' => $date]);
        $duplicateAlert = app(IncidentConsistencyDiagnostician::class)->diagnose()
            ->firstWhere('type', 'duplicate_status_logs');
        $this->assertSame([$first->id, $second->id], $duplicateAlert['log_ids']);
        $before = DB::table('incidents')->orderBy('id')->get()->toJson().DB::table('incident_logs')->orderBy('id')->get()->toJson();

        $this->artisan('incidents:diagnose-consistency')
            ->expectsOutputToContain("[duplicate_status_logs] Incidencia #{$incident->id}")
            ->expectsOutputToContain('Acción propuesta: Comparar con una fuente externa de auditoría')
            ->expectsOutputToContain('Revisión manual: sí. No se modifican datos.')
            ->expectsOutputToContain('Resumen: 2 alerta(s); 0 correcciones automáticas.')
            ->assertExitCode(0);

        $after = DB::table('incidents')->orderBy('id')->get()->toJson().DB::table('incident_logs')->orderBy('id')->get()->toJson();
        $this->assertSame($before, $after);
    }

    private function incident(string $title, IncidentStatus $status): Incident
    {
        return Incident::create(['title' => $title, 'description' => 'Descripción', 'status' => $status,
            'priority' => IncidentPriority::Medium, 'requester_name' => 'Ana']);
    }
}
