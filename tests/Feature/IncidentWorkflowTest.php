<?php

namespace Tests\Feature;

use App\Enums\IncidentPriority;
use App\Enums\IncidentStatus;
use App\Models\Incident;
use App\Models\IncidentLog;
use Carbon\Carbon;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Tests\TestCase;

class IncidentWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(PreventRequestForgery::class);
    }

    public function test_feature_suite_uses_the_dedicated_mysql_database(): void
    {
        $this->assertSame('mysql', DB::connection()->getDriverName());
        $this->assertSame('optima_retail_test', DB::connection()->getDatabaseName());
    }

    public function test_incident_creation_uses_open_status_and_rejects_invalid_input(): void
    {
        $response = $this->post(route('incidents.store'), [
            'title' => 'Caja sin conexión', 'description' => 'No conecta.', 'priority' => 'alta',
            'requester_name' => 'Ana', 'assigned_to' => 'Luis', 'status' => 'resuelta',
        ]);

        $response->assertSessionHasNoErrors();
        $incident = Incident::firstOrFail();
        $this->assertSame(IncidentStatus::Open, $incident->status);
        $this->assertSame('Ana', $incident->requester_name);
        $this->assertSame('Luis', $incident->assigned_to);
        $response->assertRedirect(route('incidents.index'))
            ->assertSessionHas('success', 'Incidencia creada correctamente.');

        $this->from('/incidents')->post(route('incidents.store'), ['title' => 'Datos a conservar'])
            ->assertRedirect('/incidents')->assertSessionHasErrors([
                'description', 'priority', 'requester_name',
            ])->assertSessionHas('_old_input.title', 'Datos a conservar');
        $this->assertDatabaseCount('incidents', 1);
    }

    public function test_list_combines_filters_and_searches_title_and_description(): void
    {
        Incident::create(['title' => 'Caja', 'description' => 'lector roto', 'status' => IncidentStatus::Open,
            'priority' => IncidentPriority::High, 'requester_name' => 'Ana']);
        Incident::create(['title' => 'Lector', 'description' => 'sin detalle', 'status' => IncidentStatus::Open,
            'priority' => IncidentPriority::Low, 'requester_name' => 'Luis']);

        $this->get('/incidents?status=abierta&priority=alta&search=roto')
            ->assertOk()->assertInertia(fn ($page) => $page
            ->component('Incidents/Index')
            ->where('incidents.data.0.title', 'Caja')
            ->where('filters.status', 'abierta')
            ->where('filters.priority', 'alta')
            ->where('filters.search', 'roto')
            ->has('incidents.data', 1));
    }

    public function test_list_filters_individually_and_pagination_keeps_the_active_query(): void
    {
        for ($index = 1; $index <= 16; $index++) {
            Incident::create([
                'title' => "Caja {$index}", 'description' => 'Conexión inestable',
                'status' => IncidentStatus::Open, 'priority' => IncidentPriority::High,
                'requester_name' => 'Ana',
            ]);
        }
        Incident::create(['title' => 'Caja resuelta', 'description' => 'Conexión estable',
            'status' => IncidentStatus::Resolved, 'priority' => IncidentPriority::Low, 'requester_name' => 'Luis']);

        $this->get('/incidents?status=abierta')->assertInertia(fn ($page) => $page
            ->where('filters.status', 'abierta')->has('incidents.data', 15));
        $this->get('/incidents?priority=baja')->assertInertia(fn ($page) => $page
            ->where('filters.priority', 'baja')->has('incidents.data', 1));
        $this->get('/incidents?search=resuelta')->assertInertia(fn ($page) => $page
            ->where('filters.search', 'resuelta')->has('incidents.data', 1));

        $this->get('/incidents?status=abierta&priority=alta&search=Caja&page=2')
            ->assertInertia(fn ($page) => $page
                ->where('incidents.current_page', 2)
                ->where('incidents.links.0.url', url('/incidents?status=abierta&priority=alta&search=Caja&page=1')));
    }

    public function test_status_change_records_actor_and_rejects_invalid_or_repeated_transitions(): void
    {
        $incident = Incident::create(['title' => 'Caja', 'description' => 'Error', 'status' => IncidentStatus::Open,
            'priority' => IncidentPriority::High, 'requester_name' => 'Ana']);

        $this->patch(route('incidents.status.update', $incident), ['status' => 'en_revision'])->assertRedirect();
        $this->assertDatabaseHas('incident_logs', ['incident_id' => $incident->id, 'action' => 'status_changed',
            'old_value' => 'abierta', 'new_value' => 'en_revision', 'user_name' => 'Carlos Turmo']);
        $this->from('/incidents')->patch(route('incidents.status.update', $incident), ['status' => 'en_revision'])
            ->assertRedirect('/incidents')->assertSessionHasErrors('status');
        $this->assertDatabaseCount('incident_logs', 1);
        $this->assertSame(IncidentStatus::InReview, $incident->fresh()->status);
    }

    public function test_open_incident_cannot_be_resolved_directly_and_creates_no_log(): void
    {
        $incident = Incident::create(['title' => 'Caja', 'description' => 'Error', 'status' => IncidentStatus::Open,
            'priority' => IncidentPriority::High, 'requester_name' => 'Ana']);

        $this->from('/incidents')->patch(route('incidents.status.update', $incident), ['status' => 'resuelta'])
            ->assertRedirect('/incidents')->assertSessionHasErrors('status');

        $this->assertSame(IncidentStatus::Open, $incident->fresh()->status);
        $this->assertDatabaseCount('incident_logs', 0);
    }

    public function test_failed_log_write_rolls_back_status_change(): void
    {
        $incident = Incident::create(['title' => 'Caja', 'description' => 'Error', 'status' => IncidentStatus::Open,
            'priority' => IncidentPriority::High, 'requester_name' => 'Ana']);
        IncidentLog::creating(fn () => false);
        $this->withoutExceptionHandling();

        try {
            $this->patch(route('incidents.status.update', $incident), ['status' => 'en_revision']);
            $this->fail('Expected the failed log write to abort the transaction.');
        } catch (RuntimeException $exception) {
            $this->assertSame('No se pudo registrar el cambio de estado.', $exception->getMessage());
        }

        $this->assertSame(IncidentStatus::Open, $incident->fresh()->status);
        $this->assertDatabaseCount('incident_logs', 0);
    }

    public function test_comment_uses_configured_actor_and_detail_orders_history(): void
    {
        $incident = Incident::create(['title' => 'Caja', 'description' => 'Error', 'status' => IncidentStatus::Open,
            'priority' => IncidentPriority::High, 'requester_name' => 'Ana']);
        $this->post(route('incident-comments.store'), ['incident_id' => $incident->id, 'body' => 'Lo reviso',
            'author_name' => 'Cliente'])->assertRedirect();
        $this->assertDatabaseHas('incident_comments', ['incident_id' => $incident->id,
            'author_name' => 'Carlos Turmo', 'body' => 'Lo reviso']);

        $olderComment = $incident->comments()->create(['author_name' => 'Carlos Turmo', 'body' => 'Comentario anterior']);
        $olderComment->created_at = Carbon::parse('2026-10-01 10:00:00');
        $olderComment->save();
        $newerComment = $incident->comments()->create(['author_name' => 'Carlos Turmo', 'body' => 'Comentario posterior']);
        $newerComment->created_at = Carbon::parse('2026-10-02 10:00:00');
        $newerComment->save();

        $incident->logs()->create(['action' => 'status_changed', 'old_value' => 'abierta', 'new_value' => 'en_revision', 'user_name' => 'Carlos Turmo']);
        $incident->logs()->create(['action' => 'status_changed', 'old_value' => 'en_revision', 'new_value' => 'bloqueada', 'user_name' => 'Carlos Turmo']);
        $this->get(route('incidents.show', $incident).'?return='.urlencode('/incidents?status=abierta&page=2'))
            ->assertOk()->assertInertia(fn ($page) => $page
            ->component('Incidents/Show')
            ->where('incident.id', $incident->id)
            ->where('incident.title', 'Caja')
            ->where('incident.status', 'abierta')
            ->where('incident.priority', 'alta')
            ->where('logs.0.new_value', 'en_revision')
            ->where('logs.1.new_value', 'bloqueada')
            ->where('comments.0.body', 'Comentario anterior')
            ->where('comments.1.body', 'Comentario posterior')
            ->where('comments.2.body', 'Lo reviso')
            ->where('returnUrl', '/incidents?status=abierta&page=2'));
    }

    public function test_comment_validation_preserves_the_submitted_body_and_does_not_create_a_comment(): void
    {
        $incident = Incident::create(['title' => 'Caja', 'description' => 'Error', 'status' => IncidentStatus::Open,
            'priority' => IncidentPriority::High, 'requester_name' => 'Ana']);

        $this->from(route('incidents.show', $incident))->post(route('incident-comments.store'), [
            'incident_id' => $incident->id, 'body' => '',
        ])->assertRedirect(route('incidents.show', $incident))
            ->assertSessionHasErrors('body')->assertSessionHas('_old_input.body', '');

        $this->assertDatabaseCount('incident_comments', 0);
    }

    public function test_incident_detail_returns_not_found_for_unknown_incident(): void
    {
        $this->get('/incidents/999999')->assertNotFound();
    }
}
