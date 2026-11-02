<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreIncidentCommentRequest;
use App\Models\Incident;

class IncidentCommentController extends Controller
{
    public function store(StoreIncidentCommentRequest $request)
    {
        $data = $request->validated();
        $incident = Incident::findOrFail($data['incident_id']);
        $incident->comments()->create([
            'body' => $data['body'],
            'author_name' => config('incident.actor_name'),
        ]);

        return redirect()->route('incidents.show', $incident)->with('success', 'Comentario añadido.');
    }
}
