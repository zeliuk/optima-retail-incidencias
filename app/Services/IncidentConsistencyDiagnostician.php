<?php

namespace App\Services;

use App\Enums\IncidentStatus;
use App\Models\Incident;
use App\Models\IncidentLog;
use Illuminate\Support\Collection;

class IncidentConsistencyDiagnostician
{
    /** @return Collection<int, array{type: string, incident_id: int, title: string, log_ids: list<int>, reason: string, evidence: array<string, mixed>, proposed_action: string, requires_manual_review: bool}> */
    public function diagnose(): Collection
    {
        $alerts = collect();

        Incident::query()->orderBy('id')->with(['logs' => fn ($query) => $query
            ->where('action', 'status_changed')
            ->orderBy('created_at')->orderBy('id')])->each(function (Incident $incident) use ($alerts): void {
                /** @var Collection<int, IncidentLog> $logs */
                $logs = $incident->logs;

                if ($incident->status === IncidentStatus::Resolved && ! $logs->contains('new_value', IncidentStatus::Resolved->value)) {
                    $alerts->push($this->alert('resolved_without_resolution_log', $incident, [],
                        'No existe un log status_changed con new_value=resuelta; la fecha y el actor de resolución son desconocidos.',
                        ['current_status' => $incident->status->value, 'resolution_logs_found' => 0],
                        'Revisar manualmente la fuente histórica; no crear un log de resolución con datos supuestos.'));
                }

                $lastLog = $logs->last();
                if ($lastLog && $lastLog->new_value !== $incident->status->value) {
                    $alerts->push($this->alert('current_status_differs_from_last_log', $incident, [$lastLog->id],
                        "El estado actual es {$incident->status->value}, pero el último log indica {$lastLog->new_value}.",
                        ['current_status' => $incident->status->value, 'last_log_id' => $lastLog->id,
                            'last_log_created_at' => $lastLog->created_at?->toISOString(),
                            'last_log_old_value' => $lastLog->old_value, 'last_log_new_value' => $lastLog->new_value],
                        'Contrastar con la fuente operativa y determinar manualmente qué estado representa la realidad.'));
                }

                $this->detectInvalidOrDiscontinuousLogs($incident, $logs, $alerts);
                $this->detectExactDuplicates($incident, $logs, $alerts);
            });

        return $alerts;
    }

    private function detectInvalidOrDiscontinuousLogs(Incident $incident, Collection $logs, Collection $alerts): void
    {
        $previousNewValue = null;
        foreach ($logs as $log) {
            $knownStatuses = array_column(IncidentStatus::cases(), 'value');
            $invalid = ! in_array($log->old_value, $knownStatuses, true)
                || ! in_array($log->new_value, $knownStatuses, true)
                || $log->old_value === $log->new_value;
            $discontinuous = $previousNewValue !== null && $log->old_value !== $previousNewValue;

            if ($invalid || $discontinuous) {
                $reason = $invalid
                    ? 'El log contiene estados desconocidos o no registra un cambio efectivo.'
                    : "La secuencia no encadena: el log anterior termina en {$previousNewValue} y este comienza en {$log->old_value}.";
                $alerts->push($this->alert('incoherent_status_log', $incident, [$log->id], $reason,
                    ['log_id' => $log->id, 'created_at' => $log->created_at?->toISOString(),
                        'old_value' => $log->old_value, 'new_value' => $log->new_value,
                        'previous_new_value' => $previousNewValue],
                    'Verificar manualmente la secuencia y su fuente; no reescribir el historial.'));
            }

            $previousNewValue = $log->new_value;
        }
    }

    private function detectExactDuplicates(Incident $incident, Collection $logs, Collection $alerts): void
    {
        $groups = $logs->groupBy(fn (IncidentLog $log) => implode('|', [
            $log->old_value, $log->new_value, $log->user_name, $log->created_at?->toISOString(),
        ]));

        foreach ($groups->filter(fn (Collection $group) => $group->count() > 1) as $group) {
            $ids = $group->pluck('id')->map(fn ($id) => (int) $id)->all();
            $alerts->push($this->alert('duplicate_status_logs', $incident, $ids,
                'Los logs comparten acción, valores, actor y fecha; esos campos no prueban que uno pueda eliminarse.',
                ['matching_fields' => ['action' => 'status_changed', 'old_value' => $group->first()->old_value,
                    'new_value' => $group->first()->new_value, 'user_name' => $group->first()->user_name,
                    'created_at' => $group->first()->created_at?->toISOString()],
                    'metadata_values' => $group->pluck('metadata')->all()],
                'Comparar con una fuente externa de auditoría; conservar todos los logs hasta confirmar su origen.'));
        }
    }

    /** @param list<int> $logIds */
    private function alert(string $type, Incident $incident, array $logIds, string $reason,
        array $evidence = [], string $proposedAction = 'Revisión manual necesaria; no se modifican datos.'): array
    {
        return ['type' => $type, 'incident_id' => $incident->id, 'title' => $incident->title,
            'log_ids' => $logIds, 'reason' => $reason, 'evidence' => $evidence,
            'proposed_action' => $proposedAction, 'requires_manual_review' => true];
    }
}
