import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { PriorityBadge, StatusBadge } from './components';
import StatusActions, { type StatusAction } from './StatusActions';

type Incident = {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    requester_name: string;
    assigned_to: string | null;
    created_at: string;
    updated_at: string;
};

type Log = {
    id: number;
    action: string;
    old_value: string | null;
    new_value: string | null;
    user_name: string;
    created_at: string;
};

type Comment = {
    id: number;
    author_name: string;
    body: string;
    created_at: string;
};

type Props = {
    incident: Incident;
    logs: Log[];
    comments: Comment[];
    success: string | null;
    returnUrl: string;
    statusActions: StatusAction[];
    errors?: { status?: string };
};

const statusLabels: Record<string, string> = {
    abierta: 'Abierta', en_revision: 'En revisión', bloqueada: 'Bloqueada', resuelta: 'Resuelta',
};

function formatDate(value: string) {
    return new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'medium', timeStyle: 'short',
    }).format(new Date(value));
}

export default function Show({ incident, logs, comments, success, returnUrl, statusActions, errors }: Props) {
    const form = useForm({ incident_id: incident.id, body: '' });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/incident-comments', {
            preserveScroll: true,
            onSuccess: () => form.reset('body'),
        });
    }

    return (
        <main className="min-h-screen bg-white text-slate-900">
            <header className="bg-gradient-to-b from-white via-white/95 to-transparent pt-2 pb-3 md:sticky md:top-0 md:z-30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex min-h-[67px] items-center rounded-full bg-[#f6f6f6] px-5 py-2.5 sm:px-[35px]">
                        <Link href="/incidents" aria-label="Ir al listado de incidencias" className="inline-flex rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary">
                            <img src="/images/optima-retail-logo.svg" alt="" className="h-auto w-[250px] max-w-full shrink-0" />
                        </Link>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
                <Link href={returnUrl} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-secondary">← Volver al listado</Link>

                {success && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{success}</p>}

                <section className="brand-surface p-5 sm:p-7">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-slate-500">INC-{String(incident.id).padStart(4, '0')}</span>
                        <StatusBadge status={incident.status} />
                        <PriorityBadge priority={incident.priority} />
                    </div>
                    <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{incident.title}</h1>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{incident.description}</p>
                    <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <div><dt className="text-slate-500">Solicitante</dt><dd className="mt-1 font-medium">{incident.requester_name}</dd></div>
                        <div><dt className="text-slate-500">Responsable</dt><dd className="mt-1 font-medium">{incident.assigned_to || 'Sin asignar'}</dd></div>
                        <div><dt className="text-slate-500">Creada</dt><dd className="mt-1 font-medium"><time dateTime={incident.created_at}>{formatDate(incident.created_at)}</time></dd></div>
                        <div><dt className="text-slate-500">Última actualización</dt><dd className="mt-1 font-medium"><time dateTime={incident.updated_at}>{formatDate(incident.updated_at)}</time></dd></div>
                    </dl>
                </section>

                <StatusActions incidentId={incident.id} status={incident.status} actions={statusActions} error={errors?.status} />

                <div className="grid items-start gap-6 lg:grid-cols-2">
                    <section aria-labelledby="history-title" className="brand-surface p-5 sm:p-6">
                        <h2 id="history-title" className="text-lg font-semibold">Historial de cambios</h2>
                        {logs.length === 0 ? <p className="mt-4 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Todavía no hay cambios registrados.</p> : (
                            <ol className="mt-5 space-y-5">
                                {logs.map((log) => (
                                    <li key={log.id} className="relative border-l border-slate-200 pl-4">
                                        <p className="font-medium text-slate-800">{log.action === 'status_changed' ? 'Cambio de estado' : log.action}</p>
                                        {(log.old_value !== null || log.new_value !== null) && <p className="mt-1 text-sm text-slate-600">{log.old_value ?? '—'} <span aria-hidden="true">→</span> {log.new_value ?? '—'}</p>}
                                        <p className="mt-1 text-xs text-slate-500">{log.user_name} · <time dateTime={log.created_at}>{formatDate(log.created_at)}</time></p>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </section>

                    <section aria-labelledby="comments-title" className="brand-surface p-5 sm:p-6">
                        <h2 id="comments-title" className="text-lg font-semibold">Comentarios operativos</h2>
                        {comments.length === 0 ? <p className="mt-4 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Todavía no hay comentarios.</p> : (
                            <ol className="mt-5 space-y-4">
                                {comments.map((comment) => <li key={comment.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.body}</p>
                                    <p className="mt-3 text-xs text-slate-500">{comment.author_name} · <time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time></p>
                                </li>)}
                            </ol>
                        )}

                        <form onSubmit={submit} className="mt-6 border-t border-slate-100 pt-5">
                            <label htmlFor="comment-body" className="block text-base font-normal leading-[1.4] text-black">Añadir comentario</label>
                            <textarea id="comment-body" value={form.data.body} onChange={(event) => form.setData('body', event.target.value)} rows={4} aria-invalid={Boolean(form.errors.body)} aria-describedby={form.errors.body ? 'comment-error' : undefined} className="brand-field mt-2 min-h-28 resize-y" />
                            {form.errors.body && <p id="comment-error" role="alert" className="mt-2 text-sm text-rose-700">{form.errors.body}</p>}
                            {form.errors.incident_id && <p role="alert" className="mt-2 text-sm text-rose-700">No se pudo identificar la incidencia.</p>}
                            <button type="submit" disabled={form.processing} className="brand-button mt-3">{form.processing ? 'Enviando…' : 'Añadir comentario'}</button>
                        </form>
                    </section>
                </div>
            </div>
            <footer className="mt-7 w-full bg-gradient-to-r from-brand-secondary to-brand-primary px-3 py-3 text-center text-xs text-white">
                Panel operativo · Entorno de demostración
            </footer>
        </main>
    );
}
