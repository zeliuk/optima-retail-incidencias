<?php

namespace App\Actions;

use App\Enums\IncidentStatus;
use App\Models\Incident;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class ChangeIncidentStatus
{
    public function handle(Incident $incident, IncidentStatus $target): Incident
    {
        return DB::transaction(function () use ($incident, $target) {
            $locked = Incident::query()->lockForUpdate()->findOrFail($incident->id);
            $previous = $locked->status;

            if (! $previous->canTransitionTo($target)) {
                throw ValidationException::withMessages([
                    'status' => 'La transición solicitada no está permitida.',
                ]);
            }

            $locked->status = $target;
            if (! $locked->save()) {
                throw new RuntimeException('No se pudo actualizar la incidencia.');
            }

            $log = $locked->logs()->make([
                'action' => 'status_changed',
                'old_value' => $previous->value,
                'new_value' => $target->value,
                'user_name' => config('incident.actor_name'),
            ]);
            if (! $log->save()) {
                throw new RuntimeException('No se pudo registrar el cambio de estado.');
            }

            return $locked->refresh();
        });
    }
}
