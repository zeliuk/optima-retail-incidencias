<?php

namespace App\Http\Controllers;

use App\Actions\ChangeIncidentStatus;
use App\Enums\IncidentPriority;
use App\Enums\IncidentStatus;
use App\Http\Requests\StoreIncidentRequest;
use App\Http\Requests\UpdateIncidentStatusRequest;
use App\Models\Incident;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class IncidentController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'status' => ['sometimes', 'nullable', Rule::enum(IncidentStatus::class)],
            'priority' => ['sometimes', 'nullable', Rule::enum(IncidentPriority::class)],
            'search' => ['sometimes', 'nullable', 'string', 'max:180'],
        ]);

        $incidents = Incident::query()
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['priority'] ?? null, fn ($query, $priority) => $query->where('priority', $priority))
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(fn ($query) => $query->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%"));
            })
            ->orderByDesc('created_at')->orderByDesc('id')->paginate(15)->withQueryString();

        return response()->json($incidents);
    }

    public function store(StoreIncidentRequest $request)
    {
        $incident = Incident::create($request->validated() + ['status' => IncidentStatus::Open]);

        return redirect()->route('incidents.show', $incident)->with('success', 'Incidencia creada.');
    }

    public function show(Incident $incident)
    {
        $incident->load([
            'logs' => fn ($query) => $query->orderBy('created_at')->orderBy('id'),
            'comments' => fn ($query) => $query->orderBy('created_at')->orderBy('id'),
        ]);

        // Inertia is introduced in the next block; keep this route's payload ready for that page.
        return response()->json($incident);
    }

    public function updateStatus(UpdateIncidentStatusRequest $request, Incident $incident, ChangeIncidentStatus $changeStatus)
    {
        $changeStatus->handle($incident, IncidentStatus::from($request->validated('status')));

        return back()->with('success', 'Estado actualizado.');
    }
}
