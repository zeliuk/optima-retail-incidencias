import { router } from '@inertiajs/react';
import { useState } from 'react';
import { StatusBadge } from './components';

export type StatusAction = {
    value: string;
    label: string;
    confirmation: string | null;
};

const statusLabels: Record<string, string> = {
    abierta: 'Abierta',
    en_revision: 'En revisión',
    bloqueada: 'Bloqueada',
    resuelta: 'Resuelta',
};

const actionLabels: Record<string, string> = {
    en_revision: 'Revisar',
    bloqueada: 'Bloquear',
    resuelta: 'Resolver',
};

export default function StatusActions({ incidentId, status, actions, error }: {
    incidentId: number;
    status: string;
    actions: StatusAction[];
    error?: string;
}) {
    const [processing, setProcessing] = useState(false);

    function changeStatus(action: StatusAction) {
        if (processing || (action.confirmation && !window.confirm(action.confirmation))) return;

        router.patch(`/incidents/${incidentId}/status`, { status: action.value }, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <section aria-label="Acciones de estado de la incidencia" className="brand-surface p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold text-slate-900">Estado actual:</span>
                    <StatusBadge status={status} />
                </div>
            {actions.length === 0 ? (
                <p className="text-sm text-slate-600">Esta incidencia está resuelta y no admite más cambios de estado.</p>
            ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    {actions.map((action) => <button
                        key={action.value}
                        type="button"
                        disabled={processing}
                        onClick={() => changeStatus(action)}
                        aria-label={`${actionLabels[action.value] ?? action.label} incidencia`}
                        className={`brand-button min-h-11 w-full justify-center px-4 py-2 sm:w-auto ${action.value === 'resuelta' ? '' : 'brand-button-secondary'}`}
                    >
                        {processing ? 'Actualizando…' : actionLabels[action.value] ?? action.label}
                    </button>)}
                </div>
            )}
            </div>
            {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
        </section>
    );
}
