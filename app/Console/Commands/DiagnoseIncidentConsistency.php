<?php

namespace App\Console\Commands;

use App\Services\IncidentConsistencyDiagnostician;
use Illuminate\Console\Command;

class DiagnoseIncidentConsistency extends Command
{
    protected $signature = 'incidents:diagnose-consistency';

    protected $description = 'Diagnostica inconsistencias entre incidencias y logs sin modificar datos';

    public function handle(IncidentConsistencyDiagnostician $diagnostician): int
    {
        $alerts = $diagnostician->diagnose();

        if ($alerts->isEmpty()) {
            $this->info('No se detectaron inconsistencias.');
        } else {
            foreach ($alerts as $alert) {
                $logs = $alert['log_ids'] === [] ? 'ninguno' : implode(', ', $alert['log_ids']);
                $evidence = json_encode($alert['evidence'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                $this->warn("[{$alert['type']}] Incidencia #{$alert['incident_id']} ({$alert['title']}); logs: {$logs}. {$alert['reason']}");
                $this->line("  Evidencia: {$evidence}");
                $this->line("  Acción propuesta: {$alert['proposed_action']}");
                $this->line('  Revisión manual: sí. No se modifican datos.');
            }
        }

        $this->line('Resumen: '.$alerts->count().' alerta(s); 0 correcciones automáticas.');

        return self::SUCCESS;
    }
}
