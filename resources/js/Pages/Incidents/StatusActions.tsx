import { router } from '@inertiajs/react';
import { useState } from 'react';

export type StatusAction = {
    value: string;
    label: string;
    confirmation: string | null;
};

export default function StatusActions({ incidentId, actions, error }: {
    incidentId: number;
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
        <section aria-labelledby="status-actions-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 id="status-actions-title" className="text-lg font-semibold">Cambiar estado</h2>
            {actions.length === 0 ? (
                <p className="mt-2 text-sm text-slate-600">Esta incidencia está resuelta y no admite más cambios de estado.</p>
            ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                    {actions.map((action) => <button
                        key={action.value}
                        type="button"
                        disabled={processing}
                        onClick={() => changeStatus(action)}
                        className="rounded-lg border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'Actualizando…' : `Pasar a ${action.label}`}
                    </button>)}
                </div>
            )}
            {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
        </section>
    );
}
